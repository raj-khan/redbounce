---
id: TASK-16
title: Implement typed event bus
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:44'
labels:
  - engine
milestone: m-1
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Typed GameEvent domain events (player-bounced, player-died, collectible-collected, and friends) per spec section 32.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Events are typed and processed in order
- [ ] #2 Transient events cleared each tick
- [ ] #3 Unit tests verify publish and subscribe
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Typed generic EventBus with queued drain, ordered delivery, disposers, clear(); 7 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
