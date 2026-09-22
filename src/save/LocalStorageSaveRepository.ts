import { SAVE_VERSION, repairSaveData, type SaveData } from "./SaveData";
import { migrateSaveData } from "./saveMigration";
import type { SaveRepository } from "./SaveRepository";

/** Minimal storage surface so tests can inject a memory map. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * localStorage-backed save repository (spec section 27).
 *
 * - Corrupt data is repaired to defaults instead of crashing.
 * - Save failures never crash gameplay (errors resolve to no-op).
 * - Data is migrated forward on load.
 */
export class LocalStorageSaveRepository implements SaveRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly storageKey: string,
    private readonly firstLevelId: string,
  ) {}

  static create(
    firstLevelId: string,
    storageKey = "redbounce.save.v1",
  ): LocalStorageSaveRepository {
    // Browser-only constructor helper; the class itself stays storage-agnostic.
    return new LocalStorageSaveRepository(globalThis.localStorage, storageKey, firstLevelId);
  }

  async load(): Promise<SaveData> {
    let raw: string | null = null;
    try {
      raw = this.storage.getItem(this.storageKey);
    } catch {
      return repairSaveData(null, this.firstLevelId);
    }
    if (raw === null) return repairSaveData(null, this.firstLevelId);
    try {
      const parsed: unknown = JSON.parse(raw);
      return migrateSaveData(repairSaveData(parsed, this.firstLevelId));
    } catch {
      // Corrupt JSON: recover gracefully with defaults (spec section 27).
      return repairSaveData(null, this.firstLevelId);
    }
  }

  async save(data: SaveData): Promise<void> {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify({ ...data, version: SAVE_VERSION }));
    } catch {
      // Quota or privacy-mode failures must never crash gameplay.
    }
  }

  async reset(): Promise<void> {
    try {
      this.storage.removeItem(this.storageKey);
    } catch {
      // Ignore.
    }
  }
}
