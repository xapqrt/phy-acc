const ScopeMode = {
    name: 'scope',
    freq_x: 1,
    freq_y: 2,
    phase: 0,
    amplitude: 150,
    micActive: false,
    micInput: null,
    analyser: null,
    
    init(canvas) {
        console.log('scope init');
        this.setupKeyboardControls();
    },
    
    handleClick(e, canvas) {
    },
    
    // Clear (no clear action for scope mode)
    clear() {
        console.log('scope mode has no clear action');
    },
    
    // Update simulation
    update(canvas) {
        // Oscilloscope is purely visual, no physics update needed
    },
    

    drawLissajous(ctx, canvas) {
        const numPoints = 300;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.strokeStyle = 'rgba(0,255,150,0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            const x = centerX + this.amplitude * Math.sin(this.freq_x * t);
            const y = centerY + this.amplitude * Math.sin(this.freq_y * t + this.phase);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw crosshairs
        ctx.strokeStyle = 'rgba(0,255,150,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 250, centerY);
        ctx.lineTo(centerX + 250, centerY);
        ctx.moveTo(centerX, centerY - 250);
        ctx.lineTo(centerX, centerY + 250);
        ctx.stroke();
        
        // Draw grid circles
        for (let r = 50; r <= 200; r += 50) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    
    // Draw microphone visualization
    drawMicScope(ctx, canvas) {
        if (!this.analyser || !this.micActive) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const halfLen = Math.floor(bufferLength / 2);
        
        ctx.strokeStyle = 'rgba(0,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < Math.min(200, halfLen); i++) {
            const x_val = (dataArray[i] - 128) / 128 * this.amplitude;
            const y_val = (dataArray[i + halfLen] - 128) / 128 * this.amplitude;
            
            const x = centerX + x_val;
            const y = centerY + y_val;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw crosshairs
        ctx.strokeStyle = 'rgba(0,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 250, centerY);
        ctx.lineTo(centerX + 250, centerY);
        ctx.moveTo(centerX, centerY - 250);
        ctx.lineTo(centerX, centerY + 250);
        ctx.stroke();
    },
    
    // Draw control overlay
    drawControls(ctx, canvas) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 40, 220, this.micActive ? 150 : 130);
        
        ctx.fillStyle = '#0f0';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        
        let y = 65;
        ctx.fillText('FREQ X: ' + this.freq_x.toFixed(1) + ' Hz', 20, y);
        y += 22;
        ctx.fillText('FREQ Y: ' + this.freq_y.toFixed(1) + ' Hz', 20, y);
        y += 22;
        ctx.fillText('PHASE: ' + (this.phase * 180 / Math.PI).toFixed(0) + '°', 20, y);
        y += 22;
        ctx.fillText('AMPLITUDE: ' + this.amplitude, 20, y);
        y += 25;
        
        if (this.micActive) {
            ctx.fillStyle = '#0ff';
            ctx.fillText('● MIC ACTIVE', 20, y);
        } else {
            ctx.fillStyle = '#0a0';
            ctx.fillText('Press M for mic', 20, y);
        }
    },
    
    // Main draw function
    draw(ctx, canvas) {
        if (this.micActive) {
            this.drawMicScope(ctx, canvas);
        } else {
            this.drawLissajous(ctx, canvas);
        }
        this.drawControls(ctx, canvas);
    },
    
    // Initialize microphone
    async initMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            this.micInput = window.audioContext.createMediaStreamSource(stream);
            this.analyser = window.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.micInput.connect(this.analyser);
            
            this.micActive = true;
            console.log('microphone connected!');
        } catch (err) {
            console.log('mic access denied: ', err);
        }
    },
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (window.currentMode !== 'scope') return;
            
            switch (e.key.toLowerCase()) {
                case 'q':
                    this.freq_x = Math.max(0.5, this.freq_x - 0.5);
                    console.log('freq_x: ' + this.freq_x);
                    break;
                case 'w':
                    this.freq_x = Math.min(10, this.freq_x + 0.5);
                    console.log('freq_x: ' + this.freq_x);
                    break;
                case 'a':
                    this.freq_y = Math.max(0.5, this.freq_y - 0.5);
                    console.log('freq_y: ' + this.freq_y);
                    break;
                case 's':
                    this.freq_y = Math.min(10, this.freq_y + 0.5);
                    console.log('freq_y: ' + this.freq_y);
                    break;
                case 'z':
                    this.phase -= Math.PI / 12;
                    console.log('phase: ' + (this.phase * 180 / Math.PI).toFixed(0) + '°');
                    break;
                case 'x':
                    this.phase += Math.PI / 12;
                    console.log('phase: ' + (this.phase * 180 / Math.PI).toFixed(0) + '°');
                    break;
                case 'c':
                    this.amplitude = Math.max(50, this.amplitude - 10);
                    console.log('amplitude: ' + this.amplitude);
                    break;
                case 'v':
                    this.amplitude = Math.min(250, this.amplitude + 10);
                    console.log('amplitude: ' + this.amplitude);
                    break;
                case 'm':
                    if (!this.micActive) {
                        this.initMicrophone();
                    } else {
                        this.micActive = false;
                        if (this.micInput) {
                            this.micInput.disconnect();
                        }
                        console.log('microphone off');
                    }
                    break;
            }
        });
    },
    
    setupSliders() {
        const freqXSlider = document.getElementById('freqXSlider');
        const freqXLabel = document.getElementById('freqXLabel');
        
        if (freqXSlider) {
            freqXSlider.addEventListener('input', (e) => {
                this.freq_x = parseFloat(e.target.value);
                freqXLabel.textContent = 'FREQ X: ' + this.freq_x.toFixed(1) + ' Hz';
                console.log('freq_x: ' + this.freq_x);
            });
        }
        
        const freqYSlider = document.getElementById('freqYSlider');
        const freqYLabel = document.getElementById('freqYLabel');
        
        if (freqYSlider) {
            freqYSlider.addEventListener('input', (e) => {
                this.freq_y = parseFloat(e.target.value);
                freqYLabel.textContent = 'FREQ Y: ' + this.freq_y.toFixed(1) + ' Hz';
                console.log('freq_y: ' + this.freq_y);
            });
        }
        
        const phaseSlider = document.getElementById('phaseSlider');
        const phaseLabel = document.getElementById('phaseLabel');
        
        if (phaseSlider) {
            phaseSlider.addEventListener('input', (e) => {
                const degrees = parseInt(e.target.value);
                this.phase = degrees * Math.PI / 180;
                phaseLabel.textContent = 'PHASE: ' + degrees + '°';
                console.log('phase: ' + degrees + '°');
            });
        }
        
        const ampSlider = document.getElementById('ampSlider');
        const ampLabel = document.getElementById('ampLabel');
        
        if (ampSlider) {
            ampSlider.addEventListener('input', (e) => {
                this.amplitude = parseInt(e.target.value);
                ampLabel.textContent = 'AMPLITUDE: ' + this.amplitude;
                console.log('amplitude: ' + this.amplitude);
            });
        }
    }
};

