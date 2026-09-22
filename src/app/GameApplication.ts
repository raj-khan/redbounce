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
import { InputManager } from "../input/InputManager";
import type { PlayerInput } from "../entities/Player";
import { AudioManager } from "../audio/AudioManager";
import type { SoundId } from "../audio/SoundEffect";
import { PHYSICS_CONFIG } from "../config/physics.config";
import { createDebugConfig, isDevBuild } from "../debug/DebugConfig";

/**
 * Application shell (spec section 4): wires the loop, state machine,
 * scenes, input, audio, and persistence into a running game.
 */
export class GameApplication {
  private readonly renderer: CanvasRenderer;
  private readonly states = new GameStateMachine("booting");
  private readonly scenes = new SceneManager();
  private readonly registry = new LevelRegistry();
  private readonly loader: LevelLoader;
  private readonly saves: SaveRepository;
  private readonly input: InputManager;
  private readonly audio = new AudioManager();
  private readonly debugConfig = createDebugConfig();
  private save: SaveData | null = null;
  private disposed = false;
  private currentInput: PlayerInput = { left: false, right: false };

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.uiRoot = uiRoot;
    this.registry.register(level01);
    this.loader = new LevelLoader(this.registry);
    this.saves = LocalStorageSaveRepository.create(level01.id);
    this.input = InputManager.createForBrowser(document);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointerdown", this.unlockAudio, { passive: true });
    window.addEventListener("keydown", this.unlockAudio);

    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: (alpha) => this.scenes.render(alpha),
      fixedDeltaSeconds: PHYSICS_CONFIG.fixedDeltaSeconds,
      onPause: () => {
        if (this.states.current() === "playing") this.states.transition("paused");
        this.drawPauseOverlay();
      },
      onResume: () => {
        if (this.states.current() === "paused") this.states.transition("playing");
      },
    });
  }
  private readonly uiRoot: HTMLElement;
  private readonly loop: GameLoop;

  start(): void {
    this.uiRoot.dataset.booted = "true";
    this.states.transition("loading");
    void this.saves.load().then((save) => {
      this.save = save;
      this.applyAudioSettings(save);
      this.input.setTouchEnabled(save.settings.touchControls);
      return this.startLevel(this.registry.first()?.id ?? level01.id);
    });
  }

  stop(): void {
    this.disposed = true;
    this.loop.stop();
    this.audio.stopMusic();
    this.input.dispose();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointerdown", this.unlockAudio);
    window.removeEventListener("keydown", this.unlockAudio);
  }

  // -----------------------------------------------------------------------
  // Frame handling
  // -----------------------------------------------------------------------

  private update(deltaSeconds: number): void {
    const snapshot = this.input.getSnapshot();
    this.currentInput = { left: snapshot.left, right: snapshot.right };

    if (snapshot.pausePressed) this.togglePause();
    if (snapshot.restartPressed && this.states.current() === "playing") this.restartLevel();
    if (snapshot.mutePressed) this.toggleMute();
    if (snapshot.debugPressed && isDevBuild()) {
      this.debugConfig.enabled = !this.debugConfig.enabled;
    }
    if (snapshot.confirmPressed) void this.advanceLevel();

    this.scenes.update(deltaSeconds);
  }

  /** Snapshot consumed by the simulation (spec section 22). */
  inputSnapshot(): PlayerInput {
    return this.currentInput;
  }

  private togglePause(): void {
    if (this.states.current() === "playing") {
      this.loop.pause();
      this.audio.stopMusic();
    } else if (this.states.current() === "paused") {
      this.loop.resume();
      if (!this.audio.isMuted()) this.startLevelMusic();
    }
  }

  private toggleMute(): void {
    const muted = !this.audio.isMuted();
    this.audio.setMuted(muted);
    if (this.save) {
      this.save.settings.muted = muted;
      void this.saves.save(this.save);
    }
  }

  private unlockAudio = (): void => {
    void this.audio.unlock().then(() => {
      if (!this.audio.isMuted()) this.startLevelMusic();
    });
  };

  private startLevelMusic(): void {
    const scene = this.scenes.current();
    if (scene instanceof PlayScene) {
      this.audio.playMusic(scene.world.level.world);
    }
  }

  private applyAudioSettings(save: SaveData): void {
    const s = save.settings;
    this.audio.setMasterVolume(s.masterVolume);
    this.audio.setMusicVolume(s.musicVolume);
    this.audio.setSfxVolume(s.sfxVolume);
    this.audio.setMuted(s.muted);
  }

  // -----------------------------------------------------------------------
  // Level flow
  // -----------------------------------------------------------------------

  private async startLevel(levelId: string): Promise<void> {
    const level = await this.loader.load(levelId);
    const play = new PlayScene(level, this.renderer, this.debugConfig, () => this.inputSnapshot());
    this.wireSceneSounds(play);
    play.world.events.on("level-completed", ({ levelId: id }) => void this.handleCompletion(id));
    // Re-register so the factory always returns the newest scene.
    this.scenes.register("play", () => play);
    await this.scenes.switchTo("play");
    this.states.transition("playing");
    if (!this.loop.isRunning()) this.loop.start();
    if (this.audio.isUnlocked() && !this.audio.isMuted()) this.startLevelMusic();
  }

  private wireSceneSounds(play: PlayScene): void {
    play.world.events.on("sound-requested", ({ soundId }) => {
      this.audio.playSfx(soundId as SoundId);
    });
    play.world.events.on("player-bounced", () => {
      this.audio.playSfx("bounce", { intensity: 0.8 });
    });
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

  /** Confirm after completion: advance to the next unlocked level. */
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

  private restartLevel(): void {
    const scene = this.scenes.current();
    if (scene instanceof PlayScene) {
      scene.world.reset();
      this.renderer.camera.snapTo(scene.world.player.x, scene.world.player.y);
    }
  }

  private drawPauseOverlay(): void {
    const r = this.renderer.context;
    this.renderer.beginFrame();
    r.applyScreenTransform();
    const { ctx } = r;
    ctx.fillStyle = "rgba(10,12,24,0.6)";
    ctx.fillRect(0, 0, r.logicalWidth, r.logicalHeight);
    r.fillTextScreen("PAUSED", r.logicalWidth / 2 - 22, r.logicalHeight / 2 - 4, "#f4f4f4", 10);
    r.fillTextScreen(
      "P: RESUME  R: RESTART",
      r.logicalWidth / 2 - 46,
      r.logicalHeight / 2 + 10,
      "rgba(244,244,244,0.7)",
      6,
    );
  }

  private onResize = (): void => {
    this.renderer.resize();
  };
}
