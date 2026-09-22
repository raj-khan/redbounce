import { Camera } from "./Camera";
import { RenderContext } from "./RenderContext";
import { computeBackingSize, computeCanvasSize } from "./ViewportScaling";
import { VIEWPORT } from "../config/rendering.config";

/**
 * Canvas renderer (spec section 20).
 *
 * Owns the canvas backing store and devicePixelRatio handling. The logical
 * viewport is 320x180 world units; CSS scales it while preserving aspect.
 * Rendering is read-only with respect to gameplay state.
 */
export class CanvasRenderer {
  readonly camera: Camera;
  readonly context: RenderContext;
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, camera?: Camera) {
    this.canvas = canvas;
    this.camera = camera ?? new Camera(VIEWPORT.width, VIEWPORT.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("RedBounce: canvas 2D context unavailable");
    this.context = new RenderContext(ctx, this.camera, VIEWPORT.width, VIEWPORT.height);
    this.resize();
  }

  /** Sync the backing store with the CSS size and devicePixelRatio. */
  resize(): void {
    const parent = this.canvas.parentElement;
    const containerWidth = (parent?.clientWidth ?? this.canvas.clientWidth) || VIEWPORT.width;
    const containerHeight = (parent?.clientHeight ?? this.canvas.clientHeight) || VIEWPORT.height;
    const { cssWidth, cssHeight } = computeCanvasSize(containerWidth, containerHeight);
    const backing = computeBackingSize(cssWidth, globalThis.devicePixelRatio ?? 1);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    if (this.canvas.width !== backing.cssWidth || this.canvas.height !== backing.cssHeight) {
      this.canvas.width = backing.cssWidth;
      this.canvas.height = backing.cssHeight;
    }
    this.context.setBackingScale(backing.cssWidth / VIEWPORT.width);
  }

  /** Clear and prepare the frame; call once before world rendering. */
  beginFrame(): void {
    const { ctx } = this.context;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  endFrame(): void {
    // Hook for future post-processing; kept for the Renderer contract.
  }
}
