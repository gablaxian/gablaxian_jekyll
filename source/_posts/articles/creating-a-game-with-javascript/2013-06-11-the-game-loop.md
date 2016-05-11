---
layout: article-game-dev
title: The Game Loop
categories:
    articles
    creating-a-game-with-javascript
---

If you’ve learnt JavaScript through making Websites, you may be forgiven for expecting a game to be written in a kind of event driven fashion. The browser world consists mostly of event handlers and callbacks. The user clicks a thing or presses a key and then stuff happens. Reactionary, if you like. Simpler games like Letterpress, Wordfeud, Words for Friends, Sudoku, etc&hellip; can work on this mechanic. The GTAs and CODs of the world, however, do not. As soon as you want more advanced elements like animation, physics and artificial intelligence, then you’re going to need a better system. That system is the Game Loop.

The Game Loop is the process a game goes through each time it creates each frame of animation. Our Zelda game will follow this simplified sequence each time it’s loaded:

- Initialisation
    - Load assets
    - Pre-calculations
- Game Loop
	- Clear the screen
	- Retrieve Player Input
	- Process AI & Logic
	- Draw graphics
	- Update the screen

The loop continues until the user breaks out of it by either pausing or quitting (or also closing the browser/tab in our case). In PC & Console games, this loop is usually a `while (true) {}` loop which runs indefinitely and as fast as the processor will allow. In a browser that same technique would lock up the interface and likely crash the tab. We _could_ use a similar technique to get the framerate as high as the browser will allow, as documented [in this article](http://www.chandlerprall.com/2011/06/beating-60fps-in-javascript/). But honestly, games are typically complicated enough that running above 60fps is hard to maintain, and beyond 60fps our eyes can no longer keep up, so any frames beyond that are effectively wasted making 60fps the sweet spot. And, handily, browsers have provided us a nicer option to achieve a loop at that speed. Whether or not we’ll actually be _able_ to run our game at that speed is another matter (but that’s where optimisation comes in).

## The Canvas

So, let’s get going! At the moment our game is pretty simple. One HTML file with a basic HTML structure, a few styles and a canvas element:

{% highlight html %}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Super JS Adventure!</title>

    <style type="text/css" media="screen">
        * { margin: 0; padding: 0 }
        #container { width: 256px; height: 224px; border: 1px solid #999; margin: 20px auto 0 auto; }
    </style>

</head>

<body>
    <div id="container">
        <canvas id="super-js-adventure" width="256" height="224"></canvas>
    </div>

    <script src="js/main.js"></script>
</body>
</html>

{% endhighlight %}

The canvas element may look a bit small, but that’s the native resolution of Zelda: A Link to the Past. Scary, huh? Obviously, it was scaled up when shown on TVs, and we’ll get to that later.

The JS file is even more simple:

{% highlight js %}

var canvas  = document.getElementById('super-js-adventure');
var ctx     = canvas.getContext('2d');
var width   = 256;
var height  = 224;

{% endhighlight %}

We first get hold of the canvas element which just sets up a drawing surface, then get its drawing ‘context’, the actual surface we’ll be manipulating. I’ve also stored the initial size of the canvas just in case.

So now we get some sort of loop going. For now, I’ll be emulating the sort of the loop you’d see in a basic PC Game. It’ll likely evolve over time.

(Side Note: When I first looked at this small square of a game, something didn’t seem right. Compared to playing the real Zelda:LttP on SNES/emulator, he seemed too tall and thin. The official game also has black bars at the top and bottom which made me question its true resolution. However, I’ve since learned that the SNES’s actual pixels aren’t square. They are wider than tall, leading to the squashed look of all SNES games. Crazy, right?)

## Javascript Timers

Historically, Javascript has provided two functions to use for looping animations: `setInterval()` and `setTimeout()`. These are actually timers, as opposed to loops. You can pass `setInterval()` a function, a time in milliseconds and it will fire that function every `x` milliseconds:

{% highlight js %}

setInterval(function() {
    // I'm looping!
}, (1000/60));

{% endhighlight %}

This runs the anonymous function 60 times a second (1000/60). Or, you could use `setTimeout()`, albeit a little differently, which runs a function after `x` ms:

{% highlight js %}

setTimeout(function() {
    // Some long block of code...

    setTimeout(arguments.callee, 16); // set another timeout on the function
}, (1000/60));

{% endhighlight %}

However, there are downsides to these techniques. John Resig, of jQuery fame, wrote a [technical but succinct post](http://ejohn.org/blog/how-javascript-timers-work/) describing them.

## A Better Loop

Thankfully, all the latest browsers support a new function: `requestAnimationFrame()`. It’s preferred because browsers are already drawing to the screen and, in essence, it tells the browser to simply draw our stuff when it next draws a frame of its own, keeping animations smooth. It also runs up to the refresh rate the device’s screen; typically 60fps (but not always, which is important). And since the browser is aware of its existence, if we minimise the browser or switch tabs, it can slow down the loop so that your CPU isn’t working unnecessarily, also making it the most efficient method.

So, let’s get that added in along with functions for initialisation and the main loop:

{% highlight js %}

function init() {
    // Initialise the game!
}

function main() {
    // Here's where we handle all the input, logic and drawing to the screen per frame.

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}

// Initialise
init();

// Start the loop!
requestAnimationFrame(main);

{% endhighlight %}

Pretty simple, eh? We don’t have much to show for it, but it you fire that up in your browser, you’ll have a canvas ready to be drawn to, and a loop running at 60fps. Good job! Have a biscuit.

Join me next time when we deal with drawing to the screen!
