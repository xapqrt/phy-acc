let audioContext = null;
let oscillator = null;
let gainNode = null;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 60;
    oscillator.type = 'sine';
    
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
}

function playSpark() {
    if (!audioContext) return;
    
    const sparkOsc = audioContext.createOscillator();
    const sparkGain = audioContext.createGain();
    
    sparkOsc.frequency.value = 800;  // start freq
    sparkOsc.type = 'square';
    
    sparkGain.gain.value = 0.1;
    sparkGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    sparkOsc.connect(sparkGain);
    sparkGain.connect(audioContext.destination);
    
    sparkOsc.start();
    sparkOsc.stop(audioContext.currentTime + 0.1);
}
