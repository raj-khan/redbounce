import { describe, expect, it } from "vitest";
import { Vector2 } from "../../../src/math/Vector2";

describe("Vector2", () => {
  it("creates zero vector", () => {
    const v = Vector2.zero();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it("adds and subtracts", () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    expect(a.add(b)).toEqual(new Vector2(4, 6));
    expect(a.subtract(b)).toEqual(new Vector2(-2, -2));
  });

  it("scales", () => {
    expect(new Vector2(2, -3).multiplyScalar(3)).toEqual(new Vector2(6, -9));
  });

  it("computes length and lengthSquared", () => {
    const v = new Vector2(3, 4);
    expect(v.length()).toBe(5);
    expect(v.lengthSquared()).toBe(25);
  });

  it("normalizes", () => {
    const n = new Vector2(3, 4).normalize();
    expect(n.x).closeTo(0.6, 1e-9);
    expect(n.y).closeTo(0.8, 1e-9);
    expect(n.length()).closeTo(1, 1e-9);
  });

  it("zero vector normalizes to zero", () => {
    expect(Vector2.zero().normalize()).toEqual(new Vector2(0, 0));
  });

  it("computes dot product", () => {
    expect(new Vector2(1, 2).dot(new Vector2(3, 4))).toBe(11);
    expect(new Vector2(1, 0).dot(new Vector2(0, 1))).toBe(0);
  });

  it("operations never mutate the source", () => {
    const v = new Vector2(1, 1);
    v.add(new Vector2(2, 2));
    v.subtract(new Vector2(2, 2));
    v.multiplyScalar(5);
    v.normalize();
    expect(v).toEqual(new Vector2(1, 1));
  });

  it("clones independently", () => {
    const v = new Vector2(5, 6);
    const c = v.clone();
    expect(c).not.toBe(v);
    expect(c).toEqual(v);
  });
});
