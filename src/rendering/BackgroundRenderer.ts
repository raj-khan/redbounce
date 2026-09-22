import type { RenderContext } from "./RenderContext";
import { PALETTE } from "../config/rendering.config";

/**
 * Sky and background layers (spec section 20, layers 1-3).
 * Parallax factors are hooks for task 64; static for now.
 */
export class BackgroundRenderer {
  /** Layered sky gradient + distant hills. */
  render(r: RenderContext, worldTheme: string = "meadow"): void {
    this.renderSky(r, worldTheme);
    this.renderFarHills(r);
  }

  private renderSky(r: RenderContext, worldTheme: string): void {
    const { ctx, camera, logicalWidth, logicalHeight } = r;
    // Sky is drawn in screen space aligned to camera Y only.
    const gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    const colors = skyColors(worldTheme);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.save();
    r.applyScreenTransform();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    // subtle vertical parallax: shift a horizon band with camera.y
    const horizon = logicalHeight * 0.62 - camera.y * 0.1;
    ctx.fillStyle = colors[2] ?? PALETTE.farHills;
    ctx.fillRect(0, horizon, logicalWidth, logicalHeight - horizon);
    ctx.restore();
  }

  private renderFarHills(r: RenderContext): void {
    const { ctx, camera, logicalWidth } = r;
    ctx.save();
    r.applyScreenTransform();
    // Two parallax hill strips derived from camera x (factor 0.2 / 0.4).
    drawHills(ctx, -camera.x * 0.2, logicalWidth, PALETTE.farHills, 26, 220);
    drawHills(ctx, -camera.x * 0.4, logicalWidth, PALETTE.nearHills, 18, 240);
    ctx.restore();
  }
}

function skyColors(worldTheme: string): [string, string] | [string, string, string] {
  switch (worldTheme) {
    case "cave":
      return ["#24232e", "#131118", "#2b2a36"];
    case "factory":
      return ["#3a3f52", "#232633", "#444a5e"];
    case "sky":
      return ["#7ec8e3", "#4a90c2", "#9fd8ef"];
    case "core":
      return ["#5a1f24", "#2a0f13", "#6e2a2f"];
    default:
      return ["#3fbac2", "#1a1c2c", "#2e5d6b"];
  }
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  offset: number,
  width: number,
  color: string,
  amplitude: number,
  baseY: number,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY + amplitude);
  const period = 90;
  const start = Math.floor(-offset / period) * period;
  for (let x = start; x < width - offset + period; x += period) {
    const sx = x + offset;
    ctx.quadraticCurveTo(sx + period / 2, baseY - amplitude, sx + period, baseY);
  }
  ctx.lineTo(width, 200);
  ctx.lineTo(0, 200);
  ctx.closePath();
  ctx.fill();
}
