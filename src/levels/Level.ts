import type { Rect } from "../math/Rect";

/**
 * Data-driven level format (spec section 24).
 * Gameplay systems never mutate these definitions (spec section 38).
 */
export type PlatformMaterial = "grass" | "stone" | "ice" | "metal" | "wood";

export type Vec2Def = { x: number; y: number };

export type CameraBoundsDef = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

// ---------------------------------------------------------------------------
// Entity definitions (spec sections 13-18)
// ---------------------------------------------------------------------------

export type StaticPlatformDef = {
  id: string;
  type: "static-platform";
  x: number;
  y: number;
  width: number;
  height: number;
  material?: PlatformMaterial;
};

export type OneWayPlatformDef = {
  id: string;
  type: "one-way-platform";
  x: number;
  y: number;
  width: number;
  height: number;
  material?: PlatformMaterial;
};

export type MovingPlatformDef = {
  id: string;
  type: "moving-platform";
  start: Vec2Def;
  end: Vec2Def;
  durationSeconds: number;
  easing?: "linear" | "smooth";
  width: number;
  height: number;
  material?: PlatformMaterial;
};

export type BouncePadDef = {
  id: string;
  type: "bounce-pad";
  x: number;
  y: number;
  width: number;
  height: number;
  velocity?: number;
};

export type BreakablePlatformDef = {
  id: string;
  type: "breakable-platform";
  x: number;
  y: number;
  width: number;
  height: number;
  breakDelaySeconds?: number;
  respawnDelaySeconds?: number;
};

export type RingDef = {
  id: string;
  type: "ring";
  x: number;
  y: number;
  value?: number;
};

export type StarDef = {
  id: string;
  type: "star";
  x: number;
  y: number;
  value?: number;
};

export type KeyDef = {
  id: string;
  type: "key";
  x: number;
  y: number;
};

export type HeartDef = {
  id: string;
  type: "heart";
  x: number;
  y: number;
  value?: number;
};

