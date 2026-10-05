# Eye On Every Spec Validation

## Validation: eye-on-every-spec - PASS ✅

Approved in iteration 1. All 11 requirements match the spec, and the evidence for each one discriminates. There is no precision gap. The sensor ran 24 mutations and killed the 23 that change behavior. The other one, C9, is equivalent: it renames the new list, which no earlier version saved. The hidden-specs tests that said "completed has no eye" and "completed is not dimmed" now follow the new rule, and no other assertion was removed. The gate at b438661 is green: typecheck ok, 68 unit, 63 + 1 + 1 integration.

**Date**: 2026-09-30
**Spec**: `.specs/features/eye-on-every-spec/spec.md`
**Diff range**: branch `feat/hidden-specs`, eye commits: T1 abcd78b, T2 1aa9934, T3 5767f3c, T4 0de28fe. Spec at 41821b4. Commits c7f3046, 81406a3, 87b3b5a, 6901713, and b438661 belong to specs-folder-paths and are out of scope. Lines cited at b438661
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 1 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b438661 | Approved | 11/11 requirements match and discriminate. 0 precision gaps. 23/23 killed, plus the equivalent C9. 4 VS Code runs |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Per-spec choice: hidden, in view, or none | ✅ Done | abcd78b. `src/core/hidden.ts:13-19` (two keys and `Choice`), `:25` (`isHidden`), `:41-44` (`choiceOf`), `:60-71` (`set` with the default rule). The four calls pass `complete` |
| T2 Eye on every card | ✅ Done | 1aa9934. `src/webview/render.ts:94-98` (`choiceOf`, `hiddenOf`), `:187` (`withDone`), `:255-260` (`eyeButton` without the empty return), `:271` (`is-hidden` from `hiddenOf`) |
| T3 Host and tree with the choice | ✅ Done | 5767f3c. `src/core/protocol.ts:36`, `src/ui/dashboard.ts:97`, `:117`, `src/ui/featuresTree.ts:96-97`, `:273-277`, `src/extension.ts:46`, `:65-66`, `src/webview/main.ts:17`, `:32`, `package.json:166-221` without `feature.done`. `isMarked` was removed |
| T4 Document the eye on every spec | ✅ Done | 0de28fe. `README.md:12`, `:25-27`. Notes in `.specs/features/hidden-specs/spec.md:86` and `:92` (note 6) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EYE-01 The extension shows an eye on every spec, on the row and on the card, completed or not | row with `contextValue` `feature` or `feature.hidden`, each with its own inline eye; card with a `hide` or `unhide` button | **Row:** `test/integration/suite.cjs:531-532` - `hideFeature` inline on `viewItem == feature`, `unhideFeature` on `viewItem == feature.hidden`. `:542` - in progress `'feature'`. `:543` - marked `'feature.hidden'`. `:546` - completed with no choice `'feature.hidden'`. `:549` - completed in view `'feature'`. **Card:** `test/unit/webview.test.ts:329`, `:330`, `:332`, `:335`, `:338` - one eye in each of the five cases | ✅ PASS |
| EYE-02 WHILE in view, open eye "Hide Spec" | `hideFeature` command with `$(eye)` and "Hide Spec"; card `{ action: 'hide', title: 'Hide Spec', glyph: 'eye-open' }` | `suite.cjs:528` - `deepEqual(declared('tlcSpecs.hideFeature'), { ..., title: 'Hide Spec', ..., icon: '$(eye)' })`. `:542`, `:549`, `:620` - `'feature'`. `webview.test.ts:329` (in progress) and `:338` (completed in view) - `[{ action: 'hide', title: 'Hide Spec', glyph: 'eye-open' }]` | ✅ PASS |
| EYE-03 WHILE hidden, closed eye "Unhide Spec" | `unhideFeature` command with `$(eye-closed)` and "Unhide Spec"; card `{ action: 'unhide', title: 'Unhide Spec', glyph: 'eye-closed' }` | `suite.cjs:529` - `title: 'Unhide Spec'`, `icon: '$(eye-closed)'`. `:543`, `:546` - `'feature.hidden'`. `webview.test.ts:330` (marked), `:332` (completed with no choice), `:335` (marked and completed) - `[{ action: 'unhide', title: 'Unhide Spec', glyph: 'eye-closed' }]` | ✅ PASS |
| EYE-04 WHEN "Hide Spec", in the tree or on the card, THEN it leaves the tree and the board with the top eye closed and adds to the hidden count, completed or not | out of the tree and the board; count +1 | **In progress, row:** `suite.cjs:566-571` - out of Features, message `done + 1`, out of the editor tab, `hiddenLabel(done + 1)`. **In progress, card:** `:1004-1011` - out of the editor tab and the side bar, `hiddenLabel(before + 1)`; `:490-491` - message `done + 1`. **Completed in view, row:** `:623-625` - `ok(!treeNames().includes('billing-invoices'))`, `message(done)`. **Completed in view, card:** `:645-649` - out of the editor tab, 5 columns, `hiddenLabel(done)`. **Core:** `test/unit/hidden.test.ts:100-101` - `set(billing, true, false)` saves `'hidden'` | ✅ PASS (note 1) |
| EYE-05 WHEN "Unhide Spec" on a completed spec THEN it appears in the tree and in the Completed column with the top eye closed, and leaves the count | in the tree, in Completed, count -1 | **Row:** `suite.cjs:617-621` - `unhideFeature` with the node, title eye closed, `ok(treeNames().includes('billing-invoices'))`, `'feature'`, `message(done - 1)`. **Card:** `:639-643` - in the editor tab, `kept.columns === 6`, `hiddenLabel(done - 1)`, title `'Show Hidden Specs'` (closed eye). **Column:** `webview.test.ts:366-370` - six labels up to `'Completed'`, `doneCards` = `['billing-invoices']`, `'0 hidden'`. **Core:** `hidden.test.ts:84`, `:90-94` | ✅ PASS (note 1) |
| EYE-06 WHILE completed with no choice, it is treated as hidden | hidden | `hidden.test.ts:74` - `equal(isHidden(f('complete'), undefined), true)`. `webview.test.ts:238-240` - board without the completed specs, five stages. `suite.cjs:546` - `'feature.hidden'`. `:595` - `' · hidden'`. `:613` - out of Features. `:636-637` - 5 columns, `hiddenLabel(done)` | ✅ PASS |
| EYE-07 WHILE the top eye is closed and some completed spec is in view, Completed column with it, six stages | six columns, the last one Completed with the completed spec in view | `webview.test.ts:366` - `['Spec', 'Design', 'Tasks', 'Execution', 'Verification', 'Completed']`. `:367` - `doneCards` = `['billing-invoices']`. `:369` - `boardClass === 'board'`. `suite.cjs:641` - `kept.columns === 6`. With no completed spec in view: `webview.test.ts:239-240`, `suite.cjs:636`, `:648` - five | ✅ PASS |
| EYE-08 WHILE the top eye is open, every hidden spec dimmed on the Dashboard and with "· hidden" in the tree, completed or not | `is-hidden` with lower opacity and " · hidden" on every hidden spec; absent on the spec in view | **Card:** `webview.test.ts:356` - `'card h-ok is-hidden'`. `:359` - `'card h-complete is-hidden'`. `:357` and `:361` - no `is-hidden` in view. `:376-378` - one `.card.is-hidden` rule with opacity < 1. **Row:** `suite.cjs:593` and `:595` - `match(/ · hidden$/)`. `:591` and `:598` - `doesNotMatch(/hidden/)` in view | ✅ PASS |
| EYE-09 WHEN VS Code reopens the workspace THEN the choices persist | a new instance over the same state reads both lists | `hidden.test.ts:92` - `equal(reopened.choiceOf(billing), 'shown')`. `:93-94` - `shownKeys` and `keys`. `:99` - an old mark in `tlcSpecs.hidden` stays `'hidden'`. `:101-102` - `'hidden'` in a new instance. Link to `workspaceState`: `src/extension.ts:44`, unchanged | ✅ PASS (note 2) |
| EYE-10 WHEN a completed spec in view is hidden THEN the choice is cleared, and it is hidden again because it is completed | choice `undefined`, both lists empty, hidden | `hidden.test.ts:111` - `equal(reopened.choiceOf(billing), undefined)`. `:112-113` - `keys` and `shownKeys` empty. `:122-124` - a choice equal to the default neither saves nor notifies. `suite.cjs:623-625` and `:647-649` - hidden again | ✅ PASS |
| EYE-11 WHEN a manually hidden spec is opened from the tree or from a notification THEN its detail is shown, as in HID-15 | spec detail with the closed eye | `webview.test.ts:318-319` - `DEFAULT_VIEW` with csv-export marked and selected shows the detail title. `suite.cjs:1223-1226` - marks it, `showFeature`, `r.detail === 'csv-export'`, `toggle === null` | ✅ PASS (note 3) |

