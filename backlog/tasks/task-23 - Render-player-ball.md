---
id: TASK-23
title: Render player ball
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:48'
labels:
  - rendering
milestone: m-1
dependencies:
  - TASK-18
priority: high
type: feature
ordinal: 23000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Red ball with squash-and-stretch on bounce and animation state from velocity per spec section 11.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ball renders with squash and stretch on bounce
- [ ] #2 Visual animation never alters the physics collision shape
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
drawPlayer with squash-and-stretch, facing eyes, invulnerability flicker, dead face; purely visual.
<!-- SECTION:FINAL_SUMMARY:END -->
