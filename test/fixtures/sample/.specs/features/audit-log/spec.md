# Audit Log Specification

## Problem Statement

Admins cannot see who changed billing settings. An append-only audit log answers "who did what, when".

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Log export to SIEM | Enterprise tier, later |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Retention | 365 days | Matches contract terms | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Record admin actions ⭐ MVP

**User Story**: As an admin, I want every settings change recorded so that I can answer who changed what.

**Acceptance Criteria**:

1. WHEN an admin changes a billing setting THEN the system SHALL append an entry with actor, action, before and after values
2. The system SHALL never update or delete audit entries
3. WHERE the workspace has the enterprise plan the system SHALL keep entries for 5 years

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| AUDIT-01 | P1: Record admin actions | Design | In Design |
| AUDIT-02 | P1: Record admin actions | Design | In Design |
| AUDIT-03 | P1: Record admin actions | Design | In Design |
