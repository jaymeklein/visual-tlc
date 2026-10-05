# Exclude Folders Validation

## Validation: exclude-folders - PASS ✅

All 10 requirements match the spec, and the gate passes. H7, the surviving mutant of iteration 2, is now killed in EXC-10 (`test/integration/suite.cjs:987`). Each setting has its own guidance text, and swapping the two texts (A1) is killed in EXC-07 (`:964`). The new Dashboard checks in EXC-03 read what the page drew: the cards in the editor tab and the side bar's project list. A side bar that keeps the excluded projects (W1) is killed at `:915`. K7 is killed in unit (`test/unit/folders.test.ts:114`). No executed mutant survived. One test-hygiene observation remains, and it does not block: the exclude-folders cases depend on the state the previous case leaves behind (Follow-up 1).

**Date**: 2026-09-29
**Spec**: `.specs/features/exclude-folders/spec.md`
**Diff range**: 4df4e6a..82679f4 (iteration 3: 96161f2..82679f4, branch `feat/exclude-folders`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 3 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | 8794d3a | Rejected | 9/9 criteria match. H6 alive: the warning key without the setting name. Follow-ups: fixed count in `multiroot.cjs` and entry with a comma. Lesson L-016. 7 VS Code runs |
| 2 | 96161f2 | Rejected | `pendingWarnings` covered by unit: K1 and K2 killed. Comma rejected in `tlcSpecs.exclude`. `multiroot.cjs` with two cases and a real count. H7 alive in the wiring at `src/ui/store.ts:102`. K7 alive, outside the criteria. Lessons L-017 and L-018. 4 VS Code runs |
| 3 | 82679f4 | Approved | EXC-10 kills H7 (`suite.cjs:987`). `ADVICE` per setting: A1 killed at `:964`. EXC-03 with the Dashboard in the editor tab and the side bar: W1 killed at `:915`. K7 killed at `folders.test.ts:114`. 6/6 killed. 4 VS Code runs |

---

## Task Completion

Medium scope, no `tasks.md`. The steps are the commits in the diff.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Specify exclude-folders | ✅ Done | 534d377. Invalid-entry rule in 300ad82. Dashboard in EXC-03, EXC-10, and per-setting text in 5b0ce63 |
| Parse the excluded folders (`parseExclude`) | ✅ Done | a8ebfc9. Comma in 0b2752a |
| Remove the excluded folders from the listing (`store.ts`, manifest) | ✅ Done | 11f76e4. Manifest description in 97b8994 |
| Cover per-folder exclusion in multi-root | ✅ Done | 7b125a2, split into two cases in b4e11ea |
| Document the setting in the README | ✅ Done | 8794d3a, 96161f2 |
| Iteration 1 Fix 1: warn about each setting's entries separately | ✅ Done | 0b2752a in the core. The host case came in 74beb1b (EXC-10) |
| Iteration 2 Fix 1: setting name in the `specsFolders` warning (H7) | ✅ Done | 74beb1b. `test/integration/suite.cjs:977-1003`. H7 killed |
| Iteration 2 Fix 2: per-setting warning guidance | ✅ Done | 74beb1b. `ADVICE` in `src/ui/store.ts:130-134` |
| Iteration 2 Follow-up 3: `specsFolders` accepts commas (K7) | ✅ Done | 650321f in the test (`test/unit/folders.test.ts:113-115`), 5b0ce63 in the spec (`spec.md:36`). K7 killed |
| Iteration 2 Follow-up 4: manifest description | ✅ Done | 97b8994. `package.json:240` |
| Dashboard in EXC-03, at the user's request | ✅ Done | 5b0ce63 in the spec (`spec.md:56`), 82679f4 in the test (`suite.cjs:906-909`, `:914-915`) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| EXC-01 The extension offers `tlcSpecs.exclude` as a list of relative paths, with the default `["node_modules"]` | list of strings, default `["node_modules"]`, `resource` scope (`spec.md:32`, `:34`) | `test/integration/suite.cjs:890` - `assert.deepEqual(declared.default, ['node_modules'])`. `:891` - `deepEqual(declared.type, ['array', 'string'])`. `:892` - `deepEqual(declared.items, { type: 'string' })`. `:893` - `assert.equal(declared.scope, 'resource')`. `:894` - effective value `['node_modules']`. Effect of the default: `:903` creates `node_modules/pkg/.specs`, and `:904` and `:928` expect the listing without it | ✅ PASS |
| EXC-02 WHEN the list has a folder THEN every specs folder inside it leaves the listing, at any depth | `test/nested/.specs` and `packages/api/test/.specs` out; the others stay | `test/integration/suite.cjs:911-912` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['.specs', 'tests/.specs', 'tools/.specs'])`, with the folders created at `:900-901`. `test/unit/folders.test.ts:84` - `deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] })`. `:85` - three entries in `{...}`. `:89` - entries normalized and deduplicated | ✅ PASS |
| EXC-03 WHEN `tlcSpecs.exclude` changes THEN projects, trees, Dashboard (in the editor tab and in the side bar), and diagnostics update without reloading the window | all five surfaces with the new state, in the same window | **Projects:** `test/integration/suite.cjs:912` and, on the way back, `:928`. **Trees:** `:916-919` - `deepEqual(api.featuresTree.getChildren().map(...), projectIds())`. `:920-923` - the same for `api.projectTree`. **Dashboard in the editor tab:** before, `:908` - `r.detail === null && r.cards.includes('in-test') && r.cards.includes('in-tests')`. After, `:914` - `!r.cards.includes('in-test') && r.cards.includes('in-tests')`. **Dashboard in the side bar:** before, `:909` - `same(r.projects, projectIds())` with the five projects. After, `:915` - `same(r.projects, projectIds())` with the three. **Diagnostics:** `:905` waits for the ones from `test/nested` before. `:924` waits for the ones from `/test/` to disappear. `:925` - `assert.ok(... includes('/tests/.specs/'))` | ✅ PASS (see notes 1 to 3) |
| EXC-04 IF the value is a string THEN it is used as an exclusion glob | the string applies as a glob, without conversion | `test/integration/suite.cjs:942-943` - `setExclude('{**/node_modules/**,**/tools/**}')` + listing without `tools/.specs`. `:944-945` - `setExclude('**/test/**')` + listing with `node_modules/pkg/.specs` and without the `test` ones. `test/unit/folders.test.ts:93-95` - glob returned equal to the string, `''` becomes `null` | ✅ PASS |
| EXC-05 WHERE the workspace has more than one folder THEN each folder uses the list configured in it | `b` excludes `legacy`; `a` does not | `test/integration/multiroot.cjs:27-30` - `deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }, { path: 'a/legacy/docs/specs', features: ['a-legacy'] }])`. `:31-34` - `deepEqual(listed('b').map((p) => p.path), ['b/.specs'])`. Configuration in `test/fixtures/multi-root/b/.vscode/settings.json:2` | ✅ PASS |
| EXC-06 IF the list is empty THEN all folders are listed, including the ones in `node_modules` | no exclusion | `test/integration/suite.cjs:949-950` - `setExclude([])` + listing with `node_modules/pkg/.specs`. `test/unit/folders.test.ts:99` - `deepEqual(parseExclude([]), { glob: null, invalid: [] })` | ✅ PASS |
| EXC-07 IF an entry is absolute or contains `..`, a comma, or a glob THEN it is ignored, with a warning that gives its name and the name of the `tlcSpecs.exclude` setting | entry has no effect; warning with the entry name and `tlcSpecs.exclude` | **Rejection:** `test/unit/folders.test.ts:103-105` - eight invalid entries reported as written. `:109` - `deepEqual(parseExclude(['docs,old', 'test']), { glob: '**/test/**', invalid: ['docs,old'] })`. `:110` - comma between three entries. **Warning:** `test/integration/suite.cjs:961-962` - `['../outside', '**/tools/**', 'test']` excludes only `test`. `:964-967` - `deepEqual([...shown].sort(), [...])` with the exact text, `in tlcSpecs.exclude` and `without a comma` in both. `:969` - `assert.equal(shown.length, 2)` after the refresh. **Once per setting:** `test/unit/folders.test.ts:119-120` - `deepEqual(first.show, [outside('tlcSpecs.specsFolders'), outside('tlcSpecs.exclude')])`. `:122-128` - no repetition, and warned again when the entry comes back | ✅ PASS |
| EXC-08 WHEN a folder has the entry name as part of its name THEN it stays in the listing | `tests` stays with the entry `test` | `test/integration/suite.cjs:912` - `tests/.specs` in the listing. `:913` - `deepEqual(featuresOf('tests/.specs'), ['in-tests'])`. `:914` - card `in-tests` in the editor tab. `:925` - `tests/.specs` diagnostics kept | ✅ PASS |
| EXC-09 WHEN a folder is in `specsFolders` and inside an `exclude` entry THEN it stays out | exclusion wins | `test/integration/suite.cjs:933-934` - `test/docs/specs` appears without the exclusion. `:935-936` - `setExclude(['node_modules', 'test'])` + `waitForRoots(['docs/specs', 'packages/api/docs/specs'])` | ✅ PASS |
| EXC-10 WHEN the same invalid entry is in `specsFolders` and in `exclude` THEN one warning per setting, with the setting's name | two warnings, one with `tlcSpecs.specsFolders`, the other with `tlcSpecs.exclude` | `test/integration/suite.cjs:985-986` - `setFolders(['../outside', '.specs'])` and `setExclude(['../outside', 'node_modules'])`. `:987` - waits for two warnings. `:988-994` - `deepEqual([...shown].sort(), [...])` with the exact text of both: `in tlcSpecs.exclude` with `without a comma` (`:991`), `in tlcSpecs.specsFolders` with no comma mention (`:992`). `:996` - `assert.equal(shown.length, 2)` after the refresh. Core: `test/unit/folders.test.ts:119-120` | ✅ PASS |

**Status**: ✅ All ACs covered. 10 of 10 requirements match the spec outcome. No precision gap.

### Notes

1. **EXC-03, Dashboard and L-002.** The editor tab is read from the DOM: `cards` comes from the visible `.card-name` elements (`src/webview/main.ts:57`, `:61`). The side bar is read from `projects` (`main.ts:60`), which is the page's list, not the DOM. Accepted for three reasons. First, the page sends `rendered` at the end of `render()` (`main.ts:41`, `:49`), so `projects` is the list that just went to the screen, not the host message (`postState`, `src/ui/dashboard.ts:110-112`). Second, the editor tab and the side bar run the same page code, with no side-bar-only branch: `src/webview/main.ts` and `render.ts` do not read the `side` class. The path from the list to the DOM is proven in the editor tab, at `:914`. Third, W1 proves that `:915` catches a side bar that keeps the excluded projects. The check would be stronger with the side bar's cards, as in SIDE-10 (`suite.cjs:825`). Not blocking.
2. **EXC-03, the Dashboard checks do not pass vacuously.** The before checks (`:908`, `:909`) require `in-test` in the editor tab and the five projects in the side bar. The after checks only pass if the Dashboard changed. `:914` also requires `in-tests`, so the editor tab cannot pass with no cards or on a feature's detail.
3. **EXC-03, trees.** Same judgment as in iteration 2. `getChildren()` reads `store.projects`, and the reload event is measured in SF-03 (`suite.cjs:452`). The tree code did not change. Accepted.
4. **Comma.** The spec limits the comma rule to `tlcSpecs.exclude` (`spec.md:36`). The unit test pins that `specsFolders` accepts commas (`test/unit/folders.test.ts:114`), and K7 is killed there. The host has no path of its own for the comma: that is the iteration 2 judgment.
5. **Warning text.** The decision row (`spec.md:37`) asks that each setting give guidance only by its own rules. `ADVICE` (`src/ui/store.ts:130-134`) does that. The `specsFolders` text, with no comma mention, is pinned at `suite.cjs:992`. The `exclude` text, at `:966` and `:991`. The README (`README.md:80`, `:96`) and the manifest (`package.json:240`) say the same.
6. **L-002 and L-006 applied.** Listing, trees, Dashboard, diagnostics, and warning are read on the surface the user sees, with the caveat in note 1. The spec has no watcher criterion.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt-exc3 HEAD` (82679f4), with a `node_modules` junction to the real one. One mutation at a time, applied by exact text replacement and reverted with `git checkout` in the scratch tree before the next one. No `git stash`. The VS Code runs went through the hidden-desktop launcher, one at a time, in the foreground. There were 4, out of the limit of 4, counting the gate.

