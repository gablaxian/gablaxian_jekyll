---
layout: article-game-dev
title: Levels - Part 2
categories:
    articles
    creating-a-game-with-javascript
tags: super-js-adventure javascript
---

In the last part I talked about structuring the data of a tile-based game along with managing collision detection between the player and a tile. Now, we connect that up with spritesheets and map-loading logic and get this looking and working like a real game.

From all my research into how Zelda: A Link to the Past rendered its tiles and how it handled collision detection, I’ve seen a fair amount of conflicting information. In addition to that, it seems that the ‘ripped’ sprites found on [Spriters resource](http://www.spriters-resource.com/snes/legendofzeldaalinktothepast/) really are just pulled from screenshots from the game, rather than from the game data, leaving the game as a bit of a black box, functionally. I’ve seen internet folk say that the game’s tiles are actually [16x16 while collision detection is handled at the 8x8 level](http://gamedev.stackexchange.com/questions/8336/how-did-loz-a-link-to-the-past-handle-sub-tile-collisions) (sub-tile collision). However, there are many objects which are 8x8 as seen in an image from the previous link:

![snes grid](/assets/img/articles/7-snes-grid.png)

In the image, the little flowers and strands of grass appear in many variations within the supposed 16x16 grid and the wooden fence is all over the place!

Of course, it doesn’t matter if we know how it was originally built. As long as we can build as close an approximation as we can, then that’s what matters. And given how many different ways there are to produce similar results, we are probably going to get a lot of things wrong and do a lot of things badly anyway. Sounds fun! Let’s do this.

I guess now is a good time to take a look at what our Zelda maps (levels) are comprised of. NES Zelda consists of an 'overworld', 9 dungeons and several caves. Caves are single screen rooms. The overworld and dungeons are collections of screen-sized rooms which transition into view when entered.

Here’s the ripped spritesheet for the NES Zelda’s overworld map:

![nes overworld spritesheet](/assets/img/articles/7-nes-overworld-spritesheet.png)

In this case, all tiles _were_ actually 16x16. There are 18x8, or, 144 distinct tiles. Trim! There are also tiles for the various caves and dungeons, but we’ll focus on the overworld as all techniques here will apply throughout. In this spritesheet we can see tiles for the ground, water, walls, caves and also objects like shrubs, statues, etc...

For the SNES Zelda... well... I couldn’t find a spritesheet which had _all_ of the tiles but this was the closest I could find:

![snes overworld spritesheet](/assets/img/articles/7-snes-overworld-spritesheet.png)

I’m not going to begin counting that. Obviously, it is a lot more. And to add to that are the extra features like animated tiles.

What we’re looking for is a cross-section of these two spritesheets where all NES Zelda tiles can be replaced by an equal, or better, tile (or set of tiles) from the SNES Zelda sprites, but with several more thrown in for enhancements.

## Tile Types

In the previous post, I established three different tile types which covered the basics of a tile-based level: ground, wall, entrance (empty). Each denoted by a number. At this simple stage, one number could easily convey all a tile’s properties which, at the moment, is only style and collision. But now we’re going to need to convey more. In a more complex game, a tile might have the following properties:

- Image
- Prevents movement (wall)
- Slows movement (steps)
- Trigger Event (cave entrance)
- Animated (lapping water, flowers)
- Destructible (bushes, walls)
- Movable
- Trap (change in sprite. hurts player/triggers event)
- Switch (change in sprite. triggers event)

Some of these aren’t a problem on the NES, such as water, where (as far as I can remember) Link cannot enter water, which he can do on the SNES. However, water on the NES also wasn’t animated, but is on the SNES, and that is a feature which will make its way over as an enhancement.

Let’s start with throwing together a small spritesheet which will cover the various tile types:

![mini overworld](/assets/img/articles/7-mini-overworld.png)

I am unable answer to how the sprites handled transparency. I know they _did_ just not where and when. So there will likely be a mixture. For example, I know that those bushes only ever appear on grass areas (brown versions exist and only appear on dirt/sand). But the bottom of hill walls appear on both. So, either have one transparent image which sits on top of another grass/dirt tile, or have multiple tiles for each grass/dirt ground type.

In order to achieve effect we want in our game, we need to introduce the concept of layers. Where before we had one array with one number per cell, we now need multiple arrays with different numbers which will store the various properties.

So the previous 'level' now becomes something like:

{% highlight js %}

var world = {

    layers: [
        {
            name: "ground",
            data: [0,0,0,...]
        },
        {
            name: "world",
            data: [0,0,0,...]
        }
        {
            name: "top",
            data: [0,0,0,...]
        }
    ],

    collisions: [
        0,0,0,...
    ],

    entities: [
        {
            type: "bush"
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            tileID: 0
        }
    ],

    animations: [
        {
            tileID: 119,
            tiles: [119,120,121]
        }
    ],

    tilesets: [
        {
            source: "overworld.png",
            width: 224,
            height: 112
        }
    ]

}

{% endhighlight %}

<aside>
The multi-dimensional array we used earlier was fine for prototyping and understanding tile-based layout and collisions, but it won’t scale. Mainly because we are <em>not</em> handcoding the entire world map (and all the dungeons and caves). The NES Zelda’s Overworld map is (and I’m just eyeballing) around 16x7 screens each with around 14x10 cells which means a total of 140 cells * 112 screens = 15,680 tiles. We are going to need an editor for this. So managing a single, long array will be easier all-round.
</aside>

I wouldn’t worry about being quite verbose with the map data. Firstly, the file will be gzipped by a server on request, giving us some good savings, and secondly, the data structure does not need to reflect the game’s internal data structures anyway. Saving from a level editor and loading into the game will cover all the conversions.

The tactic I’ve decided to take here is to split up tiles and ‘entities’. An entity will be any enemy, NPC or tile which has one or more of the properties above. It’s the easiest way to maintain state, handle events and motion. This seems to be a common convention for recent tile-based games. So, tiles will be those such as ground, walls and various roofs/treetops, etc... above the character. Entities will be objects like bushes, which can be destroyed or picked up, cave entrances (which I’ve noticed are drawn over Link as he enters, so that should be interesting), and so on... We’ll cover the entities properly in a future post.

So, a few changes since the last post. Firstly, I’ve decided to reinstate the <abbr title="Heads Up Display">HUD</abbr> from NES Zelda; a portion (3 tiles high) at the top of the screen which will hold the inventory information. So now our screen dimensions remain the same, but the room dimensions are 256x176. In our `main()` loop we draw a black rectangle for the <abbr title="Heads Up Display">HUD</abbr> and then translate all other draw functions down the screen by the <abbr title="Heads Up Display">HUD</abbr> height amount:

{% highlight js %}

function main() {

    //...

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);

    // shift all draw functions down by HUD_HEIGHT amount
    ctx.save();
    ctx.translate(0, HUD_HEIGHT);

    //...

    link.draw();

    ctx.restore();

    // draw the HUD area last so it sits on top of all else.
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, HUD_HEIGHT);

    lastTime = now;

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}

