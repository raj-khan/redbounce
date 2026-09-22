/** Gameplay tuning (spec section 11). Initial values, not final balance. */
export const PLAYER_DEFAULTS = {
  radius: 7,
  maxHorizontalSpeed: 90,
  horizontalAcceleration: 480,
  horizontalDeceleration: 600,
  gravity: 520,
  terminalVelocity: 260,
  bounceVelocity: -190,
  airControl: 0.8,
  coyoteTimeSeconds: 0.08,
  jumpBufferSeconds: 0.1,
  /** Squash animation duration on bounce (seconds). */
  squashDuration: 0.18,
  /** Extra invulnerability after respawn (seconds). */
  respawnInvulnerabilitySeconds: 1.2,
} as const;

export type PlayerConfig = typeof PLAYER_DEFAULTS;
