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

  test("keyboard input drives the game without errors", async ({ page }) => {
    await page.goto("/");
    await page.locator("#game-canvas").click();
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.down("KeyA");
    await page.waitForTimeout(200);
    await page.keyboard.up("KeyA");
    await page.keyboard.press("KeyP"); // pause
    await page.waitForTimeout(150);
    await page.keyboard.press("KeyP"); // resume
    await page.keyboard.press("KeyR"); // restart
    await page.waitForTimeout(200);
    await expect(page.locator("#game-canvas")).toBeVisible();
  });
});
