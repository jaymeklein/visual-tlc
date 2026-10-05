// Dashboard behaviour (spec: .specs/features/readonly-navigation/spec.md, story P2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { actionFor, DEFAULT_VIEW, renderApp, taskDetailsHtml, taskKey, type RenderCtx } from '../../src/webview/render.ts';
import { loadProject } from '../../src/core/project.ts';
import { hiddenKey } from '../../src/core/hidden.ts';
import { nodeReader, SAMPLE_SPECS } from './nodeReader.ts';

interface Tag {
  tag: string;
  attrs: Record<string, string>;
}

/** Opening tags with their attributes (the renderer always double-quotes and escapes values). */
function tags(html: string): Tag[] {
  const out: Tag[] = [];
  for (const m of html.matchAll(/<([a-z][\w-]*)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/g)) {
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? '';
    out.push({ tag: m[1], attrs });
  }
  return out;
}

async function detailOf(feature: string, expandedTasks: string[] = []): Promise<{ html: string; ctx: RenderCtx }> {
  const project = await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
  const ctx: RenderCtx = {
    projects: [project],
    now: Date.now(),
    loaded: true,
    hidden: [],
    shown: [],
    view: { selected: { projectId: 'sample', feature }, query: '', showHidden: true, expandedTasks },
  };
  return { html: renderApp(ctx), ctx };
}

const by = (list: Tag[], attrs: Record<string, string>) => list.filter((t) => Object.entries(attrs).every(([k, v]) => t.attrs[k] === v));

test('NAV-10 stepper steps, "open X.md" links, requirement, story and file rows open the preview', async () => {
  const { html, ctx } = await detailOf('user-auth');
  const t = tags(html);

  const steps = t.filter((x) => x.tag === 'li' && (x.attrs.class ?? '').startsWith('step '));
  assert.deepEqual(
    steps.map((s) => [s.attrs['data-action'] ?? null, s.attrs['data-file'] ?? null]),
    [
      ['preview-file', 'features/user-auth/spec.md'],
      ['preview-file', 'features/user-auth/design.md'],
      ['preview-file', 'features/user-auth/tasks.md'],
      ['preview-file', 'features/user-auth/tasks.md'],
      [null, null], // Verification: no validation.md yet
    ],
  );

  for (const file of ['tasks.md', 'spec.md']) {
    const links = by(t, { 'data-action': 'preview-file', 'data-file': `features/user-auth/${file}` }).filter((x) => x.tag === 'button');
    assert.equal(links.length, 1, `open ${file} link`);
  }

  const feature = ctx.projects[0].features.find((f) => f.name === 'user-auth')!;
  const specRows = by(t, { 'data-action': 'preview-file', 'data-file': 'features/user-auth/spec.md' }).filter((x) => x.tag === 'li');
  const expectedSpecRows = feature.spec!.requirements.length + feature.spec!.stories.length + 2; // + Spec step + Files row
  assert.equal(specRows.length, expectedSpecRows, 'requirement + story rows (+ Spec step + Files row) preview spec.md');

  for (const f of feature.files) {
    assert.equal(by(t, { 'data-action': 'preview-file', 'data-file': f.path }).filter((x) => x.tag === 'li' && !x.attrs.class?.startsWith('step')).length >= 1, true, f.path);
  }

  const billing = tags((await detailOf('billing-invoices')).html);
  const verifyStep = billing.filter((x) => x.tag === 'li' && (x.attrs.class ?? '').startsWith('step s-done')).at(-1)!;
  assert.equal(verifyStep.attrs['data-action'], 'preview-file');
  assert.equal(verifyStep.attrs['data-file'], 'features/billing-invoices/validation.md');

  assert.deepEqual(actionFor({ action: 'preview-file', pid: 'sample', file: 'features/user-auth/spec.md' }), {
    message: { type: 'previewFile', projectId: 'sample', file: 'features/user-auth/spec.md' },
  });
});

