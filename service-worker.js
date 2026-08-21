/**
 * Campus Flow - Progressive Web App Service Worker
 * File: service-worker.js
 */

const CACHE_NAME = 'campus-flow-v1';

// Static assets to cache immediately on installation
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/components.css',
  './students.js',
  './js/app.js',
  './js/archive.js',
  './js/scanner.js',
  './assets/favicon.ico'
];

/**
 * INSTALL EVENT
 * Caches static files during service worker installation
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell & static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

/**
 * ACTIVATE EVENT
 * Cleans up old caches when a new version of the service worker takes over
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * FETCH EVENT
 * Intercepts requests to serve cached content offline
 */
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g., POST/PUT requests)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return cached asset if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Fall back to network fetch if not in cache
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response stream to store in cache dynamically
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 3. Offline fallback for HTML page requests if both network & cache fail
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
