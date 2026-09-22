---
id: TASK-2
title: Configure strict TypeScript
status: Done
assignee: []
created_date: '2026-09-22 12:31'
updated_date: '2026-09-22 13:37'
labels:
  - foundation
milestone: m-0
dependencies:
  - TASK-1
priority: high
type: chore
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enable strict TS compiler options per spec section 3 and 38. Type-checking must be part of the build.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 tsconfig uses strict mode with noImplicitAny and strictNullChecks
- [x] #2 npm run build type-checks successfully
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
tsconfig with strict, noUncheckedIndexedAccess, noImplicitOverride, isolatedModules; typecheck in CI.
<!-- SECTION:FINAL_SUMMARY:END -->