**Status**: ✅ All ACs covered. 11/11 match the spec and discriminate. 0 precision gaps.

### Notes

1. **EYE-04/EYE-05, both triggers.** Each trigger for the completed spec is asserted on its own surfaces: the row in the tree and in the message (`suite.cjs:617-625`), the card in the editor tab and in the count (`:639-649`). The cross paths (row → Dashboard, card → tree) go through the same `HiddenSpecs` and `onDidChange`, which HID-11/12 proves in both directions for the in-progress spec (`:566-571`, `:1004-1011`, `:490-491`). What is specific to the completed spec is the `complete` that comes from the store, and mutating it is caught on both sides: H6 at `:619` (row), H4 at `:598` and `:640` (card). Accepted. The editor tab test counts columns and cards, not the column of each card. The column comes from `columnOf` (`render.ts:108`), which did not change, and the unit test pins it (`webview.test.ts:367`).
2. **EYE-09, the link to `workspaceState`.** Same case as HID-13 in hidden-specs (note 3 there): the unit test proves both lists with a fake `Memento` read by a new instance. C8, which does not save `tlcSpecs.shown`, is killed at `:92`. C7, which changes the old key, is killed at `:99`. The link is the line `new HiddenSpecs(context.workspaceState)` (`src/extension.ts:44`), which this feature did not change. No test reloads VS Code. Accepted for the same reason. The success criterion "stays in view after reloading the window" is left for UAT.
3. **EYE-11.** This is the HID-15 case, with no new code here: `detail()` does not look at the choice. The hidden-specs proofs still hold, and the notification uses the same `dashboard.showSide`. No new mutant ran on it.
4. **The spec's "n" assumptions.** A completed spec in view that fails again stays in view: `hidden.test.ts:85`. A manually hidden spec that is later completed stays hidden: `hidden.test.ts:76`, `webview.test.ts:335`. The hidden count counts each spec once: `webview.test.ts:300`, `:371`. A choice equal to the default is not saved: `hidden.test.ts:116-125`. With no completed spec in view, five stages: `webview.test.ts:239-240`.
5. **Lessons checked.** L-002: the Dashboard is asserted on the cards, the columns, and the top button; the tree on the children, the `TreeItem`, and the message. L-009: hiding and showing the completed spec go through the row (command with the node, `suite.cjs:617`, `:623`) and through the card (host message, `:548`, `:639`, `:645`). L-006 and L-014 do not apply. The candidates hold: L-020 on the marked completed spec (`webview.test.ts:335`) and on the count with one marked spec and one in view (`:371`); L-021 on the absence of `is-hidden` and "· hidden" in view (`:357`, `:361`, `suite.cjs:591`, `:598`); L-022 on zero (`webview.test.ts:370`); L-024 on a choice equal to the default by itself (`hidden.test.ts:116-125`). No confirmed lesson recurred.
6. **Note in hidden-specs.** The HID-09/10 note (`.specs/features/hidden-specs/spec.md:86`) sits between items 10 and 11, with no blank line before 11. The extension's parser reads items line by line (`src/core/spec.ts:27`) and is not affected. The project's `marked` 18 separates the quote from the list. In CommonMark, an item that does not start at 1 does not interrupt a paragraph, so in the VS Code preview items 11 to 14 may fall inside the quote. Cosmetic. Fix: a blank line after the note, or the note after item 14, like the HID-14 note (`:92`).
7. **The EYE-05/07 precondition in the editor tab.** `suite.cjs:635` accepts the first report without billing-invoices, without waiting for the count. In sensor run 2, the two previous tests failed early, and the test read a stale report, with csv-export still hidden: `'2 hidden'` at `:637`. Without a mutant, the previous test takes long enough, and the gate passes. Suggestion, not a gap: add `r.toggle?.text === hiddenLabel(done)` to the predicate at `:635`.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-eye b438661`, with a `node_modules` junction to the real one. Each mutant is a text replacement that requires exactly one occurrence, applied by script and reverted with `git checkout -- .` in the scratch tree. The scratch `git status --porcelain` was empty after each revert. No `git stash`. Unit ran one mutation at a time, with `npm run typecheck` and `npm test`: all compile. Integration ran in three batches, and each mutant in a batch fails at a point of its own.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/hidden.ts:25` | `isHidden` without `choice !== 'shown'`: a completed spec is always hidden | ✅ Killed (`test/unit/hidden.test.ts:84`; `webview.test.ts:338`, `:361`, `:366`) |
| C2 | `src/core/hidden.ts:25` | `isHidden` without `choice === 'hidden'`: the marked in-progress spec stays in view | ✅ Killed (`hidden.test.ts:75`; 6 webview tests, starting at `:246`) |
| C3 | `src/core/hidden.ts:43` | `choiceOf` ignores the in-view list | ✅ Killed (`hidden.test.ts:92`, `:113`) |
| C4 | `src/core/hidden.ts:61` | `set` always saves the choice, without the default rule | ✅ Killed (`hidden.test.ts:37`, `:111`, `:122`) |
| C5 | `src/core/hidden.ts:64` | `set` does not remove the spec from the hidden list | ✅ Killed (`hidden.test.ts:37`, `:59`) |
| C6 | `src/core/hidden.ts:65` | `set` does not remove the spec from the in-view list | ✅ Killed (`hidden.test.ts:111`) |
| C7 | `src/core/hidden.ts:14` | Old key `tlcSpecs.hidden` changed: saved marks are lost | ✅ Killed (`hidden.test.ts:99`) |
| C8 | `src/core/hidden.ts:69` | `set` does not save `tlcSpecs.shown` | ✅ Killed (`hidden.test.ts:92`) |
| C10 | `src/core/hidden.ts:62` | `set` without the early return when nothing changes: always notifies | ✅ Killed (`hidden.test.ts:55`, `:122`) |
| R1 | `src/webview/render.ts:96` | The Dashboard's `choiceOf` ignores `ctx.shown` | ✅ Killed (`webview.test.ts:338`, `:361`, `:366`) |
| R2 | `src/webview/render.ts:187` | `withDone` goes back to depending only on the top eye | ✅ Killed (`webview.test.ts:366`) |
| R3 | `src/webview/render.ts:187` | `withDone` without the top eye: with a filter and no completed spec, five stages with the eye open | ✅ Killed (`webview.test.ts:163`, SIDE-04) |
| R4 | `src/webview/render.ts:257` | The card eye goes back to looking only at the mark | ✅ Killed (`webview.test.ts:332`) |
| R5 | `src/webview/render.ts:255` | `if (f.health === 'complete') return ''` comes back | ✅ Killed (`webview.test.ts:332`) |
| R6 | `src/webview/render.ts:271` | `is-hidden` only on the marked spec | ✅ Killed (`webview.test.ts:359`) |
| R7 | `src/webview/render.ts:271` | `is-hidden` on every completed spec | ✅ Killed (`webview.test.ts:361`) |
| H1 | `src/ui/featuresTree.ts:275` | `feature.done` comes back on the completed spec | ✅ Killed (`test/integration/suite.cjs:546`, `'feature.done'` instead of `'feature.hidden'`) |
| H2 | `src/ui/featuresTree.ts:277` | "· hidden" only on the marked spec | ✅ Killed (`suite.cjs:595`, `'Completed · 100%'`) |
| H3 | `src/ui/featuresTree.ts:97` | The tree's `isHidden` ignores the in-view choice | ✅ Killed (`suite.cjs:549`, `:598`, `:619`) |
| H4 | `src/ui/dashboard.ts:97` | The Dashboard's `setHidden` always with `complete = false` | ✅ Killed (`suite.cjs:598`; `:640`, "timed out waiting for: billing-invoices to show in the tab") |
| H5 | `src/ui/dashboard.ts:117` | `state` message with `shown: []` | ✅ Killed in run 4 (`suite.cjs:640`, timeout). In run 2 it failed earlier, at `:637`, from a stale report (note 7): not counted |
| H6 | `src/extension.ts:46` | The row commands' `setHidden` always with `complete = false` | ✅ Killed (`suite.cjs:619`, "billing-invoices left Features") |
| M1 | `package.json:186` | Inline closed eye on `viewItem == feature.done`: the hidden row loses its eye | ✅ Killed (`suite.cjs:532`) |

