import { Player, type PlayerInput } from "../entities/Player";
import { toRuntimePlatforms, type LevelDefinition, type PlatformRuntime } from "../levels/Level";
import { CollisionSystem } from "./CollisionSystem";
import { EventBus } from "../core/EventBus";
import type { GameEvents } from "../core/GameEvents";

/**
 * Pure gameplay simulation for one level (spec section 4, Gameplay).
 * No DOM, no canvas: fully unit-testable. The scene owns rendering.
 */
export class GameWorld {
  readonly level: LevelDefinition;
  readonly player: Player;
  readonly platforms: readonly PlatformRuntime[];
  readonly events = new EventBus<GameEvents>();
  readonly collision = new CollisionSystem();

  tick = 0;
  deaths = 0;
  spawn: { x: number; y: number };
  private running = true;

  constructor(level: LevelDefinition) {
    this.level = level;
    this.platforms = toRuntimePlatforms(level);
    this.spawn = { ...level.spawn };
    this.player = new Player(level.spawn.x, level.spawn.y);
  }

  start(): void {
    this.running = true;
    this.events.emit("level-started", { levelId: this.level.id });
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Advance the simulation one fixed step. */
  step(deltaSeconds: number, input: PlayerInput): void {
    if (!this.running) return;
    this.tick++;

    const player = this.player;
    const previousBottom = player.bottom();
    player.grounded = false;
    player.update(deltaSeconds, input);

    // Axis-separated integrate + resolve (anti-tunneling).
    player.x += player.vx * deltaSeconds;
    this.collision.resolveHorizontal(player, this.platforms);

    const wasFalling = player.vy >= 0;
    player.y += player.vy * deltaSeconds;
    const landedOn = this.collision.resolveVertical(player, this.platforms, previousBottom);

    if (landedOn && wasFalling) {
      player.bounce();
      this.events.emit("player-bounced", { playerId: "player" });
    }

    // Pit: fell out of the level.
    if (player.y > this.level.height + 80) {
      this.killPlayer("pit");
    }
  }

  killPlayer(cause: string): void {
    if (this.player.state === "dead") return;
    this.player.state = "dead";
    this.deaths++;
    this.events.emit("player-died", { playerId: "player", cause });
    // Prototype: respawn immediately at spawn (checkpoints come in Phase 2).
    this.respawnPlayer();
  }

  respawnPlayer(): void {
    this.player.reset(this.spawn.x, this.spawn.y, true);
    this.events.emit("player-respawned", { playerId: "player" });
  }

  /** Full level restart: resets transient state (spec section 7). */
  reset(): void {
    this.spawn = { ...this.level.spawn };
    this.player.reset(this.level.spawn.x, this.level.spawn.y);
    this.tick = 0;
    this.events.clear();
  }
}
