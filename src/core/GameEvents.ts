/** Typed domain events (spec section 32). */
export interface GameEvents {
  "player-bounced": { playerId: string };
  "player-damaged": { playerId: string; sourceId: string };
  "player-died": { playerId: string; cause: string };
  "player-respawned": { playerId: string };
  "collectible-collected": { collectibleId: string; value: number };
  "checkpoint-activated": { checkpointId: string };
  "level-started": { levelId: string };
  "level-completed": { levelId: string };
  "pause-requested": undefined;
  "resume-requested": undefined;
  "sound-requested": { soundId: string };
}
