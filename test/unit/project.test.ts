import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadProject } from '../../src/core/project.ts';
import type { Feature, Project } from '../../src/core/types.ts';
import { nodeReader, SAMPLE_SPECS } from './nodeReader.ts';

let cached: Project | undefined;
async function sample(): Promise<Project> {
  cached ??= await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: Date.now(), staleAfterDays: 14 });
  return cached;
}
async function feature(name: string): Promise<Feature> {
  const f = (await sample()).features.find((x) => x.name === name);
  assert.ok(f, `feature ${name} not loaded`);
  return f;
}
const stages = (f: Feature) => f.stages.map((s) => `${s.id}:${s.state}`).join(' ');
const messages = (f: Feature, severity: string) => f.issues.filter((i) => i.severity === severity).map((i) => i.message);

test('project: handoff marks the active feature and it is listed first', async () => {
  const p = await sample();
  assert.equal(p.activeFeature, 'user-auth');
  assert.equal(p.features[0].name, 'user-auth');
  assert.equal(p.features.length, 8);
  assert.deepEqual(
    p.state?.decisions.map((d) => [d.id, d.active]),
    [
      ['AD-001', true],
      ['AD-002', false],
      ['AD-003', true],
    ],
  );
  assert.deepEqual(
    p.lessons.map((l) => l.status),
    ['confirmed', 'candidate', 'quarantined'],
  );
});

test('user-auth: large feature mid-execution', async () => {
  const f = await feature('user-auth');
  assert.equal(f.phase, 'execute');
  assert.equal(f.phaseLabel, 'Execution 3/7');
  assert.equal(stages(f), 'spec:done design:done tasks:done execute:active verify:pending');
  assert.deepEqual(f.taskStats, { total: 7, done: 3, inProgress: 1, blocked: 0, pending: 3 });
  assert.deepEqual(
    f.tasks?.phases.map((p) => [p.number, p.taskIds.join(',')]),
    [
      [1, 'T1,T2,T3'],
      [2, 'T4,T5'],
      [3, 'T6,T7'],
    ],
  );
  assert.equal(f.active, true);
  assert.equal(f.nextStep, 'Finish rotation in RefreshService.rotate() and make the quick gate pass');
  assert.equal(f.health, 'ok');
  assert.deepEqual(messages(f, 'error'), []);
  assert.deepEqual(messages(f, 'warning'), ['Requirement(s) without a task: AUTH-06']);
  assert.equal(f.spec?.stories.length, 3);
  assert.equal(f.spec?.stories.flatMap((s) => s.criteria).length, 6);
  assert.equal(f.context?.decisionAreas.join(','), 'Error messages,Session length');
  assert.equal(f.design?.components.join(','), 'AuthService,RefreshService');
  assert.deepEqual(f.requirementStats, { total: 6, verified: 2, mapped: 5 });
});

test('billing-invoices: verified PASS with evidence is complete', async () => {
  const f = await feature('billing-invoices');
  assert.equal(f.phase, 'verify');
  assert.equal(f.phaseLabel, 'Completed');
  assert.equal(f.health, 'complete');
  assert.equal(f.progress, 1);
  assert.equal(stages(f), 'spec:done design:skipped tasks:done execute:done verify:done');
  assert.deepEqual(messages(f, 'error'), []);
  assert.deepEqual(messages(f, 'warning'), []);
  assert.deepEqual(f.validation?.criteria, { pass: 4, gap: 0, precision: 0, total: 4 });
  assert.deepEqual(f.validation?.mutations, { killed: 2, survived: 0, total: 2 });
  assert.equal(f.validation?.overall, 'ready');
});

test('csv-export: medium scope, executing without tasks.md', async () => {
  const f = await feature('csv-export');
  assert.equal(f.phase, 'execute');
  assert.equal(stages(f), 'spec:done design:skipped tasks:skipped execute:active verify:pending');
});

test('notifications: verifier FAIL is surfaced', async () => {
  const f = await feature('notifications');
  assert.equal(f.phase, 'verify');
  assert.equal(f.health, 'failed');
  assert.equal(f.phaseLabel, 'Verification failed');
  assert.equal(f.stages.find((s) => s.id === 'verify')?.state, 'failed');
  assert.ok(messages(f, 'error').some((m) => m.startsWith('Verification FAIL')));
  assert.ok(messages(f, 'warning').some((m) => m.includes('mutant')));
  assert.ok(messages(f, 'warning').some((m) => m.includes('GAP')));
  assert.equal(f.validation?.fixPlans, 1);
});

test('search-filters: all tasks done but the Verifier never ran', async () => {
  const f = await feature('search-filters');
  assert.equal(f.phase, 'verify');
  assert.equal(f.phaseLabel, 'Awaiting verification');
  assert.equal(f.health, 'attention');
  assert.equal(f.nextStep, 'Run the Verifier to produce validation.md');
  const errors = messages(f, 'error');
  assert.ok(errors.some((m) => m.includes('validation.md does not exist')), errors.join('\n'));
  assert.ok(errors.includes('Diagram shows T2 → T3, but T3 does not declare "Depends on: T2"'), errors.join('\n'));
});

test('dark-mode: incomplete spec is flagged like the closure gate', async () => {
  const f = await feature('dark-mode');
  assert.equal(f.phase, 'spec');
  assert.equal(f.health, 'attention');
  assert.equal(f.nextStep, 'Fix spec.md: 4 error(s) at the closure gate');
  const errors = messages(f, 'error');
  for (const expected of [
    'Missing required section: "## Out of Scope"',
    'Missing required section: "## Requirement Traceability"',
    'Assumption "Default theme" has no "Rationale"',
    'Acceptance criterion without SHALL (not testable): The theme should look nice',
  ]) {
    assert.ok(errors.includes(expected), `missing: ${expected}\n${errors.join('\n')}`);
  }
  const warnings = messages(f, 'warning');
  assert.ok(warnings.some((m) => m.startsWith('Criterion has SHALL but no EARS keyword')));
  assert.ok(warnings.some((m) => m.includes('P2: "Remember preference" has no acceptance criteria')));
  assert.ok(warnings.some((m) => m.includes('open questions')));
  assert.ok(warnings.some((m) => m.includes('template rows')));
});

test('audit-log: design draft', async () => {
  const f = await feature('audit-log');
  assert.equal(f.phase, 'design');
  assert.equal(f.phaseLabel, 'Design (draft)');
  assert.equal(stages(f), 'spec:done design:active tasks:pending execute:pending verify:pending');
});

test('legacy-import: empty artifact and missing spec', async () => {
  const f = await feature('legacy-import');
  assert.equal(f.phase, 'spec');
  assert.equal(f.tasks, null);
  assert.ok(messages(f, 'error').some((m) => m.startsWith('spec.md missing')));
  assert.ok(messages(f, 'warning').some((m) => m.startsWith('tasks.md is empty')));
  assert.deepEqual(
    f.files.map((x) => `${x.kind}:${x.name}`),
    ['tasks:tasks.md', 'other:notes.md'],
  );
});

test('stale features are flagged after the configured window', async () => {
  const later = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const p = await loadProject(nodeReader(SAMPLE_SPECS), 'sample', 'sample', { now: later, staleAfterDays: 14 });
  const auth = p.features.find((f) => f.name === 'user-auth')!;
  const billing = p.features.find((f) => f.name === 'billing-invoices')!;
  assert.ok(auth.issues.some((i) => i.message.startsWith('Stale feature')));
  assert.ok(!billing.issues.some((i) => i.message.startsWith('Stale feature')), 'completed features are never stale');
});
