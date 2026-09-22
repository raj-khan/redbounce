---
id: TASK-14
title: Implement game state machine
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Explicit GameState enum with booting, loading, main-menu, level-select, playing, paused, player-dead, level-complete, game-complete, settings per spec section 7.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Only the state machine transitions game states
- [ ] #2 Invalid transitions are rejected
- [ ] #3 Unit tests cover transition rules
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
GameStateMachine with all 10 spec states, transition map, listener API, invalid transitions rejected; 9 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
