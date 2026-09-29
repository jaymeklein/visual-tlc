// Executed by VS Code against test/fixtures/multi-root: folder "a" sets tlcSpecs.specsFolders, folder "b" does not.
// Both folders hold a .specs and a docs/specs.
const assert = require('node:assert/strict');
const vscode = require('vscode');

exports.run = async function run() {
  const ext = vscode.extensions.getExtension('visual-tlc.visual-tlc');
  assert.ok(ext, 'extension not found');
  const api = await ext.activate();
  const projects = api.getProjects();
  assert.deepEqual(
    projects.map((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), true)),
    ['a/docs/specs', 'b/.specs'],
  );
  assert.deepEqual(
    projects.map((p) => p.features.map((f) => f.name)),
    [['a-custom'], ['b-default']],
  );
  console.log('  ✔ SF-01/SF-02 each workspace folder uses its own list of specs folders');
  console.log('\n1/1 integration tests passed');
};
