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

// ---------- readonly-navigation (spec: .specs/features/readonly-navigation/spec.md) ----------

const tree = () => api.featuresTree;
const kids = async (provider, node) => (await provider.getChildren(node)) ?? [];
const featureNode = async (name) => (await kids(tree())).find((n) => n.kind === 'feature' && n.feature.name === name);
const stageNode = async (featureName, id) => (await kids(tree(), await featureNode(featureName))).find((n) => n.kind === 'stage' && n.stage.id === id);
const closeAll = () => vscode.commands.executeCommand('workbench.action.closeAllEditors');
const runCmd = (cmd) => vscode.commands.executeCommand(cmd.command, ...(cmd.arguments ?? []));

async function expectPreviewOf(fileName) {
  const tab = await waitFor(`preview of ${fileName}`, () => previewTabs().find((t) => t.label.includes(fileName)));
  assert.ok(tab);
  assert.equal(vscode.window.activeTextEditor, undefined, 'a text editor was opened instead of the preview');
}

test('NAV-01 stages open their markdown in the preview', async () => {
  const cases = [
    ['user-auth', 'spec', 'features/user-auth/spec.md'],
    ['user-auth', 'design', 'features/user-auth/design.md'],
    ['user-auth', 'tasks', 'features/user-auth/tasks.md'],
    ['user-auth', 'execute', 'features/user-auth/tasks.md'],
    ['billing-invoices', 'verify', 'features/billing-invoices/validation.md'],
  ];
  for (const [f, s, file] of cases) {
    const item = await tree().getTreeItem(await stageNode(f, s));
    assert.equal(item.command?.command, 'tlcSpecs.previewFile', `${f}/${s}`);
    assert.deepEqual(item.command.arguments.slice(0, 2), [projectId(), file], `${f}/${s}`);
  }
  await closeAll();
  await runCmd((await tree().getTreeItem(await stageNode('user-auth', 'design'))).command);
  await expectPreviewOf('design.md');
});

test('NAV-02 file, requirement and phase rows open the preview', async () => {
  const children = await kids(tree(), await featureNode('user-auth'));
  const file = (await kids(tree(), children.find((n) => n.kind === 'files'))).find((n) => n.file.name === 'context.md');
  const req = (await kids(tree(), children.find((n) => n.kind === 'reqs'))).find((n) => n.req.id === 'AUTH-03');
  const phase = (await kids(tree(), await stageNode('user-auth', 'execute'))).find((n) => n.kind === 'phase' && n.phase.number === 2);
  for (const [node, expected] of [
    [file, 'features/user-auth/context.md'],
    [req, 'features/user-auth/spec.md'],
    [phase, 'features/user-auth/tasks.md'],
  ]) {
    const item = await tree().getTreeItem(node);
    assert.equal(item.command?.command, 'tlcSpecs.previewFile', node.kind);
    assert.deepEqual(item.command.arguments.slice(0, 2), [projectId(), expected], node.kind);
  }
  await closeAll();
  await runCmd((await tree().getTreeItem(req)).command);
  await expectPreviewOf('spec.md');
});

test('NAV-03 Projeto rows open STATE.md / LESSONS.md in the preview', async () => {
  const project = api.projectTree;
  const sections = await kids(project);
  const handoff = sections.find((n) => n.kind === 'handoff');
  const field = (await kids(project, handoff))[0];
  const decision = (await kids(project, sections.find((n) => n.kind === 'decisions')))[0];
  const group = (await kids(project, sections.find((n) => n.kind === 'lessons')))[0];
  const lesson = (await kids(project, group))[0];
  for (const [node, expected] of [
    [handoff, 'STATE.md'],
    [field, 'STATE.md'],
    [decision, 'STATE.md'],
    [lesson, 'LESSONS.md'],
  ]) {
    const item = await project.getTreeItem(node);
    assert.equal(item.command?.command, 'tlcSpecs.previewFile', node.kind);
    assert.deepEqual(item.command.arguments.slice(0, 2), [projectId(), expected], node.kind);
  }
  await closeAll();
  await runCmd((await project.getTreeItem(lesson)).command);
  await expectPreviewOf('LESSONS.md');
});

