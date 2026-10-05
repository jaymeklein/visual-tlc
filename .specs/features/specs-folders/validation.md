# Specs Folders Validation

## Validation: specs-folders - PASS ✅

All 11 requirements match the spec, all gates pass, and all 27 mutations injected into the feature's code die. The gaps from iterations 1 and 2 are closed. Three probes survive, all in code that predates the feature: two are VS Code API limits (N5, N5b) and one is a residue that can be closed later (R1). None of them blocks delivery.

**Date**: 2026-09-29
**Spec**: `.specs/features/specs-folders/spec.md`
**Diff range**: de01d0d..0ef11e1 (iteration 3: 50b67ff..0ef11e1, branch `feat/specs-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | a5516e7 | Failed | 3 live mutants (H7, H12, H16), SF-03 without dashboard or status bar, SF-04 imprecise. Lessons L-003 to L-006 |
| 2 | 50b67ff | Failed | T9 and T11 close H7, H12, and H16. T10 proves the status bar, but proves the dashboard through a mirror recorded before sending: N2 and N8 alive. L-002 promoted, L-007 created |
| 3 | 0ef11e1 | Passed | T12 replaces the mirror with the webview's confirmation. T13 covers the setting that finds nothing. N2, N8, N4, and N6 die |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Normalize and validate the entries | ✅ Done | dfdfd35 |
| T2 Find the specs roots | ✅ Done | 06200dc |
| T3 Label the roots | ✅ Done | 9bc10f3 |
| T4 Discover and watch the configured folders | ✅ Done | 5bb4d65 |
| T5 Warn about invalid entries | ✅ Done | 7529957 |
| T6 Label the groups in the tree | ✅ Done | dea7ca9 |
| T7 Activate on startup | ✅ Done | e592583 |
| T8 Document the setting | ✅ Done | a5516e7 |
| T9 Prove the per-workspace-folder setting | ✅ Done | 070fd79 |
| T10 Prove dashboard and status bar in SF-03 | ✅ Done | 3577fec, completed by T12 |
| T11 Prove file change and deletion in SF-04 | ✅ Done | 50b67ff |
| T12 Prove the dashboard by what it rendered | ✅ Done | 7ffbd03. N2, N6, and N8 die |
| T13 Prove the status bar with no projects | ✅ Done | 0ef11e1. N4 dies |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SF-01 The extension offers `tlcSpecs.specsFolders` | list of relative paths, default `[".specs"]`, `resource` scope (confirmed decision) | `test/integration/suite.cjs:417` - `assert.deepEqual(setting.defaultValue, ['.specs'])`. `:419` - `assert.equal(declared.scope, 'resource')`. `:420` - `get('specsFolders')` equals `['.specs']`. Per-folder behavior: `test/integration/multiroot.cjs:11-14` - `deepEqual(roots, ['a/docs/specs', 'b/.specs'])` | ✅ PASS |
| SF-02 WHEN the setting lists folders THEN each folder that matches any entry becomes a project, at any depth | projects `docs/specs` and `packages/api/docs/specs` with `["docs/specs"]`; with two entries, the folders of both; in multi-root, each folder uses its own list | `test/integration/suite.cjs:428` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` (exact equality, `:409`). `:429-430` - features `['custom-one']` and `['nested-one']`. `:433` - three roots with two entries. `test/integration/multiroot.cjs:11-14` and `:15-18` - features `[['a-custom'], ['b-default']]`. Unit: `test/unit/folders.test.ts:31-34` and `:39-42` | ✅ PASS |
| SF-03 WHEN the setting changes THEN reloads trees, dashboard, status bar, and diagnostics without reloading the window | the 4 surfaces reflect the new list in the same window | **Trees:** `test/integration/suite.cjs:450` - `assert.ok(fired > 0)`. `:455` - `['root','root']`. `:456-459` - features `[['custom-one'], ['nested-one']]`. `:460-463` - Project tree with the ids from `getProjects()`. `:475` - `deepEqual(featuresTree.getChildren(), [])` with no projects. **Dashboard:** `:440` - hook `undefined` with the dashboard closed. `:442-443` - first confirmed state, `deepEqual(before, [projectId()])`. `:451-452` - after the change, waits until the list confirmed by the webview equals the ids from `getProjects()`. `:476` - waits for `[]` with no projects. The value comes from the `rendered` message, sent by the webview after `render()` (`src/webview/main.ts:30-31`) and stored only in `src/ui/dashboard.ts:64`. **Status bar:** `:444` - before, `/user-auth/`. `:453` - after, `assert.match(api.statusBarText(), /^\$\(tasklist\) (custom-one\|nested-one) · /)`. `:474` - `assert.equal(api.statusBarText(), undefined)` with no projects. **Diagnostics:** `:464-467` - every `TLC Specs` diagnostic under `/docs/specs/`. `:468-470` - "without SHALL" in `custom-one/spec.md`. `:477` - no `TLC Specs` diagnostic with no projects | ✅ PASS |
| SF-04 WHEN a file is created, changed, or deleted inside any configured folder THEN updates the view of that folder | the `docs/specs` view reflects the three events | Create: `test/integration/suite.cjs:490-493` - `deepEqual(featuresOf('docs/specs'), ['custom-one','custom-two'])` and `assert.equal(withoutShall(customTwo()), 1)`. Change: `:495-496` - rewrites `spec.md` with SHALL and waits for `withoutShall(customTwo()) === 0`. Delete: `:498-500` - deletes the folder, waits for `!customTwo()` and `deepEqual(featuresOf('docs/specs'), ['custom-one'])`. Other folder intact: `:492` | ✅ PASS |
| SF-05 IF a folder not named `.specs` matches the entry but has no artifact THEN it is ignored | `notes/specs` with no artifact is left out; `tools/.specs` with no artifact appears; `notes/specs` appears after it gets `lessons.json` | `test/integration/suite.cjs:508` - `waitForRoots(['.specs', 'tools/.specs'])`. `:511` - `waitForRoots(['.specs', 'notes/specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:47-52` and `:56-57` | ✅ PASS |
| SF-06 WHEN the workspace opens with a configured folder of another name THEN activates without opening the side bar | extension active without `activate()` and lists the features | `test/integration/startup.cjs:19` - `waitFor(() => ext.isActive)`. `:21-24` - `deepEqual(roots, ['docs/specs'])`. `:25-28` - `deepEqual(features, ['startup-one'])` | ✅ PASS |
| SF-07 WHEN two specs folders belong to the same project THEN the tree labels each group with project and path | `project · path` (e.g. `api · docs/specs`); with one folder, only the project | `test/integration/suite.cjs:547` - `deepEqual(groupLabels(), [ws + ' · .specs', ws + ' · docs/specs', ws + '/packages/api', ws + '/tools'])`. `:551` - `[ws, ws + '/packages/api']`. Unit: `test/unit/folders.test.ts:75-78` and `:67-70` | ✅ PASS |
| SF-08 IF the list is empty THEN uses `.specs` | `[]` behaves like `[".specs"]` | `test/integration/suite.cjs:555-556` - `setFolders([])` + `waitForRoots(['.specs', 'tools/.specs'])`. Unit: `test/unit/folders.test.ts:6-7` and `:16` | ✅ PASS |
| SF-09 IF an entry is absolute, has `..`, or has a glob THEN ignores it and shows a warning with its name | entry kept out of the projects; one warning per entry, with the entry's text | `test/integration/suite.cjs:530` - `waitForRoots(['docs/specs', 'packages/api/docs/specs'])`. `:532-533` - one warning with `"../outside"` and one with `"docs/*"`. `:535` - `assert.equal(shown.length, 2)` after `refresh()`. Unit: `test/unit/folders.test.ts:11-12` | ✅ PASS |
| SF-10 WHEN two entries lead to the same folder THEN it appears once | one project per folder | `test/integration/suite.cjs:516` - `waitForRoots` with `['docs/specs', 'docs\\specs\\', 'specs']`. `:518` - `deepEqual(ids, [...new Set(ids)])`. Unit: `test/unit/folders.test.ts:26` and `:62` | ✅ PASS |
| SF-11 WHEN the entry uses `\` or ends with `/` THEN it is the same normalized path | `docs\specs`, `docs/specs/`, and `docs\specs\` become `docs/specs` | `test/unit/folders.test.ts:20-22`. Host: `test/integration/suite.cjs:515-516` | ✅ PASS |

**Status**: ✅ All ACs covered. 11 of 11 requirements match the spec outcome. No precision gaps.

### SF-03 judgment in this iteration

- **Dashboard**: the proof moved from the host to the webview. The value the test reads only exists if the state reached the webview, was applied, and `render()` finished without error. Seven different failures along the path die: state not sent (N2b), sent empty (N8b), store subscription removed (P2), confirmation missing (M1), empty confirmation (M2), message dropped in the host (M4), state not applied in the webview (R2).
- **Residue (R1)**: the confirmation carries the list the webview holds, not a read of the DOM. If the `render()` call disappears from `src/webview/main.ts:30`, the confirmation is still sent and the test passes. That line predates the feature, and `renderApp` has its own tests in `test/unit/webview.test.ts`. I classify it as a residue outside the diff, not as a gap in this requirement.
- **Dashboard closed** (`suite.cjs:440`): the wait only ends if the hook is cleared when the dashboard is disposed. This guarantees that the first state read at `:442` comes from the new dashboard.
- **Setting that finds nothing** (`suite.cjs:472-477`): covers the path that empties the four surfaces. Kills N4, M3, and D1.
- **Status bar**: text proven. Visibility cannot be read through the VS Code API (N5, N5b).

---

## Discrimination Sensor

Scratch in all three iterations: `git worktree add --detach <scratchpad>/wt HEAD`, with a junction for `node_modules`. One mutation at a time, reverted before the next. No `git stash`.

### Iteration 3 (HEAD 0ef11e1)

Survivors from iteration 2, adapted to the new code:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| N2b | `src/ui/dashboard.ts:94` | State is never sent to the dashboard | ✅ Killed (SF-03) |
| N8b | `src/ui/dashboard.ts:94` | State sent to the dashboard with no projects | ✅ Killed (SF-03) |
| N4 | `src/ui/statusBar.ts:25` | Status bar hook is not cleared when the item disappears | ✅ Killed (SF-03) |
| N6b | `src/ui/dashboard.ts:44` | Dashboard hook is not cleared on dispose | ✅ Killed (SF-03) |

New mutations against the iteration 3 code:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/webview/main.ts:31` | Webview never confirms what it rendered | ✅ Killed (SF-03) |
| M2 | `src/webview/main.ts:31` | Webview confirms an empty list | ✅ Killed (SF-03) |
| M4 | `src/ui/dashboard.ts:64` | Host drops the `rendered` message | ✅ Killed (SF-03) |

Regression in the diff:

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| N1b | `src/ui/dashboard.ts:64` | Dashboard hook records only the first list | ✅ Killed (SF-03) |
| N7 | `src/ui/statusBar.ts:36` | Status bar hook keeps the first text | ✅ Killed (SF-03) |
| H3 | `src/ui/store.ts:119` | Warning repeats on every refresh | ✅ Killed (SF-09) |
| H4 | `package.json:26` | Removes `onStartupFinished` | ✅ Killed (SF-06) |
| H7 | `package.json:220` | Scope `resource` → `window` | ✅ Killed (SF-01, multi-root) |
| H12 | `src/ui/store.ts:129` | Setting read without the workspace folder | ✅ Killed (multi-root) |
| H16 | `src/ui/store.ts:49` | Watchers ignore file deletion | ✅ Killed (SF-04) |
| C1 to C13 | `src/core/folders.ts:22-71` | The 13 core mutations | ✅ Killed (13/13) |

Probes outside the diff (not counted in the score):

| Probe | File:line | Description | Killed? |
| ----- | --------- | ----------- | ------- |
| P1 | `src/ui/statusBar.ts:18` | Status bar stops following the store | ✅ Killed |
| P2 | `src/ui/dashboard.ts:23` | Dashboard stops receiving the state when the store changes | ✅ Killed |
| N3 | `src/ui/statusBar.ts:31` | Item text freezes after the first update | ✅ Killed |
| M3 | `src/ui/store.ts:88` | Store keeps the old projects when nothing matches | ✅ Killed |
| R2 | `src/webview/main.ts:27` | Webview does not apply the new projects | ✅ Killed |
| D1 | `src/ui/diagnostics.ts:23` | Diagnostics are not cleared before updating | ✅ Killed |
| R1 | `src/webview/main.ts:30` | Webview skips `render()` and confirms anyway | ❌ Survived. Residue outside the diff, see Follow-up 1 |
| N5 | `src/ui/statusBar.ts:35` | Status bar item is never shown | ❌ Survived. API limit |
| N5b | `src/ui/statusBar.ts:24` | Status bar item is never hidden | ❌ Survived. API limit |

**Sensor depth**: P0-full manual (27 mutations in the diff: 9 in the new host code, 5 sampled from the host, 13 in the core)
**Result**: 27/27 killed - PASS ✅

### Iteration 2 (HEAD 50b67ff), history

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `package.json:220` | Scope `resource` → `window` | ✅ Killed |
| H12 | `src/ui/store.ts:129` | Setting read without the workspace folder | ✅ Killed |
| H16 | `src/ui/store.ts:49` | Watchers ignore file deletion | ✅ Killed |
| P1 | `src/ui/statusBar.ts:18` | Probe: status bar stops following the store | ✅ Killed |
| P2 | `src/ui/dashboard.ts:23` | Probe: dashboard stops receiving the state | ✅ Killed |
| N1 | `src/ui/dashboard.ts:86` | Dashboard hook records only the first state | ✅ Killed |
| N2 | `src/ui/dashboard.ts:87` | State recorded in the hook and never sent | ❌ Survived (closed in iteration 3) |
| N8 | `src/ui/dashboard.ts:87` | State sent to the dashboard with no projects | ❌ Survived (closed in iteration 3) |
| N7 | `src/ui/statusBar.ts:36` | Status bar hook keeps the first text | ✅ Killed |
| N4 | `src/ui/statusBar.ts:25` | Status bar hook is not cleared when the item disappears | ❌ Survived (closed in iteration 3) |
| N6 | `src/ui/dashboard.ts:38` | Dashboard hook is not reset for a new dashboard | ❌ Survived (closed in iteration 3) |
| N3 | `src/ui/statusBar.ts:31` | Probe: item text freezes | ✅ Killed |
| N5 | `src/ui/statusBar.ts:35` | Probe: status bar item is never shown | ❌ Survived (API limit) |
| C1 to C13 | `src/core/folders.ts:22-71` | The 13 core mutations | ✅ Killed |
| H1 to H6, H8 to H11, H13 to H15 | `src/ui/store.ts`, `package.json` | Iteration 1 host set | ✅ Killed (13/13) |

Iteration 2 score: 31 of 35 killed in the diff.

### Iteration 1 (HEAD a5516e7), history

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Removes the `..` check | ✅ Killed |
| C2 | `src/core/folders.ts:57` | Removes the artifact rule | ✅ Killed |
| C3 | `src/core/folders.ts:56` | Removes the `.specs` exception | ✅ Killed |
| C4 | `src/core/folders.ts:30` | Breaks entry deduplication | ✅ Killed |
| C5 | `src/core/folders.ts:71` | Label never includes the folder | ✅ Killed |
| C6 | `src/core/folders.ts:70` | Label always includes the folder | ✅ Killed |
| C7 | `src/core/folders.ts:32` | Removes the empty-list fallback | ✅ Killed |
| C8 | `src/core/folders.ts:39` | Removes the glob check | ✅ Killed |
| C9 | `src/core/folders.ts:38` | Removes the `\` to `/` replacement | ✅ Killed |
| C10 | `src/core/folders.ts:61` | Less specific entry names the project | ✅ Killed |
| C11 | `src/core/folders.ts:39` | Removes the posix absolute path check | ✅ Killed |
| C12 | `src/core/folders.ts:22` | Artifact rule accepts any depth | ✅ Killed |
| C13 | `src/core/folders.ts:69` | Label ignores the nested project path | ✅ Killed |
| H1 | `src/ui/store.ts:36` | Setting change does not recreate the watchers | ✅ Killed |
| H2 | `src/ui/store.ts:117` | Warning is never shown | ✅ Killed |
| H3 | `src/ui/store.ts:119` | Warning repeats on every refresh | ✅ Killed |
| H4 | `package.json:26` | Removes `onStartupFinished` | ✅ Killed |
| H5 | `src/ui/store.ts:141` | Discovery ignores the configured entries | ✅ Killed |
| H6 | `src/ui/store.ts:148` | Store labels with the folder name only | ✅ Killed |
| H7 | `package.json:220` | Scope `resource` → `window` | ❌ Survived (closed in iteration 2) |
| H8 | `package.json:217` | Default `.specs` → `specs` | ✅ Killed |
| H9 | `src/ui/store.ts:48` | Watchers always watch `.specs` | ✅ Killed |
| H10 | `src/ui/store.ts:36` | Setting change reloads nothing | ✅ Killed |
| H11 | `src/ui/store.ts:135` | Host search loses the `.specs` exception | ✅ Killed |
| H12 | `src/ui/store.ts:129` | Setting read without the workspace folder | ❌ Survived (closed in iteration 2) |
| H13 | `src/ui/store.ts:49` | Watchers ignore creation | ✅ Killed |
| H14 | `src/ui/store.ts:102` | Invalid entries do not reach the warning | ✅ Killed |
| H15 | `src/ui/store.ts:49` | Watchers ignore changes | ✅ Killed |
| H16 | `src/ui/store.ts:49` | Watchers ignore deletion | ❌ Survived (closed in iteration 2) |
| P1 | `src/ui/statusBar.ts:16` | Probe: status bar stops following the store | ❌ Survived (closed in iteration 2) |
| P2 | `src/ui/dashboard.ts:21` | Probe: dashboard stops receiving the state | ❌ Survived (closed in iteration 2) |

Iteration 1 score: 26 of 29 killed in the diff.

**Isolation (iteration 3)**: `git status --porcelain` of the real tree empty before and after the sensor. Junction removed with non-recursive `rmdir`; real `node_modules` with 131 entries before and after. `git worktree remove --force` + `git worktree prune`. `git worktree list` shows only the real tree at 0ef11e1.

---

## Interactive UAT Results (if performed)

Not performed. The Verifier runs without a user. The feature has a UI, so UAT is left to the orchestrator.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Iteration 3 adds 1 line in the webview, 1 type in the protocol, and 1 `case` in the host |
| Surgical changes | ✅ The `posted` mirror was removed along with the write in `postState` |
| No scope creep | ✅ |
| Matches patterns | ✅ `rendered` follows the format of the `ready` and `error` messages |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core 1:1 with the ACs. Host with happy path, edge (empty list, entry with no result, multi-root), and error (invalid entry) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Test integrity (50b67ff..0ef11e1)**: only `test/integration/suite.cjs` changed, with 11 insertions and 5 deletions. The 5 deletions are the wait for the first state, rewritten with another message, and the dashboard `deepEqual`, replaced by a wait with exact equality on the same ids. The change is needed because the confirmation arrives asynchronously. No assertion got weaker. `test/unit/` and the fixtures did not change.

---

## Edge Cases

- [x] An empty list uses `.specs` (SF-08): `test/integration/suite.cjs:556`, `test/unit/folders.test.ts:6`
- [x] An absolute entry, or one with `..` or a glob, is ignored with a warning that names it (SF-09): `test/integration/suite.cjs:532-535`, `test/unit/folders.test.ts:12`
- [x] Two entries for the same folder show the folder once (SF-10): `test/integration/suite.cjs:518`, `test/unit/folders.test.ts:62`
- [x] `\` and a trailing `/` normalize to the same path (SF-11): `test/unit/folders.test.ts:20-22`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration`
- **Typecheck**: exit 0
- **Unit**: 37 passed, 0 failed, 0 skipped (exit 0)
- **Integration**: 34/34 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0), three real VS Code launches
- **Test count before feature**: 25 unit + 24 integration (counted at de01d0d)
- **Test count after feature**: 37 unit + 36 integration
- **Delta**: +12 unit, +12 integration
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (if issues found)

