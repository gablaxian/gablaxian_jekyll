
'use strict';

var Timeline = function(options) {
    var options = options || {};

    this._state         = 0;    // 0 = paused, 1 = playing, 2 = finished.
    this._totalDuration = 0;
    this._totalTime     = 0;
    this._tweenQueue    = [];
    this._triggers      = [];
    this._triggeredIdx  = 0;


    /***** Functions *****/

    this.add = function(value, position) {

        // If it's already a Tween then add it like normal
        if( value instanceof Tween ) {
            this._tweenQueue.push(value);

            // if no position is specified, set to current duration.
            if( position == null ) {
                this._triggers.push( this._totalDuration );
                this._totalDuration += value.duration;
            }
            // otherwise just set it to the specified position
            else {
                // TODO - handle relative positions (e.g. +=30)
                this._triggers.push( Math.round(position) );

                // if the tween is placed before the end of any previous Tweens, then the total duration will not change.
                this._totalDuration = Math.max( this._totalDuration, (position + value.duration) );
            }

        }

        // array of tweens for parallel animations
        // if( value.constructor == Array ) {
        //     for (var i = 0; i < value.length; i++) {
        //         this.add(value[i]);
        //     }
        // }

        // this._triggers.sort( (a, b) => { return a - b } );
        return this;
    }

    this.isFinished = function() {
        return this._state == 2;
    }

    this.update = function(elapsed) {
        this._totalTime += elapsed;

        // finished
        if( this._totalTime >= this._totalDuration ) {
            this._state = 2;
            if( this.onComplete ) this.onComplete();
            return;
        }

        for (var i = this._triggeredIdx; i < this._triggers.length; i++) {
            if( this._totalTime >= this._triggers[i] ) {
                this._tweenQueue[i].update(elapsed);

                if( !this._tweenQueue[i].isAnimating() ) {
                    this._triggeredIdx++;
                }
            }
            else {
                break;
            }
        }
    }

}
