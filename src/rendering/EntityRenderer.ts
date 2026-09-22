import type { RenderContext } from "./RenderContext";
import { PALETTE } from "../config/rendering.config";
import type {
  CheckpointRuntime,
  CollectibleRuntime,
  HazardRuntime,
} from "../entities/EntityRuntime";

/** Read-only view of a platform for rendering (spec section 13). */
export type PlatformView = {
  x: number;
  y: number;
  width: number;
  height: number;
  material?: "grass" | "stone" | "ice" | "metal" | "wood";
  kind: "static" | "one-way" | "moving" | "bounce-pad" | "breakable";
  cracked?: boolean;
};

/** Read-only view of the player ball (spec section 11). */
export type PlayerView = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  /** 1 = round; < 1 squashed vertically (landing); > 1 stretched (rising). */
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
  // ---------------------------------------------------------------------
  // Platforms
  // ---------------------------------------------------------------------

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
        if (p.cracked) {
          ctx.strokeStyle = PALETTE.spike;
          ctx.lineWidth = 1;
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

  // ---------------------------------------------------------------------
  // Player
  // ---------------------------------------------------------------------

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

    ctx.fillStyle = PALETTE.player;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

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

  // ---------------------------------------------------------------------
  // Collectibles (spec section 16)
  // ---------------------------------------------------------------------

  drawCollectible(r: RenderContext, c: CollectibleRuntime, time: number): void {
    if (c.collected) return;
    const { ctx } = r;
    const bob = Math.sin(time * 3 + c.x * 0.1) * 2;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    switch (c.type) {
      case "ring":
        ctx.strokeStyle = PALETTE.ringEdge;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = PALETTE.ring;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "star": {
        ctx.fillStyle = PALETTE.star;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 6 : 2.5;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "key":
        ctx.strokeStyle = PALETTE.key;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -3, 3, 0, Math.PI * 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 6);
        ctx.moveTo(0, 4);
        ctx.lineTo(3, 4);
        ctx.moveTo(0, 6);
        ctx.lineTo(3, 6);
        ctx.stroke();
        break;
      case "heart": {
        ctx.fillStyle = PALETTE.heart;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-7, -1, -4, -6, 0, -2);
        ctx.bezierCurveTo(4, -6, 7, -1, 0, 5);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // Hazards with readable telegraphs (spec section 14)
  // ---------------------------------------------------------------------

  drawHazard(r: RenderContext, h: HazardRuntime): void {
    const { ctx } = r;
    switch (h.kind) {
      case "spikes": {
        ctx.fillStyle = PALETTE.spike;
        const count = Math.max(1, Math.floor(h.width / 8));
        const step = h.width / count;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const x = h.x + i * step;
          ctx.moveTo(x, h.y + h.height);
          ctx.lineTo(x + step / 2, h.y);
          ctx.lineTo(x + step, h.y + h.height);
        }
        ctx.fill();
        break;
      }
      case "lava": {
        const gradient = ctx.createLinearGradient(0, h.y, 0, h.y + h.height);
        gradient.addColorStop(0, PALETTE.lava);
        gradient.addColorStop(1, PALETTE.lavaEdge);
        ctx.fillStyle = gradient;
        ctx.fillRect(h.x, h.y, h.width, h.height);
        ctx.fillStyle = "rgba(255,220,120,0.5)";
        ctx.fillRect(h.x, h.y, h.width, 2);
        break;
      }
      case "saw": {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);
        ctx.fillStyle = PALETTE.saw;
        const teeth = 8;
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const radius = i % 2 === 0 ? h.radius : h.radius * 0.7;
          const angle = (Math.PI / teeth) * i;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1a1c2c";
        ctx.beginPath();
        ctx.arc(0, 0, h.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "laser": {
        if (h.phase === "idle") {
          ctx.fillStyle = "rgba(255,77,109,0.25)";
          ctx.fillRect(h.x, h.y, Math.max(1, h.width * 0.2), h.height);
        } else if (h.phase === "warn") {
          const blink = Math.floor(h.time * 12) % 2 === 0;
          ctx.fillStyle = blink ? "rgba(255,77,109,0.6)" : "rgba(255,77,109,0.2)";
          ctx.fillRect(h.x, h.y, h.width, h.height);
        } else {
          ctx.fillStyle = PALETTE.laser;
          ctx.fillRect(h.x, h.y, h.width, h.height);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(h.x + h.width * 0.3, h.y, h.width * 0.4, h.height);
        }
        break;
      }
      case "falling-rock": {
        ctx.fillStyle = "#6e6a7c";
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3d3a47";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (h.state === "idle") {
          // Telegraph cracks above the rock.
          ctx.strokeStyle = "rgba(244,244,244,0.4)";
          ctx.beginPath();
          ctx.moveTo(h.x - h.radius, h.y - h.radius - 3);
          ctx.lineTo(h.x - 1, h.y - h.radius - 1);
          ctx.lineTo(h.x + h.radius, h.y - h.radius - 4);
          ctx.stroke();
        }
        break;
      }
    }
  }

  // ---------------------------------------------------------------------
  // Checkpoints and exit (spec sections 17-18)
  // ---------------------------------------------------------------------

  drawCheckpoint(r: RenderContext, c: CheckpointRuntime): void {
    const { ctx } = r;
    const poleX = c.rect.x + c.rect.width / 2;
    ctx.strokeStyle = "#d9d9d9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(poleX, c.rect.y + c.rect.height);
    ctx.lineTo(poleX, c.rect.y);
    ctx.stroke();
    ctx.fillStyle = c.activated ? PALETTE.checkpointOn : PALETTE.checkpointOff;
    ctx.beginPath();
    ctx.moveTo(poleX, c.rect.y);
    ctx.lineTo(poleX + 12, c.rect.y + 5);
    ctx.lineTo(poleX, c.rect.y + 10);
    ctx.closePath();
    ctx.fill();
  }

  drawExit(
    r: RenderContext,
    exit: { rect: { x: number; y: number; width: number; height: number } },
    time: number,
  ): void {
    const { ctx } = r;
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    ctx.fillStyle = `rgba(91,192,235,${0.25 + pulse * 0.3})`;
    ctx.fillRect(exit.rect.x, exit.rect.y, exit.rect.width, exit.rect.height);
    ctx.strokeStyle = PALETTE.exit;
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.rect.x, exit.rect.y, exit.rect.width, exit.rect.height);
    ctx.fillStyle = PALETTE.hud;
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EXIT", exit.rect.x + exit.rect.width / 2, exit.rect.y + exit.rect.height / 2);
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
