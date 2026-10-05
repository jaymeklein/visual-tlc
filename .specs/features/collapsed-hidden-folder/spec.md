# Collapsed Hidden Folder Specification

## Problem Statement

When the user opens the Features title eye, the folder whose specs are all hidden comes back expanded, with every spec listed. In a folder with many completed specs, the tree fills with rows the user did not ask to see. The user wants to decide which folders to open.

## Goals

- [x] When the Features eye opens, the folder whose specs are all hidden comes back collapsed
- [x] Folders with a spec in view stay as they were, expanded by default

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Remember, from one eye opening to the next, which hidden folders the user opened | The request is for the folder to come back closed. With the eye closed, it leaves the tree |
| Collapse the folders with a spec in view | The request is about the folder the eye brings back |
| Change the Project tree or the Dashboard | Still out of scope, as in hidden-folder |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Folder that comes back with the eye open | Collapsed, without listing the specs | User request: "it would be better if it came back closed" | y (2026-09-30) |
| Folders with a spec in view | Stay as they were: expanded, or collapsed if they were collapsed (by the user, or because the eye brought them back collapsed). Also applies to a folder in view only through a completed spec kept in view by its eye | The request is about the folder the eye brings back, and deciding which folders to open is up to the user. The node stays in the tree, and VS Code keeps the state the user gave it | n |
| Each eye opening | The hidden folder comes back collapsed every time, even if the user opened it before | The request is for it to come back closed when the eye opens | n |
| How the folder comes back collapsed | The hidden folder's node is given as collapsed, with the same `id` as always | Measured in the installed VS Code on 2026-09-30: VS Code uses the given state only on a node it adds to the tree. With the eye closed, the folder leaves the tree, and VS Code forgets whether it was open. A new `id` on each opening was tested and is not needed | n |
| Hiding or unhiding a spec with the eye open | The folder's node stays open or closed as it was (CHF-04) | The node stays in the tree, and VS Code keeps the state the user gave it, even if the extension changes the given state. Deciding which folders to open is up to the user | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Only the initial state of a tree node changes. No persistence, external calls or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Open the eye without expanding the hidden folders ⭐ MVP

**User Story**: As someone who follows the specs in the Features tree, I want the title eye to bring hidden folders back collapsed, so I can open only the ones I care about.

**Why P1**: It is the request.

**Acceptance Criteria**:

1. WHEN the user opens the Features title eye THEN the tree SHALL show collapsed, without listing its specs, the node of every folder whose specs are all hidden
2. WHEN the user opens the Features title eye THEN the tree SHALL keep the node of every folder with some spec in view as it was: expanded, with the specs listed, or collapsed, if it was collapsed
3. WHEN the user expands the collapsed node of a hidden folder THEN the tree SHALL list all of the folder's specs, each with a description ending in "· hidden"
4. WHILE the Features title eye is open, WHEN the user hides or unhides a spec, the tree SHALL keep its folder's node open or closed as it was

**Independent Test**: In this repository, with every spec completed, open the Features title eye. The `visual-tlc` node appears collapsed. Expanding the node shows the specs, all with "· hidden".

---

## Edge Cases

- WHEN the user closes and reopens the title eye THEN the tree SHALL again show collapsed the node of the folder whose specs are all hidden

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| CHF-01 | P1: Open the eye without expanding the hidden folders | Execute | Verified |
| CHF-02 | P1: Open the eye without expanding the hidden folders | Execute | Verified |
| CHF-03 | P1: Open the eye without expanding the hidden folders | Execute | Verified |
| CHF-04 | P1: Open the eye without expanding the hidden folders | Execute | Verified |
| CHF-05 | Edge case: reopening the eye | Execute | Verified |

**ID format:** `CHF-NN`, in the order of the criteria above.

**Coverage:** 5 total, 5 verified.

---

## Success Criteria

- [x] A test in real VS Code shows that, when the eye opens, VS Code does not request the hidden folder's specs, but does request those of the folder in view
- [ ] In this repository, after reinstalling the extension and reloading the window, the title eye brings the `visual-tlc` node back collapsed
