---
layout: article-game-dev
title: Levels - Part 2
categories:
    articles
    creating-a-game-with-javascript
---

We’re going to continue our journey into levels because, as mentioned in part 1, they are our database; the foundations onto which we build. A bad choice here could have us rewriting a _lot_ of code in the future. In the last part when we created our level using a multidimensional array. As it is, this method will not scale. Let us look at a couple of reasons why.

 we made a number of assumptions:

- Our game would only ever be 32 columns and 28 rows.
- All images will be 8x8 pixels.
- Walls are the only form of collision.

Let's challenge those assumptions and explore the limitations of level databases.

A multidimensional array has been useful so far in illustrating how to lay out a game screen’s information but it may not suit us in the long-term. It does handily allow us to arrange its contents into something visually useful, even to the point of building the entire game’s overworld in this way, if we desired. But Zelda has a lot of screens worth of data. 12x6, maybe? That’s 96x36, or, 3,456 cells. There’s no way we’re going to be doing that much by hand. Instead we’ll be crafting a level editor later. Outputting to a multidimensional array is both trickier to automate, and also locks down the level editor to needing to understand the concept of screen size. It also keeps the game locked down to the concept of screen size. This prohibits the ability to alter it later without a lot of reworking. This could happen if we decide to add the black area at the top of the screen for the HUD.

The fix for this is to use a single array. Currently, to access the multi array, we use code like so:

level = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

for (var row = 0; row < max_rows; row++) {
    for (var col = 0; col < max_cols; col++) {
        var tile = level[row][col];
    }
}

Quite clean and visually understandable, but by switching to a single array, we would need to calculate where in the array each row and column begins:

level = [0,0,0,0,0,0,0,0,0];

for (var row = 1; row < max_rows+1; row++) {
    for (var col = 1; col < max_cols+1; col++) {
        var tile = level[(row*col)-1];
    }
}

We _could_ lay out the array like the multi array:

level = [
    0,0,0,
    0,0,0,
    0,0,0
];

But that would break down once we added more screens. Also, we’ll soon stop editing by hand and instead interact through a level editor, so how it looks it no longer a concern.

Another downside to the multi array option is that if, for whatever reason, we decide to change the resolution later, well, it would become... problematic. Are we likely to change the resolution for our game? No. But I want to cover all bases here. Increasing the resolution, particularly on a sprite-based game like this, means we draw everything smaller and unless we just want to shrink the game screen, it would mean drawing more of the level. Imagine the hacky code you would be writing on a multi array to draw 36 columns from a 32 column multi array. Contrasting that to a single array, all we’d need to do is change the `max_cols` in the game config.

## Limitation 2

At the moment, we are using 3 numbers to denote the 3 different tile types we’ve established so far. Fine for now, but the first issue I’ve got with this is that the game engine needs to store and handle all the information about each tile itself. It checks for 0, 1 and 2 and knows which number does what. This seems incredibly fragile. What if the numbers change? Everything breaks. For each new number, we’d need to add another case to the switch statement. Surely the level, as our database, should store these relationships? Also, a single integer doesn’t provide any properties of any of the tiles. How are we going to store destructible tiles? What about if there are other types of tile which Link cannot walk through?

We can solve this two ways. Firstly, multiple arrays:

level = [2,2,0,2,2,1,1,0,0];
collisions = [1,0,1,1,0,0,1,0,0];

Or how about storing objects?

level = [
    {
        type: dirt,
        image: 'dirt.png',
        collision: 0,
        destructible: 0
    },
    {
        type: water,
        image: 'water1.png',
        collision: 0,
        destructible: 0
    },
    {
        type: rock,
        image: 'rock2.png',
        collision: 1,
        destructible: 1
    },
]

This way we could query each invidual tile. While walking, you could do `if(tile.collision == 1) { // prevent link from walking }`.

## Limitation 3 - Image positions

I’ll admit it. This is the reason I’ve stalled for so long on this project. I trust you’re sitting comfortably, for I shall now elaborate. The original Zelda is a NES game and every image in it is 4x4px. If I were rebuilding this game as it is, we would be having this discussion. Each tile would be its own image (or not, as in the case of the ground textures) and they would be loaded and drawn as a simple sprite-sheet. Zelda:LttP, however, _seems_ to have images of varying sizes. I say ‘seems’ because I'm getting the images off of a website which pulled them from the game. I don’t know whether the larger images
were actually broken up and stored as 8x8 tiles. All I know is that there are occasions in the game where, say, a tree is drawn from off-screen with only the bottom right being visible. This has been giving me all kinds of headaches because if all images were inside the viewport, I could set a number as the tree tile in the level database and draw it as large as it needs to be, cells which it covered just would be empty and so draw nothing. But even this requires storing the width and height of that particular tile. But with the images being also drawn offscreen, I would also need to store positions of the image and somehow perform a clipping algorithm which determined how much of the image to show and draw it, or start drawing offscreen which does not fit in with the cell drawing loop we’ve written. So which way do I go?
