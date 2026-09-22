---
id: TASK-34
title: Implement collectibles
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:11'
labels:
  - gameplay
milestone: m-2
dependencies:
  - TASK-27
  - TASK-12
priority: medium
type: feature
ordinal: 34000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ring, star, crystal, key, and heart types with sensor overlap, score, particles, sound, and HUD updates per spec section 16.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Collecting updates the HUD counter and score
- [ ] #2 Collectibles respawn on level restart when configured
- [ ] #3 Collection uses sensors and never blocks movement
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Rings/stars/keys/hearts with sensor pickup, score/lives/key state, events, restart respawn; 5 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
