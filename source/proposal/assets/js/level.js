
'use strict';

let Level = {

    init() {
        // the tiles
        // not the best practice, but it gets the job done.
        this.background1= Game.spritesheets['background1'].img;
        this.background2= Game.spritesheets['background2'].img;
        this.foreground = Game.spritesheets['foreground'].img;

        this.speed      = 2;
        this.x          = 0;
        this.canScroll  = true;     // level is only scrollable at certain points. We'll work out the logic later.
        this.atEnd      = false;    // we'll use this change the level collision (so char cannot go into top-right of an isometric map...)
        this.width      = this.foreground.width - 256; // the level's width is the width of the foreground minus one screen.

        this.tileWidth  = 8;
        this.tileHeight = 72;

        this.foregroundWidth = this.foreground.width;

    },

    scrollBackground() {
        this.x -= this.speed;

        if( this.canScroll ) {
            Game.distanceTravelled += Math.abs(this.speed);
        }

        // move entities in relation to the level
        for (var enemy of Game.enemies) {
            enemy.posX -= Game.level.speed;
        }
        for (var explosion of Game.explosions) {
            explosion.x -= Game.level.speed;
        }
        for (var projectile of Game.projectiles) {
            projectile.x -= Game.level.speed;
        }

        // the foreground can only scroll until its right edge hits the right edge of the screen.
        if( this.x < -this.width ) {
            this.x = -this.width;
            this.atEnd      = true;
            this.canScroll  = false;
        }
    },

    draw(context) {

        // tile background (only tile while scrolling. TODO.)
        context.drawImage(this.background1, 0, 0);

        // draw foreground
        context.drawImage(this.foreground, -this.x, 0, 256, 224, 0, 0, 256, 224);
    }

};
