import * as vscode from 'vscode';
import { DEFAULT_SPECS_FOLDER, findSpecsRoots, parseSpecsFolders } from '../core/folders.ts';
import { loadProject, type SpecsReader } from '../core/project.ts';
import type { Feature, Project } from '../core/types.ts';

export interface LoadedProject {
  project: Project;
  /** URI of the specs directory. */
  specsUri: vscode.Uri;
}

/**
 * Discovers every specs directory in the workspace (setting tlcSpecs.specsFolders, .specs by default)
 * and keeps a parsed model of it, reloading on file changes. Strictly read-only: it never writes under them.
 */
export class SpecsStore implements vscode.Disposable {
  private loaded: LoadedProject[] = [];
  private readonly emitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.emitter.event;
  private readonly disposables: vscode.Disposable[] = [];
  private watchers: vscode.Disposable[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running: Promise<void> | undefined;
  private rerun = false;

  constructor() {
    const rewatch = () => {
      this.watch();
      this.schedule();
    };
    this.watch();
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(rewatch),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('tlcSpecs')) rewatch();
      }),
      this.emitter,
    );
  }

  /** One watcher per workspace folder and configured entry, rebuilt when either changes. */
  private watch(): void {
    for (const w of this.watchers) w.dispose();
    const schedule = () => this.schedule();
    this.watchers = (vscode.workspace.workspaceFolders ?? []).flatMap((folder) =>
      specsFolders(folder).entries.flatMap((entry) => {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, `**/${entry}/**`));
        return [watcher, watcher.onDidCreate(schedule), watcher.onDidChange(schedule), watcher.onDidDelete(schedule)];
      }),
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
    for (const d of [...this.watchers, ...this.disposables]) d.dispose();
  }
}

function specsFolders(folder: vscode.WorkspaceFolder) {
  return parseSpecsFolders(vscode.workspace.getConfiguration('tlcSpecs', folder.uri).get<unknown>('specsFolders'));
}

/** Files that can reveal a specs folder: anything under a .specs, only skill artifacts under other names. */
function searchPattern(entry: string): string {
  const named = entry === DEFAULT_SPECS_FOLDER || entry.endsWith(`/${DEFAULT_SPECS_FOLDER}`);
  return named ? `**/${entry}/**` : `**/${entry}/{STATE.md,lessons.json,LESSONS.md,features/*/*.md}`;
}

async function discoverSpecsRoots(exclude: string): Promise<vscode.Uri[]> {
  const roots = new Map<string, vscode.Uri>();
  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    const { entries } = specsFolders(folder);
    const found = await Promise.all(entries.map((entry) => vscode.workspace.findFiles(new vscode.RelativePattern(folder, searchPattern(entry)), exclude || null, 5000)));
    const base = folder.uri.path.replace(/\/$/, '');
    const files = found.flat().map((f) => f.path.slice(base.length + 1));
    for (const { path } of findSpecsRoots(files, entries)) {
      const root = vscode.Uri.joinPath(folder.uri, ...path.split('/'));
      roots.set(root.toString(), root);
    }
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
