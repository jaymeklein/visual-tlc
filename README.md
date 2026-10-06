# Visual TLC — Spec-Driven Tracker

A VS Code extension that visually tracks development done with the **`/tlc-spec-driven`** skill.
It reads the artifacts the skill writes to `.specs/` (or to the folders you configure) and shows, for each feature, which phase it is in, how much is left, and what is incomplete.

> **Read-only.** The extension never writes to `.specs/` and does not need the skill installed — it only interprets the files the skill produces.

Visual TLC is an independent, **unofficial** project with no affiliation with Tech Lead's Club, the skill's author. Credits are at the end of this page.

## Installation

Search for **Visual TLC** in the VS Code Extensions view and click **Install**. Updates arrive automatically, like any other extension.

The extension is also published to [Open VSX](https://open-vsx.org), the registry used by VS Code forks such as Windsurf, Cursor, VSCodium and Devin IDE. Search for **Visual TLC** in their Extensions view.

## What you get

**Side bar › TLC Specs**

- **Features** — one entry per folder in `.specs/features/`, with its current phase and progress. Each row has buttons to **preview the spec's markdown** (`spec.md` in the VS Code preview — or the folder's first markdown file if there is no spec), **reveal the feature folder** in the Explorer, open the feature in the dashboard, and **hide or unhide the spec** with the eye (also in the context menu). VS Code shows a row's buttons when you hover over it. Every spec has the eye, completed or not: open while the spec is in view, closed while it is hidden. Completed specs start hidden, and the eye of a completed spec keeps it in view for good. The tree opens without the hidden specs. The **eye in the title** of Features shows or hides them, and the message at the top counts how many are out of view. With the title eye open, every hidden spec shows "· hidden" and a closed eye on its row, which unhides it. A specs folder whose specs are all hidden also leaves the tree while the title eye is closed, and comes back collapsed, with "· hidden", when it opens: you choose which folders to expand. Expanding a feature shows:
  - the **Spec → Design → Tasks → Execution → Verification** pipeline, with each stage done, active, skipped, pending, or failed;
  - under **Tasks** and **Execution**, the task list grouped by *Phase* (status comes from the *Done when* checkboxes, the `**Status**` field, or a ✅ in the heading). Each task expands to its details (What, Where, Depends on, Requirements, Tests/Gate, Done when) as read-only items, without opening `tasks.md`;
  - the *Requirement Traceability* requirements, the feature's files, and **issues**.

  Clicking a stage, file, requirement, phase, or Project item opens the markdown in the **preview** (read-only). The pencil icon on the row opens the file **in the editor**, at the item's line. Issues open straight in the editor, at the line of the problem.
- **Project** — the *Handoff* from `STATE.md` (feature in focus, next step, blockers, branch), the `AD-NNN` decisions (active and superseded), and the lessons from `lessons.json` (confirmed, candidate, and quarantined).

**Dashboard** (the "Dashboard" section of the TLC Specs side bar)

