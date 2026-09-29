# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Drive the extension-host handler of every new webview message in an integration test, not only the message the webview emits
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: readonly-navigation
- evidence: src/ui/dashboard.ts:65 (webview)
- last seen: 2026-09-29T12:11:05Z

### L-002 - Assert a UI acceptance criterion at its user-visible outcome, not at an intermediate message
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: readonly-navigation
- evidence: NAV-10 (webview)
- last seen: 2026-09-29T12:11:05Z

### L-003 - Test a resource-scoped setting in a multi-root workspace where each folder holds a different value
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `settings` · harmful: 0
- features: specs-folders
- evidence: H12 src/ui/store.ts:129 (settings) (+1 more)
- last seen: 2026-09-29T13:09:09Z

### L-004 - Test every file watcher event the code subscribes to: create, change and delete
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `watchers` · harmful: 0
- features: specs-folders
- evidence: H16 src/ui/store.ts:49 (watchers)
- last seen: 2026-09-29T13:09:09Z

### L-005 - Assert every surface an acceptance criterion lists, exposing a test hook on the extension API when VS Code cannot read the surface
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `extension-host` · harmful: 0
- features: specs-folders
- evidence: SF-03 test/integration/suite.cjs:432 (extension-host)
- last seen: 2026-09-29T13:09:09Z

### L-006 - Name the file events (create, change, delete) that a watcher acceptance criterion covers
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: specs-folders
- evidence: SF-04 spec.md:55 (spec)
- last seen: 2026-09-29T13:09:10Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
