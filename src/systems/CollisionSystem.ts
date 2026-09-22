import type { Player } from "../entities/Player";
import type { PlatformRuntime } from "../levels/Level";
import { circleRectContact } from "../physics/CollisionResolver";

/**
 * Resolves the player circle against solid platforms (spec section 12).
 *
 * Axis-separated integration keeps the ball from tunneling through thin
 * platforms at normal speeds: horizontal move + resolve, then vertical.
 */
export class CollisionSystem {
  /**
   * Resolve horizontal overlap after the x integration step.
   * Returns true when any solid was hit.
   */
  resolveHorizontal(player: Player, platforms: readonly PlatformRuntime[]): boolean {
    let hit = false;
    for (const platform of platforms) {
      if (platform.oneWay) continue;
      const contact = circleRectContact(player.x, player.y, player.radius, platform.rect);
      if (!contact) continue;
      if (Math.abs(contact.nx) < 0.0001) continue;
      player.x += contact.nx * contact.depth;
      // Kill velocity into the wall.
      if (Math.sign(player.vx) === -Math.sign(contact.nx)) player.vx = 0;
      hit = true;
    }
    return hit;
  }

  /**
   * Resolve vertical overlap after the y integration step.
   * `previousBottom` gates one-way platforms (spec section 13).
   * Returns the landing platform id when the player lands, else null.
   */
  resolveVertical(
    player: Player,
    platforms: readonly PlatformRuntime[],
    previousBottom: number,
  ): string | null {
    let landedOn: string | null = null;
    for (const platform of platforms) {
      const contact = circleRectContact(player.x, player.y, player.radius, platform.rect);
      if (!contact) continue;

      if (platform.oneWay) {
        // Land only when falling and the previous bottom was above the top.
        const wasAbove = previousBottom <= platform.rect.y + 2;
        if (!(player.vy >= 0 && wasAbove && contact.ny < 0)) continue;
      }

      player.y += contact.ny * contact.depth;

      if (contact.ny < -0.5) {
        // Pushed up: landing surface.
        if (player.vy >= 0) landedOn = platform.id;
      } else if (contact.ny > 0.5) {
        // Hit head: stop upward motion.
        if (player.vy < 0) player.vy = 0;
      }
    }
    return landedOn;
  }
}
