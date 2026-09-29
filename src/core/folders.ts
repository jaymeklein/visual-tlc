// Which folders hold the skill's artifacts (setting tlcSpecs.specsFolders). Pure: no vscode, no I/O.

/** Folder searched when the setting lists no usable entry. */
export const DEFAULT_SPECS_FOLDER = '.specs';

export interface SpecsFolders {
  /** Relative paths with "/" separators, without duplicates. */
  entries: string[];
  /** Rejected entries, as written in the setting. */
  invalid: string[];
}

export interface SpecsRoot {
  /** The specs folder, relative to the workspace folder. */
  path: string;
  /** Entry that matched it. */
  entry: string;
  /** Folder that holds the entry, relative to the workspace folder ("" for the workspace folder itself). */
  project: string;
}

const ARTIFACT = /^(STATE\.md|lessons\.json|LESSONS\.md|features\/[^/]+\/[^/]+\.md)$/;

export function parseSpecsFolders(raw: unknown): SpecsFolders {
  const entries: string[] = [];
  const invalid: string[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const entry = typeof item === 'string' ? normalize(item) : undefined;
    if (entry === undefined) invalid.push(String(item));
    else if (!entries.includes(entry)) entries.push(entry);
  }
  if (entries.length === 0) entries.push(DEFAULT_SPECS_FOLDER);
  return { entries, invalid };
}

/** Undefined for an absolute path, a path with ".." or a glob. */
function normalize(value: string): string | undefined {
  const path = value.trim().replace(/\\/g, '/');
  if (path.startsWith('/') || /^[a-z]:/i.test(path) || /[*?[\]{}]/.test(path)) return undefined;
  const segments = path.split('/').filter((s) => s && s !== '.');
  if (segments.length === 0 || segments.includes('..')) return undefined;
  return segments.join('/');
}

/**
 * Specs folders among `files` (paths relative to one workspace folder). A folder not named .specs
 * only counts when it holds a skill artifact, so generic names do not match unrelated folders.
 */
export function findSpecsRoots(files: readonly string[], entries: readonly string[]): SpecsRoot[] {
  const roots = new Map<string, SpecsRoot>();
  for (const file of files) {
    for (const entry of entries) {
      const at = `/${file}`.indexOf(`/${entry}/`);
      if (at < 0) continue;
      const end = at + entry.length;
      const named = entry === DEFAULT_SPECS_FOLDER || entry.endsWith(`/${DEFAULT_SPECS_FOLDER}`);
      if (!named && !ARTIFACT.test(file.slice(end + 1))) continue;
      const path = file.slice(0, end);
      const known = roots.get(path);
      // Two entries can reach the same folder: the most specific one names the project.
      if (!known || entry.length > known.entry.length) roots.set(path, { path, entry, project: file.slice(0, Math.max(0, at - 1)) });
    }
  }
  return [...roots.values()].sort((a, b) => a.path.localeCompare(b.path));
}
