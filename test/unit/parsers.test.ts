import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyEars, parseSpec } from '../../src/core/spec.ts';
import { classifyTaskStatus, parseTasks } from '../../src/core/tasks.ts';
import { parseValidation, verdictOf } from '../../src/core/validation.ts';
import { parseLessonsMd, parseState } from '../../src/core/docs.ts';
import { matchFeature } from '../../src/core/project.ts';
import { parseMd } from '../../src/core/markdown.ts';

test('EARS classification mirrors validate_spec.py', () => {
  assert.equal(classifyEars('WHEN x THEN the system SHALL y'), 'event-driven');
  assert.equal(classifyEars('WHILE locked the system SHALL reject'), 'state-driven');
  assert.equal(classifyEars('IF invalid THEN the system SHALL return 400'), 'unwanted-behavior');
  assert.equal(classifyEars('WHERE flag on the system SHALL show'), 'optional-feature');
  assert.equal(classifyEars('The system SHALL log every call'), 'ubiquitous');
  assert.equal(classifyEars('WHILE busy, WHEN clicked the system SHALL queue'), 'complex');
  assert.equal(classifyEars('Colors SHALL meet contrast'), 'unknown');
  assert.equal(classifyEars('The theme should look nice'), 'invalid');
});

test('headings inside fenced blocks are ignored', () => {
  const doc = parseMd('# Title\n\n```ts\n# not a heading\n```\n\n## Real');
  assert.deepEqual(
    doc.headings.map((h) => h.text),
    ['Title', 'Real'],
  );
});

test('spec: acceptance criteria are collected across the blank line after the header', () => {
  const spec = parseSpec(
    [
      '# X Specification',
      '## User Stories',
      '### P1: Story ⭐ MVP',
      '**Acceptance Criteria** (each line is one EARS pattern):',
      '',
      '1. WHEN a THEN system SHALL b  <!-- event-driven -->',
      '2. The page should be pretty',
      '',
      '**Independent Test**: demo',
    ].join('\n'),
    'f/spec.md',
  );
  assert.equal(spec.stories.length, 1);
  assert.equal(spec.stories[0].mvp, true);
  assert.equal(spec.stories[0].title, 'Story');
  assert.deepEqual(
    spec.stories[0].criteria.map((c) => c.pattern),
    ['event-driven', 'invalid'],
  );
  const noShall = spec.issues.find((i) => i.message.includes('sem SHALL'));
  assert.equal(noShall?.severity, 'error');
  assert.equal(noShall?.line, 7);
});

test('task status: explicit field, header marker, checkboxes', () => {
  assert.equal(classifyTaskStatus('✅ Complete'), 'done');
  assert.equal(classifyTaskStatus('⚠️ Partial'), 'in-progress');
  assert.equal(classifyTaskStatus('❌ Blocked'), 'blocked');
  assert.equal(classifyTaskStatus('Concluída'), 'done');
  assert.equal(classifyTaskStatus('Incomplete'), 'in-progress');
  assert.equal(classifyTaskStatus('✅ Complete | ❌ Blocked | ⚠️ Partial'), undefined, 'template choice list is not a status');

  const doc = parseTasks(
    [
      '# F Tasks',
      '**Status**: Approved',
      '## Task Breakdown',
      '### T1: header marked ✅',
      '**Tests**: unit',
      '**Gate**: quick',
      '### T2: status field',
      '**Status**: ❌ Blocked',
      '- [x] a',
      '**Tests**: unit',
      '**Gate**: quick',
      '### T3: half checked',
      '- [x] a',
      '- [ ] b',
      '**Tests**: unit',
      '**Gate**: quick',
      '### T4: untouched',
      '- [ ] a',
      '**Tests**: unit',
      '**Gate**: quick',
    ].join('\n'),
    'f/tasks.md',
  );
  assert.equal(doc.status, 'approved');
  assert.deepEqual(
    doc.tasks.map((t) => [t.id, t.status, t.statusSource]),
    [
      ['T1', 'done', 'header'],
      ['T2', 'blocked', 'status-field'],
      ['T3', 'in-progress', 'checkboxes'],
      ['T4', 'pending', 'checkboxes'],
    ],
  );
  assert.equal(doc.tasks[0].title, 'header marked');
});

