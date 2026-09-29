// Which folders hold the skill's artifacts (setting tlcSpecs.specsFolders). Pure: no vscode, no I/O.

/** Folder searched when the setting lists no usable entry. */
export const DEFAULT_SPECS_FOLDER = '.specs';

export interface SpecsFolders {
  /** Relative paths with "/" separators, without duplicates. */
  entries: string[];
  /** Rejected entries, as written in the setting. */
  invalid: string[];
}

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
