var canvas, stage, // The canvas and stage objects
    timeline, // Used for animations
    // [GRAPHICS]
    TitleView = new createjs.Container(), // The graphics container for the title screen
    background, //The background graphic
    startBtn = {}, //The Start button in the main menu
    creditsBtn = {}, //The credits button in the main menu
    credits = {}, //The Credits screen
    // [PRELOADER]
    totalLoaded = 0, // The number of loaded assets
    preloader, // The preloader object
    manifest, // The manifest of resources
    // [LEVEL]
    barsArr = [],
    parts = 8,
    colors = ['rgb(248, 85, 31)','rgb(234, 243, 123)','rgb(102, 205, 170)','rgb(49, 105, 138)','rgb(87, 137, 222)','rgb(148, 230, 40)','rgb(229, 65, 181)','rgb(156, 82, 121)'],
    barsCnt, barH, barW,
    // [PLAYER]
    player,
    gravity = 20,
    // [TIMING]
    lastTime, curTime,
    // [OTHER]
    particles = [],
    isHoldingJump = false,
    isGameStarted = false,
    loading;

function entry() {
    // Get the canvas element and create the stage
    canvas = document.getElementById('mm-canvas');
    stage = new createjs.Stage(canvas);
    stage.mouseEventsEnabled = true;
    stage.enableMouseOver(60);
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);    
    
    // Set the manifest with all the resources and the preloader
    manifest = [
        {src:"assets/background.jpg", id:"bg"},
        {src:"assets/bullet03.png", id:"bullet_spritesheet"}
    ];
    preloader = new createjs.LoadQueue();
    preloader.installPlugin(createjs.Sound);
    preloader.addEventListener("fileload", handleFileLoad)
    preloader.onProgress = handleProgress;
    preloader.onComplete = handleComplete;
    preloader.onFileLoad = handleFileLoad;
    preloader.loadManifest(manifest);
    
    // Set the game ticker
    timeline = new createjs.Timeline() 
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener("tick", handleTick);
}
function resizeCanvas() {
    var canvasRatio = stage.canvas.height / stage.canvas.width;

    var windowRatio = window.innerHeight / window.innerWidth;
    var width;
    var height;

    if (windowRatio < canvasRatio) {
        height = window.innerHeight - 35;
        width = height / canvasRatio;
    } else {
        width = window.innerWidth;
        height = width * canvasRatio;
    }

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px'; 
    stage.update();
}

function handleProgress(event) {
    //use event.loaded to get the percentage of the loading
}
 
function handleComplete(event) {
         //triggered when all loading is complete
}
 
function handleFileLoad(event) {
         // Triggered when an individual file completes loading
         switch(event.item.type)
         {
            case 'image': // Image loaded
                var img = new Image();
                img.src = event.item.src;
                img.onload = handleLoadComplete;
                window[manifest[totalLoaded].id] = img;
            break;
 
            case 'sound': // Sound loaded
                handleLoadComplete();
            break;
         }
}

function handleLoadComplete(event) {
   totalLoaded += 1;
   console.log('Assets loaded:', totalLoaded, '/', manifest.length, event);
   if(manifest.length === totalLoaded) addTitleView();
}

function addTitleView() {
    var btnW = 250,
        btnH = 50,
        bounds;
    
    var startBtn = new createjs.Container();
    startBtn.x = canvas.width / 2 - btnW / 2;
    startBtn.y = canvas.height / 2.5 - btnH / 2;
    var startBtnCnt = new createjs.Shape();
    startBtnCnt.graphics.beginFill("#eee").drawRect(0, 0, btnW, btnH);
    startBtnCnt.alpha = 0.8;
    startBtnCnt.cursor = 'pointer';
    startBtnCnt.addEventListener('mouseover', function() {
        startBtnCnt.alpha = 1;
    });
    startBtnCnt.addEventListener('mouseout', function() {
        startBtnCnt.alpha = 0.8;
    }); 
    startBtnCnt.addEventListener('click', init);       
    startBtnTxt = new createjs.Text("Start", "bold 48px Iceland", "#444");
    startBtnTxt.x = startBtnTxt.getBounds().width / 1.25;
    startBtn.addChild(startBtnCnt, startBtnTxt);
    
    var creditsBtn = new createjs.Container();
    creditsBtn.x = canvas.width / 2 - btnW / 2; 
    creditsBtn.y = canvas.height / 2.5 + btnH;
    var creditsBtnCnt = new createjs.Shape();
    creditsBtnCnt.graphics.beginFill("#eee").drawRect(0, 0, btnW, btnH);    
    creditsBtnCnt.alpha = 0.8;
    creditsBtnCnt.cursor = 'pointer';
    creditsBtnCnt.addEventListener('mouseover', function() {
        creditsBtnCnt.alpha = 1;
    });
    creditsBtnCnt.addEventListener('mouseout', function() {
        creditsBtnCnt.alpha = 0.8;
    });    
    creditsBtnCnt.addEventListener('click', showCredits);     
    var creditsBtnTxt = new createjs.Text("Credits", "bold 48px Iceland", "#444");
    creditsBtnTxt.x = creditsBtnTxt.getBounds().width / 2.25;
    creditsBtn.addChild(creditsBtnCnt, creditsBtnTxt);

    background = new createjs.Bitmap(bg);    
    
    // Add them to the canvas
    TitleView.addChild(startBtn, creditsBtn);

    stage.addChild(background, TitleView);
    
    // Button Listeners
    startBtn.onPress = init;
    creditsBtn.onPress = showCredits;
}

