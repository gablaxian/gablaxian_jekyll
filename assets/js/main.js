'use strict';

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