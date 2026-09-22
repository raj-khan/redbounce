/**
 * Application entry point.
 *
 * Boots the game once the DOM is ready. The bootstrap sequence follows the
 * runtime lifecycle in docs/architecture.md (section 6).
 */
import { GameApplication } from "./app/GameApplication";

function boot(): void {
  const canvas = document.getElementById("game-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error("RedBounce: game canvas element not found.");
    return;
  }
  const uiRoot = document.getElementById("ui-root");
  if (!(uiRoot instanceof HTMLElement)) {
    console.error("RedBounce: UI root element not found.");
    return;
  }

  const app = new GameApplication(canvas, uiRoot);
  app.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
