// Draw vector field arrows at grid points
function drawFieldVectors() {
    const gridSpacing = 50;  // pixels between arrows
    const arrowScale = 0.8;   // arrow length multiplier
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.lineWidth = 1.5;
    
    for (let x = gridSpacing; x < 800; x += gridSpacing) {
        for (let y = gridSpacing; y < 600; y += gridSpacing) {
            // Calculate E-field at this point
            let Ex = 0, Ey = 0;
            
            for (let c of charges) {
                const dx = x - c.x;
                const dy = y - c.y;
                const r2 = dx*dx + dy*dy + 10;
                
                if (r2 < 400) continue;  // skip too close to charges
                
                const r = Math.sqrt(r2);
                const E_mag = k * c.q / r2;
                
                Ex += E_mag * dx / r;
                Ey += E_mag * dy / r;
            }
            
            // Normalize and scale
            const mag = Math.sqrt(Ex*Ex + Ey*Ey);
            if (mag < 0.5) continue;  // skip weak fields
            
            const scale = Math.min(gridSpacing * arrowScale, mag * 0.05);
            const ex = Ex / mag * scale;
            const ey = Ey / mag * scale;
            
            // Draw arrow
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ex, y + ey);
            ctx.stroke();
            
            // Arrowhead
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
console.log('animation started');