// Show Credits
function showCredits() {
    var btnW = canvas.width / 2,
        btnH = canvas.height;
        
    credits = new createjs.Shape();
    credits.graphics.beginFill("#333").drawRect(btnW / 2, -btnH, btnW, btnH);       
    credits.cursor = 'pointer';
         
    stage.addChild(credits);
    createjs.Tween.get(credits).to({y: btnH}, 150, createjs.Ease.getPowIn(2.2))
    stage.setChildIndex( credits, stage.getNumChildren() - 1);

    credits.addEventListener('click', hideCredits);
}
 
// Hide Credits
function hideCredits(e) {
    createjs.Tween.get(credits, {override:true}).to({y: canvas.height * 2}, 150, createjs.Ease.getPowIn(2.2)).call(rmvCredits);
    timeline.gotoAndPlay(0);
}
 
// Remove Credits
function rmvCredits() {
    stage.removeChild(credits);
}

// Start Game
function init() {       
    createjs.Tween.get(TitleView).to({y:-canvas.height}, 500);
    showLoadingBar();
    
    createBarFloor();
    createPlayer();
    // createAI();        
    playMusic();  
}

function showLoadingBar() {
    var loadingTxt = new createjs.Text("LOADING", "bold 72px Iceland", "#ffffff"),
        loadingMask =  new createjs.Shape();

    loadingMask.graphics.beginFill("#333").drawRect(0, 0, canvas.width, canvas.height);        
    
    loading = new createjs.Container();
    
    loadingTxt.x = canvas.width / 2 - loadingTxt.getBounds().width / 2;
    loadingTxt.y = canvas.height / 2  - loadingTxt.getBounds().height / 2;
    
    loading.addChild(loadingMask, loadingTxt);
    stage.addChild(loading);
}

function handleTick() {
    stage.update();
    drawParticles();

    if(audioPlaying) {
        updatePlayer();      
        window.addEventListener('click', player.shoot);
        window.addEventListener('touch', player.shoot);
    }
}

function createBarFloor() {
    barsCnt = new createjs.Container();
    barH = 100;
    barW = canvas.width / parts;
        
    for (var i = 0; i < parts; i += 1) {
        barsArr[i] = new createjs.Shape();
        barsArr[i].graphics.beginFill(colors[i]).drawRect(barW * i, canvas.height - barH, barW, barH);
        barsArr[i].setBounds(barW * i, canvas.height - barH, barW, barH);
        barsCnt.addChild(barsArr[i]);
    }
    
    barsCnt.x = 0;
    barsCnt.y = 0;
}

function animateBars(dataArray) {
    var speedControl = createjs.Ticker.getTicks() % 2;
    
    if(speedControl === 0) {        
        stage.removeChild(barsCnt);
    
        for(var i = 0; i < barsArr.length; i += 1) {
            var height = dataArray[i * 2];
            barsArr[i].graphics.clear().beginFill(colors[i]).drawRect(barW * i, canvas.height - height, barW, height);
            barsArr[i].setBounds(barW * i, canvas.height - height, barW, height);
        }
        
        barsCnt.x = 0;
        barsCnt.y = 0;    
        stage.addChild(barsCnt);
    }
}