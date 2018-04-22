
/*
 * Entities
 */
const ENEMIES = {
    diamond:        { color: [135,255,255], width: 40, height: 40, points: [[5,0],[8,5],[5,10],[2,5]] },
    square_diamond: { color: [110,248,111], width: 40, height: 40, points: [[0,0],[10,0],[10,10],[0,10],[5,0],[10,5],[5,10],[0,5]] },
    square_cross:   { color: [255,126,255], width: 40, height: 40, points: [[0,0],[10,0],[10,10],[0,10]] },
    pinwheel:       { color: [250,128,250], width: 40, height: 40, points: [ [5,0],[7.5,2.5],[5,5], [10,5],[7.5,7.5],[5,5], [5,10],[2.5,7.5],[5,5], [0,5],[2.5,2.5],[5,5] ] },
};

const PHASES = {
    level1: {
        phase1: {
            0: [{ type: 'pinwheel', x: 600, y: 30 }],
            4: [{ type: 'pinwheel', x: 700, y: 60 }],
            8: [
                { type: 'pinwheel', x: 250, y: 400 },
                { type: 'pinwheel', x: 700, y: 300 },
                { type: 'diamond',  x: 400, y: 500 },
            ],
        }
    }
}
