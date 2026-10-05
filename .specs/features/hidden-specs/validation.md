# Hidden Specs Validation

## Validation: hidden-specs - PASS ✅

Approved in iteration 2. All 16 requirements match the spec, with no precision gaps. The three fixes from iteration 1 are closed, with tests only. The five mutants that survived now die on the new assertions. M8 dies at `test/unit/webview.test.ts:303` ("0 hidden"). M11 dies at `:331` (marked completed spec with no eye on the card). M12 dies at `:352` (completed spec not dimmed). H3 dies at `test/integration/suite.cjs:518` (row of the marked completed spec with `feature.done`). H4 dies at `:563` (completed spec's row without "· hidden"). The production code has not changed since iteration 1. The gate stays green: 67 unit, 63 + 1 + 2 integration. Only H5 survives: the wiring of `HiddenSpecs` to `workspaceState`. It is accepted, as the design chose, because no test reopens VS Code (Follow-up 1, optional, for the user).

**Date**: 2026-09-29
**Spec**: `.specs/features/hidden-specs/spec.md`
**Diff range**: 2fb5f23..2c7b475 (branch `feat/hidden-specs`). Fixes in 9de95ea..2c7b475, only in `test/unit/webview.test.ts`, `test/integration/suite.cjs`, and `tasks.md`
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3

---

## Iteration History

| Iteration | HEAD | Outcome | Notes |
| --------- | ---- | ------- | ----- |
| 1 | b556327 | Rejected | 16/16 requirements with evidence, 0 precision gaps. 25/31 killed. Survived: M8, M11, M12, H3, H4 (Fix 1 to Fix 3) and H5, accepted (Follow-up 1). 4 VS Code runs |
| 2 | 2c7b475 | Approved | 16/16 requirements match, 0 precision gaps. Fix 1 to Fix 3 closed: M8 at `webview.test.ts:303`, M11 at `:331`, M12 at `:352`, H3 at `suite.cjs:518`, H4 at `:563`. 30/31 killed. Only H5 survives, accepted. 2 VS Code runs |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Store the marked specs | ✅ Done | 8d7753f. `src/core/hidden.ts`, 6 tests in `test/unit/hidden.test.ts` |
| T2 Top eye and card eye | ✅ Done | fb6ec29. `src/webview/render.ts:143-158`, `:178-188`, `:248-254`, `:265`, `:619-623` |
| T3 Style for the eye and the dimmed card | ✅ Done | 281d733. `media/dashboard.css:82-83`, `:150-151`. The orphaned `.check` rule was removed |
| T4 Marks to the dashboard and card eye to the host | ✅ Done | 5642d4e. `src/ui/dashboard.ts:96-98`, `:117`, `:164-172`. `src/webview/main.ts:30`, `:60`, `:73`. The `change` listener was removed |
| T5 Eye in the Features title | ✅ Done | 474dec9. `src/ui/featuresTree.ts:85-98`, `:267`. `src/extension.ts:61-62`, `:89-94`. `package.json:141-151`, `:225-233` |
| T6 Eye on the spec row | ✅ Done | da9f85c. `src/ui/featuresTree.ts:274-278`. `src/extension.ts:63-64`. `package.json` `view/item/context` and palette |
| T7 Document the eye | ✅ Done | b556327. `README.md`, note in `.specs/features/panel-in-progress/spec.md:60` and in `.specs/features/sidebar-dashboard/spec.md:79` |
| T8 Fix 1: marked completed spec without an eye | ✅ Done | 102a86a. `test/unit/webview.test.ts:330-331`. `test/integration/suite.cjs:516-518`, unmarks at `:522` |
| T9 Fix 2: dimming and "· hidden" only on the marked spec | ✅ Done | 86d277e. `test/unit/webview.test.ts:352`. `test/integration/suite.cjs:563` |
| T10 Fix 3: the zero text | ✅ Done | 2c7b475. `test/unit/webview.test.ts:299-303` |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| HID-01 WHEN the dashboard opens, in the editor tab or the side bar, THEN in place of the checkbox: closed eye, title "Show Hidden Specs", text "N hidden" | button with the closed eye, that title, and the hidden count, on both surfaces; "0 hidden", "1 hidden", "3 hidden" (`spec.md:35`) | **Render:** `test/unit/webview.test.ts:282` - `assert.ok(!html.includes('type="checkbox"'))`. `:284` - `glyph === 'eye-closed'`. `:285` - `title === 'Show Hidden Specs'`. `:286-287` - `aria-pressed` false, `data-show` true. `:289` - `text === '1 hidden'`. `:296-298` - "2 hidden", "2 hidden" (a marked completed spec counts once), "3 hidden". `:303` - `equal(eyeToggle(none).text, '0 hidden')`. **VS Code:** `test/integration/suite.cjs:893` - `deepEqual(side.toggle, { title: 'Show Hidden Specs', text: hiddenLabel(n) })` in the side bar. `:898` - the same in a new tab | ✅ PASS |
| HID-02 WHILE the dashboard eye is closed, the completed specs, the marked specs, and the Completed column stay off the board | cards = not completed and not marked, five stages | **Render:** `test/unit/webview.test.ts:235` - `deepEqual(b.cards, b.open)`. `:236` - five labels without Completed. `:243` - `deepEqual(b.cards, b.open.filter((n) => n !== 'csv-export'))`. **Rule:** `test/unit/hidden.test.ts:73-76`, `isHidden` truth table. **VS Code:** `test/integration/suite.cjs:758`, `:763` (tab). `:910-911` - marked spec off the tab and the side bar | ✅ PASS |
| HID-03 WHEN the closed eye is clicked THEN the hidden specs return, each in its column, with Completed, and the button becomes the open eye "Hide Hidden Specs" | `showHidden: true`; six columns; open eye | **Trigger:** `test/unit/webview.test.ts:287` - the closed eye carries `data-show="true"`. `:320` - `deepEqual(actionFor({ action: 'toggle-hidden', show: 'true' }), { view: { showHidden: true } })`. **Result:** `:249` - `deepEqual(b.doneCards, b.complete)`. `:250`, `:258` - all cards. `:259` - marked spec in Execution. `:251-252` - six columns, the last one Completed. `:262-265` - `eye-open`, "Hide Hidden Specs", `aria-pressed` true, `data-show` false | ✅ PASS (note 1) |
| HID-04 WHEN the open eye is clicked THEN the hidden specs leave again and the closed eye returns | `showHidden: false`; board and eye from HID-01/02 | **Trigger:** `test/unit/webview.test.ts:265` - the open eye carries `data-show="false"`. `:321` - `deepEqual(actionFor({ action: 'toggle-hidden', show: 'false' }), { view: { showHidden: false } })`. **Result:** `:235-237`, `:284-287` | ✅ PASS (note 1) |
| HID-05 WHEN VS Code opens THEN Features lists only the specs that are not hidden and the title shows "Show Hidden Specs" with `eye-closed` | children = not hidden; `showHidden` button visible while the key is not yet written | `test/integration/suite.cjs:433` - `deepEqual(treeNames(), modelNames((f) => f.health !== 'complete'))`. `:434` - `deepEqual(declared('tlcSpecs.showHidden'), { ..., title: 'Show Hidden Specs', icon: '$(eye-closed)' })`. `:436` - `when === 'view == tlcSpecs.features && !tlcSpecs.showHidden'` | ✅ PASS (note 2) |
| HID-06 WHEN "Show Hidden Specs" is clicked THEN it lists all specs and the title shows "Hide Hidden Specs" with `eye` | all children; key `true`; `hideHidden` button | `test/integration/suite.cjs:445` - `deepEqual(opening, [true])` (spies on `setContext`). `:446` - `deepEqual(treeNames(), all)`. `:447` - `hideHidden` with "Hide Hidden Specs" and `$(eye)`. `:448` - `when === 'view == tlcSpecs.features && tlcSpecs.showHidden'` | ✅ PASS |
| HID-07 WHEN "Hide Hidden Specs" is clicked THEN it goes back to listing only the specs that are not hidden | key `false`; children = not hidden | `test/integration/suite.cjs:452` - `deepEqual(closing, [false])`. `:453` - `deepEqual(treeNames(), open)` | ✅ PASS |
| HID-08 WHILE the tree hides the hidden specs and there is at least one, message "T feature(s) · D completed · H hidden" | exact text; no "hidden" part with the eye open | `test/integration/suite.cjs:460` - `` equal(api.featuresViewMessage(), `${base} · ${done} hidden`) ``. `:463` - `done + 1` with one mark. `:465` - `equal(..., base)` with the eye open. `:470` - back again. `:480` - all hidden. `:536`, `:546` | ✅ PASS |
| HID-09 WHILE a spec that is not completed is in view and unmarked, open eye "Hide Spec" on the row and on the card | card: `hide`, "Hide Spec", open eye. Row: `feature` and inline `hideFeature` with `$(eye)` | **Card:** `test/unit/webview.test.ts:326` - `deepEqual(cardEyes(user-auth), [{ action: 'hide', title: 'Hide Spec', glyph: 'eye-open' }])`. **Row:** `test/integration/suite.cjs:498` - `hideFeature` with "Hide Spec" and `$(eye)`. `:501` - inline only on `viewItem == feature`. `:512` - `contextValue === 'feature'`. Existing buttons in all three forms: `:503-505` | ✅ PASS |
| HID-10 WHILE a spec that is not completed is marked, closed eye "Unhide Spec" on the row and on the card | card: `unhide`, "Unhide Spec", closed eye. Row: `feature.hidden` and `unhideFeature` with `$(eye-closed)`. A completed spec, marked or not, has no eye (`spec.md:36`, `:41`) | **Card:** `test/unit/webview.test.ts:327`. Unmarked completed spec: `:328` - `[]`. Marked completed spec: `:331` - `deepEqual(cardEyes(both.get('billing-invoices')!.body), [])`. **Row:** `test/integration/suite.cjs:499`, `:502`, `:513` - `contextValue === 'feature.hidden'`. Unmarked completed spec: `:515` - `'feature.done'`. Marked completed spec: `:518` - `'feature.done'` | ✅ PASS |
| HID-11 WHEN "Hide Spec" is clicked, in the tree or the dashboard, THEN the spec leaves the tree and the boards with the closed eye, and the count goes up by 1 | off the tree, the tab, and the side bar; message and button at +1 | **Tree trigger:** `test/integration/suite.cjs:534` - `hideFeature` with the row. **Card trigger:** `test/unit/webview.test.ts:339-341` - `actionFor(hide)` yields `setHidden` with `hidden: true`. Host: `suite.cjs:906` via the side bar. **Result:** `:535` - tree without csv-export. `:536` - message `done + 1`. `:538-539` - tab without the card and "N+1 hidden". `:910-913` - tab and side bar without the card, both with "N+1 hidden". Change event: `test/unit/hidden.test.ts:53` | ✅ PASS |
| HID-12 WHEN "Unhide Spec" is clicked, in the tree or the dashboard, THEN the spec returns and the count goes down by 1 | back on all three surfaces; original count | **Tree trigger:** `test/integration/suite.cjs:542-543` - open eye and `unhideFeature` with the row. **Card trigger:** `test/unit/webview.test.ts:342-344` - `hidden: false`. Host: `suite.cjs:915` via the tab. **Result:** `:545-549` - tree, message, tab, and button back. `:919-922` - tab and side bar back, original count | ✅ PASS |
| HID-13 WHEN VS Code reopens the same workspace THEN the marked specs stay hidden | a new instance over the same state sees the marks | `test/unit/hidden.test.ts:26` - `equal(reopened.isMarked(auth), true)` on a new instance over the same `Memento`. `:28` - saved keys. `:39` - unmarking removes the key from the state. `:45` - the mark belongs to the specs folder. Wiring to `workspaceState`: `src/extension.ts:44`, untested | ✅ PASS (note 3; H5 accepted) |
| HID-14 WHILE the general eye is open, the marked spec's card is dimmed and its row has "· hidden" | `is-hidden` class with lower opacity and " · hidden" only on the marked spec; the completed spec is neither dimmed nor suffixed (`spec.md:38`) | **Card:** `test/unit/webview.test.ts:349` - `cls === 'card h-ok is-hidden'`. `:350` - unmarked, `'card h-ok'`. `:352` - completed, `'card h-complete'`. `:358-359` - a `.card.is-hidden` rule with opacity < 1. **Row:** `test/integration/suite.cjs:559` - unmarked, `doesNotMatch(/hidden/)`. `:561` - `match(/ · hidden$/)`. `:563` - completed, `doesNotMatch((await rowOf('billing-invoices')).description, /hidden/)` | ✅ PASS |
| HID-15 WHEN a marked spec is opened from the tree or from a notification THEN its detail shows with the eye closed | detail of the marked spec with `showHidden: false` | **Render:** `test/unit/webview.test.ts:315-316` - `DEFAULT_VIEW` with csv-export marked and selected shows the detail title. **VS Code:** `test/integration/suite.cjs:1125-1127` - marks, `showFeature`, and `r.detail === 'csv-export'` in the side bar. `:1128` - `equal(report.toggle, null)` | ✅ PASS (note 4) |
| HID-16 IF all specs of a single project are hidden and the tree hides them THEN empty list, HID-08 message, no welcome view | `[]`; message with H = T; welcome view only when there are no specs | `test/integration/suite.cjs:479` - `deepEqual(api.featuresTree.getChildren(), [])`. `:480` - `` `${T} feature(s) · ${D} completed · ${T} hidden` ``. `:482-485` - Features `viewsWelcome` only with `!tlcSpecs.hasSpecs` | ✅ PASS |

**Status**: ✅ All ACs covered. 16/16 match the spec. 0 precision gaps. G1, G2, and G3 from iteration 1 closed.

### Notes

1. **HID-03/HID-04, the eye click.** The chain has three links. The button carries `data-show` with the next state (`src/webview/render.ts:158`), pinned in both directions (`test/unit/webview.test.ts:265`, `:287`). The click takes the path every button shares: `closest('[data-action]')` and `activate(el)` (`src/webview/main.ts:86-89`), which calls `actionFor(el.dataset)` and applies the `view` (`:79-84`). `actionFor` decides (`render.ts:619-620`), pinned in both directions (`:320-321`). **Judgment on the limit accepted in panel-in-progress:** it still holds, and it got narrower. Integration still does not fire DOM events on the page (`ToWebview` only carries `state` and `select`, `src/core/protocol.ts:34-36`). But the checkbox's own glue is gone: the `change` listener and the `data` parameter of `activate` were removed, and with them mutants G1 to G5 from that validation. The top eye and the card eye use the same click as every other control. What remains untested is that shared glue, the same glue already accepted for NAV-12. The new page-side part that integration reaches: `hidden = msg.hidden` (`main.ts:30`), without which the cards at `suite.cjs:908-911` do not leave, and the report's `toggle` (`main.ts:60`, `:73`), compared at `suite.cjs:893` and `:898`.
2. **HID-05/HID-06, the title button.** Integration does not read the title bar. The proof combines each button's `when` (`suite.cjs:436`, `:448`) with the value the extension writes to the key, spied on through `executeCommand` (`:445`, `:452`). On open the key is never written (`src/ui/featuresTree.ts:75`), and a missing key is false in VS Code, so `!tlcSpecs.showHidden` holds. H1, the inverted key, dies at `:445`, as the design predicted (`design.md:124`).
3. **HID-13, the wiring to `workspaceState`.** The unit test proves the rule with a fake `Memento` read by a new instance (`test/unit/hidden.test.ts:22-29`). M2b, which writes an empty list, dies at `:26` and `:39`. The wiring is one line: `new HiddenSpecs(context.workspaceState)` (`src/extension.ts:44`). H5 swaps `workspaceState` for an in-memory state and passed the whole suite in iteration 1. No test reopens VS Code: each suite uses a fresh `--user-data-dir` and deletes it at the end (`test/integration/run.mjs:22-24`, `:30`, `:36`). The design chose this proof (`design.md:133`), and the orchestrator kept that choice. Accepted. Reading the code confirms the line, and Follow-up 1 records the stronger proof.
4. **HID-15, the notification.** Integration opens the marked spec via `showFeature` (`suite.cjs:1126`). The phase notification calls the same `dashboard.showSide` (`src/extension.ts:51` and `:66`), and SIDE-02 proves the notification button (`suite.cjs:1090`). The host does not filter marks in `showSide`. The detail rule lives in the page, pinned with the eye closed (`test/unit/webview.test.ts:316`, M16 dies). Accepted by the same composition as PNL-05.
5. **Lessons checked.** L-002: the dashboard is asserted on the rendered cards and button, the tree on its children, the `TreeItem`, and the view message. L-006: no new watcher, so it does not apply. L-009: HID-11 and HID-12 are driven by the tree row (command with the node) and by the card (`actionFor` and the host message, via the side bar and the tab), and HID-15 by the tree and the notification (note 4). L-014: the report's new `toggle` field shows up filled (`suite.cjs:893`) and `null` (`:1128`). The open eye's title is only seen in the unit test (`:263`), because of the limit in note 1. No confirmed lesson recurred. The three candidates from iteration 1 (L-020, L-021, L-022) now hold in the tests: the marked completed spec (`:331`, `suite.cjs:518`), completed specs left undimmed and untagged (`:352`, `suite.cjs:563`), and zero (`:303`).

---

## Discrimination Sensor

Fresh scratch in iteration 2: `git worktree add --detach <scratchpad>/wt-hid HEAD` (2c7b475), with a `node_modules` junction to the real one. Mutation by exact text replacement, requiring a single occurrence, applied by script and undone with `git checkout -- .` in the scratch. Scratch `git status --porcelain` empty after each revert. No `git stash`. The production code has not changed since iteration 1, so the same replacements apply. I reran the 24 M mutations against the unit tests to confirm the kills and update the lines. In integration I ran only H3 and H4. H1, H7, H10, and H2 carry over from iteration 1: the code and the assertions that kill them did not change, only the lines for H10 and H2. H5 stays accepted. A single table.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/core/hidden.ts:43` | `set` without the early return: notifies even when nothing changes | ✅ Killed (`test/unit/hidden.test.ts:55`) |
| M2 | `src/core/hidden.ts:46` | `memento.update` removed | ✅ Killed (typecheck: TS6133, `memento` orphaned). An artifact of the mutation's shape. The kill that counts is M2b |
| M2b | `src/core/hidden.ts:46` | Writes `[]` in place of the marks | ✅ Killed (`hidden.test.ts:26`, `:39`) |
| M3 | `src/core/hidden.ts:29` | Reads the state without filtering for strings | ✅ Killed (`hidden.test.ts:67`) |
| M4 | `src/core/hidden.ts:19` | `isHidden` with `&&` in place of `\|\|` | ✅ Killed (`hidden.test.ts:73`; `webview.test.ts:243`, `:266`, `:289`, `:296`) |
| M5 | `src/webview/render.ts:28` | `DEFAULT_VIEW.showHidden: true` | ✅ Killed (`webview.test.ts:284`) |
| M6 | `src/webview/render.ts:178` | The board filter ignores the marks | ✅ Killed (`:243`) |
| M7 | `src/webview/render.ts:143` | The hidden count ignores the marks | ✅ Killed (`:266`, `:296`) |
| M8 | `src/webview/render.ts:158` | Plural with `hidden <= 1`: zero gets the singular form | ✅ Killed in iteration 2 (`webview.test.ts:303`). Still alive in iteration 1 (G3) |
| M9 | `src/webview/render.ts:158` | `data-show="${show}"`: the eye does not toggle | ✅ Killed (`:265`, `:287`) |
| M10 | `src/webview/render.ts:145` | Eye titles swapped | ✅ Killed (`:263`, `:285`) |
| M11 | `src/webview/render.ts:249` | Marked completed spec gets "Unhide Spec" on the card | ✅ Killed in iteration 2 (`webview.test.ts:331`). Still alive in iteration 1 (G1) |
| M12 | `src/webview/render.ts:265` | `is-hidden` by `hiddenOf`: completed specs are dimmed | ✅ Killed in iteration 2 (`webview.test.ts:352`). Still alive in iteration 1 (G2) |
| M13 | `src/webview/render.ts:620` | `showHidden: d.show !== 'true'` | ✅ Killed (`:320`) |
| M14 | `src/webview/render.ts:623` | `hidden: d.action === 'unhide'` | ✅ Killed (`:339`) |
| M15 | `src/webview/render.ts:249` | No card has an eye | ✅ Killed (`:326`) |
| M16 | `src/webview/render.ts:114` | The detail rejects a marked spec with the eye closed | ✅ Killed (`:316`) |
| M17 | `media/dashboard.css:150` | `.card.is-hidden { opacity: 1; }` | ✅ Killed (`:359`) |
| M18 | `src/webview/render.ts:185` | `five-stages` inverted | ✅ Killed (`:237`, `:253`) |
| M19 | `src/webview/render.ts:188` | Completed column only with the open eye, inverted | ✅ Killed (8 tests, starting with `:162`, `:236`, `:244`, `:249`) |
| M20 | `src/webview/render.ts:158` | Top eye icons swapped | ✅ Killed (`:262`, `:284`) |
| M21 | `src/webview/render.ts:158` | `aria-pressed` inverted | ✅ Killed (`:264`, `:286`) |
| M22 | `src/webview/render.ts:253` | "Hide Spec" with the closed eye | ✅ Killed (`:326`) |
| M23 | `src/webview/render.ts:241` | "Preview" uses the eye again | ✅ Killed (`:335`) |
| H1 | `src/ui/featuresTree.ts:87` | Inverted context key: `!show` | ✅ Killed in iteration 1 (`test/integration/suite.cjs:445`, `[false]` instead of `[true]`) |
| H7 | `src/ui/featuresTree.ts:93` | `outOfTree` counts the hidden specs with the eye open | ✅ Killed in iteration 1 (`suite.cjs:465`, "9 feature(s) · 1 completed · 2 hidden" instead of the base) |
| H10 | `src/extension.ts:63` | `hideFeature` writes `false` | ✅ Killed in iteration 1 (`suite.cjs:531` at b556327, now `:535`: csv-export stays in the tree) |
| H2 | `src/ui/dashboard.ts:172` | A new mark only redraws the tab, not the side bar | ✅ Killed in iteration 1 (`suite.cjs:903` at b556327, now `:909`: "timed out waiting for: csv-export to leave the side panel") |
| H3 | `src/ui/featuresTree.ts:276` | `contextValue` checks the mark before completion: a marked completed spec gets `unhideFeature` | ✅ Killed in iteration 2 (`suite.cjs:518`, `'feature.hidden'` instead of `'feature.done'`). Still alive in iteration 1 (G1) |
| H4 | `src/ui/featuresTree.ts:278` | "· hidden" by `isHidden`: completed specs get the suffix | ✅ Killed in iteration 2 (`suite.cjs:563`, the billing-invoices description matches `/hidden/`). Still alive in iteration 1 (G2) |
| H5 | `src/extension.ts:44` | `HiddenSpecs` over an in-memory state, outside `workspaceState` | ⚠️ Survived, accepted (note 3, Follow-up 1) |

**Sensor depth**: extended lightweight (default, no P0 path). 24 mutations in the unit tests, all rerun at 2c7b475. 7 in the host: 2 rerun, 4 kept from iteration 1, 1 accepted.
**Result**: 30/31 killed. The only survivor is H5, accepted under note 3. PASS ✅.

**Runs that opened VS Code** in iteration 2, out of the 3 allowed, all on the hidden desktop, in the foreground, one at a time:

| # | Run | Worktree | Result |
| - | -------- | ------ | --------- |
| 1 | Gate, no mutation | scratch (2c7b475) | 63/63 + 1/1 + 2/2 |
| 2 | H3 + H4 together | scratch | 61/63 + 1/1 + 2/2. Only HID-09/10 (`:518`) and the tree's HID-14 (`:563`) |

That makes 2 runs. H3 only changes the `contextValue`, and H4 only changes the row description. Each fails in its own test and on the new assertion, and no other test failed. I checked both in the scratch's `dist/extension.cjs`, and the logs show the extension loaded from it. Iteration 1 used 4 runs.

**Isolation**: `git status --porcelain` of the real worktree empty before the sensor and empty after. HEAD stayed at 2c7b475, branch `feat/hidden-specs`. Junction removed without recursion (`[System.IO.Directory]::Delete(..., $false)`), then `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the real worktree. Real `node_modules` with 131 entries before and after, `npm ls --depth=0` exit 0.

---

## Interactive UAT Results (if performed)

Not performed. The Verifier runs without a user. The spec's independent test (`spec.md:71`, `:90`) is left to the orchestrator. It covers the click inside the page by hand (note 1).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `src/core/hidden.ts` has 54 lines. The rest are targeted changes. `featureActions` gained an `extra` parameter to put the eye in the same button group on the card |
| Surgical changes | ✅ Only what replacing the checkbox with the eye left orphaned was removed: the CSS `.check` rule, the `change` listener, and the `data` parameter of `activate` in `src/webview/main.ts`. The iteration 2 fixes only add assertions to existing tests |
| No scope creep | ✅ One small extra: `showHidden` and `hideHidden` also appear in the palette when there are specs (`package.json:226-233`). The spec neither asks for nor forbids it |
| Matches patterns | ✅ `HiddenSpecs` lives in `src/core` without `vscode`, like the other pure modules. The new `actionFor` cases follow the old ones. The tests follow `webview.test.ts` and `suite.cjs`, with a `finally` that unmarks, billing-invoices included (`suite.cjs:522`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ Titles, icons, texts, and message asserted with the spec's exact value, "0 hidden" included |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Core and webview 1:1 with the ACs. The edges of the assumptions now have tests: marked completed spec, completed spec with the eye open, and zero |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Every new test has an HID ID in its title, except `hidden.test.ts:65`, which is T1's Done when and the design's error row |
| Documented guidelines followed: none - strong defaults applied (`tasks.md:18`) | ✅ |

Deviations from the design, with no effect on behavior: `outOfTree()` instead of `hiddenCount()` and the `showHidden` getter (`design.md:74-75`). The `when` clauses use the explicit list `feature || feature.hidden || feature.done` instead of `viewItem =~ /^feature/` (`design.md:47`), and the test pins the explicit form.

**Test integrity (2fb5f23..b556327)**: no test removed. `test/unit/webview.test.ts`: from 14 to 22 tests, from 56 to 88 assertions. `test/integration/suite.cjs`: from 53 to 63 cases, from 176 to 228 assertions. `test/unit/hidden.test.ts`: new, 6 tests, 17 assertions. 6 assertion lines were removed. Four were for the checkbox: PNL-01 (the checkbox exists and is checked) and PNL-04 (`toggle-done` in both directions). They became the eye's assertions, at the same strength or stronger. The other two belong to NAV-01, only reindented inside the `try`, unchanged.

**Test integrity (9de95ea..2c7b475)**: no test added or removed. `webview.test.ts` went from 88 to 91 assertions, and `suite.cjs` from 228 to 230. One assertion line was removed: the one for the HID-14 marked card. It came back unchanged through a variable (`const marked`, `webview.test.ts:348-349`), so the new assertion reads the same board. No assertion got weaker.

---

## Edge Cases

- [x] HID-15 A marked spec opened from the tree or a notification shows its detail with the eye closed: `test/unit/webview.test.ts:315-316`, `test/integration/suite.cjs:1125-1128` (note 4)
- [x] HID-16 Single project with everything hidden: empty list, HID-08 message, no welcome view: `test/integration/suite.cjs:479-485`
- [x] Assumption "a completed spec has no eye", with the marked completed spec: `test/unit/webview.test.ts:331`, `test/integration/suite.cjs:518`
- [x] Assumption "0 hidden": `test/unit/webview.test.ts:303`

---

## Gate Check

- **Gate command**: `npm run typecheck && npm test && npm run test:integration` (integration on the hidden desktop)
- **Typecheck**: exit 0 (scratch at 2c7b475)
- **Unit**: 67 passed, 0 failed, 0 skipped
- **Integration**: 63/63 in `suite.cjs`, 1/1 in `startup.cjs`, 2/2 in `multiroot.cjs` (exit 0, run 1 of iteration 2)
- **Test count before feature**: 53 unit + 56 integration (53 + 1 + 2, at 2fb5f23)
- **Test count after feature**: 67 unit + 66 integration (63 + 1 + 2)
- **Delta**: +14 unit (6 in `hidden.test.ts`, 8 in `webview.test.ts`), +10 integration (7 in Features, 3 in the dashboard). The iteration 2 fixes only added assertions
- **Skipped tests**: none
- **Failures**: none

The author's numbers check out.

---

## Fix Plans (if issues found)

### Fix 1: marked completed spec without an eye (G1: M11, H3) - closed

- **Resolution**: 102a86a (T8). `test/unit/webview.test.ts:330-331` draws the board with csv-export and billing-invoices marked and asserts empty `cardEyes` for billing-invoices. `test/integration/suite.cjs:516-518` marks billing-invoices and asserts `contextValue === 'feature.done'`. The `finally` unmarks it (`:522`).
- **Done when checked**: M11 fails `npm test` at `:331`. H3 fails integration at `suite.cjs:518`. The gate stays green.

### Fix 2: dimming and "· hidden" only on the marked spec (G2: M12, H4) - closed

- **Resolution**: 86d277e (T9). `test/unit/webview.test.ts:352` asserts `'card h-complete'` for billing-invoices with the eye open. `test/integration/suite.cjs:563` asserts that the billing-invoices description does not contain "hidden" with the eye open.
- **Done when checked**: M12 fails `npm test` at `:352`. H4 fails integration at `suite.cjs:563`. The gate stays green.

### Fix 3: the zero text (G3: M8) - closed

- **Resolution**: 2c7b475 (T10). `test/unit/webview.test.ts:299-303` draws the sample with only the specs that are not completed and no marks, and asserts "0 hidden".
- **Done when checked**: M8 fails `npm test` at `:303`. The gate stays green.

### Follow-up 1 (optional, non-blocking): prove the wiring to `workspaceState` (H5)

- **Root cause**: no test reopens VS Code. The runner creates a fresh `--user-data-dir` per suite (`test/integration/run.mjs:22-24`, `:30`).
- **Fix task**: a two-phase run with the same `--user-data-dir` and the same workspace folder. The first phase marks csv-export from the tree row. The second reopens and asserts that the tree starts without it. It changes the runner, so it needs the user's decision.
- **Done when**: H5 fails in the second phase.
- **Priority**: Minor

---

## Requirement Traceability Update

The Verifier does not edit `spec.md`. Proposed statuses:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HID-01 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| HID-02 | Implementing | ✅ Verified |
| HID-03 | Implementing | ✅ Verified |
| HID-04 | Implementing | ✅ Verified |
| HID-05 | Implementing | ✅ Verified |
| HID-06 | Implementing | ✅ Verified |
| HID-07 | Implementing | ✅ Verified |
| HID-08 | Implementing | ✅ Verified |
| HID-09 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| HID-10 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| HID-11 | Implementing | ✅ Verified |
| HID-12 | Implementing | ✅ Verified |
| HID-13 | Implementing | ✅ Verified (note 3) |
| HID-14 | Implementing (iteration 1 proposed Needs Fix) | ✅ Verified |
| HID-15 | Implementing | ✅ Verified |
| HID-16 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 requirements match the spec. 0 precision gaps
**Sensor**: 30/31 killed. The only survivor is H5, accepted (note 3, Follow-up 1)
**Gate**: typecheck ok, 67 unit, 63 + 1 + 2 integration, 0 failures

**What works**: the dashboard opens with the closed eye and the hidden count, in the editor tab and in the side bar, and shows "0 hidden" when there are none. The board leaves out the completed specs, the marked ones, and the Completed column. The eye toggles `showHidden` in both directions and brings the hidden specs back to their columns. Features opens without the hidden specs, and the title eye lists them all and hides them again, with the right context key. The message counts the hidden specs only with the eye closed. The row eye and the card eye mark and unmark, and the spec leaves and returns to the tree, the tab, and the side bar, with the right counts. A completed spec has no eye, not even when marked. Only the marked spec is dimmed and gets "· hidden". A marked spec opens in the detail with the eye closed. The marks persist in a new instance over the same `Memento`. No test was removed, and no assertion was loosened.

**Issues found**: none blocking. The wiring to `workspaceState` is still proven only by reading the code (Follow-up 1, optional).

**Next steps**: update the `spec.md` statuses to Verified. Run the spec's independent test with the user (UAT), which covers the click inside the page. Decide whether Follow-up 1 goes in.
