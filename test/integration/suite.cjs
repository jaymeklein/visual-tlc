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
  await vscode.commands.executeCommand('tlcSpecs.openDashboard', { projectId: projectId(), feature: 'user-auth' });
  const tab = await waitFor('dashboard tab', () =>
    vscode.window.tabGroups.all.flatMap((g) => g.tabs).find((t) => t.input instanceof vscode.TabInputWebview && t.label === 'TLC Specs'),
  );
  assert.ok(tab);
  await waitFor('webview script ready (CSP allowed it)', () => api.dashboardHealth().ready);
  await waitFor('the details of user-auth in the tab', () => (api.dashboardReport() || {}).detail === 'user-auth');
  await vscode.commands.executeCommand('tlcSpecs.openDashboard', { projectId: projectId(), feature: 'notifications' });
  await waitFor('the details of notifications in the tab', () => (api.dashboardReport() || {}).detail === 'notifications');
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
/** Spec rows of the Features tree, under the folder node of each project (specs-folder-paths, SFP-07). */
const featureNodes = async () => (await Promise.all((await kids(tree())).map((root) => kids(tree(), root)))).flat();
const featureNode = async (name) => (await featureNodes()).find((n) => n.kind === 'feature' && n.feature.name === name);
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
  // billing-invoices is completed: the tree lists it while its eye is open (hidden-specs, HID-06).
  await vscode.commands.executeCommand('tlcSpecs.showHidden');
  try {
    for (const [f, s, file] of cases) {
      const item = await tree().getTreeItem(await stageNode(f, s));
      assert.equal(item.command?.command, 'tlcSpecs.previewFile', `${f}/${s}`);
      assert.deepEqual(item.command.arguments.slice(0, 2), [projectId(), file], `${f}/${s}`);
    }
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
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
  // Under the folder node of the project (specs-folder-paths, SFP-08).
  const sections = await kids(project, (await kids(project))[0]);
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

// --- hidden-specs, Features (spec: .specs/features/hidden-specs/spec.md) --------------------------------------------
// Before specs-folders: the workspace still has one specs folder, so the tree lists its features under one folder node.

/** The eye of a card, as the webview sends it. */
const setHidden = (send, feature, hidden) => send({ type: 'setHidden', target: { projectId: projectId(), feature }, hidden });
const ocultas = (n) => `${n} ${n === 1 ? 'oculta' : 'ocultas'}`;
const treeNames = () =>
  api.featuresTree
    .getChildren()
    .flatMap((root) => api.featuresTree.getChildren(root))
    .map((n) => n.feature.name)
    .sort();
const modelNames = (keep) => api.getProjects()[0].features.filter(keep).map((f) => f.name).sort();
const contributes = () => vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes;
const declared = (command) => contributes().commands.find((c) => c.command === command);
const titleMenu = (command) => contributes().menus['view/title'].find((m) => m.command === command);

/** Values the extension gives the tlcSpecs.showHidden context key while fn runs. */
async function showHiddenContext(fn) {
  const values = [];
  const original = vscode.commands.executeCommand;
  vscode.commands.executeCommand = (command, ...args) => {
    if (command === 'setContext' && args[0] === 'tlcSpecs.showHidden') values.push(args[1]);
    return original.call(vscode.commands, command, ...args);
  };
  try {
    await fn();
  } finally {
    vscode.commands.executeCommand = original;
  }
  return values;
}

test('SFP-07/SFP-08 with a single specs folder both trees show its node, named after the workspace folder, with the content inside', async () => {
  const ws = vscode.workspace.workspaceFolders[0].name;
  assert.equal(api.getProjects().length, 1);
  const features = api.featuresTree.getChildren();
  assert.deepEqual(features.map((n) => n.kind), ['root']);
  assert.equal(api.featuresTree.getTreeItem(features[0]).label, ws);
  assert.deepEqual(
    api.featuresTree
      .getChildren(features[0])
      .map((n) => n.feature.name)
      .sort(),
    modelNames((f) => f.health !== 'complete'),
  );
  const project = api.projectTree.getChildren();
  assert.deepEqual(project.map((n) => n.kind), ['root']);
  assert.equal(api.projectTree.getTreeItem(project[0]).label, ws);
  const sections = api.projectTree.getChildren(project[0]).map((n) => n.kind);
  for (const kind of ['handoff', 'decisions', 'lessons']) assert.ok(sections.includes(kind), `no ${kind} under the folder node: ${sections.join(', ')}`);
});

test('HID-05 Features starts without the hidden specs and with the closed eye "Mostrar specs ocultas" in its title', async () => {
  assert.equal(api.getProjects().length, 1);
  assert.ok(modelNames((f) => f.health === 'complete').length > 0, 'the fixture has no completed feature');
  assert.deepEqual(treeNames(), modelNames((f) => f.health !== 'complete'));
  assert.deepEqual(declared('tlcSpecs.showHidden'), { command: 'tlcSpecs.showHidden', title: 'Mostrar specs ocultas', category: 'TLC Specs', icon: '$(eye-closed)' });
  // An unset context key is false: the closed eye shows until the extension sets the key.
  assert.equal(titleMenu('tlcSpecs.showHidden').when, 'view == tlcSpecs.features && !tlcSpecs.showHidden');
});

test('HID-06/HID-07 the eye of Features lists every spec while open, and only the ones not hidden once closed again', async () => {
  const all = modelNames(() => true);
  const open = modelNames((f) => f.health !== 'complete');
  let closing;
  try {
    const opening = await showHiddenContext(() => vscode.commands.executeCommand('tlcSpecs.showHidden'));
    assert.deepEqual(opening, [true]);
    assert.deepEqual(treeNames(), all);
    assert.deepEqual(declared('tlcSpecs.hideHidden'), { command: 'tlcSpecs.hideHidden', title: 'Esconder specs ocultas', category: 'TLC Specs', icon: '$(eye)' });
    assert.equal(titleMenu('tlcSpecs.hideHidden').when, 'view == tlcSpecs.features && tlcSpecs.showHidden');
  } finally {
    closing = await showHiddenContext(() => vscode.commands.executeCommand('tlcSpecs.hideHidden'));
  }
  assert.deepEqual(closing, [false]);
  assert.deepEqual(treeNames(), open);
});

test('HID-08 the Features message counts the hidden specs while the eye is closed, and not while it is open', async () => {
  const features = api.getProjects()[0].features;
  const done = features.filter((f) => f.health === 'complete').length;
  const base = `${features.length} feature(s) · ${done} concluída(s)`;
  assert.equal(api.featuresViewMessage(), `${base} · ${done} oculta(s)`);
  try {
    await setHidden(api.dashboardMessage, 'csv-export', true);
    assert.equal(api.featuresViewMessage(), `${base} · ${done + 1} oculta(s)`);
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    assert.equal(api.featuresViewMessage(), base);
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, 'csv-export', false);
  }
  assert.equal(api.featuresViewMessage(), `${base} · ${done} oculta(s)`);
});

