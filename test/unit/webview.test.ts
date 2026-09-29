// Dashboard behaviour (spec: .specs/features/readonly-navigation/spec.md, story P2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionFor, renderApp, taskDetailsHtml, taskKey, type RenderCtx } from '../../src/webview/render.ts';
import { loadProject } from '../../src/core/project.ts';
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
    view: { selected: { projectId: 'sample', feature }, query: '', hideDone: false, expandedTasks },
  };
  return { html: renderApp(ctx), ctx };
}

const by = (list: Tag[], attrs: Record<string, string>) => list.filter((t) => Object.entries(attrs).every(([k, v]) => t.attrs[k] === v));

test('NAV-10 stepper steps, "abrir X.md" links, requirement, story and file rows open the preview', async () => {
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
      [null, null], // Verificação: no validation.md yet
    ],
  );

  for (const file of ['tasks.md', 'spec.md']) {
    const links = by(t, { 'data-action': 'preview-file', 'data-file': `features/user-auth/${file}` }).filter((x) => x.tag === 'button');
    assert.equal(links.length, 1, `abrir ${file} link`);
  }

  const feature = ctx.projects[0].features.find((f) => f.name === 'user-auth')!;
  const specRows = by(t, { 'data-action': 'preview-file', 'data-file': 'features/user-auth/spec.md' }).filter((x) => x.tag === 'li');
  const expectedSpecRows = feature.spec!.requirements.length + feature.spec!.stories.length + 2; // + Spec step + Arquivos row
  assert.equal(specRows.length, expectedSpecRows, 'requirement + story rows (+ Spec step + Arquivos row) preview spec.md');

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

test('NAV-11 Arquivos rows carry an "Abrir no editor" button that opens the text editor', async () => {
  const { html, ctx } = await detailOf('user-auth');
  const t = tags(html);
  const feature = ctx.projects[0].features.find((f) => f.name === 'user-auth')!;
  for (const f of feature.files) {
    const buttons = by(t, { 'data-action': 'open', 'data-file': f.path, title: 'Abrir no editor' }).filter((x) => x.tag === 'button');
    assert.equal(buttons.length, 1, f.path);
  }
  assert.deepEqual(actionFor({ action: 'open', pid: 'sample', file: 'features/user-auth/context.md' }), {
    message: { type: 'open', projectId: 'sample', file: 'features/user-auth/context.md', line: undefined },
  });
});

test('NAV-14 dashboard warnings open the text editor at the warning line', async () => {
  const { html, ctx } = await detailOf('user-auth');
  const issue = ctx.projects[0].features.find((f) => f.name === 'user-auth')!.issues.find((i) => i.message.startsWith('Requisito(s) sem task'))!;
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
  for (const text of ['O quê', 'Lock account for 15 minutes after 5 failures', 'Onde', 'src/auth/auth.service.ts (modify)', 'Depende de', 'T4', 'Done when', '6th attempt returns 423', 'Gate check passes: npm run test:unit']) {
    assert.ok(details.includes(text), `details show "${text}"`);
  }
  assert.equal(by(tags(details), { class: 'check-item unchecked' }).length, 2, 'two unchecked Done when items');
  assert.ok(!details.includes('data-action'), 'details are read-only');

  // Only warnings and the explicit "Abrir no editor" buttons may open the text editor.
  const opens = by(tags(expanded.html), { 'data-action': 'open' });
  assert.ok(opens.length > 0);
  for (const el of opens) {
    assert.ok(/^sev-/.test(el.attrs.class ?? '') || el.attrs.title === 'Abrir no editor', `unexpected editor opener: ${JSON.stringify(el.attrs)}`);
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

test('NAV-10 "abrir validation.md" and "abrir STATE.md" links open the preview', async () => {
  const billing = tags((await detailOf('billing-invoices')).html);
  assert.equal(by(billing, { 'data-action': 'preview-file', 'data-file': 'features/billing-invoices/validation.md' }).filter((x) => x.tag === 'button').length, 1);

  const { ctx } = await detailOf('user-auth');
  const overview = tags(renderApp({ ...ctx, view: { ...ctx.view, selected: null } }));
  assert.equal(by(overview, { 'data-action': 'preview-file', 'data-file': 'STATE.md' }).filter((x) => x.tag === 'button').length, 1);
});

// Side bar panel (spec: .specs/features/sidebar-dashboard/spec.md).

test('SIDE-04 board stages without features are marked is-empty, the others are not', async () => {
  const project = await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
  const html = renderApp({ projects: [project], now: Date.now(), loaded: true, view: { selected: null, query: 'user-auth', hideDone: false, expandedTasks: [] } });
  const columns = [...html.matchAll(/<div class="column([^"]*)" role="listitem" aria-label="([^"]+)">([\s\S]*?)(?=<div class="column[ "]|$)/g)];
  assert.equal(columns.length, 6);
  const withCards = columns.filter((c) => c[3].includes('class="card '));
  assert.deepEqual(withCards.map((c) => c[2]), ['Execução']);
  for (const [, cls, label, body] of columns) {
    assert.equal(cls.split(' ').includes('is-empty'), !body.includes('class="card '), label);
  }
});
