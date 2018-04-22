
'use strict';

let Player = {

    init(x, y) {

        this.posX               = x;
        this.posY               = y;
        this.width              = 30;
        this.height             = 30; // mostly used for entity collision
        this.color              = 'rgb(255,255,255)';

        //
        this.speed              = 5;
        this.velocity           = [0,0];
        this.lives              = 1;
        this.health             = 16;
        this.damage             = 2;

        this.shotDelay          = 100; // ms
        this.timeSinceLastShot  = 0;

        // states (this is a truly horrible way to handle states)
        this.state              = ENTITY_STATE.TRAVELLING;

        this.allowAttack        = true;
    },


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

     attack(vel=[0,-1]) {

         if( this.timeSinceLastShot > this.shotDelay ) {
             Game.addBullet( this.getCenterPoint().x, this.getCenterPoint().y, vel);
             this.timeSinceLastShot = 0;
         }
     },

    resetAttack() {
        this.allowAttack = true;
    },

    hurt() {},

    kill() {
        ParticleGenerator.generate(this.getCenterPoint().x, this.getCenterPoint().y, 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')');
        this.lives--;

        this.state = ENTITY_STATE.DEAD;
    },

    update(elapsed) {
        this.timeSinceLastShot += elapsed;

        if( Game.state == GAME_STATE.PLAYING && this.state != ENTITY_STATE.DEAD ) {

            this.velocity = [0,0];

            if( Input.gamepad ) {
                this.velocity[0] = Math.abs(Input.gamepad.axes[0]) > 0.2 ? Input.gamepad.axes[0] : this.velocity[0];
                this.velocity[1] = Math.abs(Input.gamepad.axes[1]) > 0.2 ? Input.gamepad.axes[1] : this.velocity[1];

                // attack
                if( Math.abs(Input.gamepad.axes[2]) + Math.abs(Input.gamepad.axes[3]) > 0.9 ) {
                    this.attack( [Input.gamepad.axes[2], Input.gamepad.axes[3]] );
                }
            }
            else {
                if( Input.isPressed('UP') )     this.velocity[1] = -1;
                if( Input.isPressed('DOWN') )   this.velocity[1] = 1;
                if( Input.isPressed('LEFT') )   this.velocity[0] = -1;
                if( Input.isPressed('RIGHT') )  this.velocity[0] = 1;

                if( Input.isPressed('SHOOTUP') )    this.attack( [0,-1] );
                if( Input.isPressed('SHOOTLEFT') )  this.attack( [-1,0] );
                if( Input.isPressed('SHOOTDOWN') )  this.attack( [0,1] );
                if( Input.isPressed('SHOOTRIGHT') ) this.attack( [1,0] );
            }

            this.posX += this.velocity[0] * this.speed;
            this.posY += this.velocity[1] * this.speed;

            // keep player within screen bounds
            if( this.posX < 0 ) this.posX = 0;
            if( this.posX > SCREEN_WIDTH - this.width ) this.posX = (SCREEN_WIDTH - this.width);
            if( this.posY < 0 ) this.posY = 0;
            if( this.posY > SCREEN_HEIGHT - this.width ) this.posY = (SCREEN_HEIGHT - this.height);

        }

    },

    draw(context) {

        if( this.state != ENTITY_STATE.DEAD ) {

            let points = [[3,3],[0,6],[5,10],[10,6],[7,3],[9,6],[5,8.5],[1,6]];

            // draw
            context.save();

            context.lineWidth       = 2;
            context.strokeStyle     = this.color;
            context.shadowColor     = this.color;
            context.shadowBlur      = 10;
            context.shadowOffsetX   = 0;
            context.shadowOffsetY   = 0;

            context.translate( this.posX, this.posY );

            context.save();

            context.translate(this.width/2, this.height/2);
            context.rotate( Math.atan2(this.velocity[0],-this.velocity[1]) );
            context.translate(-this.width/2, -this.height/2);

            context.beginPath();

            for(var i = 0; i < points.length; i++) {
                var point = points[i];
                if(i == 0) {
                    context.moveTo(point[0]*3, point[1]*3);
                }
                context.lineTo(point[0]*3, point[1]*3);
            }

            context.closePath();
            context.stroke();

            context.restore();
            context.restore();

        }

    }
};
