import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import type { FeatureRef, FromWebview, ToWebview } from '../core/protocol.ts';
import type { SpecsStore } from './store.ts';
import { openUri } from './common.ts';
import { previewFeatureMarkdown, revealFeatureFolder } from './featureActions.ts';

export class Dashboard implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private pendingSelect: FeatureRef | null | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  /** Webview health, surfaced for the integration tests. */
  readonly health = { ready: false, errors: [] as string[] };

  private readonly extensionUri: vscode.Uri;
  private readonly store: SpecsStore;

  constructor(extensionUri: vscode.Uri, store: SpecsStore) {
    this.extensionUri = extensionUri;
    this.store = store;
    this.disposables.push(store.onDidChange(() => this.postState()));
  }

  /** Opens (or focuses) the dashboard; with a target it jumps straight to that feature. */
  show(target?: FeatureRef): void {
    if (target !== undefined) this.pendingSelect = target;
    if (this.panel) {
      this.panel.reveal(undefined, false);
      this.flushSelect();
      return;
    }
    const panel = vscode.window.createWebviewPanel('tlcSpecs.dashboard', 'TLC Specs', vscode.ViewColumn.Active, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist'), vscode.Uri.joinPath(this.extensionUri, 'media')],
    });
    panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'tlc-color.svg');
    panel.webview.html = this.html(panel.webview);
    panel.webview.onDidReceiveMessage((m: FromWebview) => this.onMessage(m), undefined, this.disposables);
    panel.onDidDispose(() => (this.panel = undefined), undefined, this.disposables);
    this.panel = panel;
  }

  private async onMessage(m: FromWebview): Promise<void> {
    switch (m.type) {
      case 'ready':
        this.health.ready = true;
        this.postState();
        this.flushSelect();
        break;
      case 'refresh':
        await this.store.refresh();
        break;
      case 'error':
        this.health.errors.push(m.message);
        console.error('[tlc-specs] dashboard error:', m.message);
        break;
      case 'previewMarkdown':
        await previewFeatureMarkdown(this.store, m.target);
        break;
      case 'revealFolder':
        await revealFeatureFolder(this.store, m.target);
        break;
      case 'open': {
        const uri = this.store.uriFor(m.projectId, m.file);
        if (uri) await openUri(uri, m.line);
        break;
      }
    }
  }

  private post(message: ToWebview): void {
    void this.panel?.webview.postMessage(message);
  }

  private postState(): void {
    this.post({ type: 'state', projects: this.store.projects.map((p) => p.project), now: Date.now() });
  }

  private flushSelect(): void {
    if (this.pendingSelect === undefined) return;
    this.post({ type: 'select', target: this.pendingSelect });
    this.pendingSelect = undefined;
  }

  private html(webview: vscode.Webview): string {
    const nonce = randomBytes(16).toString('hex');
    const script = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js'));
    const style = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'dashboard.css'));
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${style}" rel="stylesheet">
  <title>TLC Specs</title>
</head>
<body>
  <main id="app" aria-live="polite"><p class="empty">Carregando specs…</p></main>
  <script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
  }

  dispose(): void {
    this.panel?.dispose();
    for (const d of this.disposables) d.dispose();
  }
}
