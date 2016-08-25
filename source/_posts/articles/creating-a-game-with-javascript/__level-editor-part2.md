---
layout: article-game-dev
title: Building a level editor - part 2
categories:
    articles
    creating-a-game-with-javascript
tags: super-js-adventure javascript
---

## What is a map?
- Dimensions in tile width/height
- Array of layers

## What is a layer?
- Array of tile data

## Things found out during development

- It’s easier to create maps in one big grid. Thereby allowing the game to decide what is a ‘room’, etc... The editor should just make it as easy as possible to place tiles.
- Once a map reaches beyond a certain size (not sure what that is), using HTML to place tiles became too slow, taking minutes to load a map, and often crashing the browser. Therefore, canvas was the only option.
- Sizing the canvas and its tiles is... interesting. Our tiles are 8x8, but that’s too small and fiddly to lay out a full map in. We would prefer 2-4 times that size (or larger) for sustained map creation. This creates slight issues when using the canvas.
    - A full overworld sized canvas already large (4096px by 2112px), but zoomed in by even 4 is understandably taxing for the browser (16384px by 8448px).
    - We would possibly look to creating a map based on the original size, and use CSS to zoom, as with the game. However, placing images onto a CSS zoomed canvas causes images to be blurry, even thought the correct pixelation CSS is applied. On further exploration, it turns out that this no longer happens on Chrome Beta, but still does on Chrome Canary :/ (Have not tried other browsers).
    - Tile images need separately resizing for use in the tile selector panel.
