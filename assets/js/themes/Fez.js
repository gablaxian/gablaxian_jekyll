
export default {

    init(options={}) {

        this.canvas                 = options.element;
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

        //
        this.generateStars();
        this.populateStarfield();
    },

    /**
        generate_stars

        Setup the stars
        Two types.
        1. Background stars. Static, dark grey (between 0.1 - 0.5 transparency)
        2. Flickering. Set up an array of randomly placed stars with random opacities.
    **/
    generateStars() {
        'use asm';

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
        this.canvas_width = window.innerWidth;

        this.generateStars();
        this.populateStarfield();
    },

    onScroll(scrollY) {
        this.paused = ( scrollY > this.canvas_height ) ? true : false;
    },

    update(elapsed) {

        /* For flickering stars, on each loop increase the opacity by 0.1 until fully opaque then back to fully transparent. When fully transparent, set to a new random position */

        for(var i = 0; i < this.stars_length; i++) {
            // Flickering stars
            var star = this.flickering_stars[i];

            // if the star is glowing
            if( star.s == 1 ) {
                if( star.b < 255 )
                    star.b += this.speed;
                else {
                    star.s = 0;
                    star.b -= this.speed;
                }
            }
            else {
                if( star.b > 55 )
                    star.b -= this.speed;
                else {
                    star.s = 1;
                    star.b += this.speed;
                }
            }
        }

    },

    draw() {
        for(var i = 0; i < this.stars_length; i++) {
            var star = this.flickering_stars[i];
            
            this.context.fillStyle = 'rgb('+star.b+','+star.b+','+star.b+')';
            this.context.fillRect(star.x, star.y, star.w, star.w);
        };
    },
};
