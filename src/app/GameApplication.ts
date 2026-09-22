/**
 * Minimal application placeholder used by the Phase 0 scaffold.
 * Replaced by the full game runtime in later phases.
 */
export class GameApplication {
  private readonly canvas: HTMLCanvasElement;
  private readonly uiRoot: HTMLElement;
  private running = false;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.canvas = canvas;
    this.uiRoot = uiRoot;
  }

  start(): void {
    this.running = true;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      console.error("RedBounce: canvas 2D context unavailable.");
      return;
    }
    ctx.fillStyle = "#1a1c2c";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#ef7d57";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("RedBounce bootstrap OK", this.canvas.width / 2, this.canvas.height / 2);
    this.uiRoot.dataset.booted = "true";
  }

  stop(): void {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
