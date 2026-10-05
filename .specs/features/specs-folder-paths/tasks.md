# Specs Folder Paths Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (no `design.md`)
**Status**: Done

Inline design: `src/core/folders.ts` stays pure. `findSpecsRoots` now accepts only files that start at the entry path, and `rootLabel` labels by the workspace folder and, when that folder has more than one specs folder, by the entry path. `parseExclude` is removed. `src/ui/store.ts` searches and watches `<entry>/**` from the root of each workspace folder, with no exclusion. The Features and Project trees no longer skip the node when there is a single project.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Style of `test/unit/folders.test.ts` and `test/integration/*.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core/folders.ts`) | unit | All branches; 1:1 with the ACs; one test per listed edge case | `test/unit/folders.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `package.json` contributes) | integration | Each AC on the visible result: projects, tree children, dashboard, status bar, diagnostics, warning | `test/integration/*.cjs` | `npm run test:integration` |
| Docs (`README.md`, specs) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. Integration runs on a hidden Windows desktop.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run typecheck && npm test` |
| Full | After tasks with integration tests | `npm run typecheck && npm test && npm run test:integration` |
| Build | After phase completion or docs-only tasks | `npm run typecheck && npm test && npm run test:integration` |

---

## Execution Plan

### Phase 1: Core

```
T1
```

### Phase 2: Extension host

```
T1 → T2 → T3
```

### Phase 3: Docs

```
T3 → T4
```

### Phase 4: Verifier fixes (iteration 1)

```
T4 → T5 → T6
```

---

## Task Breakdown

### T1: Find the folders by exact path

**What**: `findSpecsRoots` accepts only files that start at the entry path. `rootLabel` uses the workspace folder name, with " · entry" when that folder has more than one specs folder. `parseExclude` and the `Exclude` type are removed
**Where**: `src/core/folders.ts`
**Depends on**: None
**Reuses**: `parseSpecsFolders`, `pendingWarnings`, the artifact rule (SF-05)
**Requirement**: SFP-01, SFP-02, SFP-09, SFP-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `.specs` finds `.specs/...` and does not find `test/fixtures/sample/.specs/...` (SFP-01)
- [x] `packages/api/.specs` finds the folder at that path and does not find `x/packages/api/.specs` (SFP-02)
- [x] Label: workspace folder name with one specs folder; "name · entry" with two (SFP-09)
- [x] Invalid entries are still rejected and quoted (SFP-11)
- [x] `parseExclude` and its tests stay until T2, which removes them along with the store changes
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): find each specs folder at its exact path`

---

### T2: Read only the configured folders and remove exclude

**What**: The search and the watchers use `<entry>/**` from the root of each workspace folder, with no exclusion. `tlcSpecs.exclude` is removed from `package.json`, the store and the warnings. The welcome screen says the path starts at the root
**Where**: `src/ui/store.ts`, `package.json`
**Depends on**: T1
**Reuses**: `discoverSpecsRoots`, `watch`, `warn`
**Requirement**: SFP-01, SFP-02, SFP-03, SFP-04, SFP-05, SFP-06, SFP-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With the default, the only project is `.specs`, even with `.specs` folders created in subfolders (SFP-01)
- [x] Listing `packages/api/docs/specs` reads only that folder (SFP-02)
- [x] A spec in an unconfigured folder stays out of the trees, the dashboard in the editor tab and in the side bar, the status bar and the Problems panel (SFP-03)
- [x] `package.json` does not declare `tlcSpecs.exclude`, and a value for it in the settings does not change the listing (SFP-04)
- [x] Entry that does not exist: no project and no warning. When the folder is created, it shows up without reloading the window (SFP-05, SFP-06)
- [x] `parseExclude` and the EXC tests are removed with the setting. The `pendingWarnings` test now uses only `tlcSpecs.specsFolders`. The depth-search SF tests are rewritten for the exact path. `multiroot.cjs` and fixture `b` now use only `specsFolders`
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): read only the configured specs folders`

---

### T3: Folder node with a single project

**What**: The Features and Project trees show the folder node even when there is a single specs folder
**Where**: `src/ui/featuresTree.ts`, `src/ui/projectTree.ts`
**Depends on**: T2
**Reuses**: the `root` node of both trees
**Requirement**: SFP-07, SFP-08, SFP-09, SFP-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Features with one folder: a `root` node with the workspace folder name and the specs inside (SFP-07)
- [x] Project with one folder: a `root` node with Handoff, decisions and lessons inside (SFP-08)
- [x] Two specs folders in the same workspace folder: "name · entry" in both trees (SFP-09)
- [x] All specs hidden: the node stays, with no children, and the message counts the hidden ones (SFP-10)
- [x] The tests that read the specs at the top of the tree now read them inside the folder node
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): show the specs folder node with a single project`

---

### T4: Document the exact path

**What**: The README describes `tlcSpecs.specsFolders` as an exact path and removes the `tlcSpecs.exclude` section. The specs-folders, exclude-folders and hidden-specs specs get notes on what changed
**Where**: `README.md`
**Depends on**: T3
**Reuses**: the README's "Specs folders" section
**Requirement**: SFP-01, SFP-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README without `tlcSpecs.exclude`, with exact-path examples
- [x] Notes in SF-02 and SF-07 (specs-folders), at the top of exclude-folders and in HID-16 (hidden-specs)
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the specs folders as exact paths`

---

### T5: Fix 1 - SFP-06 proves the watcher

**What**: The SFP-05/06 test waits for the reloads scheduled by the setting change to finish before creating the folder, so that only the watcher can show it
**Where**: `test/integration/suite.cjs`
**Depends on**: T4
**Reuses**: `waitFor`, `api.featuresTree.onDidChangeTreeData`
**Requirement**: SFP-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Before creating `later/.specs`, the test waits for the tree to stay idle for longer than the 300 ms debounce (kills HW)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`, in a worktree at 1cec99c with only this change. In the real tree, the tree's HID-11/HID-12 fails because of eye-on-every-spec's T1 (abcd78b), and that feature's T3 rewrites the test
- [x] Test count: 62 unit, 61 + 1 + 1 integration tests pass

**Tests**: integration
**Gate**: full

**Commit**: `test(store): prove that the watcher shows a specs folder created later`

---

### T6: Fix 2 - the start-of-path rule on its own

**What**: The SFP-01 and SFP-02 tests assert, with no positive case beside them, that `.specs` in a subfolder, the path inside a subfolder and `.specs-old` are not specs folders
**Where**: `test/unit/folders.test.ts`
**Depends on**: T5
**Reuses**: `findSpecsRoots`
**Requirement**: SFP-01, SFP-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Only files in subfolders: `findSpecsRoots` returns `[]` for `.specs` and for `packages/api/.specs` (kills U1)
- [x] `.specs-old/STATE.md` does not count as `.specs` (kills U2)
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 68 unit tests pass (62 from SFP + 6 from eye-on-every-spec, already committed; new assertions in existing tests)

**Tests**: unit
**Gate**: quick

**Commit**: `test(core): check the start-of-path rule without a matching folder beside it`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 ------→ T3
Phase 3:  T4
Phase 4:  T5 ------→ T6
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: exact path | 1 module | ✅ Granular |
| T2: store and manifest | store and `package.json` | ⚠️ Cohesive: the setting removed from the manifest and the store is tested as one |
| T3: folder node | two trees, the same rule | ⚠️ Cohesive: one rule in both trees |
| T4: docs | README and notes | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Extension host | integration | integration | ✅ OK |
| T3 | Extension host | integration | integration | ✅ OK |
| T4 | Docs | none | none | ✅ OK |
| T5 | Extension host (test) | integration | integration | ✅ OK |
| T6 | Core (test) | unit | unit | ✅ OK |
