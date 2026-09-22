import { describe, expect, it } from "vitest";
import {
  computeBackingSize,
  computeCanvasSize,
  LOGICAL_ASPECT,
} from "../../../src/rendering/ViewportScaling";

describe("ViewportScaling", () => {
  it("preserves 16:9 for a wide container", () => {
    const size = computeCanvasSize(1920, 1080);
    expect(size.cssWidth / size.cssHeight).toBeCloseTo(LOGICAL_ASPECT, 5);
  });

  it("letterboxes a narrow container by height", () => {
    // Tall portrait container: width-limited.
    const size = computeCanvasSize(400, 900);
    expect(size.cssWidth).toBe(400);
    expect(size.cssHeight).toBeCloseTo(400 / LOGICAL_ASPECT, 5);
    expect(size.cssWidth / size.cssHeight).toBeCloseTo(LOGICAL_ASPECT, 4);
  });

  it("width-limited when container is very wide", () => {
    const size = computeCanvasSize(1000, 200);
    expect(size.cssHeight).toBe(200);
    expect(size.cssWidth).toBeCloseTo(200 * LOGICAL_ASPECT, 5);
  });

  it("never stretches independently on x and y", () => {
    const cases: [number, number][] = [
      [800, 600],
      [320, 180],
      [100, 100],
      [2560, 1440],
    ];
    for (const [w, h] of cases) {
      const size = computeCanvasSize(w, h);
      expect(size.cssWidth / size.cssHeight).toBeCloseTo(LOGICAL_ASPECT, 3);
    }
  });

  it("backing store scales with devicePixelRatio (capped at 3)", () => {
    expect(computeBackingSize(320, 1)).toEqual({ cssWidth: 320, cssHeight: 180 });
    expect(computeBackingSize(320, 2).cssWidth).toBe(640);
    expect(computeBackingSize(320, 4).cssWidth).toBe(960); // capped
  });
});