Equivalent mutant, run and not counted: C9, `src/core/hidden.ts:16`, the new key `tlcSpecs.shown` under another name. It survived `npm test`, as expected. No earlier version saved that key, and the spec only asks for "a second list" (`spec.md:33`). Under another name, the invalid-value test at `hidden.test.ts:68` reads a key nobody uses, but `texts()` is the same for both keys, and the `tlcSpecs.hidden` half is still asserted (`:67`). No fix.

Mutant not run: H7, `src/webview/main.ts:32` without `shown = msg.shown`. It is the same pipe as H5, on the page side, and the only point that sees it is `suite.cjs:640`, which kills H5. It did not fit in any batch without sharing that point with H4 or H5.

**Sensor depth**: extended lightweight (default, no P0 path). 24 mutations run: 17 in unit (C9 among them), 7 in the host and the manifest.
**Result**: 23/23 killed, excluding the equivalent C9. PASS ✅.

**Runs that opened VS Code**, 4 of the 4 allowed, all on the hidden desktop, in the foreground, one at a time:

| # | Run | Tree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | scratch (b438661) | 63/63 + 1/1 + 1/1 |
| 2 | H1 + H2 + H5 + H6 | scratch | 59/63 + 1/1 + 1/1. HID-09/10 (`:546`) by H1, HID-14/EYE-08 (`:595`) by H2, EYE-05/04/10 (`:619`) by H6. EYE-05/07 at `:637` from a stale report (note 7) |
| 3 | H4 + M1 | scratch | 60/63 + 1/1 + 1/1. HID-09/10 (`:532`) by M1, HID-14/EYE-08 (`:598`) and EYE-05/07 (`:640`) by H4. EYE-05/04/10 passed |
| 4 | H5 + H3 | scratch | 59/63 + 1/1 + 1/1. HID-09/10 (`:549`), HID-14/EYE-08 (`:598`), and EYE-05/04/10 (`:619`) by H3, EYE-05/07 (`:640`) by H5 |

