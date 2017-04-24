---
layout: article-game-dev
title: The Game Engine - Part 1
categories:
    articles
    creating-a-game-with-javascript
tags: super-js-adventure javascript
---

A game engine is, simply enough, all the functions, classes, modules, etc&hellip; which provide the base of a game.

It is a relatively new term, being coined around the time of Doom and Quake, when computers were powerful enough and had the required space and memory to break up the system into reusable components. Before that, aside from the odd algorithm, game code was specific to that game.

Today, the term game engine could describe the big, complex applications that power Triple A titles like Doom, Skyrim or Call of Duty, or it could just be the product of crafting ones’ game using maintainable, modular code and _not_, as we are currently doing, winging it.

For our game, we’ll be taking the second route. Crafting a flexible, multi-purpose game engine is complicated, unecessary and completely out of scope. There are a number of existing engines out there for when we need that complexity.

## Planning the engine

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