test('NAV-04 "Abrir no editor" opens the text editor at the row line', async () => {
  const menus = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes.menus['view/item/context'];
  const inline = menus.find((m) => m.command === 'tlcSpecs.openInEditor' && m.group.startsWith('inline'));
  assert.ok(inline, 'openInEditor has no inline button');
  assert.match(inline.when, /viewItem == artifact/);

  const children = await kids(tree(), await featureNode('user-auth'));
  const req = (await kids(tree(), children.find((n) => n.kind === 'reqs'))).find((n) => n.req.id === 'AUTH-03');
  const phase = (await kids(tree(), await stageNode('user-auth', 'execute'))).find((n) => n.kind === 'phase' && n.phase.number === 2);
  const file = (await kids(tree(), children.find((n) => n.kind === 'files'))).find((n) => n.file.name === 'design.md');
  const stage = await stageNode('user-auth', 'spec');
  for (const node of [req, phase, file, stage]) {
    assert.equal((await tree().getTreeItem(node)).contextValue, 'artifact', node.kind);
  }
  for (const [node, fileName, line] of [
    [req, 'spec.md', req.req.line - 1],
    [phase, 'tasks.md', phase.phase.line - 1],
    [stage, 'spec.md', 0],
    [file, 'design.md', 0],
  ]) {
    await closeAll();
    await vscode.commands.executeCommand('tlcSpecs.openInEditor', node);
    const editor = await waitFor('text editor', () => vscode.window.activeTextEditor);
    assert.ok(editor.document.uri.path.endsWith(`/user-auth/${fileName}`), node.kind);
    assert.equal(editor.selection.active.line, line, node.kind);
  }
});

test('NAV-05 warnings open the text editor at the warning line', async () => {
  const children = await kids(tree(), await featureNode('user-auth'));
  const warning = (await kids(tree(), children.find((n) => n.kind === 'issues'))).find((n) => n.issue.message.startsWith('Requisito(s) sem task'));
  const item = await tree().getTreeItem(warning);
  assert.equal(item.command?.command, 'tlcSpecs.openFile');
  assert.deepEqual(item.command.arguments, [projectId(), 'features/user-auth/spec.md', warning.issue.line]);
  await closeAll();
  await runCmd(item.command);
  const editor = await waitFor('text editor', () => vscode.window.activeTextEditor);
  assert.ok(editor.document.uri.path.endsWith('/user-auth/spec.md'));
  assert.equal(editor.selection.active.line, warning.issue.line - 1);
});

test('NAV-15 stages without a file have no click action and no editor button', async () => {
  for (const [f, s] of [
    ['user-auth', 'verify'],
    ['csv-export', 'design'],
    ['csv-export', 'tasks'],
  ]) {
    const item = await tree().getTreeItem(await stageNode(f, s));
    assert.equal(item.command, undefined, `${f}/${s}`);
    assert.notEqual(item.contextValue, 'artifact', `${f}/${s}`);
  }
});

const C = () => vscode.TreeItemCollapsibleState;

/** All task nodes under a stage, flattening the phase level. */
async function tasksUnder(stage) {
  const out = [];
  for (const n of await kids(tree(), stage)) {
    if (n.kind === 'task') out.push(n);
    else if (n.kind === 'phase') out.push(...(await kids(tree(), n)).filter((t) => t.kind === 'task'));
  }
  return out;
}

test('NAV-06 Tasks and Execução expand to the tasks grouped by Phase', async () => {
  for (const stageId of ['tasks', 'execute']) {
    const stage = await stageNode('user-auth', stageId);
    assert.notEqual((await tree().getTreeItem(stage)).collapsibleState, C().None, stageId);
    const phases = await kids(tree(), stage);
    assert.deepEqual(
      phases.map((n) => [n.kind, n.phase?.number]),
      [
        ['phase', 1],
        ['phase', 2],
        ['phase', 3],
      ],
      stageId,
    );
    const tasks = await tasksUnder(stage);
    const labels = [];
    for (const t of tasks) labels.push((await tree().getTreeItem(t)).label);
    assert.deepEqual(labels, [
      'T1: Switch password hashing to argon2id',
      'T2: Create refresh_tokens migration',
      'T3: Implement AuthService.login',
      'T4: Implement RefreshService.rotate',
      'T5: Lockout after failed attempts',
      'T6: AuthController routes',
      'T7: Wire auth module',
    ]);
    const icon = async (id) => (await tree().getTreeItem(tasks.find((t) => t.task.id === id))).iconPath.id;
    assert.equal(await icon('T1'), 'pass', 'done task icon');
    assert.equal(await icon('T6'), 'circle-large-outline', 'pending task icon');
  }
});

