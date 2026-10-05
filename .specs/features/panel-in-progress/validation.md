# Panel In Progress Validation

## Validation: panel-in-progress - PASS ✅

Passed. All five requirements match the spec. Fix 1 closed the PNL-04 trigger. The mapping from "Hide Completed" to `hideDone` now lives in `actionFor` (`src/webview/render.ts:598-599`), and `test/unit/webview.test.ts:247-248` pins both directions. The five new forms of U10 (V1-V5) die there. Follow-up 1 is closed too. SIDE-09 now measures the no-scroll side, and mutant I4 (board 40px wider) dies only on the new measurement (`test/integration/suite.cjs:616`). The iteration 1 suite would not catch it. Five mutants remain alive in the DOM glue of `src/webview/main.ts`, which no test in the project reaches. They do not block: Fix 1 accepted that limit, and the glue has the same shape already accepted for the page's other controls. They are left to Follow-up 3, optional, and to the spec's manual test.

**Date**: 2026-09-29
**Spec**: `.specs/features/panel-in-progress/spec.md`
**Diff range**: c7cb8dc..c76e51f (branch `feat/panel-in-progress`). Sensor focused on 67b57da..c76e51f
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | af81a85 | Failed | 4/5 requirements match. PNL-04 without evidence for the trigger: U10 alive at `src/webview/main.ts:108`. 12/13 killed. SIDE-09 overflow measured only on the scrolling side (Follow-up 1). 5 VS Code runs |
| 2 | c76e51f | Passed | 5/5 requirements match. Fix 1 closed: V1-V5 killed at `test/unit/webview.test.ts:247-248`. Follow-up 1 closed: I4 dies only at `test/integration/suite.cjs:616`. Follow-up 2 closed. 18/24 killed. The 6 alive are U7 (equivalent) and 5 in the DOM glue, accepted (Follow-up 3). 3 VS Code runs |

---

## Task Completion

