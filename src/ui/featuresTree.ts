import * as vscode from 'vscode';
import type { Feature, FeatureFile, Issue, Requirement, Stage, StageId, Task, TaskPhase } from '../core/types.ts';
import { plain } from '../core/markdown.ts';
import { HEALTH_LABEL, progressBar, REQ_STATUS_LABEL, STAGE_LABEL, STAGE_STATE_LABEL, TASK_STATUS_LABEL } from '../core/labels.ts';
import type { LoadedProject, SpecsStore } from './store.ts';
import { issueIcon, openFileCommand, previewFileCommand } from './common.ts';
import { isHidden, type HiddenSpecs } from '../core/hidden.ts';

type Node =
  | { kind: 'root'; loaded: LoadedProject }
  | { kind: 'feature'; loaded: LoadedProject; feature: Feature }
  | { kind: 'stage'; loaded: LoadedProject; feature: Feature; stage: Stage }
  | { kind: 'phase'; loaded: LoadedProject; feature: Feature; phase: TaskPhase; via: StageId }
  | { kind: 'task'; loaded: LoadedProject; feature: Feature; task: Task; via: StageId }
  | { kind: 'detail'; loaded: LoadedProject; feature: Feature; task: Task; via: StageId; index: number; label: string; value?: string; icon: vscode.ThemeIcon }
  | { kind: 'reqs'; loaded: LoadedProject; feature: Feature }
  | { kind: 'req'; loaded: LoadedProject; feature: Feature; req: Requirement }
  | { kind: 'files'; loaded: LoadedProject; feature: Feature }
  | { kind: 'file'; loaded: LoadedProject; feature: Feature; file: FeatureFile }
  | { kind: 'issues'; loaded: LoadedProject; feature: Feature }
  | { kind: 'issue'; loaded: LoadedProject; issue: Issue };

export type FeatureNode = Extract<Node, { kind: 'feature' }>;

/** File (and line) behind an artifact row: what "Abrir no editor" opens. */
export function artifactTarget(node: Node): { projectId: string; file: string; line?: number } | undefined {
  const projectId = node.loaded.project.id;
  switch (node.kind) {
    case 'stage':
      return node.stage.file ? { projectId, file: node.stage.file } : undefined;
    case 'phase':
      return { projectId, file: `${node.feature.dir}/tasks.md`, line: node.phase.line };
    case 'req':
      return { projectId, file: `${node.feature.dir}/spec.md`, line: node.req.line };
    case 'file':
      return { projectId, file: node.file.path };
    default:
      return undefined;
  }
}

const color = (id: string) => new vscode.ThemeColor(id);
const icon = (id: string, c?: string) => new vscode.ThemeIcon(id, c ? color(c) : undefined);

const STAGE_ICON: Record<Stage['state'], vscode.ThemeIcon> = {
  done: icon('pass-filled', 'testing.iconPassed'),
  active: icon('circle-large-filled', 'charts.blue'),
  pending: icon('circle-large-outline', 'disabledForeground'),
  skipped: icon('circle-slash', 'disabledForeground'),
  failed: icon('error', 'testing.iconFailed'),
};

const TASK_ICON: Record<Task['status'], vscode.ThemeIcon> = {
  done: icon('pass', 'testing.iconPassed'),
  'in-progress': icon('sync', 'charts.blue'),
  blocked: icon('error', 'testing.iconFailed'),
  pending: icon('circle-large-outline', 'disabledForeground'),
};

const PHASE_ICON: Record<Feature['phase'], string> = {
  spec: 'note',
  design: 'symbol-structure',
  tasks: 'checklist',
  execute: 'play-circle',
  verify: 'shield',
};

export class FeaturesTree implements vscode.TreeDataProvider<Node> {
  private readonly emitter = new vscode.EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  private readonly store: SpecsStore;
  private readonly hidden: HiddenSpecs;
  /** Eye of the view title: open lists the hidden specs too. Closed at every start. */
  private show = false;

  constructor(store: SpecsStore, hidden: HiddenSpecs) {
    this.store = store;
    this.hidden = hidden;
    store.onDidChange(() => this.emitter.fire(undefined));
    hidden.onDidChange(() => this.emitter.fire(undefined));
  }

  /** Opens or closes the eye of the view title; the context key picks which of its two buttons shows. */
  setShowHidden(show: boolean): void {
    this.show = show;
    void vscode.commands.executeCommand('setContext', 'tlcSpecs.showHidden', show);
    this.emitter.fire(undefined);
  }

  /** Specs left out of the tree: the hidden ones while the eye is closed, none while it is open. */
  outOfTree(): number {
    return this.show ? 0 : this.store.projects.reduce((n, loaded) => n + loaded.project.features.filter((f) => this.isHidden(loaded, f)).length, 0);
  }