test('NAV-11 Files rows carry an "Open in Editor" button that opens the text editor', async () => {
  const { html, ctx } = await detailOf('user-auth');
  const t = tags(html);
  const feature = ctx.projects[0].features.find((f) => f.name === 'user-auth')!;
  for (const f of feature.files) {
    const buttons = by(t, { 'data-action': 'open', 'data-file': f.path, title: 'Open in Editor' }).filter((x) => x.tag === 'button');
    assert.equal(buttons.length, 1, f.path);
  }
  assert.deepEqual(actionFor({ action: 'open', pid: 'sample', file: 'features/user-auth/context.md' }), {
    message: { type: 'open', projectId: 'sample', file: 'features/user-auth/context.md', line: undefined },
  });
});

test('NAV-14 dashboard warnings open the text editor at the warning line', async () => {
  const { html, ctx } = await detailOf('user-auth');
  const issue = ctx.projects[0].features.find((f) => f.name === 'user-auth')!.issues.find((i) => i.message.startsWith('Requirement(s) without a task'))!;
  const rows = by(tags(html), { class: 'sev-warning', 'data-action': 'open', 'data-file': issue.file!, 'data-line': String(issue.line) });
  assert.equal(rows.length, 1);
  assert.deepEqual(actionFor({ action: 'open', pid: 'sample', file: issue.file, line: String(issue.line) }), {
    message: { type: 'open', projectId: 'sample', file: issue.file, line: issue.line },
  });
});

test('NAV-12 clicking a collapsed task row expands its details in place, without opening a file', async () => {
  const key = taskKey('sample', 'user-auth', 'T5');
  const collapsed = await detailOf('user-auth');
  const row = by(tags(collapsed.html), { 'data-action': 'toggle-task', 'data-key': key });
  assert.equal(row.length, 1, 'T5 row toggles');
  assert.equal(row[0].tag, 'li');
  assert.equal(row[0].attrs['aria-expanded'], 'false');
  assert.equal(row[0].attrs['data-file'], undefined, 'task row carries no file to open');
  assert.equal(by(tags(collapsed.html), { class: 'task-details', 'data-key': key }).length, 0, 'details hidden while collapsed');

  const click = actionFor({ action: 'toggle-task', key }, []);
  assert.deepEqual(click, { view: { expandedTasks: [key] } }, 'expands, sends no message to the extension');

  const expanded = await detailOf('user-auth', click.view!.expandedTasks);
  assert.equal(by(tags(expanded.html), { 'data-action': 'toggle-task', 'data-key': key })[0].attrs['aria-expanded'], 'true');
  assert.equal(by(tags(expanded.html), { class: 'task-details', 'data-key': key }).length, 1, 'details rendered in place');

  const t5 = expanded.ctx.projects[0].features.find((f) => f.name === 'user-auth')!.tasks!.tasks.find((t) => t.id === 'T5')!;
  const details = taskDetailsHtml(t5);
  for (const text of ['What', 'Lock account for 15 minutes after 5 failures', 'Where', 'src/auth/auth.service.ts (modify)', 'Depends on', 'T4', 'Done when', '6th attempt returns 423', 'Gate check passes: npm run test:unit']) {
    assert.ok(details.includes(text), `details show "${text}"`);
  }
  assert.equal(by(tags(details), { class: 'check-item unchecked' }).length, 2, 'two unchecked Done when items');
  assert.ok(!details.includes('data-action'), 'details are read-only');

  // Only warnings and the explicit "Open in Editor" buttons may open the text editor.
  const opens = by(tags(expanded.html), { 'data-action': 'open' });
  assert.ok(opens.length > 0);
  for (const el of opens) {
    assert.ok(/^sev-/.test(el.attrs.class ?? '') || el.attrs.title === 'Open in Editor', `unexpected editor opener: ${JSON.stringify(el.attrs)}`);
  }
});

test('NAV-13 clicking an expanded task row collapses its details', async () => {
  const key = taskKey('sample', 'user-auth', 'T5');
  const other = taskKey('sample', 'user-auth', 'T1');
  const click = actionFor({ action: 'toggle-task', key }, [other, key]);
  assert.deepEqual(click, { view: { expandedTasks: [other] } });
  const { html } = await detailOf('user-auth', click.view!.expandedTasks);
  assert.equal(by(tags(html), { class: 'task-details', 'data-key': key }).length, 0, 'T5 collapsed');
  assert.equal(by(tags(html), { class: 'task-details', 'data-key': other }).length, 1, 'T1 stays expanded');
});