Medium scope, without `tasks.md`. The steps are the commits in the diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Specify panel-in-progress | ✅ Done | c05b7b5. Note on SIDE-09 at `.specs/features/sidebar-dashboard/spec.md:79` |
| Split the board into five stages without Completed | ✅ Done | 8b4c2ef. `five-stages` class at `src/webview/render.ts:173`, rule at `media/dashboard.css:131` |
| Hide completed features by default | ✅ Done | 398f29c. `DEFAULT_VIEW` at `src/webview/render.ts:24`, used at `src/webview/main.ts:16`. `boardWidth` at `src/core/protocol.ts:27` and `src/webview/main.ts:68` |
| Describe the Dashboard in the README | ✅ Done | af81a85. `README.md:26` |
| Fix 1: PNL-04 trigger in `actionFor` | ✅ Done | 13276d0. `toggle-done` case at `src/webview/render.ts:598-599`. Listener at `src/webview/main.ts:108`. Test at `test/unit/webview.test.ts:246-249` |
| Follow-up 1: SIDE-09 no-scroll side | ✅ Done | bf1386c. `test/integration/suite.cjs:604-620` |
| Follow-up 2: SIDE-09 Independent Test | ✅ Done | c76e51f. `.specs/features/sidebar-dashboard/spec.md:81` says five columns with the option checked and six with it unchecked |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PNL-01 WHEN the Dashboard opens, in the editor tab or in the side bar, THEN shows "Hide Completed" checked | box checked on open, with its effect on the board | **Render:** `test/unit/webview.test.ts:230` renders `DEFAULT_VIEW`. `:232` - `assert.equal(toggle.length, 1)`. `:233` - `assert.ok('checked' in toggle[0].attrs)`. `:235` - cards equal to the open features. `:236` - `assert.ok(!html.includes('aria-label="Completed"'))`. **Editor tab in VS Code:** `test/integration/suite.cjs:584` - `assert.equal(report.columns, 5)`. `:589` - `deepEqual([...report.cards].sort(), boardNames(...))`, with `:583` requiring a completed feature in the fixture. **Side bar:** `:648` (SIDE-01) and `:716` (SIDE-03/04), cards equal to `boardNames` | ✅ PASS (note 1) |
| PNL-02 WHILE the option is checked, the cards of the features verified with PASS and the Completed column stay off the board | cards = non-completed features, no Completed column | **Render:** `test/unit/webview.test.ts:203` requires a completed feature in the sample. `:204` - `deepEqual(b.cards, b.open)`. `:205` - `deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execution', 'Verification'])`. **VS Code:** `test/integration/suite.cjs:589`. `:588` - `assert.equal(report.emptyStages, emptyStagesOf(...))`, counted over five stages. Side bar: `:648`, `:668`, `:670` - `deepEqual(onCards(created), inModel())`, `:674`, `:681`, `:686-687`, `:716`, `:749`. Editor tab and side bar in `docs/specs`: `:847-848` | ✅ PASS |
| PNL-03 WHILE the option is checked and the Dashboard is 700px or wider, five stages side by side, with no space reserved for Completed | 5-track grid from 700px | **VS Code:** `test/integration/suite.cjs:582` - `report.width >= 700`. `:584` - `assert.equal(report.columns, 5)` at 1092px. `:600` - 5 at 792px. New: `:614` - `assert.ok(wide.boardWidth >= 1040)`, `:615` - `assert.equal(wide.columns, 5)`, `:616` - `assert.equal(wide.overflow, false)`, at 1140px with a 1077px board. The five tracks fit without horizontal scrolling. **Render:** `test/unit/webview.test.ts:206` - `assert.equal(b.boardClass, 'board five-stages')`. **Stylesheet:** `:221-223` - `repeat(5, minmax(200px, 1fr))` after the base rule. `:225` - before the narrow rule | ✅ PASS (note 3) |
| PNL-04 WHEN the user unchecks the option THEN shows the Completed column with the PASS cards, and the six stages side by side | 6 columns, Completed with the completed features | **Trigger:** `test/unit/webview.test.ts:247` - `assert.deepEqual(actionFor({ action: 'toggle-done', checked: 'false' }), { view: { hideDone: false } })`. `:248` - checking again gives `{ view: { hideDone: true } }`. Both without a message to the host. **Result:** `:211` - `deepEqual(b.doneCards, b.complete)`. `:212` - all cards. `:213` - `assert.equal(b.labels.length, 6)`. `:214` - `assert.equal(b.labels[5], 'Completed')`. `:215` - `assert.equal(b.boardClass, 'board')`. 6-track base rule: `:180` and `:220` | ✅ PASS (note 2) |
| PNL-05 WHEN a completed feature is opened from the Features tree or from a notification THEN shows its detail, even with the option checked | detail of the completed feature with `hideDone: true` | **Render:** `test/unit/webview.test.ts:242` - `DEFAULT_VIEW` with the completed feature selected. `:243` - `assert.ok(html.includes('<div class="detail-title">…<span class="mono">${done.name}</span>'))`. **VS Code:** `test/integration/suite.cjs:894` - `assert.equal(feature('billing-invoices').health, 'complete')`. `:895-896` - `showFeature` and `r.detail === 'billing-invoices'` in the side bar | ✅ PASS (note 4) |

**Status**: ✅ All ACs covered. 5 of 5 match the spec. No precision gap.

### Notes

