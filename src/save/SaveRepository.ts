import type { SaveData } from "./SaveData";

/** Persistence abstraction so storage can be replaced later (spec section 39). */
export interface SaveRepository {
  load(): Promise<SaveData>;
  save(data: SaveData): Promise<void>;
  reset(): Promise<void>;
}
