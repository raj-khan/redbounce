---
id: TASK-31
title: Create level validator
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:00'
labels:
  - data
milestone: m-2
dependencies:
  - TASK-30
priority: medium
type: feature
ordinal: 31000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Validate unique IDs, dimensions, spawn safety, entity references, exit existence, and objective feasibility per spec section 24.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Validator rejects malformed levels with actionable errors
- [ ] #2 Spawn-inside-solid is detected
- [ ] #3 Unit tests cover validation rules
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
validateLevel: unique ids, bounds, spawn safety (inside-solid check with player radius), known types, exit existence, collectible feasibility, requiresKey consistency; 15 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
