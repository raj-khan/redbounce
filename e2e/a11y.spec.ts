import { expect, test } from "@playwright/test";

test.describe("accessibility", () => {
  test("menu buttons have accessible names", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator(".screen .menu-btn");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const name = await buttons.nth(i).textContent();
      expect((name ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  test("menu buttons have visible focus styling", async ({ page }) => {
    await page.goto("/");
    const start = page.getByRole("menuitem", { name: "START" });
    await start.focus();
    const outline = await start.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle };
    });
    expect(outline.outlineStyle).not.toBe("none");
    expect(parseFloat(outline.outlineWidth)).toBeGreaterThan(0);
  });

  test("arrow keys navigate the menu", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator(".screen .menu-btn");
    await buttons.first().focus();
    await page.keyboard.press("ArrowDown");
    const isSecondFocused = await buttons
      .nth(1)
      .evaluate((element) => document.activeElement === element);
    expect(isSecondFocused).toBe(true);
  });

  test("live region exists for status announcements", async ({ page }) => {
    await page.goto("/");
    const live = page.locator("[aria-live]");
    await expect(live).toHaveCount(1);
  });

  test("touch control buttons have aria labels", async ({ page }) => {
    await page.goto("/");
    const labeled = await page.evaluate(() => {
      return [...document.querySelectorAll(".touch-btn")].every(
        (button) => (button.getAttribute("aria-label") ?? "").length > 0,
      );
    });
    expect(labeled).toBe(true);
  });

  test("canvas has an accessible label", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#game-canvas")).toHaveAttribute("aria-label", /.+/);
  });

  test("page has correct document language", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
