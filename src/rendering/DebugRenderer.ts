import type { RenderContext } from "./RenderContext";
import { PALETTE } from "../config/rendering.config";

export type DebugInfo = {
  fps: number;
  tick: number;
  state: string;
  levelId: string;
  entityId: number;
  playerX: number;
  playerY: number;
  velocityX: number;
  velocityY: number;
};

export type DebugShape =
  | { kind: "rect"; x: number; y: number; width: number; height: number; sensor?: boolean }
  | { kind: "circle"; x: number; y: number; radius: number; sensor?: boolean };

/**
 * Development-only debug overlay (spec section 33).
 * Must be disabled in production builds (DebugConfig).
 */
export class DebugRenderer {
  enabled = false;

  renderInfo(r: RenderContext, info: DebugInfo): void {
    if (!this.enabled) return;
    const lines = [
      `FPS ${info.fps.toFixed(0)}  TICK ${info.tick}`,
      `STATE ${info.state}  LEVEL ${info.levelId}`,
      `POS ${info.playerX.toFixed(1)},${info.playerY.toFixed(1)}`,
      `VEL ${info.velocityX.toFixed(1)},${info.velocityY.toFixed(1)}`,
      `ENTITIES ${info.entityId}`,
    ];
    r.applyScreenTransform();
    const { ctx } = r;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(2, 2, 120, lines.length * 9 + 4);
    lines.forEach((line, i) => r.fillTextScreen(line, 5, 5 + i * 9, PALETTE.debug, 8));
  }

  renderShapes(r: RenderContext, shapes: DebugShape[]): void {
    if (!this.enabled) return;
    const { ctx } = r;
    ctx.save();
    r.applyCameraTransform();
    ctx.lineWidth = 1;
    for (const shape of shapes) {
      ctx.strokeStyle = shape.sensor ? "#ffe066" : PALETTE.debug;
      if (shape.kind === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
