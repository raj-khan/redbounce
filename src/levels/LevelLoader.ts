import type { LevelDefinition } from "./Level";
import { validateLevel } from "./LevelValidator";
import type { LevelRegistry } from "./LevelRegistry";

/**
 * Level loader (spec sections 24 and 39).
 * Loads raw level data through the registry, validates it, and returns a
 * frozen definition so gameplay can never mutate static level data.
 */
export class LevelLoader {
  constructor(private readonly registry: LevelRegistry) {}

  async load(levelId: string): Promise<LevelDefinition> {
    const raw = this.registry.get(levelId);
    if (!raw) {
      throw new Error(`LevelLoader: unknown level "${levelId}"`);
    }
    const errors = validateLevel(raw);
    if (errors.length > 0) {
      throw new Error(
        `LevelLoader: level "${levelId}" failed validation:\n- ${errors.join("\n- ")}`,
      );
    }
    return deepFreeze(structuredClone(raw)) as LevelDefinition;
  }

  /** Validation errors for a level, for tooling and tests. */
  validate(levelId: string): string[] {
    const raw = this.registry.get(levelId);
    return raw ? validateLevel(raw) : [`unknown level "${levelId}"`];
  }
}

/** Recursively freeze so runtime code cannot mutate level data (spec 38). */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
