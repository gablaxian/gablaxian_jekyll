---
layout: template
title: Drawing to the Screen
disqus: true
---

In the last post, we looked at the Game Loop and how to run our game at the sweet spot of 60fps. Now, let's see some results, shall we? Time to make some pretty shapes.

By using canvas, we're moving beyond the world of basic Javascript, and using a set of functions available only to the canvas 'context'. By it's very nature, the Canvas element is a platform for pixel manipulation. Once we've set up a context, we can access and edit any pixel in it. If we want to draw a line, we can easily loop through all the pixels an set a line of them to a colour of our choosing.

Luckily for us, the context provides us with an object in JS with a few more functions to speed that sort of stuff up, such as `lineTo()`. You can see a full list of functions available to us over on this handy [cheat sheet](http://www.nihilogic.dk/labs/canvas_sheet/HTML5_Canvas_Cheat_Sheet.png).

Diving straight in, looking at our `main()` function from last time:

{% highlight js %}

function main() {
    // Here's where we handle all the input, logic and drawing to the screen per frame.

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}

{% endhighlight %}

It's looping at 60fps. Now let's draw ourselves a red rectangle. It's like the Hello World of drawing applications.

{% highlight js %}

function main() {
    
    // set colour to red for all following canvas operations.
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 50, 50);

    requestAnimationFrame(main);
}

{% endhighlight %}

And there we have it. A 60fps red rectangle!

![Red Rectangle](/assets/img/articles/2-red-rectangle.png)

The ctx object is the canvas context which we set in the last post as a global variable. With that, we define a colour which is set for all following drawing operations. Were we to then draw a line or another rectangle, it would also be red, up until we set a new fillStyle. The `fillRect()` function is called with the x and y coordinates first (0, 0), and then we set the width and height, both at 50px.

The canvas element works a lot like a paint program. Each time something is drawn to the screen, it stays there until you erase it. So, if we introduce some animation, say, moving the rectangle 1px to the right on each frame, we're going to slowly animate drawing a line:

{% highlight js %}
var x = 0;

function main() {
    
    // set colour to red for all following canvas operations.
    ctx.fillStyle = '#f00';
    ctx.fillRect(x, 0, 50, 50);

    x = x + 1;

    requestAnimationFrame(main);
}
{% endhighlight %}

![Animated Rectangle](/assets/img/articles/2-animated-rectangle.png)

If we want to make it look like the rectangle is moving, we clear the canvas before drawing to it again with `clearRect()`;

{% highlight js %}

function main() {

    ctx.clearRect(0, 0, 256, 224);
    
    // set colour to red for all following canvas operations.
    ctx.fillStyle = '#f00';
    ctx.fillRect(x, 0, 50, 50);

    x = x + 1;

    requestAnimationFrame(main);
}

{% endhighlight %}


The `clearRect()` function works like `fillRect()`. Give it x and y coordinates and a width and height. In this case we're clearing the whole canvas. The canvas element is transparent by default. However, if you know what the background color will always be, in this case white, then we don't actually have to `clearRect()`, but we could set the `fillStyle` to `#fff` and use `fillRect()` again.

It's very important to note that you don't need to clear everything all the time. Curiously, for such basic operations as `clearRect()` and `fillRect()`, they are fairly expensive in terms of processing power. We won't worry about this just yet, but later on we can improve performance by only clearing what we _need_ to and _when_, if at all.

Okay! Well, drawing us some rudimentary shapes is all well and good, but we're writing a game, dammit. And a graphically rich one with images and sprites and stuff. So, we're going to need an image and a way to put it on the canvas. This is where we discover the wonders of [Spriters Resource](http://www.spriters-resource.com/snes/zeldalinkpast).

Say hello to Link!

![Red Rectangle](/assets/img/articles/2-link.png)

I've gone and created the link.png file and a new images folder to our folder structure. Adding him to our game requires us to first load in the image using native Javacript. Let's first add a new global variable for our link image.

{% highlight js %}

var canvas  = document.getElementById('super-js-adventure'),
    ctx     = canvas.getContext('2d'),
    width   = 256,
    height  = 224,
    link    = new Image();

{% endhighlight %}

Now, images like this, which would probably be used everywhere in the game should be initialised on game load. Wait, we have a function for that: `init()`! So let's load the image in the `init()` function:

{% highlight js %}

function init() {
    // Initialise the game!
    link.src = 'images/link.png';
}

{% endhighlight %}

Now we can go back to the main loop and draw link to the screen with canvas' `drawImage()` function.

{% highlight js %}

function main() {
    // Here's where we handle all the input, logic and drawing to the screen per frame.
    ctx.clearRect(0, 0, 256, 224);

    ctx.drawImage(link, 20, 20);

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}

{% endhighlight %}

![Red Rectangle](/assets/img/articles/2-link-in-game.png)

And there we have it. Link makes an appearance so we can now class our little app as a true Zelda game.

<div class="pagination clearfix">
    <a class="left" href="/articles/creating-a-game-with-javascript/drawing-to-the-screen.html">&larr; Drawing to the screen</a>
    <a class="right" href="/articles/creating-a-game-with-javascript/handling-user-input.html">Handling user input &rarr;</a>
</div>
