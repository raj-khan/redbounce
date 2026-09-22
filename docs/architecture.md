# RedBounce Architecture

Distilled from the full A2Z specification (`bounce_browser_game_a2z_architecture.md`).
That document is the source of truth; this file summarizes the decisions that
govern day-to-day implementation.

## Stack

| Area        | Decision                                            |
| ----------- | --------------------------------------------------- |
| Language    | TypeScript (strict, `noUncheckedIndexedAccess`)     |
| Build       | Vite                                                |
| Renderer    | HTML5 Canvas 2D, logical 320x180 viewport           |
| Physics     | Custom lightweight 2D (circle vs rect)              |
| Loop        | `requestAnimationFrame` + fixed 60 Hz timestep      |
| Input       | Keyboard, touch, action-mapped                      |
| Audio       | Web Audio API, procedural SFX/music, gesture unlock |
| State       | Explicit `GameState` machine                        |
| Levels      | JSON data files, validated before load              |
| Persistence | `localStorage` behind `SaveRepository`              |
| Offline     | Service worker PWA                                  |
| Tests       | Vitest (unit/integration), Playwright (E2E)         |

## Module layout

```
src/
  app/        bootstrap + application shell
  core/       loop, clock, state machine, scenes, event bus
  config/     tuning values (physics, gameplay, input, rendering)
  math/       Vector2, Rect, Circle, helpers
  physics/    bodies, collision detection/resolution, layers
  entities/   player, platforms, collectibles, hazards, enemies...
  systems/    gameplay systems updated each tick
  rendering/  canvas renderer, layers, debug overlay
  input/      keyboard/touch adapters -> InputSnapshot
  audio/      audio manager, procedural sounds
  levels/     level schema, loader, validator, registry, JSON levels
  ui/         HTML overlay screens and HUD
  save/       versioned save data + localStorage repository
  debug/      dev-only overlay
  pwa/        service worker registration
```

## Key rules

- Rendering is read-only with respect to gameplay state.
- The simulation consumes `InputSnapshot`s, never raw DOM events.
- No DOM queries, allocations, or async work inside the loop.
- Tuning values live in `src/config`, never as magic numbers.
- Transient runtime state is separate from static level data.
- Gameplay logic is testable without a canvas.
- Events are typed and cleared each tick.
- Debug tooling is disabled in production builds.

## Coordinate system

- World units: x right, y down, 1 unit = 1 logical pixel.
- Logical viewport 320x180; CSS scales the canvas, aspect preserved.
- Camera transforms world -> canvas coordinates; never mutates world state.

## Game states

`booting → loading → main-menu → {level-select, settings, playing}`

`playing ⇄ paused`, `playing → player-dead → playing`,
`playing → level-complete → {playing, level-select}`, `playing → game-complete`.
Only the state machine performs transitions.
