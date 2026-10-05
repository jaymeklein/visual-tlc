# Hidden Folder Validation

## Validation: hidden-folder - PASS ✅

Passed in iteration 3. Fix 2 did what the report asked. The new test (`test/integration/suite.cjs:1425-1456`) uses two folders with specs: `.specs`, with everything hidden, and `side/.specs`, with one open spec in view. With the eye closed, the root has only `side/.specs` (`:1440`), with "1 feature(s)" (`:1441`). With the eye open, the root has both (`:1445`): `.specs` with "N feature(s) · hidden" and `side/.specs` with "1 feature(s)" (`:1446-1449`). M8 dies at `:1440`. M10, which applies the same global rule to the suffix and was not run in iteration 2, dies at `:1446`. M6 is still dead at `:708`. The gate at 56d5bab passes: typecheck ok, 68 unit and 68 + 1 + 1 integration. The code has not changed since fc47aec.

**Date**: 2026-09-30
**Spec**: `.specs/features/hidden-folder/spec.md`
**Diff range**: `35a9118..56d5bab` (branch `feat/hidden-specs`): spec in c440a87, implementation and tests in fc47aec, README in b50c9d7, iteration 1 validation in 2c26515, Fix 1 in 21d91d4, iteration 2 validation in e656890, Fix 2 in 56d5bab. Lines cited at 56d5bab, unless another commit is named
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b50c9d7 | Failed | 8/8 requirements with evidence that matches the spec. 0 precision gaps. 6/7 killed. Alive: M6 (Fix 1). 6 VS Code runs |
| 2 | 21d91d4 | Failed | Fix 1 checked: test only, as prescribed, and it kills M6 at `suite.cjs:708`. 0 precision gaps. 2/3 killed (M6, M9). Alive: M8, the global rule instead of the per-folder rule (Fix 2). 4 VS Code runs |
| 3 | 56d5bab | Passed | Fix 2 checked: test only, with its own folder (`side/.specs`), which the prescription allowed. 0 precision gaps. 3/3 killed: M8 at `suite.cjs:1440`, M10 at `:1446` and M6 at `:708`. 3 VS Code runs |

---

## Task Completion

