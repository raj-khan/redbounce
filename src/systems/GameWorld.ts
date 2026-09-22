import { Player, type PlayerInput } from "../entities/Player";
import { toRuntimePlatforms, type LevelDefinition, type PlatformRuntime } from "../levels/Level";
import {
  toRuntimeCheckpoints,
  toRuntimeCollectibles,
  toRuntimeExit,
  toRuntimeHazards,
  type CheckpointRuntime,
  type CollectibleRuntime,
  type ExitRuntime,
  type HazardRuntime,
} from "../entities/EntityRuntime";
import type { LevelResult } from "../levels/LevelResult";
import { CollisionSystem } from "./CollisionSystem";
import { EventBus } from "../core/EventBus";
import type { GameEvents } from "../core/GameEvents";
import { circleIntersectsRect } from "../math/Rect";

/** Sensor pickup radius for collectibles. */
const PICKUP_RADIUS = 10;
/** Seconds of death animation before respawn (spec section 17). */
const DEATH_DELAY_SECONDS = 0.6;

/**
 * Pure gameplay simulation for one level (spec sections 4 and 12-18).
 * No DOM, no canvas: fully unit-testable. The scene owns rendering.
 */
export class GameWorld {
  readonly level: LevelDefinition;
  readonly player: Player;
  readonly platforms: readonly PlatformRuntime[];
  readonly collectibles: CollectibleRuntime[];
  readonly hazards: HazardRuntime[];
  readonly checkpoints: CheckpointRuntime[];
  readonly exit: ExitRuntime | null;
  readonly events = new EventBus<GameEvents>();
  readonly collision = new CollisionSystem();

  tick = 0;
  deaths = 0;
  score = 0;
  lives = 3;
  hasKey = false;
  elapsedSeconds = 0;
  completed = false;
  result: LevelResult | null = null;
  spawn: { x: number; y: number };
  private deathTimer = 0;

  constructor(level: LevelDefinition) {
    this.level = level;
    this.platforms = toRuntimePlatforms(level);
    this.collectibles = toRuntimeCollectibles(level);
    this.hazards = toRuntimeHazards(level);
    this.checkpoints = toRuntimeCheckpoints(level);
    this.exit = toRuntimeExit(level);
    this.spawn = { ...level.spawn };
    this.player = new Player(level.spawn.x, level.spawn.y);
  }

  start(): void {
    this.events.emit("level-started", { levelId: this.level.id });
  }

  get collectiblesFound(): number {
    return this.collectibles.filter((c) => c.collected && c.type !== "key").length;
  }

  get collectiblesTotal(): number {
    return this.collectibles.filter((c) => c.type !== "key").length;
  }

  /** Advance the simulation one fixed step. */
  step(deltaSeconds: number, input: PlayerInput): void {
    if (this.completed) return;
    this.tick++;
    this.elapsedSeconds += deltaSeconds;

    if (this.player.state === "dead") {
      this.player.update(deltaSeconds, { left: false, right: false });
      this.deathTimer -= deltaSeconds;
      if (this.deathTimer <= 0) this.finishRespawn();
      return;
    }

    this.updateHazards(deltaSeconds);

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

    // Falling rocks stop on platforms.
    this.settleFallingRocks();

    // Sensor interactions.
    this.checkCollectibles();
    this.checkHazards();
    this.checkCheckpoints();
    this.checkExit();

    // Pit: fell out of the level.
    if (player.y > this.level.height + 80) {
      this.killPlayer("pit");
    }
  }

  // -----------------------------------------------------------------------
  // Hazards
  // -----------------------------------------------------------------------

  private updateHazards(deltaSeconds: number): void {
    for (const hazard of this.hazards) {
      switch (hazard.kind) {
        case "saw":
          hazard.angle += hazard.speed * deltaSeconds;
          break;
        case "laser":
          hazard.time += deltaSeconds;
          this.updateLaser(hazard);
          break;
        case "falling-rock":
          if (hazard.state === "idle") {
            const dx = this.player.x - hazard.x;
            const dy = this.player.y - hazard.y;
            if (Math.hypot(dx, dy) < hazard.triggerDistance) hazard.state = "falling";
          } else if (hazard.state === "falling") {
            hazard.vy = Math.min(hazard.vy + 900 * deltaSeconds, 300);
            hazard.y += hazard.vy * deltaSeconds;
          }
          break;
        default:
          break;
      }
    }
  }

