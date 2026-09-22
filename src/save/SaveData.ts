import type { LevelResult } from "../levels/LevelResult";

/** Save data schema (spec section 27). Versioned for forward migration. */
export type SaveSettings = {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  touchControls: boolean;
};

export type SaveData = {
  version: number;
  unlockedLevels: string[];
  completedLevels: Record<string, LevelResult>;
  settings: SaveSettings;
  updatedAt: number;
};

export const SAVE_VERSION = 2;

export const DEFAULT_SETTINGS: SaveSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  muted: false,
  reducedMotion: false,
  touchControls: true,
};

export function createDefaultSave(firstLevelId: string): SaveData {
  return {
    version: SAVE_VERSION,
    unlockedLevels: [firstLevelId],
    completedLevels: {},
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: 0,
  };
}

/** Structural validation with safe repair; never throws (spec section 27). */
export function repairSaveData(raw: unknown, firstLevelId: string): SaveData {
  const fallback = createDefaultSave(firstLevelId);
  if (typeof raw !== "object" || raw === null) return fallback;
  const data = raw as Partial<SaveData>;

  const repaired: SaveData = {
    version: typeof data.version === "number" ? data.version : SAVE_VERSION,
    unlockedLevels: Array.isArray(data.unlockedLevels)
      ? data.unlockedLevels.filter((id): id is string => typeof id === "string")
      : fallback.unlockedLevels,
    completedLevels:
      typeof data.completedLevels === "object" && data.completedLevels !== null
        ? (data.completedLevels as SaveData["completedLevels"])
        : {},
    settings: { ...fallback.settings, ...(validSettings(data.settings) ? data.settings : {}) },
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };

  if (!repaired.unlockedLevels.includes(firstLevelId)) {
    repaired.unlockedLevels.push(firstLevelId);
  }
  return repaired;
}

function validSettings(settings: unknown): settings is Partial<SaveSettings> {
  return typeof settings === "object" && settings !== null;
}