Medium scope, without `design.md` or `tasks.md`. The tasks are implicit in the commits.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Folder rule in the Features tree | ✅ Done | fc47aec. `src/ui/featuresTree.ts:101-104` (`allHidden`), `:110` (root filter), `:161` (description with "· hidden") |
| Tests | ✅ Done | fc47aec. `test/integration/suite.cjs:638-697` (3 tests) and `:1404-1423` (HFD-08). The SFP-10/HID-16 test was removed in the same commit |
| Notes in the superseded specs | ✅ Done | fc47aec. `.specs/features/specs-folder-paths/spec.md:89`, `.specs/features/hidden-specs/spec.md:105-106` |
| README | ✅ Done | b50c9d7. `README.md:12`, `:86` |
| Fix 1: folder in view through a completed spec kept in view | ✅ Done | 21d91d4. `test/integration/suite.cjs:699-719`. No code changed |
| Fix 2: per-folder rule with two folders with specs | ✅ Done | 56d5bab. `test/integration/suite.cjs:1425-1456`. `idOf` and `setHiddenIn` moved up from HFD-08 to module level (`:1401-1402`), unchanged. No code changed. The commit also set HFD-01 back to Implementing in `spec.md:74` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HFD-01 WHILE the Features eye is closed, the tree leaves out every folder with at least one spec and all of them hidden | the root lacks the folder's node; the folder with a spec in view stays | `test/integration/suite.cjs:643-644` - hides the open specs (the completed ones are already hidden), `deepEqual(api.featuresTree.getChildren(), [])`. `:706-709` - with a completed spec kept in view by the eye, `deepEqual(getChildren().map((n) => n.kind), ['root'])` and `deepEqual(treeNames(), ['billing-invoices'])`. Two folders with specs (Fix 2): `:1434` - `deepEqual(featuresOf('side/.specs'), ['side-one'])`. `:1437` hides the open specs of `.specs`. `:1440` - `deepEqual(closed.map((n) => n.loaded.project.id), [sideId])`. Neighbor folder with no spec: `:1416` - `[idOf('bare/.specs')]` | ✅ PASS (note 1) |
| HFD-02 WHEN the user hides the last spec in view through the row's eye THEN the tree removes the folder's node | empty root after the row's eye | `suite.cjs:667` - precondition `treeNames()` = `['csv-export']`. `:668` - `executeCommand('tlcSpecs.hideFeature', await featureNode(last))`, the inline eye command with the node. `:669` - `deepEqual(api.featuresTree.getChildren(), [])` | ✅ PASS |
| HFD-03 WHEN the user unhides through the card a spec of a folder out of the tree THEN the node comes back, with that spec inside | root `['root']`, children only the unhidden spec | `suite.cjs:671` - `setHidden(api.dashboardMessage, last, false)`, the card's message to the host. `:673` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:674` - children `[last]` | ✅ PASS (note 3) |
| HFD-04 WHILE eye closed and no folder with a spec in view, empty list with "T feature(s) · D completed · H hidden", no welcome view | `[]`; message with H = T; no welcome view | `suite.cjs:644` - `[]`. `:645` - `` equal(api.featuresViewMessage(), `${features.length} feature(s) · ${done} completed · ${features.length} hidden`) ``. `:647-650` - Features `viewsWelcome` only with `!tlcSpecs.hasSpecs` | ✅ PASS (note 4) |
| HFD-05 WHILE eye open, the folder whose specs are all hidden has "N feature(s) · hidden", N the total | node present, exact description | `suite.cjs:687` - `showHidden`. `:689` - hides the open specs. `:690` - `deepEqual(...getChildren().map((n) => n.kind), ['root'])`. `:691` - `` equal(folderRow().description, `${base} · hidden`) ``, with `base` = `` `${features.length} feature(s)` `` (`:684`). With another folder in view (Fix 2): `:1443` - `showHidden`. `:1445` - `deepEqual(shown.map((n) => n.loaded.project.id), [specsId, sideId])`. `:1446-1449` - `` deepEqual(shown.map((n) => getTreeItem(n).description), [`${total} feature(s) · hidden`, '1 feature(s)']) ``, with `total` the number of specs in `.specs` (`:1435`) | ✅ PASS (note 1) |
| HFD-06 WHILE the folder has at least one spec in view, "N feature(s)" without "· hidden", eye open or closed | exact description, without the suffix, in both eye states | Open spec in view: `suite.cjs:686` (eye closed), `:688` (open), `:696` (closed again), all `equal(folderRow().description, base)`. Only a completed spec kept in view (Fix 1): `:710` - eye closed, `equal(folderRow().description, base)`. `:711-712` - `showHidden`, then the same description. Next to a fully hidden folder (Fix 2): `:1441` - eye closed, `equal(getTreeItem(closed[0]).description, '1 feature(s)')`. `:1446-1449` - eye open, the second item is `'1 feature(s)'` | ✅ PASS (notes 1 and 2) |
| HFD-07 WHILE all specs of a folder are hidden, the Project tree shows the node, with Handoff, decisions and lessons | root `['root']` with the three sections | `suite.cjs:651-652` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:653-654` - `ok(sections.includes(kind))` for `handoff`, `decisions`, `lessons`, with everything hidden | ✅ PASS |
| HFD-08 IF a specs folder has no spec THEN Features shows the node with "0 feature(s)", with the eye closed | node present, exact description | `suite.cjs:1412` - `deepEqual(featuresOf('bare/.specs'), [])`. `:1416` - only `bare/.specs` at the root. `:1417` - `equal(api.featuresTree.getTreeItem(nodes[0]).description, '0 feature(s)')` | ✅ PASS |

**Status**: 8/8 with evidence that matches the spec. 0 precision gaps. The per-folder rule now has a test with two folders with specs, one with everything hidden and the other with a spec in view (note 1).

### Notes

1. **HFD-01 and multiple folders (Fix 2, closed).** The new test (`suite.cjs:1425-1456`) writes `side/.specs/features/side-one/spec.md` (`:1426`), a spec with no SHALL. Then it configures `['.specs', 'side/.specs']` and waits for both folders (`:1430-1431`). `:1434` proves the neighbor folder has the spec. `side-one` is not completed. If it were, it would be hidden by default, and `:1440` would fail at the gate. The test hides the open specs of `.specs` (`:1436-1437`), and the completed ones are already hidden. With the eye closed, `:1440` asserts the root has only `side/.specs`, and `:1441` asserts "1 feature(s)". With the eye open (`:1443`), `:1445` asserts both folders. `:1446-1449` asserts "N feature(s) · hidden" on `.specs` and "1 feature(s)" on `side/.specs`, without the suffix (L-021). With M8, the root with the eye closed has both folders, and the test fails at `:1440` (run 2). With M10, `.specs` loses the "· hidden", and the test fails at `:1446` (run 3). The prescription suggested `docs/specs/custom-one`, left over from earlier tests. The author wrote its own folder, which Fix 2 also allowed ("the test writes its own spec"). That way the test does not depend on the earlier ones. The "Done when" was met: M8 dies on a new assertion, and the gate stays green.
2. **HFD-06 and the completed spec in view (Fix 1, closed).** The test (`suite.cjs:699-719`) hides the open specs and keeps `billing-invoices` in view through the card (`:707`, EYE-05). `:704` proves it is completed. `:708` and `:709` prove the folder stays, with only that spec. `:710` and `:712` prove the exact description, without "· hidden", with the eye closed and open. In the `finally` (`:713-717`), the test closes the eye, hides `billing-invoices` and unhides the open specs. Hiding a completed spec clears the choice: `set` stores `undefined` when `hidden === complete` (`src/core/hidden.ts:61`, EYE-10). `:718` checks the restore. In iterations 2 and 3, with M6, the test failed at `:708`, and the following tests passed. So the `finally` restores the state even when the test fails.
3. **HFD-03, the card.** The test sends the host the `setHidden` message that the card sends (`api.dashboardMessage`, `src/extension.ts:104`), as in HID-11/12. The card that emits this message is already proven in the hidden-specs unit tests. Accepted.
4. **HFD-04, the welcome view.** Now the tree is really empty, so the welcome view depends on two things. The first is the `tlcSpecs.hasSpecs` key, which is `store.projects.length > 0` (`src/extension.ts:86`), does not change with this feature and is read by no test. The second is the VS Code rule. In the installed VS Code, the tree's `shouldShowWelcome` requires `isTreeEmpty` and an empty `message` (`workbench.desktop.main.js`: `(this.treeView.message===void 0||this.treeView.message==="")`). `:645` asserts a non-empty message, so the welcome view does not appear in that state, whatever the key. With the manifest's `when` (`:647-650`), that is enough. Accepted, as in HID-16 and SFP-10.
5. **Triggers (L-009).** The spec lists one trigger per action: the row's eye to hide (HFD-02, `:668`) and the card to unhide (HFD-03, `:671`). Both are exercised. Fix 2 uses the same card message (`setHiddenIn`, `:1402`).
6. **Success criteria.** The second one is met. The old test (`35a9118:test/integration/suite.cjs:501-520`) became `:638-659`. The message (`:510` → `:645`), the `viewsWelcome` (`:512-515` → `:647-650`) and the return to the initial state (`:519` → `:658`) stay the same. Only the node with no children (`:508-509`) became the empty root (`:644`), and the Project tree assertions were added (`:651-654`). The first criterion, and the independent test in this repository, are left for UAT.
7. **Spec assumptions.** Folder hidden by any EYE-06 rule: all three rules have a test and a killed mutant. The marked open spec is at `:643-644`. The completed spec with no choice dies with M9 at `:644`, `:669`, `:691` and in HFD-08 (iteration 2). The completed spec kept in view dies with M6 at `:708`. Folder with no spec stays with "0 feature(s)": `:1417`. All folders hidden: empty list, message and no welcome view (`:644-650`). "With one project or several" (`spec.md:32`): one at `:638-719`, several at `:1425-1456` (note 1) and at `:1404-1423`.
8. **Lessons checked.** L-002: everything is asserted on what the user sees, that is, the root's children, the `TreeItem` `description` and the view message. L-009: note 5. L-014: the `allHidden` flag has tests expecting true (`:644`, `:691`, `:1440`, `:1446`) and false (`:686`, `:688`, `:708`, `:710`, `:1417`, `:1441`). L-020 is followed at `:699-719`. L-025 is now followed: `:1425-1456` has two groups that require opposite results at the same time, a folder that leaves and one that stays. L-021 holds for the "· hidden", absent on the folder in view (`:686`, `:688`, `:710`, `:712`, `:1441`, `:1446-1449`). L-006 does not apply, because there is no watcher. Among the candidates, L-013 holds for the `features.length > 0` guard, killed by M1 in HFD-08 (iteration 1). L-024 holds for the empty folder, the only one that stays at `:1416`.
9. **Root order in Fix 2.** `:1445` and `:1446-1449` assert `.specs` before `side/.specs`. The store does not keep the configured order. It sorts folders by path, with `a.specsUri.path.localeCompare(b.specsUri.path)` (`src/ui/store.ts:156`). `Promise.all` keeps that order (`src/ui/store.ts:104-109`), and so does the root filter (`src/ui/featuresTree.ts:110`). Both paths start with `<ws>/`, and `.specs` comes before `side/.specs`, because the dot sorts before letters. In Node, `'/c:/tmp/ws/.specs'.localeCompare('/c:/tmp/ws/side/.specs')` gives `-1`. The configured order (`:1430`) is the same, so the assertion holds whichever rule applies. In run 2, the failure message at `:1440` shows the root in that order.
10. **The `finally` of Fix 2.** `:1450-1454` closes the eye (`hideHidden`), unhides the open specs of `.specs` and runs `setFolders(undefined)`. `:1455` waits for `waitForRoots(['.specs'])`. Unhiding an open spec clears the choice (`src/core/hidden.ts:61`). If the test fails before `open` is filled, the loop does nothing. This is what Fix 2 asked for. The test is the last in the suite. `side/.specs` stays in the temporary workspace, like `bare/.specs` from HFD-08. Outside the configuration, the store does not read that folder, and each suite runs on a fresh copy of the fixture, with its own `--user-data-dir`, deleted at the end (`test/integration/run.mjs:22-36`).

---

## Discrimination Sensor

### Iteration 3 (56d5bab)

Scratch: `git worktree add --detach <scratchpad>/wt3 56d5bab`, with a `node_modules` junction to the real one. Each mutant is a text replacement that requires exactly one occurrence, applied by script to the scratch's `src/ui/featuresTree.ts` and undone with `git checkout -- .`. After the revert, the scratch's `git status --porcelain` was empty. I did not use `git stash`. Before each run, I ran `npm run build` in the scratch and checked the mutant in `dist/extension.cjs`. The log shows the extension loaded from the scratch in all three suites.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M8 (again) | `src/ui/featuresTree.ts:110` | Global rule instead of the per-folder rule, same as iteration 2: filter `this.show \|\| !this.allHidden(loaded) \|\| this.store.projects.some((p) => p.project.features.some((f) => !this.isHidden(p, f)))`. The fully hidden folder only leaves when no folder has a spec in view | ✅ Killed (`test/integration/suite.cjs:1440`, the root with `.specs` and `side/.specs` instead of only `side/.specs`. Only this test failed, 67/68. Mutant at `dist/extension.cjs:1636`) |
| M6 (again) | `src/ui/featuresTree.ts:103` | Folder rule with `f.health === 'complete' \|\| this.isHidden(...)`: every completed spec counts as hidden, even when kept in view by the eye | ✅ Killed (`suite.cjs:708`, `[]` instead of `['root']`. Mutant at `dist/extension.cjs:1632`) |
| M10 (new) | `src/ui/featuresTree.ts:161` | The same global rule on the suffix: `this.allHidden(node.loaded) && !this.store.projects.some((q) => q.project.features.some((f) => !this.isHidden(q, f)))`. The "· hidden" only appears when no folder has a spec in view | ✅ Killed (`suite.cjs:1446`, `'10 feature(s)'` instead of `'10 feature(s) · hidden'`. Mutant at `dist/extension.cjs:1684`) |

M6 and M10 ran together in run 3, because their failure points do not overlap. On its own, M6 only fails at `:708` (iteration 2). It does not change the new test: `side-one` is not completed, and `.specs` is already fully hidden. M10 only changes the description of a fully hidden folder when another folder has a spec in view, and that only happens at `:1446`. With a single folder (`:691`), the description does not change. In HFD-08, `bare/.specs` has no spec. In run 3 only those two tests failed (66/68), each with its mutant's signature. M8 ran alone, because with M6 it masks `:708`: the global rule keeps the folder at the root while `billing-invoices` is in view, and the failure would move to `:710`.

**Sensor depth**: lightweight (default, no P0 path), with 3 mutations in the new code, on top of the 7 from iteration 1 and the 3 from iteration 2.
**Result**: 3/3 killed. PASS ✅

**Runs that opened VS Code**: 3 of the 4 allowed. All ran on the hidden desktop, in the foreground and one at a time, in the scratch.

| # | Run | Result |
| - | -------- | --------- |
| 1 | Gate, no mutation | 68/68 + 1/1 + 1/1, exit 0 |
| 2 | M8 | 67/68 + 1/1 + 1/1, exit 1. Fails only at `:1440` |
| 3 | M6 + M10 | 66/68 + 1/1 + 1/1, exit 1. Failures only at `:708` and `:1446` |

**Isolation**: the real tree's `git status --porcelain` was empty before and after, and HEAD stayed at 56d5bab. I removed the junction with `cmd /c rmdir`, without recursion, then ran `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real tree. The real `node_modules` had 129 visible entries before and after, and `npm ls --depth=0` exited 0.

