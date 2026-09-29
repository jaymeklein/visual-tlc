# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

### L-001 - Assert the exact persisted status value, not just that a status field exists
- signal: `surviving_mutant` · recurrence: 2 feature(s) · scope: `repo-layer` · harmful: 0
- features: billing-invoices, notifications
- evidence: src/billing/invoice.repo.ts:41 (+1 more)
- last seen: 2026-09-15T12:00:00Z

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-002 - Define the exact HTTP status for every error criterion
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `routes` · harmful: 0
- features: notifications
- evidence: NOTIF-03
- last seen: 2026-09-15T12:00:00Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

### L-003 - Run migrations before the e2e gate
- signal: `gate_fail` · recurrence: 2 feature(s) · harmful: 2
- features: billing-invoices, search-filters
- evidence: package.json:12
- last seen: 2026-09-01T10:00:00Z
