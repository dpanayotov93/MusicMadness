// Global variables
var $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document),
    keys= {},
    canvas, ctx, player, level;

window.onload = function() {
    // Setting global variables
    canvas = $('#mm-canvas');
    ctx = canvas.getContext('2d');
    
    // Base setup
    baseConfig();
    
    // preload();
    showMainMenu();
    // ON START BUTTON CLICKED
    // init():
}

function baseConfig() {
    // Resize to full width/height
    resizeCanvas();
    
    // Listener for resize events and apply the rezising when triggered
    window.addEventListener('resize', resizeCanvas, false);
    // Request pointerlock when clicking on the canvas
    canvas.addEventListener('click', requestPointerLock, false);
}

function isPointerLocked() {
    if(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
        return true;
    } else {
        return false;
    }
}

function requestPointerLock() {
    if(!isPointerLocked()) {
        canvas.requestPointerLock = canvas.requestPointerLock
            || canvas.mozRequestPointerLock
            || canvas.webkitRequestPointerLock;
        // Ask the browser to lock the pointer
        canvas.requestPointerLock();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function showMainMenu() {
    console.info('--MAIN MENU--');
    // Fill with blackish background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Add main menu text
    ctx.fillStyle = '#fff';
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click to start", canvas.width/2, canvas.height/2);
    canvas.style.display = 'block'; // Make it visible
    
    canvas.addEventListener('click', init, false);
}

function init() {
    if(!isPointerLocked()) {
        console.info('--GAME STARTING--');
        canvas.removeEventListener('click',init, false );
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text
        
        ctx.fillText("Loading...", canvas.width/2, canvas.height/2);
        
        // Setup Player
        player = new Player(); 
        player.sprite.src = player.spriteURL.right; // Add sprite
        player.sprite.onload = function() {
            level = new Level(); // Create level
            level.init();
        };
    }
}

function updateGUI() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Health: " + player.curHealth + "/" + player.maxHealth, canvas.width / 2, 25);
    ctx.fillText("Ammo: " + player.curAmmo + "/" + player.maxAmmo, canvas.width / 2, 50);
}

function animate() {
    requestAnimationFrame(animate);
    // console.log('--UPDATED--');
    player.checkControls();
    if(player.position.y === player.spawnPoint.y && !keys[87]) {
        player.isJumping = false;
    }
}

function onKeyDown(e) {
    var key = e.which;
    // console.log(key);
    keys[key] = true;
}

function onKeyUp(e) {
    var key = e.which;
    keys[key] = false;
}

var Player = function() {
    this.width = 200;
    this.height = 250;
    this.spawnPoint = {
        x: 50,
        y: canvas.height - 500
    }
    this.maxHealth = 100;
    this.curHealth = 100;
    this.maxAmmo = 100;
    this.curAmmo = 100;
    this.speed = 10;
    this.gravity = 250;
    this.isJumping = false;
    this.jumpHeight = 300;
    this.spriteURL = {
        right: 'assets/player-right.png',
        left: 'assets/player-left.png'
        
    }
    this.sprite = new Image();
    this.position = {
        x: 0,
        y: 0
    }

    this.draw = function(position) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text
        ctx.drawImage(this.sprite, position.x, position.y, this.width, this.height);
        this.position.x = position.x;
        this.position.y = position.y;
        
        level.floor.draw(); // Draw the floor
        updateGUI(); // Draw the GUI                   
    }
    
    this.checkControls = function() {
        if(keys[65]) this.moveLeft(); // A - Move Left
        if(keys[68]) this.moveRight(); // D - Move Right
        if(!this.isJumping) {
            if(keys[87]) this.jump(); // W - Jump
        }
    }
    
    this.moveLeft = function() {
        console.log('moving left');
        var movePosition = {
            x: this.position.x - this.speed ,
            y: this.position.y
        }
        if(movePosition.x < -20*this.speed) movePosition.x = canvas.width - this.speed;
        this.draw(movePosition);
    }
    
    this.moveRight = function() {
        console.log('moving right');
        var movePosition = {
            x: this.position.x + this.speed ,
            y: this.position.y
        }
        if(movePosition.x > canvas.width) movePosition.x = this.speed;
        this.draw(movePosition);
    }
    
    this.jump = function() {
        if(!this.isJumping) {
            this.isJumping = true;
            
            var movePosition = {
                x: this.position.x,
                y: this.position.y - this.jumpHeight
            }
            this.draw(movePosition);
            
            setTimeout(function() {
                var movePosition = {
                    x: player.position.x,
                    y: player.spawnPoint.y
                }
                player.draw(movePosition);
            }, 100)
        }
    }
}

var Level = function() {
    this.init = function() {
        console.info('--DRAWING LEVEL--');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text

        // Get the player spawn position
        var drawPosition = {
            x: player.spawnPoint.x,
            y: player.spawnPoint.y
        };
        player.draw(drawPosition); // Draw the player
        
        this.floor.draw(); // Draw the floor
        updateGUI(); // Draw the GUI
        
        // Add keypress event listeners
        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('keyup', onKeyUp, false);
        
        animate(); // Start the update cycle
    };
    
    this.floor = {
        width: canvas.width,
        height: 250,
        segmentWidth: canvas.width / 8,
        segmentsN: canvas.width / 240, // TODO: Change num to segmentWidth prop
        startX: 0,
        startY: canvas.height - 250, // TODO: Change num to height prop
        color: '#333333',
        draw: function() { // TODO: Pass bar levels array from detected audio beats and adjust the height of the bars according to them
            ctx.fillStyle = level.floor.color; // Set the base floor color
            ctx.fillRect(level.floor.startX, level.floor.startY, level.floor.width, level.floor.height); // Set the size and position of the floor
            for(var i = 0; i < level.floor.segmentsN; i += 1) {
                ctx.fillStyle = testColors[i]; // Set the current bar color
                ctx.fillRect(level.floor.startX + level.floor.segmentWidth*i, level.floor.startY + 10*i, level.floor.segmentWidth, level.floor.height + 10*i); // Set the size and position of the current bar
            }
        }
    };

}


var testColors = ['cyan', 'blue', 'lime', 'green', 'yellow', 'orange', 'red', 'magenta'];