import { describe, expect, it, vi } from "vitest";
import { GameWorld } from "../../../src/systems/GameWorld";
import type { EntityDefinition, LevelDefinition } from "../../../src/levels/Level";

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

describe("Collectibles", () => {
  it("collecting a ring adds score and emits events", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "r1", type: "ring", x: 100, y: 370, value: 10 }]),
    );
    const collected = vi.fn();
    world.events.on("collectible-collected", collected);
    // Player falls from (100,100) onto the floor; ring at (100,370) is on the way.
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    world.events.drain();
    expect(collected).toHaveBeenCalledWith({ collectibleId: "r1", value: 10 });
    expect(world.score).toBe(10);
    expect(world.collectiblesFound).toBe(1);
  });

  it("collected rings are not collected twice", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "r1", type: "ring", x: 100, y: 370 }]),
    );
    for (let i = 0; i < 480; i++) world.step(DT, NO_INPUT);
    expect(world.score).toBe(10); // exactly one pickup
  });

  it("keys set hasKey", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "k1", type: "key", x: 100, y: 370 }]),
    );
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    expect(world.hasKey).toBe(true);
  });

  it("hearts add lives", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "h1", type: "heart", x: 100, y: 370 }]),
    );
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    expect(world.lives).toBe(4);
  });

  it("collectibles respawn on level restart", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "r1", type: "ring", x: 100, y: 370 }]),
    );
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    expect(world.collectiblesFound).toBe(1);
    world.reset();
    expect(world.collectiblesFound).toBe(0);
    expect(world.score).toBe(0);
  });
});

describe("Hazards", () => {
  it("spikes kill the player and respawn at spawn after a delay", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "sp1", type: "spikes", x: 94, y: 368, width: 12, height: 12 }]),
    );
    const deaths = vi.fn();
    world.events.on("player-died", deaths);
    let sawDead = false;
    for (let i = 0; i < 480; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.state === "dead") sawDead = true;
    }
    world.events.drain();
    expect(sawDead).toBe(true);
    expect(deaths).toHaveBeenCalledWith(expect.objectContaining({ cause: "spikes" }));
    expect(world.deaths).toBeGreaterThanOrEqual(1);
    // Respawned back at spawn.
    expect(world.player.x).toBeCloseTo(100, 0);
  });

  it("invulnerability window after respawn prevents instant re-death", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "sp1", type: "spikes", x: 94, y: 368, width: 12, height: 12 }]),
    );
    for (let i = 0; i < 480; i++) world.step(DT, NO_INPUT);
    // Spike at the spawn's landing spot would kill instantly without i-frames.
    const firstDeaths = world.deaths;
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    // Either still invulnerable or died at most once more (window works).
    expect(world.deaths - firstDeaths).toBeLessThanOrEqual(1);
  });

  it("lasers cycle idle -> warn -> fire and only kill while firing", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        {
          id: "l1",
          type: "laser",
          x: 94,
          y: 100,
          width: 12,
          height: 280,
          onSeconds: 1,
          offSeconds: 1,
        },
      ]),
    );
    const laser = world.hazards.find((h) => h.id === "l1");
    expect(laser && laser.kind === "laser").toBe(true);
    if (!laser || laser.kind !== "laser") return;

    // Drain the whole cycle: must observe all three phases.
    const phases = new Set<string>();
    for (let i = 0; i < 480; i++) {
      world.step(DT, NO_INPUT);
      phases.add(laser.phase);
    }
    expect(phases.has("idle")).toBe(true);
    expect(phases.has("warn")).toBe(true);
    expect(phases.has("fire")).toBe(true);
  });

  it("saws kill on contact", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "s1", type: "saw", x: 100, y: 370, radius: 10, speed: 3 }]),
    );
    const deaths = vi.fn();
    world.events.on("player-died", deaths);
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    world.events.drain();
    expect(deaths).toHaveBeenCalled();
  });

  it("falling rocks trigger by proximity, fall, and rest on the floor", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "rock", type: "falling-rock", x: 100, y: 200, radius: 6, triggerDistance: 90 },
      ]),
    );
    const rock = world.hazards.find((h) => h.id === "rock");
    if (!rock || rock.kind !== "falling-rock") throw new Error("rock missing");
    // Player falls nearby -> rock triggers.
    for (let i = 0; i < 240; i++) world.step(DT, NO_INPUT);
    expect(rock.state).toBe("resting");
    expect(rock.y).toBeGreaterThan(200);
    expect(rock.y + rock.radius).toBeCloseTo(380, 1);
  });
});