No gap blocks delivery. One optional follow-up and one accepted limit remain.

### Follow-up 1 (non-blocking): confirm the dashboard from the DOM (R1)

- **Root cause**: `src/webview/main.ts:31` builds the confirmation from the `projects` variable, not from what is in the DOM. The `render()` call at `:30` could disappear without any test noticing.
- **Why it does not block**: line `:30` predates the feature, and `renderApp` has tests in `test/unit/webview.test.ts`. Requirement SF-03 asks that the setting change reach the dashboard, and that is proven.
- **Fix task**: build the list from the rendered elements, for example the `data-pid` of the feature cards (`src/webview/render.ts:241`), without repeating ids. A project with no features needs its own marker in the DOM to be included in the list.
- **Done when**: R1 dies.
- **Priority**: Minor

### Accepted limit: visibility of the status bar item (N5, N5b)

The VS Code API does not report whether a status bar item is visible. `item.show()` and `item.hide()` in `src/ui/statusBar.ts:35` and `:24` predate the feature. The item's text is proven. No fix task.

---

## Requirement Traceability Update

The Verifier does not modify `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SF-01 | Implementing | ✅ Verified |
| SF-02 | Implementing | ✅ Verified |
| SF-03 | Implementing | ✅ Verified |
| SF-04 | Implementing | ✅ Verified |
| SF-05 | Implementing | ✅ Verified |
| SF-06 | Implementing | ✅ Verified |
| SF-07 | Implementing | ✅ Verified |
| SF-08 | Implementing | ✅ Verified |
| SF-09 | Implementing | ✅ Verified |
| SF-10 | Implementing | ✅ Verified |
| SF-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requirements match the spec. 0 precision gaps
**Sensor**: 27/27 diff mutations killed. Probes outside the diff: 6 killed, 3 alive (R1, N5, N5b)
**Gate**: typecheck ok, 37 unit, 34 + 1 + 1 integration, 0 failures

**What works**: per-entry discovery at any depth, the artifact rule, the `.specs` exception, per-workspace-folder setting in multi-root, reload of the four surfaces on a setting change, emptying of the four surfaces when nothing matches, per-entry watchers for create, change, and delete, a single warning per invalid entry, labels by project and folder, the empty-list fallback, activation on startup.

**Issues found**: no blocking gap. R1 remains an optional follow-up. N5 and N5b remain an API limit.

**Next steps**: interactive UAT with the user and a status update in `spec.md`.
