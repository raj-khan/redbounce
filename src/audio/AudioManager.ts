import { MUSIC_TRACKS, SFX, type SoundId } from "./SoundEffect";

/** Minimal audio-context surface so tests can inject a fake. */
export interface AudioContextLike {
  readonly destination: AudioNode;
  readonly currentTime: number;
  readonly state: string;
  createGain(): GainNode;
  createOscillator(): OscillatorNode;
  resume(): Promise<void>;
}

export type AudioContextFactory = () => AudioContextLike;

export type PlaySfxOptions = { intensity?: number };
export type PlayMusicOptions = { world?: string };

/**
 * Web Audio manager (spec section 23).
 *
 * - Unlocks on the first user gesture (autoplay restrictions).
 * - Master / music / SFX gain staging with mute.
 * - Procedural synthesis: zero audio assets, all sounds original.
 * - Any audio failure degrades to silence; gameplay never breaks.
 */
export class AudioManager {
  private context: AudioContextLike | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private readonly factory: AudioContextFactory;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private musicTrackName = "meadow";
  private volumes = { master: 0.8, music: 0.6, sfx: 0.9 };
  private muted = false;

  constructor(factory?: AudioContextFactory) {
    this.factory = factory ?? (() => new AudioContext());
  }

  /** Must be called from a user gesture; safe to call repeatedly. */
  async unlock(): Promise<void> {
    if (this.context) {
      if (this.context.state === "suspended") await this.context.resume().catch(() => undefined);
      return;
    }
    try {
      this.context = this.factory();
      if (this.context.state === "suspended") await this.context.resume().catch(() => undefined);
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
      this.applyVolumes();
    } catch {
      this.context = null; // Audio unavailable: keep playing silently.
    }
  }

  isUnlocked(): boolean {
    return this.context !== null;
  }

  playSfx(id: SoundId, options: PlaySfxOptions = {}): void {
    const ctx = this.context;
    if (!ctx || !this.sfxGain || this.muted) return;
    try {
      const spec = SFX[id];
      const gain = spec.gain * (options.intensity ?? 1);
      this.tone(
        ctx,
        this.sfxGain,
        spec.type,
        spec.fromHz,
        spec.toHz,
        0,
        spec.durationSeconds,
        gain,
      );
      if (spec.sequence) {
        const noteDuration = spec.noteDuration ?? 0.1;
        for (const [i, note] of spec.sequence.entries()) {
          this.tone(
            ctx,
            this.sfxGain,
            spec.type,
            note,
            note,
            (i + 1) * noteDuration,
            noteDuration,
            gain,
          );
        }
      }
    } catch {
      // Never let a failed sound stop gameplay (spec section 31).
    }
  }

  playMusic(trackName = "meadow", _options: PlayMusicOptions = {}): void {
    if (!this.context || !this.musicGain || this.muted) return;
    // Never restart a track that is already playing (spec section 23:
    // music must not stutter on input or re-entry).
    if (this.musicTimer !== null && this.musicTrackName === trackName) return;
    this.stopMusic();
    this.musicTrackName = MUSIC_TRACKS[trackName] ? trackName : "meadow";
    const track = MUSIC_TRACKS[this.musicTrackName]!;
    const stepSeconds = 60 / track.bpm / 2;
    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      try {
        const ctx = this.context;
        if (!ctx || !this.musicGain || this.muted) return;
        const step = this.musicStep++;
        const bass = track.bass[Math.floor(step / 2) % track.bass.length]!;
        const melody = track.melody[step % track.melody.length]!;
        if (step % 2 === 0) {
          this.tone(ctx, this.musicGain, "triangle", bass, bass, 0, stepSeconds * 1.8, 0.18);
        }
        this.tone(ctx, this.musicGain, "sine", melody, melody, 0, stepSeconds * 0.9, 0.12);
      } catch {
        // Ignore scheduling failures.
      }
    }, stepSeconds * 1000);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  isMusicPlaying(): boolean {
    return this.musicTimer !== null;
  }

  /** Name of the current track ("" when stopped). */
  currentTrackName(): string {
    return this.musicTimer !== null ? this.musicTrackName : "";
  }

  /** Sequencer step index; exposed for tests. */
  sequencerStep(): number {
    return this.musicStep;
  }

  setMasterVolume(value: number): void {
    this.volumes.master = clamp01(value);
    this.applyVolumes();
  }

  setMusicVolume(value: number): void {
    this.volumes.music = clamp01(value);
    this.applyVolumes();
  }

  setSfxVolume(value: number): void {
    this.volumes.sfx = clamp01(value);
    this.applyVolumes();
  }

  getVolumes(): { master: number; music: number; sfx: number } {
    return { ...this.volumes };
  }

  setMuted(value: boolean): void {
    this.muted = value;
    this.applyVolumes();
    if (value) this.stopMusic();
  }

  isMuted(): boolean {
    return this.muted;
  }

  private applyVolumes(): void {
    if (!this.masterGain || !this.musicGain || !this.sfxGain) return;
    const master = this.muted ? 0 : this.volumes.master;
    this.masterGain.gain.value = master;
    this.musicGain.gain.value = this.volumes.music;
    this.sfxGain.gain.value = this.volumes.sfx;
  }

  private tone(
    ctx: AudioContextLike,
    destination: AudioNode,
    type: OscillatorType,
    fromHz: number,
    toHz: number,
    delaySeconds: number,
    durationSeconds: number,
    gain: number,
  ): void {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const start = ctx.currentTime + delaySeconds;
    osc.type = type;
    osc.frequency.setValueAtTime(fromHz, start);
    if (toHz !== fromHz)
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, toHz), start + durationSeconds);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds);
    osc.connect(env);
    env.connect(destination);
    osc.start(start);
    osc.stop(start + durationSeconds + 0.02);
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
