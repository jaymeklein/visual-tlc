# Notifications Tasks

**Status**: Done

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Service | unit | 1:1 to spec ACs | `src/**/*.spec.ts` | `npm test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | unit | `npm test` |
| Build | phase end | `npm run build && npm test` |

## Execution Plan

### Phase 1: Email pipeline

```
T1 → T2
```

## Task Breakdown

### T1: NotificationQueue.enqueue

**What**: Enqueue one email per issued invoice
**Where**: `src/notify/queue.ts`
**Depends on**: None
**Requirement**: NOTIF-01
**Status**: ✅ Complete

**Tests**: unit
**Gate**: quick

---

### T2: Retry and bounce handling

**What**: Exponential backoff and bounce marking
**Where**: `src/notify/sender.ts`
**Depends on**: T1
**Requirement**: NOTIF-02, NOTIF-03
**Status**: ✅ Complete

**Tests**: unit
**Gate**: quick
