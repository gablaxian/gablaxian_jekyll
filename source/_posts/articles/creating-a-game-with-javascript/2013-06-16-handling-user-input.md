---
layout: article-game-dev
title: Handling User Input
categories:
    articles
    creating-a-game-with-javascript
---

Welcome back, trepid adventurer. Previously, we learnt about drawing to the screen with `canvas`’ drawing functions. But a game is not a game unless you can interact with it. So now we see how to handle user input.

Running a game inside the browser is both a blessing and a curse. A typical PC/Console game runs on top of everything else (with a few exceptions), so clicking the mouse or tapping a key will do nothing unless you program in a reaction to this event. In the browser, we’re already in the OS _and_ the browser, so both of these get first say in what those events do until you overwrite these defaults. And we’re limited to what we can control.

The first issue we’re going to come across is the keypress. Let’s say you wanted to respond to a keypress in Javascript. You’d probably start by implementing a listener with `addEventListener`, or, if jQuery is your poison, a `$elm.on('keypress', function() {})`, just like you’ve done for your websites a million times before:

{% highlight js %}

document.addEventListener('keydown', function(evt) {
    // listen for the 'up' key
    if( evt.keyCode == '38' )
        player.positionTop += 1;
}, false);

{% endhighlight %}

The problem with this is that the OS has some default behaviour when it comes to holding down a key. It will first fire off an event for that key, pressing it once, then it will pause for a second before repeatedly firing off that same event. I’m not sure how fast this event fires, but it looks to be around 20-25 times a second. This is not fast enough or reactive enough for a game.

The solution to this is to not depend on the keydown event to fire repeatetedly, but instead use it, along with keyup, to act as a sort of trigger. We know that when a key is pressed an event fires immediately, and the same with releasing a key. So, we set a listener for both those events and simply use a variable to store a sort of on or off value to represent whether it is being pressed or not. On each loop of the game loop, we just check those variables. I actually came across this technique when viewing the source for Ben Joffe's [Canvascape Demo](http://www.benjoffe.com/code/demos/canvascape/textures), so all credit goes to him for this solution.

First we set another global variable, `key`

{% highlight js %}

var canvas  = document.getElementById('super-js-adventure');
var ctx     = canvas.getContext('2d');
var width   = 256;
var height  = 224;
var key     = [0,0,0,0,0];
var link    = new Image();

{% endhighlight %}

It’s an array of the five keys we’re currently interested in, Up, Down, Left, Right and Space, all initialised at 0, for off. If we used the variable to only store which key was being pressed, then we couldn’t react to simultaneous key presses, like Down and Right, preventing our character from moving diagonally. We _could_ use a variable per key, but this works well enough and keeps our code a little leaner.

We then add a function to set the values of this array with the appropriate keys:

{% highlight js %}

function changeKey(which, to) {
    switch (which){
        case 65: case 37: key[0]=to; break; // left
        case 87: case 38: key[2]=to; break; // up
        case 68: case 39: key[1]=to; break; // right
        case 83: case 40: key[3]=to; break; // down
        case 32: key[4]=to; break; // space bar;
    }
}

{% endhighlight %}

Actually, this function also takes into account people who may want to use the WASD keys, typical to PC First Person Shooter games. So, keyCode 65 is ‘a’ and 37 is ‘left’. Handy!

Now we’re free to add our event handlers to call this function:

{% highlight js %}

document.addEventListener('keydown', function(e) { Input.changeKey(e.keyCode, 1) });
document.addEventListener('keyup',   function(e) { Input.changeKey(e.keyCode, 0) });

{% endhighlight %}

Here, when a user presses a key we get the event and send the keyCode to the `changeKey()` function. From there we check which key is pressed and set the appropriate value in the array to 1.

Putting all that together with our game, we’ll get our little Link moving around. Currently, we have the Link image being statically drawn at 20px left and 20px down. First there needs to be a way of storing his position for us to manipulate. We can do that with a new global variable:

{% highlight js %}

var player  = {
    x : 0,
    y : 0
};

{% endhighlight %}

I’m using a Javascript object so we can keep everything related to the player nice and enclosed. We can read/write their position with `player.x` and `player.y`

We’ll give Link a bit more space to begin with by setting his initial position to 100px left and 100px down in the `init()` function by adding:

{% highlight js %}

