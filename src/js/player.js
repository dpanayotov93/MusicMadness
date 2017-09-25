function createPlayer() {
    console.info('Creating player');
    player = {};
    player.isJumping = false;
    player.grounded = false;
    player.speed = 20;
    player.fuel = 100;
    player.color = {r: 255, g: 255, b: 255, a: 1};
    player.blurNormal = {x: 5, y: 5, q: 10};
    player.bar = 0;
    player.level = 0;
    player.keys = {};
    player.gui = {
        container: document.querySelector('#gui'),
        health: document.querySelector('#gui #health-player'),
        fuel: document.querySelector('#gui #fuel-player')
    };
    player.mouse = {
        x: 0,
        y: 0
    }
    
    player.model = new createjs.Shape();
    player.model.graphics.beginFill('#fff').drawRect(0, 0, barW / 2, barW / 2); 
    player.model.setBounds(0, 0, barW / 2, barW / 2);
    
    player.move = function(dir) {
        var value = this.model._bounds.x;
        dir === 'L' ? value -= this.speed : value += this.speed;
    
        if(value >= 0 && value <= canvas.width - this.model._bounds.width + 13.5) { //TODO: Fix the retarded constant
            createjs.Tween.get(this.model).to({x: value}, 25, createjs.Ease.bounceOut(25));
        }
    };
    
    player.jump = function() {
        var value = this.model._bounds.y - this.speed,
            blur = {x: 15, y: 15, q: 10};
        
        this.isJumping = true; // Set to jumping state
        
        player.dye({r: 255, g: 255, b: 255, a: 1});      
        
        player.blur(blur);
        
        createjs.Tween.get(this.model).to({y: value}, 25, createjs.Ease.bounceOut(25)); // Move upwards at movement speed rate
        this.fuel -= this.speed / 4; // Burn fuel at a 4th of the movement speed rate
        if(this.fuel < 0) this.fuel = 0; 
        player.gui.fuel.style.width = this.fuel + '%';
    };
    
    player.shoot = function() {
        var bullet = new Bullet();
        bullet.shoot();
    }   
    
    player.blur = function(blur) {
        var blurFilter = new createjs.BlurFilter(blur.x, blur.y, blur.q),
            bounds;
            
        player.model.filters = [blurFilter];
        bounds = blurFilter.getBounds();
        player.model.cache(-50 + bounds.x, -50 + bounds.y, 100 + bounds.width, 100 + bounds.height);             
    }
    
    player.dye = function(color) {
        var colorFill = createjs.Graphics.getRGB( 
                parseInt(color.r), 
                parseInt(color.g), 
                parseInt(color.b), 
                parseInt(color.a)
            ),
            width = this.model._bounds.width,
            height = this.model._bounds.height;
    
        this.model.graphics.beginFill(colorFill).drawRect(0, 0, width, height);
    };
    
    player.assignColor = function() {
        var max = colors.length - 1,
            colorID = Math.floor(Math.random() * max - 0),
            color = colors[colorID],
            rgb = color.substring(4, color.length-1)
             .replace(/ /g, '')
             .split(','),
            rgbObj = {r: parseInt(rgb[0]), g: parseInt(rgb[1]), b: parseInt(rgb[2]), a: 1};
        
        this.color = rgbObj;
    };
    
    player.assignColor();
    
    window.addEventListener('keyup', keyup);
    window.addEventListener('keydown', keydown);
    window.addEventListener('mousemove', mousemove);
    
    var mouseHold;
    document.querySelector('#move-left-player').addEventListener('mousedown', function() {
        mouseHold = setInterval(function() {
            player.move('L');    
        }, 30);
    });
    document.querySelector('#move-left-player').addEventListener('mouseup', function() {
        clearInterval(mouseHold);
    });    
    document.querySelector('#move-right-player').addEventListener('mousedown', function() {
        mouseHold = setInterval(function() {
            player.move('R');    
        }, 30);
    });
    document.querySelector('#move-right-player').addEventListener('mouseup', function() {
        clearInterval(mouseHold);
    }); 
    document.querySelector('#jump-player').addEventListener('mousedown', function() {
        mouseHold = setInterval(function() {
            if(player.fuel > 0) {
                isHoldingJump = true;
                player.jump();
            } else {
                player.isJumping = false;
            }
        }, 30);
    });
    document.querySelector('#jump-player').addEventListener('mouseup', function() {
        isHoldingJump = false;
        clearInterval(mouseHold);
    });  
}

function updatePlayer() {
    if(!isGameStarted) {
        stage.removeChild(TitleView);
        stage.addChild(barsCnt);
        stage.addChild(player.model);
        stage.removeChild(loading);
        player.gui.container.style.display = 'block';        
        isGameStarted = true;
    }
    if(player) { // Check if the player has been instantiated
        player.model.setBounds(player.model.x, player.model.y, barW / 2, barW / 2); // Set the bounding box
        player.grounded = intersects(player.model._bounds, barsArr[player.bar]._bounds); // Check for collision with the ground
        
        // Get the bar that the player's on top of
        player.bar = parseInt(player.model.x / barW);
        
        // Check if no longer jumping
        if(!player.keys[32] && !isHoldingJump) player.isJumping = false;

        // Party time!
        if(!player.isJumping) {
            var speedControl = createjs.Ticker.getTicks() % 256;
            // Revert to original color if not jumping
            player.dye(player.color);
            player.blur(player.blurNormal);
            
            if(speedControl === 0) player.assignColor();
            
            if(player.fuel >= 0 && player.fuel < 100) {
                player.fuel += player.speed / 8;
                player.gui.fuel.style.width = player.fuel + '%';
            }
            
            if(player.grounded) {  // If touching the ground make the player BOUNCE WITH THE BEA-EA-EA-EATTTT ~~~~O_O~~~~
                var pushDelta = barsArr[player.bar]._bounds.y - player.model._bounds.y  - player.model._bounds.height;
                applyGravity(player, pushDelta);                
            } else { // Apply gravity to the player if he's not jumping and not touching the ground
                applyGravity(player);
            }
        }
        
        // console.log('FUEL:', player.fuel);
        
        // Movement
        if(player.keys[65]) player.move('L'); // [A] - Left
        if(player.keys[68]) player.move('R'); // [D] - Right
        if(player.fuel > 0) {
            if(player.keys[32]) player.jump(); // [SPACE] - Jump
        } else {
            player.isJumping = false;
        }
    }
}

// Make it RAVE ~~~O_O~~~~ with physics (ha, right!)
function applyGravity(target, force) {
    var value = force || gravity;
    if(force) {
        var delta = (Math.abs(force) / 50) * 2;
        value < -50 ? value *= delta : value = force;
    }
    
    value = target.model.y + value;
    createjs.Tween.get(target.model).to({y: value}, 25, createjs.Ease.bounceOut(25));
}

// Longest collision check ever
function intersects(a, b) {
    if ( a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || (a.y + a.height + 10) <= b.y ) return false; //TODO: Fix the retarded constant
    return true;
}

function keydown(e) {
    // console.log(e.keyCode);
    player.keys[e.keyCode] = true;
}

function keyup(e) {
    player.keys[e.keyCode] = false;
}

function mousemove(e) {
    var canvasBBox = canvas.getBoundingClientRect();
    player.mouse.x = e.clientX - canvasBBox.left;
    player.mouse.y = e.clientY - canvasBBox.top;
}