### Iteration 2 (21d91d4, history)

Same method, in `<scratchpad>/wt2` at 21d91d4. Each mutant ran alone. Lines in this table are at 21d91d4. At 56d5bab, HFD-08's `:1415` is `:1416`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M6 (again) | `src/ui/featuresTree.ts:103` | Folder rule with `f.health === 'complete' \|\| this.isHidden(...)`: every completed spec counts as hidden, even when kept in view by the eye | ✅ Killed (`test/integration/suite.cjs:708`, `[]` instead of `['root']`. Only this test failed, 66/67. Mutant at `dist/extension.cjs:1632`) |
| M8 (new) | `src/ui/featuresTree.ts:110` | Global rule instead of the per-folder rule: filter `this.show \|\| !this.allHidden(loaded) \|\| this.store.projects.some((p) => p.project.features.some((f) => !this.isHidden(p, f)))`. The fully hidden folder only leaves when no folder has a spec in view | ❌ Survived → Fix 2 (67/67 + 1/1 + 1/1, exit 0. Mutant at `dist/extension.cjs:1636`). Killed in iteration 3 |
| M9 (new) | `src/ui/featuresTree.ts:103` | Only the explicit choice counts: `this.hidden.choiceOf(...) === 'hidden'`, and a completed spec hidden by default does not make the folder hidden | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:691` HFD-05, `:1415` HFD-08. 63/67. Mutant at `dist/extension.cjs:1632`) |

Iteration 2 result: 2/3 killed, M8 alive, failed. Runs: 1 gate (67/67 + 1/1 + 1/1), 2 M6 (66/67, fails only at `:708`), 3 M8 (survived), 4 M9 (63/67). The suffix with the same global rule was not run, because of the run limit. In iteration 3 it is M10.

### Iteration 1 (b50c9d7, history)

Same method, in `<scratchpad>/wt` at b50c9d7. Lines in this table are at b50c9d7. At 56d5bab, HFD-08's `:1393` is `:1416`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/ui/featuresTree.ts:103` | `allHidden` without the `features.length > 0` guard: the folder with no spec counts as hidden | ✅ Killed (`test/integration/suite.cjs:1393`, `[]` instead of `bare/.specs`) |
| M2 | `src/ui/featuresTree.ts:110` | Root filter without `this.show \|\|`: the hidden folder also leaves with the eye open | ✅ Killed (`suite.cjs:690`, `[]` instead of `['root']`) |
| M3 | `src/ui/featuresTree.ts:103` | `some` instead of `every`: one hidden spec is enough for the folder to leave | ✅ Killed (17 tests, 49/66. Among them SFP-07/08 at `suite.cjs:442` and HFD-06 at `:686`) |
| M4 | `src/ui/featuresTree.ts:161` | Root description without the "· hidden" suffix | ✅ Killed (`suite.cjs:691`, `'9 feature(s)'` instead of `'9 feature(s) · hidden'`) |
| M5 | `src/ui/featuresTree.ts:161` | Inverted suffix: "· hidden" on the folder in view | ✅ Killed (`suite.cjs:686`, `'9 feature(s) · hidden'` instead of `'9 feature(s)'`) |
| M6 | `src/ui/featuresTree.ts:103` | Folder rule with `f.health === 'complete' \|\| this.isHidden(...)`: every completed spec counts as hidden, even when kept in view by the eye | ❌ Survived → Fix 1 (66/66 + 1/1 + 1/1). Killed in iterations 2 and 3 |
| M7 | `src/ui/featuresTree.ts:110` | Root filter removed (`filter(() => true)`), which is the old SFP-10 behavior | ✅ Killed (`suite.cjs:644` HFD-01, `:669` HFD-02, `:1393` HFD-08) |

