---
id: TASK-71
title: Add service worker
status: Done
assignee: []
created_date: '2026-09-22 12:32'
updated_date: '2026-09-22 18:07'
labels:
  - pwa
milestone: m-5
dependencies:
  - TASK-1
priority: low
type: feature
ordinal: 71000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Service worker registering an offline shell per spec sections 5 and 28.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 SW registration failure is handled gracefully
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
sw.js: versioned cache-first offline shell with activate cleanup; registration production-only with graceful failure.
<!-- SECTION:FINAL_SUMMARY:END -->
