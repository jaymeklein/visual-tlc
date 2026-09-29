import * as vscode from 'vscode';
import type { Decision, Issue, Lesson, LessonStatus } from '../core/types.ts';
import type { LoadedProject, SpecsStore } from './store.ts';
import { issueIcon, openFileCommand, previewFileCommand } from './common.ts';

type Node =
  | { kind: 'root'; loaded: LoadedProject }
  | { kind: 'handoff'; loaded: LoadedProject }
  | { kind: 'field'; loaded: LoadedProject; label: string; value: string; line: number; icon: string }
  | { kind: 'decisions'; loaded: LoadedProject }
  | { kind: 'decision'; loaded: LoadedProject; decision: Decision }
  | { kind: 'lessons'; loaded: LoadedProject }
  | { kind: 'lessonGroup'; loaded: LoadedProject; status: LessonStatus }
  | { kind: 'lesson'; loaded: LoadedProject; lesson: Lesson }
  | { kind: 'issues'; loaded: LoadedProject }
  | { kind: 'issue'; loaded: LoadedProject; issue: Issue };

const LESSON_GROUP: Record<LessonStatus, { label: string; icon: string; hint: string }> = {
  confirmed: { label: 'Confirmadas', icon: 'verified', hint: 'Carregadas como guia em Specify/Design' },
  candidate: { label: 'Candidatas', icon: 'eye', hint: 'Em observação — ainda não usadas como guia' },
  quarantined: { label: 'Em quarentena', icon: 'circle-slash', hint: 'Falharam quando aplicadas — ignoradas' },
};

export class ProjectTree implements vscode.TreeDataProvider<Node> {
  private readonly emitter = new vscode.EventEmitter<Node | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  private readonly store: SpecsStore;

  constructor(store: SpecsStore) {
    this.store = store;
    store.onDidChange(() => this.emitter.fire(undefined));
  }

  getChildren(node?: Node): Node[] {
    if (!node) {
      const projects = this.store.projects;
      if (projects.length === 1) return this.sections(projects[0]);
      return projects.map((loaded) => ({ kind: 'root', loaded }));
    }
    const { loaded } = node;
    const p = loaded.project;
    switch (node.kind) {
      case 'root':
        return this.sections(loaded);
      case 'handoff': {
        const h = p.state?.handoff;
        if (!h) return [];
        const fields: [string, string, string][] = [
          ['Feature', h.feature, 'symbol-folder'],
          ['Fase / Task', h.phaseTask, 'location'],
          ['Concluídas', h.completed, 'pass'],
          ['Em progresso', h.inProgress, 'edit'],
          ['Próximo passo', h.nextStep, 'arrow-right'],
          ['Bloqueios', h.blockers, 'circle-slash'],
          ['Não commitados', h.uncommitted, 'diff'],
          ['Branch', h.branch, 'git-branch'],
        ];
        return fields.filter(([, v]) => v).map(([label, value, icon]) => ({ kind: 'field', loaded, label, value, line: h.line, icon }));
      }
      case 'decisions':
        return [...(p.state?.decisions ?? [])]
          .sort((a, b) => Number(b.active) - Number(a.active) || b.id.localeCompare(a.id))
          .map((decision) => ({ kind: 'decision', loaded, decision }));
      case 'lessons':
        return (['confirmed', 'candidate', 'quarantined'] as LessonStatus[])
          .filter((status) => p.lessons.some((l) => l.status === status))
          .map((status) => ({ kind: 'lessonGroup', loaded, status }));
      case 'lessonGroup':
        return p.lessons.filter((l) => l.status === node.status).map((lesson) => ({ kind: 'lesson', loaded, lesson }));
      case 'issues':
        return p.issues.map((issue) => ({ kind: 'issue', loaded, issue }));
      default:
        return [];
    }
  }