  private isHidden(loaded: LoadedProject, f: Feature): boolean {
    return isHidden(f, this.hidden.choiceOf({ projectId: loaded.project.id, feature: f.name }));
  }

  getChildren(node?: Node): Node[] {
    if (!node) {
      // One node per specs folder, even when there is only one: the tree always says where the specs come from.
      return this.store.projects.map((loaded) => ({ kind: 'root', loaded }));
    }
    const { loaded } = node;
    switch (node.kind) {
      case 'root':
        return this.featureNodes(loaded);
      case 'feature': {
        const f = node.feature;
        const out: Node[] = f.stages.map((stage) => ({ kind: 'stage', loaded, feature: f, stage }));
        if (f.spec?.requirements.length) out.push({ kind: 'reqs', loaded, feature: f });
        if (f.files.length) out.push({ kind: 'files', loaded, feature: f });
        if (f.issues.length) out.push({ kind: 'issues', loaded, feature: f });
        return out;
      }
      case 'stage': {
        const tasks = node.feature.tasks;
        if (!listsTasks(node.stage.id) || !tasks || tasks.tasks.length === 0) return [];
        const via = node.stage.id;
        const phased = tasks.phases.filter((p) => p.taskIds.length > 0);
        const loose = tasks.tasks.filter((t) => t.phase === null || !phased.some((p) => p.number === t.phase));
        if (phased.length <= 1) return tasks.tasks.map((task) => ({ kind: 'task', loaded, feature: node.feature, task, via }));
        return [
          ...phased.map((phase): Node => ({ kind: 'phase', loaded, feature: node.feature, phase, via })),
          ...loose.map((task): Node => ({ kind: 'task', loaded, feature: node.feature, task, via })),
        ];
      }
      case 'phase':
        return (node.feature.tasks?.tasks ?? [])
          .filter((t) => t.phase === node.phase.number)
          .map((task) => ({ kind: 'task', loaded, feature: node.feature, task, via: node.via }));
      case 'task':
        return taskDetails(node);
      case 'reqs':
        return (node.feature.spec?.requirements ?? []).map((req) => ({ kind: 'req', loaded, feature: node.feature, req }));
      case 'files':
        return node.feature.files.map((file) => ({ kind: 'file', loaded, feature: node.feature, file }));
      case 'issues':
        return sortIssues(node.feature.issues).map((issue) => ({ kind: 'issue', loaded, issue }));
      default:
        return [];
    }
  }

