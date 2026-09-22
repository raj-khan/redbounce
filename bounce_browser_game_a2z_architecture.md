# Bounce-Inspired Browser Game
## A2Z Architecture and Implementation Specification

> **Project type:** Browser-based 2D platformer  
> **Primary inspiration:** Classic Nokia Bounce-style gameplay  
> **Target platforms:** Desktop browsers, mobile browsers, installable PWA  
> **Recommended stack:** TypeScript, Vite, HTML5 Canvas, Web Audio API, Vitest, Playwright  
> **Rendering approach:** Canvas 2D  
> **Architecture style:** Modular game engine with data-driven levels and deterministic gameplay systems

---

## 1. Product Vision

Build a lightweight, responsive, browser-based 2D platforming game in which the player controls a bouncing red ball.

The player should be able to:

- Move left and right.
- Bounce automatically or through spring/platform interactions.
- Collect rings or stars.
- Avoid spikes, pits, enemies, and moving hazards.
- Activate checkpoints.
- Reach the level exit.
- Complete increasingly difficult levels.
- Restart quickly after failure.
- Play on keyboard, touch, and optionally gamepad.
- Continue playing offline after the first load.

The game should feel nostalgic but should not copy Nokia's original assets, names, level layouts, sounds, or branding. Use original artwork, original level designs, and a distinct product identity.

---

## 2. Suggested Product Identity

### Working names

- RedBounce
- BounceQuest
- Ballbound
- RingRunner
- Red Orbit
- Bounce Trails
- Roll & Rise

### Suggested direction

**Working title:** `RedBounce`

**One-line pitch:**

> A fast, playful 2D bouncing adventure built for the browser.

### Visual direction

- Main character: original red ball with expressive motion.
- World: colorful platform environments.
- Collectibles: rings, stars, crystals, or energy orbs.
- Hazards: spikes, lava, saws, falling blocks, and moving enemies.
- UI: clean, responsive, arcade-inspired.
- Art style: simple vector-like shapes or original pixel art.

---

## 3. Core Technical Decisions

| Area | Decision |
|---|---|
| Language | TypeScript |
| Build tool | Vite |
| Renderer | HTML5 Canvas 2D |
| Physics | Custom lightweight 2D physics |
| Game loop | `requestAnimationFrame` with fixed simulation timestep |
| Input | Keyboard, touch, and optional gamepad |
| Audio | Web Audio API with user-gesture unlock |
| State management | Explicit game state machine |
| Level format | JSON or TypeScript data objects |
| Persistence | `localStorage` behind a storage abstraction |
| Offline support | Service worker / PWA |
| Unit tests | Vitest |
| Browser tests | Playwright |
| Code quality | ESLint + Prettier + strict TypeScript |
| Deployment | Static hosting such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages |

---

## 4. High-Level Architecture

```text
Browser
│
├── Application Shell
│   ├── Main Menu
│   ├── Settings
│   ├── Level Select
│   ├── Pause Menu
│   ├── Game Over Screen
│   └── Completion Screen
│
├── Game Runtime
│   ├── Game Application
│   ├── Game State Machine
│   ├── Main Loop
│   ├── Fixed Timestep Scheduler
│   ├── Scene Manager
│   └── Runtime Configuration
│
├── Gameplay
│   ├── Player System
│   ├── Physics System
│   ├── Collision System
│   ├── Camera System
│   ├── Collectible System
│   ├── Hazard System
│   ├── Enemy System
│   ├── Checkpoint System
│   ├── Exit System
│   └── Level Progression
│
├── Rendering
│   ├── Canvas Renderer
│   ├── Camera Transform
│   ├── Sprite / Shape Renderer
│   ├── Particle Renderer
│   ├── Background Renderer
│   └── Debug Renderer
│
├── Input
│   ├── Keyboard Adapter
│   ├── Touch Adapter
│   ├── Gamepad Adapter
│   └── Input Mapping
│
├── Audio
│   ├── Sound Manager
│   ├── Music Manager
│   ├── Sound Effects
│   └── Audio Settings
│
├── Data
│   ├── Level Definitions
│   ├── Entity Definitions
│   ├── Game Balance
│   ├── Asset Manifest
│   └── Save Data
│
└── Platform Services
    ├── PWA Registration
    ├── Storage Adapter
    ├── Performance Metrics
    └── Error Reporting Hook
```

---

## 5. Recommended Repository Structure