const rowOf = async (name) => api.featuresTree.getTreeItem(await featureNode(name));
/** The buttons every spec row keeps, whatever its eye. */
const ANY_ROW = 'view == tlcSpecs.features && (viewItem == feature || viewItem == feature.hidden)';

test('HID-09/HID-10/EYE-01/EYE-02/EYE-03 every spec row has its eye: open "Ocultar spec" in view, closed "Desocultar spec" hidden, completed or not', async () => {
  const menus = contributes().menus;
  assert.deepEqual(declared('tlcSpecs.hideFeature'), { command: 'tlcSpecs.hideFeature', title: 'Ocultar spec', category: 'TLC Specs', icon: '$(eye)' });
  assert.deepEqual(declared('tlcSpecs.unhideFeature'), { command: 'tlcSpecs.unhideFeature', title: 'Desocultar spec', category: 'TLC Specs', icon: '$(eye-closed)' });
  const inline = (command) => menus['view/item/context'].filter((m) => m.command === command && m.group.startsWith('inline')).map((m) => m.when);
  assert.deepEqual(inline('tlcSpecs.hideFeature'), ['view == tlcSpecs.features && viewItem == feature']);
  assert.deepEqual(inline('tlcSpecs.unhideFeature'), ['view == tlcSpecs.features && viewItem == feature.hidden']);
  for (const command of ['tlcSpecs.previewFeatureMarkdown', 'tlcSpecs.revealFeatureFolder', 'tlcSpecs.showFeature']) {
    assert.deepEqual(menus['view/item/context'].filter((m) => m.command === command).map((m) => m.when), [ANY_ROW, ANY_ROW], command);
  }
  for (const command of ['tlcSpecs.hideFeature', 'tlcSpecs.unhideFeature']) {
    assert.deepEqual(menus.commandPalette.filter((m) => m.command === command).map((m) => m.when), ['false'], command);
  }
  try {
    await setHidden(api.dashboardMessage, 'csv-export', true);
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    assert.equal((await rowOf('user-auth')).contextValue, 'feature');
    assert.equal((await rowOf('csv-export')).contextValue, 'feature.hidden');
    assert.equal(feature('billing-invoices').health, 'complete');
    // Completed without a choice: hidden, so the closed eye.
    assert.equal((await rowOf('billing-invoices')).contextValue, 'feature.hidden');
    // Kept in view by its eye: the open eye.
    await setHidden(api.dashboardMessage, 'billing-invoices', false);
    assert.equal((await rowOf('billing-invoices')).contextValue, 'feature');
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, 'csv-export', false);
    // Hiding a completed spec clears its choice: back to hidden as completed.
    await setHidden(api.dashboardMessage, 'billing-invoices', true);
  }
});

test('HID-11/HID-12 the eye of a spec row takes it off Features and the panel and counts it, then brings it back', async () => {
  const features = api.getProjects()[0].features;
  const done = features.filter((f) => f.health === 'complete').length;
  const base = `${features.length} feature(s) · ${done} concluída(s)`;
  const onBoard = boardNames(api.getProjects());
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  await tabReport('the tab on the board', (r) => r.detail === null && same([...r.cards].sort(), onBoard));
  try {
    await vscode.commands.executeCommand('tlcSpecs.hideFeature', await featureNode('csv-export'));
    assert.deepEqual(treeNames(), modelNames((f) => f.health !== 'complete' && f.name !== 'csv-export'));
    assert.equal(api.featuresViewMessage(), `${base} · ${done + 1} oculta(s)`);
    const off = await tabReport('csv-export to leave the tab', (r) => !r.cards.includes('csv-export'));
    assert.deepEqual([...off.cards].sort(), onBoard.filter((n) => n !== 'csv-export'));
    assert.equal(off.toggle.text, ocultas(done + 1));

    // Back through its row, reached with the eye of the title open.
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    await vscode.commands.executeCommand('tlcSpecs.unhideFeature', await featureNode('csv-export'));
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    assert.deepEqual(treeNames(), modelNames((f) => f.health !== 'complete'));
    assert.equal(api.featuresViewMessage(), `${base} · ${done} oculta(s)`);
    const back = await tabReport('csv-export to come back to the tab', (r) => r.cards.includes('csv-export'));
    assert.deepEqual([...back.cards].sort(), onBoard);
    assert.equal(back.toggle.text, ocultas(done));
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, 'csv-export', false);
  }
});

test('HID-14/EYE-08 with the eye of Features open every hidden row ends its description with "· oculta", completed or not, and a row in view does not', async () => {
  try {
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    assert.doesNotMatch((await rowOf('csv-export')).description, /oculta/);
    await setHidden(api.dashboardMessage, 'csv-export', true);
    assert.match((await rowOf('csv-export')).description, / · oculta$/);
    // Completed without a choice: hidden, so tagged.
    assert.match((await rowOf('billing-invoices')).description, / · oculta$/);
    // Completed and kept in view: not tagged.
    await setHidden(api.dashboardMessage, 'billing-invoices', false);
    assert.doesNotMatch((await rowOf('billing-invoices')).description, /oculta/);
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, 'csv-export', false);
    await setHidden(api.dashboardMessage, 'billing-invoices', true);
  }
});

// --- eye-on-every-spec (spec: .specs/features/eye-on-every-spec/spec.md) ---------------------------------------

test('EYE-05/EYE-04/EYE-10 the closed eye of a completed row keeps it in Features with the title eye closed, and its open eye hides it again', async () => {
  const features = api.getProjects()[0].features;
  const done = features.filter((f) => f.health === 'complete').length;
  const base = `${features.length} feature(s) · ${done} concluída(s)`;
  const message = (out) => (out ? `${base} · ${out} oculta(s)` : base);
  assert.ok(!treeNames().includes('billing-invoices'), 'billing-invoices is in view before the test');
  try {
    // The row is reached with the title eye open, as the user reaches it.
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    await vscode.commands.executeCommand('tlcSpecs.unhideFeature', await featureNode('billing-invoices'));
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    assert.ok(treeNames().includes('billing-invoices'), 'billing-invoices left Features');
    assert.equal((await rowOf('billing-invoices')).contextValue, 'feature');
    assert.equal(api.featuresViewMessage(), message(done - 1));

    await vscode.commands.executeCommand('tlcSpecs.hideFeature', await featureNode('billing-invoices'));
    assert.ok(!treeNames().includes('billing-invoices'), 'billing-invoices is still in Features');
    assert.equal(api.featuresViewMessage(), message(done));
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, 'billing-invoices', true);
  }
});

