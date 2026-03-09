// Minimal service worker for PWA - caches app shell only, NOT audio streams
const CACHE_NAME = 'mero-radio-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// Install - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('SW: Failed to cache some resources', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first for everything except app shell
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // NEVER cache audio streams (common radio stream extensions/patterns)
  if (
    url.pathname.match(/\.(mp3|aac|ogg|m3u8|pls|m3u)$/i) ||
    url.pathname.includes('/stream') ||
    url.pathname.includes('/radio') ||
    url.hostname.includes('radio-browser.info')
  ) {
    return; // Let browser handle directly, no caching
  }

  // Cache-first for app shell resources
  if (APP_SHELL.some(path => url.pathname.endsWith(path))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // Network-first for everything else (JS bundles, CSS, API calls)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses (but not audio!)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(request);
      })
  );
});
