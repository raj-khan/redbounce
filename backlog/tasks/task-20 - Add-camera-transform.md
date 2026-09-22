---
id: TASK-20
title: Add camera transform
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
labels:
  - rendering
milestone: m-1
dependencies:
  - TASK-19
priority: high
type: feature
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Camera with worldToScreen transform, bounds clamping, and render-only shake per spec section 19.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Camera transform converts world to canvas coordinates
- [ ] #2 Camera calculations never modify world positions
<!-- AC:END -->
