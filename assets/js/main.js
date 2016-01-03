
;(function(window) {
    "use strict"

    var StarField = function(element, options) {

        var options             = options || {};

        var canvas              = element;
        var context             = canvas.getContext('2d');
        var masthead            = document.querySelector('.Page-masthead');

        var canvas_width        = options.width         || window.innerWidth;
        var canvas_height       = options.height        || 80;
        var star_density        = options.star_density  || 3;
        var speed               = options.speed         || 4;
        var force_populate      = options.force_populate || false;
        var background_stars    = [];
        var flickering_stars    = [];
        var stars_length        = 0;
        var paused              = false;

        var scrollY             = 0;
        var _resizeID;

        /**
            init
        **/

        // Does the browser support local storage? We can use it to speed up subsequent page loads by skipping the star array generation
        // and also keep star position consistent between pages. It's the little things.
        if( !force_populate && localStorage.getItem('background_stars') ) {
            background_stars = JSON.parse( localStorage.getItem('background_stars') );
            flickering_stars = JSON.parse( localStorage.getItem('flickering_stars') );

            stars_length = flickering_stars.length;
        }
        else {
            generate_stars();
        }

        populateStarfield();

        // Events
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll);

        // Start the animation!
        animate();

        /**
            generate_stars

            Setup the stars
            Two types.
            1. Background stars. Static, dark grey (between 0.1 - 0.5 transparency)
            2. Flickering. Set up an array of randomly placed stars with random opacities.
        **/
        function generate_stars() {
            "use asm"

            // number of stars is determined by a star density. Break up the canvas into a grid of 100x100px. Density is the number of stars per block. So, parts per thousand, effectively.
            var number_of_stars = ((canvas_width / 100) |0) * (canvas_height / 100).toFixed(1) * star_density;

            // Reset the arrays, otherwise during window resizing it keeps pushing more stars onto the array instead of just being the newly calculated number of stars.
            background_stars = [];
            flickering_stars = [];

            // Setup the star arrays
            for (var i = 0; i < number_of_stars; i++) {
                // for the background stars, don't bother with opacity, instead we want a 'brightness' between off-black and half-white (28-128) value.
                background_stars[i] = {
                    x: (Math.random() * canvas_width) |0,
                    y: (Math.random() * canvas_height) |0,
                    w: (Math.random() < 0.5 ? 2 : 1 ),
                    b: (28 + Math.random() * 100) |0
                };
                flickering_stars[i] = {
                    x: (Math.random() * canvas_width) |0,
                    y: (Math.random() * canvas_height) |0,
                    w: (Math.random() < 0.5 ? 2 : 1 ),
                    b: (5 + Math.random() * 255) |0,
                    s: (Math.random() < 0.5 ? 0 : 1 )
                };
            }

            localStorage.setItem('background_stars', JSON.stringify(background_stars));
            localStorage.setItem('flickering_stars', JSON.stringify(flickering_stars));

            stars_length = flickering_stars.length;
        }

        function populateStarfield() {
            canvas.width    = canvas_width;
            canvas.height   = canvas_height;

            /* Just one loop */
            for (var i = 0; i < background_stars.length; i++) {
                context.fillStyle = 'rgb('+background_stars[i].b+','+background_stars[i].b+','+background_stars[i].b+')';
                context.fillRect(background_stars[i].x, background_stars[i].y, 2, 2);
            }
        }

        function onResize() {
            clearTimeout(_resizeID);

            _resizeID = setTimeout(function() {
                canvas_width    = window.innerWidth;
                canvas_height   = parseInt(window.getComputedStyle(masthead)['height']);

                generate_stars();
                populateStarfield();
            }, 100);
        }

        function onScroll() {
            scrollY = window.pageYOffset;

            paused = ( scrollY > canvas_height ) ? true : false;
        }

        // It was nice to play around with requestAnimationFrame, but honestly, for a starfield, 60fps isn't necessary and only used more CPU power.
        // I also don't like the idea of having to add more code and time calculations simply to _reduce_ the frame rate.
        // We're not doing critical animation here, and it doesn't matter if timing isnt exact. By dropping back to setTimeout and 24fps, overall CPU
        // usage has reduced to around 10%, almost half of before.
        // Once you move off the tab, you won't get the CPU savings of RAF, but we're still checking the animation is in view when on the page and pausing accordingly.

        function animate() {
            if( !paused ) {
                render();
            }

            setTimeout(animate, 1000 / 24);
        }

        function render() {

            /* For flickering stars, on each loop increase the opacity by 0.1 until fully opaque then back to fully transparent. When fully transparent, set to a new random position */

            // draw stars
            for(var i = 0; i < stars_length; i++) {

                // Flickering stars
                var star = flickering_stars[i];

                // if the star is glowing
                if (star.s == 1) {
                    if(star.b < 255)
                        star.b += speed;
                    else {
                        star.s = 0;
                        star.b -= speed;
                    }
                }
                else {
                    if(star.b > 55)
                        star.b -= speed;
                    else {
                        star.s = 1;
                        star.b += speed;
                    }
                }

                // clear only the areas where stars appear. Just paint the affected area black.
                context.fillStyle = 'rgb('+star.b+','+star.b+','+star.b+')';
                context.fillRect(star.x, star.y, star.w, star.w);
            };
        }
    }

    var h = parseInt(window.getComputedStyle(document.querySelector('.Page-masthead'))['height']);

    StarField(document.querySelector('.Starfield'), { height: h, force_populate: true });

})(window);