Iteration 1 result: 6/7 killed, M6 alive. Runs: 1 gate (66/66), 2 M1 + M4, 3 M7 + M5, 4 M2, 5 M6 (survived), 6 M3. I did not run the eye-conditioned suffix (`this.show && this.allHidden(...)`), because it is equivalent: with the eye closed, the hidden folder does not appear. I also did not run the `tlcSpecs.hasSpecs` key (`src/extension.ts:86`), which is outside the diff and would not show the welcome view with a non-empty message (note 4).

---

## Interactive UAT Results (if performed)

Not performed, because the Verifier runs without a user. The spec's independent test (`spec.md:60`) and the first success criterion (`spec.md:91`) run in this repository and are left for the orchestrator. With the eye closed, the Features tree is empty and shows only the message. With the eye open, the `visual-tlc` node appears with "T feature(s) · hidden". It is also worth checking the Fix 1 case: unhide a completed spec through its eye, close the title eye and see the folder come back with it. The Fix 2 case needs two folders in `tlcSpecs.specsFolders`, one with everything hidden and the other with a spec in view. With the eye closed, only the second stays. With the eye open, both appear, and only the first says "· hidden".

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One two-line method (`featuresTree.ts:101-104`), one filter at the root (`:110`) and the suffix in the description (`:161`). The rule reuses the rows' `isHidden` |
| Surgical changes | ✅ Only `featuresTree.ts`, the suite, the notes in the superseded specs and the README. Fix 1 and Fix 2 touch only the suite, plus the status line in `spec.md` |
| No scope creep | ✅ The Project tree and the Dashboard did not change, as the spec requires (Out of Scope) |
| Matches patterns | ✅ Filter in the same shape as `featureNodes` (`:273`). The fix tests follow the shape of the other HFD tests and of SFP-05/06 (`try`/`finally`, `setFolders`, `waitForRoots`, `featuresOf`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Root, children, description and message asserted with the exact value |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Each AC has a test in the host. The per-folder rule is tested with a single folder, with one next to a folder with no spec, and with two folders with specs in opposite states |
| Every test in scope maps to a spec requirement - no unclaimed tests | ✅ Every new test has an HFD ID in its title. The Fix 1 test is HFD-01/HFD-06, the Fix 2 test is HFD-01/HFD-05/HFD-06 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

HFD-08 leaves `bare/.specs/STATE.md` in the temporary workspace, and Fix 2 leaves `side/.specs`, as SFP-05/06 leaves `later/.specs`. The fixture copy is discarded on every run (note 10). The notes in the superseded specs do not change what the parser reads (checked in iteration 1).

**Test integrity**: from `35a9118` to `b50c9d7`, `suite.cjs` went from 63 to 66 tests and from 256 to 271 `assert.*` calls. From `b50c9d7` to `21d91d4`, it went from 66 to 67 tests and from 271 to 277 calls. From `21d91d4` to `56d5bab` (`git diff 21d91d4..56d5bab -- test`), only `suite.cjs` changed: 36 lines added and 2 removed. The 2 removed are `idOf` and `setHiddenIn`, which came back unchanged at module level (`:1401-1402`). It went from 67 to 68 tests and from 277 to 282 `assert.*` calls (`:1434`, `:1440`, `:1441`, `:1445`, `:1446`). HFD-08 keeps the same three assertions (`:1412`, `:1416`, `:1417`), with the same expressions. No test was removed and no assertion got weaker. The unit tests did not change (68). `src` has not changed since fc47aec (`git diff fc47aec..56d5bab -- src` is empty).

---

## Edge Cases

- [x] HFD-08 A folder with no spec stays in Features with "0 feature(s)", with the eye closed: `test/integration/suite.cjs:1412-1417`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0 (scratch at 56d5bab)
- **Unit**: 68 passed, 0 failed, 0 skipped
- **Integration**: 68/68 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0, run 1 of iteration 3)
- **Test count before feature**: 68 unit and 63 + 1 + 1 integration (35a9118)
- **Test count after feature**: 68 unit and 68 + 1 + 1 integration (56d5bab)
- **Delta**: +5 integration (−1 SFP-10/HID-16, +6 HFD at `suite.cjs:638`, `:661`, `:681`, `:699`, `:1404`, `:1425`)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (if issues found)

