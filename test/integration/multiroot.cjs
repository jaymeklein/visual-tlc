// Executed by VS Code against test/fixtures/multi-root. Folder "a" sets tlcSpecs.specsFolders, folder "b" keeps the
// default. Both hold a .specs and a docs/specs; "a" also holds legacy/docs/specs and "b" legacy/.specs.
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

test('SF-01/SFP-01/SFP-02 each workspace folder reads its own list of specs folders, from its own root', () => {
  // "a" lists docs/specs: a/.specs and a/legacy/docs/specs stay out.
  assert.deepEqual(listed('a'), [{ path: 'a/docs/specs', features: ['a-custom'] }]);
  // "b" has no list: only b/.specs, not b/legacy/.specs nor b/docs/specs.
  assert.deepEqual(listed('b'), [{ path: 'b/.specs', features: ['b-default'] }]);
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
