import type { Rect } from "../math/Rect";

/**
 * Level definition (spec section 24). Data-driven: gameplay systems never
 * hardcode level layout and never mutate these definitions.
 */
export type PlatformMaterial = "grass" | "stone" | "ice" | "metal" | "wood";

export type PlatformEntity = {
  id: string;
  type: "static-platform" | "one-way-platform";
  x: number;
  y: number;
  width: number;
  height: number;
  material?: PlatformMaterial;
};

export type CameraBoundsDef = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type LevelDefinition = {
  id: string;
  name: string;
  world: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  camera: CameraBoundsDef;
  requiredCollectibles?: number;
  entities: PlatformEntity[];
};

/** First test level for the playable prototype (Phase 1). */
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
      width: 220,
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
  ],
};

/** Solid rectangle view of a platform for physics. */
export type PlatformRuntime = {
  id: string;
  rect: Rect;
  material: PlatformMaterial;
  oneWay: boolean;
};

export function toRuntimePlatforms(level: LevelDefinition): PlatformRuntime[] {
  return level.entities.map((entity) => ({
    id: entity.id,
    rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
    material: entity.material ?? "grass",
    oneWay: entity.type === "one-way-platform",
  }));
}
