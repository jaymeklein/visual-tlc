# Collapsed Hidden Folder Validation

## Validation: collapsed-hidden-folder - PASS ✅

Passed in iteration 2. Fix 1 and Fix 2 landed only in the test and the spec (3d483ec), without changing the code. The new test keeps the folder in view only through `billing-invoices`, a completed spec kept in view by the card's eye. MD, which survived iteration 1, dies at `suite.cjs:836`. The same test collapses the folder in view and expects the eye to leave it collapsed (`:845`). That assertion is not vacuous. The control at `:837` and the P0 probe give `[id]` without the `list.collapse`, and the mutant MF, which reopens the folder on every eye toggle, dies at `:845`. "Always Collapsed" (ME), left out in iteration 1, dies at four points. The new CHF-02 text is precise and testable. One non-blocking wording note remains (note 12).

**Date**: 2026-09-30
**Spec**: `.specs/features/collapsed-hidden-folder/spec.md`
**Diff range**: `54153ce..3d483ec` (branch `feat/hidden-specs`). Iteration 1 at `54153ce..cec9614`: spec in 3b9c8dd, code and tests in 57b317f, README in cec9614. Iteration 2 at `cec9614..3d483ec`: fe018cc with only docs and lessons, and 3d483ec with Fix 1 and Fix 2. `git diff cec9614..3d483ec -- src` is empty. Lines cited at 3d483ec. The two-folder test moved down 37 lines (`:1555` became `:1592`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

| Iteration | Commit | Verdict | Reason |
| -------- | ------ | -------- | ------ |
| 1 | cec9614 | Failed | MD alive (CHF-02) and a precision gap in CHF-02. Fix 1 and Fix 2 |
| 2 | 3d483ec | Passed | MD dies at `:836`. CHF-02 rewritten and tested with the folder collapsed by the user (`:845`). 3/3 mutants killed |

---

## Task Completion

Small scope, without `design.md` or `tasks.md`. The tasks are implicit in the commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Collapsed state of the hidden folder | ✅ Done | 57b317f. `src/ui/featuresTree.ts:159` (`const hidden = this.allHidden(...)`), `:163` (`hidden ? C.Collapsed : C.Expanded`), `:165` (the description reuses `hidden`, without changing the text), `:166` (`id` same as before). No change since then |
| Tests | ✅ Done | 57b317f: `test/integration/suite.cjs:721-816` (helpers and 2 tests) and `:1592-1619` (two folders). 3d483ec: `:818-853` (Fix 1 and Fix 2) |
| README | ✅ Done | cec9614. `README.md:12` |
| Fix 1: completed spec kept in view | ✅ Done | 3d483ec. `suite.cjs:825-838` and `:846-852` (note 9) |
| Fix 2: CHF-02 text | ✅ Done | 3d483ec. `spec.md:52` and the assumption at `spec.md:31`. Test at `suite.cjs:840-845` (note 10) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CHF-01 WHEN the user opens the Features eye THEN shows collapsed, without listing the specs, the node of every folder whose specs are all hidden | VS Code does not request the folder's specs; given state `Collapsed` | `test/integration/suite.cjs:765-766` - hides the open specs through the card, with the eye closed, and `deepEqual(getChildren(), [])`. `:768` waits for the tree to settle. `:769` - `deepEqual(await expandedWhile(openEye), [])`. `:770` - `equal(folderRow().collapsibleState, Collapsed)`. Two folders: `:1606` - `deepEqual(await expandedWhile(openEye), [sideId])`, without `.specs`. `:1609-1612` - `deepEqual(nodes.map(... collapsibleState), [Collapsed, Expanded])` | ✅ PASS (MA dies at `:769` in iteration 1) |
| CHF-02 WHEN the user opens the eye THEN keeps the node of every folder with some spec in view as it was: expanded, with the specs listed, or collapsed if the user collapsed it | expanded: VS Code requests the folder's specs, given state `Expanded`. Collapsed by the user: VS Code does not request the specs | In view through open specs: `suite.cjs:761` - `deepEqual(await expandedWhile(openEye), [id])`. `:762` - `equal(folderRow().collapsibleState, Expanded)`. Two folders: `:1606` - `[sideId]`, `:1609-1612` - `side/.specs` with `Expanded`. In view only through `billing-invoices`, a completed spec kept in view (`:829` checks it is completed, `:834` - `deepEqual(getChildren(), [])` before): `:836` - `deepEqual(await expandedWhile(() => setHidden(api.dashboardMessage, kept, false)), [id])`. `:837` - `deepEqual(await expandedWhile(openEye), [id])`. `:838` - `equal(folderRow().collapsibleState, Expanded)`. Collapsed by the user: `:841-844` closes the eye, waits, collapses with the keyboard (`collapseFirstRow`, `:819-823`) and waits. `:845` - `deepEqual(await expandedWhile(openEye), [])` | ✅ PASS (MD dies at `:836`, MF at `:845`, ME at `:761`, `:836` and `:1606`. Notes 9, 10 and 12) |
| CHF-03 WHEN the user expands the collapsed node of a hidden folder THEN lists all specs, each with a description ending in "· hidden" | all of the folder's specs; exact suffix at the end | `suite.cjs:771-772` - `deepEqual(specs.map((n) => n.feature.name).sort(), modelNames(() => true))`. `:773` - `match(getTreeItem(n).description, / · hidden$/)` for each one. `:776` - `deepEqual(await expandedWhile(expandFirstRow), [id])`: expanding with the keyboard makes VS Code request those specs | ✅ PASS (note 3) |
| CHF-04 WHILE the eye is open, WHEN the user hides or unhides a spec, keeps the folder's node open or closed as it was | expanded stays expanded when the last spec in view is hidden; collapsed stays collapsed on unhide | `suite.cjs:800` - control `[id]`. `:801` hides the others through the row's eye. `:804` - `deepEqual(await expandedWhile(() => executeCommand('tlcSpecs.hideFeature', last)), [id])`. `:805` - `match(folderRow().description, / · hidden$/)`: the given state became `Collapsed`, and VS Code kept the folder open. `:810` - `[]`, the folder comes back collapsed. `:811` - `deepEqual(await expandedWhile(() => setHidden(api.dashboardMessage, open[0], false)), [])`. `:812` - `doesNotMatch(folderRow().description, /hidden/)` | ✅ PASS (MC dies at `:804` in iteration 1) |
| CHF-05 WHEN the user closes and reopens the eye THEN again shows collapsed the node of the folder whose specs are all hidden | collapsed again, even after the user opened it | `suite.cjs:776` - the user opens the folder (`[id]`). `:777-778` closes the eye and waits. `:779` - `deepEqual(await expandedWhile(openEye), [])`. `:780` - `equal(folderRow().collapsibleState, Collapsed)` | ✅ PASS (note 2) |

**Status**: 5/5 with evidence that matches the spec, with no mutant alive and no precision gap.

### Iteration 2 notes (lines at 3d483ec)

9. **Fix 1 matches the prescription.** With the view focused (`:830`), the test hides the open specs through the card (`:832`), waits (`:833`) and checks the empty root (`:834`). So every spec is hidden, and the folder only comes back because `billing-invoices` is unhidden through the card (`:836`). `:829` checks it is completed. VS Code requests the specs when the folder comes back (`:836`, `[id]`), and the eye leaves it expanded (`:837`, `[id]`, and `:838`, `Expanded`). The `finally` closes the eye and waits (`:847-848`), hides `billing-invoices` again (`:849`, which clears the choice, EYE-10) and calls `restoreFolder` (`:850`), which closes the eye, waits, unhides the open specs and waits (`:787-792`). At the end, `:852` - `deepEqual(treeNames(), open)`. MD dies at `:836`. In the iteration 1 probe, MD also failed when the eye opened, so `:837` would kill it on its own.
10. **The `[]` at `:845` is not vacuous.** Three proofs. (a) The control `:837`, in the same test, has the same state without the collapse: eye closed, folder in view only through `billing-invoices`, expanded. When the eye opens, VS Code requests the specs (`[id]`). (b) The P0 probe, only in the scratch, repeats `:830-845` with the focus and `list.focusFirst`, but without `list.collapse`. With the real code, the log says `added=[id] opened1=[id] opened2=[id] state=2`. Without the collapse, the second eye opening also requests the specs. (c) MF reopens the folder in view on every eye toggle and dies at `:845`, with `[id]` instead of `[]`. So the view is on screen and responsive at that point, and the `[]` comes from `list.collapse`. The `collapseFirstRow` helper (`:819-823`) is the counterpart of `expandFirstRow` (`:749-753`), which already proves at `:776` that `list.focusFirst` lands on the folder row. The test does not assert the given state at `:845`. It stays `Expanded` because the model has not changed since `:838`, and that does not bear on the criterion.
11. **No test was weakened.** `git diff cec9614..3d483ec -- test` only adds 37 lines, the new test and the `collapseFirstRow` helper, and removes none. The earlier assertions stayed the same.
12. **The new CHF-02 text is precise and testable.** The governing verb is "keep ... as it was": after the eye opens, the node has its previous state. Both states are observable (VS Code does or does not request the folder's specs), and both have a test with the exact value (notes 9 and 10). The text follows L-026 and matches "as today", because before the feature a folder in view that the user collapsed also stayed collapsed. There is one non-blocking wording note. The list after the colon only cites "collapsed if the user collapsed it", but there is another path. The eye brings the folder back collapsed (CHF-01), and one of its specs comes back into view through the card with the eye open (CHF-04, `:811`). After closing and opening the eye, the folder stays collapsed without the user having collapsed it. The code does what "as it was" requires, because the node stays in the tree with the same `id`. Reading the list as exhaustive contradicts the "keep" itself. Changing it to "or collapsed, if it was collapsed" closes the gap. The Goals (`spec.md:10`) still say "stay expanded, as today". The assumption (`spec.md:31`) is still "n". The text did not come from the user, so it is worth confirming in UAT.

### Iteration 1 notes (lines at cec9614; in the two-folder test, add 37 to find the line at 3d483ec)

1. **The `expandedWhile` observation is solid and not vacuous.** The helper (`suite.cjs:731-746`) replaces `getChildren` on the provider instance and records the `project.id` of each `root` node VS Code requests. In the installed VS Code (1.120.0), the extension host calls `this._dataProvider.getChildren(e)` on every fetch (`extensionHostProcess.js`). The object is the same as `api.featuresTree` (`src/extension.ts:48-50`, `:111`). No extension code calls `getChildren` (grep in `src/`), so only VS Code shows up in the list. The `delete` in the `finally` restores the prototype method. In the workbench, `collapseByDefault:p=>p.collapsibleState!==2` (`workbench.desktop.main.js`) uses the given state when the tree creates the node. Both directions have already failed with a mutant: MA turned `[]` into `[id]` at `:769`, `:810` and `:1569`, and MC turned `[id]` into `[]` at `:804`. The controls that expect a full list (`:761`, `:776`, `:800`, `:804`, `:1569`) passed in every run that reached them without a mutant in the path. So the view was on screen and responsive.
2. **Both measured assumptions hold.** With the fixed `id` (`src/ui/featuresTree.ts:166`, same as before the feature), CHF-05 passes at `:779`. VS Code forgets the expansion of a node that left the tree. MC (the `id` follows the hidden state) dies at `:804`. VS Code uses the given state on a node with a new `id`, so the fixed `id` is what keeps CHF-04. Author's notes: (a) the variant with a new `id` on each opening was dropped, because the `id` did not change in the diff. (b) With the fixed `id`, CHF-05 passed in runs 1, 3, 4 and 5. (c) I did not reproduce the old CHF-04 failure caused by pollution. I only have the author's log (`scratchpad/itx.log`), which shows `[]` in the initial control, consistent with a folder that entered collapsed. With `restoreFolder` (`:787-792`), the control `:800` passed in runs 1, 2, 3, 4 and 5. (d) The waits (`treeSettled`) come before each observed step (`:768`, `:778`, `:803`, `:809`, `:1567`) and inside `expandedWhile`.
3. **CHF-03.** The list (`:771-773`) is asserted on the provider, which is what VS Code receives. `:776` proves VS Code requests that list when the user expands. The state does not change between the two lines. Accepted (L-002).
4. **MD and the probe (Fix 1).** MD changes only the collapsed-state condition (`:163`) to `p.features.length > 0 && p.features.every((f) => f.health === 'complete' || this.isHidden(node.loaded, f))`, and the description keeps the real rule. Every completed spec counts as hidden for collapsing, even when kept in view by the eye. The folder in view only through `billing-invoices` gets `Collapsed`. The user sees this when VS Code adds that folder: on window reload, or when it comes back through the card with the eye closed. It stays collapsed, and stays collapsed when the eye opens, against CHF-02. MD passed everything (run 4). In run 5, I put MD behind a flag and added a scratch-only probe, run once without the flag and once with it. With the eye closed, the probe hides the open specs, waits, unhides `billing-invoices` through the card, observes and opens the eye. With the real rule, the log says `added=[id] opened=[id] state=2`, and the test passed. With MD, it says `added=[] opened=[] state=1`, and the test failed at `expandedWhile(openEye)`, with `[]` instead of `[id]`. That is the Fix 1 test.
5. **Precision gap in CHF-02 (Fix 2).** CHF-02 said "SHALL show expanded" the node of every folder with a spec in view when the eye opens. A folder in view that the user collapsed by hand with the eye closed stays in the tree. By the CHF-04 assumption, VS Code keeps its state, so it stays collapsed when the eye opens. That is the earlier behavior ("as today", Goals), but the CHF-02 text said the opposite, and no assumption covered the case. Nothing in the code changes. What was missing was the spec saying what happens to that node. Resolved in 3d483ec (note 12).
6. **CHF-04 came from the author.** It was added in 57b317f, together with two measured assumptions, both with "n" in Confirmed. Hiding the last spec in view with the eye open leaves the folder expanded with "· hidden". Unhiding a spec in a collapsed folder leaves the folder collapsed. The user should confirm this in UAT.
7. **Triggers (L-009).** The title eye runs `tlcSpecs.showHidden` and `tlcSpecs.hideHidden` (`package.json`, `view/title`), and the tests run those commands (`:724-725`). CHF-04 hides through the row's eye (`tlcSpecs.hideFeature`, `:801`, `:804`) and unhides through the card (`:811`). All go through `hidden.onDidChange` (`src/ui/featuresTree.ts:81`). The spec lists no other triggers.
8. **Lessons checked.** L-002: the state is asserted on what VS Code does (requests the specs or not), as well as on the provider. L-014: the collapsed state is expected with both values (`Collapsed` at `:770`, `:780`, `:1574`; `Expanded` at `:762`, `:1574`), and `expandedWhile` is expected both empty and full. L-020 was not followed for the new rule: the completed spec kept in view, which meets both conditions, was missing (MD). L-006 does not apply. L-025 is still a candidate, but the two-folder test follows it (`:1555-1582`), and MB dies there.

---

## Discrimination Sensor

### Iteration 2 (3d483ec)

Scratch: `git worktree add --detach <scratchpad>/wtv2 3d483ec`, with a `node_modules` junction to the real one. Each mutant is a text replacement that requires exactly one occurrence, applied by script (`scratchpad/chf2-mutate.py`) to the scratch's `src/ui/featuresTree.ts` and undone with `git checkout -- .`. After each revert, the scratch's `git status --porcelain` was empty. I did not use `git stash`. Before each run, I ran `npm run build` and checked the mutant in `dist/extension.cjs`. The log shows the extension loaded from the scratch in all three suites of each run.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| MD | `src/ui/featuresTree.ts:163` | The same text as iteration 1: only the collapsed-state condition counts every completed spec as hidden, even when kept in view by the eye. The description keeps `hidden` | ✅ Killed (`test/integration/suite.cjs:836`, `[]` instead of `[id]`: the folder comes back through the card collapsed. 71/72. Mutant at `dist/extension.cjs:1683`) |
| MF | `src/ui/featuresTree.ts:166` | The `id` follows the eye: `` `root:${pid}:${this.show}` ``. On every eye toggle, VS Code sees a new node for every folder and uses the given state, so the folder in view that the user collapsed comes back expanded. A flag on `globalThis` turns it off, only during the P0 probe | ✅ Killed (`suite.cjs:845`, `[id]` instead of `[]`. 72/73 with the probe. Mutant at `dist/extension.cjs:1686`) |
| ME | `src/ui/featuresTree.ts:163` | Always `Collapsed`, even with a spec in view | ✅ Killed (`suite.cjs:761`, `:800`, `:836` and `:1606`, each with `[]` instead of the full list. 68/72. Mutant at `dist/extension.cjs:1683`) |

P0 probe (scratch only, not a mutant): the steps of `:830-845`, with the focus and `list.focusFirst`, but without `list.collapse`, and with MF turned off. It sat at the end of the suite, after the two-folder test, and passed (note 10).

MF and P0 ran together in run 3, because their failure points do not overlap. The only point expected for MF is `:845`, in a test that runs before the probe. The probe turns MF off before the first step and turns it back on in the `finally`. It starts by taking the folder out of the tree (all hidden), so the `id` change when turning MF off leaves no trace. In run 3 only the test at `:825` failed, at `:845`. The failures of runs 2, 3 and 4 landed on the lines I predicted before each one.

I did not run a mutant that collapses again, when the eye opens, the expanded folder in view (`id` with the eye and `Collapsed` with the eye open), because the runs ran out. By reading, it would fail at `:761` and `:837`. It is not counted.

**Sensor depth**: lightweight (default, no P0 path), with 3 mutations and one probe.
**Result**: 3/3 killed (MD, MF, ME), and the P0 probe passed. PASS ✅

**Runs that opened VS Code**: 4 of the 4 allowed. All ran on the hidden desktop, in the foreground and one at a time, in the scratch. Logs in `scratchpad/v2-run1-baseline.log`, `v2-run2-MD.log`, `v2-run3-MF-P0.log` and `v2-run4-ME.log`.

| # | Run | Result |
| - | -------- | --------- |
| 1 | Gate, no mutation | 72/72 + 1/1 + 1/1, exit 0 |
| 2 | MD | 71/72 + 1/1 + 1/1, exit 1. Fails only at `:836` |
| 3 | MF + P0 probe | 72/73 + 1/1 + 1/1, exit 1. Fails only at `:845`. P0 passed |
| 4 | ME | 68/72 + 1/1 + 1/1, exit 1. Failures only at `:761`, `:800`, `:836` and `:1606` |

**Flakiness**: no sign. The four CHF tests passed in run 1. The controls that expect a full list passed in every run with no mutant in the path: `:761`, `:776`, `:800`, `:804` and `:1606` in runs 1, 2 and 3; `:836` and `:837` in runs 1 and 3; and the probe's three in run 3. No failure landed outside the predicted lines, and `startup.cjs` and `multiroot.cjs` passed in all four.

**Isolation**: the real tree's `git status --porcelain` was empty before and after, and HEAD stayed at 3d483ec. I removed the junction with `cmd /c rmdir`, without recursion, then ran `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real tree. The real `node_modules` had 129 visible entries before and after, and `npm ls --depth=0` exited 0.

### Iteration 1 (cec9614, history)

Scratch: `git worktree add --detach <scratchpad>/wtv cec9614`, with a `node_modules` junction to the real one. Each mutant is a text replacement that requires exactly one occurrence, applied by script (`scratchpad/chf-mutate.py`) to the scratch's `src/ui/featuresTree.ts` and undone with `git checkout -- .`. After the revert, the scratch's `git status --porcelain` was empty. I did not use `git stash`. Before each run, I ran `npm run build` and checked the mutant in `dist/extension.cjs`. The log shows the extension loaded from the scratch in all three suites.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| MA | `src/ui/featuresTree.ts:163` | Always `Expanded`, as before the feature | ✅ Killed (`test/integration/suite.cjs:769`, `:810` and `:1569`, each with the extra `.specs` in the list. 68/71. Mutant at `dist/extension.cjs:1683`) |
| MB | `src/ui/featuresTree.ts:163` | Global rule: `this.store.projects.some((q) => this.allHidden(q)) ? C.Collapsed : C.Expanded`. Every folder is collapsed when any folder is fully hidden | ✅ Killed (`suite.cjs:1572`, `[1, 1]` instead of `[1, 2]`. `:1569` passed, because `side/.specs` was already expanded in the tree. Mutant at `dist/extension.cjs:1683`) |
| MC | `src/ui/featuresTree.ts:166` | The `id` follows the hidden state: `` `root:${pid}${hidden ? ':hidden' : ''}` ``. VS Code sees a new node when the folder becomes fully hidden or comes back | ✅ Killed (`suite.cjs:804`, `[]` instead of `[id]`. Mutant at `dist/extension.cjs:1686`) |
| MD | `src/ui/featuresTree.ts:163` | Only the collapsed state ignores the eye of a completed spec kept in view: `p.features.length > 0 && p.features.every((f) => f.health === 'complete' \|\| this.isHidden(node.loaded, f))`. The description keeps `hidden` | ❌ Survived → Fix 1 (71/71 + 1/1 + 1/1, exit 0. Mutant at `dist/extension.cjs:1683`). Killed in iteration 2 |

MB and MC ran together in run 3, because their failure points do not overlap. MC changes the `id` only when the folder that was in the tree changes hidden state. That only happens in CHF-04. In the first test, the folder leaves and comes back with the same `id` each time. In the two-folder test, `.specs` only enters after being hidden. MB only changes something with two folders, and the first two CHF tests have a single folder. In run 3 only those two tests failed (69/71), each with its mutant's signature.

I did not run three variants. (a) Collapsing only with the eye open (`this.show && hidden`) is equivalent, because with the eye closed the fully hidden folder is not in `getChildren` (`:110`), and VS Code never requests its item. (b) Always `Collapsed` was left out by the run limit. It ran in iteration 2 as ME. (c) Changing the rule in `hidden` (`:159`), which also changes the description, fails the hidden-folder test at `:710`, which asserts the description without "· hidden" with `billing-invoices` in view. None of the three was counted.

Iteration 1 score: 3/4 killed, MD alive, so the iteration failed. Depth: lightweight, with 4 mutations in the new code and one confirmation probe.

Iteration 1 runs: 5 of the 5 allowed, all on the hidden desktop, in the foreground and one at a time, in the scratch.

| # | Run | Result |
| - | -------- | --------- |
| 1 | Gate, no mutation | 71/71 + 1/1 + 1/1, exit 0 |
| 2 | MA | 68/71 + 1/1 + 1/1, exit 1. Failures only at `:769`, `:810` and `:1569` |
| 3 | MB + MC | 69/71 + 1/1 + 1/1, exit 1. Failures only at `:804` (MC) and `:1572` (MB) |
| 4 | MD | 71/71 + 1/1 + 1/1, exit 0. MD survived |
| 5 | MD behind a flag, plus the probe (note 4) | 72/73 + 1/1 + 1/1, exit 1. The suite's 71 tests passed with the flag off, and so did the probe. With the flag on, the probe failed at `expandedWhile(openEye)` |

Flakiness in iteration 1: no sign. The three CHF tests passed in runs 1, 4 and 5, with no mutation in their path. In runs 2 and 3, each failure landed on the line predicted before the run, with the mutant's signature, and the rest stayed green. No control that expects a full list failed without a mutant.

Isolation in iteration 1: the real tree's `git status --porcelain` was empty before and after, and HEAD stayed at cec9614. I removed the junction with `cmd /c rmdir`, without recursion, then ran `git worktree remove --force` and `git worktree prune`. `git worktree list` showed only the real tree. The real `node_modules` had 129 visible entries before and after, and `npm ls --depth=0` exited 0.

---

## Interactive UAT Results (if performed)

Not performed, because the Verifier runs without a user. The first success criterion (`spec.md:84`) is met by `test/integration/suite.cjs:1606`: when the eye opens, VS Code requests the specs of `side/.specs` and not those of `.specs`. Left for the orchestrator are the independent test (`spec.md:56`) and the second success criterion (`spec.md:85`): in this repository, reinstall the extension, open the eye and see the `visual-tlc` node collapsed, then expand it to see the specs with "· hidden". It is also worth showing the user CHF-04 (note 6) and the new CHF-02 text (note 12). Both assumptions are still "n".

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One constant, one ternary and a short comment (`src/ui/featuresTree.ts:159-165`). The description reuses the constant. Iteration 2 did not change code |
| Surgical changes | ✅ Only the `root` case of `getTreeItem`, the suite, the README and the spec. 3d483ec only touches `suite.cjs` and `spec.md` |
| No scope creep | ✅ Folders in view, the Project tree and the Dashboard did not change (Out of Scope) |
| Matches patterns | ✅ Same shape as the other states in `getTreeItem` (`:174`, `:188`). The tests follow the hidden-folder helpers (`setHidden`, `folderRow`, `treeSettled`, `setFolders`, `waitForRoots`). `collapseFirstRow` (`suite.cjs:819-823`) is the counterpart of `expandFirstRow` (`:749-753`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ States and lists asserted with the exact value, in both directions |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Each AC has a test in real VS Code. CHF-02 covers the two rules that keep a spec in view (open at `:761`, completed kept in view at `:836-838`) and the state the user gave (`:845`) |
| Every test in scope maps to a spec requirement - no unclaimed tests | ✅ The four new tests have a CHF ID in their titles |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Test integrity**: from `54153ce` to `3d483ec`, lines were only added in `test/` (163, none removed). From `cec9614` to `3d483ec`, 37 were added and none removed (note 11). `suite.cjs` went from 68 to 72 tests and from 282 to 308 lines with `assert.`. The unit tests did not change (68).

---

## Edge Cases

- [x] CHF-05 Closing and reopening the eye brings the folder back collapsed again, even after the user opened it: `test/integration/suite.cjs:776-780`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`. Typecheck and unit in the real tree, which write nothing (`noEmit`). Integration ran on the hidden desktop, in the scratch at 3d483ec, with no mutation
- **Typecheck**: exit 0
- **Unit**: 68 passed, 0 failed, 0 skipped
- **Integration**: 72/72 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0, run 1 of iteration 2)
- **Test count before feature**: 68 unit and 68 + 1 + 1 integration (54153ce)
- **Test count after feature**: 68 unit and 72 + 1 + 1 integration (3d483ec)
- **Delta**: +4 integration (`suite.cjs:755`, `:794`, `:825`, `:1592`)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (if issues found)

No new fix. Both fixes from iteration 1 were done in 3d483ec.

### Fix 1 (iteration 1): CHF-02 with a folder in view only through a completed spec kept in view

- **Root cause**: in the tests, the spec that kept the folder in view was always an open one. No test told `isHidden` apart from "completed counts as hidden" in the collapsed-state rule, so MD (`src/ui/featuresTree.ts:163`) passed.
- **Fix task**: test only, in the collapsed-hidden-folder section, after CHF-04, with the steps of the iteration 1 probe.
- **Status**: ✅ Done in 3d483ec (`suite.cjs:825-852`). MD dies at `:836`, and the gate is green (note 9).
- **Priority**: Major

### Fix 2 (iteration 1): CHF-02 and the folder in view that the user collapsed

- **Root cause**: CHF-02 required "expanded" for every folder with a spec in view when the eye opens, but a folder in view that the user collapsed stays collapsed.
- **Fix task**: decide the text in the spec. If the spec came to require the case, a test would collapse the folder with `list.collapse` and expect `[]` when the eye opens.
- **Status**: ✅ Done in 3d483ec. CHF-02 (`spec.md:52`) and the assumption (`spec.md:31`) say "as it was", and the test is at `suite.cjs:840-845` (notes 10 and 12). Optional wording change in note 12.
- **Priority**: Minor

---

## Requirement Traceability Update

The Verifier does not edit `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CHF-01 | Verified | ✅ Verified |
| CHF-02 | Implementing | ✅ Verified (assumption "n", note 12) |
| CHF-03 | Verified | ✅ Verified (note 3) |
| CHF-04 | Verified | ✅ Verified (assumption "n", note 6) |
| CHF-05 | Verified | ✅ Verified (note 2) |

Proposed coverage line: "5 total, 5 verified."

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 requirements with evidence that matches the spec, with no precision gap
**Sensor**: 3/3 killed in iteration 2 (MD, MF, ME), and the P0 probe passed. Counting iteration 1, MA, MB, MC, MD, MF and ME all died
**Gate**: typecheck ok, 68 unit, 72 + 1 + 1 integration, 0 failures

**What works**: with the eye open, the folder whose specs are all hidden comes back collapsed, without VS Code requesting its specs, with one folder or two. The folder with a spec in view stays as it was: expanded, whether the spec is open or a completed one kept in view by its eye, and collapsed if the user collapsed it. Expanding with the keyboard lists all specs with "· hidden". Closing and opening the eye brings the hidden folder back collapsed again. Hiding or unhiding with the eye open neither opens nor closes the folder.

**Issues found**: none blocking. Wording note on CHF-02 and the Goals (note 12).

**Next steps**: move the spec's traceability to "5 total, 5 verified". In UAT, reinstall the extension, run the independent test and the second success criterion, and confirm the CHF-02 and CHF-04 assumptions with the user.
