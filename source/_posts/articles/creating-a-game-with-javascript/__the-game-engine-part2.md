---
layout: article-game-dev
title: The Game Engine - Part 2
categories:
    articles
    creating-a-game-with-javascript
tags: super-js-adventure javascript
---



## Planning the engine

Something I failed at miserably with the editor was creating a robust vocabulary for the parts of the system. I was using thing like viewport, screen, layer, etc&hellip; like they were _just words_. Shame on me.

Now is the point where we need to look at what our game consists of and try and gauge how they all connect. Then, we slowly start fleshing out all the components. So, to start, we need to identify all the parts which make up our game. Thankfully, we’re in the rather fortunate position of having the game already built for us to examine. So what do we know?

- Top-down game
- Levels divided into 'screens'
- levels divided into tiles
- Layers of tiles
- Overworld map
- 9 dungeons
- Several caves
- Tile types:
    - Dirt/grass/sand
    - Water
- Entities:
    - Player
    - Enemy
    - Door
    - Movable/Destructible scenery
    - Trap

