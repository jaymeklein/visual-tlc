# Specs Folders Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (Medium scope, no `design.md`)
**Status**: Done

Inline design: `src/core/folders.ts` holds the pure logic (normalize entries, find roots, label). `src/ui/store.ts` reads the setting per workspace folder, searches for files, recreates the watchers, and shows the warnings.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core`) | unit | All branches; 1:1 with the ACs; one test per listed edge case | `test/unit/*.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `package.json` contributes) | integration | Each AC checked against the visible result (projects, tree, diagnostics, warning) | `test/integration/*.cjs` | `npm run test:integration` |
| Docs (`README.md`) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run typecheck && npm test` |
| Full | After tasks with integration tests | `npm run typecheck && npm test && npm run test:integration` |
| Build | After phase completion or docs-only tasks | `npm run typecheck && npm test && npm run test:integration` |

---

## Execution Plan

### Phase 1: Core

```
T1 → T2 → T3
```

### Phase 2: Extension host

```
T3 → T4 → T5 → T6 → T7
```

### Phase 3: Docs

```
T7 → T8
```

### Phase 4: Verifier fixes (iteration 1)

```
T8 → T9 → T10 → T11
```

### Phase 5: Verifier fixes (iteration 2)

```
T11 → T12 → T13
```

---

## Task Breakdown

### T1: Normalize and validate the entries

**What**: `parseSpecsFolders(raw)` returns the valid entries, normalized, and the invalid ones
**Where**: `src/core/folders.ts`
**Depends on**: None
**Reuses**: style of the `src/core` modules
**Requirement**: SF-08, SF-09, SF-10, SF-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] An empty or missing list returns `['.specs']`
- [x] An absolute entry, or one with `..` or a glob, goes to `invalid` and stays out of `entries`
- [x] `docs\specs` and `docs/specs/` become `docs/specs`
- [x] Entries that repeat after normalization appear once
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 25 existing + new pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): parse the configured specs folders`

---

### T2: Find the specs roots

**What**: `findSpecsRoots(files, entries)` returns the specs folders among the files of a workspace folder
**Where**: `src/core/folders.ts` (modify)
**Depends on**: T1
**Reuses**: discovery rule from `src/ui/store.ts`
**Requirement**: SF-02, SF-05, SF-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Finds the entry at the root and in subfolders
- [x] A folder not named `.specs` with no skill artifact is left out
- [x] A `.specs` folder appears with any file
- [x] A folder reached by two entries appears once
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: no test removed

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): find specs roots among workspace files`

---

### T3: Label the roots

**What**: `rootLabel(root, all, folderName)` returns the group label, with the folder path when the project has more than one
**Where**: `src/core/folders.ts` (modify)
**Depends on**: T2
**Reuses**: `labelFor` format in `src/ui/store.ts`
**Requirement**: SF-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A project with one folder keeps the current label (`api`, `ws/packages/api`)
- [x] A project with two folders labels each group `project · path`
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: no test removed

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): label specs roots by project and folder`

---

### T4: Discover and watch the configured folders

**What**: the store reads `tlcSpecs.specsFolders` per workspace folder, discovers the roots, and recreates the watchers when the setting changes
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T3
**Reuses**: `parseSpecsFolders`, `findSpecsRoots`
**Requirement**: SF-01, SF-02, SF-03, SF-04, SF-05, SF-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `package.json` declares `tlcSpecs.specsFolders` with default `[".specs"]` and `resource` scope
- [x] With `["docs/specs"]`, the features in `docs/specs` appear in projects, tree, and diagnostics without reloading the window
- [x] A new file inside `docs/specs` updates the view
- [x] A `docs/specs` folder with no artifact does not become a project
- [x] Two entries for the same folder produce one project
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 24 existing integration tests + new pass

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): discover and watch the configured specs folders`

---

### T5: Warn about invalid entries

**What**: the store shows a warning that names each invalid entry, once per entry
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T4
**Reuses**: `parseSpecsFolders`
**Requirement**: SF-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Entry `../outside` produces a warning with the text `../outside` and does not become a project
- [x] The valid entries in the same list keep working
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(store): warn about invalid specs folder entries`

---

### T6: Label the groups in the tree

**What**: the store uses `rootLabel` for each project's label
**Where**: `src/ui/store.ts` (modify)
**Depends on**: T5
**Reuses**: `rootLabel`
**Requirement**: SF-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With `[".specs", "docs/specs"]` the Features tree shows two groups, `ws · .specs` and `ws · docs/specs`
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): label groups by project and specs folder`

---

### T7: Activate on startup

**What**: the extension activates with `onStartupFinished`, verified in a workspace that only has `docs/specs`
**Where**: `package.json` (modify)
**Depends on**: T6
**Reuses**: `test/integration/run.mjs`
**Requirement**: SF-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] In a workspace with no `.specs` and with `tlcSpecs.specsFolders = ["docs/specs"]`, the extension is active without a call to `activate()` and lists the features
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(extension): activate on startup for custom specs folders`

---

### T8: Document the setting

**What**: README and welcome texts describe `tlcSpecs.specsFolders`
**Where**: `README.md` (modify)
**Depends on**: T7
**Reuses**: existing settings table
**Requirement**: SF-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The settings table lists `tlcSpecs.specsFolders` with its default and the entry rules
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the specs folders setting`

---

### T9: Prove the per-workspace-folder setting

**What**: integration suite in a multi-root workspace where each folder has its own list
**Where**: `test/integration/multiroot.cjs`
**Depends on**: T8
**Reuses**: `test/integration/startup.cjs`, `test/integration/run.mjs`
**Requirement**: SF-01, SF-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Folder `a` with `["docs/specs"]` shows only `a/docs/specs`; folder `b` with no setting shows only `b/.specs`
- [x] The SF-01 test checks the setting's `resource` scope
- [x] Verifier mutants H7 and H12 die
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `test(store): cover per-folder specs folders in a multi-root workspace`

---

### T10: Prove dashboard and status bar in SF-03

**What**: the test API exposes the status bar text and the projects of the last state sent to the dashboard
**Where**: `src/extension.ts` (modify)
**Depends on**: T9
**Reuses**: `dashboardHealth` in `src/extension.ts`
**Requirement**: SF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] After the setting change, the status bar names a feature from `docs/specs`
- [x] After the setting change, the last state sent to the dashboard has the same projects as `getProjects()`
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover panel and status bar on configuration change`

---

### T11: Prove file change and deletion in SF-04

**What**: the SF-04 test covers a file created, changed, and deleted in a configured folder
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T10
**Reuses**: existing `SF-04` test
**Requirement**: SF-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The spec names the three events in SF-04
- [x] Changing `spec.md` in `docs/specs` changes the feature's warnings
- [x] Deleting the feature folder in `docs/specs` removes the feature from the view
- [x] Verifier mutant H16 dies
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `test(store): cover file change and removal in configured folders`

---

### T12: Prove the dashboard by what it rendered

**What**: the webview confirms the projects it rendered, and the dashboard's test read now comes from that confirmation
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T11
**Reuses**: message protocol in `src/core/protocol.ts`
**Requirement**: SF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] After the setting change, the projects confirmed by the webview are those of `getProjects()`
- [x] With no dashboard open, the test read returns `undefined`
- [x] Verifier mutants N2, N6, and N8 die; P2 and N1 stay dead
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): confirm the projects the panel rendered`

---

### T13: Prove the status bar with no projects

**What**: the SF-03 test covers a setting that finds no folder
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T12
**Reuses**: existing `SF-03` test
**Requirement**: SF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With an entry that finds nothing, there are no projects, the status bar disappears, and the dashboard renders zero projects
- [x] Verifier mutant N4 dies
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no test removed

**Tests**: integration
**Gate**: full

**Commit**: `test(statusbar): cover a configuration that finds no specs folder`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ------→ T2 ------→ T3
Phase 2:  T4 ------→ T5 ------→ T6 ------→ T7
Phase 3:  T8
Phase 4:  T9 ------→ T10 ------→ T11
Phase 5:  T12 ------→ T13
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Normalize and validate the entries | 1 function | ✅ Granular |
| T2: Find the specs roots | 1 function | ✅ Granular |
| T3: Label the roots | 1 function | ✅ Granular |
| T4: Discover and watch the configured folders | 1 class (store) + settings contribution | ✅ Cohesive |
| T5: Warn about invalid entries | 1 behavior in the store | ✅ Granular |
| T6: Label the groups in the tree | 1 call in the store | ✅ Granular |
| T7: Activate on startup | 1 activation event | ✅ Granular |
| T8: Document the setting | 1 file | ✅ Granular |
| T9: Prove the per-workspace-folder setting | 1 suite + fixture | ✅ Granular |
| T10: Prove dashboard and status bar in SF-03 | 2 test reads in the API | ✅ Cohesive |
| T11: Prove file change and deletion in SF-04 | 1 test | ✅ Granular |
| T12: Prove the dashboard by what it rendered | 1 webview message | ✅ Granular |
| T13: Prove the status bar with no projects | 1 test | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 | ✅ Match |
| T3 | T2 | T2 | ✅ Match |
| T4 | T3 | T3 | ✅ Match |
| T5 | T4 | T4 | ✅ Match |
| T6 | T5 | T5 | ✅ Match |
| T7 | T6 | T6 | ✅ Match |
| T8 | T7 | T7 | ✅ Match |
| T9 | T8 | T8 | ✅ Match |
| T10 | T9 | T9 | ✅ Match |
| T11 | T10 | T10 | ✅ Match |
| T12 | T11 | T11 | ✅ Match |
| T13 | T12 | T12 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Core | unit | unit | ✅ OK |
| T3 | Core | unit | unit | ✅ OK |
| T4 | Extension host | integration | integration | ✅ OK |
| T5 | Extension host | integration | integration | ✅ OK |
| T6 | Extension host | integration | integration | ✅ OK |
| T7 | Extension host | integration | integration | ✅ OK |
| T8 | Docs | none | none | ✅ OK |
| T9 | Extension host | integration | integration | ✅ OK |
| T10 | Extension host | integration | integration | ✅ OK |
| T11 | Extension host | integration | integration | ✅ OK |
| T12 | Extension host | integration | integration | ✅ OK |
| T13 | Extension host | integration | integration | ✅ OK |