- Lives in the side bar, outside the editor area: your open code stays in the same tab, without splitting the screen. Opening a feature in the dashboard (the feature's button, the status bar, or a notification) shows its details there.
- Below 700px wide, the board turns into a single column and hides the phases without features. The section can be dragged to the secondary (right) side bar.
- `TLC Specs: Open Dashboard in Editor Tab` (or the icon at the top of Features and of the Dashboard) opens the wide view in an editor tab, with the phases side by side.
- Project summary, the feature in focus, and a **board per phase** with the specs; each card has the same preview-markdown and reveal-folder buttons, plus the eye to hide or unhide the spec, completed or not.
- The dashboard opens with the **eye closed** at the top, next to the number of hidden specs: the completed ones and the ones you hid. The board shows only the rest, across the five phases. A completed spec you unhid stays in the Completed column, which then appears with the eye closed. Click the top eye to see the hidden specs: they come back dimmed, each in its column, with a closed eye on the card to unhide them. The summary always counts every spec, and a hidden spec opened from the tree or from a notification shows its details as usual.
- Each surface has its own top eye: the tree, the editor tab, and the side bar. What you choose with each spec's eye applies to all of them, is stored in VS Code's workspace state (outside `.specs/`), and still applies after a reload.
- Feature details: pipeline stepper, next step, tasks by phase, stories with their EARS patterns, requirements, the Verifier's verdict (criteria, mutants, UAT, fix plans), design/context, files, and issues. The same rules as the tree apply: clicks open the markdown in the preview, each task expands its details in place, the Files section has the pencil to open the file in the editor, and issues open the editor at their line.

**Also**

- **Problems panel** — issues become diagnostics at the exact file and line.
- **Status bar** — the feature in focus (the one in the Handoff, or the most recent unfinished one) and its phase.
- **Notifications** — when a new spec appears, or a feature changes phase, completes, or fails verification.
- Refreshes automatically whenever something in the specs folders changes. Supports several folders in the workspace (monorepos and multi-root).

## How the phase is determined

The skill creates files lazily (a missing file means the phase was skipped or not reached yet). The extension relies on that:

| Situation | Phase shown |
| --- | --- |
| only `spec.md` (and maybe `context.md`) | Spec |
| `design.md` without `tasks.md` | Design |
| `tasks.md` with no task started | Tasks (draft / approved) |
| some task started, or requirements in *Implementing* | Execution *n/m* |
| all tasks done, no `validation.md` | Awaiting verification |
| `validation.md` with FAIL / without a verdict | Verification failed / incomplete |
| `validation.md` with PASS and `file:line` evidence | Completed |

Medium-scope features (no `design.md` or `tasks.md`) show those stages as *skipped*.

## Incomplete-spec warnings

The checks reproduce the skill's own validators (`validate_spec.py`, `validate_tasks.py`, `validate_state.py`) with the same severity, plus a few cross-file checks:

- **spec.md** — missing required sections, acceptance criteria without `SHALL` or without an EARS pattern, assumptions without a *default*/*rationale*, open questions, template rows, malformed IDs, stories without criteria.
- **tasks.md** — required sections, tasks without `Tests`/`Gate`, dependencies pointing to a later phase, a diagram that disagrees with `Depends on`, `Where` with several files, a done task with a pending dependency, blocked tasks.
- **validation.md** — no verdict, the `[PASS | FAIL]` placeholder, FAIL, PASS without `file:line` evidence, GAPs, surviving mutants.
- **Across files** — execution done without `validation.md` (the Verifier did not run), requirements without a task, tasks citing a requirement that does not exist, traceability not updated to *Verified*, empty files, features stale for N days, a blocker in the Handoff.

## Settings

| Key | Default | Description |
| --- | --- | --- |
| `tlcSpecs.diagnostics.enabled` | `true` | Publishes the warnings to the Problems panel. |
| `tlcSpecs.notifications.enabled` | `true` | Notifies on phase changes, completion, and failures. |
| `tlcSpecs.staleAfterDays` | `14` | Days without changes before a feature is marked stale (0 disables). |
| `tlcSpecs.specsFolders` | `[".specs"]` | Folders the extension reads specs from, relative to the workspace root. |

### Specs folders

The extension reads only the folders listed in `tlcSpecs.specsFolders`. Each entry is a folder path relative to the root of the workspace folder:

```json
{ "tlcSpecs.specsFolders": [".specs", "packages/api/.specs"] }
```

- The default `[".specs"]` reads only the `.specs` at the workspace root. `.specs` folders in subfolders, such as the samples in `test/fixtures`, do not show up in the side bar or in the dashboard.
- To read another folder, list its path: `docs/specs`, `packages/api/.specs`. There is no deep search and no glob.
- The folder must follow the skill's layout (`features/`, `STATE.md`, `lessons.json`). A folder not named `.specs` only shows up when it has one of those artifacts.
- An entry that does not exist yet is ignored without a warning, and the folder shows up as soon as it is created.
- Absolute entries, entries with `..`, and globs are ignored, with a warning that names the entry.
- An empty list uses `.specs`.
- The setting applies per workspace folder: in a multi-root workspace, each folder can have its own list.
- The Features and Project trees show a node for each specs folder, named after the workspace folder, even when there is only one. With the title eye closed, Features leaves out only a folder whose specs are all hidden. When the same workspace folder has more than one specs folder, the node also shows the path (`api · docs/specs`).
- The `tlcSpecs.exclude` setting from earlier versions no longer exists. A value left over in `settings.json` has no effect.

## Development

```bash
npm install
npm run build            # dist/extension.cjs + dist/webview.js
npm test                 # parser unit tests (node --test)
npm run test:integration # opens an isolated VS Code with a copy of each workspace in test/fixtures
npm run package          # builds the .vsix
```

`F5` opens an Extension Development Host with the sample project (`test/fixtures/sample`), which covers every state: executing, completed, verification FAIL, awaiting the Verifier, Medium scope, incomplete spec, draft design, and a broken folder.

Install the package: `code --install-extension visual-tlc-<version>.vsix`.

### Publishing

The `.github/workflows/publish.yml` workflow publishes the extension to the Visual Studio Marketplace and to Open VSX when a `v*` tag reaches GitHub. It checks that the tag matches the `package.json` version, runs the typecheck and the unit tests, packages a single `.vsix`, and publishes that file to both. The Marketplace publish uses `vsce publish --oidc`, with no token stored in the repository.

The Open VSX publish needs a one-time setup, and is skipped while the `OVSX_PAT` secret is not set:

1. Sign in at [open-vsx.org](https://open-vsx.org) with GitHub, link an Eclipse account and sign the Publisher Agreement.
2. Create an access token at `open-vsx.org/user-settings/tokens`.
3. Create the namespace once: `npx ovsx create-namespace JaymeKlein -p <token>`.
4. Add the token as the `OVSX_PAT` secret in the repository settings.

To release a version:

1. Describe the changes in `CHANGELOG.md`, in a section with the new version number, and commit.
2. `npm version patch` (or `minor`, `major`). It updates `package.json` and creates the commit and the `vX.Y.Z` tag.
3. `git push --follow-tags`.

Neither registry accepts a version that has already been published. To roll back a version, publish a newer one with the previous code.

### Structure

```
src/core/     parsers and analysis (no VS Code dependency, testable with node --test)
src/ui/       trees, dashboard, status bar, diagnostics, notifications, store with file watcher
src/webview/  dashboard script (bundled for the browser)
media/        dashboard CSS and icons
```

## Credits

Visual TLC reads the files produced by the **tlc-spec-driven** skill, created by [Felipe Rodrigues](https://github.com/felipfr) for [Tech Lead's Club](https://github.com/tech-leads-club/agent-skills) and distributed under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The incomplete-spec checks follow the rules of the skill's validators (`validate_spec.py`, `validate_tasks.py`, `validate_state.py`), reimplemented in TypeScript, plus cross-file checks the skill does not do. No skill files are distributed with the extension.

Visual TLC is an independent, unofficial project with no affiliation with Tech Lead's Club or with the skill's author. The extension's license is in the `LICENSE` file.