1. **PNL-01, the checked box.** Same as iteration 1. The integration tests do not read the box. In the editor tab and the side bar, the real board opens with 5 columns and no completed features, and only `hideDone: true` produces those two effects (`src/webview/render.ts:166`, `:173`, `:176`). The same `hideDone` writes `checked` on the box (`render.ts:146`), and the unit test pins that at `test/unit/webview.test.ts:233` (U9 dies). I1 proves that `src/webview/main.ts:16` uses the default on both surfaces. Accepted.
2. **PNL-04, the trigger.** The chain now has three links. The `change` listener forwards the box state: `activate(el, { ...el.dataset, checked: String(el.checked) })` (`src/webview/main.ts:108`). `activate` passes that data to `actionFor` and applies the returned `view` (`:75-78`). `actionFor` decides: `hideDone: d.checked === 'true'` (`src/webview/render.ts:598-599`). The decision, which was the iteration 1 risk, is under test in both directions, and V1-V5 die. The remaining glue only reads the DOM and calls `activate`. It has the shape of the click, which also reaches `activate(el)` without a test (`src/webview/main.ts:82-86`), with `actionFor` tested instead (NAV-12, `test/unit/webview.test.ts:112-113`). The spec records that the integration tests do not click inside the webview (`spec.md:37`). G1, G2, G3a, G4 and G5 live in that glue, and G3b dies at typecheck. Accepted, as Fix 1 anticipated. The spec's manual test (`spec.md:60`) covers that glue by hand, and Follow-up 3 records the stronger option.
3. **SIDE-09/PNL-03, overflow on both sides.** Iteration 1 measured the editor tab only with the board below 1040px. Now there are three measurements. Editor tab alone: 1029px board, overflow expected true (`test/integration/suite.cjs:587`). Next to the side bar: 729px, true (`:601`). Without the side bar and the activity bar: 1140px editor tab, 1077px board, overflow expected false (`:614-616`). The measurements come from the failure messages of runs 2 and 3. I4 changes the board `gap` from 10px to 20px (`media/dashboard.css:129`). Five tracks then need 1080px, and the 1077px board scrolls sideways. `:587` and `:601` pass with I4, and only `:616` fails. The unit tests also let I4 through, because `test/unit/webview.test.ts:180` and `:220` pin only the start of the base rule. Without the new measurement, I4 would survive. I5, an always-on overflow, fails first at `:616` and then in SIDE-03/04 (`:715`).
4. **PNL-05, the notification.** Same as iteration 1. The integration test opens a completed feature from the tree (`showFeature`, `test/integration/suite.cjs:895`). The "was verified and completed" notification (`src/ui/notifier.ts:31`) calls the same `dashboard.showSide` as the tree (`src/extension.ts:47`, `:58`). The notification button is proven in SIDE-02 (`suite.cjs:873`). Accepted.
5. **Assumptions without a test with the option checked.** Same as iteration 1. The Completed tile in the summary counts all completed features (`src/webview/render.ts:129`, `:155`), and search does not find completed features (`:166`). Neither is a criterion.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-pnl2 HEAD` (c76e51f), with a `node_modules` junction to the real one. One mutation at a time, applied by exact text replacement and undone with `git checkout` in the scratch before the next. The scratch's `git status --porcelain` empty after each revert. No `git stash`. Each mutation ran with `npm run typecheck` and `npm test`. I4 and I5 passed both and went on to integration, on the hidden desktop, one at a time, in the foreground.

### New mutations (67b57da..c76e51f)

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| V1 | `src/webview/render.ts:599` | U10 in the new form: `hideDone: d.checked !== 'true'` | ✅ Killed (`test/unit/webview.test.ts:247`) |
| V2 | `src/webview/render.ts:599` | `hideDone: true` hardcoded: unchecking does not bring the completed features back | ✅ Killed (`:247`) |
| V3 | `src/webview/render.ts:599` | `hideDone: false` hardcoded: checking does not hide them again | ✅ Killed (`:248`) |
| V4 | `src/webview/render.ts:599` | `hideDone: Boolean(d.checked)`: the string `'false'` counts as true | ✅ Killed (`:247`) |
| V5 | `src/webview/render.ts:598-599` | `toggle-done` case removed: falls through to `default` and returns `{}` | ✅ Killed (`:247`) |
| G3b | `src/webview/main.ts:75-76` | `activate` loses the `data` parameter and uses `el.dataset` | ✅ Killed (typecheck: `main.ts(108,57): error TS2554: Expected 1 arguments, but got 2`) |
| I4 | `media/dashboard.css:129` | Board `gap` from 10px to 20px: five tracks need 1080px | ✅ Killed (`test/integration/suite.cjs:616`, "overflow with a 1077px board in a 1140px tab". 52/53 + 1/1 + 2/2) |
| I5 | `src/webview/main.ts:69` | Overflow always on: `root.scrollWidth >= root.clientWidth` | ✅ Killed (`suite.cjs:616`, the same message, and `:715` in SIDE-03/04. 51/53 + 1/1 + 2/2) |
| G1 | `src/webview/main.ts:108` | `checked: String(!el.checked)`: the glue inverts the box | ⚠️ Survived, accepted (note 2, Follow-up 3) |
| G2 | `src/webview/main.ts:106-109` | `change` listener removed: the box does nothing | ⚠️ Survived, accepted |
| G3a | `src/webview/main.ts:76` | `activate` ignores `data` and reads `el.dataset`: `checked` is lost, and the option never hides again | ⚠️ Survived, accepted |
| G4 | `src/webview/main.ts:108` | The listener calls `activate(el)` without `checked`: same effect as G3a | ⚠️ Survived, accepted |
| G5 | `src/webview/main.ts:84` | The click stops ignoring `toggle-done` | ⚠️ Survived, accepted. The line predates the feature (c7cb8dc:83) |

### Iteration 1 mutations, rerun at c76e51f

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| U1 | `src/webview/render.ts:24` | `DEFAULT_VIEW.hideDone` back to `false` | ✅ Killed (`test/unit/webview.test.ts:233`) |
| U2 | `src/webview/render.ts:173` | `five-stages` class never applied | ✅ Killed (`:206`) |
| U3 | `src/webview/render.ts:173` | `five-stages` class always applied | ✅ Killed (`:215`) |
| U4 | `media/dashboard.css:131` | Five-stage rule removed | ✅ Killed (`:223`) |
| U5 | `media/dashboard.css:131` | `.board.five-stages`, with higher specificity than the narrow rule | ✅ Killed (`:223`) |
| U6 | `src/webview/render.ts:176` | Empty Completed column back on the board with the option checked | ✅ Killed (`:205`, `:236`) |
| U7b | `src/webview/render.ts:166`, `:176` | Completed cards leak onto the board with the option checked | ✅ Killed (`:204`, `:235`) |
| U8 | `src/webview/render.ts:105` | Detail rejects a completed feature with the option checked | ✅ Killed (`:243`) |
| U9 | `src/webview/render.ts:146` | Box never checked | ✅ Killed (`:233`) |
| U11 | `src/webview/main.ts:16` | `main.ts` ignores `DEFAULT_VIEW` | ✅ Killed (typecheck: orphan import, TS6133). A side effect of how the mutation was written. The kill that counts is I1 |
| U7 | `src/webview/render.ts:166` | Removes the `hideDone` term from the filter | ⚠️ Survived. Equivalent, as in iteration 1: `:176` already skips the `done` column |

### Iteration 1 mutations kept without a new run

The code and the assertions that kill them did not change. Only the line numbers of some `suite.cjs` lines did.

| Mutation | File:line | Killed? |
| -------- | --------- | ------- |
| I1 | `src/webview/main.ts:16` | ✅ Killed in iteration 1 (`test/integration/suite.cjs:584`, "6 !== 5". Also `:648`, `:668`, `:716`) |
| I2 | `src/webview/main.ts:16` | ✅ Killed in iteration 1 (`suite.cjs:828`, SIDE-06) |
| I3 | `src/webview/main.ts:68` | ✅ Killed in iteration 1 (`suite.cjs:587`) |
| U10 | `src/webview/main.ts:108` (af81a85) | Replaced. The line changed. The new forms are V1-V5, in `actionFor`, and G1, in the glue |

**Sensor depth**: lightweight, extended. 13 new mutations in the fix diff, 11 from iteration 1 rerun, 3 from iteration 1 kept
**Result**: 18/24 killed in this iteration. The 6 alive are U7, equivalent, and 5 in the DOM glue, accepted by note 2 - PASS ✅

G1, G2, G3a, G4 and G5 survive by construction. The unit tests do not load `main.ts`. The integration tests do not fire DOM events on the page: `ToWebview` only carries `state` and `select` (`src/core/protocol.ts:32-34`). So I did not spend VS Code runs on them. G5 predates the feature, but it sits on the trigger path. By reading, with G5 the click calls `activate(el)` without `checked` and redraws the page before the `change`. The `change` lands on an element already out of the document. The option unchecks, but never checks again.

Runs that opened VS Code, out of the 4 allowed:

| # | Run | Tree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | scratch (c76e51f) | 53/53 + 1/1 + 2/2 |
| 2 | I4 | scratch | 52/53 + 1/1 + 2/2. Only SIDE-09 fails, at `:616` |
| 3 | I5 | scratch | 51/53 + 1/1 + 2/2. SIDE-09 at `:616` and SIDE-03/04 at `:715` |

That makes 3 runs. All logs show the extension loaded from the scratch. The I5 bundle was checked in the scratch's `dist/webview.js`. I4 acts on the stylesheet, which the webview reads straight from `media/` (`src/ui/dashboard.ts:123`).

**SIDE-09 cleanup.** The new measurement sets `workbench.activityBar.location` to `hidden` in the Global scope (`test/integration/suite.cjs:607`). The `finally` restores the value with `undefined` and reopens the side bar (`:617-620`). That is the same state the test ended in before: the side bar open after `:593`. In run 1 the test passed, and so did the 18 following cases in `suite.cjs`. In run 2 the test failed inside the `try`, and the following cases passed. The cleanup holds on both paths. `closeSidebar` and the `update` sit outside the `try` (`:605`, `:607`). If either one fails, nothing has changed yet. The Global scope does not leak between runs: each suite uses a temporary `--user-data-dir`, deleted at the end (`test/integration/run.mjs:22`, `:30`, `:36`).

**Isolation**: the real tree's `git status --porcelain` empty before the sensor and empty after. HEAD stayed at c76e51f, branch `feat/panel-in-progress`, and nothing changed under the verification. Junction removed without recursion (`[System.IO.Directory]::Delete(..., $false)`). `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real tree. Real `node_modules` with 131 entries before and after, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Not performed. The Verifier runs without a user. The spec's independent test (`spec.md:60`) is left for the orchestrator: open the Dashboard in an editor tab in this repository, uncheck "Hide Completed" and check it again. It is the only coverage of the DOM glue (G1-G5).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Fix 1 adds one case to `actionFor` (`src/webview/render.ts:598-599`) and changes one line of the listener. `activate` gained a parameter with a default, so the other callers did not change |
| Surgical changes | ✅ 13276d0: `render.ts` +3 -1, `main.ts` +3 -3, one test. bf1386c: only SIDE-09, +18. c76e51f: one spec line |
| No scope creep | ✅ Nothing beyond Fix 1 and the two follow-ups |
| Matches patterns | ✅ The new case follows the other `actionFor` cases, which read strings from `data-*` (`d.line ? Number(d.line)`, `render.ts:605`). The test follows NAV-12/NAV-13 (`test/unit/webview.test.ts:112`, `:138`). The new measurement follows the two earlier SIDE-09 ones, with `waitFor` and `api.refresh()` |
| Spec-anchored outcome check (asserted values match spec) | ✅ PNL-04 with both `hideDone` values pinned |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Render and `actionFor` 1:1 with PNL-01..05. Integration on both surfaces and on both sides of the overflow |
| Every test maps to a spec requirement - no unclaimed tests | ✅ The new test has PNL-04 in its title. The new measurement sits inside SIDE-09/PNL-02/PNL-03 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Test integrity (67b57da..c76e51f)**: no test line removed. `test/integration/suite.cjs`: 53 cases, from 173 to 176 assertions. `test/unit/webview.test.ts`: from 13 to 14 tests, from 54 to 56 assertions. No old assertion changed. The iteration 1 analysis of c7cb8dc..af81a85 still holds: nothing got weaker.