### Fix 1: the folder rule with a completed spec kept in view (done in 21d91d4)

- **Root cause**: in the folder rule tests, the spec that kept the folder in view was always an open one. No test saw the difference between `isHidden` and "completed counts as hidden" (M6, `src/ui/featuresTree.ts:103`).
- **Fix task**: a test that hides the open specs, keeps `billing-invoices` in view through the card and asserts the root, the children and the description with the eye closed and open. In the `finally`, it hides `billing-invoices` again and unhides the open specs.
- **Result**: done in `test/integration/suite.cjs:699-719`, as prescribed. M6 dies at `:708` in iterations 2 and 3. Gate green.

### Fix 2: the per-folder rule with two folders with specs (done in 56d5bab)

- **Root cause**: with a single folder, "this folder is fully hidden" and "no folder has a spec in view" give the same result. The only test with two folders (HFD-08) puts a folder with no spec next to it, and there they also give the same result. No test had a fully hidden folder next to another with a spec in view, so M8 (`src/ui/featuresTree.ts:110`) passed.
- **Fix task**: an HFD-01/HFD-05 test after HFD-08 with two folders with specs. With the eye closed, the root has only the folder in view, with "1 feature(s)". With the eye open, both, `.specs` with "N feature(s) · hidden" and the other with "1 feature(s)". In the `finally`, close the eye, unhide the open specs, run `setFolders(undefined)` and wait for `waitForRoots(['.specs'])`.
- **Result**: done in `test/integration/suite.cjs:1425-1456`. Instead of `docs/specs/custom-one`, the test writes `side/.specs/features/side-one/spec.md`, the alternative the prescription allowed (note 1). M8 dies at `:1440`, and M10 at `:1446`. Gate green.

