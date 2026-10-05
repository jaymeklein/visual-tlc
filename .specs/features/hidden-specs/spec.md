# Hidden Specs Specification

## Problem Statement

The dashboard hides completed features with a labeled checkbox, "Hide Completed", which does not show at a glance whether anything is hidden or how much. The Features tree hides nothing: it lists every spec, including the delivered ones, and has no way to list only what is left. There is also no way to move aside a spec that is not completed but has fallen out of focus, such as a paused or abandoned one.

## Goals

- [x] An eye button, in the dashboard and in the Features tree, shows by its icon whether the hidden specs are out of view or in view, and switches between the two states with one click
- [x] Any spec that is not completed can be hidden and unhidden by hand, with its own eye, and stays hidden when VS Code reopens

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Unhiding a completed spec so it always stays in view | The user chose: completed specs hide on their own, and the per-spec eye is for the others |
| Hiding specs in the Project tree | The request is about Features and the dashboard |
| Removing hidden specs from the summary, the status bar, and notifications | The summary shows that they exist. The status bar and notifications do not change |
| Storing the marks in a repository file, for the team | The extension does not write to the specs folders (readonly-navigation) |
| Per-spec eye in the feature detail | The card and the tree row are enough. The detail stays as it is |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| What a hidden spec is | A feature verified with PASS or a feature marked by hand | User's answer: "Completed and the marked ones" | y (2026-09-29) |
| Hide and show control | A toggle eye button, in the dashboard and in the Features view title. The icon shows the state: closed eye with the hidden specs out of view, open eye with them in view | User's answer: "An eye that toggles" | y (2026-09-29) |
| Where hidden specs appear when the eye opens | In their own place: the Completed column and the stage columns on the dashboard, the rows in the tree | User's answer | y (2026-09-29) |
| Dashboard button text | The number of hidden specs: "1 hidden", "3 hidden", "0 hidden". The title states the action: "Show Hidden Specs" or "Hide Hidden Specs" | The number shows at a glance that something is hidden. The title explains the click | n |
| Per-spec eye | Open eye, "Hide Spec", on a spec in view. Closed eye, "Unhide Spec", on a marked spec. Completed specs have no eye | Same meaning as the general button: the icon shows the spec's state | n |
| "Preview" icon on the card | Replaces the eye with the preview icon, the same one the tree uses | The eye now means hide | n |
| Marked spec in view | Dimmed card on the dashboard. In the tree, the description ends in "· hidden" | Sets the marked spec apart from the others when the eye is open | n |
| Where the marks live | In the VS Code workspace state (`workspaceState`), outside the repository | The extension does not write to the specs folders | n |
| General eye state | Each surface has its own: the tree, the editor tab, and the side bar. The tree starts with the hidden specs out of view every time VS Code opens. The dashboard keeps the state the way it already keeps "Hide Completed" | The request is a button in each place. Keeps the dashboard's pattern | n |
| Marked spec that is later completed | Counts once among the hidden specs | Stays hidden under both rules | n |
| Mark of a deleted or renamed spec | Stays stored. Applies again if a spec with the same name returns to the same folder | There is no way to tell a deleted spec from a specs folder left out of the configuration for a while | n |
| Project with all specs hidden, in a workspace with several projects | The project row stays in the tree, with no children in view | Shows that the project exists | n |
| Dashboard search | With the hidden specs out of view, search does not find them | Search filters what is on the board, as it does today | n |
| Two windows of the same workspace | Each window reads the marks when it opens. A mark made in one window only shows in the other when that one reopens | `workspaceState` does not notify other windows | n |
| Implicit dimensions | Persistence covered by HID-13 and the row above. Remaining dimensions N/A for this scope | No external calls, auth, or transitions beyond hidden and in view | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Show and hide the hidden specs with the eye ⭐ MVP

**User Story**: As someone tracking the specs, I want an eye in the dashboard and in the Features tree that shows whether specs are hidden and brings them into view with one click, so I can see what is left without losing access to what was moved aside.

**Why P1**: It is the request: the visual control, and the button in Features too.

**Acceptance Criteria**:

1. WHEN the dashboard opens, in the editor tab or in the side bar, THEN the extension SHALL show in the top bar, in place of the "Hide Completed" checkbox, a button with the closed eye, the title "Show Hidden Specs", and text with the number of hidden specs ("3 hidden")
2. WHILE the dashboard eye is closed the extension SHALL keep the hidden specs, completed and marked, and the Completed column off the board
3. WHEN the user clicks the dashboard's closed eye THEN the extension SHALL show the hidden specs on the board, each in its column, with the Completed column, and switch the button to the open eye with the title "Hide Hidden Specs"
4. WHEN the user clicks the dashboard's open eye THEN the extension SHALL take the hidden specs off the board again and return to the closed eye
5. WHEN VS Code opens a workspace with specs THEN the Features tree SHALL list only the specs that are not hidden and show the "Show Hidden Specs" button in the view title, with the `eye-closed` icon
6. WHEN the user clicks "Show Hidden Specs" in the Features view THEN the tree SHALL list all specs and the view title SHALL show the "Hide Hidden Specs" button, with the `eye` icon
7. WHEN the user clicks "Hide Hidden Specs" in the Features view THEN the tree SHALL go back to listing only the specs that are not hidden
8. WHILE the Features tree hides the hidden specs and there is at least one the view SHALL show the message "T feature(s) · D completed · H hidden", with the total number of features, the completed ones, and the hidden ones

**Independent Test**: Open this repository. The Features tree lists only the features without a `validation.md` at PASS, and the dashboard shows "N hidden" with the closed eye. Clicking the eye in each place brings the completed specs back, and clicking again hides them.

---

### P2: Hide a spec by hand

**User Story**: As someone tracking the specs, I want to hide a spec that has fallen out of focus, even if it is not completed, so it does not compete for space with the ones in progress.

**Why P2**: Completes the request, but the general eye already handles completed specs without it.

**Acceptance Criteria**:

9. WHILE a spec that is not completed is in view and unmarked the extension SHALL show on its row in the Features tree and on its card in the dashboard a button with the open eye and the title "Hide Spec"
10. WHILE a spec that is not completed is marked as hidden the extension SHALL show on its row in the Features tree and on its card in the dashboard a button with the closed eye and the title "Unhide Spec"

> Since `eye-on-every-spec` (EYE-01 to EYE-03), every spec has the eye, completed or not. A completed spec starts hidden, with the eye closed.

11. WHEN the user clicks "Hide Spec", in the tree or in the dashboard, THEN the extension SHALL remove the spec from the Features tree and from the dashboard boards with the eye closed, and add it to the hidden count
12. WHEN the user clicks "Unhide Spec", in the tree or in the dashboard, THEN the extension SHALL return the spec to the Features tree and to the dashboard boards, and remove it from the hidden count
13. WHEN VS Code reopens the same workspace THEN the extension SHALL keep the previously marked specs hidden
14. WHILE the general eye is open the extension SHALL show the marked spec with a dimmed card on the dashboard and with its description ending in "· hidden" in the Features tree

> Since `eye-on-every-spec` (EYE-08), the dimming and the "· hidden" apply to every hidden spec, including a completed one the user did not choose to hide.

**Independent Test**: In the Features tree, click the eye of an in-progress spec. It disappears from the tree and the dashboard, and the hidden count goes up. Opening the general eye shows the dimmed card with the closed eye. Clicking it brings the spec back.

---

## Edge Cases

- WHEN a marked spec is opened in the dashboard from the Features tree or from a notification THEN the extension SHALL show its detail, even with the eye closed
- IF all specs of a single project are hidden and the tree hides the hidden specs THEN the Features view SHALL show the empty list with the HID-08 message, without the welcome view

> Since `specs-folder-paths` (SFP-10), the tree shows the folder node even with a single project. With everything hidden, the node has no children, and the message still counts the hidden specs.
>
> Since `hidden-folder` (HFD-01 and HFD-04), the folder node whose specs are all hidden leaves the tree, with one project or several. The tree is empty again, with the HID-08 message.

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| HID-01 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-02 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-03 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-04 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-05 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-06 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-07 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-08 | P1: Show and hide the hidden specs with the eye | Execute | Verified |
| HID-09 | P2: Hide a spec by hand | Execute | Verified |
| HID-10 | P2: Hide a spec by hand | Execute | Verified |
| HID-11 | P2: Hide a spec by hand | Execute | Verified |
| HID-12 | P2: Hide a spec by hand | Execute | Verified |
| HID-13 | P2: Hide a spec by hand | Execute | Verified |
| HID-14 | P2: Hide a spec by hand | Execute | Verified |
| HID-15 | Edge case: detail of a marked spec | Execute | Verified |
| HID-16 | Edge case: all hidden | Execute | Verified |

**ID format:** `HID-NN`, in the order of the criteria above.

**Coverage:** 16 total, 16 verified.

---

## Success Criteria

- [x] When VS Code opens, neither the Features tree nor the dashboard shows hidden specs, and both show a closed eye
- [x] A spec hidden by hand stays hidden after the window reloads. Proven with a fake `Memento` read by a new instance. The wiring to the real `workspaceState` has no test that reopens VS Code (validation Follow-up 1, optional)
- [x] The current unit and integration tests still pass, with the "Hide Completed" tests and the ones that read completed specs in the tree adjusted to the eye