{% endhighlight %}

Now we need to convert our `drawBackground()` function to reflect the new level data structure. Grabbing the relevant slices from the tilesheet uses exactly the same technique as we used for animating Link. Knowing the dimensions of our spritesheet, in this case, 224x112 we can use numbers to denote a cell (sorry, I’m going to be using cell and tile interchangeably all over the place) and calculate its position on the spritesheet with code such as:

{% highlight js %}

// divide the width and height by the tile size (8) to find how many tiles across the spritesheet is (no need for height, tbh)
var spriteCols  = 224 / TILE_WIDTH;

// use the numbers above to find the position of any given cell by its number
var spriteCol   = tileNumber % spriteCols;
var spriteRow   = Math.floor(tileNumber / spriteCols);

{% endhighlight %}

As a simple example, let’s say our spritesheet is 24x24. That’s (24/8), 3 cells across 3 and cells high. If a tile had a number 4 then, counting along from top left to bottom right (starting at 0), it would be 1 cells down, 1 cell across (coordinates, [1, 1] if you like). So, the middle tile.

![example grid image](/assets/img/articles/7-example-grid.png)

We can count that easily. But what’s the maths behind it? We calculate the row with 4/3 rounded down, which is 1.3 recurring, rounded down to 1. Then calculate the column by finding the remainder left over once we’ve removed all the multiples of 3 from our cell number, so we can remove one 3 from 4 leaving 1 left over which we can do with [the remainder operator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Remainder) (4%3). And this will serve as the basis for all our tile picking.