### Iteration 3 (HEAD 82679f4), executed

Core (`npm test`, opens nothing):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K7 | `src/core/folders.ts:67` | The `accepts` pattern rejects commas: the rule leaks into `tlcSpecs.specsFolders` | ✅ Killed (`test/unit/folders.test.ts:114`). Alive in iteration 2 |
| K1 | `src/core/folders.ts:60` | Warning key without the setting name | ✅ Killed (`:120`) |
| K2 | `src/core/folders.ts:64` | `warned` never forgets | ✅ Killed (`:128`) |

Host (integration suite, hidden desktop):

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| H7 | `src/ui/store.ts:102` | `specsFolders` entries warned with the name `tlcSpecs.exclude` | ✅ Killed (`suite.cjs:987`, EXC-10: "timed out waiting for: two warnings". 52/53 + 1/1 + 2/2). Alive in iteration 2 |
| A1 | `src/ui/store.ts:132-133` | `ADVICE` texts swapped between the two settings | ✅ Killed (`suite.cjs:964`, EXC-07. 51/53 + 1/1 + 2/2) |
| W1 | `src/webview/main.ts:27` | In the side bar only, the page merges the new list into the previous one and keeps the projects that left | ✅ Killed (`suite.cjs:915`: "the side panel to drop the excluded projects", with `:909` passing. Also SIDE-11 and SIDE-10. 45/53 + 1/1 + 2/2) |

