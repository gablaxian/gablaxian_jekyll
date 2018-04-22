
'use strict';

const Particle = {

    init(x=0, y=0, vel=[0,0]) {

        this.posX       = x;
        this.posY       = y;

        this.width      = 1;
        this.height     = 12;

        //
        this.speed      = 4;
        this.color      = '#ff0';
        this.state      = 1;
        this.opacity    = 1;
        this.velocity   = [0,0];
        this.angle      = 0;

        return this;
    },

    spawn(x=0, y=0, color='') {
        this.posX       = x;
        this.posY       = y;
        this.height     = (Math.random() * 12) + 6;

        this.color      = color == '' ? this.color : color;

        this.state      = 1;
        this.opacity    = 1;
        this.velocity   = [ (Math.random()*2)-1, (Math.random()*2)-1 ];
        this.angle      = Math.atan2(this.velocity[0],-this.velocity[1]);

        // console.log(this.velocity, this.angle);
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

        this.height     -= 0.2;
        this.opacity    -= 0.02;

        // check for out-of-bounds and rebound
        if( this.posX + this.width  < 0 )   this.velocity[0] *= -1;
        if( this.posY + this.height < 0 )   this.velocity[1] *= -1;
        if( this.posX > SCREEN_WIDTH )      this.velocity[0] *= -1;
        if( this.posY > SCREEN_HEIGHT )     this.velocity[1] *= -1;

        if( this.height < 1 || this.opacity < 0.1 ) {
            this.destroy();
        }
    },

    draw(context) {
        context.save();

            context.fillStyle       = this.color;
            context.shadowColor     = this.color;
            context.lineWidth       = 2;
            context.shadowBlur      = 10;
            context.shadowOffsetX   = 0;
            context.shadowOffsetY   = 0;

            context.translate(this.posX, this.posY);

            context.save();

                // context.globalCompositeOperation = 'overlay';
                context.globalAlpha = this.opacity;

                // rotate
                context.translate(this.width/2, this.height/2);
                context.rotate(this.angle);
                context.translate(-this.width/2, -this.height/2);

                // draw
                context.fillRect(0, 0, this.width, this.height);
            context.restore();

        context.restore();
    }
}