```text
redbounce/
├── public/
│   ├── icons/
│   ├── manifest.webmanifest
│   ├── favicon.svg
│   └── robots.txt
│
├── src/
│   ├── app/
│   │   ├── App.ts
│   │   ├── AppConfig.ts
│   │   ├── GameApplication.ts
│   │   └── bootstrap.ts
│   │
│   ├── core/
│   │   ├── GameLoop.ts
│   │   ├── FixedTimestep.ts
│   │   ├── GameClock.ts
│   │   ├── GameStateMachine.ts
│   │   ├── Scene.ts
│   │   ├── SceneManager.ts
│   │   ├── EventBus.ts
│   │   ├── Result.ts
│   │   └── Disposable.ts
│   │
│   ├── config/
│   │   ├── physics.config.ts
│   │   ├── gameplay.config.ts
│   │   ├── input.config.ts
│   │   └── rendering.config.ts
│   │
│   ├── math/
│   │   ├── Vector2.ts
│   │   ├── Rect.ts
│   │   ├── Circle.ts
│   │   ├── MathUtils.ts
│   │   └── Interpolation.ts
│   │
│   ├── physics/
│   │   ├── PhysicsWorld.ts
│   │   ├── PhysicsBody.ts
│   │   ├── Collision.ts
│   │   ├── CollisionLayers.ts
│   │   ├── CollisionResolver.ts
│   │   ├── GravitySystem.ts
│   │   └── TriggerSystem.ts
│   │
│   ├── entities/
│   │   ├── Entity.ts
│   │   ├── EntityId.ts
│   │   ├── EntityManager.ts
│   │   ├── Player.ts
│   │   ├── Platform.ts
│   │   ├── MovingPlatform.ts
│   │   ├── Collectible.ts
│   │   ├── Hazard.ts
│   │   ├── Enemy.ts
│   │   ├── Checkpoint.ts
│   │   └── LevelExit.ts
│   │
│   ├── systems/
│   │   ├── PlayerSystem.ts
│   │   ├── MovementSystem.ts
│   │   ├── PhysicsSystem.ts
│   │   ├── CollisionSystem.ts
│   │   ├── CollectibleSystem.ts
│   │   ├── HazardSystem.ts
│   │   ├── EnemySystem.ts
│   │   ├── CheckpointSystem.ts
│   │   ├── CameraSystem.ts
│   │   ├── ParticleSystem.ts
│   │   └── LevelCompletionSystem.ts
│   │
│   ├── rendering/
│   │   ├── Renderer.ts
│   │   ├── CanvasRenderer.ts
│   │   ├── RenderContext.ts
│   │   ├── CameraRenderer.ts
│   │   ├── BackgroundRenderer.ts
│   │   ├── EntityRenderer.ts
│   │   ├── ParticleRenderer.ts
│   │   └── DebugRenderer.ts
│   │
│   ├── input/
│   │   ├── InputManager.ts
│   │   ├── InputSnapshot.ts
│   │   ├── KeyboardInput.ts
│   │   ├── TouchInput.ts
│   │   ├── GamepadInput.ts
│   │   └── InputAction.ts
│   │
│   ├── audio/
│   │   ├── AudioManager.ts
│   │   ├── SoundEffect.ts
│   │   ├── MusicTrack.ts
│   │   └── AudioSettings.ts
│   │
│   ├── levels/
│   │   ├── Level.ts
│   │   ├── LevelLoader.ts
│   │   ├── LevelValidator.ts
│   │   ├── LevelRegistry.ts
│   │   ├── level-01.json
│   │   ├── level-02.json
│   │   └── level-03.json
│   │
│   ├── ui/
│   │   ├── UiManager.ts
│   │   ├── MainMenu.ts
│   │   ├── Hud.ts
│   │   ├── PauseMenu.ts
│   │   ├── LevelSelect.ts
│   │   ├── SettingsMenu.ts
│   │   └── CompletionScreen.ts
│   │
│   ├── save/
│   │   ├── SaveData.ts
│   │   ├── SaveRepository.ts
│   │   └── LocalStorageSaveRepository.ts
│   │
│   ├── assets/
│   │   ├── AssetLoader.ts
│   │   ├── AssetManifest.ts
│   │   └── AssetCache.ts
│   │
│   ├── debug/
│   │   ├── DebugConfig.ts
│   │   ├── DebugOverlay.ts
│   │   └── DebugCommands.ts
│   │
│   ├── pwa/
│   │   └── registerServiceWorker.ts
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── game.css
│   │   └── ui.css
│   │
│   └── main.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── e2e/
│   ├── smoke.spec.ts
│   ├── gameplay.spec.ts
│   └── mobile.spec.ts
│
├── docs/
│   ├── architecture.md
│   ├── gameplay.md
│   ├── level-design.md
│   └── contributing.md
│
├── backlog.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

---

## 6. Runtime Lifecycle

```text
Boot
│
├── Validate browser capabilities
├── Load runtime configuration
├── Register PWA service worker
├── Load essential assets
├── Initialize input adapters
├── Initialize audio manager
├── Initialize save repository
├── Create canvas and UI shell
└── Open Main Menu
    │
    ├── Start Game
    │   ├── Load level
    │   ├── Create entities
    │   ├── Reset camera
    │   ├── Reset player
    │   └── Enter Playing state
    │
    ├── Level Select
    ├── Settings
    └── Continue
```

---

## 7. Game State Machine

The game must use explicit states rather than scattered boolean flags.

### Required states

```ts
type GameState =
  | "booting"
  | "loading"
  | "main-menu"
  | "level-select"
  | "playing"
  | "paused"
  | "player-dead"
  | "level-complete"
  | "game-complete"
  | "settings";
