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

  test("main menu flow: start, pause menu, resume", async ({ page }) => {
    await page.goto("/");
    const start = page.getByRole("menuitem", { name: "START" });
    await expect(start).toBeVisible();
    await start.click();
    await page.waitForTimeout(300);

    // Pause menu appears with accessible buttons.
    await page.keyboard.press("KeyP");
    await expect(page.getByRole("menuitem", { name: "RESUME" })).toBeVisible();
    await page.getByRole("menuitem", { name: "RESUME" }).click();
    await page.waitForTimeout(200);
    await expect(page.getByRole("menuitem", { name: "RESUME" })).toBeHidden();
  });

  test("settings screen opens from main menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("menuitem", { name: "SETTINGS" }).click();
    await expect(page.getByLabel("Master volume")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "BACK" })).toBeVisible();
  });
});
