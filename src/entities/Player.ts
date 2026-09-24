import { approach, clamp } from "../math/MathUtils";
import { PLAYER_DEFAULTS, type PlayerConfig } from "../config/gameplay.config";

export type PlayerState = "normal" | "bouncing" | "hurt" | "dead" | "finished";

/** Input consumed by the player simulation (never raw DOM events). */
export type PlayerInput = {
  left: boolean;
  right: boolean;
};

/**
 * The bouncing red ball (spec section 11).
 *
 * Movement integrates velocity only; collision resolution happens in the
 * CollisionSystem. Frame-rate independent by design: only called with the
 * fixed simulation delta.
 */
export class Player {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  readonly radius: number;
  state: PlayerState = "normal";
  grounded = false;
  facing: 1 | -1 = 1;
  /** Squash animation timer, 1 -> 0 after a bounce. */
  squashAnim = 0;
  /** Invulnerability window timer (seconds, 0 = vulnerable). */
  invulnerability = 0;
  coyoteTimer = 0;
  jumpBuffer = 0;
  bounceCount = 0;
  /**
   * Y of the surface the player last touched. The camera follows this
   * instead of the mid-air arc so the world does not bounce with the ball.
   */
  lastGroundY: number;

  private readonly config: PlayerConfig;

  constructor(spawnX: number, spawnY: number, config: PlayerConfig = PLAYER_DEFAULTS) {
    this.x = spawnX;
    this.y = spawnY;
    this.lastGroundY = spawnY;
    this.radius = config.radius;
    this.config = config;
  }

  /**
   * Integrate one fixed step: horizontal control + gravity (spec section 12).
   * `externalAccelX` models continuous zone forces (wind) that must not be
   * cancelled by input deceleration.
   */
  update(deltaSeconds: number, input: PlayerInput, externalAccelX = 0): void {
    if (this.state === "dead" || this.state === "finished") {
      // Dead/finished players still fall for the death animation.
      this.integrateGravity(deltaSeconds);
      this.advanceTimers(deltaSeconds);
      return;
    }

    const dir = input.left && !input.right ? -1 : input.right && !input.left ? 1 : 0;
    const windActive = externalAccelX !== 0;
    if (dir !== 0) {
      this.facing = dir as 1 | -1;
      const accel =
        this.config.horizontalAcceleration * (this.grounded ? 1 : this.config.airControl);
      this.vx = approach(this.vx, dir * this.config.maxHorizontalSpeed, accel * deltaSeconds);
    } else if (!windActive) {
      // With active wind the zone force replaces passive deceleration.
      const decel =
        this.config.horizontalDeceleration * (this.grounded ? 1 : this.config.airControl);
      this.vx = approach(this.vx, 0, decel * deltaSeconds);
    }
    if (windActive) {
      this.vx = clamp(this.vx + externalAccelX * deltaSeconds, -150, 150);
    }

    this.integrateGravity(deltaSeconds);

    // Coyote time: track time since last grounded contact.
    this.coyoteTimer = this.grounded
      ? this.config.coyoteTimeSeconds
      : Math.max(0, this.coyoteTimer - deltaSeconds);
    if (this.jumpBuffer > 0) this.jumpBuffer -= deltaSeconds;

    this.advanceTimers(deltaSeconds);
    this.state = Math.abs(this.vy) > 20 ? "bouncing" : "normal";
  }

  private integrateGravity(deltaSeconds: number): void {
    this.vy = Math.min(this.vy + this.config.gravity * deltaSeconds, this.config.terminalVelocity);
  }

  private advanceTimers(deltaSeconds: number): void {
    if (this.squashAnim > 0) {
      this.squashAnim = Math.max(0, this.squashAnim - deltaSeconds / this.config.squashDuration);
    }
    if (this.invulnerability > 0) {
      this.invulnerability = Math.max(0, this.invulnerability - deltaSeconds);
    }
  }

  /** Landing on a surface: automatic bounce (spec sections 11-12). */
  bounce(velocity: number = this.config.bounceVelocity): void {
    this.vy = velocity;
    this.grounded = true;
    this.squashAnim = 1;
    this.jumpBuffer = this.config.jumpBufferSeconds;
    this.bounceCount++;
    this.lastGroundY = this.y + this.radius;
  }

  /** Reset to a spawn point with a fresh runtime state (respawn/restart). */
  reset(spawnX: number, spawnY: number, invulnerable = false): void {
    this.x = spawnX;
    this.y = spawnY;
    this.lastGroundY = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.state = "normal";
    this.grounded = false;
    this.squashAnim = 0;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.invulnerability = invulnerable ? this.config.respawnInvulnerabilitySeconds : 0;
  }

  /** Visual squash factor: < 1 squashed, 1 round. */
  squashFactor(): number {
    return clamp(1 - 0.4 * this.squashAnim, 0.6, 1);
  }

  /** Bottom edge of the collision circle. */
  bottom(): number {
    return this.y + this.radius;
  }
}
