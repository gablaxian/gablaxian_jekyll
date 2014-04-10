---
layout: article-game-dev
title: Animation
disqus: true
---

- [Sprite Animation](#sprite_animation)
- [Computer Generated Animation](#computer_generated_animation)

I’m not going to go into the theories of animation and all its forms. There are [Wikipedia articles](http://en.wikipedia.org/wiki/Animation) for that. What we’re interested in is how we go about creating animations programmatically.

## Animation techniques

In computer games, there are two methods of animation:

__Computer generated animation__ - Where an object on-screen is given a series of coordinates, or keyframes, and the computer calculates the frames between them.

__Sprite animation__ - Much like the hand-drawn animated films, each keyframe is drawn out, and the game displays each frame sequentially.

Sprite animation is always cosmetic. After the line and pixel-based graphics of the earlier games, such as Pong or Space Invaders, but before today’s 3D rendered models, the way to enhance the graphics of our games was to draw the characters and backgrounds, externally, then load them in. But this would only be to, say, animate a character’s running animation. Moving the character around the screen, however, is still done programmatically.

## Sprite Animation

As we’re building a game from the golden age of sprite-based games, we’ll look at sprite animation first, as computer generated animation is a deeper discussion. At its heart, sprite animation is just like a cartoon. For each motion we’d like to convey, we draw a state for each key point. The fewer states we draw, the jerkier the animation and the slower we need to show each frame, the more we draw, the more fluid the motion, and the faster we need to show them.

Here’s Mario from Super Mario World on the SNES, running:

![Mario](/assets/img/articles/5-mario-running.gif)

It consists of only 2 frames. It gets the point across, but there’s no grace in the movement. Now let's see Elena, from Street Fighter 3: 3rd Strike in her 'stance' animation:

![Elena](/assets/img/articles/5-Elena-ts-stance.gif)

That motion alone is a whopping 58 frames. All hand drawn. Rather lovely, isn’t it? Street Fighter 3: Third Strike was released in the Arcade and the Dreamcast, where hardware was powerful enough to handle the larger imagery. Back in the SNES era, things were a little more constrained. But that’s all part of the charm.

More pertinent to our mission, from the great Zelda sprite sheet we collected earlier here’s an example of one of Link’s animation: his down-facing walk.

![Link walking](/assets/img/articles/5-link-walking.png)

A modest 7 frames. We can work with that. First thing is to show each frame in succession, but also not too quickly. So how do we get Link walking in our game engine? Maybe create an animated gif, like above? We could simply load in the animated gif whenever a user pressed down? Unfortunately, that’s not very interactive. Admittedly, I have not tested using a series of animated gifs, but I assume it will end up being more of a pain to control, than putting in the modest up-front effort building our own animation engine for the increased flexibility.

Why is flexibility important? So often in games, animations are interrupted - either by user interaction, or as a by-product of the game world. A character could be half-way though their walking animation when they are attacked, at which point a number of different actions could be taken. Maybe the character swings their sword, maybe they take damage. Switching between the animations requires a fair amount of coordination and sometimes special frames with which to link those animations. It’s a dizzying prospect.

Performing sprite animation in code isn’t overly complex. It mostly comes down to preference rather than performance. Given the PNG sprite above, we _could_ simply loop through each slice and once we reach the end, loop backwards through (the walk animation needs to swing like a pendulum so that the feet don’t suddenly jump from one foot to the next). But the better solution, which I saw on one of Shaun Inman’s projects, is to list sprite positions as an array, and loop through that instead. We’re trading a minor increase in space (storing the sequence) for much simpler code.

Before we get into the mechanics of our spriting engine, we need to take another look at our `drawImage()` function. In the last iteration, we drew Link to the screen with:

    drawImage(link, player.x, player.y);

We pass in our image of Link, and his `x` and `y` coordinates. If we wanted to scale that image, we add two more arguments, `width`, and `height`, at the end:

    drawImage(link, player.x, player.y, width, height);

Now, for whatever reason, if we want to slice an image, the arguments change order to:

    drawImage(link, slice_x, slice_y, slice_width, slice_height, player.x, player.y, width, height);

Yay? Anyway, this is what we’ll have to use from here on out.

Going back to our code, to get Link animating, we can use:

    function init() {
        // ...
        
        player.sequence     = [3,4,5,6,5,4,3,2,1,0,1,2];
        player.sequenceIdx  = 0;
        
        // ...
    }

    function main() {
        // ...

        // loop through the walking sequence
        var gutter      = 2;
        var spritePos   = ( player.sequence[player.sequenceIdx] * gutter ) + ( player.sequence[player.sequenceIdx] * 16 );

        ctx.drawImage(link, spritePos, 0, 16, 25, player.x, player.y, 16, 25);

        if( player.sequenceIdx < player.sequence.length - 1 )
            player.sequenceIdx += 1;
        else
            player.sequenceIdx = 0;

        // ...

    }

Give Link an array of grid positions to transition between with, `player.sequence`, starting with the grid position of Link standing. During the loop, we calculate where each grid position corresponds to and move the slice area, taking into account the 2px gutter between each drawing.

<iframe src="//gablaxian.com/experiments/super-js-adventure/0.4.5/index.html" width="258" height="226" style="border: none">
    Link
</iframe>

Yeeaahh... so, that’s a bit fast. The _game_ renders at 60fps, but we don’t want our animations to render that fast, too. We just don’t have the number of frames. To alleviate this problem, and without having to draw the extra frames, we have to build in a way to run sub-systems of the main game loop at their own framerate. While the game runs at 60fps, we may want Link to animate at, say, 15fps, while the loop continues at 60. There are a number of different ways to do this, but are mostly variations on a theme.

It’s commonly called, ‘Frame Rate Independence’. I don’t think there’s an acronym. For once. And it’s one of the most important parts in our game as there are a great many game objects which will animate slower than the main loop.

The maths and code behind it is fairly simple. Our main loop is running at 60fps. 60 frames in one second. That’s 1000 / 60 = 16.6 recurring milliseconds per frame. Now, we give Link two more properties:

    player.fps = 16;
    player.animationUpdateTime = 1 / player.fps;

We want Link’s animation to run at 16fps, which is 1000 / 16 = 62.5ms between frames. Now we need a way to measure how much time passes between frames, which we can do with:

    var lastTime = 0;

    function init() {
        // ...

        lastTime = window.performance.now(); // store an initial time.

    }

    function main() {
        // ...

        var now     = window.performance.now(), // the time in ms on each loop.
            elapsed = (now - lastTime) / 1000; // how many ms since the last time the loop ran.

        lastTime = now; // store the current ms to use next time!
    }

Now we have a way to measure time per frame. The next step is to add up the elapsed times, and after several frames, once the cumulative times add up to more than Link’s frame time, 62.5, we show the next frame and reset the counter:

    timeSinceLastFrameSwap += elapsed;

    // half the animation speed
    if( timeSinceLastFrameSwap > player.animationUpdateTime ) {
        if( player.sequenceIdx < player.sequence.length - 1 )
            player.sequenceIdx += 1;
        else
            player.sequenceIdx = 0;

        timeSinceLastFrameSwap = 0;
    }

That’s much better! Obviously, Link should only animate when the user interacts, but we can get to that later.

Check out the progress on version 0.5 [here](/experiments/super-js-adventure/0.5/)

Or check out all the [source code](//github.com/gablaxian/super-js-adventure) on Github.

## Computer generated animation

This is a wide area of animation. In games, where something isn’t sprite animated, it’s computer animated. Taking a fully 3D game like Quake, Gears of War, or Call of Duty, things like fire are often still sprite animation, but everything else in the game world is computer animated. From objects rotating or moving, to the skeletal animations



<div class="pagination clearfix">
    <a class="left" href="/articles/creating-a-game-with-javascript/scaling-the-canvas.html">&larr; Scaling the canvas</a>
</div>