```

### State responsibilities

| State | Responsibilities |
|---|---|
| `booting` | Initialize application and browser services |
| `loading` | Load level and assets |
| `main-menu` | Display start and navigation options |
| `level-select` | Show unlocked levels |
| `playing` | Run simulation and accept gameplay input |
| `paused` | Freeze simulation while keeping UI responsive |
| `player-dead` | Show death feedback and restart options |
| `level-complete` | Show completion results |
| `game-complete` | Show final progression screen |
| `settings` | Manage audio, controls, and accessibility |

### State transition rules

- Only the state machine may transition game states.
- Gameplay systems may emit events but should not directly manipulate UI screens.
- Pausing must stop simulation updates but may continue UI rendering.
- Restarting a level must reset transient entities and player state.
- Returning to the main menu must dispose of the active level.

---

## 8. Main Game Loop

Use a fixed simulation timestep to make physics stable across different frame rates.

### Recommended model

- Rendering: variable frame rate using `requestAnimationFrame`.
- Simulation: fixed timestep, for example `1 / 60` seconds.
- Maximum accumulated time: cap to avoid a "spiral of death."
- Interpolation: optionally interpolate visual transforms between simulation steps.

```text
requestAnimationFrame
│
├── Measure elapsed time
├── Clamp elapsed time
├── Accumulate elapsed time
│
├── While accumulator >= fixed timestep
│   ├── Capture input snapshot
│   ├── Update gameplay systems
│   ├── Resolve physics
│   ├── Process events
│   └── Decrease accumulator
│
├── Calculate interpolation alpha
├── Render current scene
└── Schedule next frame
```

### Important rules

- Never use raw frame delta directly for gravity or movement.
- Cap large frame gaps after tab switching.
- Pause the game when the browser becomes hidden, unless explicitly configured otherwise.
- Keep simulation deterministic where practical.
- Avoid allocations inside the main loop.

---

## 9. Coordinate System

Use a world coordinate system independent of screen resolution.

### World coordinates

- X increases to the right.
- Y increases downward.
- One world unit can represent one logical pixel or a configurable game unit.
- The camera converts world coordinates into canvas coordinates.

```text
World:
(0, 0) ───────────────► X
  │
  │
  ▼
  Y
```

### Recommended logical viewport

```ts
const VIEWPORT = {
  width: 320,
  height: 180,
};
```

The actual canvas may be larger, but the game should preserve the logical aspect ratio.

### Responsive scaling

- Use CSS to scale the canvas.
- Preserve aspect ratio.
- Use `image-rendering: pixelated` only if the game intentionally uses pixel art.
- Support letterboxing or a carefully designed responsive camera.
- Avoid stretching the game world independently on the X and Y axes.

---

## 10. Core Math Types

### `Vector2`

```ts
class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  clone(): Vector2;
  add(other: Vector2): Vector2;
  subtract(other: Vector2): Vector2;
  multiplyScalar(value: number): Vector2;
  length(): number;
  normalize(): Vector2;
  dot(other: Vector2): number;
  static zero(): Vector2;
}
```

### `Rect`

```ts
type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
```

### `Circle`

```ts
type Circle = {
  x: number;
  y: number;
  radius: number;
};
```

### Math utilities

Provide:

- `clamp`
- `lerp`
- `approach`
- `sign`
- `nearlyEqual`
- `randomRange`
- `degToRad`
- `radToDeg`
- `aabbIntersects`
- `circleIntersectsRect`

---

## 11. Player Design

The player is a bouncing red ball with a circular collision body.

### Player properties

```ts
type PlayerConfig = {
  radius: number;
  maxHorizontalSpeed: number;
  horizontalAcceleration: number;
  horizontalDeceleration: number;
  gravity: number;
  terminalVelocity: number;
  bounceVelocity: number;
  airControl: number;
  coyoteTimeSeconds: number;
  jumpBufferSeconds: number;
};
```

### Suggested starting values

These are initial tuning values, not final balancing decisions.

```ts
const PLAYER_DEFAULTS = {
  radius: 7,
  maxHorizontalSpeed: 90,
  horizontalAcceleration: 480,
  horizontalDeceleration: 600,
  gravity: 520,
  terminalVelocity: 260,
  bounceVelocity: -190,
  airControl: 0.8,
  coyoteTimeSeconds: 0.08,
  jumpBufferSeconds: 0.1,
};
```

### Player states

```ts
type PlayerState =
  | "normal"
  | "bouncing"
  | "hurt"
  | "dead"
  | "finished";
