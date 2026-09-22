/**
 * 2D vector with immutable-style operations (spec section 10).
 * Each operation returns a new Vector2; the source is never mutated.
 */
export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static from(x: number, y: number): Vector2 {
    return new Vector2(x, y);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  multiplyScalar(value: number): Vector2 {
    return new Vector2(this.x * value, this.y * value);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const len = this.length();
    if (len === 0) return new Vector2(0, 0);
    return new Vector2(this.x / len, this.y / len);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  equals(other: Vector2, epsilon = 1e-9): boolean {
    return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
  }
}
