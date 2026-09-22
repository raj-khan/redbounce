---
id: TASK-18
title: Create canvas renderer
status: To Do
assignee: []
created_date: '2026-09-22 12:31'
labels:
  - rendering
milestone: m-1
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Renderer contract with beginFrame, renderWorld, renderUi, endFrame per spec section 20; rendering must be read-only with respect to gameplay state.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Renderer interface matches spec section 20
- [ ] #2 Handles devicePixelRatio correctly
<!-- AC:END -->
