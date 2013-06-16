---
layout: template
title: Handling User Input

---

# Handling User Input

Welcome back, trepid adventurer. Previously, we learnt about drawing to the screen with canvas' drawing functions. But, a game is not a game unless you can interact with it. So now we see how to handle user input.

Running a game inside the browser is both a blessing and a curse. A typical PC/Console game runs on top of everything else (with a few exceptions), so clicking the mouse or tapping a key will do nothing unless you program in a reaction to this event. In the browser, we're already in the OS _and_ the browser, so both of these get first say in what those events do until you overwrite these defaults. And we're limited to what we can control.

The first issue we're going to come across is the keypress. So, for example, if you wanted to respond to a keypress in Javascript, you'd probably start by implementing a listener, just like you've done for your websites a million times before:

    document.addEventListener('keydown', function(evt) {
        // listen for the 'up' key
        if( evt.keyCode == '38' )
            player.positionTop += 1;
    }, false);

The problem here is that the OS has some default behaviour when it comes to holding down a key. It will first fire off an event for that key, pressing it once, then it will pause for a second before repeatedly firing off that same event. I'm not sure how fast this event fires, but it looks to be around 20-25 times a second. This is not fast enough or reactive enough for a game.

The solution to this is to not depend on the keydown event to fire repeatetedly, but instead use it, along with keyup, to act as a sort of trigger. We know that when a key is pressed an event fires immediately, and the same with keyup. So, we set a listener for both those events and simply set a variable on keydown to say which key has been pressed and unset that variable when on keyup. On each loop of the game loop, we just check those variables. I actually came across this technique when viewing the source for Ben Joffe's [Canvascape Demo](http://www.benjoffe.com/code/demos/canvascape/textures), so all credit goes to him for this solution.

First we set another global variable, `key`

    var canvas  = document.getElementById('super-js-adventure'),
        ctx     = canvas.getContext('2d'),
        width   = 256,
        height  = 224,
        key     = [0,0,0,0,0],
        link    = new Image();

It's an array of the five keys we're currently interested in, Up, Down, Left, Right and Space, all initialised at 0, for off. If we only allowed the variable to store which key was being pressed, then we couldn't react to simultaneous key presses, like Down and Right, preventing our character from moving diagonally.

Then we add a function to set the values of this array with the appropriate keys:

    function changeKey(which, to) {
        switch (which){
            case 65: case 37: key[0]=to; break; // left
            case 87: case 38: key[2]=to; break; // up
            case 68: case 39: key[1]=to; break; // right
            case 83: case 40: key[3]=to; break; // down
            case 32: key[4]=to; break; // space bar;
        }
    }

Actually, this function also takes into account people who may want to use the WASD keys, typical to PC First Person Shooter games. So, keyCode 65 is 'a' and 37 is 'left'. Handy!

Now we're free to add our event handlers to call this function:

    document.onkeydown = function(e)  { changeKey((e||window.event).keyCode, 1); }
    document.onkeyup = function(e)    { changeKey((e||window.event).keyCode, 0); }
    
`document.onkeydown` is just a shorthand way of writing `addEventListener()`. Feel free to use the W3C standard, if you like. Otherwise, all that's happening is when a user presses a key we get the event (e on non-IE browsers, window.event for IE) and sends the keyCode to the `changeKey()` function. From there we check which key is pressed and set the appropriate value in the array to 1.


