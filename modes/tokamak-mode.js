const TokamakMode = {
    name: 'tokamak',
    plasmaParticles: [],
    B_toroidal: 1.5,
    B_poloidal: 1.0,
    turbulence: 0.15,
    integrity: 100,
    temperature: 15,
    
    PlasmaParticle: class {
        constructor(angle, r_offset, canvas) {
            this.angle = angle;
            this.r_offset = r_offset;
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const major_radius = Math.min(canvas.width, canvas.height) * 0.25;
            
            const R = major_radius + r_offset;
            this.x = centerX + R * Math.cos(angle);
            this.y = centerY + R * Math.sin(angle);
            
            this.vx = 0;
            this.vy = 0;
            this.temp = 1.0;
            this.trail = [];
            this.maxTrail = 5;
        }
        
        update(canvas, B_toroidal, B_poloidal, turbulence) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const major_radius = Math.min(canvas.width, canvas.height) * 0.25;
            const minor_radius = major_radius * 0.5;
            
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const r = Math.sqrt(dx * dx + dy * dy);
            const deviation = r - major_radius;
            
            const angle = Math.atan2(dy, dx);
            
            // Toroidal force
            const F_tor_x = -Math.sin(angle) * B_toroidal * 0.8;
            const F_tor_y = Math.cos(angle) * B_toroidal * 0.8;
            
            // Poloidal force
            const F_pol_x = -dx / r * B_poloidal * deviation * 0.02;
            const F_pol_y = -dy / r * B_poloidal * deviation * 0.02;
            
            this.vx += F_tor_x + F_pol_x;
            this.vy += F_tor_y + F_pol_y;
            
            // Turbulence
            this.vx += (Math.random() - 0.5) * turbulence * 0.5;
            this.vy += (Math.random() - 0.5) * turbulence * 0.5;
            
            // Damping
            this.vx *= 0.97;
            this.vy *= 0.97;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Temperature
            const dist_from_ideal = Math.abs(deviation);
            this.temp = 1.0 - Math.min(1.0, dist_from_ideal / 80);
            
            // Trail
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrail) {
                this.trail.shift();
            }
            
            // Check containment
            if (r < major_radius - minor_radius - 15 ||
                r > major_radius + minor_radius + 15) {
                return false;
            }
            
            return true;
        }
        
        draw(ctx) {
            // Trail
            if (this.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,100,255,0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
                ctx.stroke();
            }
            
            // Particle
            const hue = this.temp * 60 + 270;
            const brightness = 50 + this.temp * 50;
            
            ctx.fillStyle = `hsla(${hue}, 100%, ${brightness}%, 0.4)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `hsla(${hue}, 100%, ${brightness + 30}%, 0.9)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    init(canvas) {
        console.log('tokamak init');
        this.spawnPlasma(canvas);
    },
    
    spawnPlasma(canvas) {
        this.plasmaParticles = [];
        const numParticles = 400;
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const r_offset = (Math.random() - 0.5) * 50;
            this.plasmaParticles.push(new this.PlasmaParticle(angle, r_offset, canvas));
        }
    },
    
    handleClick(e, canvas) {
    },
    
    clear() {
        this.spawnPlasma(window.canvas);
        this.integrity = 100;
    },
    
    update(canvas) {
        let escaped = 0;
        for (let i = this.plasmaParticles.length - 1; i >= 0; i--) {
            const contained = this.plasmaParticles[i].update(
                canvas, this.B_toroidal, this.B_poloidal, this.turbulence
            );
            
            if (!contained) {
                this.plasmaParticles.splice(i, 1);
                escaped++;
            }
        }
        
        if (escaped > 0) {
            this.integrity -= escaped * 0.2;
            if (this.integrity < 0) this.integrity = 0;
        }
    },
    
    drawReactor(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const major_radius = Math.min(canvas.width, canvas.height) * 0.25;
        const minor_radius = major_radius * 0.5;
        
        // Outer wall
        ctx.strokeStyle = 'rgba(150,150,150,0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, major_radius + minor_radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner wall
        ctx.strokeStyle = 'rgba(150,150,150,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, major_radius - minor_radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Ideal radius
        ctx.strokeStyle = 'rgba(0,255,100,0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, major_radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Magnetic field lines
        if (this.B_toroidal > 0.5) {
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const opacity = Math.min(0.3, this.B_toroidal * 0.15);
                ctx.strokeStyle = `rgba(100,200,255,${opacity})`;
                ctx.lineWidth = 1.5;
                
                const r1 = major_radius - minor_radius + 10;
                const r2 = major_radius + minor_radius - 10;
                
                ctx.beginPath();
                ctx.moveTo(centerX + r1 * Math.cos(angle), centerY + r1 * Math.sin(angle));
                ctx.lineTo(centerX + r2 * Math.cos(angle), centerY + r2 * Math.sin(angle));
                ctx.stroke();
            }
        }
    },
    
    drawStats(ctx, canvas) {
        const containedCount = this.plasmaParticles.length;
        this.temperature = 15 + (this.B_toroidal + this.B_poloidal) * 5 - this.turbulence * 20;
        
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(canvas.width - 240, 40, 230, 200);
        
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        
        let y = 65;
        
        const intColor = this.integrity > 70 ? '#0f0' : (this.integrity > 40 ? '#ff0' : '#f00');
        ctx.fillStyle = intColor;
        ctx.fillText('INTEGRITY: ' + this.integrity.toFixed(1) + '%', canvas.width - 230, y);
        
        ctx.fillRect(canvas.width - 230, y + 5, this.integrity * 1.8, 8);
        ctx.strokeStyle = intColor;
        ctx.strokeRect(canvas.width - 230, y + 5, 180, 8);
        
        y += 35;
        ctx.fillStyle = '#0ff';
        ctx.fillText('TEMP: ' + this.temperature.toFixed(1) + ' million K', canvas.width - 230, y);
        
        y += 25;
        ctx.fillStyle = '#0f0';
        ctx.fillText('B_toroidal: ' + this.B_toroidal.toFixed(2) + ' T', canvas.width - 230, y);
        
        y += 20;
        ctx.fillText('B_poloidal: ' + this.B_poloidal.toFixed(2) + ' T', canvas.width - 230, y);
        
        y += 20;
        ctx.fillStyle = this.turbulence > 0.3 ? '#f80' : '#0f0';
        ctx.fillText('Turbulence: ' + this.turbulence.toFixed(2), canvas.width - 230, y);
        
        y += 20;
        ctx.fillStyle = containedCount < 300 ? '#f00' : '#0f0';
        ctx.fillText('Plasma: ' + containedCount + ' ions', canvas.width - 230, y);
        
        y += 30;
        ctx.fillStyle = '#0aa';
        ctx.font = '11px Courier New';
        ctx.fillText('1/2: B_toroidal', canvas.width - 230, y);
        y += 15;
        ctx.fillText('3/4: B_poloidal', canvas.width - 230, y);
        y += 15;
        ctx.fillText('5/6: Turbulence', canvas.width - 230, y);
        y += 15;
        ctx.fillText('R: Reset plasma', canvas.width - 230, y);
    },
    
    draw(ctx, canvas) {
        this.drawReactor(ctx, canvas);
        
        for (let p of this.plasmaParticles) {
            p.draw(ctx);
        }
        
        this.drawStats(ctx, canvas);
    },
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (window.currentMode !== 'tokamak') return;
            
            switch (e.key) {
                case '1':
                    this.B_toroidal = Math.max(0, this.B_toroidal - 0.1);
                    break;
                case '2':
                    this.B_toroidal = Math.min(4, this.B_toroidal + 0.1);
                    console.log('B_toroidal: ' + this.B_toroidal.toFixed(2) + ' T');
                    break;
                case '3':
                    this.B_poloidal = Math.max(0, this.B_poloidal - 0.1);
                    console.log('B_poloidal: ' + this.B_poloidal.toFixed(2) + ' T');
                    break;
                case '4':
                    this.B_poloidal = Math.min(4, this.B_poloidal + 0.1);
                    console.log('B_poloidal: ' + this.B_poloidal.toFixed(2) + ' T');
                    break;
                case '5':
                    this.turbulence = Math.max(0, this.turbulence - 0.05);
                    console.log('turbulence: ' + this.turbulence.toFixed(2));
                    break;
                case '6':
                    this.turbulence = Math.min(1.5, this.turbulence + 0.05);
                    console.log('turbulence: ' + this.turbulence.toFixed(2));
                    break;
                case 'r':
                case 'R':
                    this.spawnPlasma(window.canvas);
                    this.integrity = 100;
                    break;
            }
        });
    },
    
    setupSliders() {
        const bToroidalSlider = document.getElementById('bToroidalSlider');
        const bToroidalLabel = document.getElementById('bToroidalLabel');
        
        if (bToroidalSlider) {
            bToroidalSlider.addEventListener('input', (e) => {
                this.B_toroidal = parseFloat(e.target.value);
                bToroidalLabel.textContent = 'B_TOROIDAL: ' + this.B_toroidal.toFixed(2) + ' T';
                console.log('B_toroidal: ' + this.B_toroidal.toFixed(2) + ' T');
            });
        }
        
        const bPoloidalSlider = document.getElementById('bPoloidalSlider');
        const bPoloidalLabel = document.getElementById('bPoloidalLabel');
        
        if (bPoloidalSlider) {
            bPoloidalSlider.addEventListener('input', (e) => {
                this.B_poloidal = parseFloat(e.target.value);
                bPoloidalLabel.textContent = 'B_POLOIDAL: ' + this.B_poloidal.toFixed(2) + ' T';
                console.log('B_poloidal: ' + this.B_poloidal.toFixed(2) + ' T');
            });
        }
        
        const turbulenceSlider = document.getElementById('turbulenceSlider');
        const turbulenceLabel = document.getElementById('turbulenceLabel');
        
        if (turbulenceSlider) {
            turbulenceSlider.addEventListener('input', (e) => {
                this.turbulence = parseFloat(e.target.value);
                turbulenceLabel.textContent = 'TURBULENCE: ' + this.turbulence.toFixed(2);
                console.log('turbulence: ' + this.turbulence.toFixed(2));
            });
        }
    }
};

TokamakMode.setupKeyboardControls();
