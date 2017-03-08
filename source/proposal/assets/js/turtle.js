
'use strict';

let Turtle = {

    init(x, y) {
        this.img            = Game.spritesheets['turtles'].img;

        // New idea for the coordinates.
        // Every entity's location is defined by their 'base'. Where their shadow sits, ultimately.
        // It has a width and depth(height) seeing as this is an isometric game.
        this.posX           = x;
        this.posY           = y;
        this.width          = 40;
        this.height         = 64; // mostly used for entity collision
        this.depth          = 10;

        // However, an entity's img/sprite is a different set of coordinates.
        // It lives relatively to the base's centerPoint: x: x + width/2, y: y + depth/2.
        // This way the image sits in the middle at all times and we don't get horrible, jarring shifts between sprite changes.
        // It also means that we can move the image independently of the entity's actual location, like in the case of jumping, where the shadow remains at the entity's coords, but the image parabolas up and down.
        this.spriteX        = 0; // these will be set once we start drawing the sprites
        this.spriteY        = 0;
        this.spriteWidth    = 0;
        this.spriteHeight   = 0;

        //
        this.lives          = 3;
        this.speed          = 2;
        this.health         = 16;
        this.damage         = 2;

        // states (this is a truly horrible way to handle states)
        this.isAttacking    = 0;
        this.isJumping      = 0;
        this.isHurt         = 0;
        this.isDying        = 0;
        this.isDead         = 0;

        this.allowAttack    = true;
        this.allowJumping   = true;
        this.moving         = {};
        this.facing         = 'right';

        this.attackNumber   = 1;

        this.spriteProperties   = {
            'stand-left':       { width : 72,   height: 56,     sX: 0,      sY: 184 },
            'stand-right':      { width : 72,   height: 56,     sX: 0,      sY: 128 },

            'walk-left':        { width : 40,   height: 64,     sX: 0,      sY: 64  },
            'walk-right':       { width : 40,   height: 64,     sX: 0,      sY: 0   },
            'walk-up-left':     { width : 40,   height: 64,     sX: 120,    sY: 64  },
            'walk-up-right':    { width : 40,   height: 64,     sX: 160,    sY: 0   },

            'run-left':         { width : 40,   height: 64,     sX: 248,   sY: 64   },
            'run-right':        { width : 40,   height: 64,     sX: 248,   sY: 0    },

            'jump-left':        { width : 32,   height: 72,     sX: 176,   sY: 248  },
            'jump-right':       { width : 32,   height: 72,     sX: 0,     sY: 248  },

            'attack1-left':     { width : 72,   height: 72,     sX: 0,     sY: 528  },
            'attack1-right':    { width : 72,   height: 72,     sX: 0,     sY: 448  },
            'attack2-left':     { width : 72,   height: 72,     sX: 0,     sY: 528  },
            'attack2-right':    { width : 72,   height: 72,     sX: 0,     sY: 448  },
            'attack3-left':     { width : 72,   height: 72,     sX: 0,     sY: 528  },
            'attack3-right':    { width : 72,   height: 72,     sX: 0,     sY: 448  },

            'hurt-left':        { width : 72,   height: 64,     sX: 0,     sY: 384  },
            'hurt-right':       { width : 72,   height: 64,     sX: 0,     sY: 320  },

            'toepain-left':     { width : 32,   height: 80,     sX: 0,     sY: 608  },
            'toepain-right':    { width : 32,   height: 80,     sX: 0,     sY: 608  },

            'cowabunga-left':   { width : 32,   height: 80,     sX: 0,     sY: 608  },
            'cowabunga-right':  { width : 32,   height: 80,     sX: 0,     sY: 608  },
        }

        this.sequenceIdx    = 0;
        this.sequences      = {
            'stand-left':       [0,0,0,0,0,0,0,2,1,4,3,2,1,4,3,2],
            'stand-right':      [0,0,0,0,0,0,0,3,4,1,2,3,4,1,2,3],

            'walk-left':        [1,1,2,2,1,1,0,0],
            'walk-right':       [1,1,2,2,1,1,0,0],
            'walk-up-left':     [1,1,2,2,1,1,0,0],
            'walk-up-right':    [1,1,2,2,1,1,0,0],

            'run-left':         [1,2,1,0],
            'run-right':        [1,2,1,0],

            'jump-left':        [0,0,0,0,0,1,2,3,4],
            'jump-right':       [0,0,0,0,0,1,2,3,4],

            'attack1-left':     [0,0,1,2],
            'attack1-right':    [0,0,1,2],
            'attack2-left':     [0,1,2],
            'attack2-right':    [0,1,2],
            'attack3-left':     [0,1],
            'attack3-right':    [0,1],

            'hurt-left':        [0],
            'hurt-right':       [0],

            'toepain-left':     [0],
            'toepain-right':    [0],

            'cowabunga-left':   [0],
            'cowabunga-right':  [0],

        };
        this.seq            = 'stand';
        this.oldSeq         = 'stand';
        this.numOfSeqs      = 0; // 0 == infinite
        this.seqCount       = 0;

        this.fps                    = 12.5;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;
    },


    /***********************************
     *
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
     *
     **********************************/

    attack() {
        if( this.isAttacking )  return; // have to wait until an attack plays out.
        if( this.isJumping)     return; // no attacks while jumping. CBA to implement.
        if( !this.allowAttack ) return; // no holding down the button to attack!

        this.isAttacking    = 1;
        this.allowAttack    = false;
        this.sequenceIdx    = 0;
        this.numOfSeqs      = 1;
        this.seqCount       = this.seqCount == 0 ? 3 : this.seqCount;

        for(var enemy of Game.enemies) {
            if( inRange(this, enemy) ) {
                if( !enemy.isDying && !enemy.isDead ) {
                    enemy.hurt();
                    Game.audio['hit'].play();
                }
            }
        }

        if( Game.bossSpawned ) {
            if( inRange(this, Game.boss) ) {
                if( !Game.boss.isDying && !Game.boss.isDead ) {
                    Game.boss.hurt();
                    Game.audio['shredder-hit'].play();
                }
            }
        }
    },

    resetAttack() {
        this.allowAttack = true;
    },

    jump() {
        if( this.isJumping || this.isAttacking || this.isHurt ) return;
        if( !this.allowJumping )    return;

        this.isJumping      = 1;
        this.allowJumping   = false;
        this.sequenceIdx    = 0;
        this.numOfSeqs      = 1;
        this.seqCount       = this.seqCount == 0 ? this.sequences['jump-'+this.facing].length-1 : this.seqCount;

        let timeline    = new Timeline();
        let up          = new Tween(this, { spriteY: 0 },   { spriteY: -50 },   400, { easing: Easing.easeOutQuad });
        let down        = new Tween(this, { spriteY: -50 }, { spriteY: 0 },     300, { easing: Easing.easeInQuad });

        timeline.add(up).add(down);

        Game.timelines.push(timeline);
    },

    heal() {},

    hurt(amount) {
        // can only be hurt again after the first sequence has ended.
        if( this.isHurt || this.isJumping ) return;

        if( (this.health -= amount) <= 0 ) {
            this.kill();
            return;
        }

        this.isHurt     = 30;

        this.seq        = 'hurt';
        this.numOfSeqs  = 1;
        this.seqCount   = 2;
    },

    kill() {
        this.lives--;
        this.health = 16;
    },

    end() {
        this.seq        = 'cowabunga';

        this.isHurt     = 0;
        this.isAttacking= 0;

        this.numOfSeqs  = 1;
        this.seqCount   = 1;

        let tween = new Tween(this, { posX: this.posX }, { posX: this.posX }, 1500, {
            onComplete: () => {
                Game.state = 'game_ending';
            }
        });

        Game.tweens.push( tween );
    },


    moveUp(on)      { this.moving.up    = true; this.setDir(); },
    moveDown(on)    { this.moving.down  = true; this.setDir(); },
    moveLeft(on)    { this.moving.left  = true; this.setDir(); },
    moveRight(on)   { this.moving.right = true; this.setDir(); },

    setDir() {
        if (this.moving.up && this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.UPLEFT;
        }
        else if (this.moving.up && this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.UPRIGHT;
        }
        else if (this.moving.down && this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.DOWNLEFT;
        }
        else if (this.moving.down && this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.DOWNRIGHT;
        }
        else if (this.moving.up) {
            this.moving.dir = DIR.UP;
        }
        else if (this.moving.down) {
            this.moving.dir = DIR.DOWN;
        }
        else if (this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.LEFT;
        }
        else if (this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.RIGHT;
        }
        else {
            this.moving.dir = null; // no moving.dir, but still facing this.dir
        }
    },

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // State Machine
        if( this.isAttacking ) {  // attacking
            this.seq = 'attack'+this.attackNumber;
        }
        else if( this.isHurt && this.isHurt-- ) {
            this.seq = 'hurt';

            if( this.isHurt <= 0 ) {
                this.isHurt = 0;
                //
            }
        }
        else { // move
            if( this.isJumping ) { // jumping
                this.seq = 'jump';
            }
            else {
                this.seq = this.moving.dir != null ? 'walk' : 'stand';
            }

            if( this.moving.dir == DIR.UPLEFT ) {
                this.posX -= (Math.cos(Math.PI / 8) * this.speed);
                this.posY -= (Math.sin(Math.PI / 8) * this.speed);
            }
            if( this.moving.dir == DIR.UPRIGHT ) {
                this.posX += (Math.cos(Math.PI / 8) * this.speed);
                this.posY -= (Math.sin(Math.PI / 8) * this.speed);
            }
            if( this.moving.dir == DIR.DOWNLEFT ) {
                this.posX -= (Math.cos(Math.PI / 8) * this.speed);
                this.posY += (Math.sin(Math.PI / 8) * this.speed);
            }
            if( this.moving.dir == DIR.DOWNRIGHT ) {
                this.posX += (Math.cos(Math.PI / 8) * this.speed);
                this.posY += (Math.sin(Math.PI / 8) * this.speed);
            }

            if( this.moving.dir == DIR.LEFT ) {
                this.posX -= this.speed;
            }
            if( this.moving.dir == DIR.RIGHT ) {
                this.posX += this.speed;
            }
            if( this.moving.dir == DIR.UP ) {
                this.posY -= this.speed;
            }
            if( this.moving.dir == DIR.DOWN ) {
                this.posY += this.speed;
            }
        }


        // keep in bounds
        var maxX = Game.level.canScroll ? 135 : 170;

        if( this.posX < 0 ) {
            this.posX = 0;
        }
        if( this.posX > maxX ) {
            this.posX = maxX;
            if( this.moving.dir == DIR.RIGHT || this.moving.dir == DIR.UPRIGHT || this.moving.dir == DIR.DOWNRIGHT ) {
                Game.level.scrollBackground();
            }
        }
        if( this.posY < 135 ) {
            this.posY = 135;
        }
        if( (this.posY + this.depth) > Game.height ) {
            this.posY = (Game.height - this.depth);
        }


        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            var seq = this.seq;
            seq += '-'+this.facing;

            if( seq != this.oldSeq ) {
                // reset the sequence
                this.sequenceIdx = 0;
            }
            this.oldSeq = seq;

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

            if( this.numOfSeqs > 0 ) {
                this.seqCount--;

                if( this.seqCount == 0 ) {
                    this.isAttacking    = 0;
                    this.isJumping      = 0;
                    this.spriteY        = 0;
                    this.numOfSeqs      = 0;
                }
            }

            this.timeSinceLastFrameSwap = 0;
        }

        // reset
        this.moving = {};
        this.setDir();
    },

    draw(context) {

        if( DEBUG ) {
            // draw floorspace rectangle
            let { x1, y1, x2, y2 } = this.getCollisionRect();

            // console.log( this.getCollisionRect() );

            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( x1, y1, this.width, this.depth );
        }

        if( this.isJumping ) {
            // draw shadow
            context.drawImage(this.img, 400, 16, 26, 12, this.getCenterPoint().x-13, this.getCenterPoint().y-6, 26, 12);
        }

        // use the spriteX/Y values as relative values.
        let x = (this.getCenterPoint().x - (this.spriteWidth/2)) + this.spriteX;
        let y = (this.getCenterPoint().y - this.spriteHeight) + this.spriteY;

        // draw turtle
        context.drawImage(this.img, this.offsetX, this.offsetY, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
    }
};
