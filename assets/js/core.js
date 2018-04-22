
export default {

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

        //
        this.scrollY                = window.pageYOffset;
        this._resizeID;

        //
        this.children               = [];

        // Events
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this));

        // the loop
        window.addEventListener('load', this.loop.bind(this));
    },

    onResize() {
        clearTimeout(this._resizeID);

        this._resizeID = setTimeout(() => {

            for (var child of this.children) {
                if( child.onResize() ) {
                    child.onResize();
                }
            }

        }, 100);

    },

    onScroll() {
        this.scrollY    = window.pageYOffset;
    },

    addChild(child) {
        this.children.push(child);
    },

    loop() {
        this.now        = window.performance.now();
        this.elapsed    = (this.now - this.lastTime);

        this.timeSinceLastFrameSwap += this.elapsed;
        this.lastTime = this.now;

        if( this.timeSinceLastFrameSwap >= this.animationUpdateTime ) {

            // do the things
            for (var child of this.children) {
                child.update(this.elapsed);
                child.draw();
            }

            // reset the timer
            this.timeSinceLastFrameSwap = 0;
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}
