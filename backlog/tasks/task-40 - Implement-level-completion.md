---
id: TASK-40
title: Implement level completion
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:14'
labels:
  - gameplay
milestone: m-2
dependencies:
  - TASK-39
  - TASK-34
priority: medium
type: feature
ordinal: 40000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Completion sequence with control freeze, results (LevelResult), save, next-level unlock, and completion screen per spec section 18.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Results screen shows score, collectibles, deaths, and time
- [ ] #2 Completing a level unlocks the next one
- [ ] #3 Completion persists across reloads
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Completion sequence: control freeze, LevelResult, save + next-level unlock via registry, in-canvas results panel (score/rings/deaths/time), Enter advances levels.
<!-- SECTION:FINAL_SUMMARY:END -->
