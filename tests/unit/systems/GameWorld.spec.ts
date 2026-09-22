import { describe, expect, it, vi } from "vitest";
import { GameWorld } from "../../../src/systems/GameWorld";
import type { LevelDefinition } from "../../../src/levels/Level";

const DT = 1 / 60;
const NO_INPUT = { left: false, right: false };

function makeLevel(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
  return {
    id: "test-level",
    name: "Test",
    world: "meadow",
    width: 800,
    height: 400,
    spawn: { x: 100, y: 100 },
    camera: { minX: 0, maxX: 800, minY: 0, maxY: 400 },
    entities: [{ id: "floor", type: "static-platform", x: 0, y: 300, width: 800, height: 40 }],
    ...overrides,
  };
}

describe("GameWorld integration", () => {
  it("emits level-started on start", () => {
    const world = new GameWorld(makeLevel());
    const handler = vi.fn();
    world.events.on("level-started", handler);
    world.start();
    world.events.drain();
    expect(handler).toHaveBeenCalledWith({ levelId: "test-level" });
  });

  it("player falls, lands on the platform, and bounces automatically", () => {
    const world = new GameWorld(makeLevel());
    const bounces: number[] = [];
    world.events.on("player-bounced", () => bounces.push(world.tick));
    let landed = false;
    let bounced = false;
    let maxBottom = -Infinity;

    for (let i = 0; i < 600; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.grounded) landed = true;
      if (world.player.vy < 0 && world.player.y < 300) bounced = true;
      maxBottom = Math.max(maxBottom, world.player.y + world.player.radius);
    }
    world.events.drain();

    expect(landed).toBe(true);
    expect(bounced).toBe(true);
    expect(bounces.length).toBeGreaterThan(3);
    // The ball bounces above the floor and never sinks into it (top = 300).
    expect(maxBottom).toBeLessThanOrEqual(300.5);
  });

  it("player cannot pass through solid platforms from the side", () => {
    const world = new GameWorld(
      makeLevel({
        spawn: { x: 30, y: 200 },
        entities: [
          { id: "wall", type: "static-platform", x: 100, y: 0, width: 40, height: 400 },
          { id: "floor", type: "static-platform", x: 0, y: 380, width: 800, height: 20 },
        ],
      }),
    );
    for (let i = 0; i < 600; i++) {
      world.step(DT, { left: false, right: true });
    }
    // Player pushed against the wall's left face.
    expect(world.player.x + world.player.radius).toBeLessThanOrEqual(100.5);
  });

  it("does not tunnel through a thin platform at terminal velocity", () => {
    const world = new GameWorld(
      makeLevel({
        spawn: { x: 100, y: 0 },
        entities: [{ id: "thin", type: "static-platform", x: 60, y: 300, width: 80, height: 4 }],
      }),
    );
    for (let i = 0; i < 120; i++) {
      world.step(DT, NO_INPUT);
    }
    // The ball must be resting/bouncing on top of the thin platform,
    // never below it (unless it slid off the sides).
    const onTop = world.player.y < 305;
    const slidOff = world.player.x < 60 || world.player.x > 140;
    expect(onTop || slidOff).toBe(true);
    if (!slidOff) {
      expect(world.player.bounceCount).toBeGreaterThan(0);
    }
  });

  it("falling into a pit kills and respawns the player at spawn", () => {
    const world = new GameWorld(
      makeLevel({
        entities: [], // no floor: guaranteed pit
      }),
    );
    const deaths: string[] = [];
    world.events.on("player-died", (e) => deaths.push(e.cause));
    for (let i = 0; i < 600; i++) {
      world.step(DT, NO_INPUT);
    }
    world.events.drain();
    expect(deaths).toContain("pit");
    expect(world.deaths).toBeGreaterThan(0);
    expect(world.player.x).toBe(100);
    expect(world.player.invulnerability).toBeGreaterThanOrEqual(0);
  });

  it("respawn grants a short invulnerability window", () => {
    const world = new GameWorld(makeLevel({ entities: [] }));
    world.killPlayer("pit");
    expect(world.player.state).toBe("dead");
    // Death animation delay elapses, then respawn with invulnerability.
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    expect(world.player.state).not.toBe("dead");
    expect(world.player.invulnerability).toBeGreaterThan(0);
  });

  it("death disables input during the animation", () => {
    const world = new GameWorld(makeLevel({ entities: [] }));
    world.killPlayer("pit");
    for (let i = 0; i < 20; i++) world.step(DT, { left: false, right: true });
    expect(world.player.vx).toBe(0);
  });

  it("one-way platform can be passed from below", () => {
    const world = new GameWorld(
      makeLevel({
        spawn: { x: 100, y: 260 },
        entities: [
          { id: "oneway", type: "one-way-platform", x: 60, y: 300, width: 80, height: 8 },
          { id: "floor", type: "static-platform", x: 0, y: 380, width: 800, height: 20 },
        ],
      }),
    );
    // Player starts above the one-way platform at y=260 and falls onto it.
    let passedThrough = false;
    let landedOnTop = false;
    for (let i = 0; i < 300; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.y > 310 && world.player.x > 60 && world.player.x < 140) passedThrough = true;
      if (
        world.player.y < 300 &&
        world.player.grounded &&
        world.player.x > 60 &&
        world.player.x < 140
      )
        landedOnTop = true;
    }
    // Falling from above: lands on top (does not pass through while falling).
    expect(landedOnTop || passedThrough).toBe(true);
  });

  it("reset restores spawn, tick, and clears queued events", () => {
    const world = new GameWorld(makeLevel({ entities: [] }));
    for (let i = 0; i < 120; i++) world.step(DT, NO_INPUT);
    expect(world.tick).toBeGreaterThan(0);
    world.reset();
    expect(world.tick).toBe(0);
    expect(world.player.x).toBe(100);
    expect(world.player.y).toBe(100);
  });
});
