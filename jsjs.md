// Coulomb constant (scaled way down for canvas pixels lol)
const k = 5000;
const drag = 0.95;  // makes particles settle nice

// Charged particle class
class Particle {
    constructor(x, y, q) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.q = q;  // charge
    }
    
    // Coulomb force: F = k*q1*q2/r^2
    applyForce(charges) {
        for (let c of charges) {
            const dx = this.x - c.x;
            const dy = this.y - c.y;
            const r2 = dx*dx + dy*dy + 1;  // +1 prevents singularity
            
            if (r2 < 0.1) continue;
            
            const r = Math.sqrt(r2);
            const force = k * this.q * c.q / r2;
            
            this.vx += force * dx/r * 0.001;
            this.vy += force * dy/r * 0.001;
        }
    }
    
    update() {
        this.vx *= drag;
        this.vy *= drag;
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw() {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
        ctx.fill();
    }
}

console.log('particle physics loaded');