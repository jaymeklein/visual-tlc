# Panel In Progress Specification

## Problem Statement

The Dashboard shows every feature, including the completed ones, which sit in the Completed column. In a project with many delivered features, those cards fill the board and compete for space with what is still in progress. In the narrow side bar, the board turns into a long list. The "Hide Completed" option already exists, but it starts unchecked. When it is checked, the column disappears and leaves an empty strip on the right of the board.

## Goals

- [x] The Dashboard opens showing only the features that are not completed
- [x] The completed features stay one click away, in the "Hide Completed" option

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Setting to choose the default | The request is to change the default. The option in the Dashboard still shows the completed features |
| Hide completed features in the Features and Project trees | The request is about the Dashboard |
| Hide completed tasks in a feature's detail | Dropped by the user on 2026-09-29 |
| Remember the choice from one editor tab to the next | The option keeps the choice as it already does today. A new editor tab starts with the default |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| What "completed" means | A feature verified with PASS, the same rule as the Completed column and the Completed tile in the summary | It is the rule the Dashboard already uses | y (2026-09-29) |
| What disappears | The cards of the completed features and the Completed column | The user chose to hide the completed features and the column | y (2026-09-29) |
| Surfaces | Dashboard in the editor tab and in the side bar | Both render the same page | n |
| Board width without the Completed column | The five stages share the width, with at least 200px each | Today's empty strip wastes a sixth of the board | n |
| Summary | The "Completed" tile still counts the completed features | It shows they exist without showing the cards | n |
| SIDE-09 (sidebar-dashboard) | The six stages side by side now apply with the option unchecked. With the option checked, which is the default, there are five | This feature changes the default that SIDE-09 assumed | n |
| Measured in real VS Code | The integration tests measure the five-stage board. The six stages are covered by the render and stylesheet tests | The integration tests cannot click the option inside the webview | n |
| Search | With the option checked, search does not find completed features | Search filters what is on the board, as today | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Screen state local to the webview: no new persistence, external calls, auth or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: See only what is in progress ⭐ MVP

**User Story**: As someone who follows the specs in the Dashboard, I want it to open with only the features in progress, so I can see what is left without going through the delivered ones.

**Why P1**: It is the request.

**Acceptance Criteria**:

1. WHEN the Dashboard opens, in the editor tab or in the side bar, THEN the extension SHALL show the "Hide Completed" option checked
2. WHILE the "Hide Completed" option is checked the extension SHALL leave off the board the cards of the features verified with PASS and the Completed column
3. WHILE the "Hide Completed" option is checked and the Dashboard is 700px wide or more the extension SHALL show the five stages side by side, with no space reserved for the Completed column
4. WHEN the user unchecks the "Hide Completed" option THEN the extension SHALL show the Completed column with the cards of the features verified with PASS, and the six stages side by side

> Since `hidden-specs` (HID-01 to HID-04), the "Hide Completed" checkbox is an eye at the top of the Dashboard. The checked box is the closed eye, which also hides the specs hidden by hand. Unchecking the box is opening the eye.

**Independent Test**: Open the Dashboard in an editor tab in this repository. The features with `validation.md` at PASS do not appear on the board, and there is no Completed column. Unchecking "Hide Completed" brings back the column and the cards.

---

## Edge Cases

- WHEN a completed feature is opened in the Dashboard from the Features tree or from a notification THEN the extension SHALL show its detail, even with the option checked

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| PNL-01 | P1: See only what is in progress | Execute | Verified |
| PNL-02 | P1: See only what is in progress | Execute | Verified |
| PNL-03 | P1: See only what is in progress | Execute | Verified |
| PNL-04 | P1: See only what is in progress | Execute | Verified |
| PNL-05 | Edge case: detail of a completed feature | Execute | Verified |

**ID format:** `PNL-NN`, in the order of the criteria above.

**Coverage:** 5 total, 5 verified; Medium scope (steps listed during execution, no `tasks.md`).

---

## Success Criteria

- [x] When the Dashboard opens, no feature verified with PASS appears on the board
- [x] The current unit and integration tests keep passing, with the SIDE-09 ones adjusted to the new default
