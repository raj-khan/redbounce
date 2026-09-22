---
id: TASK-29
title: Implement camera follow
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:54'
labels:
  - gameplay
milestone: m-1
dependencies:
  - TASK-20
priority: high
type: feature
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Smooth follow with look-ahead, dead zone, and level-bounds clamping per spec section 19.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Camera follows player smoothly without excessive motion
- [ ] #2 Camera clamps to level boundaries
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Camera.follow wired in PlayScene with dead zone, look-ahead, bounds clamp; snapTo on enter/restart.
<!-- SECTION:FINAL_SUMMARY:END -->
