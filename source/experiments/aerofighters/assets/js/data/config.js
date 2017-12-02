
'use strict';

const DEBUG = 1;

const SCREEN_WIDTH  = 332;
const SCREEN_HEIGHT = 224;

const DIR   = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 };

const CONFIG = {

    images: [
        { id: 'fighters',   url: 'assets/img/fighters.png' },
        { id: 'enemies',    url: 'assets/img/enemies.png' },
    ],

    audio: [],

    fonts: [],

    messages: []

};


const ENEMIES = {

    green_helicopter: { sX: 0, sY: 320 },

}