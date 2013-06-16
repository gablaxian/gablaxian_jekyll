---
layout: template
title: Handling User Input
disqus: true
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

The solution to this is to not depend on the keydown event to fire repeatetedly, but instead use it, along with keyup, to act as a sort of trigger. We know that when a key is pressed an event fires immediately, and the same with releasing a key. So, we set a listener for both those events and simply use a variable to store a sort of on or off value to represent whether it is being pressed or not. On each loop of the game loop, we just check those variables. I actually came across this technique when viewing the source for Ben Joffe's [Canvascape Demo](http://www.benjoffe.com/code/demos/canvascape/textures), so all credit goes to him for this solution.

First we set another global variable, `key`

    var canvas  = document.getElementById('super-js-adventure'),
        ctx     = canvas.getContext('2d'),
        width   = 256,
        height  = 224,
        key     = [0,0,0,0,0],
        link    = new Image();

It's an array of the five keys we're currently interested in, Up, Down, Left, Right and Space, all initialised at 0, for off. If we used the variable to only store which key was being pressed, then we couldn't react to simultaneous key presses, like Down and Right, preventing our character from moving diagonally. We _could_ use a variable per key, but this works well enough and keeps our code a little leaner.

We then add a function to set the values of this array with the appropriate keys:

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

Putting all that together with our game, we'll get our little Link moving around. Currently, we have the Link image being statically drawn at 20px left and 20px down. First there needs to be a way of storing his position for us to manipulate. We can do that with a new global variable:

    var player  = {
        x : 0,
        y : 0
    };

I'm using a JSON object so we can keep everything related to the player nice and enclosed. We can read/write their position with `player.x` and `player.y`

We'll give Link a bit more space to begin with by setting his initial position to 100px left and 100px down in the `init()` function by adding:

    // Place Link a little more central
    player.x = 100;
    player.y = 100;

Now, remembering back to the Game Loop, one of its steps after clearing the screen is handling user input. So that's our next destination. On each loop of the game, we check to see if the user is pressing any keys by looking at the key array we set earlier, then we react. In this case, we look for the each of the direction keys being pressed, and alter the player's position until that key is released. For now, we'll move the player by 4px per frame in any given direction by adding this code to `main()`:

    // Handle the Input
    if (key[2]) // up
        player.y -= 4;
    if( key[3]) // down
        player.y += 4;
    if( key[0]) // left
        player.x -= 4;
    if( key[1]) // right
        player.x += 4;

Finally, we have to draw Link in the at the new coordinates on each frame, so taking the `drawImage()` function we had in the main loop, `ctx.drawImage(link, 20, 20)`, we replace it with the stored positions:

    ctx.drawImage(link, player.x, player.y);

And now we have a walking, well, gliding, Link! You can see all the [source code](http://github.com/gablaxian/super-js-adventure) on Github.
