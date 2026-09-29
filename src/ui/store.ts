import * as vscode from 'vscode';
import { loadProject, type SpecsReader } from '../core/project.ts';
import type { Feature, Project } from '../core/types.ts';

export interface LoadedProject {
  project: Project;
  /** URI of the .specs directory. */
  specsUri: vscode.Uri;
}

/**
 * Discovers every .specs directory in the workspace and keeps a parsed model of it,
 * reloading on file changes. Strictly read-only: it never writes under .specs.
 */
export class SpecsStore implements vscode.Disposable {
  private loaded: LoadedProject[] = [];
  private readonly emitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.emitter.event;
  private readonly disposables: vscode.Disposable[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running: Promise<void> | undefined;
  private rerun = false;

  constructor() {
    const watcher = vscode.workspace.createFileSystemWatcher('**/.specs/**');
    const schedule = () => this.schedule();
    this.disposables.push(
      watcher,
      watcher.onDidCreate(schedule),
      watcher.onDidChange(schedule),
      watcher.onDidDelete(schedule),
      vscode.workspace.onDidChangeWorkspaceFolders(schedule),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('tlcSpecs')) schedule();
      }),
      this.emitter,
    );
  }

  get projects(): readonly LoadedProject[] {
    return this.loaded;
  }

  find(projectId: string): LoadedProject | undefined {
    return this.loaded.find((p) => p.project.id === projectId);
  }

  findFeature(projectId: string, name: string): { loaded: LoadedProject; feature: Feature } | undefined {
    const loaded = this.find(projectId);
    const feature = loaded?.project.features.find((f) => f.name === name);
    return loaded && feature ? { loaded, feature } : undefined;
  }

  uriFor(projectId: string, rel: string): vscode.Uri | undefined {
    const loaded = this.find(projectId);
    return loaded ? vscode.Uri.joinPath(loaded.specsUri, ...rel.split('/').filter(Boolean)) : undefined;
  }

  schedule(delay = 300): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.refresh(), delay);
  }

  /** Reloads everything; concurrent calls coalesce into one extra run. */
  async refresh(): Promise<void> {
    if (this.running) {
      this.rerun = true;
      return this.running;
    }
    this.running = (async () => {
      do {
        this.rerun = false;
        try {
          this.loaded = await this.load();
        } catch (e) {
          console.error('[tlc-specs] refresh failed', e);
        }
      } while (this.rerun);
      this.emitter.fire();
    })().finally(() => (this.running = undefined));
    return this.running;
  }

  private async load(): Promise<LoadedProject[]> {
    const config = vscode.workspace.getConfiguration('tlcSpecs');
    const exclude = config.get<string>('exclude', '**/node_modules/**');
    const staleAfterDays = config.get<number>('staleAfterDays', 14);
    const roots = await discoverSpecsRoots(exclude);
    const now = Date.now();
    return Promise.all(
      roots.map(async (specsUri) => ({
        specsUri,
        project: await loadProject(uriReader(specsUri), specsUri.toString(), labelFor(specsUri), { now, staleAfterDays }),
      })),
    );
  }

  dispose(): void {
    clearTimeout(this.timer);
    for (const d of this.disposables) d.dispose();
  }
}

async function discoverSpecsRoots(exclude: string): Promise<vscode.Uri[]> {
  const files = await vscode.workspace.findFiles('**/.specs/**', exclude || null, 5000);
  const roots = new Map<string, vscode.Uri>();
  for (const f of files) {
    const idx = f.path.indexOf('/.specs/');
    if (idx < 0) continue;
    const root = f.with({ path: f.path.slice(0, idx + '/.specs'.length) });
    roots.set(root.toString(), root);
  }
  return [...roots.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function labelFor(specsUri: vscode.Uri): string {
  const parent = vscode.Uri.joinPath(specsUri, '..');
  const folder = vscode.workspace.getWorkspaceFolder(specsUri);
  if (!folder) return parent.path.split('/').pop() ?? parent.path;
  if (parent.path === folder.uri.path) return folder.name;
  return `${folder.name}/${vscode.workspace.asRelativePath(parent, false)}`;
}

function uriReader(root: vscode.Uri): SpecsReader {
  const at = (rel: string) => vscode.Uri.joinPath(root, ...rel.split('/').filter(Boolean));
  const decoder = new TextDecoder('utf-8');
  return {
    async read(rel) {
      try {
        return decoder.decode(await vscode.workspace.fs.readFile(at(rel)));
      } catch {
        return undefined;
      }
    },
    async list(rel) {
      try {
        const entries = await vscode.workspace.fs.readDirectory(at(rel));
        return entries.map(([name, type]) => ({ name, isDir: (type & vscode.FileType.Directory) !== 0 }));
      } catch {
        return [];
      }
    },
    async mtime(rel) {
      try {
        return (await vscode.workspace.fs.stat(at(rel))).mtime;
      } catch {
        return undefined;
      }
    },
  };
}
