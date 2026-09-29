# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

### L-002 - Assert a UI acceptance criterion at its user-visible outcome, not at an intermediate message
- signal: `ac_gap` · recurrence: 2 feature(s) · scope: `webview` · harmful: 0
- features: readonly-navigation, specs-folders
- evidence: NAV-10 (webview) (+1 more)
- last seen: 2026-09-29T13:40:46Z

### L-006 - Name the file events (create, change, delete) that a watcher acceptance criterion covers
- signal: `spec_precision_gap` · recurrence: 2 feature(s) · scope: `spec` · harmful: 0
- features: specs-folders, sidebar-dashboard
- evidence: SF-04 spec.md:55 (spec) (+1 more)
- last seen: 2026-09-29T15:08:17Z

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Drive the extension-host handler of every new webview message in an integration test, not only the message the webview emits
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: readonly-navigation
- evidence: src/ui/dashboard.ts:65 (webview)
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

### L-007 - Drive a test hook from the real side effect, not from a value recorded beside it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `test-hooks` · harmful: 0
- features: specs-folders
- evidence: N2 src/ui/dashboard.ts:87 (test-hooks) (+2 more)
- last seen: 2026-09-29T14:04:07Z

### L-008 - Count only displayed elements when a test hook reports what a webview shows
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: sidebar-dashboard
- evidence: S4 media/dashboard.css:313 (webview)
- last seen: 2026-09-29T15:08:17Z

### L-009 - Drive every trigger the spec lists for an action, including callbacks that bypass the command
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `extension-host` · harmful: 0
- features: sidebar-dashboard
- evidence: C2 src/extension.ts:47 (extension-host)
- last seen: 2026-09-29T15:08:17Z

### L-010 - Pin a layout threshold with a test on the stylesheet when a webview cannot be measured near the value
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: sidebar-dashboard
- evidence: S5 media/dashboard.css:305 (webview)
- last seen: 2026-09-29T15:08:17Z

### L-011 - Assert the effect of every argument a test passes to a command
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: sidebar-dashboard
- evidence: C3 src/extension.ts:57 (tests)
- last seen: 2026-09-29T15:08:17Z

### L-012 - Assert every manifest contribution a feature adds or changes
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `manifest` · harmful: 0
- features: sidebar-dashboard
- evidence: P4 package.json:120 (manifest)
- last seen: 2026-09-29T15:08:17Z

### L-013 - Keep a defensive guard only with a test that fails without it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `extension-host` · harmful: 0
- features: sidebar-dashboard
- evidence: H4 src/ui/dashboard.ts:111 (extension-host) (+1 more)
- last seen: 2026-09-29T17:12:11Z

### L-014 - Give every flag a test hook reports one test that expects true and one that expects false
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `test-hooks` · harmful: 0
- features: sidebar-dashboard
- evidence: W2 src/webview/main.ts:65 (test-hooks)
- last seen: 2026-09-29T15:08:17Z

### L-015 - Measure a narrow layout at the smallest width the spec names, not only at the default width of the test window
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `webview` · harmful: 0
- features: sidebar-dashboard
- evidence: SIDE-03 test/integration/suite.cjs:685 (webview)
- last seen: 2026-09-29T15:57:24Z

### L-016 - Test the same invalid value in two settings at once when both settings share one warning routine
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `settings` · harmful: 0
- features: exclude-folders
- evidence: H6 src/ui/store.ts:119 (settings)
- last seen: 2026-09-29T17:51:51Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