test('EYE-05/EYE-07 the eye of a completed card keeps it in the Concluídas column of the tab, with the board eye closed', async () => {
  const done = api.getProjects()[0].features.filter((f) => f.health === 'complete').length;
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  // The count too: the report must come from a render after the tests before this one cleaned up.
  const before = await tabReport('the tab on the board', (r) => r.detail === null && r.toggle?.text === ocultas(done) && !r.cards.includes('billing-invoices'));
  assert.equal(before.columns, 5);
  assert.equal(before.toggle.text, ocultas(done));
  try {
    await setHidden(api.dashboardMessage, 'billing-invoices', false);
    const kept = await tabReport('billing-invoices to show in the tab', (r) => r.cards.includes('billing-invoices'));
    assert.equal(kept.columns, 6);
    assert.equal(kept.toggle.text, ocultas(done - 1));
    assert.equal(kept.toggle.title, 'Mostrar as specs ocultas');
  } finally {
    await setHidden(api.dashboardMessage, 'billing-invoices', true);
  }
  const back = await tabReport('billing-invoices to leave the tab', (r) => !r.cards.includes('billing-invoices'));
  assert.equal(back.columns, 5);
  assert.equal(back.toggle.text, ocultas(done));
});

// --- hidden-folder (spec: .specs/features/hidden-folder/spec.md) ---------------------------------------------

/** The specs of the fixture that start in view: the ones not completed. */
const openNames = () => modelNames((f) => f.health !== 'complete');
const folderRow = () => api.featuresTree.getTreeItem(api.featuresTree.getChildren()[0]);

test('HFD-01/HFD-04/HFD-07 with every spec hidden and the eye closed Features leaves the folder node out, counts them all in its message and is not the welcome view, while Projeto keeps the node', async () => {
  const features = api.getProjects()[0].features;
  const open = openNames();
  const done = features.length - open.length;
  try {
    for (const name of open) await setHidden(api.dashboardMessage, name, true);
    assert.deepEqual(api.featuresTree.getChildren(), []);
    assert.equal(api.featuresViewMessage(), `${features.length} feature(s) · ${done} concluída(s) · ${features.length} oculta(s)`);
    // The welcome view of Features is only for a workspace without specs.
    assert.deepEqual(
      contributes().viewsWelcome.filter((w) => w.view === 'tlcSpecs.features').map((w) => w.when),
      ['!tlcSpecs.hasSpecs'],
    );
    const project = api.projectTree.getChildren();
    assert.deepEqual(project.map((n) => n.kind), ['root']);
    const sections = api.projectTree.getChildren(project[0]).map((n) => n.kind);
    for (const kind of ['handoff', 'decisions', 'lessons']) assert.ok(sections.includes(kind), `no ${kind} under the folder node: ${sections.join(', ')}`);
  } finally {
    for (const name of open) await setHidden(api.dashboardMessage, name, false);
  }
  assert.deepEqual(treeNames(), open);
});

test('HFD-02/HFD-03 hiding the last spec in view from its row takes the folder node out, and showing one from its card brings the node back with it', async () => {
  const open = openNames();
  const last = 'csv-export';
  assert.ok(open.includes(last), `${last} is not in view before the test`);
  try {
    for (const name of open.filter((n) => n !== last)) await setHidden(api.dashboardMessage, name, true);
    assert.deepEqual(treeNames(), [last]);
    await vscode.commands.executeCommand('tlcSpecs.hideFeature', await featureNode(last));
    assert.deepEqual(api.featuresTree.getChildren(), []);

    await setHidden(api.dashboardMessage, last, false);
    const roots = api.featuresTree.getChildren();
    assert.deepEqual(roots.map((n) => n.kind), ['root']);
    assert.deepEqual(api.featuresTree.getChildren(roots[0]).map((n) => n.feature.name), [last]);
  } finally {
    for (const name of open) await setHidden(api.dashboardMessage, name, false);
  }
  assert.deepEqual(treeNames(), open);
});

test('HFD-05/HFD-06 the folder node reads "N feature(s) · oculta" with the eye open and every spec hidden, and "N feature(s)" while a spec is in view', async () => {
  const features = api.getProjects()[0].features;
  const open = openNames();
  const base = `${features.length} feature(s)`;
  try {
    assert.equal(folderRow().description, base);
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    assert.equal(folderRow().description, base);
    for (const name of open) await setHidden(api.dashboardMessage, name, true);
    assert.deepEqual(api.featuresTree.getChildren().map((n) => n.kind), ['root']);
    assert.equal(folderRow().description, `${base} · oculta`);
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    for (const name of open) await setHidden(api.dashboardMessage, name, false);
  }
  assert.equal(folderRow().description, base);
});

