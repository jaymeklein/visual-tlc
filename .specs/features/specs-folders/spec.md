# Specs Folders Specification

## Problem Statement

The extension only finds specs in folders named `.specs`: the name is hardcoded in the search, the watcher, and activation. Projects that keep the skill's artifacts elsewhere (for example `docs/specs`) or in more than one folder are invisible. The user needs to configure one or more specs folders, with `.specs` as the default.

## Goals

- [x] Any folder listed in the setting appears in the extension with the same behavior as a `.specs` folder
- [x] With no setting, the current behavior stays the same

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Folders outside the workspace (absolute paths) | Discovery is per open project; external folders need a different watcher and permission model |
| Internal structure different from the skill's | The configured folder must follow the skill's layout (`features/`, `STATE.md`, `lessons.json`) |
| Glob patterns in entries | Entries are literal paths; globs already exist in `tlcSpecs.exclude` |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Entry format | Relative path (`.specs`, `docs/specs`) searched at any depth in each workspace folder | Keeps today's discovery, which already finds `.specs` in monorepos | y |
| Setting scope | `resource`: each folder of a multi-root workspace can have its own list | Different projects in the same workspace keep specs in different places | y |
| Folder without a skill artifact | Ignored, except when the folder is named `.specs` | Generic names like `docs` would match folders that are not specs; `.specs` keeps the current behavior | y |
| Extension activation | Add `onStartupFinished` alongside `workspaceContains:**/.specs/**` | `activationEvents` does not read settings; without this, folders with another name only appear after the side bar is opened | y |
| Empty list | Uses `.specs` | Avoids an active extension that shows nothing | y |
| Invalid entry (absolute, with `..`, or with a glob) | Ignored, with a warning that names the entry | Visible failure instead of a silent one | y |
| Implicit dimensions | Remaining dimensions N/A for this scope | Local setting and file reads: no persistence, external calls, auth, or concurrency | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Configure the specs folders ⭐ MVP

**User Story**: As someone who uses the skill in projects with different layouts, I want to configure one or more folders where the extension looks for specs, so I can follow projects that do not use `.specs`.

**Why P1**: It is the request; without it the extension cannot see these projects.

**Acceptance Criteria**:

1. The extension SHALL offer the `tlcSpecs.specsFolders` setting, a list of relative paths with default `[".specs"]`
2. WHEN the setting lists one or more folders THEN the extension SHALL show as a project each folder in the workspace that matches any entry, at any depth
3. WHEN the setting changes THEN the extension SHALL reload the trees, dashboard, status bar, and diagnostics without reloading the window
4. WHEN a file is created, changed, or deleted inside any configured folder THEN the extension SHALL update the view of that folder
5. IF a folder not named `.specs` matches an entry but has no skill artifact (`features/*/*.md`, `STATE.md`, `lessons.json`, or `LESSONS.md`) THEN the extension SHALL ignore it
6. WHEN the workspace opens with a configured folder not named `.specs` THEN the extension SHALL activate without the user opening the side bar

> Since `specs-folder-paths` (SFP-01 and SFP-02), each entry is the exact path of a folder from the root of the workspace folder. There is no depth search anymore.

**Independent Test**: With `tlcSpecs.specsFolders = ["docs/specs"]` and the specs in `docs/specs/features/...`, the features appear in the tree; switching to `[".specs"]` makes them disappear without reloading the window.

---

### P2: Distinguish folders in the same project

**User Story**: As someone with more than one specs folder in the same project, I want to see which folder each group comes from, so I do not mix up the features.

**Why P2**: It only matters when there is more than one folder; the MVP works without it.

**Acceptance Criteria**:

1. WHEN two specs folders belong to the same project THEN the Features tree SHALL label each group with the project and the folder path (e.g. `api · docs/specs`)

> Since `specs-folder-paths` (SFP-09), the label is the workspace folder name and, when it has more than one specs folder, the entry path. With exact paths there is no project in a subfolder.

**Independent Test**: With `[".specs", "docs/specs"]` in a project that has both, the tree shows two groups with different labels.

---

## Edge Cases

- IF the configured list is empty THEN the extension SHALL use `.specs`
- IF an entry is absolute, contains `..`, or contains glob characters THEN the extension SHALL ignore that entry and show a warning with its name
- WHEN two entries lead to the same folder THEN the extension SHALL show that folder only once
- WHEN an entry uses `\` as a separator or ends with `/` THEN the extension SHALL treat it as the same normalized path

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SF-01 | P1: Configure the specs folders | Tasks | Verified |
| SF-02 | P1: Configure the specs folders | Tasks | Verified |
| SF-03 | P1: Configure the specs folders | Tasks | Verified |
| SF-04 | P1: Configure the specs folders | Tasks | Verified |
| SF-05 | P1: Configure the specs folders | Tasks | Verified |
| SF-06 | P1: Configure the specs folders | Tasks | Verified |
| SF-07 | P2: Distinguish folders in the same project | Tasks | Verified |
| SF-08 | Edge case: empty list | Tasks | Verified |
| SF-09 | Edge case: invalid entry | Tasks | Verified |
| SF-10 | Edge case: overlapping entries | Tasks | Verified |
| SF-11 | Edge case: separators and trailing slash | Tasks | Verified |

**ID format:** `SF-NN`, in the order of the criteria above.

**Coverage:** 11 total, 11 mapped in `tasks.md`, 0 without a task.

---

## Success Criteria

- [x] A project with specs in `docs/specs` appears in full in the extension with only the setting
- [x] With no setting, the 24 integration tests and the current unit tests keep passing
