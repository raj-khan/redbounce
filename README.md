# RedBounce

> A fast, playful 2D bouncing adventure built for the browser.

Browser-based 2D platformer inspired by classic Bounce-style gameplay. TypeScript + Vite + HTML5 Canvas, installable PWA, playable on desktop and mobile.

## Status

Project is in the planning phase. Full architecture specification: [`bounce_browser_game_a2z_architecture.md`](./bounce_browser_game_a2z_architecture.md)

## Development

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # type-check and build for production
npm run test      # run unit/integration tests (Vitest)
npm run test:e2e  # run browser tests (Playwright)
npm run lint      # ESLint
npm run format    # Prettier write
npm run check     # lint + format + typecheck + test + build
```

Requires Node.js >= 20.

## Documentation

- [Architecture](./docs/architecture.md)
- [Gameplay](./docs/gameplay.md)
- [Level design](./docs/level-design.md)

Work is tracked with [Backlog.md](https://github.com/MrLesk/Backlog.md) — see the [`backlog/`](./backlog) folder:

```bash
backlog board      # Kanban view of all 77 tasks
backlog browser    # Web UI
```

## Roadmap

- **Phase 0** — Project setup (Vite, TypeScript, lint, tests)
- **Phase 1** — Playable prototype (loop, physics, bounce, camera)
- **Phase 2** — Core gameplay (collectibles, hazards, checkpoints, saves)
- **Phase 3** — Mobile and audio (touch controls, Web Audio, settings)
- **Phase 4** — Content and polish (5 worlds, 10+ levels, original art)
- **Phase 5** — PWA and release (offline, deploy, audits)

## License

All artwork, level designs, and sounds will be original work.
