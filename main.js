const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Coulomb constant (scaled way down for canvas pixels)
const k = 5000;
const drag = 0.96;  // increased for smoother settling
const phosphor_alpha = 0.12;  // trail fade

class Particle {
    constructor(x, y, q) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.q = q;
        this.trail = [];  // phosphor trail
        this.maxTrail = 20;
    }

    applyForce(charges) {
        for (let c of charges) {
            const dx = this.x - c.x;
            const dy = this.y - c.y;
            const r2 = dx*dx + dy*dy + 10;  // was 1, now 10 (less jitter)

            if (r2 < 100) continue;  // was 0.1, now 100 (fixed jitter near charges!)
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
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    draw() {
        // Color based on velocity (faster = brighter)
        const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const brightness = Math.min(255, 100 + speed * 50);  // scale velocity to brightness
        
        if (this.trail.length > 1) {
            ctx.strokeStyle = 'rgb(0,' + Math.floor(brightness) + ',0)';
            ctx.lineWidth = 1;
            ctx.globalAlpha = phosphor_alpha;
            ctx.beginPath();

            ctx.moveTo(this.trail[0].x, this.trail[0].y);

            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }

            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = 'rgb(0,' + Math.floor(brightness) + ',0)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

console.log('particle phy loaded');

// Arrays for particles and charges
let particles = [];
let charges = [];
let particleCount = 2000;
let showFieldLines = false;  // toggle for field line visualization

function spawnParticles() {
    particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            Math.random() * 800,
            Math.random() * 600,
            0
        ));
    }
    console.log('spawned ' + particleCount + ' particles');
}

spawnParticles();

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    charges = [];
    console.log('cleared all charges');
});

// Field line toggle button
const fieldLineBtn = document.getElementById('fieldLineBtn');
fieldLineBtn.addEventListener('click', () => {
    showFieldLines = !showFieldLines;
    fieldLineBtn.textContent = showFieldLines ? 'Hide Field Lines' : 'Show Field Lines';
    console.log('field lines: ' + (showFieldLines ? 'ON' : 'OFF'));
});

// Particle count slider
const slider = document.getElementById('particleSlider');
const countLabel = document.getElementById('countLabel');

slider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    countLabel.textContent = 'Particles: ' + particleCount;
    spawnParticles();
});

// Volume slider
const volumeSlider = document.getElementById('volumeSlider');
const volumeLabel = document.getElementById('volumeLabel');

volumeSlider.addEventListener('input', (e) => {
    const vol = parseInt(e.target.value);
    volumeLabel.textContent = 'Volume: ' + vol + '%';
    if (gainNode) {
        gainNode.gain.value = vol / 100 * 0.3;  // scale to reasonable range
    }
});

// Mouse click to place charges
canvas.addEventListener('mousedown', (e) => {
    // Init audio on first user interaction
    if (!audioContext) {
        initAudio();
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Right click to remove nearest charge
    if(e.button === 2) {
        let nearestDist = 20;  // max distance to remove
        let nearestIdx = -1;
        
        for(let i = 0; i < charges.length; i++) {
            const dx = x - charges[i].x;
            const dy = y - charges[i].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
            }
        }
        
        if(nearestIdx !== -1) {
            charges.splice(nearestIdx, 1);
            console.log('removed charge at index ' + nearestIdx);
        }
        
        e.preventDefault();  // prevent context menu
        return;
    }
    
    // Left click to place charge
    const q = e.shiftKey ? -1 : 1;  // shift = negative
    
    charges.push({ x, y, q });
    console.log('placed ' + (q > 0 ? '+' : '-') + ' charge at (' + x.toFixed(0) + ', ' + y.toFixed(0) + ')');
});

// Prevent context menu on canvas
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// FPS counter
let lastTime = performance.now();
let fps = 60;

// Animation loop
function animate() {
    


    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;


    fps = Math.round(1000 / delta);
    
    // darker fade for better phosphor trails



    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, 800, 600);
    



    if (showFieldLines && charges.length > 0) {
        drawFieldVectors();
    }
    
    // Update particles


    for (let p of particles) {
        p.applyForce(charges);
        p.update();
        


        // Bounce off edges
        if (p.x < 0) p.x = 0, p.vx *= -0.5;

        if (p.x > 800) p.x = 800, p.vx *= -0.5;
        if (p.y < 0) p.y = 0, p.vy *= -0.5;

        if (p.y > 600) p.y = 600, p.vy *= -0.5;
        
        p.draw();
    }
    
    // Draw charges with better glow


    for (let c of charges) {
        const color = c.q > 0 ? '#ff0000' : '#0000ff';
        
        // Outer glow


        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();


        ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // middle glow


        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Charge core
        ctx.fillStyle = color;


        ctx.beginPath();
        ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        ctx.fill();
        

        // Label
        ctx.fillStyle = '#fff';

        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y);
    }
    
    // Draw FPS counter

    ctx.fillStyle = '#00ff00';
    ctx.font = '14px Courier New';

    ctx.textAlign = 'left';
    
    ctx.textBaseline = 'top';
    ctx.fillText('FPS: ' + fps, 10, 10);
    
    requestAnimationFrame(animate);
}





//draw vector field arrows at grid points



function drawFieldvectors() {


    const gridSpacing = 50;
    const arrowScale = 0.8;



    ctx.strokeStyle = 'rgba(0,255,0,0.4)';
    ctx.fillStyle = 'rgba(0,255,0,0.4)';

    ctx.lineWidth = 1.5;



    for(let x = gridSpacing; x < 800; x += gridSpacing) {

        for(let y = gridSpacing; y < 600; y+= gridSpacing) {


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


            ctx.beginPath();
            ctx.moveTo(x, y);

            ctx.lineTo(x + ex, y + ey);
            ctx.stroke();




            const angle = Math.atan2(ey, ex)
            const headLen = 4;
            ctx.beginPath();
            ctx.moveTo(x + ex, y+ ey);


            ctx.ineTo (

                x+ ex - headLen * Math.cos(angle - Math.PI/6),
                y + ey- headLen * Math.sin(angle - Math.PI/6)
            );




            ctx.moveTo(x + ex, y + ey);

            ctx.lineTo(

                x + ex - headLen * Math.cos(angle + Math.PI/6);
                y + ey - headLen * Math.sin(angle + Math.PI/6);

            );

            ctx.stroke();




        }
    }
}



animate();
console.log('animation started!');