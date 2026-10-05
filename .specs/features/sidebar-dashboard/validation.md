# Sidebar Dashboard Validation

## Validation: sidebar-dashboard - PASS ✅

All 11 requirements match the spec and the gates pass on the installed VS Code (1.120.0) and on the minimum the manifest accepts (1.90.0). The SIDE-03 gap is closed: the test now narrows the side bar to 250px or less and measures the board and the details. Two mutants in the diff survive (M4, M5): two rules of the narrow stylesheet that can be removed without anything scrolling at the measured widths. They do not block delivery and become a follow-up.

**Date**: 2026-09-29
**Spec**: `.specs/features/sidebar-dashboard/spec.md`
**Diff range**: cadcb11..0ab4657 (iteration 3: 90a54c3..0ab4657, branch `feat/sidebar-dashboard`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 65a6be7 | Failed | 10 surviving mutants in the diff, 6 in product code (S4, C2, S5, S6, C3, P4). SIDE-02, 03, 04, and 09 with gaps. SIDE-05 lacking precision. Lessons L-008 to L-014, L-006 promoted |
| 2 | 90a54c3 | Failed | T9 to T15 close the iteration 1 gaps. New finding: the narrow board scrolls horizontally at 255px (VS Code 1.90.0). Lesson L-015 |
| 3 | 0ab4657 | Passed | T16 fixes the stylesheet and measures the view down to 250px or less. T17 hardens the new tests. Full suite on VS Code 1.90.0. M4 and M5 survive, with no effect at the measured widths |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Mark the empty board stages | ✅ Done | 40fe2d8 |
| T2 Report what the webview rendered | ✅ Done | 0349606 |
| T3 Create the Dashboard view in the side bar | ✅ Done | c4d2041 |
| T4 Open the feature in the side bar view | ✅ Done | 8ec2010, completed by T10 and T12 |
| T5 Narrow layout | ✅ Done | cc85728, completed by T16 |
| T6 Come back from the hidden view and update both surfaces | ✅ Done | e5f8fad |
| T7 Clicks inside the side bar view | ✅ Done | 2e75194 |
| T8 Document the side bar dashboard | ✅ Done | 65a6be7 |
| T9 Report only the visible cards | ✅ Done | af6665b |
| T10 Prove the notification button | ✅ Done | ea38828 |
| T11 Pin the 700px threshold | ✅ Done | 8994f8b |
| T12 Prove the feature opened in the tab and the measured scrolling | ✅ Done | 50bcd2f |
| T13 Prove the manifest entries | ✅ Done | 1ee93b6 |
| T14 Prove the click with the side bar closed | ✅ Done | 8fa7057 |
| T15 Name the SIDE-05 events | ✅ Done | 90a54c3 |
| T16 Fit down to 250px | ✅ Done | 32a3d5b. M1, M2, M3, M6, and M7 die. M4 and M5 survive |
| T17 Harden the new tests | ✅ Done | 0ab4657 |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SIDE-01 The extension offers the "Dashboard" view in the TLC Specs container, with the same projects as the editor-tab dashboard | view `tlcSpecs.panel`, named "Dashboard", last in the `tlcSpecs` container; same projects and cards as the tab | `test/integration/suite.cjs:617-620` - `deepEqual(views.map((v) => v.id), ['tlcSpecs.features', 'tlcSpecs.project', 'tlcSpecs.panel'])`. `:621` - `deepEqual(views[2], { type: 'webview', id: 'tlcSpecs.panel', name: 'Dashboard' })`. `:625` - `deepEqual(side.projects, projectIds())`. `:626` - cards equal to the model's features. `:628-629` - `deepEqual(side.projects, tab.projects)` and `deepEqual(side.cards, tab.cards)` | ✅ PASS |
| SIDE-02 WHEN the user triggers "Open Feature in Dashboard" THEN shows the Dashboard view on the feature's details, without opening or closing tabs | feature detail in the side bar view; tabs, active editor, and groups the same as before. Applies to the command, the status bar, and the notification | **Title:** `test/integration/suite.cjs:744` - `title === 'Open Feature in Dashboard'`. **Command:** `:753` - waits for `r.detail === 'notifications'`. `:754-757` - same tabs. `:758` - same active editor. `:759` - `assert.equal(vscode.window.tabGroups.all.length, 1)`. **Notification:** `:850` - waits for `r.detail === 'side-notified'`. `:852` - `assert.match(toast.message, /New spec detected: side-notified/)`. `:853` - `deepEqual(toast.items, ['Open Dashboard'])`. `:854` - `assert.equal(dashboardTab(), undefined)`. **Side bar closed:** `:872` - waits for `r.detail === 'billing-invoices'`. `:873` - `deepEqual(report.projects, projectIds())`. `:874-879` - same tabs, editor, and groups | ✅ PASS |
| SIDE-03 WHILE the view is under 700px THEN stages in one column, no horizontal scrolling | 1 column and no scrolling below 700px. The spec gives the usual side bar range: 250 to 500px | **Default width:** `test/integration/suite.cjs:689` - `assert.ok(board.width < 700)`. `:690` - `assert.equal(board.columns, 1)`. `:692` - `assert.equal(board.overflow, false)`. **Narrowing:** `:715-727` - loop down to 250px or less; at each step `:723` - `assert.equal(narrow.columns, 1)` and `:725` - `assert.equal(narrow.overflow, false)`. `:728` - `assert.ok(narrow.width <= 250)`. **Details:** `:729` and `:737` - three features at the smallest width and at the restored width, `:700` - `assert.equal(detail.overflow, false)`. **Threshold:** `test/unit/webview.test.ts:172-176` - single `@media (max-width: 699px)` block, with the one-column rule. `:178` - `h3 { flex-wrap: wrap; }` in the block | ✅ PASS |
| SIDE-04 WHILE the view is under 700px THEN hides the stages without features | empty stages hidden; stages with features visible | `test/integration/suite.cjs:691` - `assert.equal(board.emptyStages, 0)`. `:693` - displayed cards equal to the model's features. `:724` and `:726` - the same two assertions at each width in the loop. `test/unit/webview.test.ts:177` - `.column.is-empty { display: none; }` inside the block. `:181` - rule absent outside it. `test/unit/webview.test.ts:160-165` - `is-empty` only on columns without cards | ✅ PASS |
| SIDE-05 WHEN an artifact is created, changed, or removed THEN the view shows the current features, each in its current phase | every card with the same phase as the model, after each event | `test/integration/suite.cjs:635-636` - "feature: phase" pairs from the screen and from the model. **Created:** `:645` - cards equal to the model. `:647` - `deepEqual(onCards(created), inModel())`. `:651` - the same after creating `tasks.md`. **Changed:** `:655` - waits for the phase `'Awaiting verification'`. `:657` - phase different from the previous one. `:658` - `deepEqual(onCards(changed), inModel())`. **Removed:** `:662-663` - card disappears. `:664` - `deepEqual(onCards(removed), inModel())` | ✅ PASS |
| SIDE-06 WHEN the view becomes visible again THEN shows the current projects and the selected feature | projects from the current configuration and the same feature in detail | `test/integration/suite.cjs:794-796` - selects, closes the side bar, and waits for the report to clear. `:800` - nothing rendered while the view is hidden. `:804` - `deepEqual(report.projects, projectIds())`. `:805` - `assert.equal(report.detail, 'user-auth')` | ✅ PASS |
| SIDE-07 WHEN the user clicks an artifact in the Dashboard view THEN opens the markdown preview | preview tab for the file, with no text editor and no dashboard tab | `test/integration/suite.cjs:835-836` - `sidePanelMessage({ type: 'previewFile', ... })` + `expectPreviewOf('design.md')` (`:146-150`). `:837` - `assert.equal(dashboardTab(), undefined)`. Renderer: `test/unit/webview.test.ts:44-53`, `:74-76` | ✅ PASS (residual: API limit) |
| SIDE-08 WHEN the user runs "Open Dashboard in Editor Tab" THEN opens a tab named "TLC Specs" | command titled "Open Dashboard in Editor Tab"; `TLC Specs` tab | `test/integration/suite.cjs:771` - title `'Open Dashboard in Editor Tab'`. `:772-775` - `view/title` with `when` equal to `'view == tlcSpecs.features || view == tlcSpecs.panel'`. `:780` - waits for the `TLC Specs` tab. `:782` - `deepEqual(report.projects, projectIds())`. `:783` - `assert.equal(report.detail, null)`. `:789` - a new tab opened on a feature shows `detail === 'billing-invoices'`. Tab already open: `:72` and `:74` | ✅ PASS |
| SIDE-09 WHILE the editor-tab dashboard is 700px or wider THEN six stages side by side | 6 columns from 700px up | `test/integration/suite.cjs:580-581` - `width >= 700` and `assert.equal(report.columns, 6)`. `:595-596` - the same tab next to the side bar, `width >= 700` and 6 columns. `:583` and `:597` - `overflow === (width < 1298)`. `:584` and `:598` - visible empty stages equal to the model's. `test/unit/webview.test.ts:172-175` - the threshold is 699 and there is only one narrow block. `:180` - 6-column rule outside the block | ✅ PASS |
| SIDE-10 WHEN the view and the tab are open THEN updates both | both surfaces with the new projects | `test/integration/suite.cjs:822-823` - waits for the new ids in the tab and in the view. `:824-825` - `deepEqual` of both surfaces' cards against the model's features | ✅ PASS |
| SIDE-11 IF the workspace has no specs folder THEN the view shows "No specs found" | exact text "No specs found" | `test/integration/suite.cjs:673` - `assert.equal(report.emptyMessage, 'No specs found')`. `:674-676` - no projects, no cards, 0 columns. `:681-682` - projects come back and the message disappears | ✅ PASS |

**Status**: ✅ All ACs covered. 11 of 11 requirements match the spec outcome. No precision gaps.

### SIDE-03: what was measured

| Environment | View widths | Result |
| -------- | ---------------- | --------- |
| VS Code 1.120.0 (installed) | 299px and 239px | board in 1 column, no scrolling. Details of 3 features with no scrolling at both widths |
| VS Code 1.90.0 (manifest minimum) | 255px and one step below | full suite: 46/46 + 1 + 1. In iteration 2 this same test failed |

- **The iteration 2 finding is confirmed and closed.** Removing `h3 { flex-wrap: wrap; }` makes the test fail with "the board scrolls sideways at 239px" on VS Code 1.120 (M1). The cause was the width, not the version.
- **The loop really measures.** A fault that fits at 299px and overflows at 239px dies on the board (M7) and in the details (M6).
- **Limit of the proof.** The loop stops at the first width of 250px or less. On VS Code 1.120 that gives two widths. VS Code lets the side bar shrink to about 170px, and that range is not in the suite. The author reports a manual measurement at 179px; I did not repeat it.
- **On VS Code 1.90.0** the width of the narrow step is not in the log of a passing run. I only record that the suite passed.

### Does the report read the screen or mirror the state?

No code change since iteration 2 (`src/` did not change in 90a54c3..0ab4657).

| Field | Source (`src/webview/main.ts`) | Judgment |
| ----- | ------------------------------ | ---------- |
| `projects` | `:60` - `projects.map((p) => p.id)` | Mirror of the state, documented in `src/core/protocol.ts:8-10` |
| `cards` | `:61` - `shown('.card-name')` | Only displayed elements (`offsetParent !== null`, `:57`) |
| `phases` | `:62` - `shown('.card-phase')` | Only displayed elements, in card order |
| `detail` | `:63` - `.detail-title .mono` | Read from the DOM |
| `columns` | `:64` - computed `gridTemplateColumns` | Real layout. Measures only the first board |
| `emptyStages` | `:65` - `shown('.column.is-empty')` | Real layout |
| `emptyMessage` | `:66` - `.empty-state h1` | Read from the DOM |
| `width` | `:67` - `window.innerWidth` | Real measurement |
| `overflow` | `:68` - `scrollWidth > clientWidth` | Real measurement, checked in both directions |

### Judgment of the surviving mutants

- **M4 and M5 (new)**: without the rules `.sub-head, .phase-head { flex-wrap: wrap; }` and `.crumb-actions { min-width: 0; }` nothing scrolls at 299px or 239px in the three features the test opens. I don't know whether they matter below 239px or in the other five fixture features. I did not classify them: that calls for a width sweep, and the coordinator asked me not to start sweeps on my own. They do not block because the SIDE-03 proof does not depend on them: with or without the two rules, the measured widths do not scroll.
- **H3b and H4 (`live` guard)**: accepted since iteration 2 as equivalent on VS Code 1.120. The measurement on VS Code 1.90 is still pending.
- **H5, N4, and N5**: instrumentation only.
- **X1**: real click inside the webview, API limit.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-side3 HEAD`, with a junction for `node_modules`. One mutation at a time, reverted before the next. No `git stash`. Every run that opens VS Code went through the hidden desktop launcher, one at a time, in the foreground. 9 runs, out of a limit of 10.

### Iteration 3 (HEAD 0ab4657)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `media/dashboard.css:308` | Narrow layout without `h3 { flex-wrap: wrap; }` | ✅ Killed (stylesheet unit test; SIDE-03/04: "the board scrolls sideways at 239px") |
| M2 | `media/dashboard.css:326` | Narrow layout without `.rows li > .grow { ... }` | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M3 | `media/dashboard.css:318` | Narrow layout without `.feature-actions { ... }` | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M4 | `media/dashboard.css:319` | Narrow layout without `.sub-head, .phase-head { flex-wrap: wrap; }` | ❌ Survived. No effect at the measured widths, see Follow-up 1 |
| M5 | `media/dashboard.css:317` | Narrow layout without `.crumb-actions { min-width: 0; }` | ❌ Survived. No effect at the measured widths, see Follow-up 1 |
| M6 | `media/dashboard.css:323` | Detail title with a 250px `min-width` (fits at 299px, not at 239px) | ✅ Killed (SIDE-03/04: "user-auth scrolls sideways at 239px") |
| M7 | `media/dashboard.css:311` | Summary tiles with a 120px `min-width` (fit at 299px, not at 239px) | ✅ Killed (SIDE-03/04: "the board scrolls sideways at 239px") |

With the unit tests alone, only M1 dies. M2 to M7 depend on the measurement in the integration suite.

Runs that opened VS Code:

| # | Run | Tree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | real | 46/46 + 1 + 1 |
| 2 | M1 | scratch | 45/46, SIDE-03/04 fails |
| 3 | M6 | scratch | 45/46, SIDE-03/04 fails |
| 4 | M7 | scratch | 45/46, SIDE-03/04 fails |
| 5 | M2 | scratch | 45/46, SIDE-03/04 fails |
| 6 | M3 | scratch | 45/46, SIDE-03/04 fails |
| 7 | No mutation, VS Code 1.90.0 | scratch | 46/46 + 1 + 1 |
| 8 | M4 | scratch | 46/46 + 1 + 1 |
| 9 | M5 | scratch | 46/46 + 1 + 1 |

The results from iterations 1 and 2 still hold for what did not change. `src/`, `package.json`, and the rest of the stylesheet are the same as in 90a54c3. The tests T17 touched stayed the same or got stronger, so the earlier kills still hold. I did not rerun old mutations.

**Sensor depth**: targeted at the iteration 3 code (7 mutations in the diff), with the history of iterations 1 and 2
**Result**: 5/7 killed - PASS ✅. The 2 survivors (M4, M5) have no effect at the measured widths and become a follow-up

### Iteration 2 (HEAD 90a54c3), history

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| S4 | `media/dashboard.css:313` | Narrow layout hides every stage | ✅ Killed |
| S5 | `media/dashboard.css:305` | Narrow layout starts below 500px | ✅ Killed (stylesheet unit test) |
| S6 | `media/dashboard.css:305` | Narrow layout starts below 900px | ✅ Killed |
| S7 | `media/dashboard.css:305` | Threshold at 700px (off by one) | ✅ Killed (stylesheet unit test) |
| C2 | `src/extension.ts:47` | Notification button opens the tab | ✅ Killed |
| C3 | `src/extension.ts:57` | `openDashboard` ignores the feature it receives | ✅ Killed |
| P4 | `package.json:120` | Open-in-tab button disappears from the view title | ✅ Killed |
| W2 | `src/webview/main.ts:68` | Report hardcodes `overflow: false` | ✅ Killed |
| W2b | `src/webview/main.ts:68` | Report hardcodes `overflow: true` | ✅ Killed |
| N1 | `src/webview/main.ts:57` | `shown()` does not filter | ✅ Killed |
| N2 | `src/webview/main.ts:57` | `shown()` with the filter inverted | ✅ Killed |
| N3 | `src/webview/main.ts:62` | `phases` with a fixed value | ✅ Killed |
| N6 | `src/webview/main.ts:62` | `phases` in reverse card order | ✅ Killed |
| N7 | `src/webview/main.ts:62` | `phases` frozen at the first report | ✅ Killed |
| N5+S4 | `src/webview/main.ts:61` + `media/dashboard.css:313` | T9 undone together with every stage hidden | ✅ Killed |
| N4 | `src/webview/main.ts:62` | `phases` also reads hidden cards | ❌ Survived (instrumentation only) |
| N5 | `src/webview/main.ts:61` | `cards` also reads hidden cards | ❌ Survived (instrumentation only) |
| H3b | `src/ui/dashboard.ts:58` | Hidden surface stays `live` | ❌ Survived (equivalent on VS Code 1.120) |
| H4 | `src/ui/dashboard.ts:115` | `select` sent before the webview is ready | ❌ Survived (equivalent on VS Code 1.120) |
| H5 | `src/ui/dashboard.ts:81` | Report stored while the surface is down | ❌ Survived (instrumentation only) |
| H1, H2, H3, C1, S1, S2, S3, W1, W3 | regression | Same as in iteration 1 | ✅ Killed (9/9) |
| P3 (probe) | `package.json:83` | `showFeature` loses its title | ✅ Killed |
| X1 (probe) | `src/webview/main.ts:84` | Webview ignores clicks | ❌ Survived (API limit) |

Iteration 2 score: 24 of 29 killed in the diff, 5 accepted survivors.

### Iteration 1 (HEAD 65a6be7), history

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H1 | `src/ui/dashboard.ts:189` | `showSide` opens the editor tab | ✅ Killed |
| H2 | `src/ui/dashboard.ts:159` | Side bar view does not receive the state | ✅ Killed |
| H3 | `src/ui/dashboard.ts:196` | Visibility change is not handled | ✅ Killed |
| H3b | `src/ui/dashboard.ts:54` | Hidden surface stays `live` | ❌ Survived (accepted in iteration 2) |
| H4 | `src/ui/dashboard.ts:111` | `select` sent before the webview is ready | ❌ Survived (accepted in iteration 2) |
| H5 | `src/ui/dashboard.ts:77` | Report stored while the surface is down | ❌ Survived (instrumentation only) |
| C1 | `src/extension.ts:58` | `showFeature` opens the tab | ✅ Killed |
| C2 | `src/extension.ts:47` | Notification button opens the tab | ❌ Survived (closed in iteration 2) |
| C3 | `src/extension.ts:57` | `openDashboard` ignores the feature it receives | ❌ Survived (closed in iteration 2) |
| P1 | `package.json:50` | View without `type: webview` | ✅ Killed |
| P2 | `package.json:77` | Old title "Open Dashboard" | ✅ Killed |
| P4 | `package.json:120` | Button disappears from the Dashboard view title | ❌ Survived (closed in iteration 2) |
| W1 | `src/webview/main.ts:49` | Webview never sends the report | ✅ Killed |
| W2 | `src/webview/main.ts:65` | Report hardcodes `overflow: false` | ❌ Survived (closed in iteration 2) |
| W3 | `src/webview/main.ts:62` | Report hardcodes `emptyStages: 0` | ✅ Killed |
| R1 | `src/webview/render.ts:174` | `is-empty` is never set | ✅ Killed |
| R2 | `src/webview/render.ts:174` | `is-empty` is always set | ✅ Killed |
| S1 | `media/dashboard.css:311` | Narrow layout without the one-column rule | ✅ Killed |
| S2 | `media/dashboard.css:313` | Empty stages are no longer hidden | ✅ Killed |
| S3 | `media/dashboard.css:319` | Detail title with a 280px `min-width` | ✅ Killed |
| S3b | `media/dashboard.css:311` | Board column with a 720px `min-width` | ✅ Killed |
| S4 | `media/dashboard.css:313` | Narrow layout hides every stage | ❌ Survived (closed in iteration 2) |
| S5 | `media/dashboard.css:305` | Narrow layout starts below 500px | ❌ Survived (closed in iteration 2) |
| S6 | `media/dashboard.css:305` | Narrow layout starts below 900px | ❌ Survived (closed in iteration 2) |
| P3 (probe) | `package.json:83` | `showFeature` loses its title | ❌ Survived (closed in iteration 2) |
| X1 (probe) | `src/webview/main.ts:81` | Webview ignores clicks | ❌ Survived (API limit) |
| X2 (probe) | `src/ui/dashboard.ts:91` | `previewFile` opens the text editor | ✅ Killed |

Iteration 1 score: 14 of 24 killed in the diff.

**Isolation (iteration 3)**: `git status --porcelain` of the real tree empty before and after the sensor. Junction removed with non-recursive `rmdir`. Real `node_modules` with 129 entries before and after. `git worktree remove --force` + `git worktree prune`. `git worktree list` shows only the real tree at 0ab4657. VS Code 1.90.0 was downloaded inside the scratch and was removed with it. No scratch process was left running.

---

## Interactive UAT Results (if performed)

Not run. The Verifier runs without a user. The feature has a UI, so UAT is left to the orchestrator.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ⚠️ Two of the five new stylesheet rules have no test that fails without them (M4, M5) |
| Surgical changes | ✅ Iteration 3 adds 5 lines to the narrow block and does not touch `src/` |
| No scope creep | ✅ |
| Matches patterns | ✅ The narrowing loop uses the same report and the same wait as the other tests |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Renderer 1:1 with the criteria. Host with happy path, edge (side bar closed, hidden view, both surfaces, narrow width), and empty (no specs) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Test integrity (90a54c3..0ab4657)**: `test/integration/suite.cjs` has 54 insertions and 10 deletions. `test/unit/webview.test.ts` has 1 insertion. The 10 removed lines:

- SIDE-09 (3 lines): the comment and the two scrolling assertions. The expected value went from `width < 1250` to `width < 1298` (`:583`, `:597`). It is a correction, not a loosening: six 200px columns, five 10px gaps, and 48px of page margin add up to 1298px.
- SIDE-03/SIDE-04 (5 lines): the details loop became the `details()` function (`:695-702`), with the same assertions, called twice.
- Side bar closed (2 lines): the requested detail moved from the assertion into the wait condition (`:872`), and the test gained the projects assertion (`:873`). The wait times out if the detail does not appear.

No assertion was removed or weakened. The test count did not change: 39 unit, 46 + 1 + 1 integration.

---

## Edge Cases

- [x] SIDE-10 Both open surfaces update together: `test/integration/suite.cjs:822-825`
- [x] SIDE-11 Without a specs folder the view shows "No specs found": `test/integration/suite.cjs:673-676`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 39 passed, 0 failed, 0 skipped (exit 0)
- **Integration**: 46/46 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0), on VS Code 1.120.0, via the hidden desktop
- **Integration on VS Code 1.90.0**: 46/46 + 1/1 + 1/1 (exit 0), in the scratch
- **Test count before feature**: 37 unit + 36 integration (counted at cadcb11)
- **Test count after feature**: 39 unit + 48 integration
- **Delta**: +2 unit, +12 integration. In iteration 3: no new tests, only assertions
- **Skipped tests**: none
- **Failures**: none

The author's numbers check out.

---

## Fix Plans (if issues found)

No gap blocks delivery. Two follow-ups and two accepted limits remain.

### Follow-up 1 (non-blocking): two stylesheet rules without proof (M4, M5)

- **Root cause**: `media/dashboard.css:317` and `:319` can be removed without any test failing. The test measures 299px and 239px and opens three of the eight fixture features.
- **Fix task**: extend the loop at `test/integration/suite.cjs:715` down to the smallest width the side bar allows and open every fixture feature in `details()` (`:696`). If M4 and M5 still survive, remove both rules.
- **Done when**: M4 and M5 die, or the rules are removed.
- **Priority**: Minor

### Follow-up 2 (non-blocking): measure the `live` guard on VS Code 1.90

- **Root cause**: H3b and H4 are equivalent on VS Code 1.120. Nobody measured versions 1.90 to 1.119.
- **Fix task**: run the suite on VS Code 1.90.0 with the guard removed from `src/ui/dashboard.ts:115`. If the closed-side-bar test fails, the guard is proven. If it passes, the guard can go.
- **Priority**: Minor

### Accepted limit: real click inside the webview (X1)

The extension host cannot click inside a webview. The listener at `src/webview/main.ts:81-85` predates the feature. No fix task.

### Accepted limit: 700px threshold proven by the stylesheet (S5, S7)

No surface is measured between 500 and 700px. The extension host cannot put a webview at an exact width. The test that reads the stylesheet pins the value 699.

---

## Requirement Traceability Update

The Verifier does not change `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SIDE-01 | Implementing | ✅ Verified |
| SIDE-02 | Implementing | ✅ Verified |
| SIDE-03 | Implementing | ✅ Verified |
| SIDE-04 | Implementing | ✅ Verified |
| SIDE-05 | Implementing | ✅ Verified |
| SIDE-06 | Implementing | ✅ Verified |
| SIDE-07 | Implementing | ✅ Verified |
| SIDE-08 | Implementing | ✅ Verified |
| SIDE-09 | Implementing | ✅ Verified |
| SIDE-10 | Implementing | ✅ Verified |
| SIDE-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requirements match the spec. 0 precision gaps
**Sensor**: iteration 3 with 5/7 killed. 2 survivors with no effect at the measured widths (M4, M5). From the earlier iterations, 5 accepted survivors remain: 2 equivalent on VS Code 1.120 (H3b, H4) and 3 instrumentation-only (H5, N4, N5). Probe X1 survives, API limit
**Gate**: typecheck ok, 39 unit, 46 + 1 + 1 integration, 0 failures, on VS Code 1.120.0 and on 1.90.0

**What works**: Dashboard view in the TLC Specs container. `showFeature`, the status bar, and the notification open the detail in the side bar without touching the tabs, also with the side bar closed. Board in one column with no scrolling at 299px and at 239px, with empty stages hidden. Feature details with no scrolling at both widths. 700px threshold pinned. Creating, changing, and removing an artifact update every card and phase. Return from the hidden view. Preview from the view. "Open Dashboard in Editor Tab" command, also on a feature. Both surfaces update. "No specs found" message.

**Issues found**: no blocking gaps. M4 and M5 remain as a follow-up. The `live` guard is still unmeasured on VS Code 1.90.

**Next steps**: interactive UAT with the user and status updates in `spec.md`. The two follow-ups can become tasks after delivery.
