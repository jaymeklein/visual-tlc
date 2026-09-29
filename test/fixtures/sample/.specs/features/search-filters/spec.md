# Search Filters Specification

## Problem Statement

The orders list has no filters, so support scrolls through thousands of rows.

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Saved filters | Later |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Filter persistence | URL query string | Shareable links | y |

**Open questions:** none

---

## User Stories

### P1: Filter orders by status ⭐ MVP

**User Story**: As support, I want to filter orders by status so that I find stuck orders fast.

**Acceptance Criteria**:

1. WHEN a status filter is selected THEN the system SHALL show only orders with that status
2. WHEN the filter is cleared THEN the system SHALL show all orders

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SRCH-01 | P1: Filter by status | Tasks | Implementing |
| SRCH-02 | P1: Filter by status | Tasks | Implementing |
