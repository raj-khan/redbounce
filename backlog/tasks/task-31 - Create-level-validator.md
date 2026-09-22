---
id: TASK-31
title: Create level validator
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
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
