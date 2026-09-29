import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { SpecsReader } from '../../src/core/project.ts';

export function nodeReader(specsDir: string): SpecsReader {
  return {
    async read(rel) {
      try {
        return await readFile(join(specsDir, rel), 'utf8');
      } catch {
        return undefined;
      }
    },
    async list(rel) {
      try {
        const entries = await readdir(join(specsDir, rel), { withFileTypes: true });
        return entries.map((e) => ({ name: e.name, isDir: e.isDirectory() }));
      } catch {
        return [];
      }
    },
    async mtime(rel) {
      try {
        return (await stat(join(specsDir, rel))).mtimeMs;
      } catch {
        return undefined;
      }
    },
  };
}

export const SAMPLE_SPECS = join(import.meta.dirname, '..', 'fixtures', 'sample', '.specs');
