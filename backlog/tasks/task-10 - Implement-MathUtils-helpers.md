---
id: TASK-10
title: Implement MathUtils helpers
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-9
priority: high
type: feature
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
clamp, lerp, approach, sign, nearlyEqual, randomRange, degToRad, radToDeg per spec section 10.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All listed helpers implemented in src/math/MathUtils.ts
- [ ] #2 Unit tests cover each helper
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
clamp, lerp, approach, sign, nearlyEqual, randomRange, degToRad, radToDeg in src/math/MathUtils.ts, re-exports intersection helpers; 7 unit tests.
<!-- SECTION:FINAL_SUMMARY:END -->
