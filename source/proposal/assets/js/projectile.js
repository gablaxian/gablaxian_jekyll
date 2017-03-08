
'use strict';

let Projectile = {

    init(x, y, dir='left') {
        this.img        = Game.spritesheets['shredder'].img;
        this.x          = x;
        this.y          = y;
        this.width      = 32;
        this.height     = 32;

        this._state     = 1;
        this._speed     = 5;
        this._dir       = dir;

        this.spriteProperties   = {
            'left':   { sX: 8,  sY: 464 },
            'right':  { sX: 40, sY: 464 }
        }

        this.offsetX    = this.spriteProperties[this._dir].sX;
        this.offsetY    = this.spriteProperties[this._dir].sY;
    },

    getY() {
        return this.y;
    },

    destroy() {
        this._state = 0;
    },

    isDead() {
        return this._state == 0;
    },

    update(elapsed) {
        if( this._dir == 'left' )  {
            this.x -= this._speed;
        }
        else {
            this.x += this._speed;
        }
    },

    draw(context) {
        context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, (this.getY()), this.width, this.height);
    }
}
