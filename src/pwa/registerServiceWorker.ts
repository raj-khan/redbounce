/**
 * Service worker registration (spec sections 5 and 28).
 * Production only; registration failures never break the game.
 *
 * The hashed JS/CSS bundles load before the service worker takes control,
 * so after activation we push this page's already-loaded resources into
 * the cache from the window side (Cache API is available in both contexts).
 */
export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  if (!(import.meta.env.PROD ?? false)) return;

  try {
    await navigator.serviceWorker.register("./sw.js");
    await navigator.serviceWorker.ready;
    await cacheLoadedResources();
  } catch {
    // Offline support is an enhancement; ignore failures.
  }
}

/** Cache every same-origin resource this page already fetched. */
async function cacheLoadedResources(): Promise<void> {
  const cacheNames = await caches.keys();
  const cacheName = cacheNames.find((name) => name.startsWith("redbounce"));
  if (!cacheName) return;
  const cache = await caches.open(cacheName);

  const resources = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((url) => {
      try {
        return new URL(url, location.href).origin === location.origin && !url.includes("sw.js");
      } catch {
        return false;
      }
    });

  await Promise.allSettled([
    cache.add(new URL(location.pathname, location.origin).toString()),
    ...resources.map((url) => cache.add(url)),
  ]);
}
