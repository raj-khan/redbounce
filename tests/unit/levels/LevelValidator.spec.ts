import { describe, expect, it } from "vitest";
import { validateLevel } from "../../../src/levels/LevelValidator";
import { level01, type LevelDefinition } from "../../../src/levels/Level";

function validLevel(): LevelDefinition {
  return {
    id: "test",
    name: "Test",
    world: "meadow",
    width: 800,
    height: 400,
    spawn: { x: 50, y: 50 },
    camera: { minX: 0, maxX: 800, minY: 0, maxY: 400 },
    entities: [
      { id: "floor", type: "static-platform", x: 0, y: 380, width: 800, height: 20 },
      { id: "exit", type: "level-exit", x: 700, y: 300, width: 40, height: 80 },
    ],
  };
}

describe("LevelValidator", () => {
  it("accepts a valid level", () => {
    expect(validateLevel(validLevel())).toEqual([]);
  });

  it("accepts the shipped level-01", () => {
    expect(validateLevel(level01)).toEqual([]);
  });

  it("rejects non-objects early", () => {
    expect(validateLevel(null)).toEqual(["level must be an object"]);
    expect(validateLevel(42)).toEqual(["level must be an object"]);
  });

  it("requires id, name, world, dimensions", () => {
    const errors = validateLevel({});
    expect(errors.some((e) => e.includes("id"))).toBe(true);
    expect(errors.some((e) => e.includes("name"))).toBe(true);
    expect(errors.some((e) => e.includes("world"))).toBe(true);
    expect(errors.some((e) => e.includes("width"))).toBe(true);
    expect(errors.some((e) => e.includes("height"))).toBe(true);
  });

  it("rejects spawn outside bounds", () => {
    const level = validLevel();
    level.spawn = { x: 900, y: 50 };
    expect(validateLevel(level).some((e) => e.includes("outside level bounds"))).toBe(true);
  });

  it("rejects spawn inside a solid platform", () => {
    const level = validLevel();
    level.spawn = { x: 400, y: 390 };
    expect(validateLevel(level).some((e) => e.includes("overlaps solid"))).toBe(true);
  });

  it("rejects unknown entity types", () => {
    const level = validLevel();
    (level.entities as unknown[]).push({ id: "x", type: "teleporter", x: 0, y: 0 });
    expect(validateLevel(level).some((e) => e.includes("unknown entity type"))).toBe(true);
  });

  it("rejects duplicate entity ids", () => {
    const level = validLevel();
    level.entities.push({ id: "exit", type: "ring", x: 10, y: 10 });
    expect(validateLevel(level).some((e) => e.includes("duplicate entity id"))).toBe(true);
  });

  it("requires at least one exit", () => {
    const level = validLevel();
    level.entities = [level.entities[0]!]; // floor only
    expect(validateLevel(level).some((e) => e.includes("at least one level-exit"))).toBe(true);
  });

  it("rejects impossible requiredCollectibles", () => {
    const level = validLevel();
    level.requiredCollectibles = 5;
    level.entities.push({ id: "r1", type: "ring", x: 10, y: 10 });
    expect(validateLevel(level).some((e) => e.includes("exceeds collectible count"))).toBe(true);
  });

  it("rejects requiresKey without a key entity", () => {
    const level = validLevel();
    level.requiresKey = true;
    expect(validateLevel(level).some((e) => e.includes("contains no key"))).toBe(true);
  });

  it("validates point-based entities (ring, key)", () => {
    const level = validLevel();
    level.entities.push({ id: "bad-ring", type: "ring", x: "left" as unknown as number, y: 10 });
    expect(validateLevel(level).some((e) => e.includes("bad-ring"))).toBe(true);
  });

  it("validates moving platforms need start and end", () => {
    const level = validLevel();
    level.entities.push({
      id: "mp1",
      type: "moving-platform",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      width: 40,
      height: 8,
      durationSeconds: 2,
    });
    expect(validateLevel(level)).toEqual([]);
    const bad = validLevel();
    bad.entities.push({
      id: "mp2",
      type: "moving-platform",
      width: 40,
      height: 8,
      durationSeconds: 2,
    } as never);
    expect(validateLevel(bad).some((e) => e.includes("mp2"))).toBe(true);
  });

  it("flags entities far outside the level", () => {
    const level = validLevel();
    level.entities.push({ id: "far", type: "spikes", x: 5000, y: 0, width: 16, height: 16 });
    expect(validateLevel(level).some((e) => e.includes("outside the level"))).toBe(true);
  });
});
