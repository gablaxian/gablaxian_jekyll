const CONFIG = {
    version: "0.1",

    asset_path: "images/tilesets/",

    maps: [
        { "name": "overworld",  "width": (32 * 16), "height": (22 * 8) },     // 32 tiles * 16 rooms by 22 tiles * 8 rooms (512x176 tiles)
        { "name": "dungeon1",   "width": (32 * 6),  "height": (22 * 6) },
        { "name": "dungeon2",   "width": (32 * 4),  "height": (22 * 8) },
        { "name": "dungeon3",   "width": (32 * 5),  "height": (22 * 6) },
        { "name": "dungeon4",   "width": (32 * 4),  "height": (22 * 8) },
        { "name": "dungeon5",   "width": (32 * 4),  "height": (22 * 8) },
        { "name": "dungeon6",   "width": (32 * 6),  "height": (22 * 8) },
        { "name": "dungeon7",   "width": (32 * 6),  "height": (22 * 8) },
        { "name": "dungeon8",   "width": (32 * 5),  "height": (22 * 8) },
        { "name": "dungeon9",   "width": (32 * 8),  "height": (22 * 8) },
        { "name": "cave1",      "width": (32 * 1),  "height": (22 * 1) },
    ],

    // the customisable tileset layers.
    // Required layers like collisions and entities are added automatically
    layers: [
        { "name": "bg" },
        { "name": "world" },
        { "name": "entities" },
        { "name": "top" },
        { "name": "collision" },
    ],

    tilesets: [
        { "name": "overworld-terrain",  "src": "overworld-terrain.png" },
        { "name": "overworld-cliffs",   "src": "overworld-cliffs.png" },
        { "name": "overworld-flora",    "src": "overworld-flora.png" },
        { "name": "water",              "src": "water.png" },
        { "name": "misc",               "src": "misc.png" },
        { "name": "caves",              "src": "caves.png" },
        { "name": "dungeon",            "src": "dungeon.png" },
    ],

    patterns: [
        { "tileset": "overworld-terrain",   "data": [46, 57] },
        { "tileset": "overworld-terrain",   "data": [[87, 98], [98, 87]] },
        { "tileset": "overworld-cliffs",    "data": [[14, 15], [34, 35], [48, 49], [62, 63]] },
        { "tileset": "overworld-cliffs",    "data": [[82, 30, 31, 28], [96, 44, 45, 42]] },
        { "tileset": "overworld-cliffs",    "data": [[29, 33, 32, 83], [43, 47, 46, 97]] },
        { "tileset": "overworld-cliffs",    "data": [[70, 77], [58, 70], [72, 73], [86, 87], [50, 101], [null, 50]] },
        { "tileset": "overworld-cliffs",    "data": [[76, 71], [71, 61], [74, 75], [88, 89], [102, 51], [51, null]] },
    ],

    entities: [
        { "id": "bush1",    "tileset": "overworld-terrain", "data": [66, 77] },
        { "id": "grass",    "tileset": "overworld-terrain", "data": [82, 93] },
        { "id": "tree",     "tileset": "overworld-flora",   "data": [170, 224] },
    ],

    animations: [
        { "tileset": "overworld-terrain", "tiles": [101, 102, 103] },

        { "tileset": "water", "tiles": [46, 74, 102] },
        { "tileset": "water", "tiles": [47, 75, 103] },
        { "tileset": "water", "tiles": [60, 88, 116] },
        { "tileset": "water", "tiles": [61, 89, 117] },

        { "tileset": "water", "tiles": [50, 78, 106] },
        { "tileset": "water", "tiles": [51, 79, 107] },
        { "tileset": "water", "tiles": [64, 92, 120] },
        { "tileset": "water", "tiles": [65, 93, 121] },

        { "tileset": "water", "tiles": [28, 29, 30] },

        { "tileset": "water", "tiles": [31, 33, 35] },
        { "tileset": "water", "tiles": [32, 34, 36] },
    ],

    grids: [
        [8, 8],
        [256, 176], // the size of one room
    ]
}