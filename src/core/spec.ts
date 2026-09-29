import type { Assumption, EarsPattern, Issue, Requirement, RequirementStatus, SpecDoc, Story } from './types.ts';
import {
  bodyLines,
  checklistIn,
  column,
  findSection,
  firstH1,
  isPlaceholder,
  parseMd,
  plain,
  tableIn,
  type MdDoc,
} from './markdown.ts';

// Mirrors REQUIRED_SECTIONS in the skill's scripts/validate_spec.py.
export const SPEC_REQUIRED_SECTIONS = [
  'Problem Statement',
  'Out of Scope',
  'Assumptions & Open Questions',
  'User Stories',
  'Requirement Traceability',
];

const ID_RE = /^[A-Z][A-Z0-9]*-\d+$/;
const STORY_RE = /^(P\d+)\s*[:\-–—]\s*(.*)$/i;
const AC_HEADER_RE = /^\s*(?:\*\*|__)?\s*Acceptance Criteria\b/i;
const LIST_ITEM_RE = /^\s*(?:\d+[.)]|[-*+])\s+(.*)$/;
const LEADING_ID_RE = /^(?:\*\*|`)?[A-Z][A-Z0-9]*-\d+(?:\*\*|`)?\s*[:\-–—]\s*/;

/** Port of classify_ears() from scripts/validate_spec.py. */
export function classifyEars(text: string): EarsPattern {
  const low = text.trim().toLowerCase();
  if (!/\bshall\b/.test(low)) return 'invalid';
  const kws: string[] = [];
  if (/\bwhile\b/.test(low)) kws.push('WHILE');
  if (/\bwhen\b/.test(low)) kws.push('WHEN');
  if (/^\s*if\b/.test(low) || /\bif\b.*\bthen\b/.test(low)) kws.push('IF');
  if (/\bwhere\b/.test(low)) kws.push('WHERE');
  if (kws.length >= 2) return 'complex';
  if (kws.length === 1) {
    return ({ WHILE: 'state-driven', WHEN: 'event-driven', IF: 'unwanted-behavior', WHERE: 'optional-feature' } as const)[
      kws[0] as 'WHILE' | 'WHEN' | 'IF' | 'WHERE'
    ];
  }
  return /^\s*the\b/.test(low) ? 'ubiquitous' : 'unknown';
}

export function requirementStatusKind(status: string): RequirementStatus {
  const s = status.toLowerCase();
  if (/needs?\s*fix|❌|fail|falh|corrig/.test(s)) return 'needs-fix';
  if (/verified|verificad|✅|done|conclu/.test(s)) return 'verified';
  if (/implement/.test(s)) return 'implementing';
  if (/task/.test(s)) return 'tasks';
  if (/design/.test(s)) return 'design';
  if (/pending|pendente|^-?$/.test(s.trim())) return 'pending';
  return 'other';
}

export function parseSpec(text: string, file: string): SpecDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  const issue = (severity: Issue['severity'], message: string, index?: number) =>
    issues.push({ severity, message, file, line: index === undefined ? undefined : index + 1 });

  for (const name of SPEC_REQUIRED_SECTIONS) {
    if (!findSection(doc, name, 3)) issue('error', `Seção obrigatória ausente: "## ${name}"`);
  }

  const title = plain(firstH1(doc).replace(/\s+Specification\s*$/i, ''));
  if (title && isPlaceholder(title)) issue('warning', 'Título da spec ainda é o placeholder do template', 0);

  const stories = parseStories(doc, issue);
  if (findSection(doc, 'User Stories', 3) && stories.length === 0) {
    issue('warning', 'Nenhuma user story (### P1: …) encontrada');
  }

  const requirements = parseTraceability(doc, issue);
  const { assumptions, openQuestionsResolved } = parseAssumptions(doc, issue);

  const problemRange = findSection(doc, 'Problem Statement', 3);
  const problem = problemRange
    ? plain(
        bodyLines(doc, problemRange)
          .map((l) => l.text)
          .join(' ')
          .replace(/\s+/g, ' '),
      )
    : '';
  if (problemRange && (problem === '' || isPlaceholder(problem))) {
    issue('warning', 'Problem Statement vazio ou com placeholder', problemRange.heading.index);
  }

  const goalsRange = findSection(doc, 'Goals', 3);
  const successRange = findSection(doc, 'Success Criteria', 3);
  const edgeRange = findSection(doc, 'Edge Cases', 3);
  const outRange = findSection(doc, 'Out of Scope', 3);

  return {
    title,
    problem,
    stories,
    requirements,
    assumptions,
    openQuestionsResolved,
    goals: goalsRange ? checklistIn(doc, goalsRange) : { total: 0, done: 0 },
    successCriteria: successRange ? checklistIn(doc, successRange) : { total: 0, done: 0 },
    edgeCases: edgeRange ? bodyLines(doc, edgeRange).filter((l) => /^\s*[-*+]\s+\S/.test(l.text)).length : 0,
    outOfScope: outRange ? (tableIn(doc, outRange)?.rows.filter((r) => !isPlaceholder(r.cells[0] ?? '')).length ?? 0) : 0,
    issues,
  };
}

type IssueFn = (severity: Issue['severity'], message: string, index?: number) => void;

