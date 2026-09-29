import * as vscode from 'vscode';
import type { FeatureRef, FromWebview } from './core/protocol.ts';
import type { Project } from './core/types.ts';
import { SpecsStore } from './ui/store.ts';
import { artifactTarget, FeaturesTree, type FeatureNode } from './ui/featuresTree.ts';
import { ProjectTree } from './ui/projectTree.ts';
import { StatusBar } from './ui/statusBar.ts';
import { SpecDiagnostics } from './ui/diagnostics.ts';
import { PhaseNotifier } from './ui/notifier.ts';
import { Dashboard } from './ui/dashboard.ts';
import { openUri, previewUri } from './ui/common.ts';
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
  dashboardMessage(message: FromWebview): Promise<void>;
  dashboardProjects(): readonly string[] | undefined;
  statusBarText(): string | undefined;
  featuresTree: vscode.TreeDataProvider<unknown>;
  projectTree: vscode.TreeDataProvider<unknown>;
}

export async function activate(context: vscode.ExtensionContext): Promise<TlcSpecsApi> {
  const store = new SpecsStore();
  const dashboard = new Dashboard(context.extensionUri, store);
  const featuresTree = new FeaturesTree(store);
  const projectTree = new ProjectTree(store);
  const featuresView = vscode.window.createTreeView('tlcSpecs.features', { treeDataProvider: featuresTree, showCollapseAll: true });
  const projectView = vscode.window.createTreeView('tlcSpecs.project', { treeDataProvider: projectTree });
  const statusBar = new StatusBar(store);
  new PhaseNotifier(store, (ref) => dashboard.show(ref));

  context.subscriptions.push(
    store,
    dashboard,
    featuresView,
    projectView,
    statusBar,
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
    vscode.commands.registerCommand('tlcSpecs.previewFile', async (projectId: string, file: string) => {
      const uri = store.uriFor(projectId, file);
      if (uri) await previewUri(uri);
    }),
    vscode.commands.registerCommand('tlcSpecs.openInEditor', async (node: Parameters<typeof artifactTarget>[0]) => {
      const target = artifactTarget(node);
      const uri = target && store.uriFor(target.projectId, target.file);
      if (uri) await openUri(uri, target.line);
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
    dashboardMessage: (message) => dashboard.onMessage(message),
    dashboardProjects: () => dashboard.posted,
    statusBarText: () => statusBar.text,
    featuresTree: featuresTree as vscode.TreeDataProvider<unknown>,
    projectTree: projectTree as vscode.TreeDataProvider<unknown>,
  };
}

export function deactivate(): void {}
