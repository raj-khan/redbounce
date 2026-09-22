---
id: TASK-24
title: Add debug collision rendering
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:48'
labels:
  - rendering
milestone: m-1
dependencies:
  - TASK-20
priority: high
type: feature
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Development-only debug overlay with FPS, coordinates, collision shapes, and entity IDs per spec section 33; disabled in production.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Debug overlay toggles via dev-only shortcut such as F3
- [ ] #2 Debug rendering is stripped or disabled in production builds
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
DebugRenderer: FPS/tick/state/pos/vel/entity info panel + collision shape overlay; enabled flag off by default.
<!-- SECTION:FINAL_SUMMARY:END -->
