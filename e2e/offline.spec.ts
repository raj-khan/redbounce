import { expect, test } from "@playwright/test";

test.describe("offline (PWA)", () => {
  test("core gameplay works offline after first visit", async ({ page }) => {
    // First visit online: shell + service worker install + bundle caching.
    await page.goto("/");
    await expect(page.locator("#game-canvas")).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Wait until the hashed bundle is actually in the cache.
    await page.waitForFunction(
      async () => {
        const names = await caches.keys();
        const cacheName = names.find((name) => name.startsWith("redbounce"));
        if (!cacheName) return false;
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        return keys.some((request) => new URL(request.url).pathname.endsWith(".js"));
      },
      undefined,
      { timeout: 15_000 },
    );

    // Go offline and reload: the shell must still boot.
    await page.context().setOffline(true);
    await page.reload();
    await expect(page).toHaveTitle(/RedBounce/);
    await expect(page.locator("#game-canvas")).toBeVisible();
    await expect(page.locator("#ui-root")).toHaveAttribute("data-booted", "true");
    await page.context().setOffline(false);
  });

  test("service worker serves cached assets", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    const cached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const redbounce = cacheNames.filter((name) => name.startsWith("redbounce"));
      if (redbounce.length === 0) return [];
      const cache = await caches.open(redbounce[0]!);
      return (await cache.keys()).map((request) => new URL(request.url).pathname);
    });
    expect(cached.length).toBeGreaterThan(0);
    expect(cached.some((path) => path.endsWith("index.html"))).toBe(true);
  });
});
