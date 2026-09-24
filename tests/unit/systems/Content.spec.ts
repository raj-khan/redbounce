import { describe, expect, it } from "vitest";
import { GameWorld } from "../../../src/systems/GameWorld";
import { ALL_LEVELS } from "../../../src/levels/levels";
import { validateLevel } from "../../../src/levels/LevelValidator";
import type { EntityDefinition, LevelDefinition } from "../../../src/levels/Level";
import { ParticleSystem, MAX_PARTICLES } from "../../../src/systems/ParticleSystem";

const DT = 1 / 60;
const NO_INPUT = { left: false, right: false };

function makeLevel(
  entities: EntityDefinition[],
  overrides: Partial<LevelDefinition> = {},
): LevelDefinition {
  return {
    id: "test-level",
    name: "Test",
    world: "meadow",
    width: 800,
    height: 400,
    spawn: { x: 100, y: 100 },
    camera: { minX: 0, maxX: 800, minY: 0, maxY: 400 },
    entities,
    ...overrides,
  };
}

const FLOOR: EntityDefinition = {
  id: "floor",
  type: "static-platform",
  x: 0,
  y: 380,
  width: 800,
  height: 20,
};
const EXIT: EntityDefinition = {
  id: "exit",
  type: "level-exit",
  x: 700,
  y: 300,
  width: 48,
  height: 80,
};

describe("Shipped levels", () => {
  it("contains 10 levels across 5 worlds", () => {
    expect(ALL_LEVELS.length).toBe(10);
    const worlds = new Set(ALL_LEVELS.map((level) => level.world));
    expect(worlds.size).toBe(5);
  });

  it("every level passes validation", () => {
    for (const level of ALL_LEVELS) {
      const errors = validateLevel(level);
      expect(errors, `level ${level.id}: ${errors.join("; ")}`).toEqual([]);
    }
  });

  it("level ids are unique", () => {
    const ids = ALL_LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Moving platforms", () => {
  it("oscillates between start and end", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "m1",
          type: "moving-platform",
          start: { x: 100, y: 300 },
          end: { x: 200, y: 300 },
          durationSeconds: 1,
          width: 60,
          height: 10,
        },
      ]),
    );
    const platform = world.movingPlatforms[0]!;
    expect(platform.rect.x).toBeCloseTo(100, 5);
    // ~0.83s into the cycle reaches near the far end.
    for (let i = 0; i < 50; i++) world.step(DT, NO_INPUT);
    expect(platform.rect.x).toBeGreaterThan(140);
    // ~1.83s returns near the start.
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    expect(platform.rect.x).toBeLessThan(110);
  });

  it("resets to start on world reset", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "m1",
          type: "moving-platform",
          start: { x: 100, y: 300 },
          end: { x: 200, y: 300 },
          durationSeconds: 1,
          width: 60,
          height: 10,
        },
      ]),
    );
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    world.reset();
    expect(world.movingPlatforms[0]!.rect.x).toBe(100);
  });
});

describe("Bounce pads", () => {
  it("launch the player much higher than a normal bounce", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "pad", type: "bounce-pad", x: 80, y: 374, width: 40, height: 6, velocity: -440 },
      ]),
    );
    // Drop the player straight onto the pad.
    let maxY = -Infinity;
    let maxVy = 0;
    for (let i = 0; i < 240; i++) {
      world.step(DT, NO_INPUT);
      maxY = Math.min(maxY, world.player.y);
      if (world.player.vy < 0) maxVy = Math.min(maxVy, world.player.vy);
    }
    // Pad launch (-440) must exceed the regular bounce (-340).
    expect(maxVy).toBeLessThanOrEqual(-400);
    // Reaches much higher than a normal bounce (~83px).
    expect(374 - maxY).toBeGreaterThan(100);
  });
});

describe("Breakable platforms", () => {
  it("crack on landing, then break after the delay", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "b1",
          type: "breakable-platform",
          x: 80,
          y: 374,
          width: 60,
          height: 10,
          breakDelaySeconds: 0.3,
        },
      ]),
    );
    const breakable = world.breakables[0]!;
    // Land on the breakable (directly below spawn; ~1s fall).
    for (let i = 0; i < 80; i++) world.step(DT, NO_INPUT);
    expect(breakable.state).toBe("cracking");
    // After the delay it breaks and stops being solid.
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    expect(breakable.state).toBe("broken");
    // The player falls through to the floor below and bounces on it.
    let maxY = -Infinity;
    for (let i = 0; i < 60; i++) {
      world.step(DT, NO_INPUT);
      maxY = Math.max(maxY, world.player.y);
    }
    expect(maxY).toBeGreaterThan(365);
  });

  it("respawn on level restart", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "b1", type: "breakable-platform", x: 80, y: 374, width: 60, height: 10 },
      ]),
    );
    for (let i = 0; i < 160; i++) world.step(DT, NO_INPUT);
    expect(world.breakables[0]!.state).toBe("broken");
    world.reset();
    expect(world.breakables[0]!.state).toBe("intact");
  });
});

