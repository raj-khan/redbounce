import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("app shell loads and canvas boots", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/RedBounce/);
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();
    await expect(page.locator("#ui-root")).toHaveAttribute("data-booted", "true");
  });

  test("no critical console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});
