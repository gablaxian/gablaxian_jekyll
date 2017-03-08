
'use strict';

const DIR   = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 };
const DEBUG = 0;

let Game = {

    SCALE: 3,

    init() {

        //
        this.canvas             = document.querySelector('canvas');
        this.context            = this.canvas.getContext('2d');

        //
        this.width              = 256;
        this.height             = 224;

        //
        this.lastTime           = 0;
        this.elapsed            = 0;

        //
        this.distanceTravelled  = 0;
        this.lastSpawnPoint     = 0;
        this.spawnPoints        = [100, 350, 650, 980, 1200, 1350, 1650, 1850];
        this.bossSpawned        = false;

        //
        this.spritesheets       = {};
        this.audio              = {};
        this.fonts              = [];

        //
        this.tweens             = [];
        this.timelines          = [];

        //
        this.enemies            = [];

        //
        this.entities           = [];

        //
        this.projectiles        = [];
        this.explosions         = [];

        //
        // states - start, playing, game_ending, end, final_message, paused
        this.state              = 'start';
        this.fading             = 60;


        // Initialise!
        this.loadAssets()
        .then( () => this.setupGame() )
        .then( () => {
            console.log('Game started');
            this.lastTime = window.performance.now();
            requestAnimationFrame(this.render.bind(this));
        });

    },

    loadAssets() {

        const promises = [];

        // Images
        for (let cfg of CONFIG.images) {
            let ss = Object.create(SpriteSheet);
            this.spritesheets[cfg.id] = ss;

            promises.push( ss.init(cfg) );
        }

        // Audio
        for (let cfg of CONFIG.audio) {
            var audio = new Audio();
            audio.src = cfg.url;

            this.audio[cfg.id] = audio;
        }

        // Fonts
        for (let cfg of CONFIG.fonts) {
            var f = new FontFace(cfg.id, "url("+cfg.url+")");
            this.fonts.push(f);

            promises.push( f.load() );
        }

        return Promise.all(promises);
    },

    setupGame() {

        // load fonts into document
        for (let font of this.fonts) {
            document.fonts.add(font);
        }

        //
        this.scaleCanvas(this.SCALE);

        //
        Input.init();

        //
        this.level          = Level;
        this.level.init();

        //
        this.player         = Turtle;
        this.player.init(30,195);

        //
        this.hud            = HUD;
        this.hud.init();

        // messager
        this.messager       = Object.create(Messager);
        this.messager.init(CONFIG.messages[0]);

        this.messager.onComplete = () => {
            console.log('complete!');

            this.fading     = 90;
            this.state      = 'final_message';
        };

        //
        return Promise.resolve();
    },

    scaleCanvas(scale) {
        this.canvas.style.width     = this.width  * scale + 'px';
        this.canvas.style.height    = this.height * scale + 'px';
    },


    /*****************************************
     * Content generation
     ****************************************/

     spawnEnemies() {
         // if there are spawn points and distance travelled is larger than the first item, then spawn enemies.
         if( this.spawnPoints.length && (this.distanceTravelled > this.spawnPoints[0]) ) {

             // spawn enemies. Always place one ahead so that the player stops and kills it,
             // allowing those behind to catch up.
             var count = Math.ceil(this.spawnPoints[0] / 500);

            // console.log('spawning... ', this.distanceTravelled, count);

             var enemy = Object.create(Enemy);
             enemy.spawn((this.width + 42), Math.round( 125 + Math.random() * 120 ));

             this.enemies.push(enemy);

             while( count-- ) {
                 var enemy = Object.create(Enemy);
                 enemy.spawn();

                 this.enemies.push(enemy);
             }

             // shift the array
             this.spawnPoints.shift();
         }

         if( this.level.atEnd && !this.bossSpawned) {
             // spawn the boss
             console.log('shredder!', this.distanceTravelled, this.level.width, this.width );

             this.boss           = Shredder;
             this.bossSpawned    = true;
             this.boss.init();

             // TODO: fadeout.
             this.audio['bgm'].pause();
         }
     },

     addProjectile(x, y, dir) {
         let projectile = Object.create(Projectile);
         projectile.init(x, y, dir);

         this.projectiles.push(projectile);
     },

     addExplosion(x, y) {
         let explosion = Object.create(Explosion);
         explosion.init(x, y);

         this.explosions.push(explosion);
     },

    /*****************************************
     * Handlers
     ****************************************/

    handleInput() {
        if( Key.LEFT ) {
            this.player.moveLeft();
        }
        if( Key.RIGHT ) {
            this.player.moveRight();
        }
        if( Key.UP ) {
            this.player.moveUp();
        }
        if( Key.DOWN ) {
            this.player.moveDown();
        }
        if( Key.SPACE ) {
            this.player.jump();
        }
        if( !Key.SPACE ) {
            this.player.allowJumping = true;
        }
        if( Key.X ) {
            this.player.attack();
        }
        if( !Key.X ) {
            this.player.resetAttack();
        }
    },

    handleCollisions() {

        for (var i = 0; i < this.projectiles.length; i++) {
            if( Object.getPrototypeOf( this.projectiles[i] ) === Flames ) {
                for (var flame of this.projectiles[i].flames) {
                    if( inRange(this.player, flame) ) {
                        this.player.hurt(2);
                    }
                }
            }
            else if( Object.getPrototypeOf( this.projectiles[i] ) === Projectile ) {
                // goes over turtle's head. Not sure at what point it would 'hit'.
            }
        }
    },


    cleanUp() {

        // remove dead enemies
        for(var i=0; i < this.enemies.length; i++) {
            if( this.enemies[i].isDead ) {
                this.enemies.splice(i, 1);
                i--;
            }
        }

        // remove dead projectiles
        for(var i=0; i < this.projectiles.length; i++) {

            if( (this.projectiles[i].x + this.projectiles[i].width) < 0 || this.projectiles[i].x > this.width ) {
                this.projectiles[i].destroy();
            }

            if( this.projectiles[i].isDead() ) {
                this.projectiles.splice(i, 1);
                i--;
            }
        }

        // remove finished explosions
        for(var i=0; i < this.explosions.length; i++) {
            if( this.explosions[i].isFinished() ) {
                this.explosions.splice(i, 1);
                i--;
            }
        }

        // end the game
        if( this.bossSpawned && this.boss.isDead ) {
            // start ending sequence
            this.player.end();
        }

    },


    /*****************************************
     * Renderers
     ****************************************/

    render() {

        var now = window.performance.now();
        this.elapsed = (now - this.lastTime);

        // clear
        this.context.clearRect(0, 0, this.width, this.height);

        // draw background
        this.level.draw(this.context);

        if( this.state == 'paused' ) {
            //
        }
        else if( this.state == 'start' ) {
            // fade in
            if( this.fading-- ) {
                this.context.fillStyle = 'rgba(0,0,0,'+ (1 - 1/this.fading) +')';
                this.context.fillRect(0,0, this.width, this.height);
            }

            if( this.fading <= 0 ) {
                this.state  = 'playing';
                this.fading = 60;

                if( !DEBUG ) {
                    this.audio['bgm'].loop = true;
                    this.audio['bgm'].play();
                }
            }
        }
        else if( this.state == 'playing' ) {

            // Inefficient, but WHATEVS.
            // On every frame reset the list of onscreen entities.
            // Add currently spawned enemies, the player and the boss, if spawned.
            this.entities = [];
            this.entities = this.entities.concat(this.enemies);
            this.entities = this.entities.concat(this.projectiles);
            this.entities = this.entities.concat(this.explosions);
            this.entities.push(this.player);

            if( this.bossSpawned ) {
                this.entities.push(this.boss);
            }

            // sort the entities by y value
            this.entities.sort( (a, b) => {
                if( a.getY() > b.getY() ) return 1;
                if( a.getY() < b.getY() ) return -1;
                return 0;
            });


            // handle input
            this.handleInput();

            // handle collision
            this.handleCollisions();

            // kill things
            this.cleanUp();

            // spawn enemies
            this.spawnEnemies();

            // tweens
            for (var i = 0; i < this.tweens.length; i++) {
                if( this.tweens[i].isAnimating() ) {
                    this.tweens[i].update(this.elapsed);
                }
                else {
                    this.tweens.splice(i, 1);
                    i--;
                }

            }

            // timelines
            for (var i = 0; i < this.timelines.length; i++) {
                if( !this.timelines[i].isFinished() ) {
                    this.timelines[i].update(this.elapsed);
                }
                else {
                    this.timelines.splice(i, 1);
                    i--;
                }
            }

            // draw entities
            for(var entity of this.entities) {
                entity.update(this.elapsed);
                entity.draw(this.context);
            }

            // draw HUD
            this.hud.draw(this.context);
        }
        else if( this.state == 'game_ending' ) {

            this.player.draw(this.context);

            // fade out
            if( this.fading-- ) {
                this.context.fillStyle = 'rgba(0,0,0,'+ (1/this.fading) +')';
                this.context.fillRect(0,0, this.width, this.height);
            }
            else if( this.fading <= 0 ) {
                this.state = 'end';
                this.context.fillStyle = 'rgba(0,0,0,1)';
                this.context.fillRect(0,0, this.width, this.height);
            }
        }
        else if( this.state == 'end' ) {
            // fade in, probably
            this.context.drawImage( this.spritesheets['ending'].img, 0, 0);

            // sequence the message board.
            this.messager.update(this.elapsed);
            this.messager.draw(this.context);

        }
        else if( this.state == 'final_message' ) {
            this.context.drawImage( this.spritesheets['ending'].img, 0, 0);

            // sequence the message board.

            let alphaAtart  = 0;
            let alphaEnd    = 0.85;
            let interval    = alphaEnd/90;

            // fading end, show final message
            if( this.fading <= 0 ) {
                this.context.fillStyle = 'rgba(0,0,0,'+alphaEnd+')';
                this.context.fillRect(0,0, this.width, this.height);

                this.finalmessager.update(this.elapsed);
                this.finalmessager.draw(this.context);
            }
            else {
                this.messager.update(this.elapsed);
                this.messager.draw(this.context);

                this.fading--;
                this.context.fillStyle = 'rgba(0,0,0,'+ (alphaEnd-this.fading*interval) +')';
                this.context.fillRect(0,0, this.width, this.height);

                if( this.fading == 0 ) {
                    this.finalmessager = Object.create(FinalMessager);
                    this.finalmessager.init(CONFIG.messages[1]);
                    this.finalmessager.animationUpdateTime = (1000 / 16);
                }
            }
        }

        //
        this.lastTime = now;

        // repeat!
        requestAnimationFrame(this.render.bind(this));
    }

};

Game.init();
