# RedBounce Gameplay

## Core loop

The player controls a red ball that bounces automatically whenever it lands on
a bounceable surface. The player steers left/right, collects rings and stars,
avoids hazards, activates checkpoints, and reaches the level exit.

## Player physics (retuned for feel)

The spec's initial values produced a ~35px bounce - too low to clear the
campaign's platforms. Retuned (spec section 11 explicitly allows this):

```ts
radius: 7, maxHorizontalSpeed: 120, horizontalAcceleration: 620,
horizontalDeceleration: 800, gravity: 700, terminalVelocity: 320,
bounceVelocity: -340, airControl: 0.85, coyoteTimeSeconds: 0.08,
jumpBufferSeconds: 0.1
```

Bounce height is now ~83px (~46% of the viewport) and horizontal reach
per arc is ~110px. Level spacing rules: step-ups <= 45px, gaps <= 60px;
all 10 levels are proven solvable by a physics-model BFS in
`tests/unit/levels/Solvability.spec.ts`.

## Player states

`normal | bouncing | hurt | dead | finished`

## Platform types

- **static** - solid rectangle (grass, stone, ice, metal, wood)
- **one-way** - pass through from below, land when falling
- **moving** - travels between two points, carries the player
- **bounce pad** - boosted vertical launch with feedback
- **breakable** - cracks after contact, breaks after a delay, respawns on restart

## Hazards

Spikes, pits, lava, rotating saws, moving spike blocks, timed lasers, falling
rocks, enemy contact. Timed hazards telegraph before becoming dangerous.

## Enemies

- **Patroller** - moves between two points, reverses at boundaries
- **Chaser** - follows the player within a radius, capped speed
- **Orbital** - circles a fixed point as a moving obstacle

All enemy AI is deterministic and state-based.

## Collectibles

Rings (score), stars (bonus), crystals, keys (unlock exits), hearts (extra
life), time bonuses. Sensor overlap: collect, sound, particles, HUD update.

## Checkpoints and respawn

Touching a checkpoint sets it as the respawn point. Death freezes input, plays
feedback, then respawns the player with a short invulnerability window.
Respawn points are validated against solids.

## Level completion

Enter the exit sensor while satisfying conditions (key, minimum collectibles).
Results: score, collectibles, deaths, time. Completion unlocks the next level.

## Difficulty principles

One new mechanic per world, safe learning areas, visible telegraphs, no unfair
hazards, always-understandable main route.
