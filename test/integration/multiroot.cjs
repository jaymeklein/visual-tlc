// Executed by VS Code against test/fixtures/multi-root. Folder "a" sets tlcSpecs.specsFolders, folder "b" sets
// tlcSpecs.exclude. Both hold a .specs and a docs/specs; "a" also holds legacy/docs/specs and "b" legacy/.specs.
const assert = require('node:assert/strict');
const vscode = require('vscode');

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

let api;
const listed = (folder) =>
  api
    .getProjects()
    .map((p) => ({ path: vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), true), features: p.features.map((f) => f.name) }))
    .filter((p) => p.path.startsWith(`${folder}/`));

test('SF-01/SF-02 each workspace folder uses its own list of specs folders', () => {
  // "a" lists docs/specs, so a/.specs stays out; "b" has no list, so it shows .specs and b/docs/specs stays out.
  assert.deepEqual(
    listed('a').map((p) => p.path),
    ['a/docs/specs', 'a/legacy/docs/specs'],
  );
  assert.deepEqual(listed('b'), [{ path: 'b/.specs', features: ['b-default'] }]);
});

test('EXC-05 each workspace folder uses its own list of excluded folders', () => {
  // Only "b" excludes "legacy": a/legacy/docs/specs shows, b/legacy/.specs does not.
  assert.deepEqual(listed('a'), [
    { path: 'a/docs/specs', features: ['a-custom'] },
    { path: 'a/legacy/docs/specs', features: ['a-legacy'] },
  ]);
  assert.deepEqual(
    listed('b').map((p) => p.path),
    ['b/.specs'],
  );
});

exports.run = async function run() {
  const ext = vscode.extensions.getExtension('visual-tlc.visual-tlc');
  assert.ok(ext, 'extension not found');
  api = await ext.activate();
  const failures = [];
  for (const c of cases) {
    try {
      await c.fn();
      console.log(`  ✔ ${c.name}`);
    } catch (e) {
      console.log(`  ✖ ${c.name}\n    ${e && e.stack ? e.stack : e}`);
      failures.push(c.name);
    }
  }
  console.log(`\n${cases.length - failures.length}/${cases.length} integration tests passed`);
  if (failures.length) throw new Error(`${failures.length} integration test(s) failed`);
};
