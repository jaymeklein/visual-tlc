import type { Issue, Task, TaskPhase, TasksDoc, TasksDocStatus, TaskStats, TaskStatus } from './types.ts';
import {
  bodyLines,
  checkbox,
  column,
  findSection,
  firstH1,
  isChoiceList,
  isPlaceholder,
  parseMd,
  plain,
  rangeOf,
  readField,
  REQ_ID_RE,
  tableIn,
  TASK_ID_RE,
  type Heading,
  type MdDoc,
} from './markdown.ts';

// Mirrors REQUIRED_SECTIONS in the skill's scripts/validate_tasks.py.
export const TASKS_REQUIRED_SECTIONS = ['Test Coverage Matrix', 'Gate Check Commands', 'Execution Plan', 'Task Breakdown'];

const PHASE_RE = /^Phase\s+(\d+)\s*(?:[:\-–—]\s*(.*))?$/i;
const TASK_HEAD_RE = /^(T\d+)\s*[:\-–—]\s*(.*)$/i;
const HEAD_DONE_RE = /✅|✔|☑|\[[xX]\]|^~~|~~$|\((?:done|feito|concluíd[ao])\)|\[(?:done|concluíd[ao])\]/i;
const HEAD_PROGRESS_RE = /🔄|⏳|🚧|\((?:wip|in progress|em andamento)\)/i;
const HEAD_BLOCKED_RE = /❌|⛔|\((?:blocked|bloquead[ao])\)/i;
const FILE_HINT_RE = /[\w./-]+\.\w{1,6}\b/g;
const PLAIN_FIELDS = ['what', 'where', 'depends on', 'reuses', 'requirement', 'requirements', 'tests', 'gate', 'commit', 'status'];

/** Classifies a free-text status ("✅ Complete", "Em andamento", ...). Template choice lists return undefined. */
export function classifyTaskStatus(value: string): TaskStatus | undefined {
  if (!value || isChoiceList(value) || isPlaceholder(value)) return undefined;
  const s = value.toLowerCase();
  if (/❌|⛔|blocked|bloquead|impedid/.test(s)) return 'blocked';
  if (/incomplet|not done|não conclu|nao conclu/.test(s)) return 'in-progress';
  if (/⚠|partial|parcial|in[ -]?progress|andamento|🔄|⏳|🚧|\bwip\b|implementing|doing|fazendo/.test(s)) return 'in-progress';
  if (/✅|✔|☑|\bdone\b|complete|conclu|finaliz|verified|verificad|feit[oa]|\bok\b/.test(s)) return 'done';
  if (/pending|pendente|to ?do|not started|não iniciad|nao iniciad|⬜|☐/.test(s)) return 'pending';
  return undefined;
}

function classifyDocStatus(value: string): TasksDocStatus {
  if (!value || isChoiceList(value) || isPlaceholder(value)) return null;
  const s = value.toLowerCase();
  if (/in progress|andamento|executing|execu/.test(s)) return 'in-progress';
  if (/done|conclu|complete|finaliz/.test(s)) return 'done';
  if (/approved|aprovad/.test(s)) return 'approved';
  if (/draft|rascunho/.test(s)) return 'draft';
  return null;
}

function stripHeadMarkers(text: string): string {
  return text
    .replace(/^~~|~~$/g, '')
    .replace(/^\s*\[[ xX]\]\s*/, '')
    .replace(/^[\s✅✔☑🔄⏳🚧❌⛔⚠️️]+/u, '')
    .trim();
}

export function taskStats(tasks: Task[]): TaskStats {
  const s: TaskStats = { total: tasks.length, done: 0, inProgress: 0, blocked: 0, pending: 0 };
  for (const t of tasks) {
    if (t.status === 'done') s.done++;
    else if (t.status === 'in-progress') s.inProgress++;
    else if (t.status === 'blocked') s.blocked++;
    else s.pending++;
  }
  return s;
}

export function parseTasks(text: string, file: string): TasksDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  const issue = (severity: Issue['severity'], message: string, index?: number) =>
    issues.push({ severity, message, file, line: index === undefined ? undefined : index + 1 });

  for (const name of TASKS_REQUIRED_SECTIONS) {
    if (!findSection(doc, name, 4)) issue('error', `Missing required section: "## ${name}"`);
  }
  for (const name of ['Test Coverage Matrix', 'Gate Check Commands']) {
    const r = findSection(doc, name, 4);
    if (!r) continue;
    const hasTableRow = bodyLines(doc, r).some((l) => l.text.trim().startsWith('|') && !/\[[^\]]+\]\s*\|/.test(l.text));
    if (!hasTableRow) issue('warning', `"${name}" has not been generated yet (template placeholder)`, r.heading.index);
  }

  const title = plain(firstH1(doc).replace(/\s+Tasks\s*$/i, ''));

  // Document-level **Status** lives before the first task / Task Breakdown.
  const taskHeadings = doc.headings.filter((h) => h.level >= 2 && h.level <= 4 && TASK_HEAD_RE.test(stripHeadMarkers(h.text)));
  const firstTaskLine = taskHeadings[0]?.index ?? doc.lines.length;
  let status: TasksDocStatus = null;
  for (let i = 0; i < firstTaskLine; i++) {
    if (doc.fenced[i]) continue;
    const f = readField(doc.lines[i]);
    if (f?.key === 'status') {
      status = classifyDocStatus(f.value);
      break;
    }
  }

  const phases = parsePhases(doc);
  const tasks = taskHeadings.map((h) => parseTask(doc, h));
  assignPhases(doc, phases, tasks);

  if (tasks.length === 0) issue('warning', 'No task (### T1: …) found — has the file been filled in?');
  checkTasks(doc, tasks, matrixAllowsNone(doc), issue);
  return { title, status, phases, tasks, issues };
}

