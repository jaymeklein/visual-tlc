// Executed by VS Code against test/fixtures/custom-folder: a workspace without .specs, with the specs in docs/specs.
const assert = require('node:assert/strict');
const vscode = require('vscode');

async function waitFor(what, predicate, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await predicate();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`timed out waiting for: ${what}`);
}

exports.run = async function run() {
  const ext = vscode.extensions.getExtension('visual-tlc.visual-tlc');
  assert.ok(ext, 'extension not found');
  // SF-06: nobody calls activate() or opens the side bar.
  await waitFor('the extension to activate on its own', () => ext.isActive);
  const projects = await waitFor('the project in docs/specs', () => (ext.exports.getProjects().length ? ext.exports.getProjects() : undefined));
  assert.deepEqual(
    projects.map((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), false)),
    ['docs/specs'],
  );
  assert.deepEqual(
    projects[0].features.map((f) => f.name),
    ['startup-one'],
  );
  console.log('  ✔ SF-06 activates on startup with a specs folder that is not named .specs');
  console.log('\n1/1 integration tests passed');
};
