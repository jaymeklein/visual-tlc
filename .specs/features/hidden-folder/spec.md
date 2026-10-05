# Hidden Folder Specification

## Problem Statement

With the Features eye closed, a specs folder whose specs are all hidden stays in the tree as a node with no children (SFP-10). In this repository every spec is completed and hidden, and the tree shows only the empty `visual-tlc` node. The node leads nowhere and suggests there is work there. A folder with no spec in view should leave the tree, like its specs.

## Goals

- [x] With the Features eye closed, the tree shows only the folders that have some spec in view
- [x] With the eye open, the folder whose specs are all hidden comes back, marked as hidden

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Hide the folder in the Project tree | User answer: "Only in the Features tree". Handoff, decisions and lessons are not specs |
| Hide the project section in the Dashboard | User answer. With a single project, the Dashboard does not even show the folder name |
| A separate eye on the folder row | The folder follows its specs. The request is not to hide a folder by hand |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Where the folder disappears | Only in the Features tree, with the title eye closed | User answer: "Only in the Features tree" | y (2026-09-30) |
| Folder with the eye open | Shown, with the description "N feature(s) · hidden" | User answer: "With '· hidden'". Follows EYE-08 | y (2026-09-30) |
| SFP-10 and the multi-project row of hidden-specs | Superseded: with the eye closed, the folder whose specs are all hidden leaves the tree, with one project or several | It is the request: "the main folder should also be hidden" | y (2026-09-30) |
| When a folder is hidden | When it has at least one spec and all of them are hidden, by any EYE-06 rule | "There is no more work to be done" | n |
| Folder with no spec at all, only `STATE.md` or lessons | Stays in the tree, with "0 feature(s)" | Nothing in it is hidden. Without it, the tree would be empty with no message, because the message only appears when there is some feature | n |
| All folders hidden | Empty list, with the HID-08 message and no welcome view, as in HID-16 before SFP-10 | The message counts the hidden specs and shows that they exist | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | A display rule over the choices that hidden-specs and eye-on-every-spec already store. No new persistence | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Remove folders with no spec in view from the tree ⭐ MVP

**User Story**: As someone who follows the specs in the Features tree, I want a folder whose specs are all hidden to leave the tree when the eye is closed, so I see only the folders that have work.

**Why P1**: It is the request.

**Acceptance Criteria**:

1. WHILE the Features eye is closed the Features tree SHALL leave out the node of every specs folder that has at least one spec and all of them hidden
2. WHEN the user hides, through its row's eye, the last spec in view in a folder THEN the Features tree SHALL remove the folder's node
3. WHEN the user unhides, through the card in the Dashboard, a spec of a folder that is out of the tree THEN the Features tree SHALL show the folder's node again, with that spec inside
4. WHILE the Features eye is closed and no folder has a spec in view the Features view SHALL show the empty list with the message "T feature(s) · D completed · H hidden", without the welcome view
5. WHILE the Features eye is open the node of a folder whose specs are all hidden SHALL have the description "N feature(s) · hidden", with N the folder's total number of specs
6. WHILE a folder has at least one spec in view its node SHALL have the description "N feature(s)", without "· hidden", with the Features eye open or closed
7. WHILE all specs of a folder are hidden the Project tree SHALL show that folder's node, with Handoff, decisions and lessons inside

**Independent Test**: In this repository, with every spec completed and the Features eye closed, the tree is empty and the message says "T feature(s) · T completed · T hidden". Opening the eye shows the `visual-tlc` node with "T feature(s) · hidden".

---

## Edge Cases

- IF a specs folder has no spec at all THEN the Features tree SHALL show its node with the description "0 feature(s)", with the eye closed

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| HFD-01 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-02 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-03 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-04 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-05 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-06 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-07 | P1: Remove folders with no spec in view from the tree | Execute | Verified |
| HFD-08 | Edge case: folder with no spec | Execute | Verified |

**ID format:** `HFD-NN`, in the order of the criteria above.

**Coverage:** 8 total, 8 verified.

---

## Success Criteria

- [ ] In this repository, with every spec completed, the Features tree opens empty, with only the hidden-specs message
- [x] The SFP-10/HID-16 test, which required the node with no children, is rewritten for the new rule, without losing the assertions on the message and the welcome view
