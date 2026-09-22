import { clamp, lerp } from "../math/MathUtils";
import { CAMERA_CONFIG } from "../config/rendering.config";

export type CameraBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type CameraConfigOverrides = Partial<{
  followSpeed: number;
  lookAheadDistance: number;
  deadZoneWidth: number;
  deadZoneHeight: number;
}>;

/**
 * Camera with follow, look-ahead, dead zone, and bounds clamping
 * (spec section 19). Camera calculations never modify world positions;
 * shake is stored and applied only at render time.
 */
export class Camera {
  /** Top-left of the visible world rectangle. */
  x = 0;
  y = 0;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  private targetX = 0;
  private targetY = 0;
  private bounds: CameraBounds | null = null;
  private shakeTime = 0;
  private shakeDuration = 0;
  private shakeMagnitude = 0;
  private readonly config: Required<CameraConfigOverrides>;

  constructor(
    viewportWidth: number,
    viewportHeight: number,
    overrides: CameraConfigOverrides = {},
  ) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.config = { ...CAMERA_CONFIG, ...overrides };
  }

  setBounds(bounds: CameraBounds): void {
    this.bounds = bounds;
    this.clampToBounds();
  }

  /** Instantly center on a world position (level start / respawn). */
  snapTo(worldX: number, worldY: number): void {
    this.targetX = worldX - this.viewportWidth / 2;
    this.targetY = worldY - this.viewportHeight / 2;
    this.x = this.targetX;
    this.y = this.targetY;
    this.clampToBounds();
  }

  /** Track a target with dead zone, look-ahead, and smooth follow. */
  follow(targetX: number, targetY: number, velocityX: number, deltaSeconds: number): void {
    const lookAhead =
      Math.sign(velocityX) * Math.min(Math.abs(velocityX) / 90, 1) * this.config.lookAheadDistance;
    const desiredX = targetX + lookAhead - this.viewportWidth / 2;
    const desiredY = targetY - this.viewportHeight / 2;

    // Dead zone: only move when the target leaves the centered band.
    const centerX = this.x + this.viewportWidth / 2;
    const deadHalfW = this.config.deadZoneWidth / 2;
    if (targetX < centerX - deadHalfW || targetX > centerX + deadHalfW) {
      this.targetX = desiredX;
    }
    const centerY = this.y + this.viewportHeight / 2;
    const deadHalfH = this.config.deadZoneHeight / 2;
    if (targetY < centerY - deadHalfH || targetY > centerY + deadHalfH) {
      this.targetY = desiredY;
    }

    const t = 1 - Math.exp(-this.config.followSpeed * deltaSeconds);
    this.x = lerp(this.x, this.targetX, t);
    this.y = lerp(this.y, this.targetY, t);
    this.clampToBounds();
  }

  /** Trigger a render-only shake. */
  shake(durationSeconds: number, magnitudePixels = CAMERA_CONFIG.maxShakePixels): void {
    if (!CAMERA_CONFIG.shakeEnabled) return;
    this.shakeTime = durationSeconds;
    this.shakeDuration = durationSeconds;
    this.shakeMagnitude = magnitudePixels;
  }

  /** Current shake offset; call only while rendering. */
  shakeOffset(): { x: number; y: number } {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    const falloff = this.shakeTime / this.shakeDuration;
    const m = this.shakeMagnitude * falloff;
    return {
      x: (Math.random() * 2 - 1) * m,
      y: (Math.random() * 2 - 1) * m,
    };
  }

  isShaking(): boolean {
    return this.shakeTime > 0;
  }

  /** Advance shake timers (called from the fixed update, not render). */
  update(deltaSeconds: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - deltaSeconds);
    }
  }

  /** World -> canvas (logical viewport) coordinates. */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return { x: worldX - this.x, y: worldY - this.y };
  }

  /** Canvas -> world coordinates (inverse transform). */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return { x: screenX + this.x, y: screenY + this.y };
  }

  visibleRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.x, y: this.y, width: this.viewportWidth, height: this.viewportHeight };
  }

  private clampToBounds(): void {
    if (!this.bounds) return;
    this.x = clamp(
      this.x,
      this.bounds.minX,
      Math.max(this.bounds.minX, this.bounds.maxX - this.viewportWidth),
    );
    this.y = clamp(
      this.y,
      this.bounds.minY,
      Math.max(this.bounds.minY, this.bounds.maxY - this.viewportHeight),
    );
    this.targetX = clamp(
      this.targetX,
      this.bounds.minX,
      Math.max(this.bounds.minX, this.bounds.maxX - this.viewportWidth),
    );
    this.targetY = clamp(
      this.targetY,
      this.bounds.minY,
      Math.max(this.bounds.minY, this.bounds.maxY - this.viewportHeight),
    );
  }
}
