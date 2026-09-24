import { describe, expect, it, vi } from "vitest";
import { GameWorld } from "../../../src/systems/GameWorld";
import type { EntityDefinition, LevelDefinition } from "../../../src/levels/Level";

const DT = 1 / 60;
const NO_INPUT = { left: false, right: false };

function makeLevel(entities: EntityDefinition[]): LevelDefinition {
  return {
    id: "test-level",
    name: "Test",
    world: "meadow",
    width: 800,
    height: 400,
    spawn: { x: 100, y: 100 },
    camera: { minX: 0, maxX: 800, minY: 0, maxY: 400 },
    entities,
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

describe("Event delivery (regression: queued events were never drained)", () => {
  it("events are delivered synchronously during step, no manual drain needed", () => {
    const world = new GameWorld(makeLevel([FLOOR, EXIT]));
    const bounced = vi.fn();
    world.events.on("player-bounced", bounced);
    // Falls onto the floor within ~1s; the bounce event must be delivered
    // by the step itself, without an explicit drain() call.
    for (let i = 0; i < 120; i++) {
      world.step(DT, NO_INPUT);
      if (bounced.mock.calls.length > 0) break;
    }
    expect(bounced.mock.calls.length).toBeGreaterThan(0);
  });

  it("level-completed is delivered in the completing step", () => {
    const world = new GameWorld(makeLevel([FLOOR, EXIT]));
    const completed = vi.fn();
    world.events.on("level-completed", completed);
    let deliveredAtTick = -1;
    world.events.on("level-completed", () => {
      deliveredAtTick = world.tick;
    });
    for (let i = 0; i < 1200 && !completed.mock.calls.length; i++) {
      world.step(DT, { left: false, right: true });
    }
    // The app's completion flow (save, unlock, auto-advance) depends on
    // this firing without any external drain.
    expect(completed).toHaveBeenCalledWith({ levelId: "test-level" });
    expect(deliveredAtTick).toBeGreaterThan(0);
  });

  it("player-died is delivered in the death step", () => {
    const world = new GameWorld(
      makeLevel([FLOOR, EXIT, { id: "sp1", type: "spikes", x: 94, y: 368, width: 12, height: 12 }]),
    );
    const died = vi.fn();
    world.events.on("player-died", died);
    for (let i = 0; i < 480 && died.mock.calls.length === 0; i++) {
      world.step(DT, NO_INPUT);
    }
    expect(died).toHaveBeenCalled();
  });
});
