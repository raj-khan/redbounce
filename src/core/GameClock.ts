/**
 * Game clock with pause support and injectable time source (spec section 8).
 *
 * The clock only advances while running. Tests inject a deterministic
 * `now()` provider so simulation tests never depend on real time.
 */
export class GameClock {
  private nowProvider: () => number;
  private lastNow = 0;
  private accumulatedPaused = 0;
  private running = false;

  constructor(now: () => number = () => performance.now()) {
    this.nowProvider = now;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastNow = this.nowProvider();
  }

  /** Advance one frame; returns the clamped elapsed seconds since last tick. */
  tick(maxDeltaSeconds = 0.25): number {
    if (!this.running) return 0;
    const now = this.nowProvider();
    const deltaMs = Math.max(0, now - this.lastNow);
    this.lastNow = now;
    return Math.min(deltaMs / 1000, maxDeltaSeconds);
  }

  pause(): void {
    this.running = false;
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.lastNow = this.nowProvider();
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Milliseconds of real time spent paused (diagnostics). */
  pausedFor(): number {
    return this.accumulatedPaused;
  }
}
