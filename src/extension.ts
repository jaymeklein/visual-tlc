import * as vscode from 'vscode';
import type { FeatureRef } from './core/protocol.ts';
import type { Project } from './core/types.ts';
import { SpecsStore } from './ui/store.ts';
import { FeaturesTree, type FeatureNode } from './ui/featuresTree.ts';
import { ProjectTree } from './ui/projectTree.ts';
import { StatusBar } from './ui/statusBar.ts';
import { SpecDiagnostics } from './ui/diagnostics.ts';
import { PhaseNotifier } from './ui/notifier.ts';
import { Dashboard } from './ui/dashboard.ts';
import { openUri } from './ui/common.ts';
import { previewFeatureMarkdown, revealFeatureFolder } from './ui/featureActions.ts';

/** Tree rows pass their node; the status bar and tests pass a plain ref. */
function toRef(arg: FeatureNode | FeatureRef): FeatureRef {
  return 'kind' in arg ? { projectId: arg.loaded.project.id, feature: arg.feature.name } : arg;
}

/** Read-only API returned from activate() (used by the integration tests). */
export interface TlcSpecsApi {
  getProjects(): readonly Project[];
  refresh(): Promise<void>;
  dashboardHealth(): { ready: boolean; errors: readonly string[] };
}

export async function activate(context: vscode.ExtensionContext): Promise<TlcSpecsApi> {
  const store = new SpecsStore();
  const dashboard = new Dashboard(context.extensionUri, store);
  const featuresView = vscode.window.createTreeView('tlcSpecs.features', { treeDataProvider: new FeaturesTree(store), showCollapseAll: true });
  const projectView = vscode.window.createTreeView('tlcSpecs.project', { treeDataProvider: new ProjectTree(store) });
  new PhaseNotifier(store, (ref) => dashboard.show(ref));

  context.subscriptions.push(
    store,
    dashboard,
    featuresView,
    projectView,
    new StatusBar(store),
    new SpecDiagnostics(store),
    vscode.commands.registerCommand('tlcSpecs.refresh', () => store.refresh()),
    vscode.commands.registerCommand('tlcSpecs.openDashboard', () => dashboard.show()),
    vscode.commands.registerCommand('tlcSpecs.showFeature', (arg?: FeatureNode | FeatureRef) => dashboard.show(arg ? toRef(arg) : undefined)),
    vscode.commands.registerCommand('tlcSpecs.previewFeatureMarkdown', (arg: FeatureNode | FeatureRef) => previewFeatureMarkdown(store, toRef(arg))),
    vscode.commands.registerCommand('tlcSpecs.revealFeatureFolder', (arg: FeatureNode | FeatureRef) => revealFeatureFolder(store, toRef(arg))),
    vscode.commands.registerCommand('tlcSpecs.openFile', async (projectId: string, file: string, line?: number) => {
      const uri = store.uriFor(projectId, file);
      if (uri) await openUri(uri, line);
    }),
    store.onDidChange(() => {
      const features = store.projects.flatMap((p) => p.project.features);
      void vscode.commands.executeCommand('setContext', 'tlcSpecs.hasSpecs', store.projects.length > 0);
      const needAttention = features.filter((f) => f.health === 'failed' || f.issues.some((i) => i.severity === 'error')).length;
      featuresView.badge = needAttention ? { value: needAttention, tooltip: `${needAttention} feature(s) precisam de atenção` } : undefined;
      const done = features.filter((f) => f.health === 'complete').length;
      featuresView.message = features.length ? `${features.length} feature(s) · ${done} concluída(s)` : undefined;
    }),
  );

  await store.refresh();
  return {
    getProjects: () => store.projects.map((p) => p.project),
    refresh: () => store.refresh(),
    dashboardHealth: () => dashboard.health,
  };
}

export function deactivate(): void {}