  getTreeItem(node: Node): vscode.TreeItem {
    const C = vscode.TreeItemCollapsibleState;
    const pid = node.loaded.project.id;
    switch (node.kind) {
      case 'root': {
        const p = node.loaded.project;
        const item = new vscode.TreeItem(p.label, C.Expanded);
        item.iconPath = icon('folder-library');
        item.description = `${p.features.length} feature(s)`;
        item.id = `root:${pid}`;
        return item;
      }
      case 'feature':
        return this.featureItem(node);
      case 'stage': {
        const { stage, feature } = node;
        const expandable = listsTasks(stage.id) && (feature.tasks?.tasks.length ?? 0) > 0;
        const item = new vscode.TreeItem(STAGE_LABEL[stage.id], expandable ? (stage.state === 'active' ? C.Expanded : C.Collapsed) : C.None);
        item.id = `stage:${pid}:${feature.name}:${stage.id}`;
        item.iconPath = STAGE_ICON[stage.state];
        item.description = stage.detail;
        item.tooltip = `${STAGE_LABEL[stage.id]} — ${STAGE_STATE_LABEL[stage.state]}\n${stage.detail}`;
        if (stage.file) {
          item.command = previewFileCommand(pid, stage.file);
          item.contextValue = 'artifact';
        }
        return item;
      }
      case 'phase': {
        const tasks = (node.feature.tasks?.tasks ?? []).filter((t) => t.phase === node.phase.number);
        const done = tasks.filter((t) => t.status === 'done').length;
        const item = new vscode.TreeItem(`Phase ${node.phase.number}${node.phase.name ? `: ${node.phase.name}` : ''}`, done === tasks.length ? C.Collapsed : C.Expanded);
        item.id = `phase:${pid}:${node.feature.name}:${node.via}:${node.phase.number}`;
        item.description = `${done}/${tasks.length}`;
        item.iconPath = done === tasks.length ? icon('pass-filled', 'testing.iconPassed') : done > 0 ? icon('circle-large-filled', 'charts.blue') : icon('circle-large-outline');
        item.command = previewFileCommand(pid, `${node.feature.dir}/tasks.md`);
        item.contextValue = 'artifact';
        return item;
      }
      case 'task': {
        // Read-only: expanding shows the details; no command, so a click never opens tasks.md.
        const t = node.task;
        const item = new vscode.TreeItem(`${t.id}: ${t.title}`, taskDetails(node).length ? C.Collapsed : C.None);
        item.id = `task:${pid}:${node.feature.name}:${node.via}:${t.id}:${t.line}`;
        item.iconPath = TASK_ICON[t.status];
        const checks = t.doneWhen.length ? ` · ${t.doneWhen.filter((c) => c.checked).length}/${t.doneWhen.length}` : '';
        item.description = `${t.requirements.join(', ')}${checks}`;
        item.tooltip = taskTooltip(t);
        return item;
      }
      case 'detail': {
        const item = new vscode.TreeItem(node.label, C.None);
        item.id = `detail:${pid}:${node.feature.name}:${node.via}:${node.task.id}:${node.task.line}:${node.index}`;
        item.description = node.value;
        item.tooltip = node.value ? `${node.label}: ${node.value}` : node.label;
        item.iconPath = node.icon;
        return item;
      }
      case 'reqs': {
        const s = node.feature.requirementStats;
        const item = new vscode.TreeItem('Requisitos', C.Collapsed);
        item.id = `reqs:${pid}:${node.feature.name}`;
        item.iconPath = icon('references');
        item.description = `${s.verified}/${s.total} verificados`;
        return item;
      }
      case 'req': {
        const r = node.req;
        const item = new vscode.TreeItem(r.id, C.None);
        item.id = `req:${pid}:${node.feature.name}:${r.id}:${r.line}`;
        item.description = `${r.story} · ${r.status}`;
        item.tooltip = `${r.id} — ${r.story}\nFase: ${r.phase || '-'}\nStatus: ${r.status} (${REQ_STATUS_LABEL[r.statusKind]})`;
        item.iconPath =
          r.statusKind === 'verified'
            ? icon('verified-filled', 'testing.iconPassed')
            : r.statusKind === 'needs-fix'
              ? icon('error', 'testing.iconFailed')
              : r.statusKind === 'implementing'
                ? icon('sync', 'charts.blue')
                : icon('circle-small');
        item.command = previewFileCommand(pid, `${node.feature.dir}/spec.md`);
        item.contextValue = 'artifact';
        return item;
      }
      case 'files': {
        const item = new vscode.TreeItem('Arquivos', C.Collapsed);
        item.id = `files:${pid}:${node.feature.name}`;
        item.iconPath = icon('files');
        item.description = `${node.feature.files.length}`;
        return item;
      }
      case 'file': {
        const uri = this.store.uriFor(pid, node.file.path);
        const item = uri ? new vscode.TreeItem(uri, C.None) : new vscode.TreeItem(node.file.name, C.None);
        item.id = `file:${pid}:${node.file.path}`;
        item.description = node.file.empty ? 'vazio' : node.file.kind === 'other' ? 'extra' : undefined;
        item.command = previewFileCommand(pid, node.file.path);
        item.contextValue = 'artifact';
        return item;
      }
      case 'issues': {
        const errors = node.feature.issues.filter((i) => i.severity === 'error').length;
        const warnings = node.feature.issues.filter((i) => i.severity === 'warning').length;
        const item = new vscode.TreeItem('Avisos', errors ? C.Expanded : C.Collapsed);
        item.id = `issues:${pid}:${node.feature.name}`;
        item.iconPath = errors ? icon('error', 'list.errorForeground') : warnings ? icon('warning', 'list.warningForeground') : icon('info');
        item.description = [errors && `${errors} erro(s)`, warnings && `${warnings} aviso(s)`].filter(Boolean).join(' · ') || `${node.feature.issues.length} nota(s)`;
        return item;
      }
      case 'issue': {
        const item = new vscode.TreeItem(node.issue.message, C.None);
        item.iconPath = issueIcon(node.issue.severity);
        item.tooltip = node.issue.message + (node.issue.file ? `\n${node.issue.file}${node.issue.line ? `:${node.issue.line}` : ''}` : '');
        if (node.issue.file) item.command = openFileCommand(pid, node.issue.file, node.issue.line);
        return item;
      }
    }
  }

  private featureNodes(loaded: LoadedProject): Node[] {
    return loaded.project.features.filter((f) => this.show || !this.isHidden(loaded, f)).map((feature) => ({ kind: 'feature', loaded, feature }));
  }

