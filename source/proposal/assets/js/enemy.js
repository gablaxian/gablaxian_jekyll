
'use strict';

let Enemy = {

    init(type='footsoldier', x, y) {
        this.type           = type;
        this.img            = Game.spritesheets['enemies'].img;

        //
        this.posX           = x;
        this.posY           = y;
        this.width          = 40;
        this.height         = 64; // mostly used for entity collision
        this.depth          = 10;

        //
        this.spriteX        = 0; // these will be set once we start drawing the sprites
        this.spriteY        = 0;
        this.spriteWidth    = 0;
        this.spriteHeight   = 0;

        //
        this.speed          = 1;
        this.health         = 6;
        this.damage         = 2;

        this.isThinking     = 0;
        this.isTravelling   = 1;
        this.isAttacking    = 0;
        this.isHurt         = 0;
        this.isDying        = 0;
        this.isDead         = 0;


        this.spriteProperties   = {
            'stand-left':   { width : 40,   height: 64,     sX: 0,      sY: 64 },
            'stand-right':  { width : 40,   height: 64,     sX: 0,      sY: 0 },

            'walk-left':    { width : 40,   height: 64,     sX: 40,     sY: 64  },
            'walk-right':   { width : 40,   height: 64,     sX: 40,     sY: 0   },

            'attack-left':  { width : 56,   height: 64,     sX: 0,     sY: 224  },
            'attack-right': { width : 56,   height: 64,     sX: 0,     sY: 145  },

            'hurt-left':    { width : 48,   height: 48,     sX: 0,     sY: 336  },
            'hurt-right':   { width : 48,   height: 48,     sX: 0,     sY: 288  },

            'dying-left':   { width : 40,   height: 40,     sX: 160,   sY: 344  },
            'dying-right':  { width : 40,   height: 40,     sX: 104,   sY: 296  },

            'dead-left':    { width : 56,   height: 32,     sX: 96,    sY: 352  },
            'dead-right':   { width : 56,   height: 32,     sX: 152,   sY: 304  },
        }

        this.sequenceIdx    = 0;
        this.sequences      = {
            'stand-left':   [0],
            'stand-right':  [0],

            'walk-left':    [0,1,2,3],
            'walk-right':   [0,1,2,3],

            'attack-left':  [0,0,1,1],
            'attack-right': [0,0,1,1],

            'hurt-left':    [0],
            'hurt-right':   [0],

            'dying-left':   [0],
            'dying-right':  [0],

            'dead-left':    [0],
            'dead-right':   [0],
        };
        this.seq            = 'stand';
        this.oldSeq         = 'stand';
        this.numOfSeqs      = 0;        // 0 == infinite
        this.seqCount       = 0;
        this.facing         = 'left';

        this.fps                    = 6;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

    },

    spawn(x=0, y=0) {
        // randomly place off screen either to left or right
        if( x == 0 ) {
            let placement   = Math.random() > 0.5 ? 'left': 'right';
            let variance    = 40 + (Math.random() * 15);
            x = Math.round( placement == 'left' ? -variance : Game.width + variance);
            y = Math.round(112 + Math.random() * 112);
        }

        this.init('footsoldier', x, y);
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

    think() {

        this.isTravelling   = 0;
        this.isThinking     = 15 + Math.floor(Math.random() * 10);
        this.seq            = 'stand';

        console.log('thinking: ', this.isThinking, this.isAttacking);
    },

    // Basically, there needs to be some randomisation as to how the enemy approaches/attacks the player.
    // Entities seem to choose a point around the player's collision rect and glue to it.
    decide() {
        console.log('deciding');

        // are we close enough to the player? attack.
        if( inRange(this, Game.player) ) {
            this.attack();
        }

        // otherwise move closer in some fashion.
        else {
            this.isThinking     = 0;
            this.isTravelling   = 1;
        }

    },

    attack() {
        if( this.isAttacking )  return; // have to wait until an attack plays out.
        console.log('attacking');

        this.isTravelling   = 0;
        this.isAttacking    = 1;
        this.seq            = 'attack';
        this.sequenceIdx    = 0;
        this.numOfSeqs      = 1;
        this.seqCount       = this.seqCount == 0 ? this.sequences['attack-'+this.facing] : this.seqCount;

        if( inRange(this, Game.player) ) {
            Game.player.hurt(this.damage);
        }
    },

    hurt() {
        if( (this.health -= Game.player.damage) <= 0 ) {
            this.kill();
            return;
        }

        this.isTravelling   = 0;
        this.isAttacking    = 0;
        this.isHurt         = 1;
        this.seq            = 'hurt';

        let t1 = new Tween(this, { posX: this.posX }, { posX: this.posX }, 1000, {
            onComplete: () => {
                this.isHurt = 0;
            }
        });

        Game.tweens.push(t1);
    },

    kill() {
        this.isTravelling   = 0;
        this.isHurt         = 0;
        this.isDying        = 1;
        this.seq            = 'dying';

        let finalX  = this.posX + (this.facing == 'left' ? 50 : -50);
        let tl      = new Timeline();

        // tween falling away motion.
        let away    = new Tween(this, { posX: this.posX },  { posX: finalX }, 800, { onComplete: () => { this.seq = 'dead'; } });
        let down    = new Tween(this, { spriteY: -20 },     { spriteY: 10 },  800, { easing: Easing.easeOutBounce });

        // tween stationary death
        let still   = new Tween(this, { posX: finalX }, { posX: finalX }, 200);

        tl.add(away).add(down, 100).add(still);
        tl.onComplete = () => {
            Game.addExplosion((finalX + this.width/2), this.getCenterPoint().y);
            this.die();
        }

        Game.timelines.push( tl );
    },

    die() {
        console.log('dead');

        this.isDying    = 0;
        this.isDead     = 1;
    },

    explode() {
        //
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

            if( this.numOfSeqs > 0 ) {
                this.seqCount--;

                if( this.seqCount == 0 ) {
                    this.isAttacking    = 0;
                    this.isHurt         = 0;
                    this.isThinking     = 0;
                    this.numOfSeqs      = 0;

                    this.think();

                    console.log('end sequence');
                }
            }

            this.timeSinceLastFrameSwap = 0;
        }

    },

    update(elapsed) {

        // always face the player (use center point of each entity)
        if( Game.player.getCenterPoint().x < this.getCenterPoint().x ) {
            this.facing = 'left';
        }
        else {
            this.facing = 'right';
        }

        //

        if( this.isAttacking || this.isHurt || this.isDying ) {
            //
        }
        else if( this.isThinking && this.isThinking-- ) {
            if( this.isThinking <= 0 ) {
                this.isThinking     = 0;
                this.isAttacking    = 0;
                this.isHurt         = 0;
                this.decide();
            }
        }
        else {
            this.seq = 'walk';

            // move towards player
            if( this.getCollisionRect().x1 > Game.player.getCollisionRect().x2 ) {
                if( this.isTravelling ) this.posX -= this.speed;
            }
            else if( this.getCollisionRect().x2 < Game.player.getCollisionRect().x1 ) {
                if( this.isTravelling ) this.posX += this.speed;
            }

            if( this.getCollisionRect().y2 < Game.player.getCollisionRect().y1 ) {
                if( this.isTravelling ) this.posY += (this.speed/2);
            }
            else if( this.getCollisionRect().y1 > Game.player.getCollisionRect().y2 ) {
                if( this.isTravelling ) this.posY -= (this.speed/2);
            }

            // only travel towards player if far enough away.

            if( Math.abs( Game.player.getCenterPoint().x - this.getCenterPoint().x ) < 50 && Math.abs( Game.player.getCenterPoint().y - this.getCenterPoint().y ) < 15 ) {
                this.seq            = 'stand';
                this.isTravelling   = 0;
                this.think();
            }
            else {
                this.isTravelling = 1;
            }
        }

        // on each animation frame (if not doing something else), make a random check to see whether the enemy needs to 'think'
        if( !this.isThinking && !this.isHurt && (Math.random() * 100) < 0.2 ) {
            this.think();
        }

        this.animate(elapsed);

    },

    draw(context) {

        if( DEBUG ) {
            // draw floorspace rectangle
            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( this.posX, this.posY, this.width, this.depth );
        }

        // use the spriteX/Y values as relative values.
        let x = (this.getCenterPoint().x - (this.spriteWidth/2)) + this.spriteX;
        let y = (this.getCenterPoint().y - this.spriteHeight) + this.spriteY;

        context.drawImage(this.img, this.offsetX, this.offsetY, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
    }

};
