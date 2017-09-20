/* AUDIO VIZUALIZATION */

window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

// Global Variables for Audio
var audioContext,
    audioBuffer,
    sourceNode,
    analyserNode,
    javascriptNode,
    audioData = null,
    audioPlaying = false,
    sampleSize = 1024,  // number of samples to collect before analyzing data
    amplitudeArray, // array to hold time domain dat    
    audioUrl;    
    
audioUrl = "/src/assets/Droplex-Killa_Kokain.mp3";    

function playMusic() {
    try {
        audioContext = new AudioContext();
        console.info('Web Audio API is supported supported in this browser')
    } catch(e) {
        console.warn('Web Audio API is not supported in this browser');
        alert('Web Audio API is not supported in this browser');
        return;
    }
    
    // Set up the audio Analyser, the Source Buffer and javascriptNode
    setupAudioNodes();
    
    // Setup the event handler that is triggered every time enough samples have been collected
    // Trigger the audio analysis and draw the results
    javascriptNode.onaudioprocess = function () {
        analyserNode.fftSize = 32;
        var bufferLength = analyserNode.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);        
        // Get the Time Domain data for this sample
        analyserNode.getByteTimeDomainData(dataArray);
        // Draw the display if the audio is playing
        if (audioPlaying == true) {
            animateBars(dataArray);
        }
    }    
    
    // Load the Audio the first time through, otherwise play it from the buffer
    if(audioData == null) {
        loadSound(audioUrl);
    } else {
        playSound(audioData);
    }    
}

function setupAudioNodes() {
    sourceNode     = audioContext.createBufferSource();
    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    console.info('Audio Nodes are set up');
}

function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // When loaded, decode the data and play the sound
    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            audioData = buffer;
            playSound(audioData);
        }, onError);
    }
    request.send();
}

// Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);    // Play the sound now
    sourceNode.loop = true;
    audioPlaying = true;
}

function onError(e) {
    console.log(e);
}