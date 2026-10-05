# Exclude Folders Specification

> Superseded by `specs-folder-paths` (SFP-04). The `tlcSpecs.exclude` setting was removed from the extension, along with the EXC tests: each `tlcSpecs.specsFolders` entry became the exact path of a folder, and there is nothing left to exclude.

## Problem Statement

The original request was to include and exclude directories from the spec listing. The `specs-folders` feature delivered only inclusion. Exclusion stayed in the old `tlcSpecs.exclude` setting, which is a single glob string: to remove the `test` folder from the listing you have to write `{**/node_modules/**,**/test/**}`. Anyone using the extension in a project with example specs in `test/` sees those specs mixed with the real ones.

## Goals

- [x] A list of folders removes everything inside them from the listing
- [x] Anyone already using `tlcSpecs.exclude` as a glob keeps the same result

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Globs in the list | List entries are literal paths, as in `tlcSpecs.specsFolders`. The glob is still available in the old string format |
| Hiding individual features | The request is about directories |
| Tree button to exclude a folder | Exclusion is done through the setting |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Setting name | `tlcSpecs.exclude` now accepts a list, instead of adding a new setting | A single place to exclude; anyone who already configured it does not need to migrate | n |
| Entry format | Relative path (`test`, `packages/legacy`), ignored at any depth of each workspace folder | Same rule as `tlcSpecs.specsFolders` | n |
| Default | `["node_modules"]` | Equivalent to the old default, `**/node_modules/**` | n |
| String value | Used as a glob, as before | Compatibility with existing configurations | n |
| Scope | `resource`: each folder of a multi-root workspace can have its own list | Same scope as `tlcSpecs.specsFolders` | n |
| Including and excluding the same folder | Exclusion wins | Excluding is the more specific request of whoever configured it | n |
| Invalid entry (absolute, with `..`, with a comma, or with a glob) | Ignored, with a warning that names the entry and the setting | Absolute, with `..`, or with a glob: same rule as `tlcSpecs.specsFolders`. The comma rule applies only to `tlcSpecs.exclude`, because the comma separates the entries in the glob the search receives; `tlcSpecs.specsFolders` searches each entry separately and accepts commas | n |
| Warning text | Each setting gives guidance only by its own rules: the `tlcSpecs.specsFolders` warning does not mention commas | A warning does not rule out what the setting accepts | n |
| Implicit dimensions | Remaining dimensions N/A for this scope | Local setting and file reads: no persistence, external calls, auth, or concurrency | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Exclude folders from the listing ⭐ MVP

**User Story**: As someone with example or test specs in the project, I want to list the folders the extension should ignore so I see only the real specs.

**Why P1**: It is the half of the original request that was not delivered.

**Acceptance Criteria**:

1. The extension SHALL offer the `tlcSpecs.exclude` setting as a list of relative paths, with the default `["node_modules"]`
2. WHEN the list has a folder THEN the extension SHALL leave out of the listing every specs folder inside it, at any depth
3. WHEN the `tlcSpecs.exclude` setting changes THEN the extension SHALL update projects, trees, Dashboard (in the editor tab and in the side bar), and diagnostics without reloading the window
4. IF the value of `tlcSpecs.exclude` is a string THEN the extension SHALL use it as an exclusion glob
5. WHERE the workspace has more than one folder the extension SHALL apply to each workspace folder the list configured in it

**Independent Test**: In this repository, with `"tlcSpecs.exclude": ["node_modules", "test"]`, the specs in `test/fixtures/` disappear from the listing and the ones in `.specs` remain.

---

## Edge Cases

- IF the list is empty THEN the extension SHALL list all specs folders, including the ones in `node_modules`
- IF an entry is absolute or contains `..`, a comma, or glob characters THEN the extension SHALL ignore that entry and show a warning with its name and the name of the `tlcSpecs.exclude` setting
- WHEN a folder has an entry's name as part of its name (`tests` with the entry `test`) THEN the extension SHALL keep that folder in the listing
- WHEN a folder is in `tlcSpecs.specsFolders` and inside an entry of `tlcSpecs.exclude` THEN the extension SHALL leave it out of the listing
- WHEN the same invalid entry is in `tlcSpecs.specsFolders` and in `tlcSpecs.exclude` THEN the extension SHALL show one warning per setting, with the setting's name

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| EXC-01 | P1: Exclude folders from the listing | Execute | Verified |
| EXC-02 | P1: Exclude folders from the listing | Execute | Verified |
| EXC-03 | P1: Exclude folders from the listing | Execute | Verified |
| EXC-04 | P1: Exclude folders from the listing | Execute | Verified |
| EXC-05 | P1: Exclude folders from the listing | Execute | Verified |
| EXC-06 | Edge case: empty list | Execute | Verified |
| EXC-07 | Edge case: invalid entry | Execute | Verified |
| EXC-08 | Edge case: similar name | Execute | Verified |
| EXC-09 | Edge case: included and excluded | Execute | Verified |
| EXC-10 | Edge case: same invalid entry in both settings | Execute | Verified |

**ID format:** `EXC-NN`, in the order of the criteria above.

**Coverage:** 10 total, 10 verified; Medium scope (steps listed during execution, no `tasks.md`).

---

## Success Criteria

- [x] With `test` in the list, no spec inside a `test` folder appears in the listing
- [x] The current unit and integration tests keep passing
