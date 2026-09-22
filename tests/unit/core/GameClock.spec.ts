import { describe, expect, it } from "vitest";
import { GameClock } from "../../../src/core/GameClock";

describe("GameClock", () => {
  it("returns elapsed seconds between ticks", () => {
    let t = 0;
    const clock = new GameClock(() => t);
    clock.start();
    t = 16.7;
    expect(clock.tick()).toBeCloseTo(0.0167, 6);
  });

  it("clamps large frame gaps", () => {
    let t = 0;
    const clock = new GameClock(() => t);
    clock.start();
    t = 10_000; // 10 seconds later (tab switch)
    expect(clock.tick()).toBe(0.25);
  });

  it("returns zero delta while paused", () => {
    let t = 0;
    const clock = new GameClock(() => t);
    clock.start();
    clock.pause();
    t = 500;
    expect(clock.tick()).toBe(0);
    expect(clock.isRunning()).toBe(false);
  });

  it("resume resets the time base (no huge delta)", () => {
    let t = 0;
    const clock = new GameClock(() => t);
    clock.start();
    clock.pause();
    t = 5_000;
    clock.resume();
    t = 5_016;
    expect(clock.tick()).toBeCloseTo(0.016, 6);
  });

  it("never returns negative delta", () => {
    let t = 100;
    const clock = new GameClock(() => t);
    clock.start();
    t = 50; // time went backwards
    expect(clock.tick()).toBe(0);
  });
});
