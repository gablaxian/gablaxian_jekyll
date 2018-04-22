
'use strict';

const ParticleGenerator = {

    init() {
        this.particlesPerExplosion  = 90;
        this.particles              = [];

        for (var i = 0; i < 1000; i++) {
            let particle = Object.create(Particle).init();
            particle.state = 0;
            this.particles.push( particle );
        }

        Game.particles = this.particles;
    },

    generate(x=0, y=0, color='') {
        // console.log('generating particles...', x, y, color);

        if( x < 0 ) x = 0;
        if( x > SCREEN_WIDTH ) x = SCREEN_WIDTH;
        if( y < 0 ) y = 0;
        if( y > SCREEN_HEIGHT ) y = SCREEN_HEIGHT;

        let particleCount = 0;

        // recycle dead particles
        for(var particle of Game.particles) {
            if( (particleCount < this.particlesPerExplosion) && particle.isDead() ) {
                particle.spawn(x, y, color);
                particleCount++;
            }
        }

        if( particleCount == this.particlesPerExplosion ) {
            return;
        }
        else {
            // make up numbers if particles are all out there.
            let particlesLeft = this.particlesPerExplosion - particleCount;

            for (var i = 0; i < particlesLeft; i++) {
                let particle = Object.create(Particle).init();
                particle.spawn(x, y, color);
                Game.particles.push( particle );
            }
        }

    }

}
