import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpecsFolders } from '../../src/core/folders.ts';

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