All logs show the extension loaded from the scratch tree. The H7 bundle had `setting: "tlcSpecs.exclude"` twice in `dist/extension.cjs`. The W1 bundle had the `classList.contains("side")` branch in `dist/webview.js`.

Runs that opened VS Code:

| # | Run | Tree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | real (82679f4) | 53/53 + 1/1 + 2/2 |
| 2 | H7 | scratch | 52/53 + 1/1 + 2/2 |
| 3 | A1 | scratch | 51/53 + 1/1 + 2/2 |
| 4 | W1 | scratch | 45/53 + 1/1 + 2/2 |

### Cascading failures

- **A1.** EXC-10 also failed, but at `:987`, not at `:988`. EXC-07 threw at `:964`, before the final `waitForRoots` (`:974`). The `setExclude(undefined)` in the `finally` scheduled a refresh, and EXC-10 changed the setting before it ran. The debounce (`src/ui/store.ts:73-76`) merged everything into a single refresh, and `warned` did not forget `tlcSpecs.exclude: ../outside`. A1's kill is the EXC-07 one. From reading the code, EXC-10 alone would kill A1 at `:988`, which compares both texts.
- **W1.** EXC-09, EXC-04, EXC-06, EXC-07, and EXC-10 failed in cascade. The EXC-02/03/08 case has no `finally` and left `tlcSpecs.exclude` at `['node_modules', 'test']` (`suite.cjs:911`, restored at `:927`). EXC-09 expected `test/docs/specs` and got the list without it.

