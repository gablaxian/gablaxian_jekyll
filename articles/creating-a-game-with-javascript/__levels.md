---
layout: article-game-dev
title: Levels
disqus: true
---

This area of game development has given me the most grief of all. There are just so many ways to do this, usually specific to your game, and so few tutorials or discussions about it.

What we have is a top-down game, which lends itself to being a tile-based game very well.

A level is a database of images and their positions, players and other entities and their positions, collisions and triggers.

Now, should our level be:

- a series of grid databases: one of tile images, one of tile collisions, one of entities
- one DB of tile objects where each object is a an image, whether it has collision, destructibility, animation, etc? Then another with entities and their types/positions?
- one big background image with separate grids to layer enhanced tiles, such as animated or destructible tiles, entities, etc...?