test('HFD-01/HFD-06 a completed spec kept in view by its eye keeps its folder in Features, described without "· oculta", with the eye closed or open', async () => {
  const features = api.getProjects()[0].features;
  const open = openNames();
  const kept = 'billing-invoices';
  const base = `${features.length} feature(s)`;
  assert.ok(features.some((f) => f.name === kept && f.health === 'complete'), `${kept} is not a completed spec`);
  try {
    for (const name of open) await setHidden(api.dashboardMessage, name, true);
    await setHidden(api.dashboardMessage, kept, false);
    assert.deepEqual(api.featuresTree.getChildren().map((n) => n.kind), ['root']);
    assert.deepEqual(treeNames(), [kept]);
    assert.equal(folderRow().description, base);
    await vscode.commands.executeCommand('tlcSpecs.showHidden');
    assert.equal(folderRow().description, base);
  } finally {
    await vscode.commands.executeCommand('tlcSpecs.hideHidden');
    await setHidden(api.dashboardMessage, kept, true);
    for (const name of open) await setHidden(api.dashboardMessage, name, false);
  }
  assert.deepEqual(treeNames(), open);
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

test('SFP-01 .specs is read at the workspace folder root only, never in a subfolder', async () => {
  await write('lib/.specs/features/lib-one/spec.md', SPEC_WITHOUT_SHALL);
  await write('test/nested/.specs/features/in-test/spec.md', SPEC_WITHOUT_SHALL);
  await api.refresh();
  assert.deepEqual(roots(), ['.specs']);
  const names = api.getProjects().flatMap((p) => p.features.map((f) => f.name));
  assert.ok(!names.includes('lib-one') && !names.includes('in-test'), `read a .specs in a subfolder: ${names.join(', ')}`);
});

test('SFP-02 an entry with subfolders is read at that path from the workspace folder root', async () => {
  await write('docs/specs/features/custom-one/spec.md', SPEC_WITHOUT_SHALL);
  await write('packages/api/docs/specs/STATE.md', '# STATE\n\n## Decisions\n\n## Handoff\n');
  await write('packages/api/docs/specs/features/nested-one/spec.md', SPEC_WITHOUT_SHALL);
  await setFolders(['docs/specs']);
  await waitForRoots(['docs/specs']);
  assert.deepEqual(featuresOf('docs/specs'), ['custom-one']);

  await setFolders(['packages/api/docs/specs']);
  await waitForRoots(['packages/api/docs/specs']);
  assert.deepEqual(featuresOf('packages/api/docs/specs'), ['nested-one']);

  await setFolders(['.specs', 'docs/specs']);
  await waitForRoots(['.specs', 'docs/specs']);
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
    await setFolders(['docs/specs', 'packages/api/docs/specs']);
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

    await setFolders(['nada/aqui']);
    await waitForRoots([]);
    assert.equal(api.statusBarText(), undefined);
    assert.deepEqual(api.featuresTree.getChildren(), []);
    await waitFor('the panel to render no project', () => JSON.stringify(api.dashboardProjects()) === '[]');
    await waitFor('the diagnostics to clear', () => !vscode.languages.getDiagnostics().some(([, list]) => list.some((x) => x.source === 'TLC Specs')));
  } finally {
    sub.dispose();
  }
});

test('SF-04 a file created, changed or removed inside a configured folder updates its view', async () => {
  const customTwo = () => api.getProjects().flatMap((p) => p.features).find((f) => f.name === 'custom-two');
  const withoutShall = (f) => f.issues.filter((i) => i.message.includes('sem SHALL')).length;
  await setFolders(['docs/specs', 'packages/api/docs/specs']);
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

test('SF-05 a configured folder without skill artifacts is ignored, unless it is named .specs', async () => {
  await write('notes/specs/readme.md', '# Notes\n');
  await write('notes/specs/features/readme.md', '# Not a feature\n');
  await write('tools/.specs/notes.txt', 'nothing from the skill\n');
  await setFolders(['.specs', 'notes/specs', 'tools/.specs']);
  await waitForRoots(['.specs', 'tools/.specs']);

  await write('notes/specs/lessons.json', '{"lessons": []}');
  await waitForRoots(['.specs', 'notes/specs', 'tools/.specs']);
});

test('SF-10/SF-11 entries that lead to the same folder show it once', async () => {
  await setFolders(['docs/specs', 'docs\\specs\\', 'specs']);
  await waitForRoots(['docs/specs']);
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
    await waitForRoots(['docs/specs']);
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

const projectLabels = () => api.projectTree.getChildren().map((n) => api.projectTree.getTreeItem(n).label).sort();

test('SFP-09 the specs folders of one workspace folder are labelled with its name and the entry, in both trees', async () => {
  const ws = vscode.workspace.workspaceFolders[0].name;
  await setFolders(['.specs', 'docs/specs']);
  await waitForRoots(['.specs', 'docs/specs']);
  assert.deepEqual(groupLabels(), [`${ws} · .specs`, `${ws} · docs/specs`]);
  assert.deepEqual(projectLabels(), [`${ws} · .specs`, `${ws} · docs/specs`]);

  await setFolders(['docs/specs', 'packages/api/docs/specs']);
  await waitForRoots(['docs/specs', 'packages/api/docs/specs']);
  assert.deepEqual(groupLabels(), [`${ws} · docs/specs`, `${ws} · packages/api/docs/specs`]);
  assert.deepEqual(projectLabels(), [`${ws} · docs/specs`, `${ws} · packages/api/docs/specs`]);
});

test('SF-08 an empty list uses .specs', async () => {
  await setFolders([]);
  await waitForRoots(['.specs']);
});

test('specs-folders: restores the default configuration', async () => {
  await setFolders(undefined);
  await waitForRoots(['.specs']);
});

// --- sidebar-dashboard ---------------------------------------------------------------------------------------

/** Stages of the board without features, counted from the model: a feature sits in "done" when complete, else in its phase. */
// A panel opens with its eye closed (PNL-01, HID-01): the board holds the open features in five stages, without Concluídas.
const emptyStagesOf = (projects) => projects.reduce((n, p) => n + 5 - new Set(p.features.filter((f) => f.health !== 'complete').map((f) => f.phase)).size, 0);
const boardNames = (projects) => projects.flatMap((p) => p.features.filter((f) => f.health !== 'complete').map((f) => f.name)).sort();
const hasCompleted = (projects) => projects.some((p) => p.features.some((f) => f.health === 'complete'));

test('SIDE-09/PNL-02/PNL-03 the panel in a tab shows the five open stages side by side at 700px or more, without the completed', async () => {
  await closeAll();
  await vscode.commands.executeCommand('workbench.action.closeSidebar');
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  const report = await waitFor('the tab to render the board', () => {
    const r = api.dashboardReport();
    return r && r.columns ? r : undefined;
  });
  assert.ok(report.width >= 700, `the tab is only ${report.width}px wide`);
  assert.ok(hasCompleted(api.getProjects()), 'the fixture has no completed feature to hide');
  assert.equal(report.columns, 5);
  // Five stages of at least 200px and their four 10px gaps need a 1040px board: a narrower board scrolls sideways.
  // The board, not the page: the page also gives room to its padding and, when it scrolls down, to its scroll bar.
  assert.equal(report.overflow, report.boardWidth < 1040, `overflow with a ${report.boardWidth}px board in a ${report.width}px tab`);
  assert.equal(report.emptyStages, emptyStagesOf(api.getProjects()));
  assert.deepEqual([...report.cards].sort(), boardNames(api.getProjects()));
  assert.equal(report.detail, null);

  // The same tab beside the open side bar: narrower, and still 700px or more.
  await vscode.commands.executeCommand('tlcSpecs.panel.focus');
  const beside = await waitFor('the tab to render beside the side bar', async () => {
    await api.refresh();
    const r = api.dashboardReport();
    return r && r.width < report.width ? r : undefined;
  });
  assert.ok(beside.width >= 700, `the tab is only ${beside.width}px wide beside the side bar`);
  assert.equal(beside.columns, 5);
  assert.equal(beside.overflow, beside.boardWidth < 1040, `overflow with a ${beside.boardWidth}px board in a ${beside.width}px tab`);
  assert.equal(beside.emptyStages, emptyStagesOf(api.getProjects()));

  // The same tab without the side bar and the activity bar: the board fits its five stages and does not scroll sideways.
  await vscode.commands.executeCommand('workbench.action.closeSidebar');
  const workbench = vscode.workspace.getConfiguration('workbench');
  await workbench.update('activityBar.location', 'hidden', vscode.ConfigurationTarget.Global);
  try {
    const wide = await waitFor('the tab to render without the activity bar', async () => {
      await api.refresh();
      const r = api.dashboardReport();
      return r && r.width > report.width ? r : undefined;
    });
    assert.ok(wide.boardWidth >= 1040, `the board is only ${wide.boardWidth}px wide in a ${wide.width}px tab`);
    assert.equal(wide.columns, 5);
    assert.equal(wide.overflow, false, `overflow with a ${wide.boardWidth}px board in a ${wide.width}px tab`);
  } finally {
    await workbench.update('activityBar.location', undefined, vscode.ConfigurationTarget.Global);
    await vscode.commands.executeCommand('tlcSpecs.panel.focus');
  }
});

const showSidePanel =() => vscode.commands.executeCommand('tlcSpecs.panel.focus');
const sideReport = (what, ok) =>
  waitFor(what, () => {
    const r = api.sidePanelReport();
    return r && ok(r) ? r : undefined;
  });
const tabReport = (what, ok) =>
  waitFor(what, () => {
    const r = api.dashboardReport();
    return r && ok(r) ? r : undefined;
  });
const projectIds = () => api.getProjects().map((p) => p.id);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

test('SIDE-01 the side bar has a Painel view with the projects of the panel in a tab', async () => {
  const views = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes.views.tlcSpecs;
  assert.deepEqual(
    views.map((v) => v.id),
    ['tlcSpecs.features', 'tlcSpecs.project', 'tlcSpecs.panel'],
  );
  assert.deepEqual(views[2], { type: 'webview', id: 'tlcSpecs.panel', name: 'Painel' });

  await showSidePanel();
  const side = await sideReport('the side panel to render the projects', (r) => r.projects.length > 0);
  assert.deepEqual(side.projects, projectIds());
  assert.deepEqual([...side.cards].sort(), boardNames(api.getProjects()));
  const tab = await tabReport('the tab to render the projects', (r) => r.projects.length > 0);
  assert.deepEqual(side.projects, tab.projects);
  assert.deepEqual(side.cards, tab.cards);
});

test('SIDE-05 an artifact created, changed or removed in a specs folder shows in the side panel', async () => {
  const phaseOnCard = (r, name) => (r.cards.includes(name) ? r.phases[r.cards.indexOf(name)] : undefined);
  /** Every card with its phase, to compare with every feature of the model. */
  const onCards = (r) => r.cards.map((name, i) => `${name}: ${r.phases[i]}`).sort();
  // The completed features are off the board by default (PNL-02).
  const inModel = () => api.getProjects().flatMap((p) => p.features.filter((f) => f.health !== 'complete').map((f) => `${f.name}: ${f.phaseLabel}`)).sort();
  const tasks = await readFile(path.join(specsDir(), 'features', 'search-filters', 'tasks.md'), 'utf8');
  assert.ok(tasks.includes('- [x] '), 'the fixture has no finished task');
  await showSidePanel();
  await sideReport('the side panel to render', (r) => r.projects.length > 0);

  // created
  await write('.specs/features/side-new/spec.md', SPEC_WITHOUT_SHALL);
  const created = await sideReport('the card of side-new', (r) => r.cards.includes('side-new'));
  assert.deepEqual([...created.cards].sort(), boardNames(api.getProjects()));
  assert.equal(phaseOnCard(created, 'side-new'), feature('side-new').phaseLabel);
  assert.deepEqual(onCards(created), inModel());
  await write('.specs/features/side-new/tasks.md', tasks.replaceAll('- [x] ', '- [ ] '));
  const started = await sideReport('side-new to reach its tasks', (r) => phaseOnCard(r, 'side-new') !== phaseOnCard(created, 'side-new'));
  assert.equal(phaseOnCard(started, 'side-new'), feature('side-new').phaseLabel);
  assert.deepEqual(onCards(started), inModel());

  // changed
  await write('.specs/features/side-new/tasks.md', tasks);
  const changed = await sideReport('side-new to finish its tasks', (r) => phaseOnCard(r, 'side-new') === 'Aguardando verificação');
  assert.equal(feature('side-new').phaseLabel, 'Aguardando verificação');
  assert.notEqual(phaseOnCard(started, 'side-new'), phaseOnCard(changed, 'side-new'));
  assert.deepEqual(onCards(changed), inModel());

  // removed
  await rm(path.join(specsDir(), 'features', 'side-new'), { recursive: true });
  const removed = await sideReport('the card of side-new to go away', (r) => !r.cards.includes('side-new'));
  assert.deepEqual([...removed.cards].sort(), boardNames(api.getProjects()));
  assert.deepEqual(onCards(removed), inModel());
});

test('SIDE-11 without a specs folder the side panel says that no spec was found', async () => {
  await showSidePanel();
  try {
    await setFolders(['nada/aqui']);
    await waitForRoots([]);
    const report = await sideReport('the empty message', (r) => r.emptyMessage !== null);
    assert.equal(report.emptyMessage, 'Nenhuma spec encontrada');
    assert.deepEqual(report.projects, []);
    assert.deepEqual(report.cards, []);
    assert.equal(report.columns, 0);
  } finally {
    await setFolders(undefined);
    await waitForRoots(['.specs']);
  }
  const back = await sideReport('the projects to come back', (r) => same(r.projects, projectIds()));
  assert.equal(back.emptyMessage, null);
});

// --- hidden-specs, panel (spec: .specs/features/hidden-specs/spec.md) ---------------------------------------------
// Before SIDE-03/SIDE-04: these tests need the side panel on the board, and select nothing.

/** Specs out of the board while its eye is closed: the completed and the marked ones, over every project. */
const hiddenCountOf = (projects, marked = []) => projects.reduce((n, p) => n + p.features.filter((f) => f.health === 'complete' || marked.includes(f.name)).length, 0);

test('HID-01 the panel opens with the closed eye and the count of hidden specs, in a tab and in the side bar', async () => {
  const expected = { title: 'Mostrar as specs ocultas', text: ocultas(hiddenCountOf(api.getProjects())) };
  assert.ok(hasCompleted(api.getProjects()), 'the fixture has no completed feature to count');
  await showSidePanel();
  const side = await sideReport('the eye of the side panel', (r) => r.detail === null && r.toggle !== null);
  assert.deepEqual(side.toggle, expected);
  await closeAll();
  await waitFor('the tab to close', () => api.dashboardReport() === undefined);
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  const tab = await tabReport('the eye of a new tab', (r) => r.detail === null && r.toggle !== null);
  assert.deepEqual(tab.toggle, expected);
});

test('HID-11/HID-12 the eye of a card takes the spec off the tab and the side panel and counts it, then brings it back', async () => {
  await showSidePanel();
  const before = hiddenCountOf(api.getProjects());
  assert.ok(boardNames(api.getProjects()).includes('csv-export'), 'csv-export is not on the board');
  try {
    await setHidden(api.sidePanelMessage, 'csv-export', true);
    const off = boardNames(api.getProjects()).filter((n) => n !== 'csv-export');
    const tab = await tabReport('csv-export to leave the tab', (r) => r.detail === null && !r.cards.includes('csv-export'));
    const side = await sideReport('csv-export to leave the side panel', (r) => r.detail === null && !r.cards.includes('csv-export'));
    assert.deepEqual([...tab.cards].sort(), off);
    assert.deepEqual([...side.cards].sort(), off);
    assert.equal(tab.toggle.text, ocultas(before + 1));
    assert.equal(side.toggle.text, ocultas(before + 1));
  } finally {
    await setHidden(api.dashboardMessage, 'csv-export', false);
  }
  const tab = await tabReport('csv-export to come back to the tab', (r) => r.cards.includes('csv-export'));
  const side = await sideReport('csv-export to come back to the side panel', (r) => r.cards.includes('csv-export'));
  assert.deepEqual([...tab.cards].sort(), boardNames(api.getProjects()));
  assert.deepEqual([...side.cards].sort(), boardNames(api.getProjects()));
  assert.equal(tab.toggle.text, ocultas(before));
  assert.equal(side.toggle.text, ocultas(before));
});

test('SIDE-03/SIDE-04 under 700px the side panel stacks the stages, hides the empty ones and never scrolls sideways', async () => {
  // Runs before any feature is selected in the side panel, so it is still on the board.
  await showSidePanel();
  const board = await sideReport('the board in the side panel', (r) => r.detail === null && r.cards.length > 0);
  assert.ok(board.width < 700, `the side panel is ${board.width}px wide`);
  assert.equal(board.columns, 1);
  assert.equal(board.emptyStages, 0);
  assert.equal(board.overflow, false);
  assert.deepEqual([...board.cards].sort(), boardNames(api.getProjects()));

  const details = async () => {
    for (const name of ['user-auth', 'billing-invoices', 'notifications']) {
      await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: name });
      const detail = await sideReport(`the details of ${name}`, (r) => r.detail === name);
      assert.ok(detail.width < 700, `the side panel is ${detail.width}px wide`);
      assert.equal(detail.overflow, false, `${name} scrolls sideways at ${detail.width}px`);
    }
  };

  // Side bars run from 250 to 500px: narrow this one step by step, down to 250px or less.
  /** The report after the side bar was resized: a resize alone renders nothing, a refresh does. */
  const resized = (from, narrower) =>
    waitFor(`the side panel to get ${narrower ? 'narrower' : 'wider'} than ${from}px`, async () => {
      await api.refresh();
      const r = api.sidePanelReport();
      return r && (narrower ? r.width < from : r.width > from) ? r : undefined;
    });
  let narrow = board;
  let steps = 0;
  try {
    while (narrow.width > 250) {
      assert.ok(steps < 40, `the side bar is still ${narrow.width}px wide after ${steps} steps`);
      // The resize commands act on the part that has the focus: a wider editor area is a narrower side bar.
      await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
      await vscode.commands.executeCommand('workbench.action.increaseViewWidth');
      steps++;
      narrow = await resized(narrow.width, true);
      assert.equal(narrow.detail, null);
      assert.equal(narrow.columns, 1, `columns at ${narrow.width}px`);
      assert.equal(narrow.emptyStages, 0, `empty stages at ${narrow.width}px`);
      assert.equal(narrow.overflow, false, `the board scrolls sideways at ${narrow.width}px`);
      assert.deepEqual([...narrow.cards].sort(), boardNames(api.getProjects()));
    }
    assert.ok(narrow.width <= 250, `the narrowest side panel measured was ${narrow.width}px`);
    await details();
  } finally {
    // Give the side bar its width back for the tests that follow.
    await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
    for (; steps > 0; steps--) await vscode.commands.executeCommand('workbench.action.decreaseViewWidth');
  }
  const wide = await resized(narrow.width, false);
  assert.ok(wide.width < 700, `the side panel is ${wide.width}px wide`);
  await details();
});

const dashboardTab = () => allTabs().find((t) => t.input instanceof vscode.TabInputWebview && t.label === 'TLC Specs');

test('SIDE-02 "Abrir feature no painel" shows the feature in the side panel and leaves the editor tabs alone', async () => {
  const { commands } = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes;
  assert.equal(commands.find((c) => c.command === 'tlcSpecs.showFeature').title, 'Abrir feature no painel');

  await closeAll();
  await vscode.commands.executeCommand('tlcSpecs.openFile', projectId(), 'features/user-auth/tasks.md', 1);
  const editor = (await waitFor('text editor', () => vscode.window.activeTextEditor)).document.uri.toString();
  const tabs = allTabs().map((t) => t.label);
  assert.deepEqual(tabs, ['tasks.md']);

  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'notifications' });
  await sideReport('the details of notifications', (r) => r.detail === 'notifications');
  assert.deepEqual(
    allTabs().map((t) => t.label),
    tabs,
  );
  assert.equal(vscode.window.activeTextEditor.document.uri.toString(), editor);
  assert.equal(vscode.window.tabGroups.all.length, 1);

  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'user-auth' });
  await sideReport('the details of user-auth', (r) => r.detail === 'user-auth');
  assert.deepEqual(
    allTabs().map((t) => t.label),
    tabs,
  );
});

