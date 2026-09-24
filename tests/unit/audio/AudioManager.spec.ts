import { describe, expect, it, vi } from "vitest";
import { AudioManager, type AudioContextLike } from "../../../src/audio/AudioManager";

/** Fake Web Audio graph recording node activity. */
class FakeAudioContext implements AudioContextLike {
  readonly destination = { connectCount: 0 } as unknown as AudioNode;
  currentTime = 0;
  state = "running";
  gainCount = 0;
  oscillatorCount = 0;
  started: number[] = [];
  resumed = 0;

  createGain(): GainNode {
    this.gainCount++;
    return {
      gain: { value: 0 },
      connect: () => {},
    } as unknown as GainNode;
  }
  createOscillator(): OscillatorNode {
    this.oscillatorCount++;
    const started = this.started;
    return {
      type: "sine",
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
      start(when: number) {
        started.push(when);
      },
      stop: () => {},
    } as unknown as OscillatorNode;
  }
  async resume(): Promise<void> {
    this.resumed++;
  }
}

function makeManager() {
  const ctx = new FakeAudioContext();
  let created = 0;
  const manager = new AudioManager(() => {
    created++;
    return ctx;
  });
  return { manager, ctx, createdCount: () => created };
}

describe("AudioManager", () => {
  it("does nothing before unlock (autoplay restriction)", () => {
    const { manager, ctx } = makeManager();
    manager.playSfx("bounce");
    manager.playMusic("meadow");
    expect(ctx.oscillatorCount).toBe(0);
    expect(manager.isUnlocked()).toBe(false);
  });

  it("unlock creates the audio graph once", async () => {
    const { manager, ctx, createdCount } = makeManager();
    await manager.unlock();
    await manager.unlock(); // idempotent
    expect(createdCount()).toBe(1);
    expect(ctx.gainCount).toBe(3); // master + music + sfx
    expect(manager.isUnlocked()).toBe(true);
  });

  it("unlock failure degrades to silent no-op", async () => {
    const manager = new AudioManager(() => {
      throw new Error("no audio");
    });
    await expect(manager.unlock()).resolves.toBeUndefined();
    expect(manager.isUnlocked()).toBe(false);
    expect(() => manager.playSfx("bounce")).not.toThrow();
  });

  it("playSfx schedules oscillators after unlock", async () => {
    const { manager, ctx } = makeManager();
    await manager.unlock();
    const before = ctx.oscillatorCount;
    manager.playSfx("pickup-ring");
    expect(ctx.oscillatorCount).toBeGreaterThan(before);
  });

  it("muted suppresses all sound", async () => {
    const { manager, ctx } = makeManager();
    await manager.unlock();
    manager.setMuted(true);
    const before = ctx.oscillatorCount;
    manager.playSfx("bounce");
    expect(ctx.oscillatorCount).toBe(before);
    expect(manager.isMuted()).toBe(true);
  });

  it("music starts and stops cleanly", async () => {
    const { manager } = makeManager();
    await manager.unlock();
    manager.playMusic("cave");
    expect(manager.isMusicPlaying()).toBe(true);
    manager.stopMusic();
    expect(manager.isMusicPlaying()).toBe(false);
  });

  it("muting stops music", async () => {
    const { manager } = makeManager();
    await manager.unlock();
    manager.playMusic("meadow");
    manager.setMuted(true);
    expect(manager.isMusicPlaying()).toBe(false);
  });

  it("replaying the same track never restarts it (no stutter on input)", async () => {
    vi.useFakeTimers();
    try {
      const { manager, ctx } = makeManager();
      await manager.unlock();
      manager.playMusic("meadow");
      expect(manager.isMusicPlaying()).toBe(true);

      // Let the sequencer advance a few steps.
      vi.advanceTimersByTime(2000);
      const stepBefore = manager.sequencerStep();
      expect(stepBefore).toBeGreaterThan(2);

      // Simulate the old bug path: keydown re-triggers playMusic for the
      // same track. The step counter must continue, not reset to 0.
      manager.playMusic("meadow");
      expect(manager.sequencerStep()).toBe(stepBefore);
      vi.advanceTimersByTime(500);
      expect(manager.sequencerStep()).toBeGreaterThan(stepBefore);
      expect(manager.currentTrackName()).toBe("meadow");
      void ctx;
    } finally {
      vi.useRealTimers();
    }
  });

  it("switching to a different track restarts the sequencer", async () => {
    vi.useFakeTimers();
    try {
      const { manager } = makeManager();
      await manager.unlock();
      manager.playMusic("meadow");
      vi.advanceTimersByTime(2000);
      expect(manager.sequencerStep()).toBeGreaterThan(2);

      manager.playMusic("cave");
      expect(manager.sequencerStep()).toBe(0);
      expect(manager.currentTrackName()).toBe("cave");
    } finally {
      vi.useRealTimers();
    }
  });

  it("volume setters clamp to [0, 1]", () => {
    const { manager } = makeManager();
    manager.setMasterVolume(5);
    manager.setMusicVolume(-1);
    manager.setSfxVolume(0.5);
    const v = manager.getVolumes();
    expect(v.master).toBe(1);
    expect(v.music).toBe(0);
    expect(v.sfx).toBe(0.5);
  });

  it("unknown music tracks fall back to meadow", async () => {
    const { manager } = makeManager();
    await manager.unlock();
    expect(() => manager.playMusic("does-not-exist")).not.toThrow();
    manager.stopMusic();
  });
});
