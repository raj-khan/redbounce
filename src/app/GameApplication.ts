import { GameLoop } from "../core/GameLoop";
import { GameStateMachine } from "../core/GameStateMachine";
import { SceneManager } from "../core/SceneManager";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { PlayScene } from "./PlayScene";
import { level01 } from "../levels/Level";
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
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.uiRoot = uiRoot;

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
    const play = new PlayScene(level01, this.renderer, this.debugConfig, () =>
      this.inputSnapshot(),
    );
    this.scenes.register("play", () => play);
    void this.scenes.switchTo("play").then(() => {
      this.states.transition("playing");
      this.loop.start();
    });
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