test('NAV-10 "open validation.md" and "open STATE.md" links open the preview', async () => {
  const billing = tags((await detailOf('billing-invoices')).html);
  assert.equal(by(billing, { 'data-action': 'preview-file', 'data-file': 'features/billing-invoices/validation.md' }).filter((x) => x.tag === 'button').length, 1);

  const { ctx } = await detailOf('user-auth');
  const overview = tags(renderApp({ ...ctx, view: { ...ctx.view, selected: null } }));
  assert.equal(by(overview, { 'data-action': 'preview-file', 'data-file': 'STATE.md' }).filter((x) => x.tag === 'button').length, 1);
});

// Side bar panel (spec: .specs/features/sidebar-dashboard/spec.md).

test('SIDE-04 board stages without features are marked is-empty, the others are not', async () => {
  const project = await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, hidden: [], shown: [], view: { selected: null, query: 'user-auth', showHidden: true, expandedTasks: [] } });
  const columns = [...html.matchAll(/<div class="column([^"]*)" role="listitem" aria-label="([^"]+)">([\s\S]*?)(?=<div class="column[ "]|$)/g)];
  assert.equal(columns.length, 6);
  const withCards = columns.filter((c) => c[3].includes('class="card '));
  assert.deepEqual(withCards.map((c) => c[2]), ['Execution']);
  for (const [, cls, label, body] of columns) {
    assert.equal(cls.split(' ').includes('is-empty'), !body.includes('class="card '), label);
  }
});

test('SIDE-03/SIDE-04 the stylesheet stacks the board and hides the empty stages under 700px, and only there', () => {
  const css = readFileSync(join(import.meta.dirname, '..', '..', 'media', 'dashboard.css'), 'utf8').replace(/\r\n/g, '\n');
  const blocks = [...css.matchAll(/^@media \(max-width: (\d+)px\) \{\n([\s\S]*?)\n\}/gm)].map(([, width, body]) => ({ width, body }));
  const narrow = blocks.filter((b) => b.body.includes('.board {') || b.body.includes('.column.is-empty'));
  assert.deepEqual(
    narrow.map((b) => b.width),
    ['699'],
  );
  assert.ok(narrow[0].body.includes('.board { grid-template-columns: minmax(0, 1fr); overflow-x: visible; }'));
  assert.ok(narrow[0].body.includes('.column.is-empty { display: none; }'));
  assert.ok(narrow[0].body.includes('h3 { flex-wrap: wrap; }'), 'section headings must wrap in the narrow layout');
  const outside = css.replace(narrow[0].body, '');
  assert.ok(outside.includes('.board { display: grid; grid-template-columns: repeat(6, minmax(200px, 1fr));'));
  assert.ok(!outside.includes('.column.is-empty'));
});


// Panel in progress (spec: .specs/features/panel-in-progress/spec.md) and hidden specs (spec: .specs/features/hidden-specs/spec.md).
// The "Hide Completed" option became the eye of hidden-specs: closed is the old option checked.

const sampleProject = () => loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
const mark = (...names: string[]) => names.map((name) => hiddenKey('sample', name));
/** Keys of completed specs kept in view by their eye (eye-on-every-spec). */
const show = (...names: string[]) => names.map((name) => hiddenKey('sample', name));

/** Eye of the top bar: its attributes, the glyph it draws and its text. */
function eyeToggle(html: string) {
  const all = [...html.matchAll(/<button class="btn-ghost eye-toggle"([^>]*)>([\s\S]*?)<\/button>/g)];
  assert.equal(all.length, 1, 'one eye in the top bar');
  const [open] = tags(`<button${all[0][1]}>`);
  const body = all[0][2];
  return { attrs: open.attrs, glyph: body.match(/class="ic (eye-open|eye-closed)"/)?.[1], text: body.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim() };
}

