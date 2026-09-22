import type { RenderContext } from "./RenderContext";
import { PALETTE } from "../config/rendering.config";

/** Read-only view of a platform for rendering (spec section 13). */
export type PlatformView = {
  x: number;
  y: number;
  width: number;
  height: number;
  material?: "grass" | "stone" | "ice" | "metal" | "wood";
  kind: "static" | "one-way" | "moving" | "bounce-pad" | "breakable";
  cracked?: boolean;
  phase?: number;
};

/** Read-only view of the player ball (spec section 11). */
export type PlayerView = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  /** 1 = round; <1 squashed vertically (landing); >1 stretched (rising). */
  squash: number;
  facing: 1 | -1;
  invulnerable: boolean;
  dead: boolean;
  /** Animation phase used for invulnerability flicker. */
  phase?: number;
};

/**
 * Draws world entities (spec section 20, layers 5-8).
 * All draws are pure functions of the view data.
 */
export class EntityRenderer {
  drawPlatform(r: RenderContext, p: PlatformView): void {
    const { ctx } = r;
    const colors = platformColors(p.material);
    ctx.fillStyle = colors.body;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = colors.edge;
    ctx.fillRect(p.x, p.y, p.width, 2);

    switch (p.kind) {
      case "one-way":
        ctx.fillStyle = colors.edge;
        for (let x = p.x + 2; x < p.x + p.width - 2; x += 6) {
          ctx.fillRect(x, p.y + p.height - 2, 3, 2);
        }
        break;
      case "bounce-pad":
        ctx.fillStyle = PALETTE.laser;
        ctx.fillRect(p.x + 2, p.y, p.width - 4, 3);
        break;
      case "breakable":
        ctx.strokeStyle = p.cracked ? PALETTE.spike : "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        if (p.cracked) {
          ctx.beginPath();
          ctx.moveTo(p.x + p.width * 0.25, p.y);
          ctx.lineTo(p.x + p.width * 0.4, p.y + p.height);
          ctx.moveTo(p.x + p.width * 0.6, p.y);
          ctx.lineTo(p.x + p.width * 0.5, p.y + p.height);
          ctx.stroke();
        }
        break;
      case "moving":
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(p.x + p.width / 2 - 1, p.y - 3, 2, 3);
        break;
      default:
        break;
    }
  }

  /** Red ball with squash-and-stretch; visual only, never physics (spec 11). */
  drawPlayer(r: RenderContext, p: PlayerView): void {
    const { ctx } = r;
    const squash = clamp01(p.squash);
    const scaleX = 2 - squash;
    const scaleY = squash;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(scaleX, scaleY);

    if (p.invulnerable && Math.floor((p.phase ?? 0) * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Body
    ctx.fillStyle = PALETTE.player;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Rim + shine
    ctx.strokeStyle = PALETTE.playerEdge;
    ctx.lineWidth = Math.max(1, p.radius * 0.18);
    ctx.stroke();
    ctx.fillStyle = PALETTE.playerShine;
    ctx.beginPath();
    ctx.ellipse(
      -p.radius * 0.3,
      -p.radius * 0.35,
      p.radius * 0.35,
      p.radius * 0.22,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Eyes (expression, facing direction)
    const eyeX = p.facing * p.radius * 0.25;
    ctx.fillStyle = "#1a1c2c";
    ctx.beginPath();
    ctx.arc(
      eyeX - p.radius * 0.18,
      -p.radius * 0.15,
      Math.max(0.8, p.radius * 0.12),
      0,
      Math.PI * 2,
    );
    ctx.arc(
      eyeX + p.radius * 0.22,
      -p.radius * 0.15,
      Math.max(0.8, p.radius * 0.12),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (p.dead) {
      // X eyes
      ctx.strokeStyle = "#1a1c2c";
      ctx.lineWidth = 1;
      const s = p.radius * 0.25;
      ctx.beginPath();
      ctx.moveTo(eyeX - s, -p.radius * 0.15 - s);
      ctx.lineTo(eyeX - s + 2, -p.radius * 0.15 + s);
      ctx.moveTo(eyeX + s, -p.radius * 0.15 - s);
      ctx.lineTo(eyeX + s - 2, -p.radius * 0.15 + s);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function platformColors(material: PlatformView["material"]): { body: string; edge: string } {
  switch (material) {
    case "stone":
      return { body: PALETTE.stone, edge: PALETTE.stoneEdge };
    case "ice":
      return { body: PALETTE.ice, edge: "#ffffff" };
    case "metal":
      return { body: PALETTE.metal, edge: PALETTE.metalEdge };
    case "wood":
      return { body: PALETTE.wood, edge: PALETTE.woodEdge };
    default:
      return { body: PALETTE.ground, edge: PALETTE.groundEdge };
  }
}

function clamp01(v: number): number {
  return v < 0.5 ? Math.max(0.5, v) : Math.min(1.5, v);
}
