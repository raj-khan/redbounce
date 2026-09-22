import { Player, type PlayerInput } from "../entities/Player";
import { toRuntimePlatforms, type LevelDefinition, type PlatformRuntime } from "../levels/Level";
import {
  toRuntimeBouncePads,
  toRuntimeBreakables,
  toRuntimeCheckpoints,
  toRuntimeCollectibles,
  toRuntimeEnemies,
  toRuntimeExit,
  toRuntimeHazards,
  toRuntimeMovingPlatforms,
  toRuntimeWindZones,
  type BouncePadRuntime,
  type BreakablePlatformRuntime,
  type CheckpointRuntime,
  type CollectibleRuntime,
  type EnemyRuntime,
  type ExitRuntime,
  type HazardRuntime,
  type MovingPlatformRuntime,
  type WindZoneRuntime,
} from "../entities/EntityRuntime";
import type { LevelResult } from "../levels/LevelResult";
import { CollisionSystem, type SolidSurface } from "./CollisionSystem";
import { ParticleSystem } from "./ParticleSystem";
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
  readonly movingPlatforms: MovingPlatformRuntime[];
  readonly bouncePads: BouncePadRuntime[];
  readonly breakables: BreakablePlatformRuntime[];
  readonly enemies: EnemyRuntime[];
  readonly windZones: WindZoneRuntime[];
  readonly particles = new ParticleSystem();
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
    this.movingPlatforms = toRuntimeMovingPlatforms(level);
    this.bouncePads = toRuntimeBouncePads(level);
    this.breakables = toRuntimeBreakables(level);
    this.enemies = toRuntimeEnemies(level);
    this.windZones = toRuntimeWindZones(level);
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
    if (this.completed) {
      this.particles.update(deltaSeconds);
      return;
    }
    this.tick++;
    this.elapsedSeconds += deltaSeconds;

    if (this.player.state === "dead") {
      this.player.update(deltaSeconds, { left: false, right: false });
      this.deathTimer -= deltaSeconds;
      this.particles.update(deltaSeconds);
      if (this.deathTimer <= 0) this.finishRespawn();
      return;
    }

    this.updateMovingPlatforms(deltaSeconds);
    this.updateHazards(deltaSeconds);
    this.updateEnemies(deltaSeconds);
    this.updateBreakables(deltaSeconds);

    const player = this.player;
    const previousBottom = player.bottom();
    player.grounded = false;
    player.update(deltaSeconds, input, this.windAccelX());

    // Axis-separated integrate + resolve (anti-tunneling).
    player.x += player.vx * deltaSeconds;
    const solids = this.solidSurfaces();
    this.collision.resolveHorizontal(player, solids);

    const wasFalling = player.vy >= 0;
    player.y += player.vy * deltaSeconds;
    const landedId = this.collision.resolveVertical(player, solids, previousBottom);

    if (landedId && wasFalling) {
      this.handleLanding(landedId, deltaSeconds);
    }

    this.settleFallingRocks();
    this.particles.spawnTrail(player.x, player.y + player.radius * 0.5, Math.abs(player.vx));

    // Sensor interactions.
    this.checkCollectibles();
    this.checkHazards();
    this.checkEnemies();
    this.checkCheckpoints();
    this.checkExit();

    this.particles.update(deltaSeconds);

    // Pit: fell out of the level.
    if (player.y > this.level.height + 80) {
      this.killPlayer("pit");
    }
  }

  // -----------------------------------------------------------------------
  // Solids
  // -----------------------------------------------------------------------

  /** All solid surfaces for this tick: statics, movings, intact breakables, pads. */
  private solidSurfaces(): SolidSurface[] {
    const surfaces: SolidSurface[] = this.platforms.map((p) => ({
      id: p.id,
      rect: p.rect,
      oneWay: p.oneWay,
    }));
    for (const moving of this.movingPlatforms) {
      surfaces.push({ id: moving.id, rect: moving.rect, oneWay: false });
    }
    for (const breakable of this.breakables) {
      if (breakable.state !== "broken") {
        surfaces.push({ id: breakable.id, rect: breakable.rect, oneWay: false });
      }
    }
    for (const pad of this.bouncePads) {
      surfaces.push({ id: pad.id, rect: pad.rect, oneWay: false });
    }
    return surfaces;
  }

  /** Moving platforms update before collision resolution (spec section 12). */
  private updateMovingPlatforms(deltaSeconds: number): void {
    for (const platform of this.movingPlatforms) {
      platform.time += deltaSeconds;
      const cycle = platform.durationSeconds * 2;
      const t = ((platform.time % cycle) + cycle) % cycle;
      const phase =
        t < platform.durationSeconds
          ? t / platform.durationSeconds
          : 2 - t / platform.durationSeconds;
      const eased = platform.easing === "smooth" ? smoothstep(phase) : phase;
      const nextX = platform.start.x + (platform.end.x - platform.start.x) * eased;
      const nextY = platform.start.y + (platform.end.y - platform.start.y) * eased;
      platform.deltaX = nextX - platform.rect.x;
      platform.deltaY = nextY - platform.rect.y;
      platform.rect.x = nextX;
      platform.rect.y = nextY;
    }
  }

  private handleLanding(surfaceId: string, _deltaSeconds: number): void {
    const player = this.player;

    const pad = this.bouncePads.find((p) => p.id === surfaceId);
    if (pad) {
      player.bounce(pad.velocity);
      pad.flash = 1;
      this.particles.spawnBoost(player.x, player.y + player.radius);
      this.events.emit("player-bounced", { playerId: "player" });
      this.events.emit("sound-requested", { soundId: "bounce" });
      return;
    }

    const moving = this.movingPlatforms.find((p) => p.id === surfaceId);
    if (moving) {
      // Ride the platform: apply its delta to the player.
      player.x += moving.deltaX;
      player.y += moving.deltaY;
    }

    const breakable = this.breakables.find((p) => p.id === surfaceId);
    if (breakable && breakable.state === "intact") {
      breakable.state = "cracking";
    }

    player.bounce();
    this.particles.spawnBounceDust(player.x, player.y + player.radius);
    this.events.emit("player-bounced", { playerId: "player" });
  }

  private updateBreakables(deltaSeconds: number): void {
    for (const breakable of this.breakables) {
      if (breakable.flash > 0) breakable.flash = Math.max(0, breakable.flash - deltaSeconds * 3);
      if (breakable.state === "cracking") {
        breakable.contactTime += deltaSeconds;
        if (breakable.contactTime >= breakable.breakDelaySeconds) {
          breakable.state = "broken";
          this.particles.spawnDeathBurst(
            breakable.rect.x + breakable.rect.width / 2,
            breakable.rect.y,
          );
        }
      }
    }
  }

  /** Sum of wind forces at the player position (applied inside Player.update). */
  private windAccelX(): number {
    const p = this.player;
    let accel = 0;
    for (const zone of this.windZones) {
      if (
        p.x > zone.rect.x &&
        p.x < zone.rect.x + zone.rect.width &&
        p.y > zone.rect.y &&
        p.y < zone.rect.y + zone.rect.height
      ) {
        accel += zone.forceX;
      }
    }
    return accel;
  }

  // -----------------------------------------------------------------------
  // Enemies (spec section 15)
  // -----------------------------------------------------------------------

  private updateEnemies(deltaSeconds: number): void {
    const p = this.player;
    for (const enemy of this.enemies) {
      switch (enemy.kind) {
        case "patroller": {
          // Move toward the current target end, reverse at boundaries.
          const target = enemy.direction === 1 ? enemy.end : enemy.start;
          const dx = target.x - enemy.x;
          const dy = target.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist < enemy.speed * deltaSeconds + 0.5) {
            enemy.direction = enemy.direction === 1 ? -1 : 1;
          } else {
            enemy.x += (dx / dist) * enemy.speed * deltaSeconds;
            enemy.y += (dy / dist) * enemy.speed * deltaSeconds;
          }
          break;
        }
        case "chaser": {
          const dx = p.x - enemy.x;
          const dy = p.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist < enemy.aggroRadius) enemy.aggro = true;
          else if (dist > enemy.aggroRadius * 1.5) enemy.aggro = false;
          if (enemy.aggro && dist > 1) {
            enemy.vx = (dx / dist) * enemy.speed;
            enemy.vy = (dy / dist) * enemy.speed;
          } else {
            // Drift home.
            const hx = enemy.homeX - enemy.x;
            const hy = enemy.homeY - enemy.y;
            const hd = Math.hypot(hx, hy);
            enemy.vx = hd > 1 ? (hx / hd) * enemy.speed * 0.5 : 0;
            enemy.vy = hd > 1 ? (hy / hd) * enemy.speed * 0.5 : 0;
          }
          enemy.x += enemy.vx * deltaSeconds;
          enemy.y += enemy.vy * deltaSeconds;
          break;
        }
        case "orbital": {
          enemy.angle += enemy.angularSpeed * deltaSeconds;
          enemy.x = enemy.centerX + Math.cos(enemy.angle) * enemy.orbitRadius;
          enemy.y = enemy.centerY + Math.sin(enemy.angle) * enemy.orbitRadius;
          break;
        }
      }
    }
  }

  private checkEnemies(): void {
    const p = this.player;
    if (p.invulnerability > 0) return;
    for (const enemy of this.enemies) {
      const dx = p.x - enemy.x;
      const dy = p.y - enemy.y;
      const reach = p.radius + enemy.radius;
      if (dx * dx + dy * dy <= reach * reach) {
        this.events.emit("player-damaged", { playerId: "player", sourceId: enemy.id });
        this.killPlayer(`enemy-${enemy.kind}`);
        return;
      }
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
      for (const surface of this.solidSurfaces()) {
        const r = surface.rect;
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
      const color =
        collectible.type === "ring"
          ? "#ffd23f"
          : collectible.type === "star"
            ? "#fff3b0"
            : "#e35b7c";
      this.particles.spawnPickupSparkle(collectible.x, collectible.y, color);
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
    this.particles.spawnDeathBurst(this.player.x, this.player.y);
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
    this.particles.spawnPickupSparkle(this.player.x, this.player.y, "#4fd66d");
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
    for (const moving of this.movingPlatforms) {
      moving.time = 0;
      moving.rect.x = moving.start.x;
      moving.rect.y = moving.start.y;
      moving.deltaX = 0;
      moving.deltaY = 0;
    }
    for (const breakable of this.breakables) {
      breakable.state = "intact";
      breakable.contactTime = 0;
    }
    for (const pad of this.bouncePads) pad.flash = 0;
    for (const enemy of this.enemies) {
      if (enemy.kind === "patroller") {
        enemy.x = enemy.start.x;
        enemy.y = enemy.start.y;
        enemy.direction = 1;
      } else if (enemy.kind === "chaser") {
        enemy.x = enemy.homeX;
        enemy.y = enemy.homeY;
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.aggro = false;
      } else if (enemy.kind === "orbital") {
        enemy.angle = 0;
        enemy.x = enemy.centerX + enemy.orbitRadius;
        enemy.y = enemy.centerY;
      }
    }
    this.particles.clear();
    this.events.clear();
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}
