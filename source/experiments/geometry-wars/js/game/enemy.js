
'use strict';

let Enemy = {

    init(type='', x=0, y=0) {
        //
        if( type == '' )
            return false;

        this.type           = type;
        this.posX           = x;
        this.posY           = y;

        this.width          = ENEMIES[type].width;
        this.height         = ENEMIES[type].height;
        this.color          = ENEMIES[type].color;
        this.points         = ENEMIES[type].points;

        //
        this.health         = 1;
        this.damage         = 1;

        this.state          = ENTITY_STATE.SPAWNING;

        // physics
        this.speed          = 0.2;
        this.angle          = 0;
        this.velocity       = [0,0];
        this.friction       = 0.9;

        //
        this.totalTime      = 0;

        // animation vars
        this.scaleFactor    = 1;
        this.opacity        = 1;

        //
        this.canvas         = document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');

        this.canvas.width   = this.width;
        this.canvas.height  = this.height;

        this.drawBase(this.context);

        return this;
    },

    isDead() { return this.state == ENTITY_STATE.DEAD },

    /***********************************
     *
     **********************************/

    getCenterPoint() {
        return {
            x: this.posX + (this.width/2),
            y: this.posY + (this.height/2)
        }
    },

    getX() {
        return this.getCenterPoint().x;
    },

    getY() {
        return this.getCenterPoint().y;
    },

    setX(x) {
        this.posX = x;
    },

    setY(y) {
        this.posY = y;
    },

    setCenterPos(x, y) {
        this.setX( x - (this.width/2) );
        this.setY( y - (this.height/2) );
    },

    getCollisionRect() {
        return {
            x1: this.posX,
            y1: this.posY,
            x2: this.posX + this.width,
            y2: this.posY + this.height
        }
    },


    /***********************************
     *
     **********************************/

    attack() {
        //
    },

    hurt() {
        if( (this.health -= Game.player.damage) <= 0 ) {
            this.kill();
            return;
        }
    },

    kill() {
        ParticleGenerator.generate(this.getCenterPoint().x, this.getCenterPoint().y, 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')');
        Eventer.dispatch('enemy_kill', 100, this.getCenterPoint().x, this.getCenterPoint().y);
        this.die();
    },

    die() {
        this.state = ENTITY_STATE.DEAD;
    },

    animate(elapsed) {
        //
    },

    update(elapsed) {
        this.totalTime += elapsed;

        switch( this.state ) {

            case( ENTITY_STATE.SPAWNING ):

                // animate into being
                this.scaleFactor    += 0.055;
                this.opacity        -= 0.055;

                // repeat
                if( this.scaleFactor >= 2 ) this.scaleFactor    = 1;
                if( this.opacity <= 0 )     this.opacity        = 1;

                // change state after 1 sec
                if( this.totalTime >= 1000 )
                    this.state = ENTITY_STATE.TRAVELLING;

                break;

            case( ENTITY_STATE.TRAVELLING ):

                let { x: eX, y: eY }  = this.getCenterPoint();
                let { x: pX, y: pY }  = Game.player.getCenterPoint();

                let dX = eX - pX;
                let dY = eY - pY;

                if( dX < 0 ) this.velocity[0] -= this.speed;
                if( dX > 0 ) this.velocity[0] += this.speed;
                if( dY < 0 ) this.velocity[1] -= this.speed;
                if( dY > 0 ) this.velocity[1] += this.speed;

                this.posX -= this.velocity[0];
                this.posY -= this.velocity[1];

                // add drag
                this.velocity[0] *= this.friction;
                this.velocity[1] *= this.friction;

                if( this.type == 'pinwheel' ) {
                    this.angle += 0.1;
                }


                // keep entity within screen bounds
                if( this.posX < 0 ) this.posX = 0;
                if( this.posX > SCREEN_WIDTH - this.width ) this.posX = (SCREEN_WIDTH - this.width);
                if( this.posY < 0 ) this.posY = 0;
                if( this.posY > SCREEN_HEIGHT - this.width ) this.posY = (SCREEN_HEIGHT - this.height);

                break;

            case( ENTITY_STATE.DEAD ):
                // death animation
                break;

        }

    },

    drawBase(context) {

        context.save();

            context.strokeStyle     = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')';
            context.shadowColor     = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')';
            context.shadowBlur      = 6;
            context.shadowOffsetX   = 0;
            context.shadowOffsetY   = 0;

            context.beginPath();
            context.lineWidth = 2;

            for (var i = 0; i < this.points.length; i++) {
                var pointStart  = this.points[i];
                var pointEnd    = (i == this.points.length-1) ? this.points[0] : this.points[i+1];
                context.moveTo(pointStart[0]*3, pointStart[1]*3);
                context.lineTo(pointEnd[0]*3, pointEnd[1]*3);
            }

            context.closePath();
            context.stroke();

        context.restore();
    },

    draw(context) {

        // if( DEBUG ) {
        //     // draw floorspace rectangle
        //     context.fillStyle = 'rgba(128,0,0,0.5)';
        //     context.fillRect( this.posX|0, this.posY|0, this.width, this.height );
        // }

        switch( this.state ) {

            case(ENTITY_STATE.SPAWNING):

                context.save();
                    context.translate(this.posX, this.posY);

                    context.save();
                        context.translate(this.width/2, this.height/2);
                        context.scale(this.scaleFactor, this.scaleFactor);
                        context.translate(-this.width/2, -this.height/2);
                        context.globalAlpha = this.opacity;

                        context.drawImage(this.canvas, 0, 0, this.width, this.height);
                    context.restore();
                context.restore();

                break;

            case(ENTITY_STATE.TRAVELLING):
                context.save();
                    context.translate(this.posX, this.posY);

                    if( this.type == 'pinwheel' ) {
                        context.save();
                            // rotate
                            context.translate(this.width/2, this.height/2);
                            context.rotate( this.angle );
                            context.translate(-this.width/2, -this.height/2);
                            this.drawBase(context);
                        context.restore();
                    }
                    else {
                        this.drawBase(context);
                    }
                context.restore();
                break;

            case(ENTITY_STATE.DEAD):
                //
                break;
        }
    }

};
