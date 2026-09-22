---
id: TASK-12
title: Implement circle collision utilities
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-11
priority: high
type: feature
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Circle type, circle-vs-circle and circle-vs-rect intersection per spec section 10 and 12.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 circleIntersectsRect handles corner, edge, and contained cases
- [ ] #2 Unit tests cover all cases
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Circle type + circleIntersectsRect (corner/edge/contained) and circleIntersectsCircle; tested.
<!-- SECTION:FINAL_SUMMARY:END -->
