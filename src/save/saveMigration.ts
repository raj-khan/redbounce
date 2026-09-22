import { SAVE_VERSION, createDefaultSave, type SaveData } from "./SaveData";

/**
 * Forward migration chain (spec section 27).
 * Each migration steps one version; unknown future versions pass through
 * untouched (never downgrade) after structural repair.
 */

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  // v1 -> v2: settings gained reducedMotion and touchControls.
  1: (data) => {
    const settings = (data["settings"] as Record<string, unknown> | undefined) ?? {};
    return {
      ...data,
      version: 2,
      settings: { ...settings, reducedMotion: false, touchControls: true },
    };
  },
};

export function migrateSaveData(data: SaveData): SaveData {
  let current = data as unknown as Record<string, unknown>;
  let version =
    typeof current["version"] === "number" ? (current["version"] as number) : SAVE_VERSION;

  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) break; // Gap in the chain: stop, keep as-is.
    current = migrate(current);
    const next = current["version"];
    version = typeof next === "number" ? next : version + 1;
  }

  return current as unknown as SaveData;
}

/** Test helper: a v1-shaped save (pre reducedMotion/touchControls). */
export function createLegacyV1Save(firstLevelId: string): Record<string, unknown> {
  const fresh = createDefaultSave(firstLevelId);
  return {
    version: 1,
    unlockedLevels: fresh.unlockedLevels,
    completedLevels: fresh.completedLevels,
    settings: {
      masterVolume: 0.5,
      musicVolume: 0.5,
      sfxVolume: 0.5,
      muted: true,
    },
    updatedAt: 123,
  };
}
