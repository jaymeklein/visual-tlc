// Plain-JSON model of what the tlc-spec-driven skill wrote under .specs/.
// Only arrays/objects/primitives: the same objects are posted to the webview.

export type Severity = 'error' | 'warning' | 'info';

export interface Issue {
  severity: Severity;
  message: string;
  /** Path relative to the .specs directory, e.g. "features/auth/spec.md". */
  file?: string;
  /** 1-based line number. */
  line?: number;
}

export type StageId = 'spec' | 'design' | 'tasks' | 'execute' | 'verify';
export type StageState = 'done' | 'active' | 'pending' | 'skipped' | 'failed';

export interface Stage {
  id: StageId;
  state: StageState;
  detail: string;
  /** File that documents this stage, relative to .specs. */
  file?: string;
}

// ---------- spec.md ----------

export type EarsPattern =
  | 'event-driven'
  | 'state-driven'
  | 'unwanted-behavior'
  | 'optional-feature'
  | 'ubiquitous'
  | 'complex'
  | 'unknown'
  | 'invalid';

export interface Criterion {
  text: string;
  pattern: EarsPattern;
  line: number;
}

export interface Story {
  priority: string;
  title: string;
  mvp: boolean;
  line: number;
  criteria: Criterion[];
}

export type RequirementStatus = 'pending' | 'design' | 'tasks' | 'implementing' | 'verified' | 'needs-fix' | 'other';

export interface Requirement {
  id: string;
  story: string;
  phase: string;
  status: string;
  statusKind: RequirementStatus;
  line: number;
}

export interface Assumption {
  text: string;
  chosen: string;
  rationale: string;
  confirmed: string;
  line: number;
}

export interface Checklist {
  total: number;
  done: number;
}

export interface SpecDoc {
  title: string;
  problem: string;
  stories: Story[];
  requirements: Requirement[];
  assumptions: Assumption[];
  openQuestionsResolved: boolean | null;
  goals: Checklist;
  successCriteria: Checklist;
  edgeCases: number;
  outOfScope: number;
  issues: Issue[];
}

// ---------- tasks.md ----------

export type TaskStatus = 'done' | 'in-progress' | 'blocked' | 'pending';

export interface Task {
  id: string;
  title: string;
  line: number;
  phase: number | null;
  what: string;
  where: string;
  dependsOn: string[];
  requirements: string[];
  tests: string | null;
  gate: string | null;
  commit: string;
  doneWhen: { text: string; checked: boolean }[];
  status: TaskStatus;
  /** Where the status came from, for tooltips. */
  statusSource: 'status-field' | 'header' | 'checkboxes' | 'none';
}

export interface TaskPhase {
  number: number;
  name: string;
  line: number;
  taskIds: string[];
}

export type TasksDocStatus = 'draft' | 'approved' | 'in-progress' | 'done' | null;

export interface TasksDoc {
  title: string;
  status: TasksDocStatus;
  phases: TaskPhase[];
  tasks: Task[];
  issues: Issue[];
}

export interface TaskStats {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  pending: number;
}

// ---------- validation.md ----------

export type Verdict = 'pass' | 'fail' | 'unfilled' | 'none';

export interface ValidationDoc {
  date: string;
  diffRange: string;
  /** Same heuristic as the skill's scripts/validate_state.py. */
  verdict: Verdict;
  hasEvidence: boolean;
  overall: 'ready' | 'issues' | 'not-ready' | null;
  criteria: { pass: number; gap: number; precision: number; total: number };
  mutations: { killed: number; survived: number; total: number };
  uat: { pass: number; issue: number; skip: number };
  fixPlans: number;
  issues: Issue[];
}

// ---------- design.md / context.md ----------

export interface DesignDoc {
  title: string;
  status: 'draft' | 'approved' | null;
  components: string[];
  risks: number;
  techDecisions: number;
  issues: Issue[];
}

export interface ContextDoc {
  gathered: string;
  status: string;
  decisionAreas: string[];
  hasDeferredIdeas: boolean;
  issues: Issue[];
}

// ---------- STATE.md / lessons ----------

export interface Decision {
  id: string;
  decision: string;
  reason: string;
  tradeoff: string;
  scope: string;
  date: string;
  status: string;
  active: boolean;
  line: number;
}

export interface Handoff {
  feature: string;
  phaseTask: string;
  completed: string;
  inProgress: string;
  nextStep: string;
  blockers: string;
  uncommitted: string;
  branch: string;
  line: number;
}

export interface StateDoc {
  decisions: Decision[];
  handoff: Handoff | null;
  issues: Issue[];
}

export type LessonStatus = 'confirmed' | 'candidate' | 'quarantined';

export interface Lesson {
  id: string;
  text: string;
  signal: string;
  scope: string;
  status: LessonStatus;
  recurrence: number;
  harmful: number;
  features: string[];
  lastSeen: string;
}

// ---------- aggregate ----------

export type FeatureFileKind = 'spec' | 'context' | 'design' | 'tasks' | 'validation' | 'other';

export interface FeatureFile {
  kind: FeatureFileKind;
  name: string;
  /** Relative to .specs. */
  path: string;
  mtime: number | null;
  empty: boolean;
}

export type Health = 'complete' | 'ok' | 'attention' | 'failed';

export interface Feature {
  name: string;
  /** Relative to .specs, e.g. "features/auth". */
  dir: string;
  files: FeatureFile[];
  spec: SpecDoc | null;
  context: ContextDoc | null;
  design: DesignDoc | null;
  tasks: TasksDoc | null;
  validation: ValidationDoc | null;
  stages: Stage[];
  phase: StageId;
  phaseLabel: string;
  health: Health;
  /** 0..1 */
  progress: number;
  taskStats: TaskStats;
  requirementStats: { total: number; verified: number; mapped: number };
  nextStep: string;
  issues: Issue[];
  lastModified: number | null;
  active: boolean;
}

export interface Project {
  /** Stable id for the .specs root (its URI string in the extension). */
  id: string;
  label: string;
  features: Feature[];
  state: StateDoc | null;
  lessons: Lesson[];
  activeFeature: string | null;
  issues: Issue[];
}
