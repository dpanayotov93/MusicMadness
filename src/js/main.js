// Global variables
var $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document),
    keys= {},
    canvas, ctx, player, level,
    time;

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
    var now = new Date().getTime(),
        dt = now - (time || now);   
        
    time = now;      
    player.checkControls(dt);
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
    this.jumpHeight = 20;
    this.jumpDist = 20;
    this.segment = 0;
    this.spriteURL = {
        right: 'assets/player-right.png',
        left: 'assets/player-left.png'
        
    }
    this.sprite = new Image();
    this.position = {
        x: 0,
        y: 0
    }
    this.dir = 0; // 0 = Right, 1 = Left

    this.draw = function(position) {
        var curSegment, segmentY;
        
        if(position && position.x) player.position.x = position.x;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text
        
        if(player.dir === 0) {
            curSegment = Math.floor((player.position.x + 80) / level.floor.segmentWidth); // Fix that 80
        } else if(player.dir === 1) {
            curSegment = Math.floor((player.position.x - 80) / level.floor.segmentWidth); // Fix that 80
        }
        
        player.segment = curSegment;

        if(position && position.y)  {
            player.position.y = position.y;
        } else {
            segmentY = canvas.height - level.floor.height + 10 * player.segment - player.height + 7.5; // 7.5 - clipping fix
            player.position.y = segmentY;            
        }
        
        // console.log(this.position.x, this.position.y);
        
        ctx.drawImage(player.sprite, player.position.x, player.position.y, player.width, player.height);
        
        level.floor.draw(); // Draw the floor
        updateGUI(); // Draw the GUI          
    }
    
    this.checkControls = function(dt) {
        if(!player.isJumping) {
            if(keys[65]) this.moveLeft(); // A - Move Left
            if(keys[68]) this.moveRight(); // D - Move Right
            if(keys[87]) this.jump(dt); // W - Jump
        }
        if(keys[32]) this.shoot(dt); // Space - Shoot
    }
    
    this.moveLeft = function() {
        var segmentY = canvas.height - level.floor.height + 10 * player.segment - player.height + 7.5; // 7.5 - clipping fix
        var movePosition = {
            x: this.position.x - this.speed
        }
        if(movePosition.x < -20*this.speed) movePosition.x = canvas.width - this.speed;
        this.draw(movePosition);
    }
    
    this.moveRight = function() {
        var segmentY = canvas.height - level.floor.height + 10 * player.segment - player.height + 7.5; // 7.5 - clipping fix
        var movePosition = {
            x: this.position.x + this.speed
        }
        if(movePosition.x > canvas.width) movePosition.x = this.speed;
        this.draw(movePosition);
    }
    
    this.jump = function(dt) {
        var jumpIteration = dt * 5,
            deltaX;
        if(!player.isJumping) {
            player.isJumping = true;

            if(keys[65]) { // Left Jump
                deltaX = player.speed * player.jumpDist;
            } else if(keys[68]) { // Right Jump
                deltaX = -player.speed * player.jumpDist;
            } else { // Normal Jump
                deltaX = 0;
            }
            
            var jumpAnimation = new Promise(function(resolve, reject) {
                for(var i = 0; i < jumpIteration; i += 1) {
                    (function(i){
                        setTimeout(function() {
                            var movePosition = {
                                x: player.position.x - deltaX / jumpIteration,
                                y: player.position.y - (player.jumpHeight * dt / jumpIteration)
                            };
                            player.draw(movePosition);
                            if(i === jumpIteration - 1) {
                                resolve();
                            }
                        }, dt);
                    }(i));
                }
            });
            
            jumpAnimation.then(function() {
                var gravity = new Promise(function(resolve, reject) {
                    var segmentY = canvas.height - level.floor.height + 10 * player.segment - player.height, // 7.5 - clipping fix
                        deltaY = (segmentY - player.position.y);
                    for(var i = 0; i < jumpIteration; i += 1) {
                        (function(i){                    
                            setTimeout(function() {
                                var movePosition = {
                                        x: player.position.x - deltaX / jumpIteration,
                                        y: player.position.y + deltaY / jumpIteration
                                    };
                                
                                player.draw(movePosition);
                                if(i === jumpIteration - 1) {
                                    resolve();
                                }
                            }, dt)
                        }(i));
                    }
                });
                
                gravity.then(function() {
                    setTimeout(function() {
                        player.isJumping = false;
                    }, dt);
                });
            });
         }
    }
    
    this.shoot = function(dt) {
        if(player.curAmmo > 0) {
            player.curAmmo -= 1;
            var spawn = {
                x: this.position.x + this.width,
                y: this.position.y + this.height / 2
            }
            ctx.strokeStyle = testColors[this.segment];
            ctx.beginPath();
            ctx.moveTo(spawn.x, spawn.y);
            ctx.lineTo(spawn.x + 25, spawn.y + 25);
            ctx.lineTo(spawn.x + 50, spawn.y);
            ctx.lineTo(spawn.x + 75, spawn.y);
            ctx.lineTo(spawn.x + 100, spawn.y - 50);
            ctx.lineTo(spawn.x + 125, spawn.y + 50);
            ctx.lineTo(spawn.x + 150, spawn.y);
            ctx.lineTo(spawn.x + 175, spawn.y);
            ctx.lineTo(spawn.x + 200, spawn.y - 25);
            ctx.lineTo(spawn.x + 225, spawn.y);
            ctx.lineTo(spawn.x + 300, spawn.y);
            ctx.stroke();
            
            setTimeout(function() {
                if(!player.isJumping) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text
                    ctx.drawImage(player.sprite, player.position.x, player.position.y, player.width, player.height);
                    level.floor.draw(); // Draw the floor
                    updateGUI(); // Draw the GUI    
                }
            }, dt);
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
        
        requestAnimationFrame(animate); // Start the update cycle
    };
    
    this.floor = {
        width: canvas.width,
        height: 250,
        segmentWidth: canvas.width / 8, // TODO: Change the constant based on the segmentsN
        segmentsN: 8, // TODO: Get from segmentWidth instead a constant
        startX: 0,
        startY: canvas.height - 250, // TODO: Change num to height prop
        color: '#333333',
        draw: function() { // TODO: Pass bar levels array from detected audio beats and adjust the height of the bars according to them
            ctx.fillStyle = level.floor.color; // Set the base floor color
            // ctx.fillRect(level.floor.startX, level.floor.startY, level.floor.width, level.floor.height); // Set the size and position of the floor
            for(var i = 0; i < level.floor.segmentsN; i += 1) {
                ctx.fillStyle = testColors[i]; // Set the current bar color
                ctx.fillRect(level.floor.startX + level.floor.segmentWidth*i, level.floor.startY + 10*i, level.floor.segmentWidth, level.floor.height + 10*i); // Set the size and position of the current bar
            }
        }
    };

}


var testColors = ['cyan', 'blue', 'lime', 'green', 'yellow', 'orange', 'red', 'magenta'];