---
layout: article-game-dev
title: Scaling the canvas
disqus: true
---

I didn’t expect to dedicate a whole post to this. In the overall scheme of the project, this just didn't even factor in to ‘things I would have to deal with’.

As you will have seen in earlier posts (I hope) we’re initially rendering the game at the SNES’s native resolution of 256x244. It works well for now, while we sort out the basics of the game engine, as all the sprites were drawn for this resolution with each sprite ‘cell’ being 8x8 pixels wide.

On an older generation console, the output is upscaled by the player’s television, which, being CRT, handled it pretty well, so the images were large enough and retained all that hand-drawn sprite detail. However, when I began to scale the canvas, it decided to do something I wasn’t expecting...

So, what’s the problem? Well, let’s scale up the canvas by a factor of 3 with some CSS and find out:

{% highlight html %}

<canvas style="zoom:300%" />

{% endhighlight %}

which works in Chrome, Safari and IE. Or,

{% highlight html %}

<canvas style="-moz-transform:scale(3)" />

{% endhighlight %}

for Firefox.

This results in the following:

![Scaled Canvas](/assets/img/articles/4-scaled-canvas.png)

Hey! What happened to all that lovely detail? Most current browsers employ an algorithm when resizing images which does not favour our retro look one bit. Though, this is slowly changing.

## Interpolation

Upscaling or ‘interpolation’ is a technique for resizing an image. If you take an image that’s 8x8 and make it 16x16, the software has to figure out what to put in those extra 192 pixels that weren’t provided. There are [quite a few ways](https://en.wikipedia.org/wiki/Image_scaling) to do it, and many written specifically for these older generation of games when played on newer hardware.

Canvas only has the one algorithm which is enabled by default, which I think is bilinear filtering. If you use Photoshop at all, you’re probably already familiar with it. What we _want_ is something like ‘nearest neighbour’.

## How do we fix it?

There is one hope for salvation. A bit of CSS we can deploy which will stop the browser from smoothing images and instead retain the blocky appearance:

{% highlight css %}

img {
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
    -ms-interpolation-mode: nearest-neighbor;
}

{% endhighlight %}

If we apply that CSS to the whole canvas and use `drawImage()` to draw each image at a larger size, the CSS will remove the smoothing. However, that CSS currently only works in Firefox when scaling the whole canvas though. Bah.

## What are our options?

There are 3 routes we can take.

1 - Suck it up.

Obviously the easiest. Simply live with the blurring. It’s not the end of the world, and it doesn't require any further action on our part. It’s also fast because we’re only ever drawing 256x245 pixels and the browser sorts out the rest. A quick scan of the Activity Monitor suggests that the CPU impact is negligible if any.

It will, however, make the Wayne’s World American Indian cry. At least, until all browsers support this method.

2 - Use an internal scaling variable. Monitor the scale level and apply it to every image drawn to the screen.

Not the worst idea. It will permeate the whole game, so every time we draw something to the screen we will need to calculate sizes, positions and even speeds based on the scale. Our drawing code would look more like:

{% highlight js %}

var x, y, scale = 2;

// Probably not as straightforward as this
x = x * scale;
y = y * scale;

ctx.drawImage(img, x, y, width*scale, height*scale);

{% endhighlight %}

Definitely more of a hassle. I can’t comment on performance either, but I imagine there’d be a hit as we’re now drawing larger images.

3 - Use a ‘back buffer’.

This is actually a common practice for PC/Console games. I say common... it’s rare if a game doesn’t use it. The principal is simple: Create a canvas ‘context’ in memory, which is not shown on screen. Write all drawing commands to this context first, then once the ‘screen’ has been filled, copy all that info to the actual screen, thereby creating one whole frame and presenting that frame to the player as one discreet image. This prevents things looking like they’re being drawn at different times and also allows the back buffer to be filled while the previous frame is still being drawn.

Lower level languages, such as C, have lovely functions like `memcopy()` which allow lightning fast shifting of memory blocks around. So moving the buffer to the screen is ridiculously fast. Canvas has no such function. Instead, writing the back buffer to the screen has to be done pixel by pixel. And, in our case, each pixel being redrawn as a new rectangle of scale\*scale in size. So, scaling up by two means one pixel becomes a 2x2 rectangle and so on. And this has to be written in Javascript. No hardware accelerated luxuries for us.

The short version is that, while we can write this function, and there are plenty around to use, it can impact our performance by around 3ms per frame, maybe more. Doesn’t sound like much, I’ll admit. However, in order to achieve our optimal framerate of 60fps, the budget per frame is 16.6ms. That’s 18% of our rendering time lost on simply scaling the image. We already have the graphics, logic, AI, controls and whatever else fighting for that 16ms, so 3ms may just be too high a price.

## The secret fourth option

4 - Re-draw all sprites.

I came across this one during my research into current HTML5 games, and, as will happen a lot during this project, [Mr Inman](http://shauninman.com) comes to the rescue. He uses a technique on his Ludum Dare project, [Sinkhole](http://www.shauninman.com/archive/2011/12/21/sinkhole_postmortem), where, during game initialisation, he detects the browser’s viewport size and calculates a scale value which just small enough to fit into the viewport. Then, upon loading in the game assets, scales up each image and stores them in the cache.

Very clever. It essentially takes the best part of the back buffer method and turns it into an infrequent operation as opposed to per-frame. Win-win!

## Conclusion

After finding out about the secret fourth option, there’s little reason not to go for that. Option 1 is preferable, provided all the current browser support the image scaling CSS styles, but until we’re there, this is a good fallback. I won’t cover the scaling and caching technique until we start building the game engine proper, however.

<div class="pagination clearfix">
    <a class="left" href="/articles/creating-a-game-with-javascript/handling-user-input.html">&larr; Handling user input</a>
    <a class="right" href="/articles/creating-a-game-with-javascript/animation.html">Animation &rarr;</a>
</div>
