
'use strict';

const Bullet = {

    init(x=0, y=0, vel=[0,0]) {

        this.posX       = x;
        this.posY       = y;

        this.width      = 6;
        this.height     = 12;
        this.color      = 'rgb(255,255,155)';

        //
        this.state      = 1;
        this.speed      = 8;
        this.angle      = 0;
        this.velocity   = vel;

        return this;
    },

    ///////

    isDead() {
        return this.state == 0;
    },

    ///////

    getCollisionRect() {
        return {
            x1: this.posX,
            y1: this.posY,
            x2: this.posX + this.width,
            y2: this.posY + this.height
        }
    },

    getX() {
        return this.posX;
    },

    getY() {
        return this.posY;
    },

    ////////

    destroy() {
        this.state = 0;
    },

    update(elapsed) {
        this.posX += this.velocity[0] * this.speed;
        this.posY += this.velocity[1] * this.speed;

        // check for out-of-bounds and destroy
        if(
            this.posY + this.height < 0 ||
            this.posX + this.width  < 0 ||
            this.posY > SCREEN_HEIGHT   ||
            this.posX > SCREEN_WIDTH
        ) {
            ParticleGenerator.generate(this.posX, this.posY, this.color);
            this.destroy();
        }
    },

    draw(context) {
        context.save();

            context.translate(this.posX, this.posY);

            context.save();
                context.fillStyle       = this.color;
                context.lineWidth       = 2;
                context.shadowColor     = this.color;
                context.shadowBlur      = 10;
                context.shadowOffsetX   = 0;
                context.shadowOffsetY   = 0;

                // rotate
                context.translate(this.width/2, this.height/2);
                context.rotate( Math.atan2(this.velocity[0], -this.velocity[1]) );
                context.translate(-this.width/2, -this.height/2);

                // draw
                context.beginPath();
                context.moveTo(3,0);
                context.lineTo(6,12);
                context.lineTo(0,12);
                context.closePath();

                context.fill();

            context.restore();

        context.restore();
    }
}
