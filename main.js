const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas to fill viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const k = 8000;
const drag = 0.98;  // less drag for more movement
const phosphor_alpha = 0.12;  // trail fade

class Particle {
    constructor(x, y, q) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.q = q;
        this.trail = [];
        this.maxTrail = 8;
    }

    applyForce(charges) {
        for (let c of charges) {
            const dx = this.x - c.x;
            const dy = this.y - c.y;
            const r2 = dx*dx + dy*dy + 10;

            if (r2 < 100) continue;
            const r = Math.sqrt(r2);

            const force = (typeof k_force !== 'undefined' ? k_force : k) * this.q * c.q / r2;

            this.vx += force * dx/r * 0.001;
            this.vy += force * dy/r * 0.001;
        }
    }

    update() {
        this.vx *= drag;
        this.vy *= drag;
        this.x += this.vx;
        this.y += this.vy;
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    draw() {
        const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
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
}

let currentMode = 'coulomb';

// Arrays for particles and charges
let particles = [];
let charges = [];
let particleCount = 800;
let showFieldLines = false;
let chargeMagnitude = 1.0;

function spawnParticles() {
    particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            Math.random() * canvasWidth,
            Math.random() * canvasHeight,
            (Math.random() - 0.5) * 0.2 * chargeMagnitude
        ));
    }
    console.log('spawned ' + particleCount + ' particles');
}

spawnParticles();

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('canvas resized: ' + canvas.width + 'x' + canvas.height);
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    modeManager.clear();
});

// ========== COULOMB MODE SLIDERS ==========
const chargeSlider = document.getElementById('chargeSlider');
const chargeLabel = document.getElementById('chargeLabel');

if (chargeSlider) {
    chargeSlider.addEventListener('input', (e) => {
        chargeMagnitude = parseFloat(e.target.value);
        chargeLabel.textContent = 'CHARGE: ' + chargeMagnitude.toFixed(1) + 'x';
        console.log('charge magnitude set to ' + chargeMagnitude + 'x');
    });
}

const particleSlider = document.getElementById('particleSlider');
const particleLabel = document.getElementById('particleLabel');

if (particleSlider) {
    particleSlider.addEventListener('input', (e) => {
        particleCount = parseInt(e.target.value);
        particleLabel.textContent = 'PARTICLES: ' + particleCount;
        spawnParticles();
        console.log('particle count set to ' + particleCount);
    });
}

const forceSlider = document.getElementById('forceSlider');
const forceLabel = document.getElementById('forceLabel');
let k_force = 8000;

if (forceSlider) {
    forceSlider.addEventListener('input', (e) => {
        k_force = parseInt(e.target.value);
        forceLabel.textContent = 'FORCE: ' + k_force;
    });
}

const waveSpeedSlider = document.getElementById('waveSpeedSlider');
const waveSpeedLabel = document.getElementById('waveSpeedLabel');

if (waveSpeedSlider) {
    waveSpeedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        waveSpeedLabel.textContent = 'WAVE SPEED: ' + speed;
        if (typeof wave_speed !== 'undefined') {
            window.wave_speed = speed;
        }
    });
}

const emitRateSlider = document.getElementById('emitRateSlider');
const emitRateLabel = document.getElementById('emitRateLabel');

if (emitRateSlider) {
    emitRateSlider.addEventListener('input', (e) => {
        const rate = parseInt(e.target.value);
        emitRateLabel.textContent = 'EMIT RATE: ' + rate;
        for (let tx of transmitters) {
            tx.emitRate = rate;
        }
    });
}

const decaySlider = document.getElementById('decaySlider');
const decayLabel = document.getElementById('decayLabel');

if (decaySlider) {
    decaySlider.addEventListener('input', (e) => {
        const decay = parseFloat(e.target.value);
        decayLabel.textContent = 'WAVE DECAY: ' + decay.toFixed(2);
        if (typeof wave_decay !== 'undefined') {
            window.wave_decay = decay;
        }
    });
}

const freqXSlider = document.getElementById('freqXSlider');
const freqXLabel = document.getElementById('freqXLabel');

if (freqXSlider) {
    freqXSlider.addEventListener('input', (e) => {
        freq_x = parseFloat(e.target.value);
        freqXLabel.textContent = 'FREQ X: ' + freq_x.toFixed(1) + ' Hz';
    });
}

const freqYSlider = document.getElementById('freqYSlider');
const freqYLabel = document.getElementById('freqYLabel');

if (freqYSlider) {
    freqYSlider.addEventListener('input', (e) => {
        freq_y = parseFloat(e.target.value);
        freqYLabel.textContent = 'FREQ Y: ' + freq_y.toFixed(1) + ' Hz';
    });
}

const phaseSlider = document.getElementById('phaseSlider');
const phaseLabel = document.getElementById('phaseLabel');

if (phaseSlider) {
    phaseSlider.addEventListener('input', (e) => {
        const degrees = parseInt(e.target.value);
        phase = degrees * Math.PI / 180;
        phaseLabel.textContent = 'PHASE: ' + degrees + '°';
    });
}

const ampSlider = document.getElementById('ampSlider');
const ampLabel = document.getElementById('ampLabel');

if (ampSlider) {
    ampSlider.addEventListener('input', (e) => {
        amplitude = parseInt(e.target.value);
        ampLabel.textContent = 'AMPLITUDE: ' + amplitude;
    });
}

const bToroidalSlider = document.getElementById('bToroidalSlider');
const bToroidalLabel = document.getElementById('bToroidalLabel');

