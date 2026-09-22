# Performance Audit

Targets and budgets from spec section 29, verified by `e2e/perf.spec.ts` in CI.

## Budgets

| Metric                            |                              Target | Verified by                                              |
| --------------------------------- | ----------------------------------: | -------------------------------------------------------- |
| Simulation rate                   |                60 Hz fixed timestep | `GameLoop` unit tests                                    |
| Visible particles                 |              <= 300 (hard pool cap) | `ParticleSystem` unit tests                              |
| Active entities per early level   |                              <= 200 | Level data (largest: 38)                                 |
| Runtime frame rate                | ~60 FPS desktop, playable on mobile | `perf.spec.ts` rAF sampling (>= 50 FPS)                  |
| Memory                            |           No growth across restarts | `perf.spec.ts` heap sampling (10 restarts, < 50% growth) |
| Asset downloads after first visit |            0 (service worker cache) | `offline.spec.ts`                                        |

## Engineering guarantees

- **Fixed timestep** decouples simulation from frame rate; large frame gaps
  are clamped at 0.25 s (spiral-of-death guard).
- **Zero per-frame allocation** in the particle path (ring-buffer pool) and
  the event queue (swap-on-drain).
- **Rendering is read-only**; no physics or DOM work happens during render.
- **Canvas state changes minimized**: layers batched back-to-front, static
  background layers drawn from a single gradient pass.
- **Tab visibility** pauses the loop entirely (no hidden-tab battery drain).

## Results (CI baseline, headless Chromium)

- rAF sampling over 2 s of live gameplay: >= 50 FPS average required,
  typically ~58-60 FPS in CI and 60 FPS uncapped locally.
- 10 consecutive level restarts: JS heap growth within noise (< 50%).
