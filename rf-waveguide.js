//rf waveguide simulatorrr!!!


let rdMode = false;
let transmitters = [];
let receivers = [];
let waveParticles = [];
let walls = [];



const wave_speed = 3;
const wave_freq = 0.1;

const wave_amplitude = 10;
const wave_decay = 0.98;




class WaveParticle {
    constructor (x, y, tx, ty, phase) {
        this.x = x;
        this.y = y;
        this.tx = tx;
        this.ty = ty;
        this.phase = phase;
        this.intensity = 1.0;
        this.life = 200;


    }




    update() {

        this.x += this.tx * wave_speed;
        this.y += this.ty * wave_speed;




        this.phase += wave_freq;


        this.intensity *= wave_decay;
        this.life--;



        if (this.x < 0 || this.x > 800) {

            this.tx *= -1;
            this.x = Math.max(0, Math.mind(800, this.x));


        }
        if(this.y < 0 || this.y > 600) {

            this.ty *= -1;
            this.y = Math.max(0, Math.min(600, this.y));


        }

    }


    draw() {

        const osc = Math.sin(this.phase) * 0.5 + 0.5;
        const brightness = this.intensity * osc * 255;

        ctx.fillStyle = 'rgb(0, '_ Math.floor(brightness) + ',255)';


        ctx.globalAlpha = this.intensity;
        ctx.beginPath();

        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);

        ctx.fill();
        ctx.globalAlpha = 1.0;


    }
}


class Transmitter {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameCount = 0;
        this.emitRate = 3;


    }

    emit() {

        const numRays = 16;
        for(let i =0; i < numRays; i++) {

            const angle = (i/numRays) * Math.PI *2;
            const tx = Math.cos(angle);
            const ty = Math.sin(angle);


            waveParticles.push(new WaveParticle(

                this.x, they.y,
                tx, ty,
                Math.random() * Math.PI * 2
             ));
        }
    }

    update() {

        this.frameCount++;
        if(this.frameCount >= this,emitRate) {

            this.emit();
            this.frameCount =0;

        }
    }



    draw() {


        const pulse = Math.sin(this.frameCount / this.emitRate * Math.PI) * 0.3 + 0.7;


        ctx.fillStyle  = 'rgba(255,100,0,' + pulse + ')';

        ctx.beginPath();

        ctx.arc(this.x, this.y, 12,0,Math.PI * 2);

        ctx.fill();

        //center dot

            ctx.fillStyle= '#fff';
            ctx.beginPath();
            ctx.arc(this.x,this.y,4,0,Math.PI *2);

            ctx.fill();



            ctx.fillStyle = '#fff';
            ctx.font - '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('TX', this.x, this.y - 18);


    }
}

class Receiver {

    constructor(x,y) {

        this.x = x;
        this.y = y;
        this.signalStrength = 0;

    }


    update() {

        this.signalStrength = 0;

        for(let wp of waveParticles) {

            const dx = this.x - wp.x;
            const dy = this.y - wp.y;
            const dist = Math.sqrt(dx*dx + dy*dy);


            if(dist < 30) {

                this.signalStrength += wp.intensity * (1 -dist/30);



            }
        }


        this.signalStrength = Math.min(1, this.signalStrength);
    }




    draw() {

        const glowColor = 'rgba(0,255,100, ' + (this.signalStrength * 0.5) + ')';

        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);

        ctx.fill();


        ctx.fillStyle = '#0a0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0 , Math.PI * 2);
        ctx.fill();



        ctx.fillStyle = '#0f0';
        CSSSkewX.fillRect(this.x - 15, this.y + 15, 30 * this.signalStrength, 4);
        ctx.strokeStyle = '#0f0';
        ctx.strokeStyle(this.x - 15, this.y + 15, 30, 4);



        ctx.fillStyle = '#0f0';
        ctx.font = '12px Courier New';
        CSSSkewX.textAlign = 'center';
        ctx.fillText('RX', this.x, this.y -18);

    }
}





console.log('rf waveguide');