Non-blocking observations:

- The new measurement depends on the size of the test window. It needs an editor tab of about 1103px without the activity bar: 1040px of board, plus 48px of padding and 15px of scrollbar. On this machine the editor tab is 1140px. On a smaller screen, `test/integration/suite.cjs:614` fails with a clear message, rather than passing vacuously.
- The values 1092, 1140, 1029 and 1077 come from this machine. The assertions do not pin them: they compare widths with each other and with the 1040px limit.

---

## Edge Cases

- [x] PNL-05 A completed feature opened from the tree or from a notification shows its detail with the option checked: `test/unit/webview.test.ts:242-243`, `test/integration/suite.cjs:894-896` (note 4)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0 (scratch at c76e51f)
- **Unit**: 53 passed, 0 failed, 0 skipped (exit 0)
- **Integration**: 53/53 in `suite.cjs`, 1/1 in `startup.cjs`, 2/2 in `multiroot.cjs` (exit 0, run 1)
- **Test count before feature**: 47 unit + 56 integration (53 + 1 + 2, at c7cb8dc)
- **Test count after feature**: 53 unit + 56 integration (53 + 1 + 2)
- **Delta**: +6 unit. No new integration case. SIDE-09 gained a third measurement
- **Skipped tests**: none
- **Failures**: none

