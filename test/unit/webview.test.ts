// Dashboard behaviour (spec: .specs/features/readonly-navigation/spec.md, story P2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionFor, renderApp, type RenderCtx } from '../../src/webview/render.ts';
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

async function detailOf(feature: string): Promise<{ html: string; ctx: RenderCtx }> {
  const project = await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
  const ctx: RenderCtx = {
    projects: [project],
    now: Date.now(),
    loaded: true,
    view: { selected: { projectId: 'sample', feature }, query: '', hideDone: false },
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
