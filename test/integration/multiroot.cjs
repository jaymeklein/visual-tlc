// Executed by VS Code against test/fixtures/multi-root. Both folders hold a .specs and a docs/specs,
// at the root and inside "legacy". Folder "a" sets tlcSpecs.specsFolders, folder "b" sets tlcSpecs.exclude.
const assert = require('node:assert/strict');
const vscode = require('vscode');

exports.run = async function run() {
  const ext = vscode.extensions.getExtension('visual-tlc.visual-tlc');
  assert.ok(ext, 'extension not found');
  const api = await ext.activate();
  const projects = api.getProjects();
  // "a" lists docs/specs and excludes nothing of its own: its legacy folder shows.
  // "b" lists .specs by default and excludes "legacy": b/legacy/.specs stays out.
  assert.deepEqual(
    projects.map((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), true)),
    ['a/docs/specs', 'a/legacy/docs/specs', 'b/.specs'],
  );
  assert.deepEqual(
    projects.map((p) => p.features.map((f) => f.name)),
    [['a-custom'], ['a-legacy'], ['b-default']],
  );
  console.log('  ✔ SF-01/SF-02 each workspace folder uses its own list of specs folders');
  console.log('  ✔ EXC-05 each workspace folder uses its own list of excluded folders');
  console.log('\n2/2 integration tests passed');
};