```

### Player behaviors

- Horizontal movement.
- Automatic bouncing on suitable surfaces.
- Optional manual bounce ability later.
- Ground and wall detection.
- Hazard damage.
- Respawn at checkpoint.
- Invulnerability window after damage.
- Animation state based on velocity and contact.
- Particle trail while moving quickly.
- Squash and stretch on bounce.

### Player constraints

- The player must not tunnel through thin hazards at normal speeds.
- Player movement must be independent from rendering frame rate.
- Player collision shape should remain simple and predictable.
- Visual animation must not alter the physics collision shape.

---

## 12. Physics Architecture

Use a custom lightweight physics system rather than a full physics engine for the first version.

### Physics body

```ts
type PhysicsBody = {
  position: Vector2;
  previousPosition: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  isStatic: boolean;
  isSensor: boolean;
  collisionLayer: number;
  collisionMask: number;
};
```

### Physics steps

1. Apply gravity.
2. Apply player or entity acceleration.
3. Clamp velocity.
4. Integrate position.
5. Detect collisions.
6. Resolve collisions.
7. Emit collision events.
8. Update grounded/contact information.

### Collision types

- Circle versus rectangle.
- Rectangle versus rectangle.
- Circle versus circle.
- Sensor overlap.
- One-way platform collision.
- Moving platform collision.

### Collision layers

```ts
enum CollisionLayer {
  Player = 1 << 0,
  Solid = 1 << 1,
  Hazard = 1 << 2,
  Collectible = 1 << 3,
  Enemy = 1 << 4,
  Sensor = 1 << 5,
}
```

### Collision resolution rules

- Solid platforms stop the player from entering their volume.
- A downward collision with a platform can trigger a bounce.
- Hazard collisions trigger damage or death.
- Collectibles use sensors and do not block movement.
- Checkpoints use sensors.
- Exit zones use sensors.
- Moving platforms update their position before collision resolution.

---

## 13. Platform Types

### Static platform

A fixed rectangular surface.

Properties:

```ts
type StaticPlatform = {
  type: "static-platform";
  x: number;
  y: number;
  width: number;
  height: number;
  material?: "grass" | "stone" | "ice" | "metal" | "wood";
};
```

### One-way platform

- Player can pass upward through it.
- Player lands when moving downward.
- Requires previous-position checks.
- Must not trap the player when moving sideways.

### Moving platform

Properties:

```ts
type MovingPlatform = {
  type: "moving-platform";
  start: Vector2;
  end: Vector2;
  durationSeconds: number;
  easing: "linear" | "smooth";
  width: number;
  height: number;
};
```

### Bounce pad

- Applies a stronger vertical velocity.
- Has a visual activation animation.
- Plays a sound effect.
- May have directional launch behavior.

### Breakable platform

- Becomes unstable after contact.
- Shows cracks or warning animation.
- Breaks after a configurable delay.
- Respawns after level restart.

---

## 14. Hazards

### Initial hazards

- Static spikes.
- Falling into a pit.
- Lava or toxic liquid.
- Rotating saw.
- Moving spike block.
- Enemy contact.
- Timed laser.
- Falling rock.

### Hazard contract

```ts
type Hazard = {
  id: string;
  type: string;
  bounds: Rect;
  damage: number;
  active: boolean;
  respawnSafe: boolean;
};
```

### Hazard behavior

- Hazards must be readable before they become dangerous.
- Use animation or warning indicators for timed hazards.
- Collision should be separate from visual art.
- All hazards must be testable without rendering.
- Avoid unfair hazards that kill the player without sufficient reaction time.

---

## 15. Enemy Architecture

Start with simple deterministic enemies.

### Enemy types

1. **Patroller**
   - Moves between two points.
   - Reverses direction at boundaries.

2. **Chaser**
   - Follows the player within a limited radius.
   - Has a maximum speed.
   - Can be disabled for early levels.

3. **Orbital hazard**
   - Moves around a fixed point.
   - Acts as a moving obstacle rather than an intelligent enemy.

### Enemy interface

```ts
interface EnemyBehavior {
  update(
    entity: Enemy,
    context: EnemyUpdateContext,
    deltaSeconds: number,
  ): void;
}
```

### Design rules

- Keep enemy AI deterministic.
- Separate movement logic from collision logic.
- Use state-based AI rather than deeply nested conditionals.
- Add visual telegraphing for attacks or direction changes.

---

## 16. Collectibles

### Collectible types

- Ring.
- Star.
- Crystal.
- Key.
- Bonus heart.
- Time bonus.

### Collectible data

```ts
type Collectible = {
  id: string;
  type: "ring" | "star" | "key" | "heart";
  position: Vector2;
  value: number;
  collected: boolean;
  respawnOnRestart: boolean;
};
```

### Collection behavior

- Detect overlap using a sensor.
- Mark collectible as collected.
- Increase score or counter.
- Play a sound.
- Spawn particles.
- Animate collection.
- Update HUD.
- Persist only level completion data, not temporary runtime state.

### Completion requirements

Each level may define:

- Minimum collectibles.
- All collectibles.
- Required key.
- Time limit.
- No-death challenge.
- Optional secret objective.

---

## 17. Checkpoints and Respawn

### Checkpoint behavior

- Checkpoint is inactive until touched.
- Once activated, it becomes the player's respawn location.
- It may play a sound and visual effect.
- Checkpoint state resets when the level restarts.
- Checkpoint state may be saved only if the game later supports mid-level persistence.

### Respawn flow

```text
Player collides with hazard
│
├── Mark player dead
├── Disable player input temporarily
├── Play death animation
├── Emit PlayerDied event
├── Wait for short delay
├── Reset player to checkpoint
├── Reset relevant hazards
├── Restore player control
└── Resume gameplay
```

### Safety rules

- Respawn locations must be validated.
- The player must not respawn inside a solid object.
- Respawn should provide a short invulnerability window.
- A level must always have a valid starting spawn point.

---

## 18. Level Exit and Completion

A level exit is a sensor zone.

### Completion conditions

At minimum:

- Player enters the exit zone.
- Player is alive.
- Required key conditions are satisfied.
- Any mandatory objective is complete.

### Completion sequence

1. Disable player control.
2. Freeze or slow gameplay.
3. Play completion animation.
4. Calculate results.
5. Save level completion.
6. Unlock the next level.
7. Show completion screen.

### Results

```ts
type LevelResult = {
  levelId: string;
  completed: boolean;
  score: number;
  collectiblesFound: number;
  collectiblesTotal: number;
  deaths: number;
  completionTimeSeconds: number;
  objectives: string[];
  completedAt: number;
};
```

---

## 19. Camera System

The camera follows the player while respecting level boundaries.

### Camera responsibilities

- Follow player smoothly.
- Look ahead in the movement direction.
- Clamp to level bounds.
- Support vertical scrolling.
- Avoid excessive camera motion.
- Optionally apply screen shake for impacts.
- Provide camera transform to renderer.

### Camera configuration

```ts
type CameraConfig = {
  followSpeed: number;
  lookAheadDistance: number;
  deadZoneWidth: number;
  deadZoneHeight: number;
  shakeEnabled: boolean;
  maxShakePixels: number;
};
```

### Camera rules

- Camera calculations must not modify world positions.
- UI elements must render in screen space.
- Background layers may use parallax factors.
- Camera shake should be applied only during rendering.

---

## 20. Rendering Architecture

### Rendering layers

```text
1. Sky / background color
2. Far background
3. Parallax scenery
4. Level background objects
5. Solid platforms
6. Hazards and enemies
7. Collectibles
8. Player
9. Particles and effects
10. Screen-space HUD
11. Debug overlay
```

### Renderer contract

```ts
interface Renderer {
  beginFrame(): void;
  renderWorld(scene: Scene, alpha: number): void;
  renderUi(uiState: UiState): void;
  endFrame(): void;
}
```

### Rendering rules

- Rendering must be read-only with respect to gameplay state.
- Do not update physics during rendering.
- Avoid creating large numbers of objects per frame.
- Cache static level layers when possible.
- Use sprite atlases or vector drawing consistently.
- Support device pixel ratio carefully.
- Keep debug rendering disabled in production builds.

---

## 21. Art and Asset Strategy

### Phase 1: Prototype assets

Use:

- Canvas primitives.
- Circles.
- Rectangles.
- Lines.
- Simple gradients.
- Procedurally drawn particles.
- Placeholder sound effects.

This allows gameplay to be validated before investing in art.

### Phase 2: Original art

Add:

- Player sprite or vector character.
- Platform tiles.
- Background layers.
- Collectible animations.
- Hazard sprites.
- UI icons.
- Sound effects.
- Music.

### Asset rules

- Do not use copyrighted Nokia Bounce assets.
- Do not copy original level maps.
- Maintain an asset manifest.
- Load only assets required by the current level where practical.
- Provide fallbacks when assets fail to load.
- Use compressed modern image formats where supported.
- Keep asset dimensions documented.

---

## 22. Input System

Input should be action-based rather than tied directly to keys.

### Actions

```ts
type InputAction =
  | "move-left"
  | "move-right"
  | "pause"
  | "restart"
  | "confirm"
  | "back"
  | "mute"
  | "debug";
