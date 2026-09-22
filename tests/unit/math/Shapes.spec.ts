import { describe, expect, it } from "vitest";
import {
  aabbContains,
  aabbIntersects,
  circleIntersectsCircle,
  circleIntersectsRect,
  rect,
} from "../../../src/math/Rect";

describe("AABB intersection", () => {
  it("detects overlap", () => {
    expect(aabbIntersects(rect(0, 0, 10, 10), rect(5, 5, 10, 10))).toBe(true);
  });

  it("rejects disjoint boxes", () => {
    expect(aabbIntersects(rect(0, 0, 10, 10), rect(20, 20, 5, 5))).toBe(false);
  });

  it("touching edges do not intersect", () => {
    expect(aabbIntersects(rect(0, 0, 10, 10), rect(10, 0, 10, 10))).toBe(false);
    expect(aabbIntersects(rect(0, 0, 10, 10), rect(0, 10, 10, 10))).toBe(false);
  });

  it("contained box intersects", () => {
    expect(aabbIntersects(rect(0, 0, 10, 10), rect(2, 2, 3, 3))).toBe(true);
  });

  it("contains points inclusively", () => {
    const r = rect(0, 0, 10, 10);
    expect(aabbContains(r, 5, 5)).toBe(true);
    expect(aabbContains(r, 0, 0)).toBe(true);
    expect(aabbContains(r, 10, 10)).toBe(true);
    expect(aabbContains(r, 11, 5)).toBe(false);
  });
});

describe("circle vs rect", () => {
  const r = rect(0, 0, 20, 20);

  it("center inside rect intersects", () => {
    expect(circleIntersectsRect(10, 10, 2, r)).toBe(true);
  });

  it("circle overlapping edge intersects", () => {
    expect(circleIntersectsRect(21, 10, 2, r)).toBe(true);
    expect(circleIntersectsRect(10, 22, 3, r)).toBe(true);
  });

  it("circle past edge does not intersect", () => {
    expect(circleIntersectsRect(23.01, 10, 2, r)).toBe(false);
  });

  it("corner case: diagonal approach", () => {
    // Corner at (20, 20); distance from (22, 22) is sqrt(8) ~ 2.83
    expect(circleIntersectsRect(22, 22, 2.9, r)).toBe(true);
    expect(circleIntersectsRect(22, 22, 2.7, r)).toBe(false);
  });
});

describe("circle vs circle", () => {
  it("intersects when overlapping", () => {
    expect(circleIntersectsCircle(0, 0, 5, 8, 0, 5)).toBe(true);
  });

  it("does not intersect when apart", () => {
    expect(circleIntersectsCircle(0, 0, 5, 10.01, 0, 5)).toBe(false);
  });

  it("touching counts as intersecting", () => {
    expect(circleIntersectsCircle(0, 0, 5, 10, 0, 5)).toBe(true);
  });
});
