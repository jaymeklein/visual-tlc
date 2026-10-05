# Hidden Specs Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/hidden-specs/design.md`
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Style taken from `test/unit/webview.test.ts` and `test/integration/suite.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core`) | unit | All branches; 1:1 with the ACs; one test per listed edge case | `test/unit/*.test.ts` | `npm test` |
| Webview (`src/webview/render.ts`, `media/dashboard.css`) | unit | Each dashboard AC in the rendered HTML and in `actionFor`, in both directions of each toggle | `test/unit/webview.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `src/webview/main.ts`, `package.json` contributes) | integration | Each AC in the visible result: tree children, view message, dashboard cards and eye. Each listed trigger: tree row, command, and webview message | `test/integration/suite.cjs` | `npm run test:integration` |
| Docs (`README.md`, specs) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. Integration runs on a hidden Windows desktop, so it does not open windows on the user's screen.

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

### Phase 2: Dashboard

```
T1 → T2 → T3 → T4
```

### Phase 3: Features Tree

```
T4 → T5 → T6
```

### Phase 4: Docs

```
T6 → T7
```

### Phase 5: Verifier Fixes (iteration 1)

```
T7 → T8 → T9 → T10
```

---

## Task Breakdown

### T1: Store the marked specs

**What**: `HiddenSpecs` reads and writes the marks in a `Memento` and notifies when they change. `hiddenKey` and `isHidden` live in the same module
**Where**: `src/core/hidden.ts` (new)
**Depends on**: None
**Reuses**: `Feature` and `FeatureRef` types
**Requirement**: HID-02, HID-11, HID-12, HID-13

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A new instance over the same `Memento` sees the saved marks (HID-13)
- [x] `set` notifies listeners only when the mark changes
- [x] A saved value that is not a list of strings becomes an empty list
- [x] `isHidden` is true for completed, for marked, and for both, and false for the rest
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 59 unit tests pass (53 before + 6 new)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): keep the specs marked as hidden in the workspace state`

---

### T2: Top eye and card eye in the dashboard HTML