test('NAV-07 a task expands to read-only detail items', async () => {
  const tasks = await tasksUnder(await stageNode('user-auth', 'tasks'));
  const detailsOf = async (id) => {
    const node = tasks.find((t) => t.task.id === id);
    assert.equal((await tree().getTreeItem(node)).collapsibleState, C().Collapsed, id);
    const items = [];
    for (const d of await kids(tree(), node)) items.push(await tree().getTreeItem(d));
    return items;
  };
  const t5 = await detailsOf('T5');
  assert.deepEqual(
    t5.map((i) => [i.label, i.description ?? '', i.iconPath.id]).slice(0, 5),
    [
      ['O quê', 'Lock account for 15 minutes after 5 failures', 'info'],
      ['Onde', 'src/auth/auth.service.ts (modify)', 'file'],
      ['Depende de', 'T4', 'arrow-left'],
      ['Requisitos', 'AUTH-03', 'references'],
      ['Tests / Gate', 'unit · quick', 'beaker'],
    ],
  );
  assert.deepEqual(
    t5.slice(5).map((i) => [i.label, i.iconPath.id]),
    [
      ['6th attempt returns 423', 'circle-large-outline'],
      ['Gate check passes: npm run test:unit', 'circle-large-outline'],
    ],
  );
  const t3 = await detailsOf('T3');
  assert.deepEqual(
    t3.slice(5).map((i) => i.iconPath.id),
    ['pass', 'pass', 'pass'],
    'checked Done when items',
  );
});

test('NAV-08 task and task-detail rows never open an editor', async () => {
  for (const stageId of ['tasks', 'execute']) {
    for (const t of await tasksUnder(await stageNode('user-auth', stageId))) {
      const item = await tree().getTreeItem(t);
      assert.equal(item.command, undefined, `${stageId}/${t.task.id}`);
      assert.notEqual(item.contextValue, 'artifact', `${stageId}/${t.task.id}`);
      for (const d of await kids(tree(), t)) {
        const di = await tree().getTreeItem(d);
        assert.equal(di.command, undefined, `${stageId}/${t.task.id} detail`);
        assert.notEqual(di.contextValue, 'artifact', `${stageId}/${t.task.id} detail`);
      }
    }
  }
});

test('NAV-09 the Tasks stage is not expandable without tasks', async () => {
  for (const f of ['csv-export', 'audit-log', 'legacy-import']) {
    const stage = await stageNode(f, 'tasks');
    assert.equal((await tree().getTreeItem(stage)).collapsibleState, C().None, f);
    assert.deepEqual(await kids(tree(), stage), [], f);
  }
});

test('NAV-16 Tasks and Execução lists coexist without duplicate ids', async () => {
  const ids = [];
  const walk = async (node) => {
    ids.push((await tree().getTreeItem(node)).id);
    for (const child of await kids(tree(), node)) await walk(child);
  };
  for (const stageId of ['tasks', 'execute']) {
    for (const child of await kids(tree(), await stageNode('user-auth', stageId))) await walk(child);
  }
  assert.ok(ids.length > 20, `expected both subtrees, got ${ids.length} ids`);
  assert.ok(ids.every(Boolean), 'every row has an id');
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, []);
});

test('NAV-10 (host) a previewFile message from the dashboard opens the Markdown preview', async () => {
  await closeAll();
  await api.dashboardMessage({ type: 'previewFile', projectId: projectId(), file: 'features/user-auth/spec.md' });
  await expectPreviewOf('spec.md');
});

test('NAV-11/NAV-14 (host) an open message from the dashboard opens the text editor at the line', async () => {
  await closeAll();
  await api.dashboardMessage({ type: 'open', projectId: projectId(), file: 'features/user-auth/spec.md', line: 12 });
  const editor = await waitFor('text editor', () => vscode.window.activeTextEditor);
  assert.ok(editor.document.uri.path.endsWith('/user-auth/spec.md'));
  assert.equal(editor.selection.active.line, 11);
});

// --- specs-folders -------------------------------------------------------------------------------------------

const SPEC_WITHOUT_SHALL =
  '# Custom Specification\n\n## Problem Statement\n\nX.\n\n## Out of Scope\n\n| Feature | Reason |\n| --- | --- |\n| A | B |\n\n## Assumptions & Open Questions\n\n**Open questions:** none\n\n## User Stories\n\n### P1: Do it ⭐ MVP\n\n**Acceptance Criteria**:\n\n1. WHEN x THEN the system does y\n\n## Requirement Traceability\n\n| Requirement ID | Story | Phase | Status |\n| --- | --- | --- | --- |\n| CUS-01 | P1 | - | Pending |\n';

