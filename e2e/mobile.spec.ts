import { expect, test } from "@playwright/test";

test.describe("mobile layout", () => {
  test("no overflow at mobile sizes", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth + 1,
      };
    });
    expect(overflow.hasHorizontalOverflow).toBe(false);
    await expect(page.locator("#game-canvas")).toBeVisible();
  });

  test("canvas preserves aspect ratio on narrow viewports", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const ratio = await page.evaluate(() => {
      const canvas = document.getElementById("game-canvas");
      if (!(canvas instanceof HTMLCanvasElement)) return 0;
      return canvas.clientWidth / Math.max(1, canvas.clientHeight);
    });
    expect(ratio).toBeCloseTo(16 / 9, 1);
  });

  test("touch buttons are large enough for touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    // Mirror the settings toggle so controls are measurable on any pointer type.
    await page.evaluate(() => {
      const controls = document.getElementById("touch-controls");
      if (controls) controls.removeAttribute("hidden");
    });
    const sizes = await page.evaluate(() => {
      return [...document.querySelectorAll(".touch-btn")].map((button) => {
        const rect = button.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
      });
    });
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(44);
  });
});
