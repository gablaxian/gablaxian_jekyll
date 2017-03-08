
'use strict';

let Shredder = {

    init() {
        this.img            = Game.spritesheets['shredder'].img;

        //
        this.posX           = 165;
        this.posY           = 200;
        this.width          = 64;
        this.height         = 96;
        this.depth          = 20;

        //
        this.spriteX        = 0; // these will be set once we start drawing the sprites
        this.spriteY        = 0;
        this.spriteWidth    = 0;
        this.spriteHeight   = 0;

        //
        this.speed          = 1;
        this.floatSpeed     = 2;    // floats faster than walking
        this.health         = 32;
        this.hitNumber      = 0;
        this.maxHits        = 4;

        // States
        this.isEntering     = 1;
        this.isTravelling   = 0;    // walking
        this.isFloating     = 0;
        this.isCharging     = 0;
        this.isAttacking    = 0;
        this.isDefending    = 0;    // the flames which engulf Shredder.
        this.isHurt         = 0;
        this.isDying        = 0;
        this.isDead         = 0;

        this.tweens         = [];
        this.timelines      = [];

        // Sprite Info
        this.spriteProperties   = {
            'stand-left':           { width : 64,   height: 96,     sX: 47,     sY: 232 },
            'stand-right':          { width : 64,   height: 96,     sX: 47,     sY: 7 },

            'float-left':           { width : 48,   height: 112,    sX: 0,      sY: 223 },
            'float-right':          { width : 48,   height: 112,    sX: 0,      sY: 0 },

            'charge-left':          { width : 72,   height: 96,     sX: 183,    sY: 232 },
            'charge-right':         { width : 72,   height: 96,     sX: 175,    sY: 7 },

            'attack-down-left':     { width : 72,   height: 96,     sX: 168,   sY: 344  },
            'attack-down-right':    { width : 72,   height: 96,     sX: 0,     sY: 120  },
            'attack-forward-left':  { width : 72,   height: 96,     sX: 80,    sY: 344  },
            'attack-forward-right': { width : 72,   height: 96,     sX: 80,    sY: 120  },

            'hurt-left':            { width : 64,   height: 96,     sX: 304,   sY: 344  },
            'hurt-right':           { width : 64,   height: 96,     sX: 240,   sY: 119  }
        }

        this.sequenceIdx    = 0;
        this.sequences      = {
            'stand-left':           [0],
            'stand-right':          [0],

            'float-left':           [0],
            'float-right':          [0],

            'walk-left':            [0,1],
            'walk-right':           [0,1],

            'charge-left':          [0,1,2],
            'charge-right':         [0,1,2],

            'attack-down-left':     [0],
            'attack-down-right':    [0],
            'attack-forward-left':  [0],
            'attack-forward-right': [0],

            'hurt-left':            [0],
            'hurt-right':           [0]
        };
        this.seq            = 'float';
        this.oldSeq         = 'stand';
        this.facing         = 'left';

        this.fps                    = 12.5;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        // Always start with the entering sequence
        this.enter();

    },

    /***********************************
     * Coordinate functions
     **********************************/

    getCenterPoint() {
        return {
            x: this.posX + (this.width/2),
            y: this.posY + (this.depth/2)
        }
    },

    getX() {
        return this.getCenterPoint().x;
    },

    getY() {
        return this.getCenterPoint().y;
    },

    setX(x) {
        this.posX = x;
    },

    setY(y) {
        this.posY = y;
    },

    getCollisionRect() {
        return {
            x1: this.posX,
            y1: this.posY,
            x2: this.posX + this.width,
            y2: this.posY + this.depth
        }
    },


    /***********************************
     * States
     **********************************/

    enter() {
        if( !DEBUG ) {
            Game.audio['bgm-boss'].play();
        }

        // start one height's length above the screen.
        let t1 = new Tween(this, { posY: -this.height }, { posY: 180 }, 6300, {
            onComplete: () => {
                console.log('shift to charging');
                Game.hud.showBossHealth();

                this.isEntering = 0;
                this.isCharging = 50;
            }
        });

        this.tweens.push( t1 );
    },

    float() {
        this.seq        = 'float';
        this.isFloating = 1;

        // create new timeline
        let tl = new Timeline();
        this.timelines.push(tl);

        // randomise new location (in the bounds of the floor)
        let newX = Math.floor(Math.random() * Game.width) - (this.width/2)
        let newY = 140 + Math.floor(Math.random() * 80) - this.depth;

        console.log(newX, newY);

        let floatUp     = new Tween(this, { spriteY: 0 }, { spriteY: -20 }, 1000);
        let move        = new Tween(this, { posX: this.posX, posY: this.posY }, { posX: newX, posY: newY }, 1000);
        let floatDown   = new Tween(this, { spriteY: -20 }, { spriteY: 0 }, 1000);

        tl.add(floatUp).add(move).add(floatDown);

        this.timelines.push(tl);

        tl.onComplete = () => {
            console.log('shift to charge');
            this.isFloating = 0;
            this.isCharging = 50;
        }
    },

    attack() {
        this.isAttacking = 1;
    },

    hurt() {
        if( this.isEntering )   return false;
        if( this.isFloating )   return false;


        if( this.hitNumber < this.maxHits ) {
            console.log('boss hurt');

            this.isAttacking    = 0;
            this.isHurt         = 30;
            this.hitNumber      += 1;
            this.seq            = 'hurt';

            this.health         -= Game.player.damage;

            if( this.health <= 0 ) {
                this.kill();
            }
        }

    },

    kill() {
        console.log('boss dying');

        this.isHurt         = 0;
        this.isDying        = 1;

        this.die();
    },

    die() {
        console.log('boss dead');

        this.isDying        = 0;
        this.isDead         = 1;

        Game.audio['bgm-boss'].pause();
    },

    animate(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {
            var seq = this.seq + '-' + this.facing;

            var currentSequence         = this.sequences[seq];
            var {width, height, sX, sY} = this.spriteProperties[seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % width;

            this.spriteWidth    = width;
            this.spriteHeight   = height;
            this.offsetX        = (col * width) + sX;
            this.offsetY        = sY;

            this.timeSinceLastFrameSwap = 0;
        }

    },

    update(elapsed) {

        // make sure enemy is facing the player at all times.
        if( Game.player.getCenterPoint().x < this.getCenterPoint().x ) {
            this.facing = 'left';
        }
        else {
            this.facing = 'right';
        }



        // Decide what to do.
        // Shredder follows something like:
        // 1. Charge
        // 2. Shoot/Attack
        // 3. Float to new location


        // Handle the states
        if( this.isEntering ) {
            //
        }
        else if ( this.isCharging && this.isCharging-- ) {
            this.seq = 'charge';

            if( this.isCharging == 0 ) {
                console.log('shift to attacking');

                // choose an attack type here.
                let attackType = Math.random() < 0.35 ? 'forward' : 'down';

                this.seq = 'attack' + '-' + attackType;

                if( attackType == 'forward') {
                    Game.addProjectile( (this.facing == 'left' ? this.posX : (this.posX + this.width)), this.posY-this.height+20, this.facing);
                }
                else if( attackType == 'down' ) {
                    let flamer = Object.create(Flames);

                    flamer.init( (this.facing == 'left') ? (this.posX - 10) : (this.posX + this.width + 10) , this.getCenterPoint().y, this.facing);
                    Game.projectiles.push(flamer);
                }

                this.isAttacking = 50;
            }
        }
        else if( this.isAttacking && this.isAttacking-- ) {
            // which attack? Is it random? It mostly seems to be the ground attack.

            if( this.isAttacking == 0 ) {
                console.log('shift to floating');
                this.float();
            }
        }
        else if( this.isHurt && this.isHurt-- ) {
            if( this.isHurt == 0 ) {
                // tween away from player briefly, then go into float mode.
                let finalX = this.facing == 'left' ? this.posX + 5 : this.posX - 5;
                let finalY = Math.random() < 0.5 ? this.posY - 5 : this.posY + 5;
                let tween = new Tween(this, { posX: this.posX, posY: this.posY }, { posX: finalX, posY: finalY }, 100, {
                    onComplete: () => {
                        this.hitNumber = 0;
                        this.float();
                    }
                });

                Game.tweens.push(tween);
            }
        }
        else if( this.isFloating ) {
            //
        }
        else if( this.isTravelling ) {

        }
        else if( this.isDefending ) {

        }
        else if( this.isDying ) {

        }
        else if( this.isDead ) {

        }
        else {
            // this.seq = 'stand';
        }

        // tweens
        for (var i = 0; i < this.tweens.length; i++) {
            if( this.tweens[i].isAnimating() ) {
                this.tweens[i].update(elapsed);
            }
            else {
                this.tweens.splice(i, 1);
                i--;
            }

        }

        // timelines
        for (var i = 0; i < this.timelines.length; i++) {
            if( !this.timelines[i].isFinished() ) {
                this.timelines[i].update(elapsed);
            }
            else {
                this.timelines.splice(i, 1);
                i--;
            }
        }

        // sprite animation
        this.animate(elapsed);

    },

    draw(context) {

        if( DEBUG ) {
            // draw collison rectangle
            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( this.getCollisionRect().x1, this.getCollisionRect().y1, this.width, this.depth );
        }

        if( this.isFloating ) {
            // draw shadow
            context.drawImage(this.img, 416, 16, 26, 12, this.getCenterPoint().x-13, this.getCenterPoint().y-6, 26, 12);
        }

        // use the spriteX/Y values as relative values.
        let x = (this.getCenterPoint().x - (this.spriteWidth/2)) + this.spriteX;
        let y = (this.getCenterPoint().y - this.spriteHeight) + this.spriteY;

        context.drawImage(this.img, this.offsetX, this.offsetY, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
    }

};
