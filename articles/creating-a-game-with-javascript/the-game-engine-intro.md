---
layout: article-game-dev
title: The Game Engine - Intro
disqus: true
---

Originally, I’d hoped to build most, if not all, of the level editor first. But, after throwing together a quick prototype I began to quickly hit a number of questions around how to structure and store these levels. Questions which could only be answered through building the ‘game engine’. I couldn’t really lay out a level without knowing how it would be stored, along with the game world objects otherwise I’d probably end up having to rewrite the whole thing. I mean, how can you build an editor for something that doesn’t yet exist?

So, instead, let’s talk about the game engine.

## What is a Game Engine?

A game engine is a somewhat nebulous concept. It is the foundation for a game; an API of sorts. It is the collection of all the various components of a game and handles interactions between each.

It is a relatively new term, being coined around the time of Doom and Quake, when computers were powerful enough and had the required space and memory to break up the system into reusable components. Before that, aside from the odd algorithm, game code was specific to that game.

Today, the term game engine could describe the big, complex applications that power Triple A titles like Doom, Skyrim or Call of Duty, or it could be a well thought-out collection of maintainable classes and functions specific to smaller, independant games.

For our game, we’ll be taking the second route. Crafting a flexible, multi-purpose game engine is complicated, unecessary and completely out of scope. There are a number of HTML engines out there for when we need that complexity.

## Planning the engine

If we do this correctly, the game engine is the largest part of a game. It’s where we need to look at what our game consists of and try and gauge how they all connect. Then, we slowly start fleshing out all the components. Sure, we could continue on as we have been, building objects and functions as we need them, but that will quickly become confusing and hard to maintain.

So, to start, we need to identify all the parts which make up our game. Thankfully, we’re in the rather fortunate position of having the game already built for us to examine. So what do we know?

- Top-down game
- Levels divided into 'screens'
- levels divided into tiles
- Overworld
- 9 Dungeons
- entities:
    - player
    - enemies
    - traps?
- object types:
    - bg tile (basic floor. no collisions or actions)
    - blocked tile (walls, etc...)
    - water tile
    - destructible tile (bushes which can be cut, etc...)
    - trigger tile (cave entrances, etc...)
- items

Connecting all these together are:

- Loader (image loading and scaling)
- Physics & collision
- Sound
- AI
- UI
