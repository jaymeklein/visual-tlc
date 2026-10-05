# Sidebar Dashboard Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (no `design.md`)
**Status**: Done

Inline design:

- The dashboard now has two surfaces with the same HTML, script, and CSS: the editor tab (`WebviewPanel`, already exists) and the side bar view (`WebviewView`, new, id `tlcSpecs.panel`). `src/ui/dashboard.ts` handles both; each surface has its own webview, its own pending selection, and its own last report.
- The narrow layout is CSS only (`@media (max-width: 699px)`), so it applies to any narrow surface.
- After each `render()`, the webview reads the DOM and sends a report (`rendered`): projects, cards, feature in detail, board columns, visible empty stages, width, and horizontal scrolling. The integration tests read this report through the extension API. Lesson L-002: the criterion is checked against what the screen shows, not against an intermediate message.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Renderer (`src/webview/render.ts`) | unit | Every new branch; 1:1 with the ACs | `test/unit/*.test.ts` | `npm test` |
| Webview script, host, and manifest (`src/webview/main.ts`, `src/ui`, `src/extension.ts`, `package.json`, `media/*.css`) | integration | Each AC verified against what the webview rendered (report read from the DOM) and against the editor tabs | `test/integration/*.cjs` | `npm run test:integration` |
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

### Phase 1: Webview

```
T1 → T2
```

### Phase 2: Side bar view

```
T2 → T3 → T4 → T5 → T6 → T7
```

### Phase 3: Docs

```
T7 → T8
```

### Phase 4: Verifier fixes (iteration 1)

```
T8 → T9 → T10 → T11 → T12 → T13 → T14 → T15
```

### Phase 5: Verifier fixes (iteration 2)

```
T15 → T16 → T17
```

---

## Task Breakdown

### T1: Mark the empty board stages

**What**: the renderer marks the board columns that have no features with `is-empty`
**Where**: `src/webview/render.ts` (modify)
**Depends on**: None
**Reuses**: helpers from `test/unit/webview.test.ts`
**Requirement**: SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A column without features has the `is-empty` class; a column with features does not
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 37 existing + new pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): mark the board stages without features`

---

### T2: Report what the webview rendered

**What**: after each `render()`, the webview sends a report read from the DOM, exposed in the test API
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T1
**Reuses**: `rendered` message from `src/core/protocol.ts`
**Requirement**: SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The report includes projects, cards, feature in detail, board columns, visible empty stages, width, and horizontal scrolling
- [x] With the editor-tab dashboard at 700px or more, the report shows 6 columns and the empty stages visible
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 36 existing integration + new pass

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): report what the webview rendered`

---

### T3: Create the Dashboard view in the side bar

**What**: webview view `tlcSpecs.panel` in the TLC Specs container, served by `Dashboard`
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T2
**Reuses**: HTML, script, and message handling from the editor-tab dashboard
**Requirement**: SIDE-01, SIDE-05, SIDE-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `package.json` declares the "Dashboard" view (`tlcSpecs.panel`, webview type) in the `tlcSpecs` container, after Project
- [x] The view renders the same projects as `getProjects()`
- [x] A new feature written to a specs folder appears in the view's cards
- [x] Without a specs folder, the view shows "No specs found"
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): add the panel view to the side bar`

---

### T4: Open the feature in the side bar view

**What**: `tlcSpecs.showFeature` shows the Dashboard view on the feature; `tlcSpecs.openDashboard` becomes "Open Dashboard in Editor Tab" and accepts a feature
**Where**: `src/extension.ts` (modify)
**Depends on**: T3
**Reuses**: `toRef` in `src/extension.ts`
**Requirement**: SIDE-02, SIDE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With a file open, `tlcSpecs.showFeature` shows the feature's details in the side bar view; the tabs and the active editor do not change
- [x] `tlcSpecs.openDashboard` opens the "TLC Specs" tab
- [x] The existing test "opens the dashboard webview" now opens the tab through `tlcSpecs.openDashboard`, with the same assertions
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): open features in the side bar panel`

---

### T5: Narrow layout

