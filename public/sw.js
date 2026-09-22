/*
 * RedBounce service worker (spec section 28).
 * Cache-first offline shell; versioned cache swapped on activate.
 */

const CACHE_VERSION = "redbounce-v2";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Cache core assets; failures are tolerated (partial offline).
      await Promise.allSettled(SHELL_ASSETS.map((asset) => cache.add(asset)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Cache-first with network fallback + runtime caching.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // ignoreVary: module scripts send Origin headers the cached
      // page-side fetches did not, which would otherwise cause false misses.
      const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch (error) {
        const shell = await cache.match("./index.html", { ignoreSearch: true, ignoreVary: true });
        if (shell) return shell;
        throw error;
      }
    })(),
  );
});
