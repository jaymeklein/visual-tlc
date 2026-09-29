import * as vscode from 'vscode';
import type { Feature, Issue } from '../core/types.ts';
import type { SpecsStore } from './store.ts';

const SEVERITY: Record<Issue['severity'], vscode.DiagnosticSeverity> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
};

/** Mirrors spec/tasks/validation issues into the Problems panel. */
export class SpecDiagnostics implements vscode.Disposable {
  private readonly collection = vscode.languages.createDiagnosticCollection('tlc-specs');

  private readonly store: SpecsStore;

  constructor(store: SpecsStore) {
    this.store = store;
    store.onDidChange(() => this.update());
  }

  private update(): void {
    this.collection.clear();
    if (!vscode.workspace.getConfiguration('tlcSpecs').get<boolean>('diagnostics.enabled', true)) return;
    const byUri = new Map<string, { uri: vscode.Uri; list: vscode.Diagnostic[] }>();
    const add = (projectId: string, file: string, issue: Issue) => {
      const uri = this.store.uriFor(projectId, file);
      if (!uri) return;
      const line = Math.max(0, (issue.line ?? 1) - 1);
      const d = new vscode.Diagnostic(new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER), issue.message, SEVERITY[issue.severity]);
      d.source = 'TLC Specs';
      const entry = byUri.get(uri.toString()) ?? { uri, list: [] };
      entry.list.push(d);
      byUri.set(uri.toString(), entry);
    };
    for (const { project } of this.store.projects) {
      for (const issue of project.issues) if (issue.file) add(project.id, issue.file, issue);
      for (const f of project.features) {
        for (const issue of f.issues) {
          const file = targetFile(f, issue);
          if (file) add(project.id, file, issue);
        }
      }
    }
    for (const { uri, list } of byUri.values()) this.collection.set(uri, list);
  }

  dispose(): void {
    this.collection.dispose();
  }
}

/** Issues about a whole feature (file = its folder) are attached to its main artifact. */
function targetFile(f: Feature, issue: Issue): string | undefined {
  if (!issue.file) return undefined;
  if (/\.(md|json)$/i.test(issue.file)) return issue.file;
  const main = f.files.find((x) => x.kind === 'tasks') ?? f.files.find((x) => x.kind === 'spec') ?? f.files[0];
  return main?.path;
}
