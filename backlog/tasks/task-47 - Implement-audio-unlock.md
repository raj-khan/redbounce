---
id: TASK-47
title: Implement audio unlock
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:22'
labels:
  - audio
milestone: m-3
dependencies:
  - TASK-1
priority: medium
type: feature
ordinal: 47000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Web Audio unlock after first user gesture with autoplay-restriction handling per spec section 23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Audio starts only after a user gesture
- [ ] #2 Audio init failure never stops gameplay
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Gesture unlock via pointerdown/keydown, idempotent, failure degrades to silence.
<!-- SECTION:FINAL_SUMMARY:END -->
