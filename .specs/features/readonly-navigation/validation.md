# Read-only Navigation Validation

## Validation: readonly-navigation - PASS ✅

**Date**: 2026-09-29
**Spec**: `.specs/features/readonly-navigation/spec.md`
**Diff range**: e5f0a57..HEAD (HEAD = 8bee305)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | ccebb08 | Failed: 1 gap, 1 surviving mutant | NAV-10 was proven only up to the webview message. The host handler for `previewFile` in `src/ui/dashboard.ts` had no test, and mutant M4 (`previewUri` → `openUri`) passed every gate. Lessons L-001 and L-002 were recorded. |
| 2 | 8bee305 | Passed | Fix 1 landed in 8bee305 (`test(dashboard): cover host-side handling of dashboard messages`). `Dashboard.onMessage` is now public and exposed on the test API as `dashboardMessage`. Two host-side integration tests and one unit test were added. M4 is now killed, and the new mutant M5 is killed. |

---

## Task Completion

Medium scope: the spec says tasks are implicit, so there is no `tasks.md`. The delivery units are the feature commits.

| Unit | Commit | Status | Notes |
| ---- | ------ | ------ | ----- |
| Spec + context | 17db88a | ✅ Done | 16 requirements NAV-01..NAV-16 |
| Tree opens artifacts in preview + "Abrir no editor" | cc19b8e | ✅ Done | NAV-01..05, NAV-15. Adds the `LESSONS.md` fixture |
| Tree lists tasks read-only | 7bf05a3 | ✅ Done | NAV-06..09, NAV-16 |
| Panel opens artifacts in preview | de116a7 | ✅ Done | NAV-10, NAV-11, NAV-14. Moves the renderer into `src/webview/render.ts` |
| Panel expands task details in place | ffbab28 | ✅ Done | NAV-12, NAV-13 |
| README | ccebb08 | ✅ Done | docs only |
| Fix 1: host-side panel message tests | 8bee305 | ✅ Done | closes the iteration-1 NAV-10 gap |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| NAV-01 WHEN clicking a stage that has a file in Features THEN open it in the Markdown preview | Spec→`spec.md`, Design→`design.md`, Tasks→`tasks.md`, Execução→`tasks.md`, Verificação→`validation.md`, all in the Markdown preview | `test/integration/suite.cjs:151-161`: `assert.equal(item.command?.command, 'tlcSpecs.previewFile')` + `assert.deepEqual(item.command.arguments.slice(0, 2), [projectId(), file])` for all 5 mappings (Execução at :155). End to end at `:164-165` → `expectPreviewOf('design.md')`, which asserts a `markdown.preview` webview tab (`:145`) and `activeTextEditor === undefined` (`:147`) | ✅ PASS |
| NAV-02 WHEN clicking a file, requirement or phase THEN open the matching markdown in the preview | file→its path, requirement→`spec.md`, phase→`tasks.md`, preview (not editor) | `test/integration/suite.cjs:179-180`: command `tlcSpecs.previewFile` with args `[pid, 'features/user-auth/context.md' / 'spec.md' / 'tasks.md']`. `:183-184`: running the requirement row gives `expectPreviewOf('spec.md')` | ✅ PASS |
| NAV-03 WHEN clicking a Projeto item (Handoff, decision, lesson) THEN open `STATE.md` / `LESSONS.md` in the preview | Handoff, field, decision→`STATE.md`; lesson→`LESSONS.md`; preview | `test/integration/suite.cjs:202-203`: `previewFile` + `[pid, 'STATE.md' / 'LESSONS.md']` for 4 node kinds. `:206-207`: `expectPreviewOf('LESSONS.md')` | ✅ PASS |
| NAV-04 WHEN using "Abrir no editor" on a stage, file, requirement or phase THEN open the text editor at the item line (line 1 if none) | text editor, cursor on the item line, line 1 for items without a line | `test/integration/suite.cjs:213-214`: an inline menu exists with `when` matching `viewItem == artifact`. `:222`: `contextValue === 'artifact'` for req, phase, file and stage. `:233-234`: `editor.document.uri.path.endsWith(...)` + `assert.equal(editor.selection.active.line, line)`. Expected: req `req.line-1`, phase `phase.line-1`, stage `0`, file `0` (`:225-228`) | ✅ PASS |
| NAV-05 WHEN clicking a warning THEN open the text editor at the warning line | editor, line of the warning | `test/integration/suite.cjs:242-243`: `command === 'tlcSpecs.openFile'`, args `[pid, 'features/user-auth/spec.md', warning.issue.line]`. `:247-248`: `editor.selection.active.line === warning.issue.line - 1` | ✅ PASS |
| NAV-06 WHEN expanding Tasks or Execução THEN list tasks grouped by Phase, each with a status icon and the label "Tn: título" | both stages expand; 3 phases; 7 labels `Tn: title`; status icons | `test/integration/suite.cjs:276-303` for `['tasks','execute']`: `:278` collapsible ≠ None. `:280-288` phases `[1,2,3]`. `:292-300` exact 7 labels. `:302-303` icon `pass` (done) / `circle-large-outline` (pending) | ✅ PASS |
| NAV-07 WHEN expanding a task THEN show O quê, Onde, Depende de, Requisitos, Tests/Gate and each Done-when item with its checked state as read-only items | exact fields + per-item checked/unchecked | `test/integration/suite.cjs:311`: task is `Collapsed`. `:317-326`: `deepEqual` of the 5 `[label, description, icon]` rows for T5. `:327-333`: Done when rows `circle-large-outline` (unchecked). `:335-339`: T3 Done when rows `['pass','pass','pass']` (checked) | ✅ PASS |
| NAV-08 Task and task-detail rows carry no open-file command | `command === undefined` and no editor icon on task and detail rows | `test/integration/suite.cjs:343-353`, both stages, all tasks + all details: `assert.equal(item.command, undefined)` (`:346`, `:350`) + `assert.notEqual(item.contextValue, 'artifact')` (`:347`, `:351`) | ✅ PASS |
| NAV-09 IF no `tasks.md` or `tasks.md` has no tasks THEN the Tasks stage is not expandable | collapsibleState None, no children | `test/integration/suite.cjs:358-361`: `collapsibleState === None` + `deepEqual(children, [])` for csv-export and audit-log (no `tasks.md`) and legacy-import (empty `tasks.md`, 0 bytes) | ✅ PASS |
| NAV-10 WHEN clicking a stepper step, an "abrir X.md" link, or a requirement, story or file row in the panel THEN open the markdown in the Markdown preview | panel opens the file in the Markdown preview | **Webview:** `test/unit/webview.test.ts:42-51` gives each step's `data-action='preview-file'` with the exact file (Execução→`tasks.md`). `:55`: "abrir tasks.md" / "abrir spec.md" buttons. `:145`: "abrir validation.md" button. `:149`: overview "abrir STATE.md" button. `:61`: requirement + story + Spec step + Arquivos rows. `:64`: file rows. `:69-70`: Verificação→`validation.md`. `:72-74`: `actionFor` → `{type:'previewFile'}`. **Host:** `test/integration/suite.cjs:382-383`: `api.dashboardMessage({type:'previewFile', file:'features/user-auth/spec.md'})` → `expectPreviewOf('spec.md')`, which asserts a preview tab and no text editor. This kills M4 | ✅ PASS |
| NAV-11 WHEN using "Abrir no editor" on an Arquivos row in the panel THEN open the text editor | each Arquivos row has an editor button; the host opens the text editor | `test/unit/webview.test.ts:81-84`: exactly one `button[data-action=open][title='Abrir no editor']` per file. `:85-87`: `actionFor` → `{type:'open', file, line: undefined}`. Host: `test/integration/suite.cjs:388-391`: `dashboardMessage({type:'open', …})` → `editor.document.uri.path.endsWith('/user-auth/spec.md')` | ✅ PASS |
| NAV-12 WHEN clicking a collapsed task row in the panel THEN expand O quê, Onde, Depende de, Done when in place, without opening a file | details rendered in place; no message to the extension | `test/unit/webview.test.ts:106-108`: `aria-expanded='false'`, no `data-file`, no details. `:111`: `deepEqual(click, {view:{expandedTasks:[key]}})`, so no message is sent. `:114-115`: expanded, details `li` rendered. `:119-122`: field texts + 2 unchecked Done when. `:123`: details have no `data-action`. `:128-130`: only warnings or "Abrir no editor" may send `open` | ✅ PASS |
| NAV-13 WHEN clicking an expanded task row THEN collapse its details | key removed; details gone; other expanded rows kept | `test/unit/webview.test.ts:137`: `deepEqual(click, {view:{expandedTasks:[other]}})`. `:139-140`: T5 details count 0, T1 still 1 | ✅ PASS |
| NAV-14 WHEN clicking a warning in the panel THEN open the text editor at the warning line | `open` with the warning line; editor cursor on that line | `test/unit/webview.test.ts:93-94`: exactly one `li.sev-warning[data-action=open][data-line=<line>]`. `:95-97`: `actionFor` → `{type:'open', line: issue.line}`. Host: `test/integration/suite.cjs:391`: `assert.equal(editor.selection.active.line, 11)` for `line: 12`. This kills M5 | ✅ PASS |
| NAV-15 IF a stage has no file THEN show it with no click action and no editor icon | tree: `command === undefined`, not `artifact`; panel step: no action | Tree: `test/integration/suite.cjs:257-259` (`item.command === undefined`, `contextValue !== 'artifact'`) for user-auth/verify, csv-export/design, csv-export/tasks. Panel: `test/unit/webview.test.ts:49` (Verificação step `[null, null]`) | ✅ PASS |
| NAV-16 WHEN Tasks and Execução are both expanded THEN both show the task list with no duplicate-id error | every row id is unique across both subtrees | `test/integration/suite.cjs:366-377`: walks both subtrees. `ids.length > 20` (`:374`), all truthy (`:375`), `deepEqual(dupes, [])` (`:377`) | ✅ PASS |