---

## Requirement Traceability Update

The Verifier does not edit `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HFD-01 | Implementing | ✅ Verified (Fix 2, note 1) |
| HFD-02 | Verified | ✅ Verified |
| HFD-03 | Verified | ✅ Verified (note 3) |
| HFD-04 | Verified | ✅ Verified (note 4) |
| HFD-05 | Verified | ✅ Verified |
| HFD-06 | Verified | ✅ Verified (Fix 1 and Fix 2, notes 1 and 2) |
| HFD-07 | Verified | ✅ Verified |
| HFD-08 | Verified | ✅ Verified |

Proposed coverage line: "8 total, 8 verified."

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 8/8 requirements with evidence that matches the spec. 0 precision gaps
**Sensor**: iteration 3 with 3/3 killed (M8, M6, M10). No mutant alive across the three iterations after the fixes
**Gate**: typecheck ok, 68 unit, 68 + 1 + 1 integration, 0 failures

**What works**: with the eye closed, the fully hidden folder leaves Features, whether it is the only folder, next to a folder with no spec, or next to another with a spec in view. With the eye open, it comes back with "N feature(s) · hidden", and the folder in view keeps "N feature(s)". The three EYE-06 rules that make a spec hidden or in view each have a killed mutant. The Project tree, the view message and the welcome view behave as the spec requires.

**Issues found**: none.

**Next steps**: apply the proposed traceability in `spec.md` and run UAT in this repository (independent test and first success criterion).
