---
id: TASK-60
title: Implement moving platforms
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 18:02'
labels:
  - gameplay
milestone: m-4
dependencies:
  - TASK-27
priority: low
type: feature
ordinal: 60000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Platforms moving between start and end points with easing, updated before collision resolution per spec sections 12 and 13.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Player rides moving platforms without sliding through
- [ ] #2 Movement updates before collision resolution
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Oscillating platforms with smooth/linear easing, updated before collision resolution; riders carried by platform delta; oscillation + reset tests.
<!-- SECTION:FINAL_SUMMARY:END -->
