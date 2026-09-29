// Lighter parsers: design.md, context.md, STATE.md, lessons.json / LESSONS.md.
import type { ContextDoc, Decision, DesignDoc, Handoff, Issue, Lesson, LessonStatus, StateDoc } from './types.ts';
import { bodyLines, findSection, firstH1, isChoiceList, isPlaceholder, parseMd, plain, rangeOf, readField, tableIn } from './markdown.ts';

export function parseDesign(text: string, file: string): DesignDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  const title = plain(firstH1(doc).replace(/\s+Design\s*$/i, ''));
  if (isPlaceholder(title)) issues.push({ severity: 'warning', message: 'design.md ainda contém o título placeholder do template', file, line: 1 });

  let status: DesignDoc['status'] = null;
  doc.lines.some((line, i) => {
    const f = !doc.fenced[i] ? readField(line) : undefined;
    if (f?.key !== 'status') return false;
    if (!isChoiceList(f.value)) status = /approved|aprovad/i.test(f.value) ? 'approved' : /draft|rascunho/i.test(f.value) ? 'draft' : null;
    return true;
  });

  const compRange = findSection(doc, 'Components', 2);
  const components = compRange
    ? doc.headings
        .filter((h) => h.index > compRange.heading.index && h.index < compRange.end && h.level === compRange.heading.level + 1)
        .map((h) => plain(h.text))
        .filter((t) => !isPlaceholder(t))
    : [];
  const riskRange = findSection(doc, 'Risks & Concerns', 3);
  const risks = riskRange ? (tableIn(doc, riskRange)?.rows.filter((r) => !isPlaceholder(r.cells[0] ?? '')).length ?? 0) : 0;
  const tdRange = findSection(doc, 'Tech Decisions', 3);
  const techDecisions = tdRange ? (tableIn(doc, tdRange)?.rows.filter((r) => !isPlaceholder(r.cells[0] ?? '')).length ?? 0) : 0;

  return { title, status, components, risks, techDecisions, issues };
}

export function parseContext(text: string, file: string): ContextDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  let gathered = '';
  let status = '';
  doc.lines.forEach((line, i) => {
    const f = !doc.fenced[i] ? readField(line) : undefined;
    if (f?.key === 'gathered' && !gathered) gathered = plain(f.value);
    if (f?.key === 'status' && !status) status = plain(f.value);
  });
  const decRange = findSection(doc, 'Implementation Decisions', 3);
  const decisionAreas = decRange
    ? doc.headings
        .filter((h) => h.index > decRange.heading.index && h.index < decRange.end && h.level === decRange.heading.level + 1)
        .map((h) => plain(h.text))
        .filter((t) => !isPlaceholder(t) && !/agent's discretion|declined|undiscussed/i.test(t))
    : [];
  const defRange = findSection(doc, 'Deferred Ideas', 3);
  const deferredText = defRange
    ? bodyLines(doc, defRange)
        .map((l) => l.text.trim())
        .filter(Boolean)
        .join(' ')
    : '';
  const hasDeferredIdeas = deferredText !== '' && !/^\[?none\b/i.test(deferredText) && !isPlaceholder(deferredText);
  if (!decRange) issues.push({ severity: 'warning', message: 'context.md sem seção "Implementation Decisions"', file });
  return { gathered, status, decisionAreas, hasDeferredIdeas, issues };
}

const HANDOFF_KEYS: Record<string, keyof Omit<Handoff, 'line'>> = {
  feature: 'feature',
  'phase / task': 'phaseTask',
  'phase/task': 'phaseTask',
  completed: 'completed',
  'in-progress': 'inProgress',
  'in-progress (file:line)': 'inProgress',
  'in progress': 'inProgress',
  'next step': 'nextStep',
  blockers: 'blockers',
  'uncommitted files': 'uncommitted',
  branch: 'branch',
};

export function parseState(text: string, file: string): StateDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  const decisions: Decision[] = [];

  const decRange = findSection(doc, 'Decisions', 2);
  if (decRange) {
    for (const h of doc.headings) {
      if (h.index <= decRange.heading.index || h.index >= decRange.end) continue;
      const m = /^(AD-\d+)\b/i.exec(h.text);
      if (!m) continue;
      const d: Decision = { id: m[1].toUpperCase(), decision: '', reason: '', tradeoff: '', scope: '', date: '', status: '', active: true, line: h.index + 1 };
      for (const { text: line } of bodyLines(doc, rangeOf(doc, h))) {
        const f = readField(line);
        if (!f || isPlaceholder(f.value)) continue;
        const v = plain(f.value);
        if (f.key === 'decision') d.decision = v;
        else if (f.key === 'reason') d.reason = v;
        else if (f.key === 'trade-off' || f.key === 'tradeoff') d.tradeoff = v;
        else if (f.key === 'scope') d.scope = v;
        else if (f.key === 'date') d.date = v;
        else if (f.key === 'status') d.status = v;
      }
      d.active = !/superseded|substitu/i.test(d.status);
      if (!d.decision) issues.push({ severity: 'info', message: `${d.id} sem campo "Decision"`, file, line: d.line });
      decisions.push(d);
    }
    const ids = new Set(decisions.map((d) => d.id));
    for (const d of decisions) {
      const ref = /superseded by\s+(AD-\d+)/i.exec(d.status)?.[1]?.toUpperCase();
      if (ref && !ids.has(ref)) issues.push({ severity: 'warning', message: `${d.id} diz "superseded by ${ref}", mas ${ref} não existe`, file, line: d.line });
    }
  }

  let handoff: Handoff | null = null;
  const hoRange = findSection(doc, 'Handoff', 2);
  if (hoRange) {
    const h: Handoff = { feature: '', phaseTask: '', completed: '', inProgress: '', nextStep: '', blockers: '', uncommitted: '', branch: '', line: hoRange.heading.index + 1 };
    let any = false;
    for (const { text: line } of bodyLines(doc, hoRange)) {
      const f = readField(line);
      if (!f) continue;
      const key = HANDOFF_KEYS[f.key] ?? (f.key.startsWith('in-progress') ? 'inProgress' : undefined);
      if (!key || isPlaceholder(f.value)) continue;
      h[key] = plain(f.value);
      any = true;
    }
    if (any) {
      handoff = h;
      if (h.blockers && !/^(none|nenhum|-|n\/a)\.?$/i.test(h.blockers)) {
        issues.push({ severity: 'warning', message: `Bloqueio registrado no handoff: ${h.blockers}`, file, line: h.line });
      }
    }
  }
  return { decisions, handoff, issues };
}

