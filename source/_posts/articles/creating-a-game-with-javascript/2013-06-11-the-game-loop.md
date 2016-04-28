---
layout: article-game-dev
title: The Game Loop
categories:
    articles
    creating-a-game-with-javascript
---

Coming from a Web Development background, you may be forgiven for expecting a game to be written in a kind of event driven fashion. The user clicks a thing/presses a key and then stuff happens. Reactionary, if you like. And do you know what? There is absolutely no reason that can’t be the case. Games like Letterpress, Wordfeud, Words for Friends, Sudoku, etc&hellip; can work on this mechanic. Those games you play on your consoles, however, do not. As soon as you want more advanced elements like animation, physics and artificial intelligence, then you’re going to need a better system. That system is the Game Loop.

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

The loop continues until the user breaks out of it by either pausing or quitting. As we’ll learn throughout the development of this game, however, since we’re inside a browser JS allows us to do things a bit differently; harnessing some of the elements a browser is already capable of like, say, loading images, or the DOM.

In PC & Console games, this loop is usually a `while (true) {}` loop which runs indefinitely and as fast as the processor will allow. In the browser there are similar ways to get the framerate as high as the browser will allow, as documented [in this article](http://www.chandlerprall.com/2011/06/beating-60fps-in-javascript/). There are pros and cons to each method, but honestly, games are typically complicated enough that running above 60fps is hard to maintain, and beyond 60fps our eyes can no longer keep up, so any frames beyond that are effectively wasted making 60fps the sweet spot. And, luckily, Javascript gives us a few nicer options to achieve a loop at that speed. Whether or not we’ll actually be _able_ to run our game at that speed is another matter (but that’s where optimisation comes in).

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

(Side Note: When I first looked at this small square of a game, something didn’t seem right. Compared to playing the real Zelda:LttP on SNES/emulator, he seemed too tall and thin. The official game also had black bars a the top and bottom making me question the true resolution of the game. However, I’ve since learned that the SNES’s actual pixels weren’t square. They are wider than tall, leading to the squashed look of all SNES games. Crazy, right?)

## Javascript Timers

Historically, Javascript has provided two functions to use for looping animations: `setInterval()` and `setTimeout()`. These are actually timers, as opposed to loops. You can pass `setInterval()` a function, a time in milliseconds and it will fire that function every `x` milliseconds:

{% highlight js %}

setInterval(function() {
    // I'm looping!
}, 16);

{% endhighlight %}

This runs the anonymous function every 16 seconds, which is around 60fps (16.6 recurring, if you must know). Or, you could use `setTimeout()`, albeit a little differently, which runs a function after `x` ms:

{% highlight js %}

setTimeout(function() {
    // Some long block of code...

    setTimeout(arguments.callee, 16); // set another timeout on the function
}, 16);

{% endhighlight %}

However, much has been written about the downsides of both these techniques. John Resig, of jQuery fame, wrote a technical but [succinct post](http://ejohn.org/blog/how-javascript-timers-work/). Thankfully, all the latest browsers support a new function: `requestAnimationFrame()`. It’s preferred because browsers are already drawing to the screen and, in essence, it tells the browser to simply draw our stuff when it next does a draw of its own, keeping animations smooth. It also runs _up to_ 60fps. And since the browser is aware of its existence, if we minimise the browser or switch tabs, it can slow down the loop so that your CPU isn’t working unnecessarily, also making it the most efficient method.

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
