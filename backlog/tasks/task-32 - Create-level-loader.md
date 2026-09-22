---
id: TASK-32
title: Create level loader
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:00'
labels:
  - data
milestone: m-2
dependencies:
  - TASK-31
priority: medium
type: feature
ordinal: 32000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
LevelLoader interface that parses validated level data into runtime entities per spec sections 24 and 39.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Loading a level creates the correct entities without mutating level definitions
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
LevelLoader validates then deep-freezes cloned data; gameplay can never mutate level definitions; 5 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
