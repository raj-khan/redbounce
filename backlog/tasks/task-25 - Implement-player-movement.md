---
id: TASK-25
title: Implement player movement
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:54'
labels:
  - gameplay
milestone: m-1
dependencies:
  - TASK-13
priority: high
type: feature
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Horizontal movement with acceleration, deceleration, air control, coyote time, and jump buffer using PLAYER_DEFAULTS from spec section 11.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Movement is frame-rate independent
- [ ] #2 Tuning values live in config, not magic numbers
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Player entity: accel/decel/air-control/coyote/jump-buffer with PLAYER_DEFAULTS config; 11 unit tests incl. frame-rate independence.
<!-- SECTION:FINAL_SUMMARY:END -->