### Judged by reading, not executed

- **Mirror of H7 (H3), `src/ui/store.ts:103`.** `exclude` entries with the name `tlcSpecs.specsFolders`. Killed at `suite.cjs:964`, which compares the whole text including `in tlcSpecs.exclude`, and at `:988`. Killed in iteration 1, and the assertion has not lost strength.
- **A2, `src/ui/store.ts:132`.** The `specsFolders` warning goes back to the text with `without a comma`, the state before Fix 2. EXC-07 passes. EXC-10 fails at `:988`, which pins the text with no comma mention (`:992`).
- **A3, `src/ui/store.ts:131-134`.** One `ADVICE` key goes missing, and the warning ends with `undefined`. Without `specsFolders`, it fails at `:988`. Without `exclude`, at `:964` and `:988`. `tsc` does not catch it, because `ADVICE` is `Record<string, string>`.
- **D1, `src/ui/dashboard.ts:163`.** The side bar does not receive the state on `store.onDidChange`. The EXC-02/03/08 case already fails at `:909`: the files from `:900-903` reach the store, and the side bar keeps the previous list. Also SIDE-05 and SIDE-10 (`:823`).
- **D2, `src/ui/dashboard.ts:162`.** The editor tab does not receive the state. The editor tab opens fresh at `:907` and receives the state on `ready`, so `:908` passes and `:914` fails. Also SF-03 (`:454`) and SIDE-10 (`:822`).
- **H10, `src/ui/store.ts:121`.** The store that never forgets (`this.warned = new Set([...this.warned, ...warned])`). In iteration 2 it survived by construction. Now it is killed at `:987`: SF-09 (`:531`) and EXC-07 (`:961`) already warned about `../outside` in both settings, and without forgetting, neither warning comes back in EXC-10. The kill depends on case order. Not counted in the score.
- **C1 to C14, H1 to H6, H8, H9, K3 to K6, K8 to K10.** Carried over. In this round the code changed only at `src/ui/store.ts:119` (the text) and `:130-134` (`ADVICE`), and no test lost strength. H8 and H9 are still covered by SF-09 (`:537`), EXC-07 (`:969`), and EXC-10 (`:996`).