describe("Enemies", () => {
  it("patroller moves between its endpoints", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "p1",
          type: "patroller",
          start: { x: 400, y: 100 },
          end: { x: 500, y: 100 },
          speed: 50,
        },
      ]),
    );
    const enemy = world.enemies[0]!;
    expect(enemy.kind).toBe("patroller");
    if (enemy.kind !== "patroller") return;
    for (let i = 0; i < 120; i++) world.step(DT, NO_INPUT);
    expect(enemy.x).toBeGreaterThan(400);
    // Eventually reverses (2s one-way at 50px/s).
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    expect(enemy.x).toBeLessThan(500);
    expect(enemy.x).toBeGreaterThanOrEqual(399);
    expect(enemy.x).toBeLessThanOrEqual(501);
  });

  it("chaser activates within aggro radius and homes on the player", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "c1", type: "chaser", x: 400, y: 100, speed: 60, aggroRadius: 80 },
      ]),
    );
    const enemy = world.enemies[0]!;
    if (enemy.kind !== "chaser") throw new Error("expected chaser");
    expect(enemy.aggro).toBe(false);
    // Move the player near the chaser.
    world.player.x = 430;
    world.player.y = 100;
    world.player.vy = 0;
    for (let i = 0; i < 10; i++) world.step(DT, NO_INPUT);
    expect(enemy.aggro).toBe(true);
    const startX = enemy.x;
    for (let i = 0; i < 30; i++) world.step(DT, NO_INPUT);
    expect(enemy.x).not.toBe(startX);
  });

  it("orbital circles its center at the orbit radius", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "o1",
          type: "orbital",
          center: { x: 400, y: 150 },
          orbitRadius: 50,
          radius: 7,
          angularSpeed: 2,
        },
      ]),
    );
    const enemy = world.enemies[0]!;
    if (enemy.kind !== "orbital") throw new Error("expected orbital");
    for (let i = 0; i < 30; i++) world.step(DT, NO_INPUT);
    const dist = Math.hypot(enemy.x - enemy.centerX, enemy.y - enemy.centerY);
    expect(dist).toBeCloseTo(50, 1);
    expect(enemy.angle).toBeGreaterThan(0);
  });

  it("enemy contact kills the player", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "c1", type: "chaser", x: 100, y: 373, speed: 0.01, aggroRadius: 5 },
      ]),
    );
    let died = false;
    for (let i = 0; i < 240 && !died; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.state === "dead") died = true;
    }
    expect(died).toBe(true);
  });
});

describe("Wind zones", () => {
  it("push the player horizontally while inside", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "w1", type: "wind-zone", x: 0, y: 0, width: 800, height: 300, forceX: 200 },
      ]),
    );
    // Hover inside the zone (falling through it).
    let pushed = false;
    for (let i = 0; i < 120; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.vx > 20) pushed = true;
    }
    expect(pushed).toBe(true);
  });
});

describe("ParticleSystem", () => {
  it("caps live particles at capacity", () => {
    const system = new ParticleSystem(50);
    for (let i = 0; i < 500; i++) system.spawn("dust", 0, 0);
    expect(system.count()).toBeLessThanOrEqual(50);
    expect(system.capacity()).toBe(50);
  });

  it("respects the global budget", () => {
    const system = new ParticleSystem();
    expect(system.capacity()).toBe(MAX_PARTICLES);
  });

  it("particles expire over time", () => {
    const system = new ParticleSystem();
    system.spawn("dust", 0, 0, { life: 0.1 });
    expect(system.count()).toBe(1);
    system.update(0.2);
    expect(system.count()).toBe(0);
  });

  it("clear empties everything", () => {
    const system = new ParticleSystem();
    system.spawnBounceDust(0, 0);
    system.spawnDeathBurst(0, 0);
    expect(system.count()).toBeGreaterThan(0);
    system.clear();
    expect(system.count()).toBe(0);
  });

  it("no allocation growth: reused pool", () => {
    const system = new ParticleSystem(10);
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < 20; i++) system.spawn("sparkle", 0, 0, { life: 0.05 });
      system.update(0.1);
    }
    expect(system.capacity()).toBe(10);
  });
});
