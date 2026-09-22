---
id: TASK-20
title: Add camera transform
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:48'
labels:
  - rendering
milestone: m-1
dependencies:
  - TASK-19
priority: high
type: feature
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Camera with worldToScreen transform, bounds clamping, and render-only shake per spec section 19.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Camera transform converts world to canvas coordinates
- [ ] #2 Camera calculations never modify world positions
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Camera worldToScreen/screenToWorld, bounds clamp, render-only shake; 9 unit tests.
<!-- SECTION:FINAL_SUMMARY:END -->
