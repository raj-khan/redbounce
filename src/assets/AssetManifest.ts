/**
 * Asset manifest (spec section 21).
 *
 * RedBounce uses 100% original, procedurally generated assets:
 * visuals are drawn with Canvas 2D primitives at runtime and audio is
 * synthesized with the Web Audio API. No binary assets ship with the
 * game, so nothing can be missing or stolen; every entry below lists
 * its generator module as the fallback source.
 */
export type AssetEntry = {
  id: string;
  kind: "visual" | "audio";
  description: string;
  generatedBy: string;
};

export const ASSET_MANIFEST: readonly AssetEntry[] = [
  {
    id: "player-ball",
    kind: "visual",
    description: "Red ball with squash and stretch",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "platforms",
    kind: "visual",
    description: "Grass, stone, ice, metal, wood tiles",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "collectibles",
    kind: "visual",
    description: "Ring, star, key, heart pickups",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "hazards",
    kind: "visual",
    description: "Spikes, lava, saw, laser, falling rock",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "enemies",
    kind: "visual",
    description: "Patroller slime, chaser blob, orbital orb",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "checkpoints-exit",
    kind: "visual",
    description: "Checkpoint flags, exit portal",
    generatedBy: "src/rendering/EntityRenderer.ts",
  },
  {
    id: "backgrounds",
    kind: "visual",
    description: "Per-world skies and parallax hills",
    generatedBy: "src/rendering/BackgroundRenderer.ts",
  },
  {
    id: "particles",
    kind: "visual",
    description: "Dust, sparkles, bursts, boosts, trails",
    generatedBy: "src/systems/ParticleSystem.ts",
  },
  {
    id: "sfx",
    kind: "audio",
    description: "12 synthesized sound effects",
    generatedBy: "src/audio/SoundEffect.ts",
  },
  {
    id: "music",
    kind: "audio",
    description: "5 per-world music loops",
    generatedBy: "src/audio/SoundEffect.ts",
  },
  {
    id: "icons",
    kind: "visual",
    description: "SVG favicon and PWA icons",
    generatedBy: "public/favicon.svg + tools/generate-icons.mjs",
  },
];

export function assetById(id: string): AssetEntry | undefined {
  return ASSET_MANIFEST.find((entry) => entry.id === id);
}