### Iteration 2 (HEAD 96161f2), history

Lines as of 96161f2.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| K1 | `src/core/folders.ts:60` | Warning key without the setting name | ✅ Killed |
| K2 | `src/core/folders.ts:64` | `warned` never forgets | ✅ Killed |
| K3 | `src/core/folders.ts:41` | `parseExclude` without the comma check | ✅ Killed |
| K4 | `src/core/folders.ts:61` | Previous warnings ignored | ✅ Killed |
| K5 | `src/core/folders.ts:61` | A repeat in the same call warned twice | ✅ Killed |
| K6 | `src/core/folders.ts:64` | `warned` always empty | ✅ Killed |
| K7 | `src/core/folders.ts:67` | The `accepts` pattern rejects commas | ❌ Survived. Killed in iteration 3 |
| K8 | `src/core/folders.ts:41` | Comma rejected only at the start | ✅ Killed |
| K9 | `src/core/folders.ts:71` | `accepts` never consulted | ✅ Killed |
| K10 | `src/core/folders.ts:62` | An already warned entry leaves the next state | ✅ Killed |
| H7 | `src/ui/store.ts:102` | `specsFolders` entries warned with the name `tlcSpecs.exclude` | ❌ Survived. Killed in iteration 3 |
| H8 | `src/ui/store.ts:121` | `warn` discards the `warned` from `pendingWarnings` | ✅ Killed |
| H9 | `src/ui/store.ts:118` | `warn` warns about every `invalid` entry and ignores `show` | ✅ Killed |

### Iteration 1 (HEAD 8794d3a), history

