# Specs Folder Paths Validation

## Validation: specs-folder-paths - PASS ✅

Passed on iteration 2. All 11 requirements match the spec, and the evidence for each one discriminates. There is no precision gap. Both iteration-1 fixes are closed, with test changes only. HW now dies in SFP-05/06: the test waits for the tree to settle before creating the folder, and without the watcher the folder does not appear (`test/integration/suite.cjs:1322`). U1 dies at `test/unit/folders.test.ts:33` and `:44`, and U2 at `:35`. The sensor kills 15 of 15. The in-scope production code has not changed since iteration 1 (`src/ui/store.ts`, `src/core/folders.ts`, `src/ui/projectTree.ts` and the `getChildren` of `src/ui/featuresTree.ts`). The gate at 0de28fe is green: 68 unit, 63 + 1 + 1 integration.

**Date**: 2026-09-30
**Spec**: `.specs/features/specs-folder-paths/spec.md`
**Diff range**: 41821b4..1cec99c (branch `feat/hidden-specs`): T1 75a3432, T2 e1290a1, T3 2618d18, T4 1cec99c. Fixes in 81406a3 (T5, `suite.cjs`) and 87b3b5a (T6, `folders.test.ts`). Spec notes in 6901713. Lines cited at 0de28fe, which also contains eye-on-every-spec (out of scope)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 1cec99c | Failed | 10/11 requirements with discriminating evidence. SFP-06 without (HW survives). 0 precision gaps. 12/15 killed. Survivors: HW (Fix 1), U1 and U2 (Fix 2). 4 VS Code runs |
| 2 | 0de28fe | Passed | 11/11 requirements match and discriminate. 0 precision gaps. Fix 1 closed: HW dies at `suite.cjs:1322`. Fix 2 closed: U1 at `folders.test.ts:33` and `:44`, U2 at `:35`. 15/15 killed. 3 VS Code runs |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Find the folders by exact path | ✅ Done | 75a3432. `src/core/folders.ts:74-90`. `parseExclude` and `Exclude` are gone. The Done when "does not find `test/fixtures/sample/.specs`" now has isolated proof (T6) |
| T2 Read only the configured folders and remove exclude | ✅ Done | e1290a1. `src/ui/store.ts:48`, `:101`, `:128-130`, `:137-140`, `:147`. `package.json:59`, `:287-297`. Removed `test/fixtures/multi-root/b/.vscode/settings.json` |
| T3 Folder node with a single project | ✅ Done | 2618d18. `src/ui/featuresTree.ts:101-104`, `src/ui/projectTree.ts:36-39` |
| T4 Document the exact path | ✅ Done | 1cec99c. README without `tlcSpecs.exclude`. Notes at `.specs/features/specs-folders/spec.md:59`, `:75`, `.specs/features/exclude-folders/spec.md:3` and `.specs/features/hidden-specs/spec.md:103` |
| T5 Fix 1: SFP-06 proves the watcher | ✅ Done | 81406a3. `treeSettled()` at `test/integration/suite.cjs:1299-1307`, called at `:1319` in place of `api.refresh()` |
| T6 Fix 2: the start-of-path rule on its own | ✅ Done | 87b3b5a. `test/unit/folders.test.ts:33`, `:35`, `:44` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| SFP-01 WHEN `specsFolders` lists `.specs` THEN reads the root `.specs` and ignores those in subfolders | projects = only `.specs`. Excluded: `lib/.specs`, `test/nested/.specs`, `b/legacy/.specs` | **Unit:** `test/unit/folders.test.ts:31` - `[{ path: '.specs', entry: '.specs' }]` with the nested ones in the list. `:33` - `deepEqual(findSpecsRoots(['test/fixtures/sample/.specs/features/user-auth/spec.md', 'tools/.specs/STATE.md'], ['.specs']), [])`. `:35` - `.specs-old/STATE.md` gives `[]`. **VS Code:** `test/integration/suite.cjs:685` - `deepEqual(roots(), ['.specs'])` with `lib/.specs` and `test/nested/.specs` on disk. `:687` - none of their features. `test/integration/multiroot.cjs:20` - `deepEqual(listed('b'), [{ path: 'b/.specs', features: ['b-default'] }])` | ✅ PASS (note 2) |
| SFP-02 WHEN it lists a path with subfolders THEN reads the folder at that path, from the root | only the folder at the path. Excluded: `packages/api/docs/specs` with `docs/specs`, `x/packages/api/.specs` with `packages/api/.specs` | **Unit:** `folders.test.ts:40-43` - `[docs/specs, packages/api/.specs]`. `:44` - `deepEqual(findSpecsRoots(['x/packages/api/.specs/STATE.md'], ['packages/api/.specs']), [])`. **VS Code:** `suite.cjs:695-696` - `waitForRoots(['docs/specs'])` and `featuresOf('docs/specs')` = `['custom-one']`, with `packages/api/docs/specs` on disk. `:699-700` - `['packages/api/docs/specs']` with `['nested-one']`. `multiroot.cjs:18` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }])` | ✅ PASS (note 2) |
| SFP-03 WHILE the spec is outside the configured folders, it stays out of the trees, the dashboard in the editor tab and in the side bar, the status bar and the Problems panel | absent from all six surfaces | **Positive control:** `suite.cjs:1257-1262` - listed, in-test appears in all six. **Absence:** `:1267` - `ok(!treeFeatures().includes('in-test'))`. `:1268` - Project roots = `projectIds()`, only `.specs`. `:1269` - editor tab with `same(r.projects, projectIds()) && !r.cards.includes('in-test')`. `:1270` - side bar with `same(r.projects, projectIds())`. `:1271` - `doesNotMatch(api.statusBarText(), /in-test/)`. `:1272` - the `/test/nested/` diagnostics go away | ✅ PASS (note 3) |
| SFP-04 The extension offers `specsFolders` as the only folder setting, without `tlcSpecs.exclude` | manifest without `tlcSpecs.exclude`; an old value does not change the listing | `suite.cjs:1277` - `ok(!('tlcSpecs.exclude' in properties))`. `:1278-1281` - keys containing folder or exclude = `['tlcSpecs.specsFolders']`. `:1287-1290` - with `"tlcSpecs.exclude": [".specs"]` in `settings.json`, `deepEqual(roots(), ['.specs'])`. `:1291` - same features as before | ✅ PASS |
| SFP-05 IF the entry points to a folder that does not exist THEN ignores it without a warning | no project; no warning | `suite.cjs:1320` - `deepEqual(roots(), ['.specs'])` with `later/.specs` configured, after the configuration reload. `:1324` - `deepEqual(shown, [])` | ✅ PASS (note 1) |
| SFP-06 WHEN an entry's folder is created later THEN it appears without reloading the window | creating the folder, on its own, makes the project appear | `suite.cjs:1319` - `treeSettled()`: 1500 ms without a tree reload before creating the folder. `:1321-1323` - creates `later/.specs/features/late-one/spec.md`, `waitForRoots(['.specs', 'later/.specs'])` and `featuresOf` = `['late-one']`. With no watcher for the new folder (HW), `:1322` times out: "got .specs" | ✅ PASS (note 1) |
| SFP-07 WHILE there is a single specs folder, Features shows a node with the workspace folder name and the specs inside | `['root']`, label = workspace name, children = non-hidden specs | `suite.cjs:442` - `deepEqual(features.map((n) => n.kind), ['root'])`. `:443` - `equal(getTreeItem(features[0]).label, ws)`. `:444-450` - children = `modelNames((f) => f.health !== 'complete')` | ✅ PASS |
| SFP-08 WHILE there is a single specs folder, Project shows a node with the name and Handoff, decisions and lessons inside | `['root']`, label `ws`, `handoff`, `decisions`, `lessons` | `suite.cjs:452` - `deepEqual(project.map((n) => n.kind), ['root'])`. `:453` - label `ws`. `:455` - `handoff`, `decisions` and `lessons` among the children. NAV-03 opens the Handoff from inside the node (`:200`) | ✅ PASS |
| SFP-09 WHEN a workspace folder has more than one specs folder found THEN label "name · path" | `ws · .specs` and `ws · docs/specs` in both trees; `ws` with only one | **Unit:** `folders.test.ts:77-80` - `['ws']` with two entries and one folder. `:85-88` - `['api · .specs', 'api · docs/specs', 'api · packages/api/.specs']`. **VS Code:** `suite.cjs:819-820` - Features and Project with `ws · .specs` and `ws · docs/specs`. `:824-825` - `ws · docs/specs` and `ws · packages/api/docs/specs` | ✅ PASS (note 4) |
| SFP-10 WHILE the eye is closed and all specs are hidden, the node has no children and the message counts the hidden ones | `['root']`, children `[]`, message with H = T | `suite.cjs:508` - `deepEqual(roots.map((n) => n.kind), ['root'])`. `:509` - `deepEqual(getChildren(roots[0]), [])`. `:510` - `` `${T} feature(s) · ${D} completed · ${T} hidden` ``. `:512-515` - welcome only with `!tlcSpecs.hasSpecs` | ✅ PASS |
| SFP-11 IF the entry is absolute, has `..` or a glob THEN ignores it with a warning that quotes the entry | left out of the list; one warning with the entry in quotes; no repeats | **Unit:** `folders.test.ts:12` - nine invalid forms in `invalid`, only `docs/specs` in `entries`. `:98-106` - one warning per entry, repeated only when the entry comes back. **VS Code:** `suite.cjs:800` - `waitForRoots(['docs/specs'])` with `../outside` and `docs/*`. `:802-803` - one message with `"../outside"` and one with `"docs/*"`. `:805` - `equal(shown.length, 2)` after `refresh` | ✅ PASS (note 5) |

**Status**: ✅ All ACs covered. 11/11 match the spec and discriminate. 0 precision gaps. G1 and G2 from iteration 1 closed.

### Notes

1. **SFP-05/SFP-06, the timing.** In iteration 1 the test passed through the reload that the setting change schedules (`src/ui/store.ts:28-31`, `:35-37`, `:73-76`), not through the watcher. Now `treeSettled()` (`suite.cjs:1299-1307`) waits 1500 ms with no `onDidChangeTreeData` before creating the folder, well above the 300 ms debounce. After that, only the watcher can bring in the folder. HW, with watchers only for entries whose folder already exists (`store.ts:47`), times out at `:1322`: "timed out waiting for: projects .specs, later/.specs (got .specs)". The real code shows the folder: the gate is green, so the `later/.specs/**` watcher, created before the folder existed, fires. Replacing `api.refresh()` with `treeSettled()` does not hollow out SFP-05. HN left a single message at `:1324`. So a reload with `later/.specs` in the list ran before the write, and the `:1320` assertion holds for the new setting.
2. **SFP-01/SFP-02, the two layers.** The exact-path rule lives in the rooted glob of the search (`store.ts:137-140`) and in the core's `startsWith` (`src/core/folders.ts:78`). Integration kills reverting both together (HR, iteration 1: SFP-01, SFP-02 and `multiroot.cjs:18`). The unit tests now isolate the core. The negatives stand alone, with no root folder that would give the same answer: `folders.test.ts:33` and `:44` kill U1, and `:35` kills U2.
3. **SFP-03, the side bar.** The editor tab is asserted on the cards (`:1269`), the side bar on the projects (`:1270`). The side bar cards come from the same state as the projects. Accepted. The positive control (`:1257-1262`) proves that each probe sees the spec when it is listed.
4. **SFP-09, "found".** The spec now says "found" (`spec.md:79`), matching the code (`folders.ts:89`, with `found` at `store.ts:153`) and the unit test (`folders.test.ts:77-80`). The iteration-1 question is closed.
5. **SFP-11, the text.** The test asserts the entry in quotes, which is what SF-09 and SFP-11 require. The full warning text (`store.ts:116`, `:129`) was only asserted by EXC-10, which went away with exclude. It is not a requirement. Recorded here.
6. **Lessons checked.** L-002, L-006: still apply, now with the creation event isolated. L-009 and L-014: do not apply. The iteration-1 candidates hold in the tests: L-023 in `treeSettled()` (`suite.cjs:1319`), L-024 in the standalone negatives (`folders.test.ts:33`, `:35`, `:44`). No confirmed lesson recurred.

---

## Discrimination Sensor

Fresh scratch in iteration 2: `git worktree add --detach <scratchpad>/wt-sfp2 0de28fe`, with a `node_modules` junction to the real one. The same text swaps as in iteration 1, each required to match exactly once, applied by script and undone with `git checkout -- .` in the scratch. The scratch's `git status --porcelain` was empty after each revert. No `git stash`. The in-scope production code did not change, so the swaps apply without adjustment. In unit I re-ran the 7 mutations, one at a time. In integration I ran HW, HM, HN, HX, HL and HP, in two separate test batches. HF and HR carry over from iteration 1: the code and the assertions that kill them have not changed, only HR's line.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| U1 | `src/core/folders.ts:78` | `file.includes(`${entry}/`)` in place of `startsWith`: accepts the folder at any depth and maps it to the entry | ✅ Killed in iteration 2 (`test/unit/folders.test.ts:33`, `:44`). Alive in iteration 1 (Fix 2) |
| U2 | `src/core/folders.ts:78` | `file.startsWith(entry)` without the slash: `.specs-old` becomes `.specs` | ✅ Killed in iteration 2 (`:35`). Alive in iteration 1 (Fix 2) |
| U3 | `src/core/folders.ts:78-81` | Restores the old core rule: `indexOf` at any depth, nested path | ✅ Killed (`:31`, `:40`) |
| U4 | `src/core/folders.ts:80` | Artifact rule reads `file.slice(entry.length)`: the slash is left over | ✅ Killed (5 tests, starting with `:40`, `:49`, `:58`) |
| U5 | `src/core/folders.ts:89` | `rootLabel` always with just the name | ✅ Killed (`:85`) |
| U6 | `src/core/folders.ts:89` | `rootLabel` always "name · entry" | ✅ Killed (`:77`) |
| U7 | `src/core/folders.ts:53` | An entry with a comma becomes invalid again, as in exclude | ✅ Killed (`:92`) |
| HP | `src/ui/projectTree.ts:38` | Project skips the node with a single project | ✅ Killed (`test/integration/suite.cjs:452`, `['handoff', 'decisions', 'lessons']` in place of `['root']`; NAV-03 at `:212`) |
| HF | `src/ui/featuresTree.ts:103` | Features skips the node with a single project | ✅ Killed in iteration 1 (`suite.cjs:442`, the same line today) |
| HL | `src/ui/store.ts:153` | Label computed from its own folder only: never "name · path" | ✅ Killed (`suite.cjs:819`, `['ws', 'ws']`) |
| HX | `src/ui/store.ts:147` | The search reads `tlcSpecs.exclude` again | ✅ Killed (`suite.cjs:1290`, `[]` in place of `['.specs']`) |
| HM | `package.json:287` | `tlcSpecs.exclude` back in the manifest | ✅ Killed (`suite.cjs:1277`, "tlcSpecs.exclude is still contributed") |
| HN | `src/ui/store.ts:151` | Warning for the entry with no folder | ✅ Killed (`suite.cjs:1324`, `['TLC Specs: later/.specs does not exist']` in place of `[]`) |
| HW | `src/ui/store.ts:47` | Watchers only for entries whose folder already exists | ✅ Killed in iteration 2 (`suite.cjs:1322`, "got .specs"). Alive in iteration 1 (Fix 1) |
| HR | `src/ui/store.ts:139` + `src/core/folders.ts:78-81` | Both layers search at any depth again | ✅ Killed in iteration 1 (`suite.cjs:633` at 1cec99c, today `:685`; `:643`, today `:695`; `test/integration/multiroot.cjs:18`) |

Equivalent mutants, not run: the search glob alone as `**/${entry}/**` (`store.ts:139`), and the watcher glob (`store.ts:48`). `rootLabel` with `all.length > 1` (`folders.ts:89`).

**Sensor depth**: extended lightweight (default, no P0 path). 7 unit mutations, all re-run at 0de28fe. 8 in the host: 6 re-run, 2 kept from iteration 1.
**Result**: 15/15 killed. PASS ✅.

**Runs that opened VS Code** in iteration 2: 3 of the 3 allowed, all on the hidden desktop, in the foreground, one at a time:

| # | Run | Tree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | scratch (0de28fe) | 63/63 + 1/1 + 1/1 |
| 2 | HW + HM | scratch | 61/63 + 1/1 + 1/1. Only SFP-04 (`:1277`) from HM and SFP-05/06 (`:1322`) from HW |
| 3 | HN + HX + HL + HP | scratch | 58/63 + 1/1 + 1/1. NAV-03 (`:212`) and SFP-07/08 (`:452`) from HP, SFP-09 (`:819`) from HL, SFP-04 (`:1290`) from HX, SFP-05/06 (`:1324`) from HN |

Each mutant failed only its own test. The logs show the extension loaded from the scratch, and I checked HW in the scratch's `dist/extension.cjs`. Iteration 1 used 4 runs.

**Isolation**: `git status --porcelain` of the real tree empty before and after. HEAD stayed at 0de28fe. Junction removed without recursion (`[System.IO.Directory]::Delete(..., $false)`), then `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real tree. Real `node_modules` with 129 visible entries (131 including hidden ones) before and after, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Not performed. The Verifier runs without a user. The spec's independent test (`spec.md:65`, `:81`) runs in this repository and is left to the orchestrator: with the default, nothing from `test/fixtures` in the side bar or the dashboard; with `["test/fixtures/sample/.specs"]`, only the fixture's specs.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `findSpecsRoots` got simpler, and `parseExclude` is gone. Leftover shape, accepted by the orchestrator: `SpecsRoot.path` and `.entry` are always equal (`folders.ts:81`), and `InvalidEntry.setting` with the `ADVICE` map (`store.ts:128-130`) serve a single setting |
| Surgical changes | ✅ Only what exclude left orphaned was removed. The iteration-2 fixes only touch tests. The comment at `suite.cjs:406` was corrected |
| No scope creep | ✅ `findFiles(..., null, ...)` (`store.ts:146-147`) keeps `files.exclude` out, with the same effect as before. Not a requirement and not tested |
| Matches patterns | ✅ The core stays pure. `treeSettled()` reuses `waitFor` and the tree event, like the other tests |
| Spec-anchored outcome check (asserted values match spec) | ✅ Labels, roots, features, empty warning list and manifest asserted with the exact value |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core: the start-of-path rule has isolated cases. Host: the watcher for the folder created later is discriminated |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Every test has an SF or SFP ID in its title |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:20`) | ✅ |

The SF-02 note was moved out of the middle of the numbered list (`.specs/features/specs-folders/spec.md:59`).

**Test integrity (41821b4..1cec99c)**: `test/unit/folders.test.ts` went from 20 to 15 tests. The 6 `parseExclude` tests were removed. The comma test and the `pendingWarnings` test stayed, with only `tlcSpecs.specsFolders`. SF-02 at any depth became SFP-01 and SFP-02. `test/integration/suite.cjs` went from 63 to 61: 7 EXC removed, SF-02 split in two, and SFP-07/08, SFP-03, SFP-04 and SFP-05/06 added. `multiroot.cjs` went from 2 to 1: EXC-05 removed. The removal is SFP-04, approved by the user. No assertion got weaker, and no remaining behavior lost requirement coverage. Only the full warning text is left untested (note 5).

**Test integrity (1cec99c..0de28fe, SFP scope)**: no SFP test added or removed. `folders.test.ts` went from 23 to 26 assertions. In `suite.cjs`, SFP-05/06 replaced `api.refresh()` with `treeSettled()` and kept its four assertions. The swap does not weaken `:1320` (note 1). The two EYE tests and the HID changes belong to eye-on-every-spec.

---

## Edge Cases

- [x] SFP-10 Project with everything hidden: node with no children and a message with the hidden count: `test/integration/suite.cjs:508-510`
- [x] SFP-11 Absolute entry, with `..` or a glob: ignored with a warning that quotes it: `test/unit/folders.test.ts:12`, `test/integration/suite.cjs:802-805`
- [x] Assumption "Entry that does not exist: shows up when the folder is created" (`spec.md:37`, SFP-06): `suite.cjs:1319-1323`, HW dies at `:1322`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0 (scratch at 0de28fe)
- **Unit**: 68 passed, 0 failed, 0 skipped
- **Integration**: 63/63 in `suite.cjs`, 1/1 in `startup.cjs`, 1/1 in `multiroot.cjs` (exit 0, run 1 of iteration 2)
- **Test count before feature**: 67 unit + 66 integration (63 + 1 + 2, at 2c7b475)
- **Test count after feature**: 62 unit + 63 integration (61 + 1 + 1) for SFP, at 1cec99c. At 0de28fe: 68 unit and 63 + 1 + 1, including 6 unit and 2 integration from eye-on-every-spec
- **SFP delta**: -5 unit, -3 integration. In unit, the 6 `parseExclude` tests were removed, and SF-02 at any depth split in two. In integration, 7 EXC in `suite.cjs` and EXC-05 in `multiroot.cjs` were removed. SF-02 split in two, and 4 new SFP tests were added. Everything removed belongs to `tlcSpecs.exclude` (SFP-04). The fixes only added assertions
- **Skipped tests**: none
- **Failures**: none

The author's numbers check out.

---

## Fix Plans (if issues found)

### Fix 1: isolate the watcher for the folder created later (SFP-06, HW) - closed

- **Resolution**: 81406a3 (T5). `treeSettled()` (`test/integration/suite.cjs:1299-1307`) waits 1500 ms without a tree reload. SFP-05/06 calls it right after `setFolders` (`:1319`), before asserting `['.specs']` and creating the folder.
- **Done when checked**: HW fails in SFP-05/06, at the `waitForRoots` after the write (`:1322`). The gate stays green, so the real watcher shows the folder.

### Fix 2: isolate the start-of-path rule in the core (U1, U2) - closed

- **Resolution**: 87b3b5a (T6). `test/unit/folders.test.ts:33` and `:44` assert `[]` with only nested folders. `:35` asserts `[]` for `.specs-old`.
- **Done when checked**: U1 fails at `:33` and `:44`, U2 at `:35`, in `npm test`. The gate stays green.

---

## Requirement Traceability Update

The Verifier does not change `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SFP-01 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| SFP-02 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| SFP-03 | Implementing | ✅ Verified |
| SFP-04 | Implementing | ✅ Verified |
| SFP-05 | Implementing | ✅ Verified |
| SFP-06 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| SFP-07 | Implementing | ✅ Verified |
| SFP-08 | Implementing | ✅ Verified |
| SFP-09 | Implementing | ✅ Verified |
| SFP-10 | Implementing | ✅ Verified |
| SFP-11 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 requirements match the spec and discriminate. 0 precision gaps
**Sensor**: 15/15 killed
**Gate**: typecheck ok, 68 unit, 63 + 1 + 1 integration, 0 failures

**What works**: the extension reads only the listed folders, from the root of each workspace folder. `.specs` in subfolders stays out of the trees, the editor tab, the side bar, the status bar and the Problems panel. A path with subfolders reads only that folder, in multi-root too. `tlcSpecs.exclude` is gone from the manifest, and an old value changes nothing. An entry without a folder produces no project and no warning. When the folder appears later, the watcher shows it without reloading the window. Both trees show the folder node with a single project, named after the workspace, and "name · path" with two folders. With everything hidden the node has no children. Invalid entries are still rejected, with one warning each.

**Issues found**: none blocking. The full warning text is still untested, and it is not a requirement (note 5).

**Next steps**: update the statuses in `spec.md` to Verified. Run the spec's independent test with the user (UAT).