// Place Link a little more central
player.x = 100;
player.y = 100;

{% endhighlight %}

Now, remembering back to the Game Loop, one of its steps after clearing the screen is handling user input. So that’s our next destination. On each loop of the game, we check to see if the user is pressing any keys by looking at the key array we set earlier, then we react. In this case, we look for the each of the direction keys being pressed, and alter the player’s position until that key is released. For now, we’ll move the player by 4px per frame in any given direction by adding this code to `main()`:

{% highlight js %}

// Handle the Input
if (key[2]) // up
    player.y -= 4;
if( key[3]) // down
    player.y += 4;
if( key[0]) // left
    player.x -= 4;
if( key[1]) // right
    player.x += 4;

{% endhighlight %}

Finally, we have to draw Link in the at the new coordinates on each frame, so taking the `drawImage()` function we had in the main loop, `ctx.drawImage(link, 20, 20)`, we replace it with the stored positions:

{% highlight js %}

ctx.drawImage(link, player.x, player.y);

{% endhighlight %}

And now we have a walking, well&hellip; _gliding_, Link!

## Using a Gamepad

We’re not done yet, though. The keyboard’s great and all, but I certainly didn’t play any Zelda games with a keyboard. Wouldn’t it be great to play with a controller, just like the old days? GamePad API to the rescue!

The GamePad API isn't quite finished, which does explain some of the more curious aspects of the various browsers' implementations. This code may need to be changed in future.

Chrome supports the GamePad API even in public builds. Firefox does _technically_ support the GamePad API, but only in the ‘nightlies’ which are pre-beta builds for experimental features that few people use. So we’ll be limiting our code to Chrome only in this case.

In Chrome there are no events like we get with the keyboard or mouse. There is no ‘gamepad connected’ event, or a ‘button pressed’ event. For Chrome, we have to poll every frame just to see if the joystick is still there! Even in Firefox, which does have a connected and disconnected event, you still need to actually press a button first for them to even trigger. Apprently, this is a security feature to prevent ‘finger printing’, whatever that might be. So, to re-iterate, we are definitely in beta territory. Proceed at your own peril.

