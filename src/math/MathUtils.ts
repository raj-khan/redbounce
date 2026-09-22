/** Scalar math helpers (spec section 10). */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Move current toward target by at most delta. */
export function approach(current: number, target: number, delta: number): number {
  if (current < target) return Math.min(current + delta, target);
  if (current > target) return Math.max(current - delta, target);
  return current;
}

export function sign(value: number): number {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

export function nearlyEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) <= epsilon;
}

/** Deterministic-friendly random in [min, max). Uses Math.random by default. */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export { aabbIntersects, circleIntersectsRect, circleIntersectsCircle } from "./Rect";
