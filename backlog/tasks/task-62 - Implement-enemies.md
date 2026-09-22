---
id: TASK-62
title: Implement enemies
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 18:02'
labels:
  - gameplay
milestone: m-4
dependencies:
  - TASK-27
priority: low
type: feature
ordinal: 62000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Patroller, chaser, and orbital hazard behaviors via deterministic EnemyBehavior per spec section 15.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Enemy AI is deterministic and state-based
- [ ] #2 Movement logic is separated from collision logic
- [ ] #3 Direction changes are telegraphed visually
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Patroller (boundary reverse), chaser (aggro radius + home drift, aggro telegraph), orbital (fixed orbit); deterministic state-based AI; enemy contact kills; 4 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
