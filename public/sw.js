const CACHE = 'tooltails-focus-v1';
const ASSET_CACHE = 'tooltails-focus-assets-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        '/focus/',
        '/favicon.svg',
        '/favicon.ico',
        '/apple-touch-icon.png',
        '/android-chrome-192x192.png',
        '/android-chrome-512x512.png',
        '/favicon-16x16.png',
        '/favicon-32x32.png',
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/favicon')) {
    e.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith('/focus/')) {
    if (request.mode === 'navigate') {
      e.respondWith(networkFirst(request));
    } else {
      e.respondWith(cacheFirst(request));
    }
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/)) {
    e.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
