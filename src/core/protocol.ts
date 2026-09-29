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
  /** Sent after each state is on screen, with the ids of the projects it rendered. */
  | { type: 'rendered'; projects: string[] }
  | { type: 'open'; projectId: string; file: string; line?: number }
  | { type: 'previewFile'; projectId: string; file: string }
  | { type: 'error'; message: string }
  | { type: 'previewMarkdown'; target: FeatureRef }
  | { type: 'revealFolder'; target: FeatureRef };
