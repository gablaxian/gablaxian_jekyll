---
layout: article-game-dev
title: Scaling the canvas
categories:
    articles
    creating-a-game-with-javascript
---

As you will have seen in earlier posts (I hope) we’re initially rendering the game at the SNES’s native resolution of 256x244. It works well for now, while we sort out the basics of the game engine, as all the sprites were drawn for this resolution with each sprite ‘cell’ being 8x8 pixels wide.

On an older generation console, the output is upscaled by the player’s television which, being CRT, handled it pretty well, so the images were large enough and retained all that (albeit mostly blurry) hand-drawn sprite detail.

What happens when we try to scale the canvas up? Let’s see:

{% highlight html %}

<canvas style="transform:scale(3);" />

{% endhighlight %}

This results in the following:

![Scaled Canvas](/assets/img/articles/4-scaled-canvas.png)

Hey! What happened to all that lovely detail? Most current browsers employ an algorithm when resizing images which does not favour our retro look one bit.

## Interpolation

Upscaling or ‘interpolation’ is a technique for resizing an image. If you take an image that’s 8x8 and make it 16x16, the software has to figure out what to put in those extra 192 pixels that weren’t provided. There are [quite a few ways](https://en.wikipedia.org/wiki/Image_scaling) to do it, and many written specifically for these older generation of games when played on newer hardware.

Canvas only has the one algorithm which is enabled by default, which I think is bilinear filtering. If you use Photoshop at all, you’re probably already familiar with it. What we _want_ is something like ‘nearest neighbour’.

## How do we fix it?

CSS is our salvation. All current browsers have come through for us in this time of need by providing a bit of CSS we can deploy which will stop the browser from smoothing images and instead retain the blocky appearance:

{% highlight css %}

img {
    image-rendering: -moz-crisp-edges;         /* Firefox */
    image-rendering: -webkit-crisp-edges;      /* Webkit */
    -ms-interpolation-mode: nearest-neighbor;  /* IE (non-standard property) */
    image-rendering: pixelated;                /* Chrome */
}

{% endhighlight %}

In the days of CSS vendor prefixes, it’s safer if, instead of transform, we use CSS width and height and calculate those based on our desired scale. This results in a nice, simple function we can call during the initialisation phase:

{% highlight js %}

function zoom(s) {
    canvas.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
    canvas.parentNode.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
}

{% endhighlight %}

Now we can zoom/scale to our heart’s content.
