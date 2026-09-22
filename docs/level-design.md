# RedBounce Level Design

## Level format

JSON files in `src/levels/` (see `Level` schema). Key fields: `id`, `name`,
`world`, `width`, `height`, `spawn`, `camera` bounds, `requiredCollectibles`,
`entities[]`. Entity types cover platforms, hazards, collectibles, enemies,
checkpoints, and exits.

## Worlds

| World     | Theme                | New mechanics introduced                  |
| --------- | -------------------- | ----------------------------------------- |
| 1 Meadow  | bright grassland     | basics: gaps, rings, spikes, checkpoints  |
| 2 Cave    | dark vertical shafts | moving platforms, falling rocks, climbing |
| 3 Factory | machines             | lasers, saws, breakable platforms, timing |
| 4 Sky     | open air             | wind zones, large gaps, moving platforms  |
| 5 Core    | lava and metal       | all mechanics combined, final challenge   |

## Level list (10 levels, 2 per world)

1. `level-01` Green Valley - intro: move, bounce, first rings
2. `level-02` Ring Ridge - gaps and spikes, first checkpoint
3. `level-03` Echo Caverns - vertical climb, moving platforms
4. `level-04` Falling Deep - falling rocks, narrow passages
5. `level-05` Gear Works - lasers and saws
6. `level-06` Conveyor Line - breakable platforms, timing chains
7. `level-07` Windy Heights - wind zones, large gaps
8. `level-08` Storm Reach - moving platforms over voids
9. `level-09` Molten Core - mixed fast hazards
10. `level-10` The Ascent - multi-stage finale

## Design rules

- Spawn is always safe and validated.
- Every level has at least one exit.
- Required-collectible counts are always achievable.
- Test each level from a fresh save.
- Hazards are readable before they are dangerous.