The logs show the extension loaded from the scratch tree in all three suites of each run. I checked H5 and H3 in the scratch `dist/extension.cjs`.

**Isolation**: the real tree's `git status --porcelain` was empty before and after. HEAD stayed at b438661. Junction removed without recursion (`[System.IO.Directory]::Delete(..., $false)`), then `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real tree. The real `node_modules` had 129 visible entries (131 including hidden ones) before and after, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Not run. The Verifier runs without a user. The spec's independent test (`spec.md:66`) and the first two success criteria (`spec.md:101-102`) run in this repository and are left to the orchestrator: the eye on each row on hover, the unhidden completed spec staying in the tree and on the Dashboard, and that spec staying in view after reloading the window.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One three-valued choice, one new list, and the default rule in one line (`hidden.ts:61`). `texts()` serves both keys. `isMarked` was removed once `choiceOf` covered it |
| Surgical changes | ✅ Only the task files. `feature.done` left the manifest and the tests because no row uses it anymore |
| No scope creep | ✅ Nothing beyond the spec. The detail still has no eye |
| Matches patterns | ✅ Core without vscode, pure render, host through the store. The "is it completed" lookup repeats in `src/extension.ts:46` and `src/ui/dashboard.ts:97`. Two places, accepted |
| Spec-anchored outcome check (asserted values match spec) | ✅ Titles, icons, `contextValue`, classes, columns, labels, and counts asserted with the exact value |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core: one test per AC and per edge case. Webview: each Dashboard AC in the HTML. Host: both triggers, row and card, in the visible result |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Every new test has EYE in its title |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:20`) | ✅ |

Readability details, no effect: the comment at `src/core/protocol.ts:49` still says "marks or unmarks". In `src/webview/main.ts:61` the local function `shown` in `report()` shadows the new `shown` variable from `:17`. The HID-09/10 note in hidden-specs may break the list in the preview (note 6).

**Test integrity (1cec99c..b438661, EYE scope)**: `hidden.test.ts` went from 6 to 11 tests and from 17 to 32 assertions. `webview.test.ts` from 22 to 23 tests and from 91 to 99. `suite.cjs` from 61 to 63 tests and from 242 to 256, all in 5767f3c (+16 -2). Five assertions of the old rule were removed, each replaced by the new one in the same place: on the card, `cardEyes(billing-invoices) = []` twice became the closed eye (`webview.test.ts:332`, `:335`), and `'card h-complete'` became `'card h-complete is-hidden'` (`:359`); on the row, `'feature.done'` twice became `'feature.hidden'` (`suite.cjs:546`) and `'feature'` (`:549`). The completed spec's `doesNotMatch(/hidden/)` stayed and now applies to the completed spec in view (`:598`). `ANY_ROW` lost `feature.done` and is still compared by equality (`:534`). `isMarked` became `choiceOf` with the same value. The "marked and later completed" case left the integration suite: through the UI, hiding a completed spec clears the choice (EYE-10). It remains in unit (`webview.test.ts:335`, `hidden.test.ts:76`). No assertion got weaker.

---

## Edge Cases

- [x] EYE-10 Hiding a completed spec in view clears the choice, and the spec is hidden again because it is completed: `test/unit/hidden.test.ts:105-125`, `test/integration/suite.cjs:623-625`, `:645-649`
- [x] EYE-11 A manually hidden spec opened from the tree or from a notification shows its detail: `test/unit/webview.test.ts:316-320`, `test/integration/suite.cjs:1221-1230` (note 3)

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0 (scratch at b438661)
- **Unit**: 68 passed, 0 failed, 0 skipped
- **Integration**: 63/63 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0, run 1)
- **Test count before feature**: 62 unit and 61 + 1 + 1 integration (1cec99c)
- **Test count after feature**: 68 unit and 63 + 1 + 1 integration (b438661)
- **Delta**: +6 unit (5 in `hidden.test.ts`, 1 in `webview.test.ts`) and +2 integration (`suite.cjs:608`, `:632`). The specs-folder-paths commits in between did not change the test count
- **Skipped tests**: none
- **Failures**: none

The author's numbers check out.

---

## Fix Plans (if issues found)

None. Two non-blocking suggestions:

- **Note in hidden-specs** (cosmetic): a blank line after `.specs/features/hidden-specs/spec.md:86`, or the note after item 14 (note 6).
- **EYE-05/07 precondition** (test robustness): `test/integration/suite.cjs:635` with `r.toggle?.text === hiddenLabel(done)` in the predicate, to wait for the state to settle (note 7).

---

## Requirement Traceability Update

The Verifier does not change `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EYE-01 | Implementing | ✅ Verified |
| EYE-02 | Implementing | ✅ Verified |
| EYE-03 | Implementing | ✅ Verified |
| EYE-04 | Implementing | ✅ Verified (note 1) |
| EYE-05 | Implementing | ✅ Verified (note 1) |
| EYE-06 | Implementing | ✅ Verified |
| EYE-07 | Implementing | ✅ Verified |
| EYE-08 | Implementing | ✅ Verified |
| EYE-09 | Implementing | ✅ Verified (note 2) |
| EYE-10 | Implementing | ✅ Verified |
| EYE-11 | Implementing | ✅ Verified (note 3) |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requirements match the spec and discriminate. 0 precision gaps
**Sensor**: 23/23 killed, plus the equivalent C9 (survived, no fix)
**Gate**: typecheck ok, 68 unit, 63 + 1 + 1 integration, 0 failures

**What works**: every spec has the eye, on the Features row and on the card, completed or not. Open "Hide Spec" when in view, closed "Unhide Spec" when hidden. A completed spec starts hidden. Unhidden from the row or the card, it stays in the tree and in the Completed column with the top eye closed, and the hidden count drops by one. Hiding it again clears the choice. With the top eye open, every hidden spec is dimmed and has "· hidden". Old marks in `tlcSpecs.hidden` still apply, and completed specs in view are stored in `tlcSpecs.shown`.

**Issues found**: none blocking. The HID-09/10 note in hidden-specs may break the list in the preview (note 6). The EYE-05/07 precondition does not wait for the count (note 7).

**Next steps**: update the `spec.md` statuses to Verified. Run the spec's independent test with the user (UAT).