test('SIDE-08 "Abrir painel em aba" opens the panel in an editor tab named TLC Specs', async () => {
  const { commands, menus } = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes;
  assert.equal(commands.find((c) => c.command === 'tlcSpecs.openDashboard').title, 'Abrir painel em aba');
  assert.deepEqual(
    menus['view/title'].filter((m) => m.command === 'tlcSpecs.openDashboard').map((m) => m.when),
    ['view == tlcSpecs.features || view == tlcSpecs.panel'],
  );

  await closeAll();
  await waitFor('the tab to close', () => !dashboardTab() && api.dashboardReport() === undefined);
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  await waitFor('the TLC Specs tab', dashboardTab);
  const report = await tabReport('the tab to render the projects', (r) => r.projects.length > 0);
  assert.deepEqual(report.projects, projectIds());
  assert.equal(report.detail, null);

  await closeAll();
  await waitFor('the tab to close', () => !dashboardTab() && api.dashboardReport() === undefined);
  await vscode.commands.executeCommand('tlcSpecs.openDashboard', { projectId: projectId(), feature: 'billing-invoices' });
  await waitFor('the TLC Specs tab', dashboardTab);
  await tabReport('the details of billing-invoices in a new tab', (r) => r.detail === 'billing-invoices');
});

test('SIDE-06 the side panel comes back with the current projects and the selected feature', async () => {
  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'user-auth' });
  await sideReport('the details of user-auth', (r) => r.detail === 'user-auth');
  await vscode.commands.executeCommand('workbench.action.closeSidebar');
  await waitFor('the side panel to hide', () => api.sidePanelReport() === undefined);
  try {
    await setFolders(['.specs', 'docs/specs']);
    await waitForRoots(['.specs', 'docs/specs']);
    assert.equal(api.sidePanelReport(), undefined, 'the hidden side panel rendered something');

    await showSidePanel();
    const report = await sideReport('the side panel to render again', (r) => r.projects.length > 0);
    assert.deepEqual(report.projects, projectIds());
    assert.equal(report.detail, 'user-auth');
  } finally {
    await setFolders(undefined);
    await waitForRoots(['.specs']);
  }
});