**What**: below 700px the board is a single column, empty stages disappear, and nothing scrolls horizontally
**Where**: `media/dashboard.css` (modify)
**Depends on**: T4
**Reuses**: existing media queries in `media/dashboard.css`
**Requirement**: SIDE-03, SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] In the side bar view (under 700px) the report shows 1 column, 0 visible empty stages, and no horizontal scrolling, on the board and on the feature details
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): fit the panel in narrow widths`

---

### T6: Come back from the hidden view and update both surfaces

**What**: the hidden view clears the report; when it comes back it shows the current projects and the selected feature; tab and view update together
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T5
**Reuses**: `vscode.setState` in `src/webview/main.ts`
**Requirement**: SIDE-06, SIDE-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] After closing the side bar, changing the specs folders, and reopening the view, the report has the new projects and the same feature in detail
- [x] With the tab and the view open, a change in the specs folders reaches the reports of both
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): restore the side panel when it becomes visible`

---

### T7: Clicks inside the side bar view

**What**: the test API delivers a message to the side bar view's handler
**Where**: `src/extension.ts` (modify)
**Depends on**: T6
**Reuses**: `dashboardMessage` in `src/extension.ts`
**Requirement**: SIDE-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A `previewFile` message from the side bar view opens the markdown preview
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover artifact clicks from the side panel`

---

### T8: Document the side bar dashboard

**What**: README describes the Dashboard view and the "Open Dashboard in Editor Tab" command
**Where**: `README.md` (modify)
**Depends on**: T7
**Reuses**: "What you get" section
**Requirement**: SIDE-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README describes where the dashboard opens and how to open the editor-tab view
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the side bar panel`

---

### T9: Report only the visible cards

**What**: the webview report counts only the cards that are on screen
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T8
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-03, SIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A card inside a hidden phase is left out of the report
- [x] Verifier mutant S4 dies (narrow layout that hides every phase)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `fix(dashboard): report only the cards on screen`

---

### T10: Prove the notification button

**What**: test for the "Open Dashboard" button on the new-spec notification
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T9
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The notification button shows the feature in the side bar view and does not open the tab
- [x] Verifier mutant C2 dies
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the notification button`

---

### T11: Pin the 700px threshold

**What**: a unit test reads the CSS and checks the `@media (max-width: 699px)` block; SIDE-09 measures the tab with the side bar open
**Where**: `test/unit/webview.test.ts` (modify)
**Depends on**: T10
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-03, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The 699px block contains the single-column rule and the rule that hides empty phases
- [x] The tab with the side bar open (700px or more) shows 6 columns
- [x] Verifier mutants S5 and S6 die
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): pin the narrow layout threshold`

---

### T12: Prove the feature opened in the tab and the measured scrolling

**What**: tests check the rendered detail when the tab opens on a feature, and the horizontal scrolling of the wide board
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T11
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-08, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tlcSpecs.openDashboard` with a feature shows its details, in a new tab and in a tab that is already open
- [x] The 6-column board in a tab narrower than 1298px reports horizontal scrolling
- [x] Verifier mutants C3 and W2 die
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the tab target and the overflow reading`

---

### T13: Prove the manifest entries

**What**: tests check the "open in editor tab" button in the Dashboard view title and the title of `tlcSpecs.showFeature`
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T12
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-02, SIDE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The `view/title` entry for `tlcSpecs.openDashboard` applies to `tlcSpecs.panel`
- [x] `tlcSpecs.showFeature` is titled "Open Feature in Dashboard"
- [x] Verifier mutants P3 and P4 die
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover the manifest entries of the panel`

---

### T14: Prove the click with the side bar closed

**What**: a test runs `tlcSpecs.showFeature` with the side bar closed; the comment on the `live` guard states what was verified
**Where**: `src/ui/dashboard.ts` (modify)
**Depends on**: T13
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With the side bar closed, the click reopens the view on the feature's details, without touching the tabs
- [x] The `live` comment records that VS Code 1.120 delivers the message without the guard and that earlier versions were not verified
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover a feature opened with the side bar closed`

