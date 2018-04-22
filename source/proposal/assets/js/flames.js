
'use strict';

let Flame = {
    init(x, y) {
        this.img                    = Game.spritesheets['shredder'].img;
        this.x                      = x;
        this.y                      = y;
        this.width                  = 16;
        this.depth                  = 10;

        this._state                 = 1;

        this.fps                    = 12;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        this.spriteProperties   = {
            'level1': { height: 16, sX: 160, sY: 504 },
            'level2': { height: 24, sX: 160, sY: 520 },
            'level3': { height: 32, sX: 160, sY: 544 },
        }
        this.sequenceIdx    = 0;
        this.sequence       = [0,1,2];
        this.levelIdx       = 0;
        this.levelSequence  = [1,2,3]; // levels
    },

    getCollisionRect() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.width,
            y2: this.y + this.depth
        }
    },

    getY() {
        return this.y - this.height;
    },

    isDead() {
        return this._state == 0;
    },

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            // console.log(this.levelIdx, this.levelSequence[this.levelIdx]);
            var {height, sX, sY} = this.spriteProperties['level'+this.levelSequence[this.levelIdx]];

            if( this.sequenceIdx < this.sequence.length-1 ) {
                this.sequenceIdx    += 1;
            }
            else {
                this.sequenceIdx    = 0;

                if( this.levelIdx < this.levelSequence.length-1 ) {
                    this.levelIdx       += 1;
                }
                else {
                    this._state         = 0;
                }
            }

            var col = this.sequenceIdx % this.width;

            this.height     = height;
            this.offsetX    = (col * this.width) + sX;
            this.offsetY    = sY;

            this.timeSinceLastFrameSwap = 0;
        }
    },

    draw(context) {
        context.save();
        context.globalAlpha = 0.8;
        context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.getY(), this.width, this.height);
        context.restore();
    },
}

let Flames = {
    init(x, y, dir='right') {
        this.x                      = x;
        this.y                      = y;
        this._dir                   = dir;
        this._state                 = 1;

        this.flameCount             = 0;
        this.maxFlames              = 9;
        this.flames                 = [];

        this.fps                    = 12;
        this.timeSinceLastFlame     = 0;
        this.animationUpdateTime    = 1000 / this.fps;

        // create the first flame
        this.createFlame();

        // start the sound effect
        Game.audio['fire-burning'].volume = 0.5;
        Game.audio['fire-burning'].play();
    },

    getY() {
        return this.y;
    },

    isDead() {
        return this._state == 0;
    },

    createFlame(x, y) {
        let flame = Object.create(Flame);
        flame.init(x, y);
        this.flames.push(flame);

        this.flameCount++;
    },

    update(elapsed) {
        this.timeSinceLastFlame += elapsed;

        // update all currently active flames.
        // remove any which are dead.
        for (var i = 0; i < this.flames.length; i++) {
            this.flames[i].update(elapsed);

            if( this.flames[i]._state == 0 ) {
                this.flames.splice(i, 1);
                i--;
            }
        }

        // if all flames are dead
        if( this.flames.length == 0 ) {
            this._state = 0;
        }

        // add a new flame every x times per second until we reach the max number of flames.
        if( this.timeSinceLastFlame > this.animationUpdateTime && this.flameCount < this.maxFlames ) {
            if( this._dir == 'right' ) {
                this.createFlame(this.x + ((this.flameCount-1)*16), this.y);
            }
            else {
                this.createFlame(this.x - ((this.flameCount-1)*16), this.y);
            }

            this.timeSinceLastFlame = 0;
        }
    },

    draw(context) {
        for (var i = 0; i < this.flames.length; i++) {
            this.flames[i].draw(context);
        }
    },
}