function parseStories(doc: MdDoc, issue: IssueFn): Story[] {
  const stories: Story[] = [];
  const storyHeadings = doc.headings.filter((h) => h.level >= 2 && h.level <= 4 && STORY_RE.test(h.text));
  for (const h of storyHeadings) {
    const m = STORY_RE.exec(h.text)!;
    const rawTitle = m[2];
    const story: Story = {
      priority: m[1].toUpperCase(),
      title: plain(rawTitle.replace(/⭐/g, '').replace(/\bMVP\b/i, '')).trim(),
      mvp: /MVP|⭐/.test(rawTitle),
      line: h.index + 1,
      criteria: [],
    };
    if (isPlaceholder(story.title)) issue('warning', `${story.priority}: título da história ainda é placeholder`, h.index);

    // Story body ends at the next heading of any level (sub-headings are unusual here).
    const next = doc.headings.find((x) => x.index > h.index);
    const end = next ? next.index : doc.lines.length;
    let inAc = false;
    for (let i = h.index + 1; i < end; i++) {
      if (doc.fenced[i]) continue;
      const line = doc.lines[i];
      if (AC_HEADER_RE.test(line)) {
        inAc = true;
        continue;
      }
      if (!inAc) continue;
      const trimmed = line.trim();
      if (/^(\*\*|__)/.test(trimmed) || /^-{3,}$/.test(trimmed)) {
        inAc = false;
        continue;
      }
      const item = LIST_ITEM_RE.exec(line);
      if (!item) continue;
      const text = item[1].replace(/<!--.*?-->/g, '').trim();
      if (!text || isPlaceholder(text) || /^\[[ xX]\]/.test(text)) continue;
      const pattern = classifyEars(text.replace(LEADING_ID_RE, ''));
      story.criteria.push({ text: plain(text), pattern, line: i + 1 });
      if (pattern === 'invalid') {
        issue('error', `Critério de aceitação sem SHALL (não testável): ${short(text)}`, i);
      } else if (pattern === 'unknown') {
        issue('warning', `Critério com SHALL mas sem palavra-chave EARS (WHEN/WHILE/WHERE/IF/"The … SHALL"): ${short(text)}`, i);
      }
    }
    if (story.criteria.length === 0) {
      issue('warning', `${story.priority}: "${story.title}" não tem critérios de aceitação`, h.index);
    }
    stories.push(story);
  }
  return stories;
}

function parseTraceability(doc: MdDoc, issue: IssueFn): Requirement[] {
  const range = findSection(doc, 'Requirement Traceability', 3);
  if (!range) return [];
  const table = tableIn(doc, range);
  if (!table) {
    issue('warning', 'Requirement Traceability sem tabela de requisitos', range.heading.index);
    return [];
  }
  const idCol = Math.max(0, column(table, /id|requirement|requisito/i));
  const storyCol = column(table, /story|hist/i);
  const phaseCol = column(table, /phase|fase/i);
  const statusCol = column(table, /status/i);
  const reqs: Requirement[] = [];
  let templateSeen = false;
  for (const row of table.rows) {
    const id = plain(row.cells[idCol] ?? '');
    if (!id) continue;
    if (isPlaceholder(id) || id.includes('[')) {
      templateSeen = true;
      continue;
    }
    if (!ID_RE.test(id)) {
      issue('error', `ID de requisito malformado: "${id}" (esperado algo como AUTH-01)`, row.index);
      continue;
    }
    const status = plain(statusCol >= 0 ? (row.cells[statusCol] ?? '') : '');
    reqs.push({
      id,
      story: plain(storyCol >= 0 ? (row.cells[storyCol] ?? '') : ''),
      phase: plain(phaseCol >= 0 ? (row.cells[phaseCol] ?? '') : ''),
      status: status || 'Pending',
      statusKind: requirementStatusKind(status),
      line: row.index + 1,
    });
  }
  if (templateSeen && reqs.length === 0) {
    issue('warning', 'Requirement Traceability só tem linhas de template (nenhum ID real)', range.heading.index);
  }
  return reqs;
}

function parseAssumptions(doc: MdDoc, issue: IssueFn): { assumptions: Assumption[]; openQuestionsResolved: boolean | null } {
  const range = findSection(doc, 'Assumptions & Open Questions', 3);
  if (!range) return { assumptions: [], openQuestionsResolved: null };
  const assumptions: Assumption[] = [];
  const table = tableIn(doc, range);
  let templateSeen = false;
  for (const row of table?.rows ?? []) {
    const [text = '', chosen = '', rationale = '', confirmed = ''] = row.cells;
    if (row.cells.length < 3) continue;
    if (isPlaceholder(text) && isPlaceholder(chosen)) {
      templateSeen = true;
      continue;
    }
    if (!chosen || isPlaceholder(chosen)) issue('error', `Premissa "${short(text, 40)}" sem "Chosen default"`, row.index);
    if (!rationale || isPlaceholder(rationale)) issue('error', `Premissa "${short(text, 40)}" sem "Rationale"`, row.index);
    assumptions.push({ text: plain(text), chosen: plain(chosen), rationale: plain(rationale), confirmed: plain(confirmed), line: row.index + 1 });
  }
  if (templateSeen) issue('warning', 'Tabela de premissas ainda contém linhas do template', range.heading.index);

  const oq = bodyLines(doc, range).filter((l) => /open questions/i.test(l.text));
  let openQuestionsResolved: boolean | null = null;
  if (oq.length === 0) {
    issue('warning', 'Sem linha "Open questions:" na seção de premissas', range.heading.index);
  } else {
    const clean = oq
      .map((l) => l.text)
      .join(' ')
      .replace(/[*_]/g, '')
      .toLowerCase();
    openQuestionsResolved = /open questions.*:\s*none/.test(clean);
    if (!openQuestionsResolved) issue('warning', 'Há perguntas em aberto (esperado "Open questions: none")', oq[0].index);
  }
  return { assumptions, openQuestionsResolved };
}

function short(s: string, n = 70): string {
  const p = plain(s);
  return p.length > n ? p.slice(0, n - 1) + '…' : p;
}
