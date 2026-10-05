# Sidebar Dashboard Specification

## Problem Statement

The dashboard opens as an editor tab. To see it, you switch tabs and lose sight of the code, or split the screen. Someone tracking a feature while coding needs the dashboard outside the editor area, in the side bar.

## Goals

- [x] The dashboard appears in the TLC Specs side bar without opening, closing, or splitting editor tabs
- [x] The dashboard fits the side bar width without horizontal scrolling
- [x] The wide editor-tab view is still available through a command

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Contributing the view directly to the right-hand side bar | The declared minimum version (VS Code 1.90) only documents containers in the activity bar and the bottom panel. The user can drag the view to the right |
| View in the bottom panel | User decision: side bar only |
| Setting to choose where clicks open the dashboard | User decision: clicks open the side bar; the editor tab stays behind a command |
| Changing the dashboard's content | The request is about where it opens. The content is the same on both surfaces |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Dashboard location | View in the TLC Specs side bar, alongside Features and Project | User's answer | y |
| Dashboard in an editor tab | Still available through its own command. Clicks now open the side bar view | User's answer | y |
| View position | Last, after Project, named "Dashboard" | Does not move the existing trees | n |
| Tab command | `tlcSpecs.openDashboard` keeps its id and is renamed "Open Dashboard in Editor Tab". The button in the Features view title still calls this command | Existing shortcuts and keybindings keep working | n |
| Which clicks open the side bar | Everything that calls `tlcSpecs.showFeature`: the feature's button and menu, the status bar, and notifications | These are the clicks that currently open the dashboard on a feature | n |
| Width that triggers the narrow layout | Under 700px | The side bar is usually 250 to 500px wide; below 700px, three 200px columns don't fit | n |
| Empty stages in the narrow layout | Hidden | Six stacked blocks, most of them empty, push the features off screen | n |
| Hidden view | VS Code discards a hidden view's content. When it comes back, it reloads the current state and keeps the selected feature | Avoids keeping a webview alive in the background | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Change of display surface: no new persistence, external calls, auth, or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: See the dashboard in the side bar ⭐ MVP

**User Story**: As someone who codes while tracking a feature, I want the dashboard in the side bar so I can check it without leaving the open code.

**Why P1**: It is the request.

**Acceptance Criteria**:

1. The extension SHALL offer the "Dashboard" view in the TLC Specs side bar container, with the same projects as the editor-tab dashboard
2. WHEN the user triggers "Open Feature in Dashboard" THEN the extension SHALL show the Dashboard view on that feature's details, without opening or closing editor tabs
3. WHILE the Dashboard view is less than 700px wide the extension SHALL show the board stages in a single column, without horizontal scrolling
4. WHILE the Dashboard view is less than 700px wide the extension SHALL hide the board stages that have no features
5. WHEN an artifact is created, changed, or removed in a specs folder THEN the extension SHALL show the current features in the Dashboard view, each in its current phase
6. WHEN the Dashboard view becomes visible again after being hidden THEN the extension SHALL show the current projects and the feature that was selected
7. WHEN the user clicks an artifact in the Dashboard view THEN the extension SHALL open the markdown preview of that artifact

**Independent Test**: With a code file open, click the feature in the status bar. The side bar shows the feature's details and the file stays open in the same tab, with no split.

---

### P2: Open the wide view in an editor tab

**User Story**: As someone who wants to see the whole board, I want to open the dashboard in an editor tab so I get the six stages side by side.

**Why P2**: The wide view already exists; this story only makes sure it is not lost.

**Acceptance Criteria**:

1. WHEN the user runs "Open Dashboard in Editor Tab" THEN the extension SHALL open the dashboard in an editor tab named "TLC Specs"
2. WHILE the editor-tab dashboard is 700px wide or more the extension SHALL show the six board stages side by side

> Since `panel-in-progress` (PNL-03 and PNL-04), the six stages appear with "Hide Completed" unchecked. With the option checked, which is the default, the board shows five. Since `hidden-specs`, the option is the top eye: closed, which is the default, shows five; open shows six.

**Independent Test**: Run "TLC Specs: Open Dashboard in Editor Tab" from the command palette. The tab opens with the stages side by side: five columns with "Hide Completed" checked, six with it unchecked.

---

## Edge Cases

- WHEN the Dashboard view and the editor-tab dashboard are open at the same time THEN the extension SHALL update both
- IF the workspace has no specs folder THEN the Dashboard view SHALL show the message "No specs found"

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SIDE-01 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-02 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-03 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-04 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-05 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-06 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-07 | P1: See the dashboard in the side bar | Tasks | Verified |
| SIDE-08 | P2: Open the wide view in an editor tab | Tasks | Verified |
| SIDE-09 | P2: Open the wide view in an editor tab | Tasks | Verified |
| SIDE-10 | Edge case: both surfaces open | Tasks | Verified |
| SIDE-11 | Edge case: workspace without specs | Tasks | Verified |

**ID format:** `SIDE-NN`, in the order of the criteria above.

**Coverage:** 11 total, 11 mapped in `tasks.md`, 0 without a task.

---

## Success Criteria

- [x] Clicking a feature shows the dashboard in the side bar and the open code stays in the same tab
- [x] The existing unit and integration tests still pass; the ones that opened the tab through `tlcSpecs.showFeature` now open it through the tab command
