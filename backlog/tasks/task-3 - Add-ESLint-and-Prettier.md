---
id: TASK-3
title: Add ESLint and Prettier
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
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up ESLint flat config and Prettier with scripts lint and format per spec section 37.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 npm run lint succeeds
- [x] #2 npm run format:check succeeds
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
ESLint 9 flat config (typescript-eslint + prettier) and Prettier config from boilerplate conventions; lint + format:check wired into CI and check script.
<!-- SECTION:FINAL_SUMMARY:END -->
