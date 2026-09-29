import type { Project } from './types.ts';

export interface FeatureRef {
  projectId: string;
  feature: string;
}

export type ToWebview =
  | { type: 'state'; projects: Project[]; now: number }
  | { type: 'select'; target: FeatureRef | null };

export type FromWebview =
  | { type: 'ready' }
  | { type: 'refresh' }
  | { type: 'open'; projectId: string; file: string; line?: number }
  | { type: 'previewFile'; projectId: string; file: string }
  | { type: 'error'; message: string }
  | { type: 'previewMarkdown'; target: FeatureRef }
  | { type: 'revealFolder'; target: FeatureRef };
