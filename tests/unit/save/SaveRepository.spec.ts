import { describe, expect, it } from "vitest";
import {
  LocalStorageSaveRepository,
  type KeyValueStorage,
} from "../../../src/save/LocalStorageSaveRepository";
import { createLegacyV1Save } from "../../../src/save/saveMigration";
import { createDefaultSave } from "../../../src/save/SaveData";

/** In-memory storage double. */
class MemoryStorage implements KeyValueStorage {
  map = new Map<string, string>();
  failOnWrite = false;

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.failOnWrite) throw new Error("quota exceeded");
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function makeRepo(storage: KeyValueStorage = new MemoryStorage()) {
  return { repo: new LocalStorageSaveRepository(storage, "test.save", "level-01"), storage };
}

describe("LocalStorageSaveRepository", () => {
  it("loads defaults when storage is empty", async () => {
    const { repo } = makeRepo();
    const save = await repo.load();
    expect(save).toEqual(createDefaultSave("level-01"));
  });

  it("round-trips saves", async () => {
    const { repo } = makeRepo();
    const save = createDefaultSave("level-01");
    save.unlockedLevels.push("level-02");
    save.settings.muted = true;
    await repo.save(save);
    const loaded = await repo.load();
    expect(loaded.unlockedLevels).toEqual(["level-01", "level-02"]);
    expect(loaded.settings.muted).toBe(true);
  });

  it("recovers from corrupt JSON with defaults", async () => {
    const storage = new MemoryStorage();
    storage.map.set("test.save", "{not json at all");
    const { repo } = makeRepo(storage);
    const save = await repo.load();
    expect(save.unlockedLevels).toEqual(["level-01"]);
    expect(save.completedLevels).toEqual({});
  });

  it("migrates legacy v1 saves forward", async () => {
    const storage = new MemoryStorage();
    storage.map.set("test.save", JSON.stringify(createLegacyV1Save("level-01")));
    const { repo } = makeRepo(storage);
    const save = await repo.load();
    expect(save.version).toBe(2);
    expect(save.settings.reducedMotion).toBe(false);
    expect(save.settings.touchControls).toBe(true);
    // Preserved values survive migration.
    expect(save.settings.muted).toBe(true);
    expect(save.updatedAt).toBe(123);
  });

  it("storage read failures resolve to defaults, never throw", async () => {
    const storage = new MemoryStorage();
    const original = storage.getItem;
    storage.getItem = () => {
      throw new Error("privacy mode");
    };
    const { repo } = makeRepo(storage);
    await expect(repo.load()).resolves.toEqual(createDefaultSave("level-01"));
    storage.getItem = original;
  });

  it("save failures never throw (quota exceeded)", async () => {
    const storage = new MemoryStorage();
    storage.failOnWrite = true;
    const { repo } = makeRepo(storage);
    const save = createDefaultSave("level-01");
    await expect(repo.save(save)).resolves.toBeUndefined();
  });

  it("reset clears storage", async () => {
    const storage = new MemoryStorage();
    const { repo } = makeRepo(storage);
    await repo.save(createDefaultSave("level-01"));
    expect(storage.map.has("test.save")).toBe(true);
    await repo.reset();
    expect(storage.map.has("test.save")).toBe(false);
    const loaded = await repo.load();
    expect(loaded.unlockedLevels).toEqual(["level-01"]);
  });
});