function parsePhases(doc: MdDoc): TaskPhase[] {
  const phases: TaskPhase[] = [];
  for (const h of doc.headings) {
    if (h.level < 2 || h.level > 4) continue;
    const m = PHASE_RE.exec(h.text);
    if (!m) continue;
    const number = Number(m[1]);
    if (phases.some((p) => p.number === number)) continue;
    phases.push({ number, name: plain(m[2] ?? ''), line: h.index + 1, taskIds: [] });
  }
  return phases;
}

function parseTask(doc: MdDoc, h: Heading): Task {
  const head = stripHeadMarkers(h.text);
  const m = TASK_HEAD_RE.exec(head)!;
  const range = rangeOf(doc, h);
  const task: Task = {
    id: m[1].toUpperCase(),
    title: plain(m[2].replace(/~~/g, '').replace(/\s*(✅|✔|☑|🔄|⏳|🚧|❌|⛔)\s*/gu, ' ')).trim(),
    line: h.index + 1,
    phase: null,
    what: '',
    where: '',
    dependsOn: [],
    requirements: [],
    tests: null,
    gate: null,
    commit: '',
    doneWhen: [],
    status: 'pending',
    statusSource: 'none',
  };
  let explicit: TaskStatus | undefined;
  for (const { text } of bodyLines(doc, range)) {
    const cb = checkbox(text);
    if (cb) {
      if (!isPlaceholder(cb.text)) task.doneWhen.push({ text: plain(cb.text), checked: cb.checked });
      continue;
    }
    const f = readField(text, PLAIN_FIELDS);
    if (!f) continue;
    switch (f.key) {
      case 'what':
        task.what = plain(f.value);
        break;
      case 'where':
        task.where = f.value;
        break;
      case 'depends on':
        if (!/none|nenhum|^-?$/i.test(f.value.trim())) task.dependsOn = unique(f.value.toUpperCase().match(TASK_ID_RE) ?? []);
        break;
      case 'requirement':
      case 'requirements':
        task.requirements = unique(f.value.match(REQ_ID_RE) ?? []);
        break;
      case 'tests':
        task.tests = plain(f.value);
        break;
      case 'gate':
        task.gate = plain(f.value);
        break;
      case 'commit':
        task.commit = plain(f.value);
        break;
      case 'status':
        explicit = classifyTaskStatus(f.value) ?? explicit;
        break;
    }
  }

  if (explicit) {
    task.status = explicit;
    task.statusSource = 'status-field';
  } else if (HEAD_BLOCKED_RE.test(h.text)) {
    task.status = 'blocked';
    task.statusSource = 'header';
  } else if (HEAD_DONE_RE.test(h.text)) {
    task.status = 'done';
    task.statusSource = 'header';
  } else if (HEAD_PROGRESS_RE.test(h.text)) {
    task.status = 'in-progress';
    task.statusSource = 'header';
  } else if (task.doneWhen.length > 0) {
    const checked = task.doneWhen.filter((c) => c.checked).length;
    task.status = checked === task.doneWhen.length ? 'done' : checked > 0 ? 'in-progress' : 'pending';
    task.statusSource = 'checkboxes';
  }
  return task;
}

/**
 * Phase membership, most reliable signal first:
 *  1. the task heading is nested under a "Phase N" heading;
 *  2. the task id appears in that phase's body (its arrow diagram);
 *  3. a "Phase N: T1 → T2" line in the Phase Execution Map.
 */
function assignPhases(doc: MdDoc, phases: TaskPhase[], tasks: Task[]): void {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const phaseHeads = doc.headings.filter((h) => h.level >= 2 && h.level <= 4 && PHASE_RE.test(h.text));

  for (const t of tasks) {
    const idx = t.line - 1;
    for (const ph of phaseHeads) {
      const r = rangeOf(doc, ph);
      if (idx > ph.index && idx < r.end) t.phase = Number(PHASE_RE.exec(ph.text)![1]);
    }
  }

  for (const ph of phaseHeads) {
    const n = Number(PHASE_RE.exec(ph.text)![1]);
    const r = rangeOf(doc, ph);
    const firstChild = doc.headings.find((h) => h.index > ph.index && h.index < r.end);
    const end = firstChild ? firstChild.index : r.end;
    for (let i = r.start; i < end; i++) {
      if (readField(doc.lines[i], PLAIN_FIELDS)) continue;
      for (const id of doc.lines[i].toUpperCase().match(TASK_ID_RE) ?? []) {
        const t = byId.get(id);
        if (t && t.phase === null) t.phase = n;
      }
    }
  }

  for (let i = 0; i < doc.lines.length; i++) {
    if (!doc.fenced[i]) continue;
    const m = /^\s*Phase\s+(\d+)\s*:(.*)$/i.exec(doc.lines[i]);
    if (!m) continue;
    for (const id of m[2].toUpperCase().match(TASK_ID_RE) ?? []) {
      const t = byId.get(id);
      if (t && t.phase === null) t.phase = Number(m[1]);
    }
  }

  for (const p of phases) p.taskIds = tasks.filter((t) => t.phase === p.number).map((t) => t.id);
}