For the moment I’ve split our map into two main layers, ground and world. Ground handles the static grass/dirt tiles. World handles the walls, trees, houses and animated tiles. This allows for tiles like walls to retain their transparency and still have a colour beneath them.

Knowing this, I can do one loop over the dimensions of the screen and access the cells in both layers at the same time, making sure to order the layers correctly. Then we need to handle our animated tiles. For this, I’ve used the tile number (ID) of an animation’s tile sequence in the world layer. In the level data I’ve created an array of animation tiles specifying its tileID and the sequence of tiles for the animation as seen above:

{% highlight js %}
    animations: [
        {
            tileID: 119,
            tiles: [119,120,121]
        }
    ],
{% endhighlight %}

On initialisation of our game, I’m storing those animations and IDs internally and also setting a global tile animation FPS, timestamp and sequenceID so we can use the same animation technique as we used on Link:

{% highlight js %}
var animationTiles  = [];
var tileSequences   = {};

var tileFPS         = 7;
var tileUpdateTime  = 1000 / tileFPS;
var timeSinceLastTileFrameSwap = 0;
var tileSequenceIdx = 0;

function init() {
    //...
    for (var i = 0; i < world.animations.length; i++) {
        animationTiles.push(world.animations[i].tileID);
        tileSequences[world.animations[i].tileID] = world.animations[i].tiles;
    }
}
{% endhighlight %}

Then after passing an `elapsed` variable from `main()` into `drawBackground()` like we did with the Link object, we get our new `drawBackground()` function:

{% highlight js %}
function drawBackground(elapsed) {

    // store and increment the tile sequence array based on the tile FPS.
    timeSinceLastTileFrameSwap += elapsed;

    if( timeSinceLastTileFrameSwap > tileUpdateTime ) {
        if( tileSequenceIdx < 2 ) {
            tileSequenceIdx++;
        }
        else {
            tileSequenceIdx = 0;
        }

        timeSinceLastTileFrameSwap = 0;
    }

    var x = 0;
    var y = 0;

    var layer1 = world.layers[0].data;
    var layer2 = world.layers[1].data;

    var spriteCols  = world.tilesets[0].width / TILE_WIDTH;
    var spriteRows  = world.tilesets[0].height / TILE_WIDTH;

    // set a fillStyle of (off)black for background cells set to 0 (cave entrances, etc...)
    ctx.fillStyle = 'rgb(34,39,34)';

    for (var row = 0; row < NUM_TILES_HIGH; row++) {
        for (var col = 0; col < NUM_TILES_WIDE; col++) {

            var tile1   = layer1[( (row * NUM_TILES_WIDE) + col)];
            var tile2   = layer2[( (row * NUM_TILES_WIDE) + col)];
            x           = (col * 8);
            y           = (row * 8);

            // calculate position and draw ground tile
            if( tile1 > 0 ) {
                var spriteCol1   = tile1 % spriteCols;
                var spriteRow1   = Math.floor(tile1 / spriteCols);

                ctx.drawImage(tileset, (spriteCol1 * TILE_WIDTH), (spriteRow1 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
            }
            // draw black/empty tile
            else {
                ctx.fillRect(x, y, TILE_WIDTH, TILE_WIDTH);
            }

            // calculate position and draw world tile if one exists
            if( tile2 > 0 ) {

                // if the world tile matches an ID of an animation tile, set the tile ID to the next in the sequence
                if( animationTiles.indexOf(tile2) != -1 ) {
                    tile2 = tileSequences[tile2][tileSequenceIdx];
                }

                var spriteCol2   = tile2 % spriteCols;
                var spriteRow2   = Math.floor(tile2 / spriteCols);

                ctx.drawImage(tileset, (spriteCol2 * TILE_WIDTH), (spriteRow2 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
            }
        }
    }

}
{% endhighlight %}

Because I do love me some pain, I decided to handcraft the starting screen, cell by cell. After all, I need to check this stuff works and I’m happy with it before building the editor. And that ‘artisinal’ data looks like:

{% highlight js %}

    var world = {
        layers: [
            {
                name: "background",
                data: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
                    0, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
                    0, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
                    0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
                ]
            },
            {
                name: "world",
                data: [
                    272, 271, 272, 271, 272, 271, 272, 273, 274, 275, 276, 277, 278, 279, 0,   0,   0,  0,    0,   182, 183, 184, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    298, 299, 298, 299, 298, 299, 168, 169, 170, 171, 304, 305, 306, 307, 0,   7,   8,  7,    8,   210, 211, 212, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    326, 327, 326, 327, 326, 327, 196, 0,   0,   199, 332, 333, 334, 0,   0,   35,  36, 35,   36,  238, 239, 184, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    354, 355, 354, 355, 354, 355, 224, 0,   0,   227, 360, 361, 0,   0,   0,   0,   0,   0,   0,   210, 183, 212, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    195, 195, 195, 195, 382, 383, 252, 253, 254, 255, 388, 389, 0,   0,   0,   0,   0,   0,   0,   238, 211, 184, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    223, 195, 195, 195, 195, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   210, 239, 212, 213, 0,   0,   0,   0,   0,   0,   0,   0,   0,
                    195, 195, 195, 195, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   68,  67,  68,  238, 183, 240, 241, 244, 244, 244, 244, 244, 244, 244, 244, 244,
                    223, 195, 195, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   119, 68,  67,  210, 211, 268, 271, 272, 271, 272, 271, 272, 271, 272, 271, 272,
                    195, 195, 0,   0,   0,   0,   0,   0,   67,  68,  0,   0,   0,   0,   0,   0,   0,   0,   0,   238, 239, 298, 299, 298, 299, 298, 299, 298, 299, 298, 299, 298,
                    223, 0,   0,   0,   0,   0,   0,   0,   119, 0,   0,   0,   0,   0,   0,   0,   67,  68,  0,   210, 267, 326, 327, 326, 327, 326, 327, 326, 327, 326, 327, 326,
                    195, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   67,  68,  0,   0,   352, 353, 354, 355, 354, 355, 354, 355, 354, 355, 354, 355, 354,
                    223, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   381, 382, 383, 382, 383, 382, 383, 382, 383, 382, 383, 382,
                    0,   0,   0,   67,  68,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   67,  68,  0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   67,  68,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    194, 167, 0,   0,   0,   0,   0,   0,   67,  68,  5,   5,   65,  66,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   19,  20,  21,  20,  21,
                    222, 195, 0,   0,   0,   0,   0,   68,  119, 67,  68,  5,   93,  94,  0,   0,   0,   0,   0,   0,   0,   0,   0,   67,  68,  0,   46,  47,  48,  49,  48,  49,
                    194, 223, 0,   0,   0,   0,   0,   0,   68,  119, 5,   5,   5,   5,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   73,  74,  75,  76,  77,  76,  77,
                    222, 195, 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   100, 101, 102, 103, 104, 105, 104, 105,
                    78,  50,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  21,  20,  128, 129, 130, 131, 0,   0,   0,   0,
                    106, 107, 49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  49,  48,  156, 157, 158, 0,   0,   0,   0,   0
                ]
            },
            {
                name: "top",
                data: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            }
        ],

        collisions: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],

        animations: [
            {
                tileID: 119,
                tiles: [119,120,121]
            }
        ],

        entities: [
            {
                type: "bush",
                x: 96,
                y: 128,
                width: 16,
                height: 16,
                tileID: 63
            }
        ],

        tilesets: [
            {
                source: "overworld.png",
                width: 224,
                height: 112
            }
        ]
    }

{% endhighlight %}

I’ve kept in the grid format so it was easier for me to edit, but that will be removed soon enough. But, how’s that looking so far?

![gif](/assets/img/articles/7-zelda-animated.gif)

Damn good, if I say so myself. Err... ignore that bush, it was just an experiment. And also ignore the weird bit left of the cave... It was all getting quite fiddly.

For collisions, I kept the function the same but just pointed to the new collisions array instead of the previous level array.

Phew, take a break, that was a lot to get through. But we’re not quite done yet...

## Breaking up the Map

As we discerned earlier, NES Zelda maps are broken up in to screens or, as we’ll call them from now on, rooms. The overworld is a behemoth at 4096px by 1408px:

<a href="/assets/img/articles/7-zelda-overworld-full.png">
![nes zelda overworld full](/assets/img/articles/7-zelda-overworld-thumb.png)
</a>
<small>(click to see full size)</small>

It is also conveniently a perfect rectangle. The dungeons, however are structured more like a web:

<a href="/assets/img/articles/7-zelda-dungeon1-full.png">
![nes zelda dungeon1 full](/assets/img/articles/7-zelda-dungeon1-thumb.png)
</a>
<small>(click to see full size)</small>

So my initial idea was to have one huge grid array per map which I could then reference a specific cell from, a bit like a spritesheet. But that means a lot of wasted space when it comes to the dungeons (whole rooms of layers of zeros). A more efficient structure would be to have groups of layers per room and each have their own ID. Then it’s a case of linking rooms to each other by using door entities. So something like:

{% highlight js %}
"maps": {
    "overworld": {
        "rooms": {
            "o1-1": {
                "layers": [
                    {
                        "name": ground",
                        "data": []
                    },
                    {
                        "name": world",
                        "data": []
                    }
                ],
                "collisions": [],
                "entities": [{}, {}]
            },
            {}...
        }
    },
    "dungeon1": {
        "rooms": {
            "d1-1": {
                "layers": [{},{}],
                "collisions": [],
                "entities": [{},{}]
            }
        }
    },
    {}...
}
{% endhighlight %}

And taking advantage of the fact that this game ‘engine’, so-to-speak, is not multipurpose, we can take some shortcuts. For example, we know how map traversal works: If Link can reach the edge of a screen (not blocked by collision tiles) then the screen transitions to next screen on the grid. When he enters a cave entrance or dungeon, the game loads the relevant map without a transition. Cave and dungeon entrances should definitely be entities, as their locations differ depending on the screen, but the map traversal only needs to know that Link reached an edge of the map and, knowing which grid coordinate Link us currently in, can calculate which edge and thus determine the next screen to load. So once we’ve created all our screens in the future editor, all we need to do is create an array of rooms at their respective grid coordinates for the game to load:

{% highlight js %}
overworld: [
    "o1-1", "o1-2", "o1-3",
    "o1-4", "o1-5", "o1-6",
    "o1-7", "o1-8", "o1-9",
]
{% endhighlight %}

Or, for a more web-like dungeon, just leave the rooms empty:

{% highlight js %}
dungeon1: [
    0,      "d1-5", "d1-6",
    0,      "d1-4", 0,
    "d1-2", "d1-1", "d1-3",
]
{% endhighlight %}

I’m using a lot of ID based objects at the moment. It should make it easier to reference what I need quickly. I decided to use a convention to name the rooms. So, **o1-1** is overworld map 1, room 1. **d1-2** would be dungeon 1, room 2, etc... Much better than having either `id: "blah"` where you would have to loop through each object every time to find the room you’re looking for and better than using numbers which are very likely to change during development.

So let’s add a second overworld room using the same data as room one and test this out.

Currently, on each loop, we take the room’s layers, loop through them and draw the tiles to the screen. In order to transition to another room, as opposed to simply switching to the next room on the next frame (or show a loading screen), we need to draw a second room off-screen placed on the side of the direction we’re heading to and then scroll both rooms along until only the new room is visible, then stop drawing the old room. Right then.

It’s time to start grouping functionality into their own objects. The majority of which will be handled in a future post on the game engine proper.

We shall start with

{% highlight js %}
var Map = {}
{% endhighlight %}

Going with the standard object approach for now, rather than a function object as at the moment I’ve no intention of creating more than one map at a time.

In this object we want to store a load of variables to do with the map, current grid cell and room ID. Then some for the next grid and room, and some for the transitioning between rooms. And, finally, a few functions to clean up the logic of drawing the background, singular rooms and handling the loading of the next room. Like so:

{% highlight js %}
var Map = {

    currentMapID:       null,
    currentGridCell:    0,
    currentRoomID:      null,
    nextGridCell:       0,
    nextRoomID:         null,
    nextRoomDir:        null,
    screenAnimating:    false,
    distanceToScroll:   0,
    speed:              2,
    count:              0,

    // called on game load to set initial values
    init: function(mapID, gridCell) {
        this.currentMapID       = mapID;
        this.currentGridCell    = gridCell;
        this.currentRoomID      = world.maps[this.currentMapID].structure.data[this.currentGridCell];
    },

    // Main workhorse function. Called in the main loop.
    // Handles tile animation logic, room transitions and the drawing of a room.
    drawBackground: function(elapsed) {

        // store and increment the tile sequence array based on the tile FPS.
        timeSinceLastTileFrameSwap += elapsed;

        if( timeSinceLastTileFrameSwap > tileUpdateTime ) {
            if( tileSequenceIdx < 2 ) {
                tileSequenceIdx++;
            }
            else {
                tileSequenceIdx = 0;
            }

            timeSinceLastTileFrameSwap = 0;
        }

        // save the stack so any following operations do not affect the rest of the game’s drawing operations
        ctx.save();

        // are we in a room transitioning state?
        if( screenAnimating ) {
            this.count += this.speed;

            // if we've scrolled enough then end this transitioning madness and set the current
            // room values to the where we've just scrolled to
            if( this.count >= this.distanceToScroll ) {
                this.count              = this.distanceToScroll;
                this.currentGridCell    = this.nextGridCell;
                this.currentRoomID      = this.nextRoomID;
                screenAnimating         = false;
            }

            // where to draw the next room
            var nextRoomX = 0;
            var nextRoomY = 0;

            // where to scroll to
            var scrollX = 0;
            var scrollY = 0;

            // Depending which direction we exited a room, we need to draw the next room.
            // e.g. If we moved up, the current screen is already at 0,0 so the next screen would be
            // at 0, -ROOM_HEIGHT.
            if( this.nextRoomDir == 'up' || this.nextRoomDir == 'down' ) {
                nextRoomY = this.nextRoomDir == 'up' ? -ROOM_HEIGHT : ROOM_HEIGHT;
                scrollY = nextRoomY > 0 ?  -this.count : this.count;
            }
            else {
                nextRoomX = this.nextRoomDir == 'left' ? -width: width;
                scrollX = nextRoomX > 0 ? -this.count : this.count;
            }

            // now with two screens stacked next to each other incrementally translate the whole canvas
            // in the direction of the new room.
            ctx.translate(scrollX, scrollY);

            this.drawRoom(this.nextRoomID, nextRoomX, nextRoomY);
        }

        this.drawRoom(this.currentRoomID, 0, 0);
        ctx.restore();
    },

    // handles all single room drawing logic
    drawRoom: function(id, posX, posY) {
        var room = world.maps[this.currentMapID].rooms[id];

        var x = 0;
        var y = 0;

        var layer1 = room.layers[0].data;
        var layer2 = room.layers[1].data;

        var spriteCols  = world.tilesets[0].width / TILE_WIDTH;

        // set a fillStyle of (off)black for background cells set to 0 (cave entrances, etc...)
        ctx.fillStyle = 'rgb(34,39,34)';

        for (var row = 0; row < NUM_TILES_HIGH; row++) {
            for (var col = 0; col < NUM_TILES_WIDE; col++) {

                var tile1   = layer1[( (row * NUM_TILES_WIDE) + col)];
                var tile2   = layer2[( (row * NUM_TILES_WIDE) + col)];
                x           = posX + (col * 8);
                y           = posY + (row * 8);

                // calculate position and draw ground tile
                if( tile1 > 0 ) {
                    var spriteCol1   = tile1 % spriteCols;
                    var spriteRow1   = Math.floor(tile1 / spriteCols);

                    ctx.drawImage(tileset, (spriteCol1 * TILE_WIDTH), (spriteRow1 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
                }
                // draw black/empty tile
                else {
                    ctx.fillRect(x, y, TILE_WIDTH, TILE_WIDTH);
                }

                // calculate position and draw world tile if one exists
                if( tile2 > 0 ) {

                    // if the world tile matches an ID of an animation tile, set the tile ID to the next in the sequence
                    if( animationTiles.indexOf(tile2) != -1 ) {
                        tile2 = tileSequences[tile2][tileSequenceIdx];
                    }

                    var spriteCol2   = tile2 % spriteCols;
                    var spriteRow2   = Math.floor(tile2 / spriteCols);

                    ctx.drawImage(tileset, (spriteCol2 * TILE_WIDTH), (spriteRow2 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
                }
            }
        }
    },

    loadNextRoom: function(dir) {
        // Cutting corners by assuming the player is confined to the maps’s grid structure.
        if( dir == 'left' ) {
            this.nextGridCell   = this.currentGridCell - 1;
            this.distanceToScroll = width;
        }
        else if( dir == 'right' ) {
            this.nextGridCell = this.currentGridCell + 1;
            this.distanceToScroll = width;
        }
        else if( dir == 'up' ) {
            this.nextGridCell = this.currentGridCell - world.maps[this.currentMapID].structure.width;
            this.distanceToScroll = ROOM_HEIGHT;
        }
        else if( dir == 'down' ) {
            this.nextGridCell = this.currentGridCell + world.maps[this.currentMapID].structure.width;
            this.distanceToScroll = ROOM_HEIGHT;
        }

        this.nextRoomDir    = dir;
        this.nextRoomID     = world.maps[this.currentMapID].structure.data[this.nextGridCell];
        this.count          = 0;
        screenAnimating     = true;
    }
}
{% endhighlight %}

As you can see, there’s now a function to help us load in other rooms, `loadNextRoom()` which we call when Link gets close enough to an edge of the screen:

{% highlight js %}
function checkCollisions() {
    //...

    // check the edge of the screen
    if( link.x <= (TILE_WIDTH / 2) ) { // left
        Map.loadNextRoom('left');
        link.x = TILE_WIDTH;
    }
    if( link.y <= (TILE_WIDTH / 2) ) { // up
        Map.loadNextRoom('up');
        link.y = TILE_WIDTH;
    }
    if( (link.x + link.width) >= (width - (TILE_WIDTH / 2)) ) { // right
        Map.loadNextRoom('right');
        link.x = (width - link.width - TILE_WIDTH);
    }
    if( (link.y + link.height) >= (height - HUD_HEIGHT - (TILE_WIDTH / 2)) ) { // down
        Map.loadNextRoom('down');
        link.y = (height - link.height - HUD_HEIGHT - TILE_WIDTH);
    }

    //...
}
{% endhighlight %}

I’ve got Link triggering the next room if he reaches half a tile’s distance from an edge, and we then move Link a full tile’s width away from the edge for now so we don’t keep triggering the room load. Later we need to move Link to the entrance of the new screen as if he just entered. But that’s for another day.

So, finally, we have a new function to add to our game’s init:

{% highlight js %}
function init() {
    //...

    // Set the starting grid area
    Map.init('overworld', 7);

    //...
}
{% endhighlight %}

And with that we have the basic structure for a game! Enough to get building our level editor, at any rate. Yes, it’s getting pretty hacky about now, but that’s fine. Have a play on the latest version below. It is prone to crashing if you walk aout of the map’s bounds, but having proper level structure in place will solve that. Next time we’ll be looking at creating the level editor and getting this world fleshed out! Until next yea--uhh... time!

## Progress

Check out the [progress on version 0.7](/experiments/super-js-adventure/0.7/)

Or [see all the source code](//github.com/gablaxian/super-js-adventure) on Github.
