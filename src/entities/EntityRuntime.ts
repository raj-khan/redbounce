import type { EntityDefinition, LevelDefinition, PlatformMaterial, Vec2Def } from "../levels/Level";

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

export type MovingPlatformRuntime = {
  id: string;
  start: Vec2Def;
  end: Vec2Def;
  durationSeconds: number;
  easing: "linear" | "smooth";
  time: number;
  /** Current rect, recomputed each tick before collision resolution. */
  rect: { x: number; y: number; width: number; height: number };
  material: PlatformMaterial;
  /** Delta applied since the previous tick, for riders. */
  deltaX: number;
  deltaY: number;
};

export type BouncePadRuntime = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  velocity: number;
  /** Activation animation timer. */
  flash: number;
};

export type BreakablePlatformRuntime = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  breakDelaySeconds: number;
  contactTime: number;
  state: "intact" | "cracking" | "broken";
  flash: number;
};

export type EnemyRuntime =
  | {
      kind: "patroller";
      id: string;
      start: Vec2Def;
      end: Vec2Def;
      speed: number;
      radius: number;
      x: number;
      y: number;
      direction: 1 | -1;
    }
  | {
      kind: "chaser";
      id: string;
      homeX: number;
      homeY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      speed: number;
      radius: number;
      aggroRadius: number;
      aggro: boolean;
    }
  | {
      kind: "orbital";
      id: string;
      centerX: number;
      centerY: number;
      orbitRadius: number;
      radius: number;
      angularSpeed: number;
      angle: number;
      x: number;
      y: number;
    };

export type WindZoneRuntime = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  forceX: number;
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

export function toRuntimeMovingPlatforms(level: LevelDefinition): MovingPlatformRuntime[] {
  return level.entities
    .filter(
      (entity): entity is Extract<EntityDefinition, { type: "moving-platform" }> =>
        entity.type === "moving-platform",
    )
    .map((entity) => ({
      id: entity.id,
      start: { ...entity.start },
      end: { ...entity.end },
      durationSeconds: Math.max(0.5, entity.durationSeconds),
      easing: entity.easing ?? "smooth",
      time: 0,
      rect: {
        x: entity.start.x,
        y: entity.start.y,
        width: entity.width,
        height: entity.height,
      },
      material: entity.material ?? "metal",
      deltaX: 0,
      deltaY: 0,
    }));
}

export function toRuntimeBouncePads(level: LevelDefinition): BouncePadRuntime[] {
  return level.entities
    .filter(
      (entity): entity is Extract<EntityDefinition, { type: "bounce-pad" }> =>
        entity.type === "bounce-pad",
    )
    .map((entity) => ({
      id: entity.id,
      rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
      velocity: entity.velocity ?? -330,
      flash: 0,
    }));
}

export function toRuntimeBreakables(level: LevelDefinition): BreakablePlatformRuntime[] {
  return level.entities
    .filter(
      (entity): entity is Extract<EntityDefinition, { type: "breakable-platform" }> =>
        entity.type === "breakable-platform",
    )
    .map((entity) => ({
      id: entity.id,
      rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
      breakDelaySeconds: entity.breakDelaySeconds ?? 0.6,
      contactTime: 0,
      state: "intact" as const,
      flash: 0,
    }));
}

export function toRuntimeEnemies(level: LevelDefinition): EnemyRuntime[] {
  const enemies: EnemyRuntime[] = [];
  for (const entity of level.entities) {
    switch (entity.type) {
      case "patroller":
        enemies.push({
          kind: "patroller",
          id: entity.id,
          start: { ...entity.start },
          end: { ...entity.end },
          speed: entity.speed ?? 40,
          radius: entity.radius ?? 6,
          x: entity.start.x,
          y: entity.start.y,
          direction: 1,
        });
        break;
      case "chaser":
        enemies.push({
          kind: "chaser",
          id: entity.id,
          homeX: entity.x,
          homeY: entity.y,
          x: entity.x,
          y: entity.y,
          vx: 0,
          vy: 0,
          speed: entity.speed ?? 55,
          radius: entity.radius ?? 6,
          aggroRadius: entity.aggroRadius ?? 80,
          aggro: false,
        });
        break;
      case "orbital":
        enemies.push({
          kind: "orbital",
          id: entity.id,
          centerX: entity.center.x,
          centerY: entity.center.y,
          orbitRadius: entity.orbitRadius,
          radius: entity.radius ?? 6,
          angularSpeed: entity.angularSpeed ?? 2,
          angle: 0,
          x: entity.center.x + entity.orbitRadius,
          y: entity.center.y,
        });
        break;
      default:
        break;
    }
  }
  return enemies;
}

export function toRuntimeWindZones(level: LevelDefinition): WindZoneRuntime[] {
  return level.entities
    .filter(
      (entity): entity is Extract<EntityDefinition, { type: "wind-zone" }> =>
        entity.type === "wind-zone",
    )
    .map((entity) => ({
      id: entity.id,
      rect: { x: entity.x, y: entity.y, width: entity.width, height: entity.height },
      forceX: entity.forceX ?? 120,
    }));
}
