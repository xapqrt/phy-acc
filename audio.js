// Web Audio API setup
let audioContext = null;
let oscillator = null;
let gainNode = null;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 60hz hum (mains frequency)
    oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 60;  // Hz
    oscillator.type = 'sine';
    
    // Gain node for volume control
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;  // default volume
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    console.log('audio engine started - 60hz hum');
}

// Play spark sound when placing charges
function playSpark() {
    if (!audioContext) return;
    
    const sparkOsc = audioContext.createOscillator();
    const sparkGain = audioContext.createGain();
    
    sparkOsc.frequency.value = 800;  // start freq (bright spark)
    sparkOsc.type = 'square';  // harsh electric sound
    
    // Frequency sweep down (sounds like electric discharge)
    sparkOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.08);
    
    // Volume envelope (attack/decay)
    sparkGain.gain.value = 0.15;
    sparkGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    sparkOsc.connect(sparkGain);
    sparkGain.connect(audioContext.destination);
    
    sparkOsc.start();
    sparkOsc.stop(audioContext.currentTime + 0.1);
}

console.log('audio engine loaded');