  getTreeItem(node: Node): vscode.TreeItem {
    const C = vscode.TreeItemCollapsibleState;
    const p = node.loaded.project;
    const pid = p.id;
    switch (node.kind) {
      case 'root': {
        const item = new vscode.TreeItem(p.label, C.Expanded);
        item.iconPath = new vscode.ThemeIcon('folder-library');
        return item;
      }
      case 'handoff': {
        const h = p.state!.handoff!;
        const item = new vscode.TreeItem('Handoff', C.Expanded);
        item.iconPath = new vscode.ThemeIcon('debug-pause');
        item.description = [h.feature, h.phaseTask].filter(Boolean).join(' · ');
        item.tooltip = 'Snapshot da última pausa (STATE.md › ## Handoff). É uma hipótese — a skill reconcilia com o git ao retomar.';
        item.command = previewFileCommand(pid, 'STATE.md');
        return item;
      }
      case 'field': {
        const item = new vscode.TreeItem(node.label, C.None);
        item.description = node.value;
        item.tooltip = `${node.label}: ${node.value}`;
        const blocked = node.label === 'Bloqueios' && !/^(none|nenhum|-|n\/a)\.?$/i.test(node.value);
        item.iconPath = new vscode.ThemeIcon(node.icon, blocked ? new vscode.ThemeColor('list.warningForeground') : undefined);
        item.command = previewFileCommand(pid, 'STATE.md');
        return item;
      }
      case 'decisions': {
        const all = p.state?.decisions ?? [];
        const item = new vscode.TreeItem('Decisões (AD-NNN)', C.Collapsed);
        item.iconPath = new vscode.ThemeIcon('law');
        item.description = `${all.filter((d) => d.active).length} ativa(s) · ${all.length} no total`;
        return item;
      }
      case 'decision': {
        const d = node.decision;
        const item = new vscode.TreeItem(d.id, C.None);
        item.description = d.decision;
        item.iconPath = new vscode.ThemeIcon(d.active ? 'pass' : 'history', d.active ? new vscode.ThemeColor('testing.iconPassed') : new vscode.ThemeColor('disabledForeground'));
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${d.id}** ${d.active ? '' : `_(${d.status})_`}\n\n`);
        md.appendText(d.decision + '\n\n');
        for (const [k, v] of [
          ['Motivo', d.reason],
          ['Trade-off', d.tradeoff],
          ['Escopo', d.scope],
          ['Data', d.date],
          ['Status', d.status],
        ]) {
          if (v) md.appendMarkdown(`- **${k}:** `).appendText(v + '\n');
        }
        item.tooltip = md;
        item.command = previewFileCommand(pid, 'STATE.md');
        return item;
      }
      case 'lessons': {
        const c = (s: LessonStatus) => p.lessons.filter((l) => l.status === s).length;
        const item = new vscode.TreeItem('Lições', C.Collapsed);
        item.iconPath = new vscode.ThemeIcon('mortar-board');
        item.description = `${c('confirmed')} confirmada(s) · ${c('candidate')} candidata(s)`;
        item.tooltip = 'Camada de lições da skill (.specs/lessons.json) — gerada a partir de falhas do Verifier.';
        item.command = previewFileCommand(pid, 'LESSONS.md');
        return item;
      }
      case 'lessonGroup': {
        const g = LESSON_GROUP[node.status];
        const item = new vscode.TreeItem(g.label, node.status === 'confirmed' ? C.Expanded : C.Collapsed);
        item.iconPath = new vscode.ThemeIcon(g.icon);
        item.description = `${p.lessons.filter((l) => l.status === node.status).length}`;
        item.tooltip = g.hint;
        return item;
      }
      case 'lesson': {
        const l = node.lesson;
        const item = new vscode.TreeItem(`${l.id}: ${l.text}`, C.None);
        item.description = [l.scope, `×${l.recurrence}`].filter(Boolean).join(' · ');
        item.tooltip = `${l.text}\n\nSinal: ${l.signal}\nFeatures: ${l.features.join(', ') || '-'}\nRecorrência: ${l.recurrence} · Prejudicial: ${l.harmful}\nÚltima vez: ${l.lastSeen || '-'}`;
        item.command = previewFileCommand(pid, 'LESSONS.md');
        return item;
      }
      case 'issues': {
        const item = new vscode.TreeItem('Avisos do projeto', C.Expanded);
        item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground'));
        item.description = `${p.issues.length}`;
        return item;
      }
      case 'issue': {
        const item = new vscode.TreeItem(node.issue.message, C.None);
        item.iconPath = issueIcon(node.issue.severity);
        if (node.issue.file) item.command = openFileCommand(pid, node.issue.file, node.issue.line);
        return item;
      }
    }
  }

  private sections(loaded: LoadedProject): Node[] {
    const p = loaded.project;
    const out: Node[] = [];
    if (p.state?.handoff) out.push({ kind: 'handoff', loaded });
    if (p.state?.decisions.length) out.push({ kind: 'decisions', loaded });
    if (p.lessons.length) out.push({ kind: 'lessons', loaded });
    if (p.issues.length) out.push({ kind: 'issues', loaded });
    return out;
  }
}
