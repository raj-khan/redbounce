---
id: TASK-17
title: Implement game clock
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-13
priority: high
type: feature
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GameClock with pause support and deterministic time stepping used by the fixed timestep loop per spec section 8.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Fake-clock tests drive simulation deterministically
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
GameClock with pause/resume, clamped deltas, injectable now(); 5 fake-clock tests.
<!-- SECTION:FINAL_SUMMARY:END -->
