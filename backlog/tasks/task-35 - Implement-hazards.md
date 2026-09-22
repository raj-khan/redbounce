---
id: TASK-35
title: Implement hazards
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 14:11'
labels:
  - gameplay
milestone: m-2
dependencies:
  - TASK-27
priority: medium
type: feature
ordinal: 35000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Spikes, pits, lava, saws, moving spike blocks, timed lasers, and falling rocks with readable telegraphs per spec section 14.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hazards deal damage or death on contact
- [ ] #2 Timed hazards telegraph before becoming dangerous
- [ ] #3 Hazard logic is testable without rendering
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Spikes, lava, saws, timed lasers (idle-warn-fire telegraph), proximity falling rocks; all testable headless; 4 tests.
<!-- SECTION:FINAL_SUMMARY:END -->
