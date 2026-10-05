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
  confirmed: { label: 'Confirmed', icon: 'verified', hint: 'Loaded as guidance in Specify/Design' },
  candidate: { label: 'Candidates', icon: 'eye', hint: 'Under observation — not used as guidance yet' },
  quarantined: { label: 'Quarantined', icon: 'circle-slash', hint: 'Failed when applied — ignored' },
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
      // One node per specs folder, even when there is only one, as in the Features tree.
      return this.store.projects.map((loaded) => ({ kind: 'root', loaded }));
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
          ['Phase / Task', h.phaseTask, 'location'],
          ['Completed', h.completed, 'pass'],
          ['In progress', h.inProgress, 'edit'],
          ['Next step', h.nextStep, 'arrow-right'],
          ['Blockers', h.blockers, 'circle-slash'],
          ['Uncommitted', h.uncommitted, 'diff'],
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
        item.tooltip = 'Snapshot of the last pause (STATE.md › ## Handoff). It is a hypothesis — the skill reconciles it with git on resume.';
        item.command = previewFileCommand(pid, 'STATE.md');
        return item;
      }
      case 'field': {
        const item = new vscode.TreeItem(node.label, C.None);
        item.description = node.value;
        item.tooltip = `${node.label}: ${node.value}`;
        const blocked = node.label === 'Blockers' && !/^(none|nenhum|-|n\/a)\.?$/i.test(node.value);
        item.iconPath = new vscode.ThemeIcon(node.icon, blocked ? new vscode.ThemeColor('list.warningForeground') : undefined);
        item.command = previewFileCommand(pid, 'STATE.md');
        return item;
      }
      case 'decisions': {
        const all = p.state?.decisions ?? [];
        const item = new vscode.TreeItem('Decisions (AD-NNN)', C.Collapsed);
        item.iconPath = new vscode.ThemeIcon('law');
        item.description = `${all.filter((d) => d.active).length} active · ${all.length} total`;
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
          ['Reason', d.reason],
          ['Trade-off', d.tradeoff],
          ['Scope', d.scope],
          ['Date', d.date],
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
        const item = new vscode.TreeItem('Lessons', C.Collapsed);
        item.iconPath = new vscode.ThemeIcon('mortar-board');
        item.description = `${c('confirmed')} confirmed · ${c('candidate')} candidate(s)`;
        item.tooltip = 'The skill\'s lessons layer (.specs/lessons.json) — built from Verifier failures.';
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
        item.tooltip = `${l.text}\n\nSignal: ${l.signal}\nFeatures: ${l.features.join(', ') || '-'}\nRecurrence: ${l.recurrence} · Harmful: ${l.harmful}\nLast seen: ${l.lastSeen || '-'}`;
        item.command = previewFileCommand(pid, 'LESSONS.md');
        return item;
      }
      case 'issues': {
        const item = new vscode.TreeItem('Project issues', C.Expanded);
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
