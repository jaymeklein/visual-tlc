# Billing Invoices Specification

## Problem Statement

Finance exports invoices by hand from the database every month. We need monthly invoices generated automatically and downloadable as PDF.

## Goals

- [x] Invoices generated on the 1st of every month
- [x] Customers download their own invoices

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Tax calculation per country | Handled by the ERP |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Currency | BRL only | All current customers are in Brazil | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Monthly invoice generation ⭐ MVP

**User Story**: As finance, I want invoices generated automatically so that nobody exports them by hand.

**Acceptance Criteria**:

1. WHEN the monthly job runs THEN the system SHALL create one invoice per active subscription with status `issued`
2. IF an invoice already exists for the period THEN the system SHALL skip it without error

**Independent Test**: Run the job twice for the same month and see one invoice per subscription.

---

### P2: Download invoice PDF

**User Story**: As a customer, I want to download my invoice so that I can pay it.

**Acceptance Criteria**:

1. WHEN the customer requests GET /invoices/:id/pdf THEN the system SHALL return application/pdf
2. IF the invoice belongs to another customer THEN the system SHALL return 404

---

## Edge Cases

- IF a subscription is cancelled mid-month THEN the system SHALL invoice pro-rata

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| BILL-01 | P1: Monthly generation | Tasks | Verified |
| BILL-02 | P1: Monthly generation | Tasks | Verified |
| BILL-03 | P2: Download PDF | Tasks | Verified |
| BILL-04 | P2: Download PDF | Tasks | Verified |

**Coverage:** 4 total, 4 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] Zero manual exports in September
