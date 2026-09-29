import type { Issue, ValidationDoc, Verdict } from './types.ts';
import { column, findSection, isChoiceList, parseMd, plain, readField, tableIn, type MdDoc } from './markdown.ts';

// Same regex as EVIDENCE_RE in the skill's scripts/validate_state.py.
export const EVIDENCE_RE = /[\w./-]+\.[A-Za-z0-9]+:\d+/;

/** Port of _verdict() from scripts/validate_state.py. */
export function verdictOf(text: string): Verdict {
  const lines = text.split(/\r?\n/);
  const candidates = lines.filter(
    (ln) => /^#{1,4}\s*validation\b/i.test(ln.trim()) || /\*{0,2}result\*{0,2}\s*:/i.test(ln.trim()),
  );
  const hay = candidates.length ? candidates.join(' ') : text;
  const hasPass = /\bPASS\b/.test(hay);
  const hasFail = /\bFAIL\b/.test(hay);
  if (hasPass && hasFail) return 'unfilled';
  if (hasPass) return 'pass';
  if (hasFail) return 'fail';
  return 'none';
}

export function parseValidation(text: string, file: string): ValidationDoc {
  const doc = parseMd(text);
  const issues: Issue[] = [];
  const issue = (severity: Issue['severity'], message: string, index?: number) =>
    issues.push({ severity, message, file, line: index === undefined ? undefined : index + 1 });

  let date = '';
  let diffRange = '';
  let overall: ValidationDoc['overall'] = null;
  let overallLine: number | undefined;
  doc.lines.forEach((line, i) => {
    if (doc.fenced[i]) return;
    const f = readField(line);
    if (!f) return;
    if (f.key === 'date' && !date && !/^\[/.test(f.value)) date = plain(f.value);
    if (f.key === 'diff range' && !diffRange && !/^\[/.test(f.value)) diffRange = plain(f.value);
    if (f.key === 'overall' && !isChoiceList(f.value)) {
      const v = f.value.toLowerCase();
      overall = /❌|not ready|não pronto/.test(v) ? 'not-ready' : /⚠|issue|problema/.test(v) ? 'issues' : /✅|ready|pronto/.test(v) ? 'ready' : null;
      overallLine = i;
    }
  });

  const verdict = verdictOf(text);
  const hasEvidence = EVIDENCE_RE.test(text);
  if (verdict === 'none') issue('error', 'validation.md não tem veredito PASS/FAIL (relatório só em prosa não conta)');
  else if (verdict === 'unfilled') issue('error', 'Veredito do validation.md ainda é o placeholder "[PASS | FAIL]"');
  else if (verdict === 'fail') issue('error', 'Verificação FAIL — os gaps devem virar fix tasks e passar por nova verificação');
  if (verdict === 'pass' && !hasEvidence) issue('error', 'validation.md é PASS mas não cita evidência file:line (evidence-or-zero)');
  if (overall === 'not-ready' || overall === 'issues') {
    issue('warning', overall === 'not-ready' ? 'Resumo do Verifier: Not Ready' : 'Resumo do Verifier: Issues', overallLine);
  }

  const criteria = countCriteria(doc);
  if (criteria.gap > 0) issue('warning', `${criteria.gap} critério(s) de aceitação sem cobertura (GAP)`);
  if (criteria.precision > 0) issue('info', `${criteria.precision} spec-precision gap(s) sinalizado(s) pelo Verifier`);

  const mutations = countMutations(doc);
  if (mutations.survived > 0) issue('warning', `${mutations.survived} mutante(s) sobreviveu(ram) ao sensor — testes pouco discriminantes`);

  const uat = countUat(doc);
  if (uat.issue > 0) issue('warning', `${uat.issue} problema(s) reportado(s) no UAT`);

  const fixPlans = doc.headings.filter((h) => /^Fix\s+\d+/i.test(h.text) && !/\[/.test(h.text)).length;

  return { date, diffRange, verdict, hasEvidence, overall, criteria, mutations, uat, fixPlans, issues };
}

function resultCells(doc: MdDoc, section: string, resultCol: RegExp): string[] {
  const range = findSection(doc, section);
  if (!range) return [];
  const table = tableIn(doc, range);
  if (!table) return [];
  let col = column(table, resultCol);
  if (col < 0) col = table.header.length - 1;
  return table.rows.map((r) => r.cells[col] ?? '').filter((c) => c && !/^\[.*\]$/.test(c.trim()) && !isChoiceList(c));
}

function countCriteria(doc: MdDoc): ValidationDoc['criteria'] {
  const cells = resultCells(doc, 'Spec-Anchored Acceptance Criteria', /result|resultado/i);
  const out = { pass: 0, gap: 0, precision: 0, total: cells.length };
  for (const c of cells) {
    if (/⚠|precision/i.test(c)) out.precision++;
    else if (/❌|gap|fail/i.test(c)) out.gap++;
    else if (/✅|pass/i.test(c)) out.pass++;
  }
  return out;
}

function countMutations(doc: MdDoc): ValidationDoc['mutations'] {
  const cells = resultCells(doc, 'Discrimination Sensor', /killed|morto/i);
  const out = { killed: 0, survived: 0, total: cells.length };
  for (const c of cells) {
    if (/❌|surviv|sobreviv/i.test(c)) out.survived++;
    else if (/✅|killed|morto/i.test(c)) out.killed++;
  }
  return out;
}

function countUat(doc: MdDoc): ValidationDoc['uat'] {
  const cells = resultCells(doc, 'Interactive UAT', /result|resultado/i);
  const out = { pass: 0, issue: 0, skip: 0 };
  for (const c of cells) {
    if (/⏭|skip/i.test(c)) out.skip++;
    else if (/❌|issue/i.test(c)) out.issue++;
    else if (/✅|pass/i.test(c)) out.pass++;
  }
  return out;
}
