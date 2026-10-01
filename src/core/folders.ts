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
  /** Entry that names it. */
  entry: string;
}

const ARTIFACT = /^(STATE\.md|lessons\.json|LESSONS\.md|features\/[^/]+\/[^/]+\.md)$/;

export function parseSpecsFolders(raw: unknown): SpecsFolders {
  const { entries, invalid } = parseEntries(raw);
  if (entries.length === 0) entries.push(DEFAULT_SPECS_FOLDER);
  return { entries, invalid };
}

/** An entry a setting rejected, as written in it. */
export interface InvalidEntry {
  setting: string;
  entry: string;
}

/**
 * Which of the invalid entries still need their warning, given the ones already warned:
 * once per setting and entry, and again when the entry comes back after leaving the setting.
 */
export function pendingWarnings(invalid: readonly InvalidEntry[], warned: ReadonlySet<string>): { show: InvalidEntry[]; warned: Set<string> } {
  const seen = new Set<string>();
  const show: InvalidEntry[] = [];
  for (const item of invalid) {
    const key = `${item.setting}: ${item.entry}`;
    if (!warned.has(key) && !seen.has(key)) show.push(item);
    seen.add(key);
  }
  return { show, warned: seen };
}

function parseEntries(raw: unknown): SpecsFolders {
  const entries: string[] = [];
  const invalid: string[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const entry = typeof item === 'string' ? normalize(item) : undefined;
    if (entry === undefined) invalid.push(String(item));
    else if (!entries.includes(entry)) entries.push(entry);
  }
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
 * Specs folders among `files` (paths relative to one workspace folder): each entry is the path of a folder
 * from the workspace folder root, never searched deeper. A folder not named .specs only counts when it
 * holds a skill artifact, so a folder that happens to exist at that path does not show.
 */
export function findSpecsRoots(files: readonly string[], entries: readonly string[]): SpecsRoot[] {
  const roots = new Map<string, SpecsRoot>();
  for (const file of files) {
    for (const entry of entries) {
      if (!file.startsWith(`${entry}/`)) continue;
      const named = entry === DEFAULT_SPECS_FOLDER || entry.endsWith(`/${DEFAULT_SPECS_FOLDER}`);
      if (!named && !ARTIFACT.test(file.slice(entry.length + 1))) continue;
      roots.set(entry, { path: entry, entry });
    }
  }
  return [...roots.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** The workspace folder name, or "name · entry" when that workspace folder has more than one specs folder among `all`. */
export function rootLabel(root: SpecsRoot, all: readonly SpecsRoot[], folderName: string): string {
  return all.some((r) => r.path !== root.path) ? `${folderName} · ${root.entry}` : folderName;
}
