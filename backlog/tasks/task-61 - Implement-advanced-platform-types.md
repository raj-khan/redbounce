---
id: TASK-61
title: Implement advanced platform types
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 18:02'
labels:
  - gameplay
milestone: m-4
dependencies:
  - TASK-60
priority: low
type: feature
ordinal: 61000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
One-way platforms, bounce pads, and breakable platforms per spec section 13.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 One-way platforms use previous-position checks and never trap the player
- [ ] #2 Bounce pads apply boosted velocity with feedback
- [ ] #3 Breakable platforms warn, break, and respawn on restart
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
One-way platforms (previous-position gate), bounce pads (-330 boost, flash, particles), breakables (crack 0.6s, break, respawn on restart); all tested.
<!-- SECTION:FINAL_SUMMARY:END -->