if (bToroidalSlider) {
    bToroidalSlider.addEventListener('input', (e) => {
        B_toroidal = parseFloat(e.target.value);
        bToroidalLabel.textContent = 'B_TOROIDAL: ' + B_toroidal.toFixed(2) + ' T';
        console.log('B_toroidal set to ' + B_toroidal.toFixed(2) + ' T');
    });
}

const bPoloidalSlider = document.getElementById('bPoloidalSlider');
const bPoloidalLabel = document.getElementById('bPoloidalLabel');

if (bPoloidalSlider) {
    bPoloidalSlider.addEventListener('input', (e) => {
        B_poloidal = parseFloat(e.target.value);
        bPoloidalLabel.textContent = 'B_POLOIDAL: ' + B_poloidal.toFixed(2) + ' T';
    });
}

const turbulenceSlider = document.getElementById('turbulenceSlider');
const turbulenceLabel = document.getElementById('turbulenceLabel');

if (turbulenceSlider) {
    turbulenceSlider.addEventListener('input', (e) => {
        turbulence = parseFloat(e.target.value);
        turbulenceLabel.textContent = 'TURBULENCE: ' + turbulence.toFixed(2);
    });
}

canvas.addEventListener('mousedown', (e) => {
    if (!audioContext) {
        initAudio();
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if(currentMode === 'coulomb') {
        const q = (e.button === 2) ? -1 * chargeMagnitude : 1 * chargeMagnitude;
        
        charges.push({ x, y, q });
        playSpark();
        
    } else if(currentMode === 'rf') {
        if(e.button === 2) {
            receivers.push(new Receiver(x, y));
        } else {
            transmitters.push(new Transmitter(x, y));
        }
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

let lastTime = performance.now();
let fps = 60;

function animate() {
    


    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;


    fps = Math.round(1000 / delta);
    
    ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if(currentMode === 'coulomb') {
        if (showFieldLines && charges.length > 0) {
            drawFieldVectors();
        }
        
        for (let p of particles) {
            if(charges.length > 0) {
                p.applyForce(charges);
            }
            p.update();
            
            if (p.x < 0) p.x = 0, p.vx *= -0.5;
            if (p.x > canvas.width) p.x = canvas.width, p.vx *= -0.5;
            if (p.y < 0) p.y = 0, p.vy *= -0.5;
            if (p.y > canvas.height) p.y = canvas.height, p.vy *= -0.5;
            
            p.draw();
        }
        
        for (let c of charges) {
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
        
    } else if(currentMode === 'rf') {
        for(let tx of transmitters) {
            tx.update();
            tx.draw();
        }
        
        for(let rx of receivers) {
            rx.update();
            rx.draw();
        }
        
        for(let i = waveParticles.length - 1; i >= 0; i--) {
            const wp = waveParticles[i];
            wp.update();
            
            if(wp.life <= 0 || wp.intensity < 0.01) {
                waveParticles.splice(i, 1);
            } else {
                wp.draw();
            }
        }
    } else if(currentMode === 'scope') {
        if(micActive) {
            drawMicScope();
        } else {
            drawLissajous();
        }
        
        drawScopeControls();
    } else if(currentMode === 'tokamak') {
        let escaped = 0;
        for(let i = plasmaParticles.length - 1; i >= 0; i--) {
            const contained = plasmaParticles[i].update();
            
            if(!contained) {
                plasmaParticles.splice(i, 1);
                escaped++;
            }
        }
        
        if(escaped > 0) {
            integrity -= escaped * 0.2;
            if(integrity < 0) integrity = 0;
        }
        
        drawTokamak();
        
        for(let p of plasmaParticles) {
            p.draw();
        }
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 95, 28);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Courier New, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('FPS: ' + fps, 12, 11);
    
    requestAnimationFrame(animate);
}





function drawFieldVectors() {
    const gridSpacing = 60;
    const arrowScale = 0.8;

    ctx.lineWidth = 1.5;

    for(let x = gridSpacing; x < canvas.width; x += gridSpacing) {
        for(let y = gridSpacing; y < canvas.height; y+= gridSpacing) {
            let Ex = 0, Ey = 0;

            for (let c of charges) {
                const dx = x - c.x;
                const dy = y - c.y;
                const r2 = dx*dx + dy*dy + 10;

                if(r2 < 400) continue;

                const r = Math.sqrt(r2);
                const E_mag = k * c.q /r2;

                Ex += E_mag * dx /r;
                Ey += E_mag * dy/r;
            }

            const mag = Math.sqrt(Ex*Ex + Ey*Ey);
            if(mag < 0.5) continue;

            const scale = Math.min(gridSpacing * arrowScale, mag * 0.05);
            const ex = Ex / mag * scale;
            const ey = Ey / mag * scale;

            const alpha = Math.min(0.7, mag * 0.002);
            ctx.strokeStyle = 'rgba(240, 147, 251, ' + alpha + ')';
            ctx.fillStyle = 'rgba(240, 147, 251, ' + alpha + ')';

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ex, y + ey);
            ctx.stroke();

            const angle = Math.atan2(ey, ex);
            const headLen = 4;
            ctx.beginPath();
            ctx.moveTo(x + ex, y + ey);
            ctx.lineTo(
                x + ex - headLen * Math.cos(angle - Math.PI/6),
                y + ey - headLen * Math.sin(angle - Math.PI/6)
            );
            ctx.moveTo(x + ex, y + ey);
            ctx.lineTo(
                x + ex - headLen * Math.cos(angle + Math.PI/6),
                y + ey - headLen * Math.sin(angle + Math.PI/6)
            );
            ctx.stroke();
        }
    }
}



animate();
console.log('animation started!');