  /** Laser lifecycle: idle -> warn (telegraph) -> fire -> idle (spec 14). */
  private updateLaser(laser: Extract<HazardRuntime, { kind: "laser" }>): void {
    const cycle = laser.onSeconds + laser.offSeconds;
    const t = ((laser.time % cycle) + cycle) % cycle;
    if (t < laser.offSeconds) {
      // Last 30% of the idle phase is the warning telegraph.
      laser.phase = t > laser.offSeconds * 0.7 ? "warn" : "idle";
      laser.active = false;
    } else {
      laser.phase = "fire";
      laser.active = true;
    }
  }

  private settleFallingRocks(): void {
    for (const hazard of this.hazards) {
      if (hazard.kind !== "falling-rock" || hazard.state !== "falling") continue;
      for (const platform of this.platforms) {
        const r = platform.rect;
        if (
          hazard.x + hazard.radius > r.x &&
          hazard.x - hazard.radius < r.x + r.width &&
          hazard.y + hazard.radius >= r.y &&
          hazard.y + hazard.radius <= r.y + r.height + 8
        ) {
          hazard.y = r.y - hazard.radius;
          hazard.state = "resting";
          break;
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Sensors
  // -----------------------------------------------------------------------

  private checkCollectibles(): void {
    const p = this.player;
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;
      const dx = p.x - collectible.x;
      const dy = p.y - collectible.y;
      if (dx * dx + dy * dy > (PICKUP_RADIUS + p.radius) ** 2) continue;

      collectible.collected = true;
      switch (collectible.type) {
        case "key":
          this.hasKey = true;
          break;
        case "heart":
          this.lives++;
          this.score += collectible.value;
          break;
        default:
          this.score += collectible.value;
          break;
      }
      this.events.emit("collectible-collected", {
        collectibleId: collectible.id,
        value: collectible.value,
      });
      this.events.emit("sound-requested", { soundId: `pickup-${collectible.type}` });
    }
  }

  private checkHazards(): void {
    const p = this.player;
    if (p.invulnerability > 0) return;
    for (const hazard of this.hazards) {
      let hit = false;
      switch (hazard.kind) {
        case "spikes":
        case "lava":
          hit = circleIntersectsRect(p.x, p.y, p.radius, {
            x: hazard.x,
            y: hazard.y,
            width: hazard.width,
            height: hazard.height,
          });
          break;
        case "laser":
          if (!hazard.active) break;
          hit = circleIntersectsRect(p.x, p.y, p.radius, {
            x: hazard.x,
            y: hazard.y,
            width: hazard.width,
            height: hazard.height,
          });
          break;
        case "saw": {
          const dx = p.x - hazard.x;
          const dy = p.y - hazard.y;
          const reach = p.radius + hazard.radius * 0.8;
          hit = dx * dx + dy * dy <= reach * reach;
          break;
        }
        case "falling-rock": {
          const dx = p.x - hazard.x;
          const dy = p.y - hazard.y;
          const reach = p.radius + hazard.radius;
          hit = dx * dx + dy * dy <= reach * reach;
          break;
        }
      }
      if (hit) {
        this.events.emit("player-damaged", { playerId: "player", sourceId: hazard.id });
        this.killPlayer(hazard.kind);
        return;
      }
    }
  }

  private checkCheckpoints(): void {
    const p = this.player;
    for (const checkpoint of this.checkpoints) {
      if (checkpoint.activated) continue;
      if (
        circleIntersectsRect(p.x, p.y, p.radius, {
          x: checkpoint.rect.x,
          y: checkpoint.rect.y,
          width: checkpoint.rect.width,
          height: checkpoint.rect.height,
        })
      ) {
        checkpoint.activated = true;
        // Respawn point sits above the checkpoint (validated at load).
        this.spawn = {
          x: checkpoint.rect.x + checkpoint.rect.width / 2,
          y: checkpoint.rect.y + checkpoint.rect.height / 2 - 20,
        };
        this.events.emit("checkpoint-activated", { checkpointId: checkpoint.id });
        this.events.emit("sound-requested", { soundId: "checkpoint" });
      }
    }
  }

  private checkExit(): void {
    if (!this.exit || this.player.state === "dead") return;
    const p = this.player;
    if (
      !circleIntersectsRect(p.x, p.y, p.radius, {
        x: this.exit.rect.x,
        y: this.exit.rect.y,
        width: this.exit.rect.width,
        height: this.exit.rect.height,
      })
    ) {
      return;
    }
    // Completion conditions (spec section 18).
    if (this.exit.requiresKey && !this.hasKey) return;
    const required = this.level.requiredCollectibles ?? 0;
    if (this.collectiblesFound < required) return;
    this.completeLevel();
  }

  // -----------------------------------------------------------------------
  // Death and respawn (spec section 17)
  // -----------------------------------------------------------------------

  killPlayer(cause: string): void {
    if (this.player.state === "dead" || this.completed) return;
    this.player.state = "dead";
    this.deaths++;
    this.deathTimer = DEATH_DELAY_SECONDS;
    this.events.emit("player-died", { playerId: "player", cause });
    this.events.emit("sound-requested", { soundId: "death" });
  }

  private finishRespawn(): void {
    this.lives--;
    if (this.lives <= 0) {
      // Out of lives: full level restart with fresh lives.
      this.lives = 3;
      this.reset(true);
      this.events.emit("player-respawned", { playerId: "player" });
      return;
    }
    this.respawnPlayer();
  }

  respawnPlayer(): void {
    this.player.reset(this.spawn.x, this.spawn.y, true);
    this.events.emit("player-respawned", { playerId: "player" });
  }

  // -----------------------------------------------------------------------
  // Completion (spec section 18)
  // -----------------------------------------------------------------------

  completeLevel(): void {
    if (this.completed) return;
    this.completed = true;
    this.player.state = "finished";
    const objectives: string[] = [];
    if (this.hasKey) objectives.push("key-found");
    if (this.collectiblesTotal > 0 && this.collectiblesFound === this.collectiblesTotal) {
      objectives.push("all-collectibles");
    }
    this.result = {
      levelId: this.level.id,
      completed: true,
      score: this.score,
      collectiblesFound: this.collectiblesFound,
      collectiblesTotal: this.collectiblesTotal,
      deaths: this.deaths,
      completionTimeSeconds: Math.round(this.elapsedSeconds * 100) / 100,
      objectives,
      completedAt: Date.now(),
    };
    this.events.emit("level-completed", { levelId: this.level.id });
    this.events.emit("sound-requested", { soundId: "level-complete" });
  }

  /** Full level restart: resets transient state (spec sections 7 and 17). */
  reset(keepDeaths = false): void {
    this.spawn = { ...this.level.spawn };
    this.player.reset(this.level.spawn.x, this.level.spawn.y);
    this.tick = 0;
    if (!keepDeaths) this.deaths = 0;
    this.score = 0;
    this.lives = 3;
    this.hasKey = false;
    this.elapsedSeconds = 0;
    this.completed = false;
    this.result = null;
    this.deathTimer = 0;
    for (const collectible of this.collectibles) {
      if (collectible.respawnOnRestart) collectible.collected = false;
    }
    for (const checkpoint of this.checkpoints) checkpoint.activated = false;
    for (const hazard of this.hazards) {
      if (hazard.kind === "falling-rock") {
        hazard.y = hazard.homeY;
        hazard.vy = 0;
        hazard.state = "idle";
      } else if (hazard.kind === "laser") {
        hazard.time = 0;
        hazard.active = false;
        hazard.phase = "idle";
      }
    }
    this.events.clear();
  }
}
