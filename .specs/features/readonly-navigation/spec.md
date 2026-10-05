# Read-only Navigation Specification

## Problem Statement

Today, clicking a stage, file, requirement or task in the extension opens the markdown in the text editor, where it can be changed by accident — and the extension exists to follow the skill, not to edit its artifacts. Tasks only appear inside the Execution stage, and each click leads to the editable `tasks.md`. Following along should be read-only: artifacts open in preview mode and tasks appear as a list.

## Goals

- [ ] No click on an artifact opens an editor, except the explicit "Open in Editor" icon and warnings
- [ ] The tasks of every feature with a `tasks.md` are visible as a list, with status and details, without opening a file

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Editing tasks or ticking checkboxes from the extension | The extension is read-only; `tasks.md` belongs to the skill |
| A custom markdown renderer | VS Code's native Markdown preview is enough |
| Opening the preview scrolled to a line | The preview command takes no line; the "Open in Editor" icon covers this case |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Click on an artifact | Opens in the Markdown preview in the active column; inline "Open in Editor" icon opens at the item's line | User's decision in discuss | y |
| Task list | In the tree (Tasks and Execution stages) and in the dashboard, with details expanded in place | User's decision in discuss | y |
| Warnings | Still open the editor at the problem's line | The line is the key information in a warning | y |
| Execution stage file | `tasks.md` | The skill writes no execution artifact of its own; progress lives in `tasks.md` | n |
| Editor icon on task rows | None | Tasks are read-only; `tasks.md` stays reachable through the Tasks stage icon | n |
| Editor icon in the dashboard | Only on the Files section rows | Keeps the dashboard clean; the tree has each item's exact line | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Read-only UI navigation: no persistence, external calls, auth, concurrency or state transitions | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Open artifacts in preview mode ⭐ MVP

**User Story**: As someone following the specs, I want clicking a stage, file or requirement to open the markdown in preview mode, so that I can read it without risk of editing it.

**Why P1**: It is the core request — follow the skill without changing its artifacts.

**Acceptance Criteria**:

1. WHEN the user clicks a stage that has a file in the Features tree THEN the extension SHALL open the stage's markdown in the Markdown preview (Spec → `spec.md`, Design → `design.md`, Tasks → `tasks.md`, Execution → `tasks.md`, Verification → `validation.md`)
2. WHEN the user clicks a file, requirement or phase in the Features tree THEN the extension SHALL open the matching markdown in the Markdown preview
3. WHEN the user clicks an item in the Project tree (Handoff, decision or lesson) THEN the extension SHALL open `STATE.md` or `LESSONS.md` in the Markdown preview
4. WHEN the user triggers the "Open in Editor" icon of a stage, file, requirement or phase THEN the extension SHALL open the file in the text editor with the cursor on the item's line (line 1 when the item has no line)
5. WHEN the user clicks a warning THEN the extension SHALL open the file in the text editor at the warning's line

**Independent Test**: Clicking the Spec stage of `user-auth` opens the "Preview spec.md" tab; a requirement's editor icon opens `spec.md` at its line.

---

### P1: Tasks as a read-only list ⭐ MVP

**User Story**: As someone following the execution, I want to see the tasks as a list with status and details, so that I can track progress without opening the editable `tasks.md`.

**Why P1**: Explicit request; today the only way to see a task is to open the editable file.

**Acceptance Criteria**:

1. WHEN the user expands the Tasks stage or the Execution stage of a feature with tasks THEN the tree SHALL list the tasks grouped by Phase, each with a status icon and the label "Tn: title"
2. WHEN the user expands a task in the tree THEN the tree SHALL show as read-only items the What, the target file, the Depends on, the Requirements, Tests/Gate and each Done when item with its checked or unchecked state
3. The tree SHALL keep task rows and task detail rows without an open-file command, so that clicking them never opens an editor
4. IF the feature has no `tasks.md` or the `tasks.md` has no tasks THEN the tree SHALL show the Tasks stage with no option to expand it

**Independent Test**: Expanding Tasks of `user-auth` shows 3 phases and 7 tasks; expanding T4 shows 3 Done when items, 1 checked; none of these clicks opens an editor.

---

### P2: Same behavior in the dashboard

**User Story**: As someone using the dashboard, I want clicks in the dashboard to follow the same rules as the tree, so that I do not switch between ways of opening files.

**Why P2**: The tree covers the MVP; the dashboard is the second surface.

**Acceptance Criteria**:

1. WHEN the user clicks a stepper stage, an "open X.md" link, or a requirement, story or file row in the dashboard THEN the dashboard SHALL open the markdown in the Markdown preview
2. WHEN the user triggers the "Open in Editor" icon of a Files section row in the dashboard THEN the dashboard SHALL open the file in the text editor
3. WHEN the user clicks a collapsed task row in the dashboard THEN the dashboard SHALL expand the task details in place (What, target file, Depends on, Done when) without opening a file
4. WHEN the user clicks an expanded task row in the dashboard THEN the dashboard SHALL collapse the task details
5. WHEN the user clicks a warning in the dashboard THEN the dashboard SHALL open the file in the text editor at the warning's line

**Independent Test**: In the `user-auth` detail, clicking T4 shows the 3 Done when items in place; clicking "open spec.md" opens the preview.

---

## Edge Cases

- IF a stage has no file (skipped or pending) THEN the extension SHALL show the stage with no click action and no editor icon
- WHEN the Tasks and Execution stages are expanded at the same time THEN the tree SHALL show the task list in both with no duplicate identifier error

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| NAV-01 | P1: Open artifacts in preview mode | - | Verified |
| NAV-02 | P1: Open artifacts in preview mode | - | Verified |
| NAV-03 | P1: Open artifacts in preview mode | - | Verified |
| NAV-04 | P1: Open artifacts in preview mode | - | Verified |
| NAV-05 | P1: Open artifacts in preview mode | - | Verified |
| NAV-06 | P1: Tasks as a read-only list | - | Verified |
| NAV-07 | P1: Tasks as a read-only list | - | Verified |
| NAV-08 | P1: Tasks as a read-only list | - | Verified |
| NAV-09 | P1: Tasks as a read-only list | - | Verified |
| NAV-10 | P2: Same behavior in the dashboard | - | Verified |
| NAV-11 | P2: Same behavior in the dashboard | - | Verified |
| NAV-12 | P2: Same behavior in the dashboard | - | Verified |
| NAV-13 | P2: Same behavior in the dashboard | - | Verified |
| NAV-14 | P2: Same behavior in the dashboard | - | Verified |
| NAV-15 | Edge case: stage with no file | - | Verified |
| NAV-16 | Edge case: Tasks and Execution expanded | - | Verified |

**ID format:** `NAV-NN`, in the order of the criteria above (P1 artifacts → NAV-01..05, P1 tasks → NAV-06..09, P2 dashboard → NAV-10..14, edge cases → NAV-15..16).

**Coverage:** 16 total, Medium scope (tasks implicit in execution, no `tasks.md`).

---

## Success Criteria

- [ ] No click on a stage, file, requirement, phase or task opens a text editor
- [ ] The 7 tasks of `user-auth` appear as a list in the tree and in the dashboard, with the details readable without opening a file