**What**: `renderApp` replaces the checkbox with the toggle eye, counts the hidden specs, hides the marked ones, draws the per-card eye, and dims the marked one. `actionFor` gains `toggle-hidden`, `hide`, and `unhide`
**Where**: `src/webview/render.ts` (plus the `setHidden` type in `src/core/protocol.ts`, and an empty `hidden` in `src/webview/main.ts`, so it compiles until T4)
**Depends on**: T1
**Reuses**: `projectSection` filter, `featureActions`, `DEFAULT_VIEW`
**Requirement**: HID-01, HID-02, HID-03, HID-04, HID-09, HID-10, HID-14, HID-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `DEFAULT_VIEW` draws the closed eye with "Show Hidden Specs" and "N hidden", without the checkbox (HID-01)
- [x] Closed eye: the board has no completed specs, no marked specs, and no Completed column (HID-02)
- [x] Open eye: all specs, six stages, open eye with "Hide Hidden Specs" (HID-03)
- [x] `actionFor` for the eye goes both ways: `{ showHidden: true }` and `{ showHidden: false }` (HID-03, HID-04)
- [x] Card in view: open eye "Hide Spec" with `data-action="hide"`. Marked card: closed eye "Unhide Spec" with `unhide`. Completed spec without an eye (HID-09, HID-10)
- [x] `actionFor` for `hide` and `unhide` sends `setHidden` with `hidden: true` and `false`
- [x] Marked card dimmed only while marked (HID-14)
- [x] Detail of a marked spec with the eye closed (HID-15)
- [x] "Preview" no longer uses the eye
- [x] Old "Hide Completed" tests rewritten for the eye, without losing any assertion
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 66 unit tests pass (59 before + 7 new)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): toggle the hidden specs with an eye and hide a spec from its card`

---

### T3: Style for the eye and the dimmed card

**What**: Rules for the top eye button and for `.card.is-hidden`
**Where**: `media/dashboard.css`
**Depends on**: T2
**Reuses**: `.btn-ghost`, `.feature-actions`
**Requirement**: HID-01, HID-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `.card.is-hidden` has lower opacity, and the stylesheet test proves the rule (HID-14)
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 67 unit tests pass (66 before + 1 new)

**Tests**: unit
**Gate**: quick

**Commit**: `style(dashboard): fade the specs marked as hidden`

---

### T4: Bring the marks to the dashboard and the card eye to the host

**What**: The `state` message carries the marks, `setHidden` reaches `HiddenSpecs`, and both surfaces redraw when a mark changes. `main.ts` passes the marks on, replaces the checkbox `change` with the click, and reports the eye in `Rendered`
**Where**: `src/core/protocol.ts`, `src/webview/main.ts`, `src/ui/dashboard.ts`, `src/extension.ts`
**Depends on**: T3
**Reuses**: `Surface.onMessage`, `postState`, `report()`
**Requirement**: HID-01, HID-02, HID-11, HID-12, HID-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Editor tab and side bar open with the "Show Hidden Specs" eye and the model's hidden count (HID-01)
- [x] `setHidden` from the side bar removes the spec from the tab and side bar cards and adds 1 to the count. `setHidden` back returns it (HID-11, HID-12)
- [x] The marked spec opened via `showFeature` shows its detail in the side bar (HID-15)
- [x] Tests that mark a spec unmark it in a `finally`
- [x] The top eye fits in the narrow side bar: SIDE-03/04 measures the side bar with no horizontal scroll (carried over from T3)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 56 + 1 + 2 integration tests pass (53 before + 3 new)

**Tests**: integration
**Gate**: full

**Commit**: `feat(dashboard): send the hidden marks to the panel and take its eye clicks`

---

### T5: Eye in the Features title

**What**: The tree hides the hidden specs by default. `tlcSpecs.showHidden` and `tlcSpecs.hideHidden` toggle, with the `tlcSpecs.showHidden` context key and the view message
**Where**: `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T4
**Reuses**: `featureNodes`, the `store.onDidChange` message in `extension.ts`
**Requirement**: HID-05, HID-06, HID-07, HID-08, HID-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The tree opens without the completed specs. The title has `showHidden` with `$(eye-closed)` while `!tlcSpecs.showHidden`, which holds as long as the key has not been set (HID-05)
- [x] `showHidden` lists all specs and writes the context key `true`. The title shows `hideHidden` with `$(eye)` (HID-06)
- [x] `hideHidden` goes back to the list without the hidden specs and writes `false` (HID-07)
- [x] The message is "T feature(s) · D completed · H hidden" with the eye closed, and has no "hidden" part with it open (HID-08)
- [x] Single project with everything hidden: empty list and the message with the hidden count (HID-16)
- [x] Tests that read `billing-invoices` in the tree open the eye before and close it after
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 60 + 1 + 2 integration tests pass (56 before + 4 new)

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): hide the hidden specs in Features behind an eye in the title`

---

### T6: Eye on the spec row in Features

**What**: `tlcSpecs.hideFeature` and `tlcSpecs.unhideFeature`, inline on the spec row. The row gets a `contextValue` for its state and "· hidden" in the description when marked
**Where**: `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T5
**Reuses**: `toRef`, `featureItem`
**Requirement**: HID-09, HID-10, HID-11, HID-12, HID-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Row in view: `contextValue` `feature` and the inline menu `hideFeature` with `$(eye)`. Marked: `feature.hidden` and `unhideFeature` with `$(eye-closed)`. Completed: `feature.done`, no eye (HID-09, HID-10)
- [x] The row's existing buttons remain in all three forms
- [x] `hideFeature` with the tree row removes the spec from the tree and from the dashboard cards and adds 1 to the message (HID-11)
- [x] `unhideFeature` returns it to both surfaces (HID-12)
- [x] With the eye open, the marked spec's description ends in "· hidden", and the same spec unmarked does not (HID-14)
- [x] Per-spec commands are left out of the palette
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 63 + 1 + 2 integration tests pass (60 before + 3 new)

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): hide and unhide a spec from its row in Features`

---

### T7: Document the eye

**What**: README describes the dashboard eye, the Features eye, and the per-spec eye. The panel-in-progress spec gets a note that the checkbox became the eye
**Where**: `README.md`
**Depends on**: T6
**Reuses**: dashboard section in `README.md:26`
**Requirement**: HID-01, HID-05, HID-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README mentions the eye at the top of the dashboard, in the Features title, and on each spec, and that the marks are kept in the workspace
- [x] Note in the panel-in-progress spec, next to PNL-01 to PNL-04, and in the SIDE-09 note in sidebar-dashboard
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the eye that hides and shows the specs`

