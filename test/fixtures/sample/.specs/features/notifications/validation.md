# Notifications Validation

**Date**: 2026-09-15
**Spec**: `.specs/features/notifications/spec.md`
**Diff range**: main..feat/notifications
**Verifier**: independent sub-agent (author ≠ verifier)

## Validation: Notifications - FAIL ❌

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN invoice issued THEN enqueue | one job | `src/notify/queue.spec.ts:12` - `expect(jobs).toHaveLength(1)` | ✅ PASS |
| IF provider 5xx THEN retry 3x | 3 attempts | `src/notify/sender.spec.ts:30` - `expect(send).toHaveBeenCalled()` | ❌ GAP |
| IF address rejected THEN bounced | status bounced | - | ⚠️ Spec-precision gap |

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1        | `src/notify/sender.ts:22` | Retry count 3 → 1 | ❌ Survived → fix task created |
| 2        | `src/notify/queue.ts:9` | Skip enqueue | ✅ Killed |

**Sensor depth**: lightweight

## Fix Plans (if issues found)

### Fix 1: Retry assertion is shallow

- **Root cause**: Test asserts the call happened, not the attempt count
- **Fix task**: Assert exactly 3 attempts
- **Priority**: Major

## Summary

**Overall**: ❌ Not Ready
