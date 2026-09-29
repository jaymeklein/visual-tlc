# Billing Invoices Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill.

---

**Design**: none (Medium scope - designed inline)
**Status**: Done

---

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Service | unit | 1:1 to spec ACs | `src/**/*.spec.ts` | `npm run test:unit` |
| Route | e2e | happy + edge + error | `test/e2e/*.e2e.ts` | `npm run test:e2e` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | unit only | `npm run test:unit` |
| Full | e2e | `npm run test:unit && npm run test:e2e` |
| Build | phase end | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Generation

```
T1 → T2
```

### Phase 2: Download

```
T3
```

---

## Task Breakdown

### T1: InvoiceGenerator service ✅

**What**: Create invoices for active subscriptions, idempotent per period
**Where**: `src/billing/invoice.generator.ts`
**Depends on**: None
**Requirement**: BILL-01, BILL-02

**Done when**:

- [x] One invoice per subscription per period
- [x] Re-run skips existing invoices

**Tests**: unit
**Gate**: quick

---

### T2: Monthly cron job ✅

**What**: Schedule the generator on the 1st of the month
**Where**: `src/billing/invoice.cron.ts`
**Depends on**: T1
**Requirement**: BILL-01

**Done when**:

- [x] Job registered with the scheduler

**Tests**: unit
**Gate**: build

---

### T3: PDF download route ✅

**What**: GET /invoices/:id/pdf scoped to the customer
**Where**: `src/billing/invoice.controller.ts`
**Depends on**: None
**Requirement**: BILL-03, BILL-04

**Done when**:

- [x] Returns application/pdf
- [x] Other customers get 404

**Tests**: e2e
**Gate**: full