**Status**: ✅ All ACs covered. 16/16 matched the spec outcome and there are no spec-precision gaps: every AC names a concrete file, mode (preview vs editor), line or collapse state, and `context.md` leaves the icons and labels of detail rows to the agent. Nothing regressed. 8bee305 only appended tests (`suite.cjs` after line 377, `webview.test.ts` after line 141), so every iteration-1 citation is still valid on HEAD.

---

## Discrimination Sensor

Run in a throwaway `git worktree` of HEAD, with `node_modules` linked through a junction. Each mutant was applied alone, the relevant gate was run, and the mutant was reverted before the next one. M1-M3 ran in iteration 1 on ccebb08. The code they mutate and the tests that killed them are byte-identical in 8bee305; `extension.ts` only shifted by one line. M4 was re-run and M5 was added in iteration 2 on 8bee305.

| Mutation | File:line (HEAD) | Description | Killed? |
| -------- | ---------------- | ----------- | ------- |
| M1 | `src/ui/featuresTree.ts:172` | Task row gets its open command back: `item.command = openFileCommand(pid, tasks.md, t.line)` | ✅ Killed: integration NAV-08 (`suite.cjs:346`, "tasks/T1"), iteration 1 |
| M2 | `src/extension.ts:61` | `openInEditor` drops the line: `openUri(uri, target.line)` → `openUri(uri)` | ✅ Killed: integration NAV-04 (`suite.cjs:234`, `0 !== 93`), iteration 1 |
| M3 | `src/webview/render.ts:597` | `toggle-task` never collapses: an expanded key stays in `expandedTasks` | ✅ Killed: unit NAV-13 (`webview.test.ts:137`), iteration 1 |
| M4 | `src/ui/dashboard.ts:66` | Panel host opens the text editor for `previewFile`: `previewUri(uri)` → `openUri(uri)`, unused import dropped | ✅ Killed: integration "NAV-10 (host)" (`suite.cjs:383`, "timed out waiting for: preview of spec.md"), iteration 2. tsc 0 errors, so the kill comes from behaviour. This mutant was the open gap in iteration 1 |
| M5 | `src/ui/dashboard.ts:71` | Panel host drops the line for `open`: `openUri(uri, m.line)` → `openUri(uri)` | ✅ Killed: integration "NAV-11/NAV-14 (host)" (`suite.cjs:391`, `0 !== 11`), iteration 2 |