If you want to explore the API a little further, there’s a great article over on [html5rocks](http://www.html5rocks.com/en/tutorials/doodles/gamepad/) which I’ve been using to implement the gamepad in this project.

So, first thing’s first. Let's move the code for all input handling out of the main Javascript and give it its own file and library, The `Input` library:

{% highlight js %}

var Input = {

}

{% endhighlight %}

We’ll give it an `init()` function to load the basics and also bring in the changeKey that we’ve already implemented for the keyboard:

{% highlight js %}

var Input = {

    init: function() {
        // Set up the keyboard events
        document.addEventListener('keydown', function(e) { Input.changeKey(e.keyCode, 1) });
        document.addEventListener('keyup',   function(e) { Input.changeKey(e.keyCode, 0) });
    },

    // called on key up and key down events
    changeKey: function(which, to) {
        switch (which){
            case 65: case 37: key[0]=to; break; // left
            case 87: case 38: key[2]=to; break; // up
            case 68: case 39: key[1]=to; break; // right
            case 83: case 40: key[3]=to; break;// down
            case 32: key[4]=to; break; // attack (space bar)
            case 91: key[5]=to; break; // use item (cmd)
            case 88: key[6]=to; break; // start (x)
            case 90: key[7]=to; break; // select (z)
        }
    }
}

{% endhighlight %}

I’ve also added a few more buttons so we are in line with the controls for the original Zelda; attack, use item, start and select, and mapped them to some keys. The extra buttons won’t do anything yet, but they’re ready for when we need them.

Okay, we’ve got the original functionality back in place. Now for the gamepad. We start with a few variables we need to track the gamepad:

{% highlight js %}

var Input = {

    gamepad: null,

    ticking: false,

    // Previous timestamps for gamepad state; used in Chrome to not bother with
    // analyzing the polled data if nothing changed (timestamp is the same
    // as last time).
    prevTimestamp: null,

{% endhighlight %}

We store the gamepad object when we find one. Ticking controls our polling so that we can start/stop polling as and when we need to. Holding the previous timestamp of the controller allows us to check if the user has disconnected their joystick.

Let’s upgrade our `init()` function to check for gamepad support and, if so, start the polling:

{% highlight js %}

init: function() {
    // Set up the keyboard events
    document.addEventListener('keydown', function(e) { Input.changeKey(e.keyCode, 1) });
    document.addEventListener('keyup',   function(e) { Input.changeKey(e.keyCode, 0) });

    // Checks Chrome to see if the GamePad API is supported.
    var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

    if(gamepadSupportAvailable) {
        // Since Chrome only supports polling, we initiate polling loop straight
        // away. For Firefox, we will only do it if we get a connect event.
        if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
            Input.startPolling();
        }
    }
},

{% endhighlight %}

We’d best get that polling code in now!

{% highlight js %}

/**
 * Starts a polling loop to check for gamepad state.
 */
startPolling: function() {
    // Don’t accidentally start a second loop, man.
    if (!Input.ticking) {
        Input.ticking = true;
        Input.tick();
    }
},

/**
 * Stops a polling loop by setting a flag which will prevent the next
 * requestAnimationFrame() from being scheduled.
 */
stopPolling: function() {
    Input.ticking = false;
},

/**
 * A function called with each requestAnimationFrame(). Polls the gamepad
 * status and schedules another poll.
 */
tick: function() {
    Input.pollStatus();
    Input.scheduleNextTick();
},

scheduleNextTick: function() {
    // Only schedule the next frame if we haven’t decided to stop via
    // stopPolling() before.
    if (Input.ticking) {
        requestAnimationFrame(Input.tick);
    }
},

/**
 * Checks for the gamepad status. Monitors the necessary data and notices
 * the differences from previous state (buttons and connects/disconnects for Chrome). If differences are noticed, asks
 * to update the display accordingly. Should run as close to 60 frames per second as possible.
 */
pollStatus: function() {
    // We're only interested in one gamepad, which is the first.
    gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

    if(!gamepad)
        return;

    // Don’t do anything if the current timestamp is the same as previous
    // one, which means that the state of the gamepad hasn’t changed.
    // The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
    if (gamepad.timestamp && (gamepad.timestamp == Input.prevTimestamp)) {
        return
    }

    Input.prevTimestamp = gamepad.timestamp;

    Input.updateKeys();
},

{% endhighlight %}

Lots of code here. If you’ve ever dabbled with scrolling events in the browser, this polling idea is generally recommended so that you’re not firing events on each scroll update. We can also pause the polling, which stops the loop, and thereby prevents unnecessary work. But the main point of the code is that `pollStatus()` function.

On each frame we get the gamepad, if one is there. And remember, no gamepad exists until it’s plugged in and a button is pressed. We also only care about one gamepad, which means we can grab the first element (`[0]`) of the `webkitGetGamepads()` function. If we find a gamepad, then check the timestamp to see whether anything has changed since the last update. Otherwise, do nothing. If something has changed, then we update the timestamp and update the `key[]` array which controls Link.

Updating the keys is pretty simple:

{% highlight js %}

updateKeys: function() {

    // console.log(gamepad.buttons)

    // Map the d-pad
    key[0] = gamepad.axes[0] <= -0.5 // left
    key[1] = gamepad.axes[0] >= 0.5 // right
    key[2] = gamepad.axes[1] <= -0.5  // up
    key[3] = gamepad.axes[1] >= 0.5 // down

    // Map the Buttons
    key[4] = gamepad.buttons[0]; // attack (A)
    key[5] = gamepad.buttons[1]; // use item (B)

    key[6] = gamepad.buttons[10]; // start
    key[7] = gamepad.buttons[9]; // select
}

{% endhighlight %}

We only need a few buttons, so this _should_ be generic enough for most joysticks. However, I’ve been testing with a Microsoft Sidewinder control pad, and the button layout is not like current Xbox/PS controllers. We can update this with further testing.

With this done, we just need to add the new file to our project:

{% highlight html %}

<script src="js/input.js"></script>
<script src="js/main.js"></script>

{% endhighlight %}

and then initialise the Inputs in the `init()` function of our main code:

{% highlight js %}

// Setup the Input
Input.init();

{% endhighlight %}

And now we have Zelda with a controller. The way it was meant to be. Wonderful.

## Progress

You can see v0.4 of the game with Gamepad support [here](/experiments/super-js-adventure/0.4/)

Or check out all the [source code](http://github.com/gablaxian/super-js-adventure) on Github.
