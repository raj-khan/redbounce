---
id: TASK-33
title: Create level registry
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:00'
labels:
  - data
milestone: m-2
dependencies:
  - TASK-32
priority: medium
type: feature
ordinal: 33000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Registry of levels with ordering and unlock progression per spec sections 24 and 25.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Levels resolve by ID in declared order
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
LevelRegistry with ordered levels, byId lookup, next() unlock progression, duplicate rejection; 3 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
