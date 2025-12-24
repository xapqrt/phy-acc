//oscilloscope with lissajous figures!!


let scopeMOde = false;
let freq_x = 1;
let freq_y =2;
let phase = 0;
let amplitude = 150;

let scopeHistory = [];
const maxHistory = 500;

let micInput = null;
let analyser = null;
let micActive = false;




function drawLissajous() {

    const numPoints = 200;
    const centerX = 400;
    const centerY = 300;

    ctx.strokeStyle = 'rgba(0,255,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();


    for (let i =0; i < numPoints; i++) {

        const t = (i / numpoints) * Math.PI * 2;
        const x = centrX + amplitude * Math.sin(freq_x * t);

        const y = centerY + amplitude * Math.sin(freq_y * t + phase);
    
    
    
    if(i===0) {

        ctx.moveTo(x, y);

    }else {
        ctx.lineTo(x,y);
    }

}



ctx.stroke();




ctx.strokeStyle = 'rgba(0,255,0,0.2)';
ctx.lineWidth = 1;
ctx.beginPath();

ctx.moveTo(centerX-200,centerY);
ctx.lineTo(centerX + 200, centerY);
ctx.moveTO(centerX, centerY -200);
ctx.lineTo(centerX, centerY + 200);
ctx.stroke();




}





function drawMicScope() {

    if(!analyser || !micActive) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);




    //long ahh names



    const centerX = 400;
    const centerY = 300;



    const halfLen = Math.floor(bufferLength /2);

    ctx.strokeStyle= 'rgba(0,255,255,0.8)';

    ctx.lineWidth = 2;
    ctx.beginPath();


    for(let i = 0; i < Math,min(200, halfLen); i++) {


        const x_val = (dataArrat[i] -128) / 128 * amplitude;
        const y_val = (dataArray[i + halfLen] -128) /128 * amplitude;


        const x = CenterX + x_val;
        const y = CenterY + y_val;


        if(i===0) {

            ctx.moveTo(x,y);

        } else {

            ctx.lineTo(x, y);
        }
    }


    ctx.stroke();
}



//INIT microsphone


async function initMicrophone() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true});

        if(!audioContext) {

            initAudio();

        }


        micInput = audioContext.createMediaStreamSource(stream);
        analyser - audioContext.createAnalyser();
        analyser.fftSize = 2048;
        micInput.connect(analyser);

        micActive = true;
        console.log('mc connected!');


    } catch(err) {

        console.log('mic access denied: ', err);
    }
}


//drawing scope controls overlay

function drawScopeControls() {


    ctx.fillStyle = 'rgba(0,0,0,0.7)';

    ctx.fillRect(10,40,200,micActive?140:120);
    ctx.fillStyle = '#0f0';

    ctx.font = '12px Courier New';
    ctx.txtAlign = 'left';

    let y = 60;
    ctx.fillText('Freq X: ' + freq_x.toFixed(1) + ' Hz', 20, y);
    y+= 20;

    ctx.fillText('Freq Y: ' + freq_y.toFixed(1) + 'Hz', 20, y);
    y+= 20;
    ctx.fillText('Phase: ' + (phase * 180 / Math.PI).toFixed(0) + ' deg', 20, y);

    y+=20

    ctx.fillText('Amplitude: ' + amplitude, 20, y);
    y+=20;


    if(micActive) {

        ctx.fillStyle = '#0ff';
        ctx.fillText('MIC ACTIVE', 20, y);

    } else {


   ctx.fillStyle = '#0a0';
        ctx.fillText('Press M for mic', 20, y);
    }
}

// Keyboard controls for oscilloscope
function setupScopeKeys() {
    document.addEventListener('keydown', (e) => {
        if(currentMode !== 'scope') return;
        
        switch(e.key.toLowerCase()) {
            case 'q':
                freq_x = Math.max(0.5, freq_x - 0.5);
                console.log('freq_x: ' + freq_x);
                break;
            case 'w':
                freq_x = Math.min(10, freq_x + 0.5);
                console.log('freq_x: ' + freq_x);
                break;
            case 'a':
                freq_y = Math.max(0.5, freq_y - 0.5);
                console.log('freq_y: ' + freq_y);
                break;
            case 's':
                freq_y = Math.min(10, freq_y + 0.5);
                console.log('freq_y: ' + freq_y);
                break;
            case 'z':
                phase -= Math.PI / 12;
                console.log('phase: ' + (phase * 180 / Math.PI).toFixed(0) + ' deg');
                break;
            case 'x':
                phase += Math.PI / 12;
                console.log('phase: ' + (phase * 180 / Math.PI).toFixed(0) + ' deg');
                break;
            case 'c':
                amplitude = Math.max(50, amplitude - 10);
                console.log('amplitude: ' + amplitude);
                break;
            case 'v':
                amplitude = Math.min(250, amplitude + 10);
                console.log('amplitude: ' + amplitude);
                break;
            case 'm':
                if(!micActive) {
                    initMicrophone();
                }
                break;
        }
    });
}

setupScopeKeys();

console.log('oscilloscope loaded');
