
'use strict';

import Core from './Core.js';
import Fez  from './themes/Fez.js';

if( 'serviceWorker' in navigator ) {
    navigator.serviceWorker.register('/ServiceWorker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
}


Core.init();

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        var height = parseInt(window.getComputedStyle( document.querySelector('.Page-masthead') )['height']);

        Fez.init({
            element: document.querySelector('.Starfield'),
            height: height
        });

        Core.addChild(Fez);
    });
});