Lines as of 8794d3a.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| C1 | `src/core/folders.ts:41` | Glob without the `**/` prefix | ✅ Killed |
| C2 | `src/core/folders.ts:41` | Glob without the `/**` suffix | ✅ Killed |
| C3 | `src/core/folders.ts:42` | Multiple entries joined without braces | ✅ Killed |
| C4 | `src/core/folders.ts:59` | An entry with a glob is no longer rejected | ✅ Killed |
| C5 | `src/core/folders.ts:61` | An entry with `..` is no longer rejected | ✅ Killed |
| C6 | `src/core/folders.ts:59` | An absolute entry is no longer rejected | ✅ Killed |
| C7 | `src/core/folders.ts:39` | String treated as a folder name | ✅ Killed |
| C8 | `src/core/folders.ts:42` | Empty list returns the default glob | ✅ Killed |
| C9 | `src/core/folders.ts:51` | Repeated entries are not deduplicated | ✅ Killed |
| C10 | `src/core/folders.ts:39` | Empty string returns `''` instead of `null` | ✅ Killed |
| C11 | `src/core/folders.ts:42` | Only the first of two entries applies | ✅ Killed |
| C12 | `src/core/folders.ts:42` | Invalid entries disappear from the report | ✅ Killed |
| C13 | `src/core/folders.ts:50` | Invalid entry reported normalized | ✅ Killed |
| C14 | `src/core/folders.ts:51` | The `.specs` fallback leaks into the exclusion | ✅ Killed |
| H1 | `src/ui/store.ts:153` | The exclusion glob never reaches `findFiles` | ✅ Killed |
| H2 | `src/ui/store.ts:139` | `tlcSpecs.exclude` read without the workspace folder | ✅ Killed |
| H3 | `src/ui/store.ts:103` | `exclude` entry warned with the name `tlcSpecs.specsFolders` | ✅ Killed |
| H4 | `src/ui/store.ts:36` | A change to `tlcSpecs.exclude` does not reload | ✅ Killed |
| H5 | `src/ui/store.ts:152` | The last folder's list applies to all of them | ✅ Killed |
| H6 | `src/ui/store.ts:119` | Warning key without the setting name | ❌ Survived. Became K1, killed in iteration 2 |

**Sensor depth**: iteration 3 with 3 core and 3 host mutations, focused on this round's code and tests. 6 judged by reading. Iterations 1 and 2 carried over
**Result**: iteration 3 with 6/6 killed - PASS ✅

**Isolation**: the real tree's `git status --porcelain` was empty before the sensor (82679f4) and empty after. HEAD stayed at 82679f4 from start to finish, and nothing changed under the verification. Junction removed without recursion (`[System.IO.Directory]::Delete(..., $false)`). `git worktree remove --force` + `git worktree prune`. `git worktree list` shows only the real tree, branch `feat/exclude-folders`. The real `node_modules` had 131 entries before and after, `npm ls --depth=0` exit 0. No test VS Code instance was left running.

---

## Interactive UAT Results (if performed)

Not run. The Verifier runs without a user. The spec's independent test (`["node_modules", "test"]` in this repository) is left to the orchestrator.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `ADVICE` has two entries and one use. `warn` kept its shape |
| Surgical changes | ✅ The round changes the warning text (`src/ui/store.ts`, +7 -1), the manifest description, and the tests |
| No scope creep | ✅ The Dashboard in EXC-03, EXC-10, and the per-setting text entered the spec (5b0ce63) before the code and the tests |
| Matches patterns | ✅ EXC-10 follows the EXC-07 template. The Dashboard checks use `tabReport`, `sideReport`, and `same`, like SIDE-10 |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core 1:1 with the criteria. On the host, both setting names and both texts are checked in full, and the Dashboard on both surfaces |
| Every test maps to a spec requirement - no unclaimed tests | ✅ The new unit test (`test/unit/folders.test.ts:113-115`) maps to the comma decision row (`spec.md:36`) |
| Documented guidelines followed: none - strong defaults applied | ✅ |

**Test integrity (96161f2..82679f4)**:

- `test/integration/suite.cjs`: 35 insertions, 1 deletion (the title of the EXC-02/03/08 case). The case gained the Dashboard checks. EXC-10 is new. No assertion was removed or loosened.
- `test/unit/folders.test.ts`: 4 insertions, 1 new test. 46 to 47.
- `test/integration/multiroot.cjs`: unchanged.

Non-blocking observations:

- The exclude-folders cases depend on the state the previous case leaves behind. The EXC-02/03/08 case (`suite.cjs:897-929`) changes `tlcSpecs.exclude` without `try/finally`, and a failure there brings down the five cases that follow (W1). EXC-10 depends on the refresh that closes EXC-07 (`:974`) to forget `../outside` (A1). No kill is lost because of this, but diagnosing a failure gets noisy. See Follow-up 1.
- `ADVICE` is `Record<string, string>` (`src/ui/store.ts:131`). A setting with no entry becomes `undefined` in the warning, and only integration catches it (A3).

---

## Edge Cases

