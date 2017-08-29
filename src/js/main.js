// Global variables
var $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document),
    canvas, ctx;

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
    
    // Basic event listeners
    window.addEventListener('resize', resizeCanvas, false);
    
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function showMainMenu() {
    console.info('--MAIN MENU--');
}