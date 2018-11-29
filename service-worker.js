var cacheName = 'weatherPWA-v2'; // for the app shell
var dataCacheName = 'weatherData-v2'; // for the app content data
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/localforage-1.4.0.js',
  '/styles/ud811.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];

var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';


self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  // A.2 here we will handle the request to our api differently from any other request.
  // check if it is to the api so we will save response to the cache and then return the request.
    if (e.request.url.startsWith(weatherAPIUrlBase)) {
        e.respondWith(
            fetch(e.request)
                .then(function(response) {
                    return caches.open(dataCacheName).then(function(cache) {
                        cache.put(e.request.url, response.clone());
                        console.log('[ServiceWorker] Fetched & Cached', e.request.url);
                        return response;
                    });
                })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                console.log('[ServiceWorker] Fetch Only', e.request.url);
                return response || fetch(e.request);
            })
        );
    }
});
