import { describe, expect, it } from "vitest";
import { ALL_LEVELS } from "../../../src/levels/levels";
import { level01 } from "../../../src/levels/Level";
import { PLAYER_DEFAULTS } from "../../../src/config/gameplay.config";
import type { LevelDefinition } from "../../../src/levels/Level";

/**
 * Physics-based solvability check.
 *
 * A level is playable only if a bouncing ball can travel from the spawn
 * surface to the exit surface using the real jump physics (spec section 41:
 * the first release must prioritize a satisfying bounce and reliable play).
 *
 * Model (conservative):
 * - Bounce height h = bounceVelocity^2 / (2 * gravity) (~83px).
 * - From a pad: h = 430^2 / 1400 (~132px).
 * - Horizontal speed = maxHorizontalSpeed, and the ball may only cross a
 *   gap while its arc is above the target surface (time above height).
 * - Landing needs ~12px clearance (ball radius + margin).
 */

const G = PLAYER_DEFAULTS.gravity;
const V = Math.abs(PLAYER_DEFAULTS.bounceVelocity);
const H = (V * V) / (2 * G);
const SPEED = PLAYER_DEFAULTS.maxHorizontalSpeed;
const PAD_V = 430;
const PAD_H = (PAD_V * PAD_V) / (2 * G);
const CLEARANCE = 12;
const FALL_GAP = 130; // generous horizontal reach while falling far

type Surface = {
  id: string;
  x1: number;
  x2: number;
  top: number;
  pad: boolean;
};

function surfacesOf(level: LevelDefinition): Surface[] {
  const surfaces: Surface[] = [];
  for (const e of level.entities) {
    switch (e.type) {
      case "static-platform":
      case "one-way-platform":
      case "breakable-platform":
        surfaces.push({ id: e.id, x1: e.x, x2: e.x + e.width, top: e.y, pad: false });
        break;
      case "bounce-pad":
        surfaces.push({ id: e.id, x1: e.x, x2: e.x + e.width, top: e.y, pad: true });
        break;
      case "moving-platform":
        surfaces.push({
          id: `${e.id}@start`,
          x1: e.start.x,
          x2: e.start.x + e.width,
          top: e.start.y,
          pad: false,
        });
        surfaces.push({
          id: `${e.id}@end`,
          x1: e.end.x,
          x2: e.end.x + e.width,
          top: e.end.y,
          pad: false,
        });
        break;
      default:
        break;
    }
  }
  return surfaces;
}

function horizontalGap(a: Surface, b: Surface): number {
  if (a.x1 > b.x2) return a.x1 - b.x2;
  if (b.x1 > a.x2) return b.x1 - a.x2;
  return 0;
}

/** Can the ball jump from surface a and land on surface b? */
function canJump(a: Surface, b: Surface): boolean {
  const rise = a.top - b.top; // > 0: target is higher
  const height = a.pad ? PAD_H : H;

  if (rise > height - CLEARANCE) return false;
  const gap = horizontalGap(a, b);

  if (rise <= -CLEARANCE) {
    // Falling onto a lower surface: plenty of airtime.
    return gap <= FALL_GAP;
  }
  if (rise <= 0) {
    // Slightly lower or level: full arc time available.
    return gap <= ((SPEED * (2 * V)) / G) * 0.9;
  }
  // Rising: only the part of the arc above the target height counts.
  const tAbove = 2 * Math.sqrt(Math.max(0, (2 * (height - rise)) / G));
  return gap <= SPEED * tAbove * 0.85;
}

function isSolvable(level: LevelDefinition): { solvable: boolean; reason: string } {
  const surfaces = surfacesOf(level);
  const exit = level.entities.find((e) => e.type === "level-exit");
  if (!exit || exit.type !== "level-exit") return { solvable: false, reason: "no exit" };

  // Spawn surface: highest surface directly below the spawn point.
  const spawnSurface = surfaces
    .filter((s) => level.spawn.x >= s.x1 - 4 && level.spawn.x <= s.x2 + 4 && s.top >= level.spawn.y)
    .sort((a, b) => a.top - b.top)[0];
  if (!spawnSurface) return { solvable: false, reason: "no surface under spawn" };

  // Exit surfaces: overlapping the exit x-range and reachable by bouncing.
  const exitSurfaces = surfaces.filter(
    (s) =>
      s.x2 > exit.x &&
      s.x1 < exit.x + exit.width &&
      s.top <= exit.y + exit.height + 4 &&
      s.top >= exit.y - H - 20,
  );
  if (exitSurfaces.length === 0) return { solvable: false, reason: "no surface at exit" };

  // BFS over jump edges. Moving-platform start/end nodes are always linked.
  const queue: Surface[] = [spawnSurface];
  const visited = new Set<string>([spawnSurface.id]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const target of exitSurfaces) {
      if (target.id === current.id) return { solvable: true, reason: "" };
    }
    for (const next of surfaces) {
      if (visited.has(next.id)) continue;
      const linked =
        (current.id.split("@")[0] === next.id.split("@")[0] && current.id !== next.id) || // moving pair
        canJump(current, next);
      if (linked) {
        visited.add(next.id);
        queue.push(next);
      }
    }
  }
  return { solvable: false, reason: "exit not reachable from spawn" };
}

describe("Level solvability (playability)", () => {
  it("the physics model sanity-checks: a 40px step-up with a 30px gap is reachable", () => {
    const a: Surface = { id: "a", x1: 0, x2: 100, top: 500, pad: false };
    const b: Surface = { id: "b", x1: 130, x2: 230, top: 460, pad: false };
    expect(canJump(a, b)).toBe(true);
  });

  it("an 80px step-up is NOT reachable without a pad (old level-01 bug)", () => {
    const a: Surface = { id: "a", x1: 0, x2: 100, top: 500, pad: false };
    const b: Surface = { id: "b", x1: 130, x2: 230, top: 420, pad: false };
    expect(canJump(a, b)).toBe(false);
  });

  it("an 80px step-up IS reachable from a bounce pad", () => {
    const a: Surface = { id: "a", x1: 0, x2: 100, top: 500, pad: true };
    const b: Surface = { id: "b", x1: 130, x2: 230, top: 420, pad: false };
    expect(canJump(a, b)).toBe(true);
  });

  for (const level of [...ALL_LEVELS, level01]) {
    it(`level ${level.id} (${level.name}) is solvable from spawn to exit`, () => {
      const result = isSolvable(level);
      expect(result.solvable, `${level.id}: ${result.reason}`).toBe(true);
    });
  }
});
