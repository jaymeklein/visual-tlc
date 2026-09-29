// Executed by VS Code (extensionTestsPath). Plain CommonJS: VS Code require()s this file.
const assert = require('node:assert/strict');
const { writeFile, mkdir, readFile } = require('node:fs/promises');
const path = require('node:path');
const vscode = require('vscode');

async function waitFor(what, predicate, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await predicate();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`timed out waiting for: ${what}`);
}

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

let api;
const folder = () => vscode.workspace.workspaceFolders[0].uri;
const specsDir = () => path.join(folder().fsPath, '.specs');
const projectId = () => api.getProjects()[0].id;
const feature = (name) => api.getProjects()[0].features.find((f) => f.name === name);

test('activates and discovers the .specs folder', async () => {
  const ext = vscode.extensions.getExtension('visual-tlc.visual-tlc');
  assert.ok(ext, 'extension not found');
  api = await ext.activate();
  const projects = api.getProjects();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].features.length, 8);
  assert.equal(projects[0].activeFeature, 'user-auth');
});

test('registers its commands', async () => {
  const all = await vscode.commands.getCommands(true);
  for (const c of ['tlcSpecs.refresh', 'tlcSpecs.openDashboard', 'tlcSpecs.showFeature', 'tlcSpecs.openFile']) {
    assert.ok(all.includes(c), `missing command ${c}`);
  }
});

test('publishes spec issues to the Problems panel', async () => {
  const diags = await waitFor('diagnostics', () => {
    const d = vscode.languages.getDiagnostics().filter(([uri]) => uri.path.includes('/.specs/'));
    return d.length ? d : undefined;
  });
  const darkMode = diags.find(([uri]) => uri.path.endsWith('/dark-mode/spec.md'));
  assert.ok(darkMode, 'no diagnostics for dark-mode/spec.md');
  const noShall = darkMode[1].find((d) => d.message.includes('sem SHALL'));
  assert.ok(noShall, 'AC without SHALL not reported');
  assert.equal(noShall.severity, vscode.DiagnosticSeverity.Error);
  assert.equal(noShall.range.start.line, 26);
  assert.ok(diags.some(([uri, list]) => uri.path.endsWith('/search-filters/tasks.md') && list.some((d) => d.message.includes('validation.md não existe'))));
});

test('openFile jumps to the requested line', async () => {
  await vscode.commands.executeCommand('tlcSpecs.openFile', projectId(), 'features/user-auth/tasks.md', 120);
  const editor = vscode.window.activeTextEditor;
  assert.ok(editor);
  assert.ok(editor.document.uri.path.endsWith('/user-auth/tasks.md'));
  assert.equal(editor.selection.active.line, 119);
});

test('opens the dashboard webview', async () => {
  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'user-auth' });
  const tab = await waitFor('dashboard tab', () =>
    vscode.window.tabGroups.all.flatMap((g) => g.tabs).find((t) => t.input instanceof vscode.TabInputWebview && t.label === 'TLC Specs'),
  );
  assert.ok(tab);
  await waitFor('webview script ready (CSP allowed it)', () => api.dashboardHealth().ready);
  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'notifications' });
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  await new Promise((r) => setTimeout(r, 800));
  assert.deepEqual(api.dashboardHealth().errors, []);
});

test('picks up a new feature written by the skill (file watcher)', async () => {
  const dir = path.join(specsDir(), 'features', 'brand-new');
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, 'spec.md'),
    '# Brand New Specification\n\n## Problem Statement\n\nX.\n\n## Out of Scope\n\n| Feature | Reason |\n| --- | --- |\n| A | B |\n\n## Assumptions & Open Questions\n\n**Open questions:** none\n\n## User Stories\n\n### P1: Do it ⭐ MVP\n\n**Acceptance Criteria**:\n\n1. WHEN x THEN the system SHALL y\n\n## Requirement Traceability\n\n| Requirement ID | Story | Phase | Status |\n| --- | --- | --- | --- |\n| NEW-01 | P1 | - | Pending |\n',
  );
  const f = await waitFor('brand-new feature', () => feature('brand-new'));
  assert.equal(f.phase, 'spec');
  assert.deepEqual(
    f.issues.filter((i) => i.severity === 'error'),
    [],
  );
});

test('reflects task progress when tasks.md changes', async () => {
  const file = path.join(specsDir(), 'features', 'user-auth', 'tasks.md');
  const before = feature('user-auth').taskStats.done;
  const text = await readFile(file, 'utf8');
  await writeFile(file, text.replace('- [ ] Reuse revokes the whole family', '- [x] Reuse revokes the whole family').replace('- [ ] Gate check passes: `npm run test:unit`', '- [x] Gate check passes: `npm run test:unit`'));
  const f = await waitFor('T4 done', () => (feature('user-auth').taskStats.done === before + 1 ? feature('user-auth') : undefined));
  assert.equal(f.phaseLabel, 'Execução 4/7');
});

const allTabs = () => vscode.window.tabGroups.all.flatMap((g) => g.tabs);
const previewTabs = () => allTabs().filter((t) => t.input instanceof vscode.TabInputWebview && t.input.viewType.includes('markdown.preview'));

test('feature rows declare inline preview / folder buttons', () => {
  const menus = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes.menus['view/item/context'];
  for (const command of ['tlcSpecs.previewFeatureMarkdown', 'tlcSpecs.revealFeatureFolder']) {
    const inline = menus.find((m) => m.command === command && m.group.startsWith('inline'));
    assert.ok(inline, `${command} has no inline button`);
    assert.match(inline.when, /viewItem == feature/);
  }
});

test('preview button opens spec.md in the Markdown preview', async () => {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  await vscode.commands.executeCommand('tlcSpecs.previewFeatureMarkdown', { projectId: projectId(), feature: 'user-auth' });
  const tab = await waitFor('markdown preview tab', () => previewTabs()[0]);
  assert.match(tab.label, /spec\.md/);
});

test('preview falls back to the first non-empty markdown when spec.md is missing (tree-node argument)', async () => {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  const node = { kind: 'feature', loaded: { project: { id: projectId() } }, feature: { name: 'legacy-import' } };
  await vscode.commands.executeCommand('tlcSpecs.previewFeatureMarkdown', node);
  const tab = await waitFor('markdown preview tab', () => previewTabs()[0]);
  assert.match(tab.label, /notes\.md/);
});

test('folder button reveals the feature folder without errors', async () => {
  const node = { kind: 'feature', loaded: { project: { id: projectId() } }, feature: { name: 'user-auth' } };
  await vscode.commands.executeCommand('tlcSpecs.revealFeatureFolder', node);
  await vscode.commands.executeCommand('tlcSpecs.revealFeatureFolder', { projectId: projectId(), feature: 'billing-invoices' });
});

exports.run = async function run() {
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
