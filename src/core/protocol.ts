import type { Project } from './types.ts';

export interface FeatureRef {
  projectId: string;
  feature: string;
}

/** What a webview has on screen after a render, read back from its DOM. */
export interface Rendered {
  /** Ids of the projects of the state it rendered. */
  projects: string[];
  /** Names on the feature cards of the board. */
  cards: string[];
  /** Feature of the detail view, null on the board. */
  detail: string | null;
  /** Columns the board lays its stages in, 0 without a board. */
  columns: number;
  /** Stages without features that are on screen. */
  emptyStages: number;
  /** Title of the message shown when there is no specs folder, null otherwise. */
  emptyMessage: string | null;
  /** Width of the webview in px. */
  width: number;
  /** True when the page or a board scrolls horizontally. */
  overflow: boolean;
}

export type ToWebview =
  | { type: 'state'; projects: Project[]; now: number }
  | { type: 'select'; target: FeatureRef | null };

export type FromWebview =
  | { type: 'ready' }
  | { type: 'refresh' }
  /** Sent after each render. */
  | ({ type: 'rendered' } & Rendered)
  | { type: 'open'; projectId: string; file: string; line?: number }
  | { type: 'previewFile'; projectId: string; file: string }
  | { type: 'error'; message: string }
  | { type: 'previewMarkdown'; target: FeatureRef }
  | { type: 'revealFolder'; target: FeatureRef };
