import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSpecsRoots, parseSpecsFolders, pendingWarnings, rootLabel } from '../../src/core/folders.ts';

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

test('SFP-01 .specs is the folder at the workspace folder root, never one in a subfolder', () => {
  const files = ['.specs/features/auth/spec.md', 'test/fixtures/sample/.specs/features/user-auth/spec.md', 'tools/.specs/STATE.md', 'src/index.ts'];
  assert.deepEqual(findSpecsRoots(files, ['.specs']), [{ path: '.specs', entry: '.specs' }]);
});

test('SFP-02 an entry with subfolders is read at that path from the workspace folder root', () => {
  const files = ['packages/api/.specs/STATE.md', 'x/packages/api/.specs/STATE.md', 'docs/specs/STATE.md', 'packages/api/docs/specs/STATE.md'];
  assert.deepEqual(findSpecsRoots(files, ['packages/api/.specs', 'docs/specs']), [
    { path: 'docs/specs', entry: 'docs/specs' },
    { path: 'packages/api/.specs', entry: 'packages/api/.specs' },
  ]);
});

test('SFP-01 finds the folder of every entry', () => {
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
  assert.deepEqual(findSpecsRoots(['.specs/notes.txt'], ['.specs']), [{ path: '.specs', entry: '.specs' }]);
  assert.deepEqual(findSpecsRoots(['tools/.specs/notes.txt'], ['tools/.specs']), [{ path: 'tools/.specs', entry: 'tools/.specs' }]);
});

test('SF-10 the files of one folder give it once', () => {
  const files = ['.specs/STATE.md', '.specs/features/auth/spec.md', '.specs/features/billing/tasks.md'];
  assert.deepEqual(findSpecsRoots(files, ['.specs']), [{ path: '.specs', entry: '.specs' }]);
});

test('SFP-09 a workspace folder with one specs folder labels it by its name alone', () => {
  const roots = findSpecsRoots(['docs/specs/STATE.md'], ['.specs', 'docs/specs']);
  assert.deepEqual(
    roots.map((r) => rootLabel(r, roots, 'ws')),
    ['ws'],
  );
});

test('SFP-09 a workspace folder with more specs folders labels each by its name and the entry', () => {
  const roots = findSpecsRoots(['.specs/STATE.md', 'docs/specs/STATE.md', 'packages/api/.specs/STATE.md'], ['.specs', 'docs/specs', 'packages/api/.specs']);
  assert.deepEqual(
    roots.map((r) => rootLabel(r, roots, 'api')),
    ['api · .specs', 'api · docs/specs', 'api · packages/api/.specs'],
  );
});

test('SF-09 a comma is part of an entry, not a separator', () => {
  assert.deepEqual(parseSpecsFolders(['docs,old']), { entries: ['docs,old'], invalid: [] });
});

test('SF-09/SFP-11 each invalid entry is warned once, until it leaves the setting', () => {
  const entry = (value: string) => ({ setting: 'tlcSpecs.specsFolders', entry: value });
  const first = pendingWarnings([entry('../fora'), entry('docs/*'), entry('../fora')], new Set());
  assert.deepEqual(first.show, [entry('../fora'), entry('docs/*')]);

  const again = pendingWarnings([entry('../fora'), entry('docs/*')], first.warned);
  assert.deepEqual(again.show, []);

  const left = pendingWarnings([entry('docs/*')], again.warned);
  assert.deepEqual(left.show, []);
  const back = pendingWarnings([entry('docs/*'), entry('../fora')], left.warned);
  assert.deepEqual(back.show, [entry('../fora')]);
});
