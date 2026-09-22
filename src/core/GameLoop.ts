import { GameClock } from "./GameClock";

/**
 * Main loop with a fixed simulation timestep (spec section 8).
 *
 * - Rendering: variable frame rate via requestAnimationFrame.
 * - Simulation: fixed 60 Hz steps driven by an accumulator.
 * - Large frame gaps are clamped to avoid the spiral of death.
 * - The loop auto-pauses when the document becomes hidden.
 * - Frame scheduling is injectable for deterministic tests.
 */
export type GameLoopOptions = {
  update: (deltaSeconds: number) => void;
  render: (alpha: number) => void;
  fixedDeltaSeconds?: number;
  maxDeltaSeconds?: number;
  now?: () => number;
  scheduleFrame?: (callback: () => void) => void;
  pauseWhenHidden?: boolean;
  onPause?: () => void;
  onResume?: () => void;
};

export class GameLoop {
  static readonly DEFAULT_FIXED_DELTA = 1 / 60;

  private readonly clock: GameClock;
  private readonly fixedDelta: number;
  private readonly maxDelta: number;
  private readonly update: (deltaSeconds: number) => void;
  private readonly render: (alpha: number) => void;
  private readonly scheduleFrame: (callback: () => void) => void;
  private readonly pauseWhenHidden: boolean;
  private readonly onPause?: () => void;
  private readonly onResume?: () => void;

  private accumulator = 0;
  private frameHandle: number | null = null;
  private visibilityHandler: (() => void) | null = null;
  private running = false;
  private paused = false;

  constructor(options: GameLoopOptions) {
    this.update = options.update;
    this.render = options.render;
    this.fixedDelta = options.fixedDeltaSeconds ?? GameLoop.DEFAULT_FIXED_DELTA;
    this.maxDelta = options.maxDeltaSeconds ?? 0.25;
    this.clock = new GameClock(options.now ?? (() => performance.now()));
    this.scheduleFrame = options.scheduleFrame ?? ((cb) => requestAnimationFrame(cb));
    this.pauseWhenHidden = options.pauseWhenHidden ?? true;
    this.onPause = options.onPause;
    this.onResume = options.onResume;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    if (this.pauseWhenHidden && typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
    this.scheduleFrame(() => this.frame());
  }

  stop(): void {
    this.running = false;
    this.frameHandle = null;
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.clock.pause();
    this.accumulator = 0;
    this.onPause?.();
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.clock.resume();
    this.onResume?.();
  }

  isPaused(): boolean {
    return this.paused;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** One variable-rate frame: accumulate time, run fixed updates, render. */
  private frame(): void {
    if (!this.running) return;
    if (!this.paused) {
      const elapsed = this.clock.tick(this.maxDelta);
      this.accumulator += elapsed;
      while (this.accumulator >= this.fixedDelta) {
        this.update(this.fixedDelta);
        this.accumulator -= this.fixedDelta;
      }
      const alpha = this.accumulator / this.fixedDelta;
      this.render(alpha);
    }
    this.scheduleFrame(() => this.frame());
  }
}
