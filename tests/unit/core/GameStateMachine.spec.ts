import { describe, expect, it, vi } from "vitest";
import { GameStateMachine } from "../../../src/core/GameStateMachine";

describe("GameStateMachine", () => {
  it("starts in booting", () => {
    expect(new GameStateMachine().current()).toBe("booting");
  });

  it("follows the boot lifecycle", () => {
    const sm = new GameStateMachine();
    expect(sm.transition("loading")).toBe(true);
    expect(sm.transition("main-menu")).toBe(true);
    expect(sm.transition("playing")).toBe(true);
  });

  it("playing can pause and resume", () => {
    const sm = new GameStateMachine("playing");
    expect(sm.transition("paused")).toBe(true);
    expect(sm.transition("playing")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const sm = new GameStateMachine("booting");
    expect(sm.transition("playing")).toBe(false);
    expect(sm.current()).toBe("booting");
  });

  it("rejects self transitions", () => {
    const sm = new GameStateMachine("playing");
    expect(sm.transition("playing")).toBe(false);
  });

  it("level-complete can lead to game-complete", () => {
    const sm = new GameStateMachine("level-complete");
    expect(sm.transition("game-complete")).toBe(true);
  });

  it("notifies listeners with from and to", () => {
    const sm = new GameStateMachine("playing");
    const listener = vi.fn();
    sm.onChange(listener);
    sm.transition("paused");
    expect(listener).toHaveBeenCalledWith("playing", "paused");
  });

  it("disposer removes listener", () => {
    const sm = new GameStateMachine("playing");
    const listener = vi.fn();
    const off = sm.onChange(listener);
    off();
    sm.transition("paused");
    expect(listener).not.toHaveBeenCalled();
  });

  it("tracks previous state", () => {
    const sm = new GameStateMachine("playing");
    sm.transition("paused");
    expect(sm.previousState()).toBe("playing");
  });
});
