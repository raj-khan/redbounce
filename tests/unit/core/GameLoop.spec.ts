import { describe, expect, it, vi } from "vitest";
import { GameLoop } from "../../../src/core/GameLoop";

/**
 * Deterministic loop harness: frames are pumped manually, time is fake.
 * No real timers, no microtask recursion.
 */
function makeHarness(frameMs: number) {
  let time = 0;
  let callback: (() => void) | null = null;
  const update = vi.fn();
  const render = vi.fn();
  const loop = new GameLoop({
    update,
    render,
    now: () => time,
    scheduleFrame: (cb) => {
      callback = cb;
    },
    pauseWhenHidden: false,
  });
  loop.start();
  return {
    loop,
    update,
    render,
    pump(frames = 1): void {
      for (let i = 0; i < frames; i++) {
        time += frameMs;
        callback?.();
      }
    },
  };
}

describe("GameLoop", () => {
  it("runs exactly one fixed update per 60 Hz frame (allowing FP drift)", () => {
    const h = makeHarness(1000 / 60);
    h.pump(10);
    // Floating point rounding may defer the last step to the next frame.
    expect(h.update.mock.calls.length).toBeGreaterThanOrEqual(9);
    expect(h.update.mock.calls.length).toBeLessThanOrEqual(10);
    expect(h.render.mock.calls.length).toBe(10);
    h.loop.stop();
  });

  it("always passes the fixed delta to update", () => {
    const h = makeHarness(1000 / 60);
    h.pump(5);
    for (const call of h.update.mock.calls) {
      expect(call[0]).toBe(1 / 60);
    }
    h.loop.stop();
  });

  it("runs multiple catch-up updates for slow frames", () => {
    const h = makeHarness(100); // 10 fps frame -> ~6 fixed steps
    h.pump(1);
    expect(h.update.mock.calls.length).toBe(6);
    h.loop.stop();
  });

  it("clamps huge frame gaps (spiral of death)", () => {
    const h = makeHarness(60_000); // 1 minute frame
    h.pump(1);
    // 0.25s max / (1/60) = 15 updates.
    expect(h.update.mock.calls.length).toBe(15);
    h.loop.stop();
  });

  it("passes interpolation alpha in [0, 1) to render", () => {
    const h = makeHarness(20); // 50 fps: 20ms = 1 update + 3.33ms remainder
    h.pump(1);
    expect(h.update.mock.calls.length).toBe(1);
    const alpha = h.render.mock.calls[0]?.[0] as number;
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
    h.loop.stop();
  });

  it("pause stops updates and renders; resume continues", () => {
    const h = makeHarness(1000 / 60);
    h.pump(3);
    const updatesBefore = h.update.mock.calls.length;
    const rendersBefore = h.render.mock.calls.length;
    h.loop.pause();
    h.pump(3);
    expect(h.update.mock.calls.length).toBe(updatesBefore);
    expect(h.render.mock.calls.length).toBe(rendersBefore);
    h.loop.resume();
    h.pump(3);
    expect(h.update.mock.calls.length).toBeGreaterThan(updatesBefore);
    h.loop.stop();
  });

  it("stop halts the loop entirely", () => {
    const h = makeHarness(1000 / 60);
    h.pump(2);
    const before = h.update.mock.calls.length;
    h.loop.stop();
    h.pump(3);
    expect(h.update.mock.calls.length).toBe(before);
  });

  it("invokes onPause / onResume callbacks", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    let callback: (() => void) | null = null;
    const loop = new GameLoop({
      update: () => {},
      render: () => {},
      now: () => 0,
      scheduleFrame: (cb) => {
        callback = cb;
      },
      pauseWhenHidden: false,
      onPause,
      onResume,
    });
    loop.start();
    loop.pause();
    expect(onPause).toHaveBeenCalledTimes(1);
    loop.resume();
    expect(onResume).toHaveBeenCalledTimes(1);
    loop.stop();
    void callback;
  });
});