---

### T15: Name the SIDE-05 events

**What**: the spec names create, change, and remove; the report includes each card's phase; the test covers all three events
**Where**: `src/webview/main.ts` (modify)
**Depends on**: T14
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Artifact created: the card appears with the model's phase
- [x] Artifact changed: the card's phase changes
- [x] Artifact removed: the card disappears
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): cover artifact change and removal in the side panel`

---

### T16: Fit down to 250px

**What**: in the narrow layout the section titles wrap; the test narrows the side bar step by step down to 250px
**Where**: `media/dashboard.css` (modify)
**Depends on**: T15
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The board stays in one column with no horizontal scrolling at every measured width, from the default down to 250px or less
- [x] The feature details do not scroll horizontally at the smallest measured width
- [x] The side bar goes back to its initial width at the end of the test
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `fix(dashboard): keep the narrow panel from scrolling down to 250px`

---

### T17: Harden the new tests

**What**: the tests use the real scrolling threshold (1298px), wait for the right detail, and check the phase of every card
**Where**: `test/integration/suite.cjs` (modify)
**Depends on**: T16
**Reuses**: tests in the sidebar-dashboard section
**Requirement**: SIDE-02, SIDE-05, SIDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Scrolling on the wide board is expected below 1298px
- [x] The closed-side-bar test waits for the requested feature's detail
- [x] SIDE-05 compares each card's phase with the model
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: no tests removed

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): harden the side panel tests`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ------→ T2
Phase 2:  T3 ------→ T4 ------→ T5 ------→ T6 ------→ T7
Phase 3:  T8
Phase 4:  T9 ------→ T10 ------→ T11 ------→ T12 ------→ T13 ------→ T14 ------→ T15
Phase 5:  T16 ------→ T17
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Mark the empty board stages | 1 class in the renderer | ✅ Granular |
| T2: Report what the webview rendered | 1 message | ✅ Granular |
| T3: Create the Dashboard view in the side bar | 1 view + manifest contribution | ✅ Cohesive |
| T4: Open the feature in the side bar view | 2 commands | ✅ Cohesive |
| T5: Narrow layout | 1 CSS block | ✅ Granular |
| T6: Come back from the hidden view and update both surfaces | 1 visibility event | ✅ Granular |
| T7: Clicks inside the side bar view | 1 test read | ✅ Granular |
| T8: Document the side bar dashboard | 1 file | ✅ Granular |
| T9: Report only the visible cards | 1 test or read | ✅ Granular |
| T10: Prove the notification button | 1 test or read | ✅ Granular |
| T11: Pin the 700px threshold | 1 test or read | ✅ Granular |
| T12: Prove the feature opened in the tab and the measured scrolling | 1 test or read | ✅ Granular |
| T13: Prove the manifest entries | 1 test or read | ✅ Granular |
| T14: Prove the click with the side bar closed | 1 test or read | ✅ Granular |
| T15: Name the SIDE-05 events | 1 test or read | ✅ Granular |
| T16: Fit down to 250px | 1 CSS rule | ✅ Granular |
| T17: Harden the new tests | 3 assertions | ✅ Cohesive |

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
| T14 | T13 | T13 | ✅ Match |
| T15 | T14 | T14 | ✅ Match |
| T16 | T15 | T15 | ✅ Match |
| T17 | T16 | T16 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Renderer | unit | unit | ✅ OK |
| T2 | Webview script | integration | integration | ✅ OK |
| T3 | Host and manifest | integration | integration | ✅ OK |
| T4 | Host and manifest | integration | integration | ✅ OK |
| T5 | CSS | integration | integration | ✅ OK |
| T6 | Host | integration | integration | ✅ OK |
| T7 | Host | integration | integration | ✅ OK |
| T8 | Docs | none | none | ✅ OK |
| T9 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T10 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T11 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T12 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T13 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T14 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T15 | Webview script, host, and manifest | integration | integration | ✅ OK |
| T16 | CSS | integration | integration | ✅ OK |
| T17 | Webview script, host, and manifest | integration | integration | ✅ OK |
