---
id: TASK-26
title: Implement gravity and velocity clamping
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:54'
labels:
  - gameplay
milestone: m-1
dependencies:
  - TASK-25
priority: high
type: feature
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Gravity integration with terminal velocity per spec section 12 physics steps.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Velocity clamps at terminalVelocity
- [ ] #2 Raw frame delta is never used for movement
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Gravity integration with terminal velocity clamp inside fixed steps; raw frame delta never used.
<!-- SECTION:FINAL_SUMMARY:END -->
