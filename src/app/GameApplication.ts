import { GameLoop } from "../core/GameLoop";
import { GameStateMachine } from "../core/GameStateMachine";
import { SceneManager } from "../core/SceneManager";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { PlayScene } from "./PlayScene";
import { level01 } from "../levels/Level";
import { LevelRegistry } from "../levels/LevelRegistry";
import { LevelLoader } from "../levels/LevelLoader";
import { LocalStorageSaveRepository } from "../save/LocalStorageSaveRepository";
import type { SaveRepository } from "../save/SaveRepository";
import type { SaveData } from "../save/SaveData";
import { createDebugConfig, isDevBuild } from "../debug/DebugConfig";
import type { PlayerInput } from "../entities/Player";
import { PHYSICS_CONFIG } from "../config/physics.config";

/**
 * Application shell (spec section 4): wires the loop, state machine,
 * scenes, input, and canvas into a running game.
 */
export class GameApplication {
  private readonly renderer: CanvasRenderer;
  private readonly states = new GameStateMachine("booting");
  private readonly scenes = new SceneManager();
  private readonly loop: GameLoop;
  private readonly debugConfig = createDebugConfig();
  private readonly keys = new Set<string>();
  private readonly uiRoot: HTMLElement;
  private readonly registry = new LevelRegistry();
  private readonly loader: LevelLoader;
  private readonly saves: SaveRepository;
  private save: SaveData | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.uiRoot = uiRoot;
    this.registry.register(level01);
    this.loader = new LevelLoader(this.registry);
    this.saves = LocalStorageSaveRepository.create(level01.id);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.loop = new GameLoop({
      update: (dt) => this.scenes.update(dt),
      render: (alpha) => this.scenes.render(alpha),
      fixedDeltaSeconds: PHYSICS_CONFIG.fixedDeltaSeconds,
      onPause: () => void this.states.transition("paused"),
      onResume: () => {
        if (this.states.current() === "paused") this.states.transition("playing");
      },
    });
  }

  start(): void {
    this.uiRoot.dataset.booted = "true";
    this.states.transition("loading");
    void this.saves.load().then((save) => {
      this.save = save;
      return this.startLevel(this.registry.first()?.id ?? level01.id);
    });
  }

  private async startLevel(levelId: string): Promise<void> {
    const level = await this.loader.load(levelId);
    const play = new PlayScene(level, this.renderer, this.debugConfig, () => this.inputSnapshot());
    play.world.events.on("level-completed", ({ levelId: id }) => void this.handleCompletion(id));
    // Re-register so the factory always returns the newest scene.
    this.scenes.register("play", () => play);
    await this.scenes.switchTo("play");
    this.states.transition("playing");
    if (!this.loop.isRunning()) this.loop.start();
  }

  private async handleCompletion(levelId: string): Promise<void> {
    const scene = this.scenes.current();
    if (!(scene instanceof PlayScene) || !scene.world.result) return;
    if (!this.save) return;
    this.save.completedLevels[levelId] = scene.world.result;
    const next = this.registry.next(levelId);
    if (next && !this.save.unlockedLevels.includes(next.id)) {
      this.save.unlockedLevels.push(next.id);
    }
    this.save.updatedAt = Date.now();
    await this.saves.save(this.save);
  }

  /** Enter after completion: advance to the next unlocked level. */
  private async advanceLevel(): Promise<void> {
    const scene = this.scenes.current();
    if (!(scene instanceof PlayScene) || !scene.world.completed) return;
    const currentId = scene.world.level.id;
    const next = this.registry.next(currentId);
    const target = next ? next.id : this.registry.first()?.id;
    if (!target) return;
    if (this.states.current() === "playing") this.states.transition("level-complete");
    await this.startLevel(target);
  }

  stop(): void {
    this.disposed = true;
    this.loop.stop();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  /** Snapshot consumed by the simulation (spec section 22). */
  inputSnapshot(): PlayerInput {
    return {
      left: this.keys.has("ArrowLeft") || this.keys.has("KeyA"),
      right: this.keys.has("ArrowRight") || this.keys.has("KeyD"),
    };
  }

  private onResize = (): void => {
    this.renderer.resize();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.code === "KeyR" && this.states.current() === "playing") {
      this.restartLevel();
    }
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      void this.advanceLevel();
    }
    if (event.code === "F3" && isDevBuild()) {
      this.debugConfig.enabled = !this.debugConfig.enabled;
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private restartLevel(): void {
    const scene = this.scenes.current();
    if (scene instanceof PlayScene) {
      scene.world.reset();
      this.renderer.camera.snapTo(scene.world.player.x, scene.world.player.y);
    }
  }
}
