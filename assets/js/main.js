'use strict';

import Core from './Core.js';
// import Fez  from './themes/Fez.js';

if( 'serviceWorker' in navigator ) {
    // de-register
    navigator.serviceWorker.getRegistration('./')
    .then((registration) => {
        if( registration ) {
            registration.unregister()
            .then( () => console.log('unregistered...') )
        }
    })
}

Core.init();