import { clamp } from "./MathUtils";

/** Axis-aligned rectangle in world coordinates (spec section 10). */
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

/** Returns true when two AABBs overlap (touching edges do not count). */
export function aabbIntersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Returns true when the point lies inside the rectangle (inclusive). */
export function aabbContains(a: Rect, px: number, py: number): boolean {
  return px >= a.x && px <= a.x + a.width && py >= a.y && py <= a.y + a.height;
}

/**
 * Circle vs rect intersection using the closest-point method (spec section 10).
 * Handles corner, edge, and fully-contained cases.
 */
export function circleIntersectsRect(cx: number, cy: number, radius: number, r: Rect): boolean {
  const closestX = clamp(cx, r.x, r.x + r.width);
  const closestY = clamp(cy, r.y, r.y + r.height);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

/** Circle vs circle intersection test. */
export function circleIntersectsCircle(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const radiusSum = ar + br;
  return dx * dx + dy * dy <= radiusSum * radiusSum;
}
