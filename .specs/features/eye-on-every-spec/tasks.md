# Eye On Every Spec Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (no `design.md`)
**Status**: Done

Inline design: each spec has a choice, `'hidden'`, `'shown'`, or none. `isHidden(f, choice)` is true for `choice === 'hidden'`, or for a completed spec without `'shown'`. `HiddenSpecs` keeps the hidden specs in the existing list (`tlcSpecs.hidden`) and the completed specs kept in view in a new list (`tlcSpecs.shown`). `set(ref, hidden, complete)` saves only the choice that differs from the spec's default and clears the other. The `state` message carries both lists to the webview. The host learns from the store whether the spec is completed, in the Dashboard's `setHidden` and in the tree commands. The tree row is `feature` or `feature.hidden`, with no `feature.done`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Style of `test/unit/hidden.test.ts`, `test/unit/webview.test.ts`, and `test/integration/suite.cjs`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Core (`src/core/hidden.ts`) | unit | All branches; 1:1 with the ACs; one test per listed edge case | `test/unit/hidden.test.ts` | `npm test` |
| Webview (`src/webview/render.ts`) | unit | Each Dashboard AC in the HTML and in `actionFor` | `test/unit/webview.test.ts` | `npm test` |
| Extension host (`src/ui`, `src/extension.ts`, `src/webview/main.ts`, `package.json`) | integration | Each AC in the visible result: tree children, `contextValue`, description, message, Dashboard cards and columns. Both triggers: tree row and webview message | `test/integration/suite.cjs` | `npm run test:integration` |
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

### Phase 2: Dashboard

```
T1 → T2
```

### Phase 3: Host and tree

```
T2 → T3
```

### Phase 4: Docs

```
T3 → T4
```

---

## Task Breakdown

### T1: Per-spec choice: hidden, in view, or none

**What**: `HiddenSpecs` also stores the completed specs kept in view, `set` receives whether the spec is completed and saves only a choice that differs from the default, and `isHidden` receives the choice
**Where**: `src/core/hidden.ts` (and the four calls to `set` and `isHidden`, each on the same line, so it compiles: `render.ts`, `featuresTree.ts`, `dashboard.ts`, `extension.ts`)
**Depends on**: None
**Reuses**: `HiddenSpecs`, `hiddenKey`, the already saved `tlcSpecs.hidden` list
**Requirement**: EYE-04, EYE-05, EYE-06, EYE-09, EYE-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A completed spec with no choice is hidden. A completed spec with `'shown'` is in view. A spec that is not completed with `'hidden'` is hidden (EYE-04, EYE-05, EYE-06)
- [x] `set(ref, false, true)` saves the completed spec in `tlcSpecs.shown`, and a new instance reads it (EYE-05, EYE-09)
- [x] `set(ref, true, true)` on a completed spec in view clears the choice from both lists (EYE-10)
- [x] Old marks in `tlcSpecs.hidden` still apply
- [x] The hidden-specs tests now call `set` with the third argument, without losing any assertion
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): let the eye of a spec keep a completed one in view`

---

### T2: Eye on every card

**What**: `renderApp` draws the eye on every card, dims every hidden spec when the top eye is open, and shows the Completed column when the top eye is closed and some completed spec is in view
**Where**: `src/webview/render.ts` (and an empty `shown` in `src/webview/main.ts`, so it compiles until T3)
**Depends on**: T1
**Reuses**: `eyeButton`, `projectSection`, `cardsOf`, `cardEyes`, `board`
**Requirement**: EYE-01, EYE-02, EYE-03, EYE-05, EYE-07, EYE-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Hidden completed card: closed eye "Unhide Spec". Completed card in view: open eye "Hide Spec" (EYE-01, EYE-02, EYE-03)
- [x] Top eye closed with a completed spec in view: the spec is in the Completed column, six stages, and the hidden count drops by one (EYE-05, EYE-07)
- [x] Top eye closed with no completed spec in view: five stages, as in PNL-03
- [x] Top eye open: every hidden spec has `is-hidden`, completed or not; the completed spec in view does not (EYE-08)
- [x] The HID-09/10 and HID-14 tests that said "completed has no eye" and "completed is not dimmed" move to the new rule
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(dashboard): draw the eye on every card`

---

### T3: Host and tree with the choice

**What**: The `state` message carries the completed specs in view. The Dashboard's `setHidden` and the row commands use the store to know whether the spec is completed. The tree row is `feature` or `feature.hidden`, with "· hidden" on every hidden spec
**Where**: `src/core/protocol.ts`, `src/webview/main.ts`, `src/ui/dashboard.ts`, `src/ui/featuresTree.ts`, `src/extension.ts`, `package.json`
**Depends on**: T2
**Reuses**: `Surface.onMessage`, `featureItem`, `toRef`, `store.findFeature`
**Requirement**: EYE-01, EYE-02, EYE-03, EYE-04, EYE-05, EYE-08, EYE-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Completed row: `contextValue` `feature.hidden` and the closed eye. Through `unhideFeature`, it stays in view in the tree with the title eye closed, with `contextValue` `feature` (EYE-01, EYE-02, EYE-03, EYE-05)
- [x] The same `setHidden` coming from the Dashboard keeps the completed spec in view in the editor tab: cards and six columns with the eye closed, and the hidden count drops by one (EYE-05, EYE-07)
- [x] `hideFeature` on a completed spec in view hides it again, in the tree and on the Dashboard (EYE-04, EYE-10)
- [x] Title eye open: every hidden row ends in "· hidden", and the completed row in view does not (EYE-08)
- [x] The row buttons apply to `feature` and `feature.hidden`
- [x] The HID-09/10 and HID-14 integration tests move to the new rule
- [x] Gate check passes: `npm run typecheck && npm test && npm run test:integration`

**Tests**: integration
**Gate**: full

**Commit**: `feat(tree): give every spec row its eye`

---

### T4: Document the eye on every spec

**What**: The README says every spec has an eye and how a completed spec stays in view. The hidden-specs spec gets notes on HID-09, HID-10, and HID-14
**Where**: `README.md`
**Depends on**: T3
**Reuses**: the Features and Dashboard sections of the README
**Requirement**: EYE-01, EYE-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The README describes the eye on every spec and the completed spec in view
- [x] Notes on HID-10 (covering HID-09 and HID-10) and on HID-14
- [x] Gate check passes: `npm run typecheck && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(readme): describe the eye on every spec`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2
Phase 3:  T3
Phase 4:  T4
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: per-spec choice | 1 module | ✅ Granular |
| T2: eye on every card | 1 file | ✅ Granular |
| T3: host and tree | protocol, webview, host, tree, manifest | ⚠️ Cohesive: the choice crosses the message and the command, and can only be tested as a whole |
| T4: docs | README and notes | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Core | unit | unit | ✅ OK |
| T2 | Webview | unit | unit | ✅ OK |
| T3 | Extension host | integration | integration | ✅ OK |
| T4 | Docs | none | none | ✅ OK |
