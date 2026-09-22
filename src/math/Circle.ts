/** Circle shape in world coordinates (spec section 10). */
export type Circle = {
  x: number;
  y: number;
  radius: number;
};

export function circle(x: number, y: number, radius: number): Circle {
  return { x, y, radius };
}
