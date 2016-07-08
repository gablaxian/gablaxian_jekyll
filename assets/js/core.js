
;(function(window) {
    "use strict"

    const Core = {
        init() {
            // state
            this.paused                 = false;

            // FPS management
            this.fps                    = 24;
            this.animationUpdateTime    = 1000 / this.fps;
            this.timeSinceLastFrameSwap = 0;
            this.now                    = 0;
            this.lastTime               = window.performance.now();
            this.elapsed                = 0;

            // Events
            window.addEventListener('resize', this.onResize.bind(this));
            window.addEventListener('scroll', this.onScroll.bind(this));

            // the loop
            window.addEventListener('load', this.loop.bind(this));
        },

        onResize() {},

        onScroll() {},

        loop() {
            this.now        = window.performance.now();
            this.elapsed    = (this.now - this.lastTime);

            this.timeSinceLastFrameSwap += this.elapsed;
            this.lastTime = now;

            if( this.timeSinceLastFrameSwap >= this.animationUpdateTime ) {
                // do the things
                //

                // reset the timer
                this.timeSinceLastFrameSwap = 0;
            }

            requestAnimationFrame(this.loop.bind(this));
        }
    }

    window.Core = Core;

})(window);
