import type { GameScene } from "../core/Scene";
import type { Camera } from "../rendering/Camera";
import type { CanvasRenderer } from "../rendering/CanvasRenderer";
import { BackgroundRenderer } from "../rendering/BackgroundRenderer";
import { EntityRenderer } from "../rendering/EntityRenderer";
import { DebugRenderer } from "../rendering/DebugRenderer";
import { PALETTE } from "../config/rendering.config";
import type { PlayerInput } from "../entities/Player";
import { GameWorld } from "../systems/GameWorld";
import type { LevelDefinition } from "../levels/Level";
import type { DebugConfig } from "../debug/DebugConfig";

/**
 * The gameplay scene: owns the world simulation and renders it.
 * Rendering reads world state; it never mutates it (spec section 20).
 */
export class PlayScene implements GameScene {
  readonly world: GameWorld;
  private readonly renderer: CanvasRenderer;
  private readonly camera: Camera;
  private readonly background = new BackgroundRenderer();
  private readonly entities = new EntityRenderer();
  private readonly debug: DebugRenderer;
  private readonly getInput: () => PlayerInput;
  private readonly debugConfig: DebugConfig;
  private frames = 0;
  private fpsEstimate = 60;

  constructor(
    level: LevelDefinition,
    renderer: CanvasRenderer,
    debugConfig: DebugConfig,
    getInput: () => PlayerInput,
  ) {
    this.world = new GameWorld(level);
    this.renderer = renderer;
    this.camera = renderer.camera;
    this.debugConfig = debugConfig;
    this.debug = new DebugRenderer();
    this.getInput = getInput;
  }

  enter(): void {
    this.camera.setBounds({
      minX: this.world.level.camera.minX,
      maxX: this.world.level.camera.maxX,
      minY: this.world.level.camera.minY,
      maxY: this.world.level.camera.maxY,
    });
    this.camera.snapTo(this.world.player.x, this.world.player.y);
    this.world.start();
  }

  update(deltaSeconds: number): void {
    this.world.step(deltaSeconds, this.getInput());
    this.camera.update(deltaSeconds);
    this.camera.follow(
      this.world.player.x,
      this.world.player.y,
      this.world.player.vx,
      deltaSeconds,
    );
    this.frames++;
    if (this.frames % 30 === 0) {
      this.fpsEstimate = 1 / deltaSeconds;
    }
  }

  render(_alpha: number): void {
    const r = this.renderer.context;
    this.renderer.beginFrame();

    // World layers.
    const time = this.world.elapsedSeconds;
    this.background.render(r, this.world.level.world);
    r.applyCameraTransform();
    for (const platform of this.world.platforms) {
      this.entities.drawPlatform(r, {
        x: platform.rect.x,
        y: platform.rect.y,
        width: platform.rect.width,
        height: platform.rect.height,
        material: platform.material,
        kind: platform.oneWay ? "one-way" : "static",
      });
    }
    for (const hazard of this.world.hazards) {
      this.entities.drawHazard(r, hazard);
    }
    for (const checkpoint of this.world.checkpoints) {
      this.entities.drawCheckpoint(r, checkpoint);
    }
    if (this.world.exit) {
      this.entities.drawExit(r, this.world.exit, time);
    }
    for (const collectible of this.world.collectibles) {
      this.entities.drawCollectible(r, collectible, time);
    }
    const p = this.world.player;
    this.entities.drawPlayer(r, {
      x: p.x,
      y: p.y,
      radius: p.radius,
      velocityX: p.vx,
      velocityY: p.vy,
      squash: p.squashFactor(),
      facing: p.facing,
      invulnerable: p.invulnerability > 0,
      dead: p.state === "dead",
      phase: p.bounceCount,
    });

    // Screen-space HUD.
    r.applyScreenTransform();
    r.fillTextScreen(this.world.level.name.toUpperCase(), 4, 4, "#f4f4f4", 8);
    r.fillTextScreen(
      `RINGS ${this.world.collectiblesFound}/${this.world.collectiblesTotal}`,
      4,
      14,
      PALETTE.ring,
      8,
    );
    r.fillTextScreen(`SCORE ${this.world.score}`, r.logicalWidth - 70, 4, "#f4f4f4", 8);
    r.fillTextScreen(
      `LIVES ${Math.max(0, this.world.lives)}`,
      r.logicalWidth - 70,
      14,
      PALETTE.heart,
      8,
    );
    if (this.world.hasKey) {
      r.fillTextScreen("KEY", 4, 24, PALETTE.key, 8);
    }
    if (this.world.completed && this.world.result) {
      const result = this.world.result;
      const { ctx } = r;
      ctx.fillStyle = "rgba(10,12,24,0.82)";
      const bx = r.logicalWidth / 2 - 70;
      const by = r.logicalHeight / 2 - 40;
      ctx.fillRect(bx, by, 140, 80);
      ctx.strokeStyle = "#4fd66d";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, 140, 80);
      r.fillTextScreen("LEVEL COMPLETE", bx + 26, by + 8, "#4fd66d", 10);
      r.fillTextScreen(`SCORE ${result.score}`, bx + 12, by + 26, "#f4f4f4", 8);
      r.fillTextScreen(
        `RINGS ${result.collectiblesFound}/${result.collectiblesTotal}`,
        bx + 12,
        by + 37,
        PALETTE.ring,
        8,
      );
      r.fillTextScreen(`DEATHS ${result.deaths}`, bx + 12, by + 48, "#f4f4f4", 8);
      r.fillTextScreen(
        `TIME ${result.completionTimeSeconds.toFixed(1)}s`,
        bx + 12,
        by + 59,
        "#f4f4f4",
        8,
      );
      r.fillTextScreen("ENTER: NEXT LEVEL", bx + 22, by + 70, "rgba(244,244,244,0.7)", 6);
    }

    // Debug overlay (development only).
    this.debug.enabled = this.debugConfig.enabled;
    this.debug.renderShapes(
      r,
      this.world.platforms.map((platform) => ({ kind: "rect" as const, ...platform.rect })),
    );
    if (this.world.platforms.length > 0) {
      this.debug.renderShapes(r, [{ kind: "circle", x: p.x, y: p.y, radius: p.radius }]);
    }
    this.debug.renderInfo(r, {
      fps: this.fpsEstimate,
      tick: this.world.tick,
      state: this.world.player.state,
      levelId: this.world.level.id,
      entityId: this.world.platforms.length + 1,
      playerX: p.x,
      playerY: p.y,
      velocityX: p.vx,
      velocityY: p.vy,
    });
  }

  exit(): void {
    // Nothing to dispose yet; scene recreation resets all transient state.
  }
}
