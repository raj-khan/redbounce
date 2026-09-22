---
id: TASK-13
title: Implement fixed timestep game loop
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
requestAnimationFrame loop with fixed 60 Hz simulation, accumulator clamping, and interpolation alpha per spec section 8.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Simulation runs at a fixed rate independent of frame rate
- [ ] #2 Large frame gaps are clamped to avoid spiral of death
- [ ] #3 Loop pauses when the tab becomes hidden
<!-- AC:END -->
