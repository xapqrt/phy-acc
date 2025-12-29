const CoulombMode = {
    name: 'coulomb',
    particles: [],
    charges: [],
    particleCount: 800,
    chargeMagnitude: 1.0,
    k_force: 8000,
    drag: 0.98,
    
    Particle: class {
        constructor(x, y, q) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.q = q;
            this.trail = [];
            this.maxTrail = 8;
        }
        
        applyForce(charges, k_force) {
            for (let c of charges) {
                const dx = this.x - c.x;
                const dy = this.y - c.y;
                const r2 = dx * dx + dy * dy + 10;
                
                if (r2 < 100) continue;
                const r = Math.sqrt(r2);
                
                const force = k_force * this.q * c.q / r2;
                
                this.vx += force * dx / r * 0.001;
                this.vy += force * dy / r * 0.001;
            }
        }
        
        update(drag) {
            this.vx *= drag;
            this.vy *= drag;
            this.x += this.vx;
            this.y += this.vy;
            
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrail) {
                this.trail.shift();
            }
        }
        
        draw(ctx) {
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const brightness = Math.min(255, 100 + speed * 50);
            
            if (this.trail.length > 1) {
                ctx.strokeStyle = 'rgba(240, 147, 251, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
                ctx.stroke();
            }
            
            ctx.fillStyle = 'rgb(240, ' + Math.floor(brightness) + ', 251)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    init(canvas) {
        console.log('coulomb init');
        this.spawnParticles(canvas);
    },
    
    // Spawn particles
    spawnParticles(canvas) {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new this.Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                (Math.random() - 0.5) * 0.2 * this.chargeMagnitude
            ));
        }
    },
    
    handleClick(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const q = (e.button === 2) ? -1 * this.chargeMagnitude : 1 * this.chargeMagnitude;
        this.charges.push({ x, y, q });
    },
    
    clear() {
        this.charges = [];
    },
    
    update(canvas) {
        for (let p of this.particles) {
            if (this.charges.length > 0) {
                p.applyForce(this.charges, this.k_force);
            }
            p.update(this.drag);
            
            if (p.x < 0) p.x = 0, p.vx *= -0.5;
            if (p.x > canvas.width) p.x = canvas.width, p.vx *= -0.5;
            if (p.y < 0) p.y = 0, p.vy *= -0.5;
            if (p.y > canvas.height) p.y = canvas.height, p.vy *= -0.5;
        }
    },
    
    draw(ctx, canvas) {
        for (let p of this.particles) {
            p.draw(ctx);
        }
        
        for (let c of this.charges) {
            const color1 = c.q > 0 ? '#ff6b6b' : '#4ecdc4';
            
            ctx.fillStyle = c.q > 0 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 22, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = c.q > 0 ? 'rgba(255, 107, 107, 0.6)' : 'rgba(78, 205, 196, 0.6)';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = color1;
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y);
        }
    },
    
    setupSliders() {
        const chargeSlider = document.getElementById('chargeMagnitudeSlider');
        const chargeLabel = document.getElementById('chargeMagnitudeLabel');
        
        if (chargeSlider) {
            chargeSlider.addEventListener('input', (e) => {
                this.chargeMagnitude = parseFloat(e.target.value);
                chargeLabel.textContent = 'CHARGE: ' + this.chargeMagnitude.toFixed(2);
            });
        }
        
        const particleSlider = document.getElementById('particleSlider');
        const particleLabel = document.getElementById('particleLabel');
        
        if (particleSlider) {
            particleSlider.addEventListener('input', (e) => {
                this.particleCount = parseInt(e.target.value);
                particleLabel.textContent = 'PARTICLES: ' + this.particleCount;
                this.spawnParticles(window.canvas);
                console.log('particle count: ' + this.particleCount);
            });
        }
        
        const forceSlider = document.getElementById('forceSlider');
        const forceLabel = document.getElementById('forceLabel');
        
        if (forceSlider) {
            forceSlider.addEventListener('input', (e) => {
                this.k_force = parseInt(e.target.value);
                forceLabel.textContent = 'FORCE: ' + this.k_force;
            });
        }
    }
};
