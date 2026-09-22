import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  SAVE_VERSION,
  createDefaultSave,
  repairSaveData,
} from "../../../src/save/SaveData";

describe("SaveData", () => {
  it("creates defaults with the first level unlocked", () => {
    const save = createDefaultSave("level-01");
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.unlockedLevels).toEqual(["level-01"]);
    expect(save.completedLevels).toEqual({});
    expect(save.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("repair fixes garbage input to defaults", () => {
    expect(repairSaveData(null, "level-01")).toEqual(createDefaultSave("level-01"));
    expect(repairSaveData(42, "level-01")).toEqual(createDefaultSave("level-01"));
    expect(repairSaveData("junk", "level-01")).toEqual(createDefaultSave("level-01"));
  });

  it("repair keeps valid data and fills gaps", () => {
    const save = createDefaultSave("level-01");
    save.unlockedLevels = ["level-02"];
    const repaired = repairSaveData(save, "level-01");
    // First level must always remain unlockable.
    expect(repaired.unlockedLevels).toContain("level-01");
    expect(repaired.unlockedLevels).toContain("level-02");
    expect(repaired.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("repair drops non-string unlocked levels", () => {
    const repaired = repairSaveData({ unlockedLevels: ["level-01", 5, null] }, "level-01");
    expect(repaired.unlockedLevels).toEqual(["level-01"]);
  });

  it("repair patches partial settings", () => {
    const repaired = repairSaveData({ settings: { masterVolume: 0.1, bogus: true } }, "level-01");
    expect(repaired.settings.masterVolume).toBe(0.1);
    expect(repaired.settings.muted).toBe(false);
  });
});
