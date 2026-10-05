# Specs Folder Paths Specification

## Problem Statement

Each entry in `tlcSpecs.specsFolders` is searched for at any depth. So `.specs` also matches the sample and test `.specs` folders inside the project, and their specs show up in the side bar and the dashboard. Removing them takes a second setting, `tlcSpecs.exclude`, which the user has to discover and combine with the first. Two settings do the job of one. And when only one specs folder is left, the Features and Project trees drop the folder node and list its contents directly, unlike when there are several.

## Goals

- [x] `tlcSpecs.specsFolders` alone decides which folders the extension reads: each entry is the exact path of a folder, from the root of the workspace folder
- [x] The Features and Project trees always show each project's folder, with its contents inside it

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Globs in entries (`packages/*/.specs`) | The user chose exact paths. Each folder of a monorepo goes in as its own entry |
| Folders outside the workspace or absolute paths | Still rejected with a warning, as today (SF-09) |
| Project name in the dashboard with a single project | The user chose to show the folder only in the Features and Project trees |
| Migrating `tlcSpecs.exclude` values | The setting is removed. An old value in `settings.json` has no effect |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| What an entry is | Exact path of a folder, relative to the root of each workspace folder. No depth search | User's answer: "Exact path" | y (2026-09-30) |
| `tlcSpecs.exclude` | Removed. Only `tlcSpecs.specsFolders` picks the folders | User's request: "only .specsFolders would be needed" | y (2026-09-30) |
| Folder node with a single project | Shown in the Features and Project trees. The dashboard still has no title with a single project | User's answer: "Features and Project" | y (2026-09-30) |
| Specs outside the configured folders | Shown nowhere: trees, dashboard in the editor tab and in the side bar, status bar, Problems panel and notifications | User's request: "they should not be listed in the side panel" | y (2026-09-30) |
| Default | `[".specs"]`: reads only the `.specs` at the root of each workspace folder | Follows from the exact path | n |
| Invalid entry | An absolute path, a path with `..` or a glob is ignored with a warning that quotes it, as today | Keeps SF-09 | n |
| Entry that does not exist | Ignored without a warning. Shows up when the folder is created | The skill creates the folder later. A warning before that would be false | n |
| Folder with a name other than `.specs` | Shown only when it has a skill artifact (`features/*/*.md`, `STATE.md`, `lessons.json` or `LESSONS.md`), as today | Keeps SF-05 | n |
| Node label | Name of the workspace folder. When the same workspace folder has more than one specs folder, "name · path" (`visual-tlc · docs/specs`) | Tells the folders apart without repeating the path when there is only one | n |
| Workspace with several folders | Each workspace folder uses its own list, as today (`resource` scope) | Keeps SF-01 | n |
| Project with all specs hidden | The project node stays in the tree, with no children in view. Replaces HID-16, which expected an empty list | The node now always shows | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Setting read from VS Code, with no new persistence, external calls or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Read only the configured folders ⭐ MVP

**User Story**: As someone using the extension in a project with sample and test specs, I want a single setting that says which folders it reads, so that I see only my specs.

**Why P1**: It is the request: one setting, and nothing beyond the chosen folders.

**Acceptance Criteria**:

1. WHEN `tlcSpecs.specsFolders` lists `.specs` THEN the extension SHALL read the `.specs` folder at the root of the workspace folder and SHALL ignore `.specs` folders inside subfolders
2. WHEN `tlcSpecs.specsFolders` lists a path with subfolders, such as `packages/api/.specs` THEN the extension SHALL read the folder at that path, from the root of the workspace folder
3. WHILE a spec is outside the configured folders the extension SHALL keep it out of the Features and Project trees, the dashboard in the editor tab and in the side bar, the status bar and the Problems panel
4. The extension SHALL offer `tlcSpecs.specsFolders` as the only folder setting, without `tlcSpecs.exclude`
5. IF an entry points to a folder that does not exist THEN the extension SHALL ignore it without a warning
6. WHEN an entry's folder is created later THEN the extension SHALL show it without reloading the window

**Independent Test**: In this repository, with the default setting, the side bar and the dashboard show only the specs in `.specs`, not the ones in `test/fixtures`. Switching to `["test/fixtures/sample/.specs"]` shows only the fixture's specs.

---

### P2: See each project's folder in the trees

**User Story**: As someone following the specs from the side bar, I want to always see the folder the specs come from, so that I know what I am reading even with a single project.

**Why P2**: Completes the request. The listing works without it.

**Acceptance Criteria**:

7. WHILE there is a single specs folder the Features tree SHALL show a node with the workspace folder name, with the specs inside it
8. WHILE there is a single specs folder the Project tree SHALL show a node with the workspace folder name, with Handoff, decisions and lessons inside it
9. WHEN a workspace folder has more than one specs folder found THEN the trees SHALL label each node as "workspace folder name · entry path"

**Independent Test**: With only `.specs` configured, the Features tree shows the `visual-tlc` node with the specs inside, and the Project tree shows the `visual-tlc` node with the Handoff inside.

---

## Edge Cases

- WHILE the Features eye is closed and all of a project's specs are hidden the Features tree SHALL show the project node with no children, with the view message counting the hidden ones

> Since `hidden-folder` (HFD-01), the node of a folder whose specs are all hidden leaves the tree when the eye is closed. The message still counts the hidden ones (HFD-04).

- IF an entry is absolute, has `..` or has a glob THEN the extension SHALL ignore it with a warning that quotes the entry, as in SF-09

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| SFP-01 | P1: Read only the configured folders | Execute | Verified |
| SFP-02 | P1: Read only the configured folders | Execute | Verified |
| SFP-03 | P1: Read only the configured folders | Execute | Verified |
| SFP-04 | P1: Read only the configured folders | Execute | Verified |
| SFP-05 | P1: Read only the configured folders | Execute | Verified |
| SFP-06 | P1: Read only the configured folders | Execute | Verified |
| SFP-07 | P2: See each project's folder in the trees | Execute | Verified |
| SFP-08 | P2: See each project's folder in the trees | Execute | Verified |
| SFP-09 | P2: See each project's folder in the trees | Execute | Verified |
| SFP-10 | Edge case: project with everything hidden | Execute | Verified |
| SFP-11 | Edge case: invalid entry | Execute | Verified |

**ID format:** `SFP-NN`, in the order of the criteria above.

**Coverage:** 11 total, 11 verified.

---

## Success Criteria

- [x] In this repository, with the default setting, no spec from `test/fixtures` appears in the side bar or the dashboard
- [x] The extension settings have a single folders entry: `tlcSpecs.specsFolders`
- [x] The existing tests still pass, with the `tlcSpecs.exclude` tests removed along with the setting and the depth-search tests rewritten for the exact path