The orchestrator's numbers at bf1386c match my run at c76e51f, which only changes a spec.

---

## Fix Plans (if issues found)

### Fix 1: PNL-04 trigger without a test (U10) - closed

- **Resolution**: 13276d0. `actionFor` maps `toggle-done` (`src/webview/render.ts:598-599`). `test/unit/webview.test.ts:247-248` asserts both directions.
- **Done when, checked**: with the mapping inverted in `actionFor` (V1), `npm test` fails at `:247`. With the correct one, it passes. The gate stays green.

### Follow-up 1: SIDE-09 no-scroll side - closed

- **Resolution**: bf1386c. `test/integration/suite.cjs:604-620`. The overflow assertion runs with a `boardWidth` of 1077px and expects false. I4 proves it separates a board that fits from one that does not.

### Follow-up 2: SIDE-09 Independent Test - closed

- **Resolution**: c76e51f. `.specs/features/sidebar-dashboard/spec.md:81`.

### Follow-up 3 (optional, non-blocking): drive the checkbox inside the webview

- **Root cause**: no test fires DOM events on the page. The glue at `src/webview/main.ts:82-86` and `:106-109` is out of reach, and G1, G2, G3a, G4 and G5 live there.
- **Fix task**: a test message from the host to the page that clicks a `[data-action]`. It can sit next to `api.dashboardReport()`, in the test API (`src/extension.ts:91-93`). SIDE-09 would click "Hide Completed" and measure six columns with the completed features, then five again. The same message would serve the NAV-12 clicks. It changes the "Measured in real VS Code" assumption (`spec.md:37`), so it needs a decision from the user.
- **Done when**: G1, G4 and G5 fail in integration, and the gate stays green.
- **Priority**: Minor

