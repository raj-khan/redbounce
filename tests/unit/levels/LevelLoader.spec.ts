import { describe, expect, it } from "vitest";
import { LevelRegistry } from "../../../src/levels/LevelRegistry";
import { LevelLoader } from "../../../src/levels/LevelLoader";
import { level01, type LevelDefinition } from "../../../src/levels/Level";

function makeLevel(id: string): LevelDefinition {
  return {
    ...level01,
    id,
    entities: [
      { id: "floor", type: "static-platform", x: 0, y: 380, width: 800, height: 20 },
      { id: "exit", type: "level-exit", x: 700, y: 300, width: 40, height: 80 },
    ],
  };
}

describe("LevelRegistry", () => {
  it("registers and resolves levels by id in order", () => {
    const registry = new LevelRegistry();
    registry.register(makeLevel("a"));
    registry.register(makeLevel("b"));
    registry.register(makeLevel("c"));
    expect(registry.count()).toBe(3);
    expect(registry.get("b")?.id).toBe("b");
    expect(registry.at(1)?.id).toBe("b");
    expect(registry.first()?.id).toBe("a");
  });

  it("rejects duplicate level ids", () => {
    const registry = new LevelRegistry();
    registry.register(makeLevel("a"));
    expect(() => registry.register(makeLevel("a"))).toThrow(/duplicate level id/);
  });

  it("next() follows declared order", () => {
    const registry = new LevelRegistry();
    registry.register(makeLevel("a"));
    registry.register(makeLevel("b"));
    expect(registry.next("a")?.id).toBe("b");
    expect(registry.next("b")).toBeUndefined();
    expect(registry.next("zzz")).toBeUndefined();
  });
});

describe("LevelLoader", () => {
  it("loads a valid level", async () => {
    const registry = new LevelRegistry();
    registry.register(makeLevel("a"));
    const loader = new LevelLoader(registry);
    const level = await loader.load("a");
    expect(level.id).toBe("a");
  });

  it("rejects unknown levels", async () => {
    const loader = new LevelLoader(new LevelRegistry());
    await expect(loader.load("nope")).rejects.toThrow(/unknown level/);
  });

  it("rejects invalid levels with actionable errors", async () => {
    const registry = new LevelRegistry();
    const broken = makeLevel("broken");
    broken.entities = [];
    registry.register(broken);
    const loader = new LevelLoader(registry);
    await expect(loader.load("broken")).rejects.toThrow(/failed validation.*level-exit/s);
  });

  it("returns deeply frozen level data that gameplay cannot mutate", async () => {
    const registry = new LevelRegistry();
    registry.register(makeLevel("a"));
    const loader = new LevelLoader(registry);
    const level = await loader.load("a");
    expect(Object.isFrozen(level)).toBe(true);
    expect(Object.isFrozen(level.entities)).toBe(true);
    expect(Object.isFrozen(level.entities[0])).toBe(true);
    expect(() => {
      (level as { id: string }).id = "hacked";
    }).toThrow();
  });

  it("loading does not mutate the registered source", async () => {
    const registry = new LevelRegistry();
    const source = makeLevel("a");
    registry.register(source);
    const loader = new LevelLoader(registry);
    const loaded = await loader.load("a");
    expect(loaded.entities.length).toBe(2);
    expect(source.entities.length).toBe(2);
    expect(loaded).not.toBe(source);
  });
});