---

### T8: Fix 1 - marked completed spec without an eye

**What**: The HID-09/10 tests also mark the completed spec and assert that it still has no eye, on the card and on the row
**Where**: `test/unit/webview.test.ts`, `test/integration/suite.cjs`
**Depends on**: T7
**Reuses**: `board`, `cardEyes`, `rowOf`, `setHidden`
**Requirement**: HID-09, HID-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Unit: with csv-export and billing-invoices marked, `cardEyes` for billing-invoices is `[]` (kills M11)
- [x] Integration: marked billing-invoices has `contextValue` `feature.done`, and the `finally` unmarks it (kills H3)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 63 + 1 + 2 integration tests pass (new assertions in existing tests)

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): keep the eye off a completed spec that is marked`

---

### T9: Fix 2 - dimming and "· hidden" only on the marked spec

**What**: The HID-14 tests assert that the completed spec is neither dimmed nor given "· hidden" with the eye open
**Where**: `test/unit/webview.test.ts`, `test/integration/suite.cjs`
**Depends on**: T8
**Reuses**: `cardsOf`, `rowOf`
**Requirement**: HID-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Unit: with csv-export marked and the eye open, billing-invoices has `cls` `card h-complete` (kills M12)
- [x] Integration: with the eye open, the billing-invoices description does not contain "hidden" (kills H4)
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`
- [x] Test count: 67 unit, 63 + 1 + 2 integration tests pass (new assertions in existing tests)

**Tests**: integration
**Gate**: full

**Commit**: `test(dashboard): fade and tag only the specs marked by hand`

---

### T10: Fix 3 - the zero text

**What**: An HID-01 test draws the dashboard with no hidden specs and asserts "0 hidden"
**Where**: `test/unit/webview.test.ts`
**Depends on**: T9
**Reuses**: `eyeToggle`, `sampleProject`
**Requirement**: HID-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Sample with only the specs that are not completed and no marks: the eye text is "0 hidden" (kills M8)
- [x] Gate check passes: `npm run typecheck && npm test`
- [x] Test count: 67 unit tests pass (new assertion in an existing test)

**Tests**: unit
**Gate**: quick

**Commit**: `test(dashboard): count zero hidden specs in the plural`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1
Phase 2:  T2 ------→ T3 ------→ T4
Phase 3:  T5 ------→ T6
Phase 4:  T7
Phase 5:  T8 ------→ T9 ------→ T10
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: HiddenSpecs | 1 new module | ✅ Granular |
| T2: Dashboard HTML | 1 file, render and `actionFor` | ✅ Granular |
| T3: Style | 1 file | ✅ Granular |
| T4: Protocol, webview, and host | 4 files for a single message | ⚠️ Cohesive: the message neither compiles nor can be tested without both ends |
| T5: Title eye | tree, command, and menu | ⚠️ Cohesive: the command cannot be tested without the menu and the tree |
| T6: Row eye | tree, command, and menu | ⚠️ Cohesive: same reason as T5 |
| T7: Docs | 1 file and a note | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: HiddenSpecs | Core | unit | unit | ✅ OK |
| T2: Dashboard HTML | Webview | unit | unit | ✅ OK |
| T3: Style | Webview | unit | unit | ✅ OK |
| T4: Protocol, webview, and host | Extension host | integration | integration | ✅ OK |
| T5: Title eye | Extension host | integration | integration | ✅ OK |
| T6: Row eye | Extension host | integration | integration | ✅ OK |
| T7: Docs | Docs | none | none | ✅ OK |
| T8: Fix 1 | Webview + Extension host (tests) | unit + integration | integration | ✅ OK |
| T9: Fix 2 | Webview + Extension host (tests) | unit + integration | integration | ✅ OK |
| T10: Fix 3 | Webview (tests) | unit | unit | ✅ OK |
