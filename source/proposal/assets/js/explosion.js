
'use strict';

let Explosion = {

    init(x, y) {
        this.img            = Game.spritesheets['enemies'].img;

        //
        this.x              = x |0;
        this.y              = y |0;
        this.width          = 48;
        this.height         = 48;

        this._state         = 1;        // 1 = playing, 0 = finished

        this.sequenceIdx    = 0;
        this.sequence       = [0,1,2];
        this.offsetX        = 0;
        this.offsetY        = 391;

        //
        this.fps                    = 7;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        Game.audio['explosion-sm'].currentTime = 0;
        Game.audio['explosion-sm'].play();
    },

    getY() {
        return this.y;
    },

    isFinished() {
        return this._state == 0;
    },

    animate(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            // advance the sequence until it reaches the end, then reset.
            if( this.sequenceIdx < this.sequence.length - 1 ) {
                this.sequenceIdx += 1;
            }
            else {
                this._state = 0; // kill it.
            }

            // calculate the spritesheet offsets.
            this.offsetX = (this.sequence[this.sequenceIdx] * this.width);

            // reset the frame swap counter.
            this.timeSinceLastFrameSwap = 0;
        }

    },

    update(elapsed) {
        this.animate(elapsed);
    },

    draw(context) {

        if( DEBUG ) {
            //
        }

        context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, (this.x-(this.width/2)), (this.y-(this.height/2)), this.width, this.height);
    }
}
