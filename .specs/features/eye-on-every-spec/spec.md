# Eye On Every Spec Specification

## Problem Statement

The hide eye only exists on specs that are not completed. Completed specs are hidden automatically and have no eye of their own. In a project where every spec is completed, like this one, the Features tree shows no eye at all, and there is no way to hide a spec or keep it in view from its row. The user asked three times to hide a spec from the Features tree.

## Goals

- [x] Every spec has an eye on its Features tree row and on its Dashboard card, completed or not
- [x] Clicking the eye switches the spec between hidden and in view, and the choice holds until the user switches it again

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Eye in the feature detail | Still left out, as in hidden-specs. The card and the row are enough |
| Keeping the row buttons always visible | VS Code shows a tree row's buttons only on hover or when the row is selected. The API cannot change that |
| Changing the Dashboard top eye and the Features title eye | Same as in hidden-specs: closed hides the hidden specs, open shows them |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Eye on completed specs | Every spec has an eye. Completed specs start hidden, and the eye of one can keep it in view | User's answer: "Eye on every spec" | y (2026-09-30) |
| State of a spec | Hidden when the user hid it, or when it is completed and the user did not keep it in view. In view otherwise | Combines the completed-spec rule with the user's choice | n |
| Spec eye icon | Open eye, "Hide Spec", on a spec in view. Closed eye, "Unhide Spec", on a hidden spec. Same as hidden-specs, now on completed specs too | Same meaning as the top eye: the icon shows the state | n |
| Where the choice is stored | In the VS Code workspace state, as in hidden-specs. Manually hidden specs in the existing list, completed specs kept in view in a second list | Keeps the marks already saved | n |
| Choice that matches the default | Not saved: hiding a completed spec that is in view clears the choice, and the spec is hidden again because it is completed | Avoids choices that change nothing | n |
| Manually hidden spec that is later completed | Stays hidden | Hidden by both rules | n |
| Completed spec kept in view that later fails again | Stays in view | A spec that is not completed is in view by default | n |
| Completed column with the top eye closed | Shown when some completed spec is in view, with all six stages. With no completed spec in view, five stages, as in PNL-03 | A completed spec in view needs a column | n |
| Dimmed and "· hidden" with the top eye open | Every hidden spec, completed or not, is dimmed on the board and has "· hidden" in the tree. Replaces HID-14, which applied only to marked specs | Shows which specs the closed top eye hides | n |
| Hidden count | Counts the specs hidden by any rule, once each | Keeps HID-01 | n |
| Implicit dimensions | Persistence covered by EYE-09. Remaining dimensions N/A for this scope | State local to the workspace, no external calls or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Hide or show any spec with its eye ⭐ MVP

**User Story**: As someone who follows the specs from the side bar, I want an eye on each spec, completed or not, so I can choose which ones stay in view.

**Why P1**: It is the user's repeated request.

**Acceptance Criteria**:

1. The extension SHALL show an eye on every spec, on the Features tree row and on the Dashboard card, completed or not
2. WHILE a spec is in view the spec's eye SHALL be the open eye with the title "Hide Spec"
3. WHILE a spec is hidden the spec's eye SHALL be the closed eye with the title "Unhide Spec"
4. WHEN the user clicks "Hide Spec", in the tree or on the card, THEN the extension SHALL remove the spec from the tree and the board with the top eye closed and add it to the hidden count, completed or not
5. WHEN the user clicks "Unhide Spec" on a completed spec THEN the extension SHALL show it in the tree and in the Completed column with the top eye closed, and remove it from the hidden count
6. WHILE a completed spec has no user choice the extension SHALL treat it as hidden
7. WHILE the Dashboard top eye is closed and some completed spec is in view the board SHALL show the Completed column with that spec, across all six stages
8. WHILE the top eye is open the extension SHALL show every hidden spec, completed or not, with a dimmed card on the Dashboard and with a description ending in "· hidden" in the tree
9. WHEN VS Code reopens the same workspace THEN the extension SHALL keep the choices made with each spec's eye

**Independent Test**: In this repository, open the Features title eye, hover over a completed spec, and click its closed eye. Close the title eye: the spec stays in the tree and on the Dashboard, and the hidden count drops by one. Click its open eye: it disappears again.

---

## Edge Cases

- WHEN the user hides a completed spec that was in view THEN the extension SHALL clear the choice, and the spec is hidden again because it is completed
- WHEN a manually hidden spec is opened on the Dashboard from the tree or from a notification THEN the extension SHALL show its detail, as in HID-15

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| EYE-01 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-02 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-03 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-04 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-05 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-06 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-07 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-08 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-09 | P1: Hide or show any spec with its eye | Execute | Verified |
| EYE-10 | Edge case: hiding a completed spec in view | Execute | Verified |
| EYE-11 | Edge case: detail of a hidden spec | Execute | Verified |

**ID format:** `EYE-NN`, in the order of the criteria above.

**Coverage:** 11 total, 11 verified.

---

## Success Criteria

- [x] In this repository, where every spec is completed, every Features tree row shows the eye on hover
- [x] A completed spec kept in view stays in view after reloading the window. Proven with a fake `Memento` read by a new instance, as in hidden-specs. No test reopens VS Code
- [x] The hidden-specs tests that said "completed has no eye" and "completed is not dimmed" are rewritten for the new rule, without losing the other assertions
