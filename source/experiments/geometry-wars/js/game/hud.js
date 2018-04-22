
'use strict';

let HUD = {

    init() {
        this.score = 0;
    },

    updateScore(score) {
        console.log('updating score...', score);
        this.score += score;
    },

    draw(context) {
        context.font        = '20px monospace';
        context.fillStyle   = 'rgb(126,255,36)';

        context.fillText('SCORE', 50, 50);
        context.fillText(this.score, 50, 75);
    }

};

let FloatingScore = {
    init(score, x=0, y=0) {
        this.x          = x;
        this.y          = y;
        this.score      = score
        this.opacity    = 1;
        this.scale      = 1;

        this._counter   = 0;
        this._state     = 1;

        return this;
    },
    isAnimating() {
        return this._state;
    },
    update(elapsed) {
        this._counter += elapsed;

        if( this._counter >= 600 ) {
            this._state     = 0;
            this._counter   = 600;
        }

        this.scale = 1 - Easing.easeInQuad(this._counter, 0, 1, 600);
    },
    draw(context) {
        context.save();
            context.translate(this.x-10, this.y);

            context.save();

                context.font        = '14px monospace';
                context.fillStyle   = 'rgb(255,255,0)';
                let width           = context.measureText(this.score).width;

                context.translate(width/2, 5);
                context.scale(this.scale, this.scale);
                context.translate(-width/2, -5);

                context.fillText(this.score, 0, 0);
            context.restore();
        context.restore();
    }
};
