/** Rendering configuration (spec sections 9 and 20). */

/** Logical viewport: world units are independent of screen resolution. */
export const VIEWPORT = {
  width: 320,
  height: 180,
} as const;

/** Render layer order, back to front (spec section 20). */
export const RENDER_LAYERS = [
  "sky",
  "far-background",
  "parallax",
  "level-background",
  "platforms",
  "hazards-enemies",
  "collectibles",
  "player",
  "particles",
  "hud",
  "debug",
] as const;

export type RenderLayer = (typeof RENDER_LAYERS)[number];

/** Original RedBounce palette (no copied assets). */
export const PALETTE = {
  sky: ["#3fbac2", "#1a1c2c"],
  farHills: "#2e5d6b",
  nearHills: "#22414d",
  ground: "#2c9440",
  groundEdge: "#6ee06e",
  stone: "#5a5f73",
  stoneEdge: "#8b90a7",
  ice: "#a8e6f0",
  metal: "#6b7280",
  metalEdge: "#9aa1ad",
  wood: "#8a5a2b",
  woodEdge: "#b07b45",
  player: "#b13e53",
  playerEdge: "#ef7d57",
  playerShine: "#ff9e80",
  ring: "#ffd23f",
  ringEdge: "#b8860b",
  star: "#fff3b0",
  key: "#d9b62e",
  heart: "#e35b7c",
  spike: "#c7cbd6",
  lava: "#e5533d",
  lavaEdge: "#8a2f1f",
  saw: "#aab0bd",
  laser: "#ff4d6d",
  checkpointOff: "#7a8a99",
  checkpointOn: "#4fd66d",
  exit: "#5bc0eb",
  hud: "#f4f4f4",
  debug: "#00ffcc",
} as const;

/** Camera defaults (spec section 19). */
export const CAMERA_CONFIG = {
  followSpeed: 8,
  lookAheadDistance: 28,
  deadZoneWidth: 48,
  deadZoneHeight: 32,
  shakeEnabled: true,
  maxShakePixels: 4,
} as const;