- [x] EXC-06 An empty list lists everything, including `node_modules`: `test/integration/suite.cjs:949-950`
- [x] EXC-07 An invalid entry is ignored, with a warning that gives its name and the setting's name: `test/integration/suite.cjs:961-969`, `test/unit/folders.test.ts:102-128`
- [x] EXC-08 `tests` stays in the listing with the entry `test`: `test/integration/suite.cjs:912-914`, `:925`
- [x] EXC-09 A folder both included and excluded stays out: `test/integration/suite.cjs:935-936`
- [x] EXC-10 The same invalid entry in both settings, one warning for each, with the setting's name: `test/integration/suite.cjs:985-996`, `test/unit/folders.test.ts:119-120`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0
- **Unit**: 47 passed, 0 failed, 0 skipped (exit 0)
- **Integration**: 53/53 in `suite.cjs`, 1/1 in `startup.cjs`, 2/2 in `multiroot.cjs` (exit 0)
- **Test count before feature**: 39 unit + 48 integration (46 + 1 + 1, counted at 4df4e6a)
- **Test count after feature**: 47 unit + 56 integration (53 + 1 + 2)
- **Delta**: +8 unit, +7 cases in `suite.cjs`, +1 case in `multiroot.cjs`. In iteration 3: +1 unit and +1 case (EXC-10)
- **Skipped tests**: none
- **Failures**: none

The orchestrator's numbers match my run.

---

## Fix Plans (if issues found)

No fix is blocking.

### Follow-up 1 (non-blocking): isolate the exclude-folders cases

- **Root cause**: the EXC-02/03/08 case restores `tlcSpecs.exclude` outside a `finally` (`test/integration/suite.cjs:927`). EXC-07 and EXC-10 wait for the default listing after the `finally` (`:974`, `:1002`), so a failure skips the wait, and the refresh that forgets the warnings may not run before the next case.
- **Fix task**: wrap `:911-925` in a `try/finally` that calls `setExclude(undefined)` and waits for the default listing. In EXC-07 and EXC-10, move the `waitForRoots` into the `finally`.
- **Done when**: with W1, only SIDE-11, SIDE-10, and EXC-02/03/08 fail. With A1, only EXC-07 (`:964`) and EXC-10 on the text (`:988`) fail.
- **Priority**: Minor

---

## Requirement Traceability Update

The Verifier does not change `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| EXC-01 | Verified | ✅ Verified |
| EXC-02 | Verified | ✅ Verified |
| EXC-03 | Implementing | ✅ Verified |
| EXC-04 | Verified | ✅ Verified |
| EXC-05 | Verified | ✅ Verified |
| EXC-06 | Verified | ✅ Verified |
| EXC-07 | Needs Fix | ✅ Verified |
| EXC-08 | Verified | ✅ Verified |
| EXC-09 | Verified | ✅ Verified |
| EXC-10 | Implementing | ✅ Verified |

The coverage line (`spec.md:91`) becomes "10 total, 10 verified".

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 10/10 requirements match the spec. 0 precision gaps
**Sensor**: iteration 3 with 6/6 killed, including H7 and K7, which were alive in iteration 2. 6 mutations judged by reading, all killed
**Gate**: typecheck ok, 47 unit, 53 + 1 + 2 integration, 0 failures

**What works**: `tlcSpecs.exclude` as a list, with the default `["node_modules"]` and `resource` scope. A listed folder leaves the listing at any depth. A setting change updates projects, trees, the Dashboard in the editor tab and in the side bar, and diagnostics. A string still works as a glob. Each multi-root folder uses its own list. An empty list excludes nothing. An absolute entry, or one with `..`, a comma, or a glob, is ignored, with a warning that gives its name and `tlcSpecs.exclude`. The same entry in both settings produces one warning for each, with the setting's name and its own guidance. `tlcSpecs.specsFolders` still accepts commas. `tests` stays with the entry `test`. Exclusion wins over inclusion.

**Issues found**: none blocking. The exclude-folders cases depend on the previous case's state (Follow-up 1).

**Next steps**: mark EXC-01..EXC-10 as Verified and update the coverage at `spec.md:91`. Run the spec's independent test. Follow-up 1 can land after delivery.