---

## Requirement Traceability Update

The Verifier does not edit `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PNL-01 | Implementing | ✅ Verified |
| PNL-02 | Implementing | ✅ Verified |
| PNL-03 | Implementing | ✅ Verified |
| PNL-04 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| PNL-05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 requirements match the spec. 0 precision gaps
**Sensor**: 18/24 killed in this iteration. Alive: U7, equivalent, and G1, G2, G3a, G4, G5, in the DOM glue, accepted. I1-I3 from iteration 1 kept
**Gate**: typecheck ok, 53 unit, 53 + 1 + 2 integration, 0 failures

**What works**: the Dashboard opens with "Hide Completed" checked, in the editor tab and in the side bar. The completed features and the Completed column stay off the board. The five stages sit side by side from 700px and fit without scrolling when the board is 1040px or wider. Below 700px the board stays stacked. Unchecking the option gives `hideDone: false`, and the page draws the six columns with the completed features. Checking it again gives `hideDone: true`. A completed feature opened from the tree or from a notification shows its detail. No test was removed, no assertion was loosened.

**Issues found**: none blocking. The checkbox's DOM glue still has no automated test (Follow-up 3, optional).

**Next steps**: update the `spec.md` statuses to Verified. Run the spec's independent test with the user (UAT), which covers the glue by hand. Decide whether Follow-up 3 goes in.
