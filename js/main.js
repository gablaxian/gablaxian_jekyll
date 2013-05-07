"use strict"

var canvas  = document.getElementById('starfield'),
    context = canvas.getContext('2d'),
    canvas_width   = window.innerWidth,
    canvas_height  = 150,
    background_stars = new Array(),
    flickering_stars = new Array();


// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function generate_stars() {
    // Setup the star arrays
    for (var i = 0; i < 150; i++) {
        // for the background stars, don't bother with opacity, instead we want a 'brightness' between full black and half-white (0-128) value.
        background_stars.push( { x: Math.round(Math.random() * canvas_width), y: Math.round(Math.random() * canvas_height), brightness: Math.round(Math.random() * 128) } );
        flickering_stars.push( { x: Math.round(Math.random() * canvas_width), y: Math.round(Math.random() * canvas_height), brightness: Math.round(Math.random() * 255), state: ( Math.random() < 128 ? 'fading' : 'glowing' ) } );
    }
}

function init() {
    "use asm"

    if(window.localStorage) {
        if( localStorage.getItem('background_stars') ) {
            background_stars = JSON.parse( localStorage.getItem('background_stars') );
            flickering_stars = JSON.parse( localStorage.getItem('flickering_stars') );
        }
        else {
            generate_stars();
            // Store the arrays
            localStorage.setItem('background_stars', JSON.stringify(background_stars));
            localStorage.setItem('flickering_stars', JSON.stringify(flickering_stars));
        }
    }
    else {
        generate_stars();
    }

    canvas.width = canvas_width;
    canvas.height = canvas_height;

    // set up the bg and static stars
    // set the black BG
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas_width, canvas_height);

    var l = background_stars.length,
        i = 0;
    
    /* Just one loop */
    for (; i < l; i++) {
        context.fillStyle = 'rgb('+background_stars[i].brightness+','+background_stars[i].brightness+','+background_stars[i].brightness+')';
        context.fillRect(background_stars[i].x, background_stars[i].y, 2, 2);
    }

    window.addEventListener( 'resize', onWindowResize, false );
}


function animate() {
    requestAnimFrame( animate );
    render();
}

function onWindowResize() {
    canvas_width = window.innerWidth;
    canvas.width = canvas_width;

    init();
}

function render() {

    /*  
        Setup the stars
        Two types.
        1. Background stars. Static, dark grey (between 0.1 - 0.5 transparency)
        2. Flickering. Set up an array of randomly placed stars with random opacities.

        For flickering stars, on each loop increase the opacity by 0.1 until fully opaque then back to fully transparent. When fully transparent, set to a new random position
    */

    // draw stars
    var l = flickering_stars.length,
        i = 0,
        speed = 2;
    
    /* Just one loop */
    for (; i < l; i++) {
    
        // Flickering stars
        var star = flickering_stars[i];

        if (star.state == 'glowing') {
            if(star.brightness < 255)
                star.brightness += speed;
            else {
                star.state = 'fading';
                star.brightness -= speed;
            }
        }
        else {
            if(star.brightness > 2)
                star.brightness -= speed;
            else {
                star.state = 'glowing';
                star.brightness += speed;
            }
        }

        // clear only the areas where stars appear. Just paint the affected area black.
        context.fillStyle = 'rgb('+star.brightness+','+star.brightness+','+star.brightness+')';
        context.fillRect(star.x, star.y, 2, 2);
    };
}

init();
animate();


