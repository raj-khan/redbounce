/** Procedural sound design parameters (spec section 23). All original. */

export type SoundId =
  | "bounce"
  | "pickup-ring"
  | "pickup-star"
  | "pickup-key"
  | "pickup-heart"
  | "damage"
  | "death"
  | "checkpoint"
  | "level-complete"
  | "menu-move"
  | "menu-confirm"
  | "hazard-warning";

export type PlaySfxOptions = {
  /** 0..1 intensity used by some sounds (e.g. bounce volume by speed). */
  intensity?: number;
};

type SfxSpec = {
  type: OscillatorType;
  fromHz: number;
  toHz: number;
  durationSeconds: number;
  gain: number;
  /** Optional second layer. */
  layer?: { type: OscillatorType; fromHz: number; toHz: number; delay: number };
  /** Additional sequential notes (arpeggios / fanfares). */
  sequence?: number[];
  noteDuration?: number;
};

export const SFX: Record<SoundId, SfxSpec> = {
  bounce: { type: "sine", fromHz: 240, toHz: 180, durationSeconds: 0.09, gain: 0.5 },
  "pickup-ring": {
    type: "square",
    fromHz: 880,
    toHz: 880,
    durationSeconds: 0.07,
    gain: 0.25,
    sequence: [1174],
    noteDuration: 0.09,
  },
  "pickup-star": {
    type: "square",
    fromHz: 660,
    toHz: 660,
    durationSeconds: 0.08,
    gain: 0.25,
    sequence: [880, 1320],
    noteDuration: 0.08,
  },
  "pickup-key": {
    type: "triangle",
    fromHz: 520,
    toHz: 780,
    durationSeconds: 0.12,
    gain: 0.35,
  },
  "pickup-heart": {
    type: "triangle",
    fromHz: 660,
    toHz: 990,
    durationSeconds: 0.14,
    gain: 0.35,
  },
  damage: { type: "sawtooth", fromHz: 300, toHz: 120, durationSeconds: 0.18, gain: 0.4 },
  death: { type: "sawtooth", fromHz: 400, toHz: 60, durationSeconds: 0.5, gain: 0.5 },
  checkpoint: {
    type: "sine",
    fromHz: 660,
    toHz: 660,
    durationSeconds: 0.1,
    gain: 0.35,
    sequence: [880],
    noteDuration: 0.14,
  },
  "level-complete": {
    type: "square",
    fromHz: 523,
    toHz: 523,
    durationSeconds: 0.12,
    gain: 0.3,
    sequence: [659, 784, 1047],
    noteDuration: 0.12,
  },
  "menu-move": { type: "square", fromHz: 440, toHz: 440, durationSeconds: 0.04, gain: 0.15 },
  "menu-confirm": { type: "square", fromHz: 587, toHz: 784, durationSeconds: 0.09, gain: 0.25 },
  "hazard-warning": { type: "square", fromHz: 220, toHz: 220, durationSeconds: 0.06, gain: 0.2 },
};

/** Simple original music loop (bass + melody) per world mood. */
export const MUSIC_TRACKS: Record<string, { bass: number[]; melody: number[]; bpm: number }> = {
  meadow: {
    bass: [130.8, 130.8, 98.0, 98.0],
    melody: [523.3, 659.3, 587.3, 493.9, 523.3, 659.3, 784.0, 659.3],
    bpm: 112,
  },
  cave: {
    bass: [87.3, 87.3, 82.4, 87.3],
    melody: [349.2, 415.3, 349.2, 311.1, 349.2, 466.2, 415.3, 349.2],
    bpm: 96,
  },
  factory: {
    bass: [110.0, 110.0, 116.5, 110.0],
    melody: [440.0, 440.0, 523.3, 440.0, 392.0, 440.0, 587.3, 523.3],
    bpm: 128,
  },
  sky: {
    bass: [146.8, 123.5, 130.8, 116.5],
    melody: [587.3, 698.5, 659.3, 587.3, 523.3, 587.3, 784.0, 698.5],
    bpm: 120,
  },
  core: {
    bass: [98.0, 103.8, 98.0, 92.5],
    melody: [392.0, 466.2, 415.3, 392.0, 349.2, 392.0, 587.3, 523.3],
    bpm: 140,
  },
};
