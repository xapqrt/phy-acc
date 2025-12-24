let particleCount = 2000;

// Spawn particles function
function spawnParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            Math.random() * 800,
            Math.random() * 600,
            0  // neutral charge
        ));
    }
    console.log(`🧲 spawned ${particleCount} particles`);
}

spawnParticles();

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    charges = [];
    console.log('🧹 cleared all charges');
});

// Particle count slider
const slider = document.getElementById('particleSlider');
const countLabel = document.getElementById('countLabel');

slider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    countLabel.textContent = `Particles: ${particleCount}`;
    spawnParticles();
});