/** Each card by feature name: its classes and its markup up to the next card. */
function cardsOf(html: string): Map<string, { cls: string; body: string }> {
  const out = new Map<string, { cls: string; body: string }>();
  for (const chunk of html.split('<div class="card ').slice(1)) {
    out.set(chunk.match(/<span class="card-name">([^<]+)<\/span>/)![1], { cls: `card ${chunk.slice(0, chunk.indexOf('"'))}`, body: chunk });
  }
  return out;
}

/** Eye buttons of a card: data-action, title and glyph. */
const cardEyes = (body: string) =>
  [...body.matchAll(/<button class="icon-btn sm" data-action="(hide|unhide)"[^>]*title="([^"]+)"[^>]*>(<svg class="ic ([\w-]+)")/g)].map((m) => ({ action: m[1], title: m[2], glyph: m[4] }));

async function board(showHidden: boolean, hidden: string[] = [], shown: string[] = []) {
  const project = await sampleProject();
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, hidden, shown, view: { selected: null, query: '', showHidden, expandedTasks: [] } });
  const columns = [...html.matchAll(/<div class="column[^"]*" role="listitem" aria-label="([^"]+)">([\s\S]*?)(?=<div class="column[ "]|$)/g)];
  const cards = (body: string) => [...body.matchAll(/<span class="card-name">([^<]+)<\/span>/g)].map((m) => m[1]).sort();
  return {
    html,
    boardClass: tags(html).find((t) => t.attrs.role === 'list')!.attrs.class,
    labels: columns.map((c) => c[1]),
    cards: columns.flatMap((c) => cards(c[2])).sort(),
    doneCards: cards(columns.find((c) => c[1] === 'Completed')?.[2] ?? ''),
    stage: (label: string) => cards(columns.find((c) => c[1] === label)?.[2] ?? ''),
    complete: project.features.filter((f) => f.health === 'complete').map((f) => f.name).sort(),
    open: project.features.filter((f) => f.health !== 'complete').map((f) => f.name).sort(),
  };
}

test('PNL-02/PNL-03/HID-02 with the eye closed the board leaves out the completed cards and the Completed column, in five stages', async () => {
  const b = await board(false);
  assert.ok(b.complete.length > 0, 'the sample has no completed feature');
  assert.deepEqual(b.cards, b.open);
  assert.deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execution', 'Verification']);
  assert.equal(b.boardClass, 'board five-stages');
});

test('HID-02 with the eye closed a spec marked as hidden is off the board too', async () => {
  const b = await board(false, mark('csv-export'));
  assert.ok(b.open.includes('csv-export'), 'csv-export is completed in the sample');
  assert.deepEqual(b.cards, b.open.filter((n) => n !== 'csv-export'));
  assert.deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execution', 'Verification']);
});

test('PNL-04/HID-03 with the eye open the Completed column holds the completed cards, in six stages', async () => {
  const b = await board(true);
  assert.deepEqual(b.doneCards, b.complete);
  assert.deepEqual(b.cards, [...b.open, ...b.complete].sort());
  assert.equal(b.labels.length, 6);
  assert.equal(b.labels[5], 'Completed');
  assert.equal(b.boardClass, 'board');
});

test('HID-03 with the eye open the marked spec is back in its stage and the top bar shows the open eye', async () => {
  const b = await board(true, mark('csv-export'));
  assert.deepEqual(b.cards, [...b.open, ...b.complete].sort());
  assert.ok(b.stage('Execution').includes('csv-export'), 'csv-export is not in Execution');
  assert.equal(b.labels.length, 6);
  const eye = eyeToggle(b.html);
  assert.equal(eye.glyph, 'eye-open');
  assert.equal(eye.attrs.title, 'Hide Hidden Specs');
  assert.equal(eye.attrs['aria-pressed'], 'true');
  assert.equal(eye.attrs['data-show'], 'false');
  assert.equal(eye.text, '2 hidden');
});

