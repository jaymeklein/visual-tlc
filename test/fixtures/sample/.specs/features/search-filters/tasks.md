# Search Filters Tasks

**Status**: In Progress

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Component | unit | 1:1 to spec ACs | `src/**/*.test.tsx` | `pnpm test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | unit | `pnpm test` |
| Build | phase end | `pnpm build && pnpm test` |

## Execution Plan

### Phase 1: Filters

```
T1 → T2 → T3
```

## Task Breakdown

### T1: Status filter component

**What**: Dropdown with order statuses
**Where**: `src/orders/StatusFilter.tsx`
**Depends on**: None
**Requirement**: SRCH-01

**Done when**:

- [x] Renders all statuses

**Tests**: unit
**Gate**: quick

---

### T2: Sync filter with URL

**What**: Read/write the status filter from the query string
**Where**: `src/orders/useOrderFilters.ts`
**Depends on**: T1
**Requirement**: SRCH-01, SRCH-02

**Done when**:

- [x] Filter survives reload

**Tests**: unit
**Gate**: quick

---

### T3: Clear filter button

**What**: Resets the filter
**Where**: `src/orders/OrdersToolbar.tsx`
**Requirement**: SRCH-02

**Done when**:

- [x] Clearing shows all orders

**Tests**: unit
**Gate**: quick
