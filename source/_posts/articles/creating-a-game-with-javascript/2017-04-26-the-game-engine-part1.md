---
layout: article-game-dev
title: The Game Engine - Part 1
categories:
    articles
    creating-a-game-with-javascript
tags: super-js-adventure javascript
---

The game engine is the game’s framework. There are plenty already out there. For traditional games, there are the engines, the [Unreal Engine](https://www.unrealengine.com/what-is-unreal-engine-4), [CryEngine](https://www.cryengine.com/) and [Unity](https://unity3d.com/) (some of which can compile to JavaScript). Web-specifically, there are the likes of [Phaser](https://phaser.io/), [Impact](http://impactjs.com/), or the more RPG focused, [RPG Maker MV](http://www.rpgmakerweb.com/products/programs/rpg-maker-mv). If you just want to get started building games, then I strongly advise giving one of those a go.

In building my own, what I want to avoid is overly-generic code. I don’t want too many abstractions getting in the way of readability. Digging down through includes of includes, functions within objects within objects gets weary. A simple, but manageable codebase which is fairly resilient to change down the line.

## Where we are so far

Phase one was to take the functionality of the game as it stood, implement the new changes to the level data (as exposed by the editor) and break up the existing code into sensible files, objects and functions. This will help as we flesh out the engine further.

Going from one `main.js` file, we now have the files:

- input.js
- link.js
- main.js
- map.js
- world.js

The guts of the game now lives in a `Game` object:

{% highlight js %}
let Game = {

    SCALE_VALUE: 2,

    init() {

        //
        this.canvas         = document.querySelector('canvas');
        this.context        = this.canvas.getContext('2d');

        // etc...
{% endhighlight %}

This `Game` object starts with an `init()` function which sets up a number of variables, then, like the editor, launches a sequence of `Promise`-based functions which ‘boot up’ the game, so to speak; load the assets, create the player, map, etc... then start the loop:

{% highlight js %}
 // Initialise!
this.loadAssets()
.then( () => this.setupGame() )
.then( () => {
    console.log('Game started');
    this.lastTime = window.performance.now();
    requestAnimationFrame(this.render.bind(this));
});
{% endhighlight %}

I’ve moved chunks of code into their own functions. For example, all the code for handling the input was  previously dumped unceremoniously in the `main()` loop. I moved that code into a `handleInput()` function which is run inside the main loop instead.

I’ve tried to make `Game` an object of logical functions which describe the steps the game goes through on each loop:

{% highlight js %}
let Game = {
    // init
    init(),
    loadAssets(),
    setupGame(),
    scale(),

    // construct frame
    handleInput(),
    handleCollisions(),
    cleanup(),
    
    // output
    render()
}
{% endhighlight %}

When I moved the input handling logic into its own function, I also moved its player logic into the `Link` object where it seemed most fitting. So, instead of directly affecting the player position variables like:

{% highlight js %}
this.player.x += speed;
{% endhighlight %}

we should have it handled by the object it affects:

{% highlight js %}
this.player.moveRight();
{% endhighlight %}

The `Input` objects stays mostly the same but I decided to change how the key inputs were stored and accessed. Instead of:

{% highlight js %}
var key = [0,0,0,0,0];
{% endhighlight %}

It now uses:

{% highlight js %}
let Key = {
    UP:     0,
    DOWN:   0,
    LEFT:   0,
    RIGHT:  0,
    ...
}
{% endhighlight %}

Which makes the code more intuitive. So

{% highlight js %}
if( key[3] ) {
    this.player.moveLeft();
}
{% endhighlight %}

Becomes

{% highlight js %}
if( Key.LEFT ) {
    this.player.moveLeft();
}
{% endhighlight %}

Finally, I wanted to talk about globals. Normally, these are a sign of bad code smell. But in games, these can be perfectly fine, especially when a site is going to do nothing but run this game. There is no chance of variable name clashes because its all my code. Sometimes there are just variables which are needed all over the engine, e.g:

{% highlight js %}
const SCREEN_WIDTH      = 256;
const SCREEN_HEIGHT     = 224;

const ROOM_WIDTH        = 256;
const ROOM_HEIGHT       = 176;

const TILE_SIZE         = 8;
{% endhighlight %}

Anywhere in my code I can call `TILE_SIZE` and _it’s fine_.

## Next steps

This is obviously just the start. But I’m happy with the level of abstraction so far. A good internal API that I can build on which will isolate code updates to specific areas and ripple out over the codebase.

In the next part we’ll be looking at new objects which handle other aspects of the game along with re-writing some of the functionality to better support the updated level data.

## Progress

Check out the editor (with added fill mode and improved export) [on version 0.9](/experiments/super-js-adventure/0.9/editor)

Try out [v0.9 of the game](/experiments/super-js-adventure/0.9) itself which uses the new editor level output.

Or [see all the source code](//github.com/gablaxian/super-js-adventure) on Github.