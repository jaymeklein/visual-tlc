import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSpecsRoots, parseExclude, parseSpecsFolders, pendingWarnings, rootLabel } from '../../src/core/folders.ts';

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

test('SF-07 a project with one specs folder is labelled by the project alone', () => {
  const roots = findSpecsRoots(['docs/specs/STATE.md', 'packages/api/.specs/STATE.md'], ['.specs', 'docs/specs']);
  assert.deepEqual(
    roots.map((r) => rootLabel(r, roots, 'ws')),
    ['ws', 'ws/packages/api'],
  );
});

test('SF-07 two specs folders of the same project are labelled with project and folder path', () => {
  const roots = findSpecsRoots(['.specs/STATE.md', 'docs/specs/STATE.md', 'packages/api/.specs/STATE.md', 'packages/api/docs/specs/STATE.md', 'packages/web/.specs/STATE.md'], ['.specs', 'docs/specs']);
  assert.deepEqual(
    roots.map((r) => rootLabel(r, roots, 'api')),
    ['api · .specs', 'api · docs/specs', 'api/packages/api · .specs', 'api/packages/api · docs/specs', 'api/packages/web'],
  );
});

// Excluded folders (spec: .specs/features/exclude-folders/spec.md).

test('EXC-02 a listed folder is excluded at any depth', () => {
  assert.deepEqual(parseExclude(['test']), { glob: '**/test/**', invalid: [] });
  assert.deepEqual(parseExclude(['node_modules', 'test', 'packages/legacy']), { glob: '{**/node_modules/**,**/test/**,**/packages/legacy/**}', invalid: [] });
});

test('EXC-02 entries are normalized and kept once', () => {
  assert.deepEqual(parseExclude(['test', 'test/', './test', 'packages\\legacy\\']), { glob: '{**/test/**,**/packages/legacy/**}', invalid: [] });
});

test('EXC-04 a text value is used as the exclusion glob', () => {
  assert.deepEqual(parseExclude('**/node_modules/**'), { glob: '**/node_modules/**', invalid: [] });
  assert.deepEqual(parseExclude('{**/node_modules/**,**/test/**}'), { glob: '{**/node_modules/**,**/test/**}', invalid: [] });
  assert.deepEqual(parseExclude(''), { glob: null, invalid: [] });
});

test('EXC-06 an empty list excludes nothing', () => {
  assert.deepEqual(parseExclude([]), { glob: null, invalid: [] });
});

test('EXC-07 absolute, parent and glob entries are left out and reported as written', () => {
  const invalid = ['/abs/test', 'C:\\abs\\test', '../out', 'docs/../test', '**/test/**', 'test?', 'te[s]t', '{a,b}'];
  assert.deepEqual(parseExclude([...invalid, 'test']), { glob: '**/test/**', invalid });
  assert.deepEqual(parseExclude(['../out']), { glob: null, invalid: ['../out'] });
});

test('EXC-07 an entry with a comma is left out: the comma separates the entries of the glob', () => {
  assert.deepEqual(parseExclude(['docs,old', 'test']), { glob: '**/test/**', invalid: ['docs,old'] });
  assert.deepEqual(parseExclude(['node_modules', 'a,b', 'test']), { glob: '{**/node_modules/**,**/test/**}', invalid: ['a,b'] });
});

test('EXC-07 the comma rule stays out of tlcSpecs.specsFolders, which searches each entry apart', () => {
  assert.deepEqual(parseSpecsFolders(['docs,old']), { entries: ['docs,old'], invalid: [] });
});

test('EXC-07 each invalid entry is warned once per setting, until it leaves that setting', () => {
  const fora = (setting: string) => ({ setting, entry: '../fora' });
  const first = pendingWarnings([fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude'), fora('tlcSpecs.exclude')], new Set());
  assert.deepEqual(first.show, [fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')]);

  const again = pendingWarnings([fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')], first.warned);
  assert.deepEqual(again.show, []);

  const left = pendingWarnings([fora('tlcSpecs.specsFolders')], again.warned);
  assert.deepEqual(left.show, []);
  const back = pendingWarnings([fora('tlcSpecs.specsFolders'), fora('tlcSpecs.exclude')], left.warned);
  assert.deepEqual(back.show, [fora('tlcSpecs.exclude')]);
});
