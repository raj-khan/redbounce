import type { Camera } from "./Camera";
import { PALETTE } from "../config/rendering.config";

/**
 * Drawing context passed through the render pipeline.
 * Renderers are read-only with respect to gameplay state (spec section 20).
 */
export class RenderContext {
  constructor(
    public readonly ctx: CanvasRenderingContext2D,
    public readonly camera: Camera,
    public readonly logicalWidth: number,
    public readonly logicalHeight: number,
  ) {}

  /** Set up the camera transform with optional render-only shake. */
  applyCameraTransform(): void {
    const { ctx, camera } = this;
    const shake = camera.shakeOffset();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.backingScale, this.backingScale);
    ctx.translate(-Math.round(camera.x + shake.x), -Math.round(camera.y + shake.y));
  }

  /** Reset to screen space for HUD and debug overlays. */
  applyScreenTransform(): void {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.backingScale, this.backingScale);
  }

  /** Backing-store scale derived from the canvas size vs logical size. */
  get backingScale(): number {
    // Set by CanvasRenderer when the canvas resizes.
    return this._backingScale ?? 1;
  }

  private _backingScale: number | null = null;

  setBackingScale(scale: number): void {
    this._backingScale = scale;
  }

  /** Standard text helper for HUD/debug drawing in screen space. */
  fillTextScreen(text: string, x: number, y: number, color: string = PALETTE.hud, size = 8): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(text, x, y);
  }
}
