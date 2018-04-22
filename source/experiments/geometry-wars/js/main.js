
'use strict';

let Game = {

    SCALE: 1,

    init() {

        //
        this.canvas             = document.querySelector('canvas');
        this.context            = this.canvas.getContext('2d');

        //
        this.width              = SCREEN_WIDTH;
        this.height             = SCREEN_HEIGHT;

        //
        this.lastTime           = 0;
        this.elapsed            = 0;
        this.totalElapsed       = 0;

        //
        this.level              = 1;
        this.enemies            = [];
        this.spawnPoints        = [];

        //
        this.bullets            = [];
        this.particles          = [];
        this.explosions         = [];
        this.scores             = [];

        //
        // states - start, playing, game_ending, end, final_message, paused
        this.state              = GAME_STATE.PLAYING;

        // Initialise!
        this.canvas.width       = this.width;
        this.canvas.height      = this.height;

        this.canvas.parentNode.style.width = this.width+'px';
        this.canvas.parentNode.style.height= this.height+'px';


        this.loadAssets()
        .then( () => this.setupGame() )
        .then( () => this.setupEvents() )
        .then( () => {

            console.log('Game started');

            this.state      = GAME_STATE.PLAYING
            this.lastTime   = window.performance.now();

            requestAnimationFrame(this.render.bind(this));
        });
    },

    loadAssets() { return Promise.resolve() },

    setupGame() {

        //
        Input.init(KEYS);
        ParticleGenerator.init();

        //
        var star_density    = 10;
        var number_of_stars = Math.round(SCREEN_WIDTH/100) * (SCREEN_HEIGHT / 100).toFixed(1) * star_density;

        this.stars = [];

        // Setup the star arrays
        for(var i = 0; i < number_of_stars; i++) {
            // for the background stars, don't bother with opacity, instead we want a 'brightness' between full black and half-white (0-128) value.
            this.stars.push( { x: (Math.random() * SCREEN_WIDTH)|0, y: (Math.random() * SCREEN_HEIGHT)|0, w: (Math.random() < 0.5 ? 2 : 1), b: (Math.random() * 128)|0 } );
            this.stars.push( { x: (Math.random() * SCREEN_WIDTH)|0, y: (Math.random() * SCREEN_HEIGHT)|0, w: (Math.random() < 0.5 ? 2 : 1), b: (Math.random() * 255)|0, s: (Math.random() < 0.5 ? 0 : 1) } );
        }

        //
        this.player = Player;
        this.player.init();

        this.player.setX( ( SCREEN_WIDTH/2 - this.player.width/2 )|0 );
        this.player.setY( ( SCREEN_HEIGHT - this.player.height - 20 )|0 );

        // enemies
        this.spawnPoints = Object.keys(PHASES['level'+this.level].phase1);

        //
        this.hud = HUD;
        this.hud.init();

        //
        return Promise.resolve();
    },

    setupEvents() {

        Eventer.on('enemy_kill', (score, x, y) => {
            HUD.updateScore(score);
            let newFloatingScore    = Object.create(FloatingScore).init(score, x, y);
            this.scores.push(newFloatingScore);
        });

        return Promise.resolve();
    },

    /*****************************************
     * Content generation
     ****************************************/

    drawBackground() {

        const cellSize  = 40;
        const rows      = (SCREEN_HEIGHT/cellSize)|0;
        const cols      = (SCREEN_WIDTH/cellSize)|0;

        // draw black bg
        this.context.fillStyle = 'rgb(0,0,0)';
        this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // draw stars
        for (var i = 0; i < this.stars.length; i++) {
            this.context.fillStyle = 'rgb('+this.stars[i].b+','+this.stars[i].b+','+this.stars[i].b+')';
            this.context.fillRect(this.stars[i].x, this.stars[i].y, 2, 2);
        }

        // draw grid
        this.context.save();

            this.context.strokeStyle    = 'rgba(27,27,141,0.6)';
            this.context.lineWidth      = 4;

            for (var col = 0; col < cols; col++) {
                this.context.beginPath();
                this.context.setLineDash([4, 4]);

                this.context.moveTo( col * cellSize, 0 );
                this.context.lineTo( col * cellSize, SCREEN_HEIGHT );

                this.context.stroke();
            }

            for (var row = 0; row < rows; row++) {
                this.context.beginPath();
                this.context.setLineDash([4, 4]);

                this.context.moveTo( 0, row * cellSize );
                this.context.lineTo( SCREEN_WIDTH, row * cellSize );

                this.context.stroke();
            }

        this.context.restore();
    },

    spawnEnemies() {

        let timePassedInSeconds = (this.totalElapsed/1000)|0;

        if( this.spawnPoints.length && (timePassedInSeconds > this.spawnPoints[0]) ) {

            let spawnGroup = PHASES['level'+this.level].phase1[this.spawnPoints[0]];

            for (var item of spawnGroup) {
                // revive old enemy
                // for( let enemy of this.enemies ) {
                //     if( enemy.isDead() ) {
                //         enemy.init(item.type, item.x, item.y);
                //     }
                // }

                // none to revive? create a new one.
                let enemy = Object.create(Enemy).init(item.type, item.x, item.y);

                if( enemy !== false )
                    this.enemies.push(enemy);
            }

            this.spawnPoints.shift();
        }
    },

    addBullet(x, y, vel=[0,0]) {

        // check for any dead projectiles.
        for( let bullet of this.bullets ) {
            if( bullet.isDead() ) {
                bullet.init(x, y, vel);
                return;
            }
        }

        // no dead projectiles found. add a new one.
        let bullet = Object.create(Bullet).init(x, y, vel);
        this.bullets.push(bullet);

    },

    addProjectile(x, y, vel=[0,0]) {

        // check for any dead projectiles.
        for( let projectile of this.projectiles ) {
            if( projectile.isDead() ) {
                projectile.init(x, y, vel);
                return;
            }
        }

        // no dead projectiles found. add a new one.
        let projectile = Object.create(Projectile).init(x, y, vel);
        this.projectiles.push(projectile);

    },

    addTween(tween) {
        this.tweens.push( tween );
    },

    /*****************************************
     * Handlers
     ****************************************/

    handleCollisions() {

        for(let enemy of this.enemies ) {
            for( let bullet of this.bullets ) {

                if( !enemy.isDead() && !bullet.isDead() ) {

                    if( Utils.inRange( bullet, enemy ) ) {
                        enemy.hurt();
                        bullet.destroy();
                    }

                }
            }

            if( Utils.inRange( Player, enemy ) ) {
                if( !enemy.isDead() && Player.state == ENTITY_STATE.TRAVELLING ) {
                    Player.kill();
                }
            }
        }
    },


    /*****************************************
     * Renderers
     ****************************************/

    render() {

        var now         = window.performance.now();
        this.elapsed    = (now - this.lastTime);

        this.totalElapsed += this.elapsed;

        Stats.begin();

        // clear
        this.context.clearRect(0, 0, this.width, this.height);

        if( this.state == GAME_STATE.PAUSED ) {

            this.drawBackground();

            // draw player
            this.player.update(this.elapsed);
            this.player.draw(this.context);

            // draw enemies
            for(var enemy of this.enemies) {
                if(!enemy.isDead) enemy.draw(this.context);
            }

        }
        else if( this.state == GAME_STATE.START ) {
            this.state = GAME_STATE.PLAYING;
        }
        else if( this.state == GAME_STATE.PLAYING ) {

            // backgrounds
            this.drawBackground();

            // handle collision
            this.handleCollisions();

            // particles
            for( var particle of this.particles ) {
                if( !particle.isDead() ) {
                    // console.log('drawing...');
                    particle.update(this.elapsed);
                    particle.draw(this.context);
                }
            }

            // bullets
            for( var bullet of this.bullets ) {
                if( !bullet.isDead() ) {
                    bullet.update(this.elapsed);
                    bullet.draw(this.context);
                }
            }

            // scores
            for( var score of this.scores ) {
                if( score.isAnimating() ) {
                    score.update(this.elapsed);
                    score.draw(this.context);
                }
            }

            // spawn enemies
            if( this.player.state != ENTITY_STATE.DEAD )
                this.spawnEnemies();

            // draw enemies
            for(var enemy of this.enemies) {
                if( !enemy.isDead() ) {
                    enemy.update(this.elapsed);
                    enemy.draw(this.context);
                }
            }

            // draw player
            this.player.update(this.elapsed);
            this.player.draw(this.context);

            // draw HUD
            this.hud.draw(this.context);

        }

        Stats.end();

        //
        this.lastTime = now;

        // repeat!
        requestAnimationFrame(this.render.bind(this));

    }


}