test('PNL-03/PNL-04 the stylesheet lays five stages side by side for the board without Completed, and one stage under 700px', () => {
  const css = readFileSync(join(import.meta.dirname, '..', '..', 'media', 'dashboard.css'), 'utf8').replace(/\r\n/g, '\n');
  const six = css.indexOf('.board { display: grid; grid-template-columns: repeat(6, minmax(200px, 1fr));');
  const five = css.indexOf('.board:where(.five-stages) { grid-template-columns: repeat(5, minmax(200px, 1fr)); }');
  const narrow = css.indexOf('  .board { grid-template-columns: minmax(0, 1fr); overflow-x: visible; }');
  assert.ok(six >= 0 && five > six, 'the five-stage rule must follow the base board rule');
  // Same specificity as .board: the narrow rule, later in the file, still stacks the stages.
  assert.ok(narrow > five, 'the narrow board rule must come after the five-stage rule');
});

test('PNL-01/HID-01 the panel opens with the closed eye, its count of hidden specs, and the completed features off the board', async () => {
  const project = await sampleProject();
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, hidden: [], shown: [], view: DEFAULT_VIEW });
  assert.ok(!html.includes('type="checkbox"'), 'the "Hide Completed" box is still there');
  const eye = eyeToggle(html);
  assert.equal(eye.glyph, 'eye-closed');
  assert.equal(eye.attrs.title, 'Show Hidden Specs');
  assert.equal(eye.attrs['aria-pressed'], 'false');
  assert.equal(eye.attrs['data-show'], 'true');
  assert.equal(project.features.filter((f) => f.health === 'complete').length, 1);
  assert.equal(eye.text, '1 hidden');
  const open = project.features.filter((f) => f.health !== 'complete').map((f) => f.name).sort();
  assert.deepEqual([...html.matchAll(/<span class="card-name">([^<]+)<\/span>/g)].map((m) => m[1]).sort(), open);
  assert.ok(!html.includes('aria-label="Completed"'), 'the Completed column is on the board');
});

test('HID-01/HID-11 the count of hidden specs adds the marked ones, a completed one marked too counts once', async () => {
  assert.equal(eyeToggle((await board(false, mark('csv-export'))).html).text, '2 hidden');
  assert.equal(eyeToggle((await board(false, mark('csv-export', 'billing-invoices'))).html).text, '2 hidden');
  assert.equal(eyeToggle((await board(false, mark('csv-export', 'user-auth'))).html).text, '3 hidden');
  // Nothing completed and nothing marked: the count still reads "0 hidden".
  const project = await sampleProject();
  const open = { ...project, features: project.features.filter((f) => f.health !== 'complete') };
  const none = renderApp({ projects: [open], now: Date.now(), loaded: true, hidden: [], shown: [], view: DEFAULT_VIEW });
  assert.equal(eyeToggle(none).text, '0 hidden');
});

test('PNL-05 a completed feature opened in the panel shows its details with the eye closed', async () => {
  const project = await sampleProject();
  const done = project.features.find((f) => f.health === 'complete')!;
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, hidden: [], shown: [], view: { ...DEFAULT_VIEW, selected: { projectId: 'sample', feature: done.name } } });
  assert.ok(html.includes(`<div class="detail-title">\n      <h1><span class="mono">${done.name}</span>`), `the details of ${done.name} are not shown`);
});

test('HID-15 a spec marked as hidden opened in the panel shows its details with the eye closed', async () => {
  const project = await sampleProject();
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, hidden: mark('csv-export'), shown: [], view: { ...DEFAULT_VIEW, selected: { projectId: 'sample', feature: 'csv-export' } } });
  assert.ok(html.includes('<div class="detail-title">\n      <h1><span class="mono">csv-export</span>'), 'the details of csv-export are not shown');
});

test('PNL-04/HID-03/HID-04 the closed eye shows the hidden specs, the open eye hides them again', () => {
  assert.deepEqual(actionFor({ action: 'toggle-hidden', show: 'true' }), { view: { showHidden: true } });
  assert.deepEqual(actionFor({ action: 'toggle-hidden', show: 'false' }), { view: { showHidden: false } });
});

