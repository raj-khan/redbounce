/**
 * Explicit game state machine (spec section 7).
 *
 * Only this machine transitions game states; invalid transitions are
 * rejected (returning false) so scattered flags can never fight it.
 */
export type GameState =
  | "booting"
  | "loading"
  | "main-menu"
  | "level-select"
  | "playing"
  | "paused"
  | "player-dead"
  | "level-complete"
  | "game-complete"
  | "settings";

export const GAME_STATE_TRANSITIONS: Readonly<Record<GameState, readonly GameState[]>> = {
  booting: ["loading"],
  loading: ["main-menu", "playing"],
  "main-menu": ["level-select", "settings", "loading", "playing", "game-complete"],
  "level-select": ["main-menu", "loading", "settings"],
  playing: ["paused", "player-dead", "level-complete", "loading", "main-menu"],
  paused: ["playing", "level-select", "main-menu", "settings"],
  "player-dead": ["playing", "level-select", "main-menu"],
  "level-complete": ["playing", "level-select", "main-menu", "game-complete", "loading"],
  "game-complete": ["main-menu", "level-select"],
  settings: ["main-menu", "level-select", "paused", "playing"],
};

export class GameStateMachine {
  private state: GameState;
  private previous: GameState | null = null;
  private readonly listeners = new Set<(from: GameState, to: GameState) => void>();

  constructor(initial: GameState = "booting") {
    this.state = initial;
  }

  current(): GameState {
    return this.state;
  }

  previousState(): GameState | null {
    return this.previous;
  }

  can(to: GameState): boolean {
    return GAME_STATE_TRANSITIONS[this.state].includes(to);
  }

  /** Attempt a transition. Returns false and keeps state when invalid. */
  transition(to: GameState): boolean {
    if (to === this.state) return false;
    if (!this.can(to)) return false;
    const from = this.state;
    this.previous = from;
    this.state = to;
    for (const listener of [...this.listeners]) listener(from, to);
    return true;
  }

  onChange(listener: (from: GameState, to: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