const { rm } = require('node:fs/promises');

async function write(rel, text) {
  const file = path.join(folder().fsPath, ...rel.split('/'));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}
const setFolders = (value) => vscode.workspace.getConfiguration('tlcSpecs', folder()).update('specsFolders', value, vscode.ConfigurationTarget.Workspace);
/** Specs folders of the loaded projects, relative to the workspace folder. */
const roots = () => api.getProjects().map((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), false)).sort();
const waitForRoots = (expected) => waitFor(`projects ${expected.join(', ')} (got ${roots().join(', ')})`, () => JSON.stringify(roots()) === JSON.stringify(expected));
const featuresOf = (root) => {
  const project = api.getProjects().find((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), false) === root);
  return project ? project.features.map((f) => f.name).sort() : undefined;
};

test('SF-01 contributes tlcSpecs.specsFolders with [".specs"] as the default', () => {
  const setting = vscode.workspace.getConfiguration('tlcSpecs', folder()).inspect('specsFolders');
  assert.deepEqual(setting.defaultValue, ['.specs']);
  const declared = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes.configuration.properties['tlcSpecs.specsFolders'];
  assert.equal(declared.scope, 'resource');
  assert.deepEqual(vscode.workspace.getConfiguration('tlcSpecs', folder()).get('specsFolders'), ['.specs']);
});

test('SF-02 shows every folder that matches an entry, at any depth', async () => {
  await write('docs/specs/features/custom-one/spec.md', SPEC_WITHOUT_SHALL);
  await write('packages/api/docs/specs/STATE.md', '# STATE\n\n## Decisions\n\n## Handoff\n');
  await write('packages/api/docs/specs/features/nested-one/spec.md', SPEC_WITHOUT_SHALL);
  await setFolders(['docs/specs']);
  await waitForRoots(['docs/specs', 'packages/api/docs/specs']);
  assert.deepEqual(featuresOf('docs/specs'), ['custom-one']);
  assert.deepEqual(featuresOf('packages/api/docs/specs'), ['nested-one']);

  await setFolders(['.specs', 'docs/specs']);
  await waitForRoots(['.specs', 'docs/specs', 'packages/api/docs/specs']);
});

test('SF-03 a configuration change reloads trees, panel, status bar and diagnostics without a window reload', async () => {
  await setFolders(['.specs']);
  await waitForRoots(['.specs']);
  await closeAll();
  await waitFor('the panel to close', () => api.dashboardProjects() === undefined);
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  const before = await waitFor('the panel to render its first state', () => api.dashboardProjects());
  assert.deepEqual(before, [projectId()]);
  assert.match(api.statusBarText(), /user-auth/);
  let fired = 0;
  const sub = api.featuresTree.onDidChangeTreeData(() => fired++);
  try {
    await setFolders(['docs/specs']);
    await waitForRoots(['docs/specs', 'packages/api/docs/specs']);
    assert.ok(fired > 0, 'the Features tree was not told to reload');
    const ids = JSON.stringify(api.getProjects().map((p) => p.id));
    await waitFor(`the panel to render ${ids}`, () => JSON.stringify(api.dashboardProjects()) === ids);
    assert.match(api.statusBarText(), /^\$\(tasklist\) (custom-one|nested-one) · /);
    const groups = api.featuresTree.getChildren();
    assert.deepEqual(groups.map((n) => n.kind), ['root', 'root']);
    assert.deepEqual(
      groups.map((n) => api.featuresTree.getChildren(n).map((f) => f.feature.name)),
      [['custom-one'], ['nested-one']],
    );
    assert.deepEqual(
      api.projectTree.getChildren().map((n) => n.loaded.project.id),
      api.getProjects().map((p) => p.id),
    );
    const diags = await waitFor('diagnostics of docs/specs only', () => {
      const d = vscode.languages.getDiagnostics().filter(([, list]) => list.some((x) => x.source === 'TLC Specs'));
      return d.length && d.every(([uri]) => uri.path.includes('/docs/specs/')) ? d : undefined;
    });
    const custom = diags.find(([uri]) => uri.path.endsWith('/docs/specs/features/custom-one/spec.md'));
    assert.ok(custom, 'no diagnostics for docs/specs/features/custom-one/spec.md');
    assert.ok(custom[1].some((d) => d.message.includes('sem SHALL')));
  } finally {
    sub.dispose();
  }
});

