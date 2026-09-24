import { GameLoop } from "../core/GameLoop";
import { GameStateMachine } from "../core/GameStateMachine";
import { SceneManager } from "../core/SceneManager";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { BackgroundRenderer } from "../rendering/BackgroundRenderer";
import { PlayScene } from "./PlayScene";
import { level01 } from "../levels/Level";
import { ALL_LEVELS } from "../levels/levels";
import { LevelRegistry } from "../levels/LevelRegistry";
import { LevelLoader } from "../levels/LevelLoader";
import { LocalStorageSaveRepository } from "../save/LocalStorageSaveRepository";
import type { SaveRepository } from "../save/SaveRepository";
import type { SaveData } from "../save/SaveData";
import { InputManager } from "../input/InputManager";
import type { PlayerInput } from "../entities/Player";
import { AudioManager } from "../audio/AudioManager";
import type { SoundId } from "../audio/SoundEffect";
import { UiManager, type LevelSelectEntry } from "../ui/UiManager";
import { PHYSICS_CONFIG } from "../config/physics.config";
import { createDebugConfig, isDevBuild } from "../debug/DebugConfig";

/**
 * Application shell (spec section 4): wires the loop, state machine,
 * scenes, input, audio, UI, and persistence into a running game.
 */
export class GameApplication {
  private readonly renderer: CanvasRenderer;
  private readonly uiRootElement: HTMLElement;
  private readonly states = new GameStateMachine("booting");
  private readonly scenes = new SceneManager();
  private readonly registry = new LevelRegistry();
  private readonly loader: LevelLoader;
  private readonly saves: SaveRepository;
  private readonly input: InputManager;
  private readonly audio = new AudioManager();
  private readonly ui: UiManager;
  private readonly debugConfig = createDebugConfig();
  private save: SaveData | null = null;
  private disposed = false;
  private currentInput: PlayerInput = { left: false, right: false };

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.uiRootElement = uiRoot;
    for (const level of ALL_LEVELS) this.registry.register(level);
    this.loader = new LevelLoader(this.registry);
    this.saves = LocalStorageSaveRepository.create(level01.id);
    this.input = InputManager.createForBrowser(document);
    this.ui = new UiManager(uiRoot, {
      onStart: () => void this.startFirstLevel(),
      onLevelPick: (levelId) => void this.startLevel(levelId),
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartFromMenu(),
      onMainMenu: () => this.toMainMenu(),
      onNextLevel: () => void this.advanceLevel(),
      onSettingsChanged: (settings) => void this.applySettings(settings),
      onResetSave: () => void this.resetSave(),
    });
    this.ui.onLevelSelectRequest(() => this.showLevelSelect());

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointerdown", this.unlockAudio, { passive: true });
    window.addEventListener("keydown", this.unlockAudio);

    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: (alpha) => this.scenes.render(alpha),
      fixedDeltaSeconds: PHYSICS_CONFIG.fixedDeltaSeconds,
      onPause: () => this.pauseGame(),
      onResume: () => this.resumeGame(),
    });
  }
  private readonly loop: GameLoop;

  start(): void {
    this.uiRootElement.dataset.booted = "true";
    this.states.transition("loading");
    void this.saves.load().then((save) => {
      this.save = save;
      this.applyAudioSettings(save);
      this.input.setTouchEnabled(save.settings.touchControls);
      this.states.transition("main-menu");
      this.drawTitleScreen();
      this.ui.showMainMenu(save);
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

  private get uiRoot(): HTMLElement {
    return this.uiRootElement;
  }

  // -----------------------------------------------------------------------
  // Frame handling
  // -----------------------------------------------------------------------

  private update(deltaSeconds: number): void {
    const snapshot = this.input.getSnapshot();
    this.currentInput = { left: snapshot.left, right: snapshot.right };

    if (snapshot.pausePressed) {
      if (this.states.current() === "playing") this.pauseGame();
      else if (this.states.current() === "paused") this.resumeGame();
    }
    if (snapshot.restartPressed && this.states.current() === "playing") this.restartLevel();
    if (snapshot.mutePressed) this.toggleMute();
    if (snapshot.debugPressed && isDevBuild()) {
      this.debugConfig.enabled = !this.debugConfig.enabled;
    }
    if (snapshot.confirmPressed) void this.advanceLevel();

    this.scenes.update(deltaSeconds);
  }

  inputSnapshot(): PlayerInput {
    return this.currentInput;
  }

  // -----------------------------------------------------------------------
  // Pause / menus
  // -----------------------------------------------------------------------

  private pauseGame(): void {
    if (this.states.current() !== "playing") return;
    this.states.transition("paused");
    this.loop.pause();
    this.audio.stopMusic();
    this.ui.showPause();
  }

  private resumeGame(): void {
    if (this.states.current() !== "paused") return;
    this.ui.hideAll();
    this.states.transition("playing");
    this.loop.resume();
    if (this.audio.isUnlocked() && !this.audio.isMuted()) this.startLevelMusic();
  }

  private restartFromMenu(): void {
    this.ui.hideAll();
    if (this.states.current() === "paused") {
      this.states.transition("playing");
      this.loop.resume();
    }
    this.restartLevel();
  }

  private toMainMenu(): void {
    this.ui.hideAll();
    this.loop.stop();
    this.audio.stopMusic();
    if (this.states.current() === "playing" || this.states.current() === "paused") {
      this.states.transition("main-menu");
    }
    if (this.save) this.ui.showMainMenu(this.save);
    this.drawTitleScreen();
  }

  private showLevelSelect(): void {
    if (!this.save) return;
    const entries: LevelSelectEntry[] = this.registry.all().map((level) => ({
      id: level.id,
      name: level.name,
      world: level.world,
      unlocked: this.save!.unlockedLevels.includes(level.id),
      result: this.save!.completedLevels[level.id] ?? null,
    }));
    this.ui.hideAll();
    this.ui.showLevelSelect(entries, this.save);
  }

  private async startFirstLevel(): Promise<void> {
    this.ui.hideAll();
    // Continue at the furthest unlocked level.
    const target = [...this.registry.all()]
      .reverse()
      .find((level) => this.save?.unlockedLevels.includes(level.id));
    await this.startLevel(target?.id ?? level01.id);
  }

  private toggleMute(): void {
    const muted = !this.audio.isMuted();
    this.audio.setMuted(muted);
    if (this.save) {
      this.save.settings.muted = muted;
      void this.saves.save(this.save);
    }
  }

  private async applySettings(settings: SaveData["settings"]): Promise<void> {
    this.audio.setMasterVolume(settings.masterVolume);
    this.audio.setMusicVolume(settings.musicVolume);
    this.audio.setSfxVolume(settings.sfxVolume);
    this.audio.setMuted(settings.muted);
    this.input.setTouchEnabled(settings.touchControls);
    if (this.save) {
      this.save.settings = { ...settings };
      await this.saves.save(this.save);
    }
  }

  private async resetSave(): Promise<void> {
    await this.saves.reset();
    this.save = await this.saves.load();
    this.applyAudioSettings(this.save);
    this.ui.announce("Save data cleared");
    this.ui.showMainMenu(this.save);
  }

  private unlockAudio = (): void => {
    if (this.audio.isUnlocked()) return; // one-time gesture unlock
    void this.audio.unlock().then(() => {
      window.removeEventListener("pointerdown", this.unlockAudio);
      window.removeEventListener("keydown", this.unlockAudio);
      if (!this.audio.isMuted() && this.states.current() === "playing") this.startLevelMusic();
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
    this.ui.hideAll();
    if (!this.save?.unlockedLevels.includes(levelId)) return;
    const level = await this.loader.load(levelId);
    const play = new PlayScene(level, this.renderer, this.debugConfig, () => this.inputSnapshot());
    this.wireScene(play);
    this.scenes.register("play", () => play);
    await this.scenes.switchTo("play");
    if (this.states.current() === "level-select" || this.states.current() === "main-menu") {
      this.states.transition("playing");
    }
    if (!this.loop.isRunning()) this.loop.start();
    else if (this.loop.isPaused()) this.loop.resume();
    if (this.audio.isUnlocked() && !this.audio.isMuted()) this.startLevelMusic();
  }

  private wireScene(play: PlayScene): void {
    play.world.events.on("sound-requested", ({ soundId }) => {
      this.audio.playSfx(soundId as SoundId);
    });
    play.world.events.on("player-bounced", () => {
      this.audio.playSfx("bounce", { intensity: 0.8 });
    });
    play.world.events.on("player-died", () => {
      this.ui.showDeath();
    });
    play.world.events.on("level-completed", ({ levelId }) => {
      void this.handleCompletion(levelId);
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
    this.ui.showCompletion(scene.world.result, Boolean(next));
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
      this.renderer.camera.snapTo(scene.world.player.x, scene.world.player.lastGroundY);
    }
  }

  // -----------------------------------------------------------------------
  // Canvas helpers
  // -----------------------------------------------------------------------

  private drawTitleScreen(): void {
    const r = this.renderer.context;
    this.renderer.beginFrame();
    new BackgroundRenderer().render(r, "meadow");
    r.applyScreenTransform();
    const { ctx } = r;
    ctx.fillStyle = "#ef7d57";
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("REDBOUNCE", r.logicalWidth / 2, r.logicalHeight / 2 - 10);
    ctx.fillStyle = "rgba(244,244,244,0.7)";
    ctx.font = "8px monospace";
    ctx.fillText("a bouncing adventure", r.logicalWidth / 2, r.logicalHeight / 2 + 10);
  }

  private onResize = (): void => {
    this.renderer.resize();
  };
}
