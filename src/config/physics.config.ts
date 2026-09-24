/** Physics tuning (spec sections 11-12). All units: world px, seconds. */
export const PHYSICS_CONFIG = {
  /** Simulation rate. */
  fixedDeltaSeconds: 1 / 60,
  /** Gravity pulls the player down (y grows downward). */
  gravity: 700,
  /** Maximum falling speed. */
  terminalVelocity: 320,
} as const;