test('SF-04 a file created, changed or removed inside a configured folder updates its view', async () => {
  const customTwo = () => api.getProjects().flatMap((p) => p.features).find((f) => f.name === 'custom-two');
  const withoutShall = (f) => f.issues.filter((i) => i.message.includes('sem SHALL')).length;
  await setFolders(['docs/specs']);
  await waitForRoots(['docs/specs', 'packages/api/docs/specs']);

  await write('docs/specs/features/custom-two/spec.md', SPEC_WITHOUT_SHALL);
  await waitFor('custom-two in docs/specs', () => (featuresOf('docs/specs') || []).includes('custom-two'));
  assert.deepEqual(featuresOf('docs/specs'), ['custom-one', 'custom-two']);
  assert.deepEqual(featuresOf('packages/api/docs/specs'), ['nested-one']);
  assert.equal(withoutShall(customTwo()), 1);

  await write('docs/specs/features/custom-two/spec.md', SPEC_WITHOUT_SHALL.replace('the system does y', 'the system SHALL do y'));
  await waitFor('the changed spec.md to be read again', () => withoutShall(customTwo()) === 0);

  await rm(path.join(folder().fsPath, 'docs', 'specs', 'features', 'custom-two'), { recursive: true });
  await waitFor('custom-two to leave docs/specs', () => !customTwo());
  assert.deepEqual(featuresOf('docs/specs'), ['custom-one']);
});

test('SF-05 a matching folder without skill artifacts is ignored, unless it is named .specs', async () => {
  await write('notes/specs/readme.md', '# Notes\n');
  await write('notes/specs/features/readme.md', '# Not a feature\n');
  await write('tools/.specs/notes.txt', 'nothing from the skill\n');
  await setFolders(['.specs', 'notes/specs']);
  await waitForRoots(['.specs', 'tools/.specs']);

  await write('notes/specs/lessons.json', '{"lessons": []}');
  await waitForRoots(['.specs', 'notes/specs', 'tools/.specs']);
});

test('SF-10/SF-11 entries that lead to the same folder show it once', async () => {
  await setFolders(['docs/specs', 'docs\\specs\\', 'specs']);
  await waitForRoots(['docs/specs', 'notes/specs', 'packages/api/docs/specs']);
  const ids = api.getProjects().map((p) => p.id);
  assert.deepEqual(ids, [...new Set(ids)]);
});

test('SF-09 an invalid entry is ignored with a warning that names it', async () => {
  const shown = [];
  const original = vscode.window.showWarningMessage;
  vscode.window.showWarningMessage = (message) => {
    shown.push(message);
    return Promise.resolve(undefined);
  };
  try {
    await setFolders(['../fora', 'docs/*', 'docs/specs']);
    await waitForRoots(['docs/specs', 'packages/api/docs/specs']);
    await waitFor('two warnings', () => shown.length >= 2);
    assert.equal(shown.filter((m) => m.includes('"../fora"')).length, 1);
    assert.equal(shown.filter((m) => m.includes('"docs/*"')).length, 1);
    await api.refresh();
    assert.equal(shown.length, 2, 'the warning was repeated on refresh');
  } finally {
    vscode.window.showWarningMessage = original;
  }
});

const groupLabels = () => api.featuresTree.getChildren().map((n) => api.featuresTree.getTreeItem(n).label).sort();

test('SF-07 two specs folders of the same project are labelled with project and folder path', async () => {
  const ws = vscode.workspace.workspaceFolders[0].name;
  await setFolders(['.specs', 'docs/specs']);
  await waitForRoots(['.specs', 'docs/specs', 'packages/api/docs/specs', 'tools/.specs']);
  assert.deepEqual(groupLabels(), [`${ws} · .specs`, `${ws} · docs/specs`, `${ws}/packages/api`, `${ws}/tools`].sort());

  await setFolders(['docs/specs']);
  await waitForRoots(['docs/specs', 'packages/api/docs/specs']);
  assert.deepEqual(groupLabels(), [ws, `${ws}/packages/api`].sort());
});

test('SF-08 an empty list uses .specs', async () => {
  await setFolders([]);
  await waitForRoots(['.specs', 'tools/.specs']);
});

test('specs-folders: restores the default configuration', async () => {
  await setFolders(undefined);
  await waitForRoots(['.specs', 'tools/.specs']);
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
