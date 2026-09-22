---
id: TASK-15
title: Implement scene manager
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-14
priority: high
type: feature
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SceneManager with enter, update, render, exit lifecycle per spec section 39 GameScene interface.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Scenes swap with proper enter and exit cleanup
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
SceneManager with async enter/exit lifecycle and update/render forwarding; 4 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
