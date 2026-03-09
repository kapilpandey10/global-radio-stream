// Minimal service worker for PWA - caches app shell only, NOT audio streams
const CACHE_NAME = 'mero-radio-v2';
const APP_SHELL = [
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// Install - cache minimal app shell only
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

// Activate - clean up ALL old caches immediately
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

// Fetch - network first for everything, cache only static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // NEVER intercept: audio streams, API calls, or navigation requests
  if (
    request.mode === 'navigate' ||
    url.pathname.match(/\.(mp3|aac|ogg|m3u8|pls|m3u)$/i) ||
    url.pathname.includes('/stream') ||
    url.hostname.includes('radio-browser.info') ||
    url.hostname.includes('ipapi.co') ||
    url.hostname !== self.location.hostname
  ) {
    return; // Let browser handle directly
  }

  // For same-origin static assets: network first, cache fallback
  if (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff2?)$/i)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else: network only
});