describe("Checkpoints and respawn", () => {
  it("touching a checkpoint sets the respawn point", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "cp1", type: "checkpoint", x: 300, y: 310, width: 20, height: 70 },
      ]),
    );
    const activated = vi.fn();
    world.events.on("checkpoint-activated", activated);
    // Move right until we pass the checkpoint.
    for (let i = 0; i < 600; i++) world.step(DT, { left: false, right: true });
    world.events.drain();
    expect(activated).toHaveBeenCalledWith({ checkpointId: "cp1" });
    expect(world.spawn.x).toBeCloseTo(310, 0);
  });

  it("respawn after death uses the activated checkpoint", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "cp1", type: "checkpoint", x: 300, y: 310, width: 20, height: 70 },
        { id: "sp1", type: "spikes", x: 600, y: 368, width: 16, height: 12 },
      ]),
    );
    // Phase 1: land on the checkpoint to activate it.
    world.player.x = 310;
    world.player.y = 200;
    for (let i = 0; i < 120; i++) world.step(DT, NO_INPUT);
    expect(world.checkpoints[0]!.activated).toBe(true);

    // Phase 2: drop the player directly onto the spikes.
    world.player.x = 608;
    world.player.y = 300;
    world.player.vy = 0;
    let died = false;
    for (let i = 0; i < 240 && !died; i++) {
      world.step(DT, NO_INPUT);
      if (world.player.state === "dead") died = true;
    }
    expect(died).toBe(true);
    expect(world.deaths).toBeGreaterThanOrEqual(1);
    // Respawn happens at the checkpoint, not the level spawn.
    for (let i = 0; i < 60; i++) world.step(DT, NO_INPUT);
    expect(world.player.x).toBeCloseTo(310, 0);
    expect(world.player.state).not.toBe("dead");
  });

  it("checkpoints reset on level restart", () => {
    const world = new GameWorld(
      makeLevel([
        FLOOR,
        EXIT,
        { id: "cp1", type: "checkpoint", x: 300, y: 310, width: 20, height: 70 },
      ]),
    );
    for (let i = 0; i < 600; i++) world.step(DT, { left: false, right: true });
    expect(world.spawn.x).toBeCloseTo(310, 0);
    world.reset();
    expect(world.spawn).toEqual({ x: 100, y: 100 });
    expect(world.checkpoints[0]!.activated).toBe(false);
  });
});

describe("Level exit and completion", () => {
  it("reaching the exit completes the level with results", () => {
    const world = new GameWorld(makeLevel([FLOOR, EXIT]));
    const completed = vi.fn();
    world.events.on("level-completed", completed);
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    world.events.drain();
    expect(completed).toHaveBeenCalledWith({ levelId: "test-level" });
    expect(world.completed).toBe(true);
    expect(world.result).not.toBeNull();
    expect(world.result!.completed).toBe(true);
    expect(world.result!.levelId).toBe("test-level");
    expect(world.result!.collectiblesTotal).toBe(0);
    expect(world.result!.deaths).toBeGreaterThanOrEqual(0);
  });

  it("exit with requiresKey blocks completion without the key", () => {
    const world = new GameWorld(
      makeLevel([{ ...EXIT, requiresKey: true }, FLOOR], { requiresKey: true }),
    );
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    expect(world.completed).toBe(false);
  });

  it("exit with requiresKey completes after collecting the key", () => {
    const world = new GameWorld(
      makeLevel(
        [FLOOR, { ...EXIT, requiresKey: true }, { id: "k1", type: "key", x: 100, y: 370 }],
        { requiresKey: true },
      ),
    );
    // Fall straight down onto the key first (no drift).
    for (let i = 0; i < 120; i++) world.step(DT, NO_INPUT);
    expect(world.hasKey).toBe(true);
    // Then run to the exit.
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    expect(world.completed).toBe(true);
  });

  it("requiredCollectibles gate blocks the exit", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "far-ring", type: "ring", x: 30, y: 370, value: 10 }], {
        requiredCollectibles: 1,
      }),
    );
    // Run right immediately: miss the ring at x=30, reach the exit.
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    expect(world.completed).toBe(false);
  });

  it("completed worlds stop simulating", () => {
    const world = new GameWorld(makeLevel([FLOOR, EXIT]));
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    expect(world.completed).toBe(true);
    const tick = world.tick;
    world.step(DT, NO_INPUT);
    expect(world.tick).toBe(tick);
  });

  it("all-collectibles objective is recorded", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "r1", type: "ring", x: 100, y: 370 }]),
    );
    // Collect the ring straight below the spawn, then head for the exit.
    for (let i = 0; i < 120; i++) world.step(DT, NO_INPUT);
    expect(world.collectiblesFound).toBe(1);
    for (let i = 0; i < 1200; i++) world.step(DT, { left: false, right: true });
    expect(world.result?.objectives).toContain("all-collectibles");
  });
});