**Sensor depth**: lightweight. Three behaviour-level mutants on the highest-risk new code, plus two on the host message path (the iteration-1 probe and one new mutant).
**Result**: 5/5 killed

**Isolation**: `git status --porcelain` of the real tree was identical before and after each sensor run. In iteration 2 the only entries were the three untracked Verifier files. The junction was removed with `rmdir`, the real `node_modules` is intact (129 entries), and the worktree was removed.

---

## Interactive UAT Results (if performed)

Not performed. The orchestrator did not request UAT, and a Verifier sub-agent has no interactive channel. The tree, preview and panel-host behaviour is covered by integration tests running in a real VS Code.

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅ New tree code is small: `artifactTarget`, `listsTasks`, `taskDetails`, a `detail` node kind. `previewUri` was pulled out of `featureActions.ts` so there is no duplicate. Fix 1 adds a single test seam (`dashboardMessage`) |
| Surgical changes | ✅ Moving `src/webview/main.ts` into `render.ts` (~560 lines) is a structural move. Diffing old `main.ts` against the new `render.ts` shows the only behaviour changes are the NAV hunks: `previewAttrs` swaps, the `taskRow` toggle, `taskDetailsHtml`, the Arquivos edit button, and a pure `actionFor`. The move is justified because it lets `node --test` cover the panel. Minor noise: `test/fixtures/sample/.specs/lessons.json` was reformatted when `LESSONS.md` was rendered. It is semantically identical (checked with a JSON equality check), and `LESSONS.md` is needed by NAV-03 |
| No scope creep   | ✅ Other panel rows also moved to the preview: overview decision and lesson rows, the design/context blocks, and phase heads. This follows P2 ("mesmas regras da árvore") and Goal 1, and adds no new capability |
| Matches patterns | ✅ `previewFileCommand` mirrors `openFileCommand`. The tree providers and `dashboardMessage` are exposed on `TlcSpecsApi` for tests, in the same way as the existing `dashboardHealth`. Menu and `commandPalette` hiding follows the existing entries |
| Spec-anchored outcome check (asserted values match spec) | ✅ Every AC is asserted at its user-visible outcome: preview tab vs text editor, cursor line, collapse state, id uniqueness |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Both host message routes added or used by the panel (`previewFile`, `open`) are now driven by integration tests (`suite.cjs:380-392`) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ All 19 new tests are named by NAV id (13 integration, 6 unit). No existing test was changed or weakened (the `suite.cjs` and `webview.test.ts` diffs are insertions only) |
| Documented guidelines followed: none - strong defaults applied (no CLAUDE.md, CONTRIBUTING or `.specs/codebase` in the repo) | ✅ |

