import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import type { FeatureRef, FromWebview, Rendered, ToWebview } from '../core/protocol.ts';
import type { SpecsStore } from './store.ts';
import type { HiddenSpecs } from '../core/hidden.ts';
import { openUri, previewUri } from './common.ts';
import { previewFeatureMarkdown, revealFeatureFolder } from './featureActions.ts';

/** Id of the side bar view (package.json, contributes.views). */
export const PANEL_VIEW = 'tlcSpecs.panel';

/** One place the dashboard is drawn: the editor tab or the side bar view. Same page, same messages. */
class Surface implements vscode.Disposable {
  private webview: vscode.Webview | undefined;
  private pendingSelect: FeatureRef | null | undefined;
  /**
   * True from the webview's "ready" until it is hidden or gone; a selection made meanwhile waits for the next "ready".
   * VS Code 1.120 delivers a message posted to a page that is still loading, so nothing fails there without this.
   * It stays because the older versions this extension accepts (from 1.90) were not checked.
   */
  private live = false;
  private readonly disposables: vscode.Disposable[] = [];
  /** Webview health, surfaced for the integration tests. */
  readonly health = { ready: false, errors: [] as string[] };
  /** What the webview last rendered, undefined while there is none (for the integration tests). */
  rendered: Rendered | undefined;

  private readonly extensionUri: vscode.Uri;
  private readonly store: SpecsStore;
  private readonly hidden: HiddenSpecs;
  /** Class of the page body: "side" takes the side bar colors. */
  private readonly bodyClass: string;

  constructor(extensionUri: vscode.Uri, store: SpecsStore, hidden: HiddenSpecs, bodyClass: string) {
    this.extensionUri = extensionUri;
    this.store = store;
    this.hidden = hidden;
    this.bodyClass = bodyClass;
  }

  get options(): vscode.WebviewOptions {
    return {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist'), vscode.Uri.joinPath(this.extensionUri, 'media')],
    };
  }

  attach(webview: vscode.Webview): void {
    this.webview = webview;
    webview.html = this.html(webview);
    webview.onDidReceiveMessage((m: FromWebview) => this.onMessage(m), undefined, this.disposables);
  }

  detach(): void {
    this.webview = undefined;
    this.sleep();
  }

  /** The webview is hidden: VS Code dropped its page, and it says "ready" again when it comes back. */
  sleep(): void {
    this.live = false;
    this.rendered = undefined;
  }

  /** Jumps to the feature now, or as soon as the webview is ready. */
  select(target: FeatureRef | undefined): void {
    if (target !== undefined) this.pendingSelect = target;
    this.flushSelect();
  }

  /** Handles a message from the webview (public so the integration tests can drive it). */
  async onMessage(m: FromWebview): Promise<void> {
    switch (m.type) {
      case 'ready':
        this.health.ready = true;
        this.live = true;
        this.postState();
        this.flushSelect();
        break;
      case 'refresh':
        await this.store.refresh();
        break;
      case 'rendered':
        if (this.live) this.rendered = m;
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
      case 'setHidden':
        await this.hidden.set(m.target, m.hidden);
        break;
      case 'previewFile': {
        const uri = this.store.uriFor(m.projectId, m.file);
        if (uri) await previewUri(uri);
        break;
      }
      case 'open': {
        const uri = this.store.uriFor(m.projectId, m.file);
        if (uri) await openUri(uri, m.line);
        break;
      }
    }
  }

  private post(message: ToWebview): void {
    void this.webview?.postMessage(message);
  }

  postState(): void {
    this.post({ type: 'state', projects: this.store.projects.map((p) => p.project), now: Date.now(), hidden: this.hidden.keys() });
  }

  private flushSelect(): void {
    if (this.pendingSelect === undefined || !this.live) return;
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
<body class="${this.bodyClass}">
  <main id="app" aria-live="polite"><p class="empty">Carregando specs…</p></main>
  <script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
  }

  dispose(): void {
    for (const d of this.disposables) d.dispose();
  }
}

/** The dashboard, drawn in an editor tab and in the side bar view. */
export class Dashboard implements vscode.Disposable, vscode.WebviewViewProvider {
  private panel: vscode.WebviewPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  readonly tab: Surface;
  readonly side: Surface;

  private readonly extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri, store: SpecsStore, hidden: HiddenSpecs) {
    this.extensionUri = extensionUri;
    this.tab = new Surface(extensionUri, store, hidden, 'tab');
    this.side = new Surface(extensionUri, store, hidden, 'side');
    const postState = () => {
      this.tab.postState();
      this.side.postState();
    };
    this.disposables.push(
      this.tab,
      this.side,
      store.onDidChange(postState),
      hidden.onDidChange(postState),
      vscode.window.registerWebviewViewProvider(PANEL_VIEW, this),
    );
  }

  /** Opens (or focuses) the dashboard in an editor tab; with a target it jumps straight to that feature. */
  show(target?: FeatureRef): void {
    if (this.panel) {
      this.panel.reveal(undefined, false);
      this.tab.select(target);
      return;
    }
    const panel = vscode.window.createWebviewPanel('tlcSpecs.dashboard', 'TLC Specs', vscode.ViewColumn.Active, this.tab.options);
    panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'tlc-color.svg');
    this.tab.attach(panel.webview);
    this.tab.select(target);
    panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.tab.detach();
      },
      undefined,
      this.disposables,
    );
    this.panel = panel;
  }

  /** Shows the side bar view, leaving the editor alone; with a target it jumps straight to that feature. */
  showSide(target?: FeatureRef): void {
    void vscode.commands.executeCommand(`${PANEL_VIEW}.focus`);
    this.side.select(target);
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = this.side.options;
    this.side.attach(view.webview);
    view.onDidChangeVisibility(() => !view.visible && this.side.sleep(), undefined, this.disposables);
    view.onDidDispose(() => this.side.detach(), undefined, this.disposables);
  }

  dispose(): void {
    this.panel?.dispose();
    for (const d of this.disposables) d.dispose();
  }
}
