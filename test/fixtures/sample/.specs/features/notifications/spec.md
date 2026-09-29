# Notifications Specification

## Problem Statement

Users miss invoice and security events because we only show them in-app. Email notifications close that gap.

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Push notifications | Mobile app not shipped yet |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Provider | SES | Already used for password reset | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Email on new invoice ⭐ MVP

**User Story**: As a customer, I want an email when an invoice is issued so that I pay on time.

**Acceptance Criteria**:

1. WHEN an invoice is issued THEN the system SHALL enqueue one email to the billing contact
2. IF the provider returns 5xx THEN the system SHALL retry 3 times with exponential backoff
3. IF the provider rejects the address THEN the system SHALL mark the contact as bounced

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| NOTIF-01 | P1: Email on invoice | Tasks | Verified |
| NOTIF-02 | P1: Email on invoice | Tasks | ❌ Needs Fix |
| NOTIF-03 | P1: Email on invoice | Tasks | Implementing |