/** Port of parse_diagram_edges() from scripts/validate_tasks.py. */
export function diagramEdges(doc: MdDoc): { edges: Set<string>; parsed: boolean } {
  const edges = new Set<string>();
  let parsed = false;
  for (let i = 0; i < doc.lines.length; i++) {
    if (!doc.fenced[i] || /^\s*(```|~~~)/.test(doc.lines[i])) continue;
    const norm = doc.lines[i].replace(/→/g, '->').replace(/──/g, '-');
    if (!norm.includes('->')) continue;
    const seq = norm.split('->').map((seg) => {
      const ids = seg.toUpperCase().match(TASK_ID_RE);
      return ids ? ids[ids.length - 1] : null;
    });
    for (let k = 0; k + 1 < seq.length; k++) {
      if (seq[k] && seq[k + 1]) {
        edges.add(`${seq[k]}>${seq[k + 1]}`);
        parsed = true;
      }
    }
  }
  return { edges, parsed };
}

type IssueFn = (severity: Issue['severity'], message: string, index?: number) => void;

/** True when some layer of the Test Coverage Matrix legitimately requires no tests. */
function matrixAllowsNone(doc: MdDoc): boolean {
  const range = findSection(doc, 'Test Coverage Matrix', 4);
  if (!range) return false;
  const table = tableIn(doc, range);
  if (!table) return false;
  const col = column(table, /test type/i);
  return col >= 0 && table.rows.some((r) => /^none\b/i.test(plain(r.cells[col] ?? '')));
}

function checkTasks(doc: MdDoc, tasks: Task[], noneAllowed: boolean, issue: IssueFn): void {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const seen = new Set<string>();
  for (const t of tasks) {
    const at = t.line - 1;
    if (seen.has(t.id)) issue('error', `${t.id} is defined more than once`, at);
    seen.add(t.id);
    if (t.tests === null) issue('error', `${t.id}: missing "Tests" field`, at);
    else if (/^none/i.test(t.tests)) {
      if (noneAllowed) issue('info', `${t.id}: Tests: none — confirm the layer is "none" in the Test Coverage Matrix`, at);
      else issue('warning', `${t.id}: Tests: none, but no Test Coverage Matrix layer is "none"`, at);
    }
    if (t.gate === null) issue('error', `${t.id}: missing "Gate" field`, at);
    const files = unique(t.where.match(FILE_HINT_RE) ?? []);
    if (files.length > 1) issue('warning', `${t.id}: "Where" cites several files (${files.join(', ')}) — task is not granular enough`, at);

    for (const dep of t.dependsOn) {
      const d = byId.get(dep);
      if (!d) {
        issue('warning', `${t.id} depends on ${dep}, which does not exist in tasks.md`, at);
        continue;
      }
      if (t.phase !== null && d.phase !== null && d.phase > t.phase) {
        issue('error', `${t.id} (phase ${t.phase}) depends on ${dep} (phase ${d.phase}) — dependencies can only point backward`, at);
      }
      if (t.status === 'done' && d.status !== 'done') {
        issue('warning', `${t.id} is done, but its dependency ${dep} is not`, at);
      }
    }
  }

  const { edges, parsed } = diagramEdges(doc);
  if (!parsed) {
    if (tasks.length > 1) issue('info', 'Phase diagram could not be read — diagram × "Depends on" check skipped');
    return;
  }
  const samePhase = (a: string, b: string) => {
    const pa = byId.get(a)?.phase ?? null;
    const pb = byId.get(b)?.phase ?? null;
    return pa === null || pb === null || pa === pb;
  };
  const depEdges = new Set<string>();
  for (const t of tasks) for (const d of t.dependsOn) depEdges.add(`${d}>${t.id}`);
  for (const e of [...edges].sort()) {
    const [a, b] = e.split('>');
    if (!depEdges.has(e) && samePhase(a, b) && byId.has(a) && byId.has(b)) {
      issue('error', `Diagram shows ${a} → ${b}, but ${b} does not declare "Depends on: ${a}"`, byId.get(b)!.line - 1);
    }
  }
  for (const e of [...depEdges].sort()) {
    const [a, b] = e.split('>');
    if (!edges.has(e) && samePhase(a, b) && byId.has(a)) {
      issue('error', `${b} declares "Depends on: ${a}", but the diagram has no ${a} → ${b} arrow`, byId.get(b)!.line - 1);
    }
  }
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
