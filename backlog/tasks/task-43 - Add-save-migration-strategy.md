---
id: TASK-43
title: Add save migration strategy
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:14'
labels:
  - data
milestone: m-2
dependencies:
  - TASK-42
priority: medium
type: feature
ordinal: 43000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Migrate old save versions forward on load per spec section 27.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Unit tests migrate each previous version to current
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
v1->v2 migration chain (settings gained reducedMotion/touchControls) with legacy fixture test; unknown versions never downgrade.
<!-- SECTION:FINAL_SUMMARY:END -->
