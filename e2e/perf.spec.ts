import { expect, test } from "@playwright/test";

test.describe("performance", () => {
  test("gameplay sustains ~60fps on desktop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("menuitem", { name: "START" }).click();
    await page.waitForTimeout(300);

    const fps = await page.evaluate(async () => {
      // Sample rAF callbacks over ~2 seconds of live gameplay.
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        function tick() {
          frames++;
          const elapsed = performance.now() - start;
          if (elapsed >= 2000) {
            resolve((frames / elapsed) * 1000);
          } else {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
      });
    });
    // Budget (spec section 29): smooth 60 FPS on desktop; allow CI variance.
    expect(fps).toBeGreaterThanOrEqual(50);
  });

  test("no unbounded memory growth across level restarts", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("menuitem", { name: "START" }).click();
    await page.waitForTimeout(300);

    const samples = await page.evaluate(async () => {
      async function usage(): Promise<number> {
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        return memory ? memory.usedJSHeapSize : 0;
      }
      const first = await usage();
      for (let i = 0; i < 10; i++) {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR" }));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const last = await usage();
      return { first, last };
    });
    // If heap metrics exist, restarts must not grow memory by > 50%.
    if (samples.first > 0) {
      expect(samples.last).toBeLessThan(samples.first * 1.5);
    }
  });
});