  private featureItem(node: FeatureNode): vscode.TreeItem {
    const f = node.feature;
    const item = new vscode.TreeItem(f.name, f.active ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed);
    item.id = `feature:${node.loaded.project.id}:${f.name}`;
    const marked = this.hidden.isMarked({ projectId: node.loaded.project.id, feature: f.name });
    // Picks the eye of the row: a completed spec has none (package.json, view/item/context).
    item.contextValue = f.health === 'complete' ? 'feature.done' : marked ? 'feature.hidden' : 'feature';
    const errors = f.issues.filter((i) => i.severity === 'error').length;
    item.description = `${f.active ? '● ' : ''}${f.phaseLabel} · ${Math.round(f.progress * 100)}%${errors ? ` · ${errors} erro(s)` : ''}${marked ? ' · oculta' : ''}`;
    item.iconPath =
      f.health === 'complete'
        ? icon('pass-filled', 'testing.iconPassed')
        : f.health === 'failed'
          ? icon('error', 'testing.iconFailed')
          : f.health === 'attention'
            ? icon('warning', 'list.warningForeground')
            : icon(PHASE_ICON[f.phase], 'charts.blue');
    item.tooltip = featureTooltip(f);
    return item;
  }
}

/** Stages whose rows expand into the task list. */
function listsTasks(stage: StageId): boolean {
  return stage === 'tasks' || stage === 'execute';
}

function taskDetails(node: Extract<Node, { kind: 'task' }>): Node[] {
  const t = node.task;
  const rows: [string, string, vscode.ThemeIcon][] = [
    ['O quê', t.what, icon('info')],
    ['Onde', plain(t.where), icon('file')],
    ['Depende de', t.dependsOn.join(', ') || 'nenhuma', icon('arrow-left')],
    ['Requisitos', t.requirements.join(', '), icon('references')],
    ['Tests / Gate', [t.tests, t.gate].filter(Boolean).join(' · '), icon('beaker')],
  ];
  const base = { kind: 'detail' as const, loaded: node.loaded, feature: node.feature, task: t, via: node.via };
  const fields = rows.filter(([, value]) => value).map(([label, value, i]) => ({ label, value, icon: i }));
  const checks = t.doneWhen.map((c) => ({ label: c.text, value: undefined, icon: c.checked ? icon('pass', 'testing.iconPassed') : icon('circle-large-outline') }));
  return [...fields, ...checks].map((row, index) => ({ ...base, index, ...row }));
}

function sortIssues(issues: Issue[]): Issue[] {
  const rank = { error: 0, warning: 1, info: 2 } as const;
  return [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

function taskTooltip(t: Task): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**${t.id}: ${escapeMd(t.title)}** — ${TASK_STATUS_LABEL[t.status]}\n\n`);
  if (t.what) md.appendMarkdown(`${escapeMd(t.what)}\n\n`);
  const rows: [string, string][] = [
    ['Onde', t.where],
    ['Depende de', t.dependsOn.join(', ') || 'nenhuma'],
    ['Requisitos', t.requirements.join(', ')],
    ['Tests / Gate', [t.tests, t.gate].filter(Boolean).join(' / ')],
  ];
  for (const [k, v] of rows) if (v) md.appendMarkdown(`- ${k}: ${escapeMd(v)}\n`);
  if (t.doneWhen.length) {
    md.appendMarkdown('\n**Done when**\n\n');
    for (const c of t.doneWhen) md.appendMarkdown(`- ${c.checked ? '☑' : '☐'} ${escapeMd(c.text)}\n`);
  }
  return md;
}

export function featureTooltip(f: Feature): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**${escapeMd(f.name)}**${f.spec?.title ? ` — ${escapeMd(f.spec.title)}` : ''}\n\n`);
  md.appendMarkdown(`${f.phaseLabel} · ${HEALTH_LABEL[f.health]}${f.active ? ' · em foco no handoff' : ''}\n\n`);
  md.appendMarkdown(`\`${progressBar(f.progress)}\` ${Math.round(f.progress * 100)}%\n\n`);
  md.appendMarkdown(f.stages.map((s) => `${s.state === 'done' ? '✔' : s.state === 'active' ? '◉' : s.state === 'failed' ? '✖' : s.state === 'skipped' ? '⊘' : '○'} ${STAGE_LABEL[s.id]}`).join(' → ') + '\n\n');
  if (f.taskStats.total) md.appendMarkdown(`Tasks: ${f.taskStats.done}/${f.taskStats.total} concluídas\n\n`);
  if (f.requirementStats.total) md.appendMarkdown(`Requisitos: ${f.requirementStats.verified}/${f.requirementStats.total} verificados\n\n`);
  md.appendMarkdown(`**Próximo passo:** ${escapeMd(f.nextStep)}`);
  const errors = f.issues.filter((i) => i.severity === 'error').length;
  const warnings = f.issues.filter((i) => i.severity === 'warning').length;
  if (errors || warnings) md.appendMarkdown(`\n\n$(warning) ${errors} erro(s), ${warnings} aviso(s)`);
  md.supportThemeIcons = true;
  return md;
}

function escapeMd(s: string): string {
  return s.replace(/[\\`*_{}[\]<>()#+\-.!|]/g, '\\$&');
}
