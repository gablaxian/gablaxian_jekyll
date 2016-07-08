
;(function(window) {
    "use strict"

    // mustard cuttah
    if( !('visibilityState' in document) ) {
        return;
    }

    var Fez = {

        init(options={}) {

            this.canvas                 = options.element || document.querySelector('.Starfield');
            this.context                = this.canvas.getContext('2d');

            this.fps                    = 24;
            this.animationUpdateTime    = 1000 / this.fps;
            this.timeSinceLastFrameSwap = 0;

            this.canvas_width           = options.width         || window.innerWidth;
            this.canvas_height          = options.height        || 80;
            this.star_density           = options.star_density  || 3;
            this.speed                  = options.speed         || 4;
            this.stars_length           = 0;
            this.paused                 = false;

            this.scrollY                = 0;
            this._resizeID;

            //
            this.generateStars();
            this.populateStarfield();

            // Events
            window.addEventListener('resize', this.onResize.bind(this));
            window.addEventListener('scroll', this.onScroll.bind(this));

            // Start the animation!
            this.lastTime = window.performance.now();
            window.requestAnimationFrame(this.animate.bind(this));
        },

        /**
            generate_stars

            Setup the stars
            Two types.
            1. Background stars. Static, dark grey (between 0.1 - 0.5 transparency)
            2. Flickering. Set up an array of randomly placed stars with random opacities.
        **/
        generateStars() {
            "use asm"

            // number of stars is determined by a star density. Break up the canvas into a grid of 100x100px. Density is the number of stars per block. So, parts per thousand, effectively.
            this.stars_length = ( ((this.canvas_width / 100) |0) * (this.canvas_height / 100).toFixed(1) * this.star_density ) |0;

            this.background_stars = new Array(this.stars_length);
            this.flickering_stars = new Array(this.stars_length);

            // Setup the star arrays
            for (var i = 0; i < this.stars_length; i++) {
                // for the background stars, don't bother with opacity, instead we want a 'brightness' between off-black and half-white (28-128) value.
                this.background_stars[i] = {
                    x: (Math.random() * this.canvas_width) |0,
                    y: (Math.random() * this.canvas_height) |0,
                    w: (Math.random() < 0.5 ? 2 : 1 ),
                    b: (28 + Math.random() * 100) |0
                };
                this.flickering_stars[i] = {
                    x: (Math.random() * this.canvas_width) |0,
                    y: (Math.random() * this.canvas_height) |0,
                    w: (Math.random() < 0.5 ? 2 : 1 ),
                    b: (5 + Math.random() * 255) |0,
                    s: (Math.random() < 0.5 ? 0 : 1 )
                };
            }

        },

        populateStarfield() {
            this.canvas.width    = this.canvas_width;
            this.canvas.height   = this.canvas_height;

            /* Just one loop */
            for (var i = 0; i < this.stars_length; i++) {
                this.context.fillStyle = 'rgb('+ this.background_stars[i].b +','+ this.background_stars[i].b +','+ this.background_stars[i].b +')';
                this.context.fillRect( this.background_stars[i].x, this.background_stars[i].y, 2, 2);
            }
        },

        onResize() {
            clearTimeout(this._resizeID);

            this._resizeID = setTimeout(() => {
                this.canvas_width = window.innerWidth;

                this.generateStars();
                this.populateStarfield();
            }, 100);
        },

        onScroll() {
            this.scrollY    = window.pageYOffset;
            this.paused     = ( this.scrollY > this.canvas_height ) ? true : false;
        },

        render() {

            /* For flickering stars, on each loop increase the opacity by 0.1 until fully opaque then back to fully transparent. When fully transparent, set to a new random position */

            // draw stars
            for(var i = 0; i < this.stars_length; i++) {

                // Flickering stars
                var star = this.flickering_stars[i];

                // if the star is glowing
                if (star.s == 1) {
                    if(star.b < 255)
                        star.b += this.speed;
                    else {
                        star.s = 0;
                        star.b -= this.speed;
                    }
                }
                else {
                    if(star.b > 55)
                        star.b -= this.speed;
                    else {
                        star.s = 1;
                        star.b += this.speed;
                    }
                }

                // clear only the areas where stars appear. Just paint the affected area black.
                this.context.fillStyle = 'rgb('+star.b+','+star.b+','+star.b+')';
                this.context.fillRect(star.x, star.y, star.w, star.w);
            };
        },


        animate() {
            var now     = window.performance.now();
            var elapsed = (now - this.lastTime);

            this.timeSinceLastFrameSwap += elapsed;
            this.lastTime = now;

            // console.log(this.timeSinceLastFrameSwap, this.animationUpdateTime);
            if( this.timeSinceLastFrameSwap >= this.animationUpdateTime ) {

                // if( !this.paused ) {
                    this.render();
                // }

                this.timeSinceLastFrameSwap = 0;
            }

            window.requestAnimationFrame(this.animate.bind(this));
        }
    }

    window.addEventListener('load', () => {
        requestAnimationFrame(() => {
            var height = parseInt( window.getComputedStyle( document.querySelector('.Page-masthead') )['height'] );

            Fez.init({
                element: document.querySelector('.Starfield'),
                height: height
            });
        });
    });


})(window);
