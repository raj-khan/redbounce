---
id: TASK-30
title: Create level schema
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:00'
labels:
  - data
milestone: m-2
dependencies:
  - TASK-1
priority: medium
type: feature
ordinal: 30000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Typed level definition format (id, name, world, dimensions, spawn, camera bounds, entities) with example JSON per spec section 24.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Schema covers all entity types in spec sections 13-16
- [ ] #2 Level JSON validates against the schema
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Full EntityDefinition union covering all 20 spec entity types (platforms, hazards, enemies, collectibles, checkpoints, exits, wind zones) in src/levels/Level.ts.
<!-- SECTION:FINAL_SUMMARY:END -->
