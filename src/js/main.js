// Global variables
var $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document),
    canvas, ctx, player;

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
        console.info('--GAME STARTED--');
        player = new Player();
        canvas.removeEventListener('click',init, false );
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas from the text
        addGUI();
    }
}

function addGUI() {
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Health: 100/100", 10, canvas.height - 50);
    ctx.fillText("Ammo: " + player.curHealth + "/" + player.maxHealth, 10, canvas.height - 25);
}

var Player = function() {
    this.maxHealth = 100;
    this.curHealth = 100;
}