
'use strict';

let HUD = {

    init() {
        this.border     = Game.spritesheets['border'].img;
        this.player1    = Game.spritesheets['1up'].img;
        this.player2    = Game.spritesheets['2up'].img;
        this.numbers    = Game.spritesheets['numbers'].img;

        this.text       = Game.spritesheets['text-raph'].img;
        this.healthbars = Game.spritesheets['healthbars'].img;
        this.lilLeo     = Game.spritesheets['lil-leo'].img;

        this.showBoss   = false;
    },

    showBossHealth() {
        this.showBoss = true;
    },

    draw(context) {
        // draw the borders
        context.drawImage(this.border, 0, 0);
        context.drawImage(this.border, 128, 0);

        // 1up & 2up
        context.drawImage(this.player1, 9, 0);
        context.drawImage(this.player2, 136, 0);

        // player name
        context.drawImage(this.text, 39, 8);

        // lives
        context.drawImage(this.numbers, 0, 0, 7, 12, 15, 16, 7, 12);

        if( Game.player.lives == 3 ) { // 2
            context.drawImage(this.numbers, 12, 0, 7, 12, 23, 16, 7, 12);
        }
        else if( Game.player.lives == 2 ) { // 1
            context.drawImage(this.numbers, 7, 0, 5, 12, 24, 16, 5, 12);
        }
        else { // 0
            context.drawImage(this.numbers, 0, 0, 7, 12, 23, 16, 7, 12);
        }

        // player healthbars
        let barLevel = 0;

        for (let count = 0; count < Game.player.health; count++) {
            if( count >= 0 )    barLevel = 1;
            if( count > 3 )     barLevel = 2;
            if( count > 9 )     barLevel = 3;

            if( barLevel == 1) {
                context.drawImage(this.healthbars, 0, 0, 3, 11, 48 + (count * 4), 17, 3, 11);
            }
            else if( barLevel == 2 ) {
                context.drawImage(this.healthbars, 3, 0, 3, 11, 48 + (count * 4), 17, 3, 11);
            }
            else {
                context.drawImage(this.healthbars, 6, 0, 3, 11, 48 + (count * 4), 17, 3, 11);
            }
        }

        if( this.showBoss ) {
            let blocks = Math.ceil(Game.boss.health / 4);

            for (var i = 0; i < blocks; i++) {
                context.fillStyle   = 'rgb(255, 0, 0)';
                context.strokeStyle = 'white';

                context.fillRect( 50 + (21*i), 48, 17, 6 );
                context.strokeRect( 50 + (21*i)-0.5, 48-0.5, 17, 6 );
            }
        }

        // lil leo
        context.drawImage(this.lilLeo, 136, 16);
    }

};
