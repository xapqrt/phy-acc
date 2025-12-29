let scopeMode = false;
let freq_x = 1;
let freq_y = 2;
let phase = 0;
let amplitude = 150;

let micInput = null;
let analyser = null;
let micActive = false;

function drawLissajous() {
    const numPoints = 300;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = 'rgba(0,255,150,0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const x = centerX + amplitude * Math.sin(freq_x * t);
        const y = centerY + amplitude * Math.sin(freq_y * t + phase);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,255,150,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 250, centerY);
    ctx.lineTo(centerX + 250, centerY);
    ctx.moveTo(centerX, centerY - 250);
    ctx.lineTo(centerX, centerY + 250);
    ctx.stroke();

    for (let r = 50; r <= 200; r += 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Draw microphone input as XY oscilloscope
function drawMicScope() {
    if (!analyser || !micActive) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const halfLen = Math.floor(bufferLength / 2);

    ctx.strokeStyle = 'rgba(0,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < Math.min(200, halfLen); i++) {
        const x_val = (dataArray[i] - 128) / 128 * amplitude;
        const y_val = (dataArray[i + halfLen] - 128) / 128 * amplitude;

        const x = centerX + x_val;
        const y = centerY + y_val;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 250, centerY);
    ctx.lineTo(centerX + 250, centerY);
    ctx.moveTo(centerX, centerY - 250);
    ctx.lineTo(centerX, centerY + 250);
    ctx.stroke();
}

async function initMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!audioContext) {
            initAudio();
        }

        micInput = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        micInput.connect(analyser);

        micActive = true;
    } catch (err) {
        console.log('mic access denied: ', err);
    }
}

function drawScopeControls() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, 40, 220, micActive ? 150 : 130);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';

    let y = 65;
    ctx.fillText('FREQ X: ' + freq_x.toFixed(1) + ' Hz', 20, y);
    y += 22;
    ctx.fillText('FREQ Y: ' + freq_y.toFixed(1) + ' Hz', 20, y);
    y += 22;
    ctx.fillText('PHASE: ' + (phase * 180 / Math.PI).toFixed(0) + '°', 20, y);
    y += 22;
    ctx.fillText('AMPLITUDE: ' + amplitude, 20, y);
    y += 25;

    if (micActive) {
        ctx.fillStyle = '#0ff';
        ctx.fillText('● MIC ACTIVE', 20, y);
    } else {
        ctx.fillStyle = '#0a0';
        ctx.fillText('Press M for mic', 20, y);
    }
}

function setupScopeKeys() {
    document.addEventListener('keydown', (e) => {
        if (currentMode !== 'scope') return;
        
        switch (e.key.toLowerCase()) {
            case 'q':
                freq_x = Math.max(0.5, freq_x - 0.5);
                break;
            case 'w':
                freq_x = Math.min(10, freq_x + 0.5);
                break;
            case 'a':
                freq_y = Math.max(0.5, freq_y - 0.5);
                break;
            case 's':
                freq_y = Math.min(10, freq_y + 0.5);
                break;
            case 'z':
                phase -= Math.PI / 12;
                break;
            case 'x':
                phase += Math.PI / 12;
                break;
            case 'c':
                amplitude = Math.max(50, amplitude - 10);
                break;
            case 'v':
                amplitude = Math.min(250, amplitude + 10);
                break;
            case 'm':
                if (!micActive) {
                    initMicrophone();
                } else {
                    micActive = false;
                    if (micInput) {
                        micInput.disconnect();
                    }
                }
                break;
        }
    });
}

setupScopeKeys();