test('SIDE-10 the panel in a tab and the side panel are updated together', async () => {
  await closeAll();
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');
  await showSidePanel();
  await tabReport('the tab to render the projects', (r) => same(r.projects, projectIds()));
  await sideReport('the side panel to render the projects', (r) => same(r.projects, projectIds()));
  try {
    await setFolders(['docs/specs']);
    await waitForRoots(['docs/specs']);
    const ids = projectIds();
    const tab = await tabReport('the tab to render docs/specs', (r) => same(r.projects, ids));
    const side = await sideReport('the side panel to render docs/specs', (r) => same(r.projects, ids));
    assert.deepEqual([...tab.cards].sort(), boardNames(api.getProjects()));
    assert.deepEqual([...side.cards].sort(), boardNames(api.getProjects()));
  } finally {
    await setFolders(undefined);
    await waitForRoots(['.specs']);
  }
});

test('SIDE-07 (host) a click on an artifact in the side panel opens the Markdown preview', async () => {
  await closeAll();
  await showSidePanel();
  await api.sidePanelMessage({ type: 'previewFile', projectId: projectId(), file: 'features/user-auth/design.md' });
  await expectPreviewOf('design.md');
  assert.equal(dashboardTab(), undefined, 'the panel tab was opened');
});

test('SIDE-02 the "Abrir painel" button of a notification shows the feature in the side panel', async () => {
  await closeAll();
  const shown = [];
  const original = vscode.window.showInformationMessage;
  vscode.window.showInformationMessage = (message, ...items) => {
    shown.push({ message, items });
    return Promise.resolve(message.includes('side-notified') ? items[0] : undefined);
  };
  try {
    await write('.specs/features/side-notified/spec.md', SPEC_WITHOUT_SHALL);
    await sideReport('the details of side-notified', (r) => r.detail === 'side-notified');
    const toast = shown.find((t) => t.message.includes('side-notified'));
    assert.match(toast.message, /Nova spec detectada: side-notified/);
    assert.deepEqual(toast.items, ['Abrir painel']);
    assert.equal(dashboardTab(), undefined, 'the panel tab was opened');
    assert.deepEqual(
      allTabs().map((t) => t.label),
      [],
    );
  } finally {
    vscode.window.showInformationMessage = original;
  }
});

