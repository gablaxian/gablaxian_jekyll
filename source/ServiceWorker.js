
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
    '/',
    '/assets/css/main.css',
    '/assets/js/main.js',

    '/assets/fonts/04b_03-webfont.woff',
    
    '/assets/img/coin-animation.png',
    '/assets/img/social-icons.png'
];

self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then( cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