const LESSON_STATUSES: LessonStatus[] = ['confirmed', 'candidate', 'quarantined'];

export function parseLessonsJson(text: string): Lesson[] {
  const data = JSON.parse(text) as { lessons?: Record<string, unknown>[] };
  return (data.lessons ?? []).map((l) => ({
    id: String(l.id ?? ''),
    text: String(l.text ?? ''),
    signal: String(l.signal ?? ''),
    scope: String(l.scope ?? ''),
    status: (LESSON_STATUSES.includes(l.status as LessonStatus) ? l.status : 'candidate') as LessonStatus,
    recurrence: Number(l.recurrence ?? 1),
    harmful: Number(l.harmful ?? 0),
    features: Array.isArray(l.features) ? l.features.map(String) : [],
    lastSeen: String(l.last_seen ?? l.created ?? ''),
  }));
}

/** Fallback for the no-script mode, where LESSONS.md is kept by hand. */
export function parseLessonsMd(text: string): Lesson[] {
  const doc = parseMd(text);
  const lessons: Lesson[] = [];
  let status: LessonStatus = 'candidate';
  for (const h of doc.headings) {
    if (h.level === 2) {
      status = /^confirmed/i.test(h.text) ? 'confirmed' : /^quarantin/i.test(h.text) ? 'quarantined' : 'candidate';
      continue;
    }
    const m = /^(L-\d+)\s*[-–—:]\s*(.*)$/.exec(h.text);
    if (!m) continue;
    const body = bodyLines(doc, rangeOf(doc, h)).map((l) => l.text).join('\n');
    lessons.push({
      id: m[1],
      text: plain(m[2]),
      signal: /signal:\s*`?([\w_]+)/.exec(body)?.[1] ?? '',
      scope: /scope:\s*`([^`]+)`/.exec(body)?.[1] ?? '',
      status,
      recurrence: Number(/recurrence:\s*(\d+)/.exec(body)?.[1] ?? 1),
      harmful: Number(/harmful:\s*(\d+)/.exec(body)?.[1] ?? 0),
      features: (/features:\s*(.*)/.exec(body)?.[1] ?? '').split(',').map((s) => s.trim()).filter((s) => s && s !== '-'),
      lastSeen: /last seen:\s*(\S+)/.exec(body)?.[1] ?? '',
    });
  }
  return lessons;
}