test('SIDE-02/PNL-05 with the side bar closed, "Abrir feature no painel" brings the panel back on that feature, completed or not', async () => {
  await closeAll();
  await vscode.commands.executeCommand('tlcSpecs.openFile', projectId(), 'features/user-auth/tasks.md', 1);
  const editor = (await waitFor('text editor', () => vscode.window.activeTextEditor)).document.uri.toString();
  await vscode.commands.executeCommand('workbench.action.closeSidebar');
  await waitFor('the side panel to hide', () => api.sidePanelReport() === undefined);

  assert.equal(feature('billing-invoices').health, 'complete');
  await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'billing-invoices' });
  const report = await sideReport('the side panel to come back on billing-invoices', (r) => r.detail === 'billing-invoices');
  assert.deepEqual(report.projects, projectIds());
  assert.deepEqual(
    allTabs().map((t) => t.label),
    ['tasks.md'],
  );
  assert.equal(vscode.window.activeTextEditor.document.uri.toString(), editor);
  assert.equal(vscode.window.tabGroups.all.length, 1);
});

test('HID-15 a spec marked as hidden opens on its details in the side panel, where the board eye is gone', async () => {
  try {
    await setHidden(api.sidePanelMessage, 'csv-export', true);
    await vscode.commands.executeCommand('tlcSpecs.showFeature', { projectId: projectId(), feature: 'csv-export' });
    const report = await sideReport('the details of csv-export', (r) => r.detail === 'csv-export');
    assert.equal(report.toggle, null);
  } finally {
    await setHidden(api.sidePanelMessage, 'csv-export', false);
  }
});

// --- specs-folder-paths (spec: .specs/features/specs-folder-paths/spec.md) ------------------------------------

const tlcDiagnostics = () => vscode.languages.getDiagnostics().filter(([, list]) => list.some((x) => x.source === 'TLC Specs'));
/** Names of the specs the Features tree lists, under the folder nodes or at the top. */
const treeFeatures = () =>
  api.featuresTree
    .getChildren()
    .flatMap((n) => (n.kind === 'root' ? api.featuresTree.getChildren(n) : [n]))
    .map((n) => n.feature.name);
