---
id: TASK-36
title: Implement player death
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:11'
labels:
  - gameplay
milestone: m-2
dependencies:
  - TASK-35
priority: medium
type: feature
ordinal: 36000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Death state, input disable, death animation, PlayerDied event, and death screen flow per spec section 17.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Death freezes player control and emits PlayerDied
- [ ] #2 Death counter updates
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Death state disables input, 0.6s animation, PlayerDied event, deaths counter, death face render.
<!-- SECTION:FINAL_SUMMARY:END -->
