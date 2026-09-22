---
id: TASK-37
title: Implement respawn
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
labels:
  - gameplay
milestone: m-2
dependencies:
  - TASK-36
priority: medium
type: feature
ordinal: 37000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Respawn at active checkpoint with validated spawn point, hazard resets, and short invulnerability window per spec section 17.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Player never respawns inside a solid
- [ ] #2 Respawn grants brief invulnerability
- [ ] #3 Restart resets transient state correctly
<!-- AC:END -->