test('HID-09/HID-10/EYE-01/EYE-02/EYE-03 every card has its eye: open "Hide Spec" in view, closed "Unhide Spec" hidden, completed or not', async () => {
  const cards = cardsOf((await board(true, mark('csv-export'))).html);
  assert.deepEqual(cardEyes(cards.get('user-auth')!.body), [{ action: 'hide', title: 'Hide Spec', glyph: 'eye-open' }]);
  assert.deepEqual(cardEyes(cards.get('csv-export')!.body), [{ action: 'unhide', title: 'Unhide Spec', glyph: 'eye-closed' }]);
  // Completed without a choice: hidden, so the closed eye.
  assert.deepEqual(cardEyes(cards.get('billing-invoices')!.body), [{ action: 'unhide', title: 'Unhide Spec', glyph: 'eye-closed' }]);
  // Marked while open and completed later: still hidden.
  const both = cardsOf((await board(true, mark('csv-export', 'billing-invoices'))).html);
  assert.deepEqual(cardEyes(both.get('billing-invoices')!.body), [{ action: 'unhide', title: 'Unhide Spec', glyph: 'eye-closed' }]);
  // Completed and kept in view: the open eye.
  const kept = cardsOf((await board(true, [], show('billing-invoices'))).html);
  assert.deepEqual(cardEyes(kept.get('billing-invoices')!.body), [{ action: 'hide', title: 'Hide Spec', glyph: 'eye-open' }]);
  // The eye means hiding now: "Preview" draws another glyph.
  const preview = cards.get('user-auth')!.body.match(/data-action="preview"[^>]*>(<svg class="ic ([\w-]*)")/);
  assert.ok(preview, 'user-auth has no "Preview" button');
  assert.ok(!['eye-open', 'eye-closed'].includes(preview[2]), `"Preview" draws ${preview[2]}`);
});

test('HID-11/HID-12 the eye of a card asks the extension to mark or unmark that spec', () => {
  assert.deepEqual(actionFor({ action: 'hide', pid: 'sample', feature: 'csv-export' }), {
    message: { type: 'setHidden', target: { projectId: 'sample', feature: 'csv-export' }, hidden: true },
  });
  assert.deepEqual(actionFor({ action: 'unhide', pid: 'sample', feature: 'csv-export' }), {
    message: { type: 'setHidden', target: { projectId: 'sample', feature: 'csv-export' }, hidden: false },
  });
});

test('HID-14/EYE-08 with the eye open every hidden card is faded, completed or not, and a card in view is not', async () => {
  const marked = cardsOf((await board(true, mark('csv-export'))).html);
  assert.equal(marked.get('csv-export')!.cls, 'card h-ok is-hidden');
  assert.equal(cardsOf((await board(true)).html).get('csv-export')!.cls, 'card h-ok');
  // Completed without a choice: hidden, so faded.
  assert.equal(marked.get('billing-invoices')!.cls, 'card h-complete is-hidden');
  // Completed and kept in view: not faded.
  assert.equal(cardsOf((await board(true, [], show('billing-invoices'))).html).get('billing-invoices')!.cls, 'card h-complete');
});

test('EYE-05/EYE-07 with the eye closed a completed spec kept in view is in the Completed column, in six stages, and out of the count', async () => {
  const b = await board(false, [], show('billing-invoices'));
  assert.deepEqual(b.labels, ['Spec', 'Design', 'Tasks', 'Execution', 'Verification', 'Completed']);
  assert.deepEqual(b.doneCards, ['billing-invoices']);
  assert.deepEqual(b.cards, [...b.open, 'billing-invoices'].sort());
  assert.equal(b.boardClass, 'board');
  assert.equal(eyeToggle(b.html).text, '0 hidden');
  assert.equal(eyeToggle((await board(false, mark('csv-export'), show('billing-invoices'))).html).text, '1 hidden');
});

test('HID-14 the stylesheet fades a marked card at every width', () => {
  const css = readFileSync(join(import.meta.dirname, '..', '..', 'media', 'dashboard.css'), 'utf8').replace(/\r\n/g, '\n');
  const rules = [...css.matchAll(/^\.card\.is-hidden \{ opacity: ([\d.]+); \}$/gm)];
  assert.equal(rules.length, 1, 'one top-level .card.is-hidden rule');
  assert.ok(Number(rules[0][1]) < 1, `opacity ${rules[0][1]} does not fade the card`);
});
