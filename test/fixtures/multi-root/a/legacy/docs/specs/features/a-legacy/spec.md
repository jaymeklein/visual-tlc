# CSV Export Specification

## Problem Statement

Support copies report tables into spreadsheets by hand. A CSV export button removes that step.

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| XLSX export | CSV covers the need |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Delimiter | Semicolon | Excel pt-BR opens it without import wizard | y |

**Open questions:** none

---

## User Stories

### P1: Export report as CSV ⭐ MVP

**User Story**: As a support agent, I want to export a report as CSV so that I can open it in Excel.

**Acceptance Criteria**:

1. WHEN the user clicks Export CSV THEN the system SHALL download a file named `<report>-<yyyy-mm-dd>.csv`
2. The system SHALL encode the file as UTF-8 with BOM

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| CSV-01 | P1: Export CSV | - | Implementing |
| CSV-02 | P1: Export CSV | - | Pending |
