---
id: TASK-28
title: Implement automatic bounce
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:54'
labels:
  - gameplay
milestone: m-1
dependencies:
  - TASK-27
priority: high
type: feature
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Downward platform contact triggers bounceVelocity with squash-and-stretch and bounce event per spec sections 11 and 12.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ball bounces automatically on suitable surfaces
- [ ] #2 Bounce feel is stable across frame rates
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Landing triggers automatic bounce (-190), squash animation, player-bounced event; verified in world integration tests.
<!-- SECTION:FINAL_SUMMARY:END -->