```

### Default keyboard mapping

| Action | Keyboard |
|---|---|
| Move left | ArrowLeft, A |
| Move right | ArrowRight, D |
| Pause | Escape, P |
| Restart | R |
| Confirm | Enter, Space |
| Back | Escape |
| Mute | M |

### Touch controls

For mobile:

- Show left and right virtual buttons.
- Keep buttons large enough for touch.
- Support safe-area insets.
- Avoid preventing page scrolling outside the game.
- Hide touch controls on devices with no touch capability where appropriate.
- Make controls configurable.

### Input snapshot

```ts
type InputSnapshot = {
  left: boolean;
  right: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  confirmPressed: boolean;
  backPressed: boolean;
};
```

The gameplay loop should consume a snapshot, not raw DOM events.

---

## 23. Audio System

### Audio requirements

- Audio must unlock after a user gesture.
- Provide master volume.
- Provide music volume.
- Provide sound-effect volume.
- Respect browser autoplay restrictions.
- Provide mute toggle.
- Stop or pause music when appropriate.
- Avoid overlapping too many sound effects.

### Sound categories

- Bounce.
- Collectible pickup.
- Damage.
- Death.
- Checkpoint activation.
- Level completion.
- Menu navigation.
- Button confirmation.
- Hazard warning.
- Background music.

### Audio interface

```ts
interface AudioManager {
  unlock(): Promise<void>;
  playSfx(id: string, options?: PlaySfxOptions): void;
  playMusic(id: string, options?: PlayMusicOptions): void;
  stopMusic(): void;
  setMasterVolume(value: number): void;
  setMusicVolume(value: number): void;
  setSfxVolume(value: number): void;
  setMuted(value: boolean): void;
}
```

---

## 24. Data-Driven Level Format

Levels should be defined as data rather than hardcoded in gameplay systems.

### Example level JSON

```json
{
  "id": "level-01",
  "name": "Green Valley",
  "world": "meadow",
  "width": 2400,
  "height": 720,
  "spawn": {
    "x": 80,
    "y": 420
  },
  "camera": {
    "minX": 0,
    "maxX": 2400,
    "minY": 0,
    "maxY": 720
  },
  "requiredCollectibles": 0,
  "entities": [
    {
      "id": "platform-001",
      "type": "static-platform",
      "x": 0,
      "y": 520,
      "width": 420,
      "height": 32,
      "material": "grass"
    },
    {
      "id": "ring-001",
      "type": "ring",
      "x": 180,
      "y": 450,
      "value": 10
    },
    {
      "id": "spike-001",
      "type": "spikes",
      "x": 520,
      "y": 488,
      "width": 32,
      "height": 32
    },
    {
      "id": "exit-001",
      "type": "level-exit",
      "x": 2200,
      "y": 420,
      "width": 48,
      "height": 100
    }
  ]
}
```

### Level validation

Validate:

- Unique level ID.
- Valid dimensions.
- Valid spawn point.
- No malformed entity types.
- Entity bounds inside level bounds where required.
- At least one exit.
- Valid collectible IDs.
- Valid references.
- No impossible mandatory objectives.
- No spawn inside a solid collision object.

---

## 25. Level Design Progression

### World 1: Meadow

Introduce:

- Basic platforms.
- Simple gaps.
- Rings.
- Spikes.
- Exit zones.
- Checkpoints.

### World 2: Cave

Introduce:

- Vertical movement.
- Moving platforms.
- Falling rocks.
- Darker environments.
- Narrow passages.

### World 3: Factory

Introduce:

- Conveyor platforms.
- Timed lasers.
- Rotating hazards.
- Breakable platforms.
- More complex timing.

### World 4: Sky

Introduce:

- Large gaps.
- Wind zones.
- Moving platforms.
- Falling hazards.
- Advanced camera movement.

### World 5: Core

Introduce:

- Mixed mechanics.
- Fast hazards.
- Multi-stage levels.
- Final challenge.
- End-game sequence.

### Difficulty principles

- Introduce one new mechanic at a time.
- Give the player a safe area to learn it.
- Use visual cues.
- Avoid sudden difficulty spikes.
- Test every level from a fresh save.
- Ensure the main route is always understandable.

---

## 26. UI Architecture

### Screens

- Loading screen.
- Main menu.
- Level select.
- Gameplay HUD.
- Pause menu.
- Settings.
- Game over.
- Level complete.
- Game complete.
- Credits.

### Gameplay HUD

Display:

- Current level name.
- Collectible count.
- Score.
- Lives or deaths if enabled.
- Checkpoint status.
- Pause button on touch devices.
- Optional timer.

### UI rules

- UI must be separate from canvas world rendering.
- Use semantic HTML for menus and buttons.
- Support keyboard navigation.
- Provide visible focus states.
- Ensure sufficient color contrast.
- Do not rely on color alone.
- Use `aria-live` for important status updates.
- Support reduced motion preferences.

---

## 27. Save System

Use a repository abstraction so persistence can be replaced later.

### Save data

```ts
type SaveData = {
  version: number;
  unlockedLevels: string[];
  completedLevels: Record<string, LevelResult>;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
    reducedMotion: boolean;
    touchControls: boolean;
  };
  updatedAt: number;
};
```

### Storage rules

- Store versioned save data.
- Validate parsed data.
- Recover gracefully from corrupt data.
- Never allow save failures to crash gameplay.
- Provide a reset-save option behind confirmation.
- Do not store unnecessary personal data.
- Do not require an account for the first version.

---

## 28. PWA Requirements

### PWA features

- Installable web app.
- App icon.
- Manifest file.
- Offline shell.
- Cached essential assets.
- Responsive layout.
- Standalone display mode.
- Theme color.
- Safe handling of online/offline status.

### Offline strategy

Cache:

- HTML shell.
- JavaScript bundles.
- CSS.
- Core assets.
- Level data.
- Local fonts if used.

Do not assume all remote assets are available offline. The first version should ship with local assets.

---

## 29. Performance Requirements

### Target

- Smooth gameplay at 60 FPS on modern desktop browsers.
- Playable on mid-range mobile devices.
- No unnecessary memory growth during level restarts.
- No repeated asset downloads after caching.

### Performance rules

- Use object pooling for frequent particles.
- Avoid per-frame array creation.
- Avoid unnecessary canvas state changes.
- Cache static background layers.
- Keep collision checks bounded.
- Use spatial partitioning only when needed.
- Profile before adding complex optimizations.
- Cap particle counts.
- Pause simulation when the tab is hidden.

### Suggested budgets

| Metric | Initial target |
|---|---:|
| Simulation rate | 60 Hz |
| Visible particles | 300 or fewer |
| Active entities in early levels | 200 or fewer |
| Initial bundle | Keep as small as practical |
| Level load | Fast enough to avoid a blocking loading screen for small levels |
| Memory | No continuous growth after repeated restarts |

---

## 30. Accessibility

The game should include:

- Keyboard controls.
- Touch controls.
- Pause functionality.
- Reduced motion setting.
- Mute setting.
- High-contrast UI.
- Clear visual hazard indicators.
- Non-color-only status indicators.
- Large touch targets.
- Screen-reader-readable menus.
- A way to restart without requiring precise timing.
- Optional simplified mode in a future release.

Canvas gameplay itself may not be fully screen-reader accessible, so all menus and settings must remain accessible through regular HTML.

---

## 31. Error Handling

### Recoverable errors

- Missing optional asset.
- Audio initialization failure.
- Corrupt save data.
- Unsupported gamepad.
- Service worker registration failure.
- Invalid optional level metadata.

### Fatal errors

- Canvas context unavailable.
- Invalid core level data.
- Unrecoverable initialization failure.

### Error strategy

- Show a friendly error message.
- Log technical details in development mode.
- Avoid exposing stack traces to players.
- Allow the user to reload or return to the main menu where possible.
- Do not let a failed sound effect stop gameplay.

---

## 32. Event System

Use typed domain events to decouple systems.

### Suggested events

```ts
type GameEvent =
  | { type: "player-bounced"; playerId: string }
  | { type: "player-damaged"; playerId: string; sourceId: string }
  | { type: "player-died"; playerId: string }
  | { type: "collectible-collected"; collectibleId: string }
  | { type: "checkpoint-activated"; checkpointId: string }
  | { type: "level-started"; levelId: string }
  | { type: "level-completed"; levelId: string }
  | { type: "pause-requested" }
  | { type: "resume-requested" }
  | { type: "sound-requested"; soundId: string };
