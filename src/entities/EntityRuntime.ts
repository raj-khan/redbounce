import type { EntityDefinition, LevelDefinition } from "../levels/Level";

/** Runtime entity state, separate from frozen level data (spec section 38). */

export type CollectibleType = "ring" | "star" | "key" | "heart";

export type CollectibleRuntime = {
  id: string;
  type: CollectibleType;
  x: number;
  y: number;
  value: number;
  collected: boolean;
  /** Collectibles always respawn on level restart (spec section 16). */
  respawnOnRestart: boolean;
};

export type HazardRuntime =
  | { kind: "spikes"; id: string; x: number; y: number; width: number; height: number }
  | { kind: "lava"; id: string; x: number; y: number; width: number; height: number }
  | { kind: "saw"; id: string; x: number; y: number; radius: number; angle: number; speed: number }
  | {
      kind: "laser";
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      onSeconds: number;
      offSeconds: number;
      time: number;
      /** Emitter lifecycle: warn -> fire -> idle. */
      phase: "idle" | "warn" | "fire";
      active: boolean;
    }
  | {
      kind: "falling-rock";
      id: string;
      x: number;
      y: number;
      homeY: number;
      radius: number;
      vy: number;
      state: "idle" | "falling" | "resting";
      triggerDistance: number;
    };

export type CheckpointRuntime = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  activated: boolean;
};

export type ExitRuntime = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  requiresKey: boolean;
};

/** Build runtime collectibles from level data. */
export function toRuntimeCollectibles(level: LevelDefinition): CollectibleRuntime[] {
  const collectibles: CollectibleRuntime[] = [];
  for (const entity of level.entities) {
    if (entity.type === "ring" || entity.type === "star" || entity.type === "heart") {
      const value =
        entity.value ?? (entity.type === "ring" ? 10 : entity.type === "star" ? 50 : 25);
      collectibles.push({
        id: entity.id,
        type: entity.type,
        x: entity.x,
        y: entity.y,
        value,
        collected: false,
        respawnOnRestart: true,
      });
    } else if (entity.type === "key") {
      collectibles.push({
        id: entity.id,
        type: "key",
        x: entity.x,
        y: entity.y,
        value: 0,
        collected: false,
        respawnOnRestart: true,
      });
    }
  }
  return collectibles;
}

/** Build runtime hazards from level data. */
export function toRuntimeHazards(level: LevelDefinition): HazardRuntime[] {
  const hazards: HazardRuntime[] = [];
  for (const entity of level.entities) {
    const e: EntityDefinition = entity;
    switch (e.type) {
      case "spikes":
        hazards.push({
          kind: "spikes",
          id: e.id,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
        });
        break;
      case "lava":
        hazards.push({ kind: "lava", id: e.id, x: e.x, y: e.y, width: e.width, height: e.height });
        break;
      case "saw":
        hazards.push({
          kind: "saw",
          id: e.id,
          x: e.x,
          y: e.y,
          radius: e.radius,
          angle: 0,
          speed: e.speed ?? 3,
        });
        break;
      case "laser":
        hazards.push({
          kind: "laser",
          id: e.id,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          onSeconds: e.onSeconds ?? 1.2,
          offSeconds: e.offSeconds ?? 1.8,
          time: -(e.startOffsetSeconds ?? 0),
          phase: "idle",
          active: false,
        });
        break;
      case "falling-rock":
        hazards.push({
          kind: "falling-rock",
          id: e.id,
          x: e.x,
          y: e.y,
          homeY: e.y,
          radius: e.radius,
          vy: 0,
          state: "idle",
          triggerDistance: e.triggerDistance ?? 90,
        });
        break;
      default:
        break;
    }
  }
  return hazards;
}

export function toRuntimeCheckpoints(level: LevelDefinition): CheckpointRuntime[] {
  return level.entities
    .filter((entity) => entity.type === "checkpoint")
    .map((entity) => ({
      id: entity.id,
      rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
      activated: false,
    }));
}

export function toRuntimeExit(level: LevelDefinition): ExitRuntime | null {
  for (const entity of level.entities) {
    if (entity.type === "level-exit") {
      return {
        id: entity.id,
        rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
        requiresKey: entity.requiresKey ?? level.requiresKey ?? false,
      };
    }
  }
  return null;
}
