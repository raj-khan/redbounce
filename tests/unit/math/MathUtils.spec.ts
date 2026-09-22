import { describe, expect, it } from "vitest";
import {
  approach,
  clamp,
  degToRad,
  lerp,
  nearlyEqual,
  radToDeg,
  randomRange,
  sign,
} from "../../../src/math/MathUtils";

describe("MathUtils", () => {
  it("clamps", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("lerps", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 0, 0.25)).toBe(7.5);
    expect(lerp(2, 2, 0.9)).toBe(2);
  });

  it("approaches target without overshooting", () => {
    expect(approach(0, 10, 3)).toBe(3);
    expect(approach(9, 10, 3)).toBe(10);
    expect(approach(10, 0, 3)).toBe(7);
    expect(approach(1, 1, 3)).toBe(1);
  });

  it("signs", () => {
    expect(sign(3)).toBe(1);
    expect(sign(-3)).toBe(-1);
    expect(sign(0)).toBe(0);
  });

  it("nearly equals with epsilon", () => {
    expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(nearlyEqual(1, 2)).toBe(false);
    expect(nearlyEqual(1, 1.05, 0.1)).toBe(true);
  });

  it("random range stays in bounds", () => {
    for (let i = 0; i < 100; i++) {
      const v = randomRange(-2, 5);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(5);
    }
  });

  it("converts angles", () => {
    expect(degToRad(180)).closeTo(Math.PI, 1e-9);
    expect(radToDeg(Math.PI)).closeTo(180, 1e-9);
    expect(degToRad(radToDeg(1.234))).closeTo(1.234, 1e-9);
  });
});