```

### Event rules

- Events should be typed.
- Events should not carry unnecessary references to DOM elements.
- Events should be processed in a predictable order.
- Avoid using events for simple local function calls.
- Clear transient events after each simulation tick.

---

## 33. Debugging Tools

Create a development-only debug overlay.

### Debug features

- FPS counter.
- Simulation tick counter.
- Player coordinates.
- Player velocity.
- Current state.
- Current level ID.
- Collision shapes.
- Entity IDs.
- Camera bounds.
- Toggle invulnerability.
- Restart level.
- Skip to level.
- Show level grid.
- Show entity count.

### Debug controls

Use a development-only keyboard shortcut such as `F3`.

Do not ship cheats or debug controls enabled in production.

---

## 34. Testing Strategy

### Unit tests

Test pure logic:

- Vector operations.
- Rectangle collision.
- Circle-rectangle collision.
- Gravity integration.
- Velocity clamping.
- Bounce resolution.
- Camera clamping.
- Level validation.
- Save data migration.
- Input mapping.
- Enemy movement.
- Checkpoint selection.

### Integration tests

Test:

- Player lands on a platform.
- Player collects a ring.
- Player hits a spike.
- Player respawns at a checkpoint.
- Player reaches the exit.
- Level completion unlocks the next level.
- Pause freezes simulation.
- Restart resets runtime state.
- Corrupt save data is recovered safely.

### End-to-end tests

Test with Playwright:

- Main menu loads.
- Game starts.
- Keyboard movement works.
- Pause menu opens.
- Restart works.
- Level can be completed.
- Settings can be changed.
- Mobile layout does not overflow.
- PWA shell loads successfully where supported.

### Test principles

- Gameplay logic should be testable without a real canvas.
- Use deterministic random seeds for tests.
- Avoid timing-sensitive tests where possible.
- Use fake clocks for simulation tests.
- Test both desktop and mobile viewport sizes.

---

## 35. Security and Privacy

Although this is a local browser game:

- Do not collect personal data in the first version.
- Do not add analytics by default.
- Do not load untrusted scripts.
- Avoid unsafe HTML injection.
- Validate all level data before use.
- Keep save data local.
- If analytics are added later, make them opt-in and document them.
- Do not expose debug endpoints or secrets in the client bundle.

---

## 36. Development Phases

## Phase 0: Project Setup

Deliverables:

- Vite + TypeScript project.
- Strict TypeScript configuration.
- ESLint and Prettier.
- Vitest.
- Playwright.
- Basic HTML shell.
- Canvas element.
- `backlog.md`.
- README with setup instructions.

Acceptance criteria:

- `npm install` works.
- `npm run dev` starts the app.
- `npm run build` succeeds.
- `npm run test` succeeds.
- `npm run lint` succeeds.

---

## Phase 1: Playable Prototype

Implement:

- Canvas renderer.
- Main loop.
- Fixed timestep.
- Player ball.
- Left/right movement.
- Gravity.
- Platform collision.
- Automatic bounce.
- Camera follow.
- One test level.
- Restart button.
- Basic HUD.

Acceptance criteria:

- The player can move and bounce.
- The player cannot pass through solid platforms.
- The game remains stable at different frame rates.
- The player can reach the end of a small level.
- Restart resets the level correctly.

---

## Phase 2: Core Gameplay

Implement:

- Collectibles.
- Spikes.
- Death and respawn.
- Checkpoints.
- Level exits.
- Level completion screen.
- Score and collectible counters.
- Multiple levels.
- Data-driven level loading.

Acceptance criteria:

- Collectibles update the HUD.
- Hazards cause death or damage.
- Checkpoints work.
- Levels can be completed and restarted.
- Level progress is saved locally.

---

## Phase 3: Mobile and Audio

Implement:

- Touch controls.
- Responsive canvas.
- Audio manager.
- Sound effects.
- Music.
- Pause menu.
- Settings.
- Mute controls.
- Reduced motion setting.

Acceptance criteria:

- The game is playable on a mobile viewport.
- Touch controls do not cover important gameplay elements.
- Audio starts only after a user gesture.
- Pause works on desktop and mobile.
- Settings persist after reload.

---

## Phase 4: Content and Polish

Implement:

- Original visual theme.
- Multiple worlds.
- Moving platforms.
- Enemies.
- Particles.
- Background parallax.
- Screen transitions.
- Better level-completion feedback.
- Loading states.
- Original sound design.

Acceptance criteria:

- At least 10 playable levels.
- Each world introduces a meaningful mechanic.
- All levels have tested start and end conditions.
- Visual effects do not significantly reduce performance.

---

## Phase 5: PWA and Release

Implement:

- Web app manifest.
- Service worker.
- Offline shell.
- Installable app behavior.
- App icons.
- Production build.
- Deployment pipeline.
- Error fallback screen.
- Performance audit.
- Accessibility review.

Acceptance criteria:

- The game loads from a production URL.
- Core gameplay works offline after initial caching.
- The app is responsive.
- Production build has no debug tools enabled.
- No critical console errors occur during normal play.

---

## 37. Suggested Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run format:check && npm run test && npm run build"
  }
}
```

