# Accessibility Review

Checklist from spec section 30, verified by `e2e/a11y.spec.ts` in CI and
manual review. Canvas gameplay itself is not screen-reader accessible by
nature; all menus and settings are real HTML (spec section 26).

## Checklist

- [x] Keyboard controls: arrows/WASD gameplay, P/Esc pause, R restart,
      Enter confirm, M mute (spec section 22 mapping).
- [x] Touch controls: large virtual buttons (>= 44px), safe-area insets,
      auto-shown on coarse pointers, toggleable in settings.
- [x] Pause functionality: P/Esc key + touch button; pauses freeze
      simulation but keep the UI responsive.
- [x] Reduced motion setting persisted and respected by CSS
      (`prefers-reduced-motion` + explicit setting kills transitions).
- [x] Mute setting persisted (M key + settings checkbox).
- [x] High-contrast UI: light text on dark panels, 3px focus outlines.
- [x] Clear visual hazard indicators: lasers blink before firing, falling
      rocks show cracks, chasers flash yellow when aggro.
- [x] Non-color-only status: completion shows checkmarks, locked levels
      show lock glyphs, announcements via aria-live.
- [x] Large touch targets: >= 44px verified in `mobile.spec.ts`.
- [x] Screen-reader-readable menus: semantic buttons with accessible
      names, aria-live status region, canvas carries aria-label.
- [x] Restart without precise timing: R key + pause menu restart.
- [ ] Simplified mode: deferred to a future release (per spec section 30).

## Verification

`pnpm test:e2e` runs seven a11y assertions (names, focus, arrow-key
navigation, live region, labels, document language) on every PR.
