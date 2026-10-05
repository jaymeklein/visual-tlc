# Changelog

Changes in each published version of Visual TLC. The newest version is at the top.

## 0.2.0

- **English throughout.** Every label, command, tooltip, notification, warning message and setting description is now in English, as are the Marketplace description, the README and the project docs.
- Specs written in Portuguese are still read as before: status words such as `concluído`, `pendente` or `nenhum` are still recognized.

## 0.1.0

First published version.

- **TLC Specs side bar.** The **Features** tree shows each feature with its current phase and progress, the Spec → Design → Tasks → Execution → Verification pipeline, the tasks by phase with their details, the requirements, the files and the issues. The **Project** tree shows the Handoff from `STATE.md`, the `AD-NNN` decisions and the lessons from `lessons.json`.
- **Dashboard** in the side bar or in an editor tab, with the project summary, a board per phase and each feature's details: stepper, next step, tasks, EARS stories, requirements, the Verifier's verdict and issues.
- **Read-only navigation.** Clicking an item opens the markdown in the preview. The pencil opens the file in the editor, at the item's line.
- **Hidden specs.** Each spec's eye hides or unhides it, and the top eye of each surface shows or hides the hidden ones. Completed specs start hidden. A folder whose specs are all hidden comes back collapsed when the eye opens.
- **Incomplete-spec warnings** in the Problems panel, using the rules of the skill's validators plus cross-checks between `spec.md`, `tasks.md` and `validation.md`.
- **Status bar** with the feature in focus, and **notifications** for a new spec, a phase change, completion and a failed verification.
- **Configurable specs folders** (`tlcSpecs.specsFolders`), with support for monorepos and multi-root workspaces.
