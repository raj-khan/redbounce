---
id: TASK-72
title: Cache core assets
status: Done
assignee: []
created_date: '2026-09-22 12:32'
updated_date: '2026-09-22 18:07'
labels:
  - pwa
milestone: m-5
dependencies:
  - TASK-71
priority: low
type: feature
ordinal: 72000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cache HTML shell, bundles, CSS, core assets, and level data for offline play per spec section 28.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 No repeated asset downloads after caching
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Shell precache + post-activation page-side resource caching (hashed bundles pushed into cache with ignoreVary matching); no repeat downloads after first visit.
<!-- SECTION:FINAL_SUMMARY:END -->