Nit, not blocking: `render.ts` keeps a module-level mutable `ctx` that `renderApp` reassigns. It is acceptable in the single-threaded webview and in tests, and it keeps the move diff small.

---

## Edge Cases

- [x] Stage with no file (skipped or pending) has no click action and no editor icon. Tree: `test/integration/suite.cjs:258-259`. Panel stepper: `test/unit/webview.test.ts:49`
- [x] Tasks and Execução expanded together have no duplicate ids: `test/integration/suite.cjs:377`. Ids are namespaced by `via` stage in `src/ui/featuresTree.ts:157,168,177`

---

## Gate Check

- **Gate command**: `npx tsc -p .` && `npm test` && `npm run build` && `node test/integration/run.mjs` (on HEAD 8bee305)
- **Result**: 49 passed, 0 failed, 0 skipped (tsc exit 0; unit 25/25; build exit 0; integration 24/24)
- **Test count before feature**: 30 (unit 19 = parsers 9 + project 10; integration 11), counted with `git show e5f0a57:<file>`
- **Test count after feature**: 49 (unit 25 = parsers 9 + project 10 + webview 6; integration 24)
- **Delta**: +19 new tests (6 unit, 13 integration). No test removed or weakened
- **Skipped tests**: none
- **Failures**: none. The "Error mutex already exists" line printed by VS Code is harmless

---

## Fix Plans (if issues found)

None open. Fix 1 from iteration 1 (NAV-10 host half untested, M4 survived) was resolved in 8bee305 and verified in iteration 2: M4 is killed at `test/integration/suite.cjs:383`.

---

## Requirement Traceability Update

The orchestrator applies these statuses in `spec.md`. The Verifier works read-only on everything except this report.

| Requirement | Previous Status | New Status   |
| ----------- | --------------- | ------------ |
| NAV-01 | Implementing | ✅ Verified |
| NAV-02 | Implementing | ✅ Verified |
| NAV-03 | Implementing | ✅ Verified |
| NAV-04 | Implementing | ✅ Verified |
| NAV-05 | Implementing | ✅ Verified |
| NAV-06 | Implementing | ✅ Verified |
| NAV-07 | Implementing | ✅ Verified |
| NAV-08 | Implementing | ✅ Verified |
| NAV-09 | Implementing | ✅ Verified |
| NAV-10 | Implementing | ✅ Verified |
| NAV-11 | Implementing | ✅ Verified |
| NAV-12 | Implementing | ✅ Verified |
| NAV-13 | Implementing | ✅ Verified |
| NAV-14 | Implementing | ✅ Verified |
| NAV-15 | Implementing | ✅ Verified |
| NAV-16 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 ACs matched the spec outcome, 0 spec-precision gaps
**Sensor**: 5/5 mutations killed
**Gate**: 49 passed, 0 failed (tsc ok, unit 25/25, build ok, integration 24/24)

**What works**:
- Tree: stages, files, requirements, phases and Projeto rows open in the Markdown preview.
- "Abrir no editor" lands on the item's line, or line 1 for items without one.
- Warnings still open the editor at their line.
- Tasks and Execução list the tasks by phase, and each task expands into read-only details with Done-when states.
- Task rows have no command. Stages without a file are inert. There are no duplicate ids.
- Panel: every artifact click opens the Markdown preview, now proven end to end through the host handler.
- Panel task rows expand and collapse in place. Warnings and Arquivos buttons open the editor at the line.

**Issues found**: none open. The iteration-1 gap was fixed in 8bee305.

**Next steps**: Update the traceability statuses in `spec.md` to Verified. The feature is done.
