---
id: TASK-63
title: Implement particle system with pooling
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
labels:
  - rendering
milestone: m-4
dependencies:
  - TASK-18
priority: low
type: feature
ordinal: 63000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pooled particles for trails, bounces, pickups, and deaths, capped per spec sections 20 and 29.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Particle pooling avoids per-frame allocations
- [ ] #2 Visible particle count capped at 300
- [ ] #3 No memory growth across repeated restarts
<!-- AC:END -->