test('tasks: phase membership from nested layout and forward dependency error', () => {
  const doc = parseTasks(
    [
      '# F Tasks',
      '## Test Coverage Matrix',
      '| Code Layer | Required Test Type |',
      '| --- | --- |',
      '| Service | unit |',
      '## Gate Check Commands',
      '| Gate | Command |',
      '| --- | --- |',
      '| Quick | npm test |',
      '## Execution Plan',
      '### Phase 1: A',
      '#### T1: first',
      '**Depends on**: T2',
      '**Tests**: none',
      '**Gate**: build',
      '### Phase 2: B',
      '#### T2: second',
      '**Depends on**: None',
      '**Tests**: unit',
      '## Task Breakdown',
    ].join('\n'),
    'f/tasks.md',
  );
  assert.deepEqual(
    doc.tasks.map((t) => [t.id, t.phase]),
    [
      ['T1', 1],
      ['T2', 2],
    ],
  );
  const msgs = doc.issues.map((i) => `${i.severity}:${i.message}`);
  assert.ok(msgs.some((m) => m.startsWith('error:T1 (fase 1) depende de T2 (fase 2)')), msgs.join('\n'));
  assert.ok(msgs.some((m) => m === 'error:T2: campo "Gate" ausente'), msgs.join('\n'));
  assert.ok(msgs.some((m) => m.startsWith('warning:T1: Tests: none, mas nenhuma camada')), msgs.join('\n'));
});

test('validation verdict mirrors validate_state.py', () => {
  assert.equal(verdictOf('# X Validation\n**Result**: [N/N killed] - [PASS ✅ | FAIL ❌]'), 'unfilled');
  assert.equal(verdictOf('## Validation: X - FAIL ❌'), 'fail');
  assert.equal(verdictOf('**Result**: 3/3 killed - PASS ✅'), 'pass');
  assert.equal(verdictOf('All good, shipped.'), 'none');

  const v = parseValidation('# X Validation\n**Result**: 3/3 killed - PASS ✅\n', 'f/validation.md');
  assert.equal(v.verdict, 'pass');
  assert.equal(v.hasEvidence, false);
  assert.ok(v.issues.some((i) => i.severity === 'error' && i.message.includes('evidência file:line')));
});

test('STATE.md: decisions, supersession and handoff', () => {
  const s = parseState(
    [
      '# STATE',
      '## Decisions',
      '### AD-001',
      '- **Decision**: Use X',
      '- **Status**: superseded by AD-009',
      '## Handoff',
      '- **Feature**: .specs/features/auth',
      '- **In-progress** (file:line): `src/a.ts:3` - mid-write',
      '- **Blockers**: waiting for API keys',
    ].join('\n'),
    'STATE.md',
  );
  assert.equal(s.decisions[0].active, false);
  assert.ok(s.issues.some((i) => i.message.includes('AD-009 não existe')));
  assert.equal(s.handoff?.inProgress, 'src/a.ts:3 - mid-write');
  assert.ok(s.issues.some((i) => i.severity === 'warning' && i.message.includes('waiting for API keys')));
});

test('handoff feature matching', () => {
  const names = ['auth', 'auth-v2', 'billing'];
  assert.equal(matchFeature('.specs/features/auth-v2', names), 'auth-v2');
  assert.equal(matchFeature('auth', names), 'auth');
  assert.equal(matchFeature('Billing (T4)', names), 'billing');
  assert.equal(matchFeature('something else', names), null);
});

test('LESSONS.md fallback parser', () => {
  const lessons = parseLessonsMd(
    [
      '# LESSONS',
      '## Confirmed (load these at Specify/Design)',
      '### L-001 - Assert exact values',
      '- signal: `surviving_mutant` · recurrence: 2 feature(s) · scope: `repo` · harmful: 0',
      '- features: a, b',
      '## Candidates (under observation - do NOT load as guidance yet)',
      '_none_',
    ].join('\n'),
  );
  assert.deepEqual(lessons.map((l) => [l.id, l.status, l.signal, l.scope, l.recurrence, l.features.length]), [
    ['L-001', 'confirmed', 'surviving_mutant', 'repo', 2, 2],
  ]);
});
