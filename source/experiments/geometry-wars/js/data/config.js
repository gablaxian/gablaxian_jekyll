
'use strict';

/**
 * game constants
 */
const DEBUG             = 1;

const SCREEN_WIDTH      = 800; //1024;
const SCREEN_HEIGHT     = 600; //576;

//
const DIR = {
    UP:             0,
    UPRIGHT:        1,
    RIGHT:          2,
    DOWNRIGHT:      3,
    DOWN:           4,
    DOWNLEFT:       5,
    LEFT:           6,
    UPLEFT:         7,
};
const GAME_STATE = {
    PAUSED:         1,
    BOOTING:        2,
    START:          3,
    LOADING:        4,
    PLAYING:        5,
    LOSING:         6,
    QUITTING:       7,
    WINNING:        8,
};
const ENTITY_STATE = {
    SPAWNING:       1,
    THINKING:       2,
    TRAVELLING:     3,
    ATTACKING:      4,
    HURT:           5,
    DYING:          6,
    DEAD:           7,
};
const KEYS = {
    UP:             'W',
    LEFT:           'A',
    DOWN:           'S',
    RIGHT:          'D',
    START:          'ENTER',
    SELECT:         'SHIFT',
    ATTACK:         'SPACE',
    ITEM:           'S',
    SHOOTUP:        'UP',
    SHOOTLEFT:      'LEFT',
    SHOOTRIGHT:     'RIGHT',
    SHOOTDOWN:      'DOWN',
};
