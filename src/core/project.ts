import type { Feature, FeatureFile, FeatureFileKind, Issue, Lesson, Project, StateDoc } from './types.ts';
import { analyzeFeature, type ArtifactKind } from './feature.ts';
import { parseLessonsJson, parseLessonsMd, parseState } from './docs.ts';

/** Read-only access to one .specs directory. Paths are relative to it, with "/" separators. */
export interface SpecsReader {
  read(rel: string): Promise<string | undefined>;
  list(rel: string): Promise<{ name: string; isDir: boolean }[]>;
  mtime(rel: string): Promise<number | undefined>;
}

export interface LoadOptions {
  now: number;
  staleAfterDays: number;
}

const ARTIFACTS: ArtifactKind[] = ['spec', 'context', 'design', 'tasks', 'validation'];

export async function loadProject(reader: SpecsReader, id: string, label: string, opts: LoadOptions): Promise<Project> {
  const issues: Issue[] = [];

  let state: StateDoc | null = null;
  const stateText = await reader.read('STATE.md');
  if (stateText !== undefined) {
    state = parseState(stateText, 'STATE.md');
    issues.push(...state.issues);
  }

  let lessons: Lesson[] = [];
  const lessonsJson = await reader.read('lessons.json');
  if (lessonsJson !== undefined) {
    try {
      lessons = parseLessonsJson(lessonsJson);
    } catch (e) {
      issues.push({ severity: 'error', message: `lessons.json inválido: ${(e as Error).message}`, file: 'lessons.json' });
    }
  } else {
    const lessonsMd = await reader.read('LESSONS.md');
    if (lessonsMd !== undefined) lessons = parseLessonsMd(lessonsMd);
  }

  const entries = await reader.list('features');
  const names = entries.filter((e) => e.isDir).map((e) => e.name);
  const activeFeature = state?.handoff?.feature ? matchFeature(state.handoff.feature, names) : null;

  const features: Feature[] = await Promise.all(
    names.map(async (name) => {
      const dir = `features/${name}`;
      const listing = await reader.list(dir);
      const texts: Partial<Record<ArtifactKind, string>> = {};
      const files: FeatureFile[] = [];
      for (const entry of listing) {
        if (entry.isDir || !/\.md$/i.test(entry.name)) continue;
        const base = entry.name.replace(/\.md$/i, '').toLowerCase();
        const kind: FeatureFileKind = (ARTIFACTS as string[]).includes(base) ? (base as ArtifactKind) : 'other';
        const path = `${dir}/${entry.name}`;
        const [text, mtime] = await Promise.all([kind === 'other' ? Promise.resolve(undefined) : reader.read(path), reader.mtime(path)]);
        if (kind !== 'other' && text !== undefined) texts[kind as ArtifactKind] = text;
        files.push({ kind, name: entry.name, path, mtime: mtime ?? null, empty: kind !== 'other' && (text ?? '').trim() === '' });
      }
      files.sort((a, b) => fileOrder(a.kind) - fileOrder(b.kind) || a.name.localeCompare(b.name));
      return analyzeFeature(
        { name, dir, files, texts },
        { now: opts.now, staleAfterDays: opts.staleAfterDays, active: name === activeFeature, handoff: state?.handoff ?? null },
      );
    }),
  );

  features.sort((a, b) => Number(b.active) - Number(a.active) || (b.lastModified ?? 0) - (a.lastModified ?? 0) || a.name.localeCompare(b.name));

  if (state?.handoff?.feature && !activeFeature && names.length > 0) {
    issues.push({
      severity: 'info',
      message: `Handoff aponta para "${state.handoff.feature}", que não corresponde a nenhuma pasta em features/`,
      file: 'STATE.md',
      line: state.handoff.line,
    });
  }

  return { id, label, features, state, lessons, activeFeature, issues };
}

function fileOrder(kind: FeatureFileKind): number {
  return ['spec', 'context', 'design', 'tasks', 'validation', 'other'].indexOf(kind);
}

/** Resolves the Handoff "Feature" field ("auth", ".specs/features/auth", "Auth (T4)") to a folder name. */
export function matchFeature(value: string, names: string[]): string | null {
  const v = value.toLowerCase().replace(/\\/g, '/');
  let best: string | null = null;
  for (const name of names) {
    const n = name.toLowerCase();
    const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hit = v === n || v.includes(`features/${n}`) || new RegExp(`(^|[^a-z0-9_-])${esc}([^a-z0-9_-]|$)`).test(v);
    if (hit && (best === null || n.length > best.length)) best = name;
  }
  return best;
}