---

## 38. Coding Standards

### General

- Use strict TypeScript.
- Prefer small modules with one responsibility.
- Avoid global mutable state.
- Prefer composition over inheritance.
- Keep gameplay logic independent from the DOM.
- Use explicit names.
- Avoid magic numbers.
- Put tuning values in configuration files.
- Add tests for collision and movement behavior.

### Game loop

- Do not perform DOM queries inside the simulation loop.
- Do not allocate large arrays every frame.
- Do not use asynchronous operations inside physics updates.
- Do not mutate level definitions during gameplay.
- Keep transient runtime state separate from static level data.

### UI

- Use semantic HTML.
- Keep UI event handlers small.
- Do not directly manipulate gameplay internals from UI components.
- Use commands or events to request gameplay actions.

### Assets

- Keep asset IDs stable.
- Load assets through `AssetLoader`.
- Do not hardcode asset paths throughout the codebase.
- Provide placeholders for missing optional assets.

---

## 39. Suggested Core Interfaces

```ts
interface GameSystem {
  readonly name: string;
  update(context: GameContext, deltaSeconds: number): void;
}

interface GameScene {
  enter(): void | Promise<void>;
  update(deltaSeconds: number): void;
  render(alpha: number): void;
  exit(): void | Promise<void>;
}

interface LevelLoader {
  load(levelId: string): Promise<Level>;
}

interface SaveRepository {
  load(): Promise<SaveData>;
  save(data: SaveData): Promise<void>;
  reset(): Promise<void>;
}

interface InputProvider {
  getSnapshot(): InputSnapshot;
  dispose(): void;
}

interface CollisionDetector {
  detect(world: PhysicsWorld): Collision[];
}

interface Camera {
  position: Vector2;
  update(target: Vector2, deltaSeconds: number): void;
  worldToScreen(position: Vector2): Vector2;
}
```

