import { describe, expect, it, vi } from "vitest";
import type { GameScene } from "../../../src/core/Scene";
import { SceneManager } from "../../../src/core/SceneManager";

function makeScene(name: string): GameScene & { enterSpy: () => void; exitSpy: () => void } {
  const enterSpy = vi.fn();
  const exitSpy = vi.fn();
  return {
    enterSpy,
    exitSpy,
    enter: enterSpy,
    update: vi.fn(),
    render: vi.fn(),
    exit: exitSpy,
    name,
  } as unknown as GameScene & { enterSpy: () => void; exitSpy: () => void };
}

describe("SceneManager", () => {
  it("registers and switches scenes", async () => {
    const manager = new SceneManager();
    const menu = makeScene("menu");
    const game = makeScene("game");
    manager.register("menu", () => menu);
    manager.register("game", () => game);

    await manager.switchTo("menu");
    expect(manager.currentName()).toBe("menu");
    expect(menu.enterSpy).toHaveBeenCalledTimes(1);

    await manager.switchTo("game");
    expect(menu.exitSpy).toHaveBeenCalledTimes(1);
    expect(game.enterSpy).toHaveBeenCalledTimes(1);
    expect(manager.currentName()).toBe("game");
  });

  it("throws for unknown scenes", async () => {
    const manager = new SceneManager();
    await expect(manager.switchTo("nope")).rejects.toThrow(/unknown scene/);
  });

  it("forwards update and render to the active scene", async () => {
    const manager = new SceneManager();
    const scene = makeScene("a");
    manager.register("a", () => scene);
    await manager.switchTo("a");
    manager.update(1 / 60);
    manager.render(0.5);
    expect(scene.update).toHaveBeenCalledWith(1 / 60);
    expect(scene.render).toHaveBeenCalledWith(0.5);
  });

  it("update and render are safe without an active scene", () => {
    const manager = new SceneManager();
    expect(() => manager.update(1 / 60)).not.toThrow();
    expect(() => manager.render(0)).not.toThrow();
  });
});
