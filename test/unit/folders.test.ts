import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSpecsRoots, parseSpecsFolders } from '../../src/core/folders.ts';

test('SF-08 an empty or missing list falls back to .specs', () => {
  assert.deepEqual(parseSpecsFolders([]), { entries: ['.specs'], invalid: [] });
  assert.deepEqual(parseSpecsFolders(undefined), { entries: ['.specs'], invalid: [] });
});

test('SF-09 absolute, parent and glob entries are left out and reported as written', () => {
  const invalid = ['/abs/specs', 'C:\\abs\\specs', '\\\\server\\specs', '../out', 'docs/../specs', 'docs/*', 'spec?', 'spec[s]', '{docs,specs}'];
  assert.deepEqual(parseSpecsFolders([...invalid, 'docs/specs']), { entries: ['docs/specs'], invalid });
});

test('SF-08/SF-09 a list with only invalid entries falls back to .specs and still reports them', () => {
  assert.deepEqual(parseSpecsFolders(['../out']), { entries: ['.specs'], invalid: ['../out'] });
});

test('SF-11 backslashes and a trailing slash normalize to the same path', () => {
  assert.deepEqual(parseSpecsFolders(['docs\\specs']).entries, ['docs/specs']);
  assert.deepEqual(parseSpecsFolders(['docs/specs/']).entries, ['docs/specs']);
  assert.deepEqual(parseSpecsFolders(['docs\\specs\\']).entries, ['docs/specs']);
});

test('SF-10 entries that normalize to the same folder are kept once', () => {
  assert.deepEqual(parseSpecsFolders(['docs/specs', 'docs\\specs\\', '.specs', 'docs/specs']), { entries: ['docs/specs', '.specs'], invalid: [] });
});

test('SF-02 finds an entry at the workspace folder root and at any depth', () => {
  const files = ['docs/specs/STATE.md', 'packages/api/docs/specs/features/auth/spec.md', 'src/index.ts'];
  assert.deepEqual(findSpecsRoots(files, ['docs/specs']), [
    { path: 'docs/specs', entry: 'docs/specs', project: '' },
    { path: 'packages/api/docs/specs', entry: 'docs/specs', project: 'packages/api' },
  ]);
});

test('SF-02 finds the folders of every entry', () => {
  const files = ['.specs/features/auth/spec.md', 'docs/specs/lessons.json'];
  assert.deepEqual(
    findSpecsRoots(files, ['.specs', 'docs/specs']).map((r) => r.path),
    ['.specs', 'docs/specs'],
  );
});

test('SF-05 a folder not named .specs needs a skill artifact', () => {
  const found = (file: string) => findSpecsRoots([file], ['docs/specs']).map((r) => r.path);
  for (const artifact of ['STATE.md', 'lessons.json', 'LESSONS.md', 'features/auth/spec.md']) {
    assert.deepEqual(found(`docs/specs/${artifact}`), ['docs/specs'], artifact);
  }
  for (const other of ['README.md', 'features/spec.md', 'features/auth/notes.txt', 'features/auth/img/flow.md', 'api/STATE.md']) {
    assert.deepEqual(found(`docs/specs/${other}`), [], other);
  }
});

test('SF-05 a folder named .specs is kept without any skill artifact', () => {
  assert.deepEqual(findSpecsRoots(['.specs/notes.txt'], ['.specs']), [{ path: '.specs', entry: '.specs', project: '' }]);
  assert.deepEqual(findSpecsRoots(['tools/.specs/notes.txt'], ['tools/.specs']), [{ path: 'tools/.specs', entry: 'tools/.specs', project: '' }]);
});

test('SF-10 a folder reached by two entries is listed once', () => {
  const files = ['api/docs/specs/STATE.md', 'api/docs/specs/features/auth/spec.md'];
  assert.deepEqual(findSpecsRoots(files, ['specs', 'docs/specs']), [{ path: 'api/docs/specs', entry: 'docs/specs', project: 'api' }]);
});
