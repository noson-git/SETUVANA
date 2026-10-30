/**
 * SETUVANA - Service Worker for Offline-First PWA Shell Caching
 *
 * Caching rules:
 *  - API calls        : network-first, synthetic offline JSON on failure.
 *  - HTML navigations : network-first (so a new deploy's hashed asset
 *                       references are always picked up), cached shell as
 *                       offline fallback.
 *  - Dev/build assets : never cached here (Vite's /src, /@vite, /node_modules
 *                       module graph must stay live, otherwise a stale cached
 *                       module silently blanks the app).
 *  - Immutable assets : cache-first, which is what keeps the shell usable
 *                       with no connectivity.
 */

// Bumped from v1: v1 pinned the dev module graph and served stale HTML after
// deploys, which left the app on a blank screen with no console error.
const CACHE_NAME = 'setuvana-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Individual failures must not abort install (e.g. '/' unavailable),
      // otherwise the previous worker is never replaced.
      return Promise.all(
        STATIC_ASSETS.map((asset) => cache.add(asset).catch(() => undefined))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Vite's dev module graph, HMR client and query-stringed deps must always come
// from the network. Caching them breaks the app on the next edit.
// NOTE: production bundles live under /assets/*.js and MUST stay cacheable —
// stripping that path is what keeps the shell usable with no connectivity.
function isUncacheableDevAsset(url) {
  return (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/.vite/') ||
    url.pathname === '/sw.js' ||
    url.searchParams.has('v') ||
    url.searchParams.has('t')
  );
}

function isDocumentRequest(request, url) {
  return (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            offline: true,
            message: 'Server unreachable. Operating in offline mode.',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Never pin the live module graph.
  if (isUncacheableDevAsset(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // App shell: network-first so a new build is never masked by an old cache.
  if (isDocumentRequest(request, url)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/index.html'))
            .then(
              (cached) =>
                cached ||
                new Response(
                  '<!doctype html><meta charset="utf-8"><title>SETUVANA offline</title>' +
                    '<body style="font-family:system-ui;padding:2rem">SETUVANA is offline. ' +
                    'Reconnect to load the app.</body>',
                  { headers: { 'Content-Type': 'text/html' } }
                )
            )
        )
    );
    return;
  }

  // Immutable hashed assets: cache-first, refreshed on network hit.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