export type SpikesDef = {
  id: string;
  type: "spikes";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LavaDef = {
  id: string;
  type: "lava";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SawDef = {
  id: string;
  type: "saw";
  x: number;
  y: number;
  radius: number;
  speed?: number;
};

export type LaserDef = {
  id: string;
  type: "laser";
  x: number;
  y: number;
  width: number;
  height: number;
  onSeconds?: number;
  offSeconds?: number;
  startOffsetSeconds?: number;
};

export type FallingRockDef = {
  id: string;
  type: "falling-rock";
  x: number;
  y: number;
  radius: number;
  triggerDistance?: number;
};

export type PatrollerDef = {
  id: string;
  type: "patroller";
  start: Vec2Def;
  end: Vec2Def;
  speed?: number;
  radius?: number;
};

export type ChaserDef = {
  id: string;
  type: "chaser";
  x: number;
  y: number;
  radius?: number;
  speed?: number;
  aggroRadius?: number;
};

export type OrbitalDef = {
  id: string;
  type: "orbital";
  center: Vec2Def;
  orbitRadius: number;
  radius?: number;
  angularSpeed?: number;
};

export type CheckpointDef = {
  id: string;
  type: "checkpoint";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LevelExitDef = {
  id: string;
  type: "level-exit";
  x: number;
  y: number;
  width: number;
  height: number;
  requiresKey?: boolean;
};

export type WindZoneDef = {
  id: string;
  type: "wind-zone";
  x: number;
  y: number;
  width: number;
  height: number;
  forceX?: number;
};

export type EntityDefinition =
  | StaticPlatformDef
  | OneWayPlatformDef
  | MovingPlatformDef
  | BouncePadDef
  | BreakablePlatformDef
  | RingDef
  | StarDef
  | KeyDef
  | HeartDef
  | SpikesDef
  | LavaDef
  | SawDef
  | LaserDef
  | FallingRockDef
  | PatrollerDef
  | ChaserDef
  | OrbitalDef
  | CheckpointDef
  | LevelExitDef
  | WindZoneDef;

export type EntityTypeName = EntityDefinition["type"];

export const ENTITY_TYPES: readonly EntityTypeName[] = [
  "static-platform",
  "one-way-platform",
  "moving-platform",
  "bounce-pad",
  "breakable-platform",
  "ring",
  "star",
  "key",
  "heart",
  "spikes",
  "lava",
  "saw",
  "laser",
  "falling-rock",
  "patroller",
  "chaser",
  "orbital",
  "checkpoint",
  "level-exit",
  "wind-zone",
];

export const COLLECTIBLE_TYPES: readonly EntityTypeName[] = ["ring", "star", "key", "heart"];

export type LevelDefinition = {
  id: string;
  name: string;
  world: string;
  width: number;
  height: number;
  spawn: Vec2Def;
  camera: CameraBoundsDef;
  requiredCollectibles?: number;
  requiresKey?: boolean;
  entities: EntityDefinition[];
};

// ---------------------------------------------------------------------------
// Runtime helpers
// ---------------------------------------------------------------------------

/** Solid rectangle view of a platform for physics. */
export type PlatformRuntime = {
  id: string;
  rect: Rect;
  material: PlatformMaterial;
  oneWay: boolean;
};

export function isPlatformEntity(
  entity: EntityDefinition,
): entity is
  StaticPlatformDef | OneWayPlatformDef | MovingPlatformDef | BouncePadDef | BreakablePlatformDef {
  return (
    entity.type === "static-platform" ||
    entity.type === "one-way-platform" ||
    entity.type === "moving-platform" ||
    entity.type === "bounce-pad" ||
    entity.type === "breakable-platform"
  );
}

export function toRuntimePlatforms(level: LevelDefinition): PlatformRuntime[] {
  const platforms: PlatformRuntime[] = [];
  for (const entity of level.entities) {
    if (entity.type === "static-platform" || entity.type === "one-way-platform") {
      platforms.push({
        id: entity.id,
        rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
        material: entity.material ?? "grass",
        oneWay: entity.type === "one-way-platform",
      });
    }
  }
  return platforms;
}

/** The first test level (Phase 1). Content levels land in Phase 4. */
export const level01: LevelDefinition = {
  id: "level-01",
  name: "Green Valley",
  world: "meadow",
  width: 2400,
  height: 720,
  spawn: { x: 80, y: 420 },
  camera: { minX: 0, maxX: 2400, minY: 0, maxY: 720 },
  requiredCollectibles: 0,
  entities: [
    {
      id: "platform-001",
      type: "static-platform",
      x: 0,
      y: 520,
      width: 420,
      height: 32,
      material: "grass",
    },
    {
      id: "platform-002",
      type: "static-platform",
      x: 500,
      y: 480,
      width: 160,
      height: 24,
      material: "grass",
    },
    {
      id: "platform-003",
      type: "static-platform",
      x: 740,
      y: 440,
      width: 140,
      height: 24,
      material: "stone",
    },
    {
      id: "platform-004",
      type: "one-way-platform",
      x: 940,
      y: 380,
      width: 120,
      height: 8,
      material: "wood",
    },
    {
      id: "platform-005",
      type: "static-platform",
      x: 1140,
      y: 420,
      width: 200,
      height: 24,
      material: "grass",
    },
    {
      id: "platform-006",
      type: "static-platform",
      x: 1420,
      y: 460,
      width: 180,
      height: 24,
      material: "stone",
    },
    {
      id: "platform-007",
      type: "static-platform",
      x: 1680,
      y: 400,
      width: 160,
      height: 24,
      material: "grass",
    },
    {
      id: "platform-008",
      type: "static-platform",
      x: 1930,
      y: 470,
      width: 330,
      height: 32,
      material: "grass",
    },
    {
      id: "platform-wall-left",
      type: "static-platform",
      x: -24,
      y: 0,
      width: 24,
      height: 720,
      material: "stone",
    },
    { id: "ring-001", type: "ring", x: 180, y: 450, value: 10 },
    { id: "ring-002", type: "ring", x: 560, y: 410, value: 10 },
    { id: "ring-003", type: "ring", x: 800, y: 370, value: 10 },
    { id: "ring-004", type: "ring", x: 1200, y: 350, value: 10 },
    { id: "ring-005", type: "ring", x: 1720, y: 330, value: 10 },
    { id: "spike-001", type: "spikes", x: 300, y: 504, width: 32, height: 16 },
    { id: "checkpoint-001", type: "checkpoint", x: 1150, y: 350, width: 20, height: 70 },
    { id: "exit-001", type: "level-exit", x: 2160, y: 440, width: 48, height: 90 },
  ],
};
