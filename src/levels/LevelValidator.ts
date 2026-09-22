import {
  COLLECTIBLE_TYPES,
  ENTITY_TYPES,
  isPlatformEntity,
  type EntityDefinition,
  type LevelDefinition,
} from "./Level";
import { PLAYER_DEFAULTS } from "../config/gameplay.config";

/**
 * Level validation (spec section 24).
 * Returns a list of actionable errors; empty means the level is safe to load.
 */
export function validateLevel(level: unknown): string[] {
  const errors: string[] = [];
  if (typeof level !== "object" || level === null) {
    return ["level must be an object"];
  }
  const l = level as Partial<LevelDefinition>;

  if (typeof l.id !== "string" || l.id.length === 0) errors.push("id must be a non-empty string");
  if (typeof l.name !== "string" || l.name.length === 0)
    errors.push("name must be a non-empty string");
  if (typeof l.world !== "string" || l.world.length === 0)
    errors.push("world must be a non-empty string");
  if (!isPositiveNumber(l.width)) errors.push("width must be a positive number");
  if (!isPositiveNumber(l.height)) errors.push("height must be a positive number");
  if (errors.length > 0) return errors; // Cannot continue structural checks.
  const width = l.width!;
  const height = l.height!;

  if (!isVec2(l.spawn)) {
    errors.push("spawn must be { x, y }");
  } else {
    if (l.spawn.x < 0 || l.spawn.x > width || l.spawn.y < 0 || l.spawn.y > height) {
      errors.push(`spawn (${l.spawn.x}, ${l.spawn.y}) is outside level bounds`);
    }
  }

  if (
    !l.camera ||
    !isFiniteNumber(l.camera.minX) ||
    !isFiniteNumber(l.camera.maxX) ||
    !isFiniteNumber(l.camera.minY) ||
    !isFiniteNumber(l.camera.maxY)
  ) {
    errors.push("camera bounds must be { minX, maxX, minY, maxY }");
  }

  if (!Array.isArray(l.entities)) {
    errors.push("entities must be an array");
    return errors;
  }

  const ids = new Set<string>();
  const solidRects: { id: string; x: number; y: number; width: number; height: number }[] = [];
  let exitCount = 0;
  let collectibleCount = 0;
  let keyCount = 0;

  for (const [index, raw] of l.entities.entries()) {
    const entity = raw as Partial<EntityDefinition> | undefined;
    const label = `entities[${index}]`;
    if (!entity || typeof entity.id !== "string" || entity.id.length === 0) {
      errors.push(`${label}: id must be a non-empty string`);
      continue;
    }
    if (ids.has(entity.id)) errors.push(`duplicate entity id "${entity.id}"`);
    ids.add(entity.id);

    if (!entity.type || !ENTITY_TYPES.includes(entity.type)) {
      errors.push(`${label} (${entity.id}): unknown entity type "${String(entity.type)}"`);
      continue;
    }

    if (entity.type === "level-exit") {
      exitCount++;
      if (!isRect(entity))
        errors.push(`${label} (${entity.id}): level-exit requires x, y, width, height`);
    } else if (COLLECTIBLE_TYPES.includes(entity.type)) {
      collectibleCount++;
      if (entity.type === "key") keyCount++;
      if (!isVec2(entity)) errors.push(`${label} (${entity.id}): ${entity.type} requires x, y`);
    } else if (entity.type === "moving-platform" || entity.type === "patroller") {
      if (!isVec2(entity.start) || !isVec2(entity.end)) {
        errors.push(`${label} (${entity.id}): ${entity.type} requires start and end points`);
      }
    } else if (entity.type === "orbital") {
      if (!isVec2(entity.center) || !isPositiveNumber(entity.orbitRadius)) {
        errors.push(`${label} (${entity.id}): orbital requires center and orbitRadius`);
      }
    } else if (
      entity.type === "saw" ||
      entity.type === "falling-rock" ||
      entity.type === "chaser"
    ) {
      if (!isVec2(entity) || !isPositiveNumber((entity as { radius?: unknown }).radius)) {
        errors.push(
          `${label} (${(entity as { id?: string }).id ?? "?"}): ${(entity as { type?: string }).type} requires x, y, and radius`,
        );
      }
    } else if (!isRect(entity)) {
      errors.push(
        `${label} (${(entity as { id?: string }).id ?? "?"}): ${(entity as { type?: string }).type} requires x, y, width, height`,
      );
    }

    if (isPlatformEntity(entity as EntityDefinition) && isRect(entity)) {
      solidRects.push({
        id: (entity as { id?: string }).id ?? "?",
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height,
      });
    }
  }

  // Entity bounds inside level bounds where required.
  for (const entity of l.entities as EntityDefinition[]) {
    if (!isRect(entity) || !ENTITY_TYPES.includes(entity.type)) continue;
    if (
      entity.x < -64 ||
      entity.y < -64 ||
      entity.x + (entity.width ?? 0) > width + 64 ||
      entity.y + (entity.height ?? 0) > height + 64
    ) {
      errors.push(`entity "${entity.id}" bounds extend far outside the level`);
    }
  }

  if (exitCount < 1) errors.push("level must contain at least one level-exit");
  if (typeof l.requiredCollectibles === "number" && l.requiredCollectibles > collectibleCount) {
    errors.push(
      `requiredCollectibles (${l.requiredCollectibles}) exceeds collectible count (${collectibleCount})`,
    );
  }
  if (l.requiresKey && keyCount < 1) {
    errors.push("requiresKey is set but the level contains no key entity");
  }

  // Spawn must not be inside a solid (with the player's radius).
  if (isVec2(l.spawn)) {
    const r = PLAYER_DEFAULTS.radius;
    for (const solid of solidRects) {
      if (
        l.spawn.x + r > solid.x &&
        l.spawn.x - r < solid.x + solid.width &&
        l.spawn.y + r > solid.y &&
        l.spawn.y - r < solid.y + solid.height
      ) {
        errors.push(`spawn overlaps solid platform "${solid.id}"`);
        break;
      }
    }
  }

  return errors;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isPositiveNumber(v: unknown): v is number {
  return isFiniteNumber(v) && v > 0;
}

function isVec2(v: unknown): v is { x: number; y: number } {
  return (
    typeof v === "object" &&
    v !== null &&
    isFiniteNumber((v as { x?: unknown }).x) &&
    isFiniteNumber((v as { y?: unknown }).y)
  );
}

function isRect(v: unknown): v is {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return (
    typeof v === "object" &&
    v !== null &&
    isFiniteNumber((v as { x?: unknown }).x) &&
    isFiniteNumber((v as { y?: unknown }).y) &&
    isFiniteNumber((v as { width?: unknown }).width) &&
    isFiniteNumber((v as { height?: unknown }).height)
  );
}
