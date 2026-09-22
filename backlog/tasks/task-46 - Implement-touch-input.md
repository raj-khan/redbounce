---
id: TASK-46
title: Implement touch input
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:22'
labels:
  - input
milestone: m-3
dependencies:
  - TASK-45
priority: medium
type: feature
ordinal: 46000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Left and right virtual buttons with safe-area insets and large targets per spec section 22.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Game is playable on a mobile viewport
- [ ] #2 Touch controls do not cover important gameplay elements
- [ ] #3 Controls respect safe-area insets
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
TouchInput virtual buttons (pointer events, cancel-safe), safe-area CSS, coarse-pointer auto-show, settings toggle.
<!-- SECTION:FINAL_SUMMARY:END -->
