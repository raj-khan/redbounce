import type { LevelDefinition } from "./Level";

/**
 * Level registry (spec section 24): ordered levels with unlock progression.
 * Levels register as raw (possibly untrusted) data; the loader validates.
 */
export class LevelRegistry {
  private readonly levels: LevelDefinition[] = [];
  private readonly byId = new Map<string, LevelDefinition>();

  register(level: LevelDefinition): void {
    if (this.byId.has(level.id)) {
      throw new Error(`LevelRegistry: duplicate level id "${level.id}"`);
    }
    this.levels.push(level);
    this.byId.set(level.id, level);
  }

  count(): number {
    return this.levels.length;
  }

  all(): readonly LevelDefinition[] {
    return this.levels;
  }

  get(levelId: string): LevelDefinition | undefined {
    return this.byId.get(levelId);
  }

  at(index: number): LevelDefinition | undefined {
    return this.levels[index];
  }

  indexOf(levelId: string): number {
    return this.levels.findIndex((level) => level.id === levelId);
  }

  /** The level that unlocks after the given one, if any. */
  next(levelId: string): LevelDefinition | undefined {
    const index = this.indexOf(levelId);
    if (index < 0) return undefined;
    return this.levels[index + 1];
  }

  first(): LevelDefinition | undefined {
    return this.levels[0];
  }
}
