import type { Feature, FeatureFile, Health, RequirementStatus, StageId, StageState, TaskStatus } from './types.ts';

export const STAGE_ORDER: StageId[] = ['spec', 'design', 'tasks', 'execute', 'verify'];

export const STAGE_LABEL: Record<StageId, string> = {
  spec: 'Spec',
  design: 'Design',
  tasks: 'Tasks',
  execute: 'Execution',
  verify: 'Verification',
};

export const STAGE_STATE_LABEL: Record<StageState, string> = {
  done: 'done',
  active: 'in progress',
  pending: 'pending',
  skipped: 'skipped',
  failed: 'failed',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  done: 'done',
  'in-progress': 'in progress',
  blocked: 'blocked',
  pending: 'pending',
};

export const HEALTH_LABEL: Record<Health, string> = {
  complete: 'Completed',
  ok: 'On track',
  attention: 'Needs attention',
  failed: 'Failing',
};

export const REQ_STATUS_LABEL: Record<RequirementStatus, string> = {
  pending: 'Pending',
  design: 'In Design',
  tasks: 'In Tasks',
  implementing: 'Implementing',
  verified: 'Verified',
  'needs-fix': 'Needs Fix',
  other: '—',
};

/** The markdown that represents a feature: spec.md, else the first non-empty file. */
export function featureMarkdown(f: Feature): FeatureFile | undefined {
  return f.files.find((x) => x.kind === 'spec' && !x.empty) ?? f.files.find((x) => !x.empty) ?? f.files[0];
}

export function progressBar(value: number, width = 10): string {
  const filled = Math.round(value * width);
  return '▰'.repeat(filled) + '▱'.repeat(width - filled);
}