const settingsFile = () => path.join(folder().fsPath, '.vscode', 'settings.json');

test('SFP-03 a spec outside the configured folders stays out of the trees, the panel, the status bar and Problems', async () => {
  await closeAll();
  await setFolders(undefined);
  await waitForRoots(['.specs']);
  await write('test/nested/.specs/features/in-test/spec.md', SPEC_WITHOUT_SHALL);
  // A Handoff gives the folder something to show in the Projeto tree.
  await write('test/nested/.specs/STATE.md', '# STATE\n\n## Decisions\n\n## Handoff\n\n- **Feature**: .specs/features/in-test\n- **Next step**: Write the tasks\n');
  await showSidePanel();
  await vscode.commands.executeCommand('tlcSpecs.openDashboard');

  // Listed, the folder shows everywhere the test looks below.
  try {
    await setFolders(['test/nested/.specs']);
    await waitForRoots(['test/nested/.specs']);
    assert.deepEqual(treeFeatures(), ['in-test']);
    assert.deepEqual([...new Set(api.projectTree.getChildren().map((n) => n.loaded.project.id))], projectIds());
    await tabReport('the tab to show in-test', (r) => r.detail === null && r.cards.includes('in-test'));
    await sideReport('the side panel to render test/nested', (r) => same(r.projects, projectIds()));
    assert.match(api.statusBarText(), /in-test/);
    await waitFor('the diagnostics of test/nested', () => tlcDiagnostics().some(([uri]) => uri.path.includes('/test/nested/.specs/')));
  } finally {
    await setFolders(undefined);
  }
  await waitForRoots(['.specs']);
  assert.ok(!treeFeatures().includes('in-test'), 'in-test is still in the Features tree');
  assert.deepEqual([...new Set(api.projectTree.getChildren().map((n) => n.loaded.project.id))], projectIds());
  await tabReport('the tab to drop in-test', (r) => same(r.projects, projectIds()) && !r.cards.includes('in-test'));
  await sideReport('the side panel to drop test/nested', (r) => same(r.projects, projectIds()));
  assert.doesNotMatch(api.statusBarText(), /in-test/);
  await waitFor('the diagnostics of test/nested to go away', () => !tlcDiagnostics().some(([uri]) => uri.path.includes('/test/nested/')));
});

test('SFP-04 tlcSpecs.specsFolders is the only folder setting, and a leftover tlcSpecs.exclude changes nothing', async () => {
  const properties = vscode.extensions.getExtension('visual-tlc.visual-tlc').packageJSON.contributes.configuration.properties;
  assert.ok(!('tlcSpecs.exclude' in properties), 'tlcSpecs.exclude is still contributed');
  assert.deepEqual(
    Object.keys(properties).filter((key) => /folder|exclude/i.test(key)),
    ['tlcSpecs.specsFolders'],
  );

  // A value left from the older versions: an unregistered key, so it goes straight into the settings file.
  const before = await readFile(settingsFile(), 'utf8').catch(() => '{}');
  const featuresBefore = featuresOf('.specs');
  try {
    await writeFile(settingsFile(), JSON.stringify({ ...JSON.parse(before), 'tlcSpecs.exclude': ['.specs'] }, null, 2));
    await waitFor('the leftover exclude to be read', () => JSON.stringify(vscode.workspace.getConfiguration('tlcSpecs', folder()).get('exclude')) === '[".specs"]');
    await api.refresh();
    assert.deepEqual(roots(), ['.specs']);
    assert.deepEqual(featuresOf('.specs'), featuresBefore);
  } finally {
    await writeFile(settingsFile(), before);
    await waitFor('the leftover exclude to go', () => vscode.workspace.getConfiguration('tlcSpecs', folder()).get('exclude') === undefined);
  }
});

/** Waits until the Features tree has not reloaded for `quietMs`, well past the 300ms the store waits after a change. */
async function treeSettled(quietMs = 1500) {
  let last = Date.now();
  const sub = api.featuresTree.onDidChangeTreeData(() => (last = Date.now()));
  try {
    await waitFor(`the tree to stay still for ${quietMs}ms`, () => Date.now() - last >= quietMs, 15000);
  } finally {
    sub.dispose();
  }
}

test('SFP-05/SFP-06 an entry without a folder is ignored without a warning, and shows once its folder is created', async () => {
  const shown = [];
  const original = vscode.window.showWarningMessage;
  vscode.window.showWarningMessage = (message) => {
    shown.push(message);
    return Promise.resolve(undefined);
  };
  try {
    await setFolders(['.specs', 'later/.specs']);
    // The setting change schedules a reload 300ms later: once it has run, only the watcher can show the new folder.
    await treeSettled();
    assert.deepEqual(roots(), ['.specs']);
    await write('later/.specs/features/late-one/spec.md', SPEC_WITHOUT_SHALL);
    await waitForRoots(['.specs', 'later/.specs']);
    assert.deepEqual(featuresOf('later/.specs'), ['late-one']);
    assert.deepEqual(shown, []);
  } finally {
    vscode.window.showWarningMessage = original;
    await setFolders(undefined);
  }
  await waitForRoots(['.specs']);
});

test('HFD-08 a specs folder without any spec keeps its node in Features with "0 feature(s)", while the folder beside it leaves with every spec hidden', async () => {
  const idOf = (root) => api.getProjects().find((p) => vscode.workspace.asRelativePath(vscode.Uri.parse(p.id), false) === root).id;
  const setHiddenIn = (projectId, feature, hidden) => api.dashboardMessage({ type: 'setHidden', target: { projectId, feature }, hidden });
  await write('bare/.specs/STATE.md', '# STATE\n\n## Decisions\n\n## Handoff\n');
  let specsId;
  let open = [];
  try {
    await setFolders(['.specs', 'bare/.specs']);
    await waitForRoots(['.specs', 'bare/.specs']);
    specsId = idOf('.specs');
    assert.deepEqual(featuresOf('bare/.specs'), []);
    open = api.getProjects().find((p) => p.id === specsId).features.filter((f) => f.health !== 'complete').map((f) => f.name);
    for (const name of open) await setHiddenIn(specsId, name, true);
    const nodes = api.featuresTree.getChildren();
    assert.deepEqual(nodes.map((n) => n.loaded.project.id), [idOf('bare/.specs')]);
    assert.equal(api.featuresTree.getTreeItem(nodes[0]).description, '0 feature(s)');
  } finally {
    for (const name of open) await setHiddenIn(specsId, name, false);
    await setFolders(undefined);
  }
  await waitForRoots(['.specs']);
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
