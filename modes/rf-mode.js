const RFMode = {
    name: 'rf',
    transmitters: [],
    receivers: [],
    waveParticles: [],
    wave_speed: 3,
    wave_decay: 0.98,
    wave_freq: 0.1,
    

    WaveParticle: class {
        constructor(x, y, tx, ty, phase) {
            this.x = x;
            this.y = y;
            this.tx = tx;
            this.ty = ty;
            this.phase = phase;
            this.intensity = 1.0;
            this.life = 200;
        }
        
        update(canvas, wave_speed, wave_decay, wave_freq) {
            this.x += this.tx * wave_speed;
            this.y += this.ty * wave_speed;
            
            this.phase += wave_freq;
            this.intensity *= wave_decay;
            this.life--;
            
            if (this.x < 0 || this.x > canvas.width) {
                this.tx *= -1;
                this.x = Math.max(0, Math.min(canvas.width, this.x));
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.ty *= -1;
                this.y = Math.max(0, Math.min(canvas.height, this.y));
            }
        }
        
        draw(ctx) {
            const osc = Math.sin(this.phase) * 0.5 + 0.5;
            const brightness = this.intensity * osc * 255;
            
            ctx.fillStyle = 'rgb(0,' + Math.floor(brightness) + ',255)';
            ctx.globalAlpha = this.intensity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    },
    
    Transmitter: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.frameCount = 0;
            this.emitRate = 3;
        }
        
        emit(waveParticles, WaveParticle) {
            const numRays = 16;
            for (let i = 0; i < numRays; i++) {
                const angle = (i / numRays) * Math.PI * 2;
                const tx = Math.cos(angle);
                const ty = Math.sin(angle);
                
                waveParticles.push(new WaveParticle(
                    this.x, this.y,
                    tx, ty,
                    Math.random() * Math.PI * 2
                ));
            }
        }
        
        update(waveParticles, WaveParticle) {
            this.frameCount++;
            if (this.frameCount >= this.emitRate) {
                this.emit(waveParticles, WaveParticle);
                this.frameCount = 0;
            }
        }
        
        draw(ctx) {
            const pulse = Math.sin(this.frameCount / this.emitRate * Math.PI) * 0.3 + 0.7;
            
            ctx.fillStyle = 'rgba(255,100,0,' + pulse + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('TX', this.x, this.y - 18);
        }
    },
    
    Receiver: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.signalStrength = 0;
        }
        
        update(waveParticles) {
            this.signalStrength = 0;
            
            for (let wp of waveParticles) {
                const dx = this.x - wp.x;
                const dy = this.y - wp.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 30) {
                    this.signalStrength += wp.intensity * (1 - dist / 30);
                }
            }
            
            this.signalStrength = Math.min(1, this.signalStrength);
        }
        
        draw(ctx) {
            const glowColor = 'rgba(0,255,100, ' + (this.signalStrength * 0.5) + ')';
            
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#0a0';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x - 15, this.y + 15, 30 * this.signalStrength, 4);
            ctx.strokeStyle = '#0f0';
            ctx.strokeRect(this.x - 15, this.y + 15, 30, 4);
            
            ctx.fillStyle = '#0f0';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('RX', this.x, this.y - 18);
        }
    },
    
    // Initialize mode
    init(canvas) {
        console.log('rf mode initialized');
        this.transmitters = [];
        this.receivers = [];
        this.waveParticles = [];
    },
    
    // Handle mouse click
    handleClick(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (e.button === 2) {
            this.receivers.push(new this.Receiver(x, y));
        } else {
            this.transmitters.push(new this.Transmitter(x, y));
        }
    },
    
    clear() {
        this.transmitters = [];
        this.receivers = [];
        this.waveParticles = [];
    },
    
    update(canvas) {
        for (let tx of this.transmitters) {
            tx.update(this.waveParticles, this.WaveParticle);
        }
        
        for (let rx of this.receivers) {
            rx.update(this.waveParticles);
        }
        
        for (let i = this.waveParticles.length - 1; i >= 0; i--) {
            const wp = this.waveParticles[i];
            wp.update(canvas, this.wave_speed, this.wave_decay, this.wave_freq);
            
            if (wp.life <= 0 || wp.intensity < 0.01) {
                this.waveParticles.splice(i, 1);
            }
        }
    },
    
    // Draw simulation
    draw(ctx) {
        for (let tx of this.transmitters) {
            tx.draw(ctx);
        }
        
        for (let rx of this.receivers) {
            rx.draw(ctx);
        }
        
        for (let wp of this.waveParticles) {
            wp.draw(ctx);
        }
    },
    
    // Setup sliders
    setupSliders() {
        const waveSpeedSlider = document.getElementById('waveSpeedSlider');
        const waveSpeedLabel = document.getElementById('waveSpeedLabel');
        
        if (waveSpeedSlider) {
            waveSpeedSlider.addEventListener('input', (e) => {
                this.wave_speed = parseFloat(e.target.value);
                waveSpeedLabel.textContent = 'WAVE SPEED: ' + this.wave_speed;
                console.log('wave speed: ' + this.wave_speed);
            });
        }
        
        const emitRateSlider = document.getElementById('emitRateSlider');
        const emitRateLabel = document.getElementById('emitRateLabel');
        
        if (emitRateSlider) {
            emitRateSlider.addEventListener('input', (e) => {
                const rate = parseInt(e.target.value);
                emitRateLabel.textContent = 'EMIT RATE: ' + rate;
                for (let tx of this.transmitters) {
                    tx.emitRate = rate;
                }
                console.log('emit rate: ' + rate);
            });
        }
        
        const decaySlider = document.getElementById('decaySlider');
        const decayLabel = document.getElementById('decayLabel');
        
        if (decaySlider) {
            decaySlider.addEventListener('input', (e) => {
                this.wave_decay = parseFloat(e.target.value);
                decayLabel.textContent = 'WAVE DECAY: ' + this.wave_decay.toFixed(2);
            });
        }
    }
};
