// Tokamak plasma confinement simulator
// Control toroidal and poloidal magnetic fields to contain plasma

let tokamakMode = false;
let plasmaParticles = [];
let B_toroidal = 0;    // toroidal magnetic field strength
let B_poloidal = 0;    // poloidal magnetic field strength
let turbulence = 0.2;  // plasma instability
let integrity = 100;   // reactor integrity percentage

const tokamak_center_x = 400;
const tokamak_center_y = 300;
const tokamak_major_radius = 150;  // major radius of torus
const tokamak_minor_radius = 80;   // minor radius

class PlasmaParticle {
    constructor(angle, r_offset) {
        // Start in toroidal configuration
        this.angle = angle;  // toroidal angle
        this.r_offset = r_offset;  // offset from major radius
        
        const R = tokamak_major_radius + r_offset;
        this.x = tokamak_center_x + R * Math.cos(angle);
        this.y = tokamak_center_y + R * Math.sin(angle);
        
        this.vx = 0;
        this.vy = 0;
        this.temp = 1.0;  // temperature (for color)
    }
    
    update() {
        // Calculate position relative to torus center
        const dx = this.x - tokamak_center_x;
        const dy = this.y - tokamak_center_y;
        const r = Math.sqrt(dx*dx + dy*dy);
        
        // Distance from ideal confinement radius
        const r_ideal = tokamak_major_radius;
        const deviation = r - r_ideal;
        
        // Lorentz force from magnetic fields
        // Toroidal field (around the torus) - provides stability
        // Poloidal field (around the minor radius) - provides confinement
        
        // Toroidal force (tangential)
        const angle = Math.atan2(dy, dx);
        const F_tor_x = -Math.sin(angle) * B_toroidal * 0.5;
        const F_tor_y = Math.cos(angle) * B_toroidal * 0.5;
        
        // Poloidal force (radial confinement)
        const F_pol_x = -dx / r * B_poloidal * deviation * 0.01;
        const F_pol_y = -dy / r * B_poloidal * deviation * 0.01;
        
        // Apply forces
        this.vx += F_tor_x + F_pol_x;
        this.vy += F_tor_y + F_pol_y;
        
        // Turbulence (plasma instability)
        this.vx += (Math.random() - 0.5) * turbulence;
        this.vy += (Math.random() - 0.5) * turbulence;
        
        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Temperature based on confinement quality
        const dist_from_ideal = Math.abs(deviation);
        this.temp = 1.0 - Math.min(1.0, dist_from_ideal / 100);
        
        // Check if escaped containment
        if(r < tokamak_major_radius - tokamak_minor_radius - 20 ||
           r > tokamak_major_radius + tokamak_minor_radius + 20) {
            return false;  // particle lost
        }
        
        return true;  // particle contained
    }
    
    draw() {
        // Color based on temperature
        const red = Math.floor(255 * (1 - this.temp));
        const green = Math.floor(100 * this.temp);
        const blue = Math.floor(255 * this.temp);
        
        ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Spawn plasma particles in toroidal configuration
function spawnPlasma() {
    plasmaParticles = [];
    const numParticles = 300;
    
    for(let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2;
        const r_offset = (Math.random() - 0.5) * 60;  // distribute in minor radius
        
        plasmaParticles.push(new PlasmaParticle(angle, r_offset));
    }
    
    console.log('spawned ' + numParticles + ' plasma particles');
}

// Draw tokamak reactor walls
function drawTokamak() {
    // Outer wall
    ctx.strokeStyle = 'rgba(100,100,100,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tokamak_center_x, tokamak_center_y, 
            tokamak_major_radius + tokamak_minor_radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner wall
    ctx.beginPath();
    ctx.arc(tokamak_center_x, tokamak_center_y,
            tokamak_major_radius - tokamak_minor_radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ideal confinement ring
    ctx.strokeStyle = 'rgba(0,255,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(tokamak_center_x, tokamak_center_y,
            tokamak_major_radius, 0, Math.PI * 2);
    ctx.stroke();
}

// Draw control panel
function drawTokamakControls() {
    // Background panel
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, 40, 220, 180);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    
    let y = 60;
    
    // Integrity
    const intColor = integrity > 70 ? '#0f0' : (integrity > 30 ? '#ff0' : '#f00');
    ctx.fillStyle = intColor;
    ctx.fillText('INTEGRITY: ' + integrity.toFixed(1) + '%', 20, y);
    
    // Integrity bar
    ctx.fillStyle = intColor;
    ctx.fillRect(20, y + 5, integrity * 1.8, 8);
    ctx.strokeStyle = intColor;
    ctx.strokeRect(20, y + 5, 180, 8);
    
    y += 35;
    ctx.fillStyle = '#0f0';
    ctx.fillText('B toroidal: ' + B_toroidal.toFixed(2) + ' T', 20, y);
    
    y += 20;
    ctx.fillText('B poloidal: ' + B_poloidal.toFixed(2) + ' T', 20, y);
    
    y += 20;
    ctx.fillText('Turbulence: ' + turbulence.toFixed(2), 20, y);
    
    y += 20;
    ctx.fillText('Particles: ' + plasmaParticles.length, 20, y);
    
    y += 25;
    ctx.fillStyle = '#0aa';
    ctx.font = '11px Courier New';
    ctx.fillText('1/2: B_tor  3/4: B_pol', 20, y);
    y += 15;
    ctx.fillText('5/6: Turbulence', 20, y);
    y += 15;
    ctx.fillText('R: Reset plasma', 20, y);
}

// Keyboard controls for tokamak
function setupTokamakKeys() {
    document.addEventListener('keydown', (e) => {
        if(currentMode !== 'tokamak') return;
        
        switch(e.key) {
            case '1':
                B_toroidal = Math.max(0, B_toroidal - 0.1);
                console.log('B_tor: ' + B_toroidal.toFixed(2));
                break;
            case '2':
                B_toroidal = Math.min(3, B_toroidal + 0.1);
                console.log('B_tor: ' + B_toroidal.toFixed(2));
                break;
            case '3':
                B_poloidal = Math.max(0, B_poloidal - 0.1);
                console.log('B_pol: ' + B_poloidal.toFixed(2));
                break;
            case '4':
                B_poloidal = Math.min(3, B_poloidal + 0.1);
                console.log('B_pol: ' + B_poloidal.toFixed(2));
                break;
            case '5':
                turbulence = Math.max(0, turbulence - 0.05);
                console.log('turbulence: ' + turbulence.toFixed(2));
                break;
            case '6':
                turbulence = Math.min(1, turbulence + 0.05);
                console.log('turbulence: ' + turbulence.toFixed(2));
                break;
            case 'r':
            case 'R':
                spawnPlasma();
                integrity = 100;
                console.log('plasma reset');
                break;
        }
    });
}

setupTokamakKeys();

console.log('tokamak simulator loaded');
