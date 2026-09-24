/** Gameplay tuning (spec section 11: initial values, retuned for feel). */
export const PLAYER_DEFAULTS = {
  radius: 7,
  maxHorizontalSpeed: 120,
  horizontalAcceleration: 620,
  horizontalDeceleration: 800,
  gravity: 700,
  terminalVelocity: 320,
  /** Bounce height = v^2 / 2g = 340^2 / 1400 = ~83px (~46% of viewport). */
  bounceVelocity: -340,
  airControl: 0.85,
  coyoteTimeSeconds: 0.08,
  jumpBufferSeconds: 0.1,
  /** Squash animation duration on bounce (seconds). */
  squashDuration: 0.18,
  /** Extra invulnerability after respawn (seconds). */
  respawnInvulnerabilitySeconds: 1.2,
} as const;

export type PlayerConfig = typeof PLAYER_DEFAULTS;
