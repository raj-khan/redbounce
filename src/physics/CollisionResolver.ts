import type { Rect } from "../math/Rect";
import { clamp } from "../math/MathUtils";

/** Contact normal + penetration depth for a circle/rect collision. */
export type Contact = {
  /** Unit normal pointing from the rect toward the circle center. */
  nx: number;
  ny: number;
  depth: number;
};

/**
 * Circle vs rectangle contact using the closest-point method.
 * Returns null when there is no intersection.
 */
export function circleRectContact(cx: number, cy: number, radius: number, r: Rect): Contact | null {
  const closestX = clamp(cx, r.x, r.x + r.width);
  const closestY = clamp(cy, r.y, r.y + r.height);
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq > radius * radius) return null;

  if (distSq > 1e-12) {
    const dist = Math.sqrt(distSq);
    return { nx: dx / dist, ny: dy / dist, depth: radius - dist };
  }

  // Center is inside the rect: push out along the axis of least penetration.
  const left = cx - r.x;
  const right = r.x + r.width - cx;
  const top = cy - r.y;
  const bottom = r.y + r.height - cy;
  const min = Math.min(left, right, top, bottom);
  if (min === left) return { nx: -1, ny: 0, depth: radius + left };
  if (min === right) return { nx: 1, ny: 0, depth: radius + right };
  if (min === top) return { nx: 0, ny: -1, depth: radius + top };
  return { nx: 0, ny: 1, depth: radius + bottom };
}