---

## 40. Initial Backlog

Create `backlog.md` with the following tasks.

### Foundation

- [ ] Initialize Vite and TypeScript.
- [ ] Configure strict TypeScript.
- [ ] Add ESLint and Prettier.
- [ ] Add Vitest.
- [ ] Add Playwright.
- [ ] Create project README.
- [ ] Create architecture documentation.
- [ ] Create initial backlog.

### Core engine

- [ ] Implement `Vector2`.
- [ ] Implement rectangle utilities.
- [ ] Implement circle collision utilities.
- [ ] Implement fixed timestep loop.
- [ ] Implement game state machine.
- [ ] Implement scene manager.
- [ ] Implement typed event bus.
- [ ] Implement game clock.

### Rendering

- [ ] Create canvas renderer.
- [ ] Add logical viewport scaling.
- [ ] Add camera transform.
- [ ] Render background.
- [ ] Render platforms.
- [ ] Render player.
- [ ] Add debug collision rendering.

### Gameplay

- [ ] Implement player movement.
- [ ] Implement gravity.
- [ ] Implement platform collision.
- [ ] Implement automatic bounce.
- [ ] Implement camera follow.
- [ ] Implement collectibles.
- [ ] Implement hazards.
- [ ] Implement death.
- [ ] Implement respawn.
- [ ] Implement checkpoints.
- [ ] Implement level exit.
- [ ] Implement level completion.

### Data and persistence

- [ ] Create level schema.
- [ ] Create level validator.
- [ ] Create level loader.
- [ ] Create level registry.
- [ ] Create save data schema.
- [ ] Implement local storage repository.
- [ ] Add save migration strategy.

### Input and audio

- [ ] Implement keyboard input.
- [ ] Implement touch input.
- [ ] Implement input mapping.
- [ ] Implement audio unlock.
- [ ] Implement sound effects.
- [ ] Implement music.
- [ ] Add volume settings.
- [ ] Add mute setting.

### UI

- [ ] Create main menu.
- [ ] Create level select.
- [ ] Create gameplay HUD.
- [ ] Create pause menu.
- [ ] Create settings screen.
- [ ] Create death screen.
- [ ] Create completion screen.
- [ ] Add accessible keyboard navigation.

### PWA and release

- [ ] Add manifest.
- [ ] Add icons.
- [ ] Add service worker.
- [ ] Cache core assets.
- [ ] Test offline loading.
- [ ] Test mobile layout.
- [ ] Run performance audit.
- [ ] Run accessibility review.
- [ ] Deploy production build.

---

## 41. Definition of Done

A feature is complete only when:

- [ ] The feature is implemented in the correct module.
- [ ] The feature has no unnecessary coupling.
- [ ] The feature works with keyboard input.
- [ ] The feature works with touch input if relevant.
- [ ] The feature is tested.
- [ ] The feature does not introduce console errors.
- [ ] The feature works after restarting the level.
- [ ] The feature works after pausing and resuming.
- [ ] The feature behaves correctly at different frame rates.
- [ ] The feature is documented where necessary.
- [ ] The code passes linting, formatting, tests, and build checks.

---

## 42. Coding Agent Instructions

The coding agent must follow this workflow:

1. Read this architecture document completely.
2. Inspect the repository before changing files.
3. Create or update `backlog.md`.
4. Break work into small, verifiable tasks.
5. Implement one coherent task at a time.
6. Add or update tests for each gameplay system.
7. Run linting, formatting checks, tests, and build.
8. Fix failures before moving to the next task.
9. Keep commits small and descriptive.
10. Do not introduce a large game engine unless explicitly approved.
11. Do not copy Nokia Bounce assets, sounds, branding, or level layouts.
12. Use original placeholder graphics during the prototype stage.
13. Keep gameplay logic independent from the DOM and canvas.
14. Avoid adding analytics, accounts, or remote services in the first release.
15. Update documentation when architecture decisions change.
16. Before declaring completion, provide:
    - Implemented features.
    - Files changed.
    - Tests executed.
    - Known limitations.
    - Suggested next tasks.

### Recommended first implementation order

```text
1. Project setup
2. Canvas shell
3. Vector2 and collision math
4. Fixed timestep game loop
5. Player movement
6. Static platform collision
7. Bounce behavior
8. Camera follow
9. First playable level
10. Restart flow
11. Collectibles
12. Hazards
13. Respawn and checkpoints
14. Level completion
15. Save system
16. Touch controls
17. Audio
18. PWA
19. Content and polish
```

---

## 43. Final Architecture Principle

The first release should prioritize:

1. **A satisfying bounce and movement feel.**
2. **Reliable collision behavior.**
3. **Short, replayable levels.**
4. **Fast restart after failure.**
5. **Responsive desktop and mobile controls.**
6. **Original visual identity.**
7. **Simple, testable, data-driven code.**

Do not overbuild the engine before the first playable level exists.

The most important milestone is:

> A player opens the browser, controls a red ball, bounces across platforms, collects a few objects, avoids hazards, reaches the exit, and can immediately replay the level.
