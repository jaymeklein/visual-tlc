// Line-based markdown helpers, in the spirit of the skill's own validators:
// heuristic inspection of the templates, not a full CommonMark parser.

export interface Heading {
  level: number;
  text: string;
  /** 0-based line index. */
  index: number;
}

export interface MdDoc {
  lines: string[];
  /** true for fence delimiters and every line inside a fenced block. */
  fenced: boolean[];
  headings: Heading[];
}

export interface Range {
  heading: Heading;
  /** First body line (0-based, inclusive). */
  start: number;
  /** End of body (0-based, exclusive). */
  end: number;
}

const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;

export function parseMd(text: string): MdDoc {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const fenced: boolean[] = [];
  const headings: Heading[] = [];
  let fence: string | null = null;
  lines.forEach((line, index) => {
    const f = FENCE_RE.exec(line);
    if (f) {
      if (fence === null) fence = f[1];
      else if (f[1] === fence) {
        fenced.push(true);
        fence = null;
        return;
      }
      fenced.push(true);
      return;
    }
    fenced.push(fence !== null);
    if (fence !== null) return;
    const h = HEADING_RE.exec(line);
    if (h) headings.push({ level: h[1].length, text: h[2].trim(), index });
  });
  return { lines, fenced, headings };
}

/** Case-insensitive "heading starts with name" match, tolerant of trailing text. */
export function headingMatches(text: string, name: string): boolean {
  const t = text.toLowerCase().replace(/\s+/g, ' ');
  const n = name.toLowerCase();
  return t === n || (t.startsWith(n) && !/[a-z0-9]/.test(t.charAt(n.length)));
}

export function rangeOf(doc: MdDoc, heading: Heading): Range {
  let end = doc.lines.length;
  for (const h of doc.headings) {
    if (h.index > heading.index && h.level <= heading.level) {
      end = h.index;
      break;
    }
  }
  return { heading, start: heading.index + 1, end };
}

export function findSection(doc: MdDoc, name: string, maxLevel = 6): Range | undefined {
  const h = doc.headings.find((x) => x.level <= maxLevel && headingMatches(x.text, name));
  return h ? rangeOf(doc, h) : undefined;
}

export function hasSection(doc: MdDoc, name: string, maxLevel = 6): boolean {
  return findSection(doc, name, maxLevel) !== undefined;
}

export function firstH1(doc: MdDoc): string {
  return doc.headings.find((h) => h.level === 1)?.text ?? '';
}

/** Non-fenced lines of a range with their 0-based index. */
export function bodyLines(doc: MdDoc, range: { start: number; end: number }): { text: string; index: number }[] {
  const out: { text: string; index: number }[] = [];
  for (let i = range.start; i < range.end; i++) {
    if (!doc.fenced[i]) out.push({ text: doc.lines[i], index: i });
  }
  return out;
}

export function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  // Respect escaped pipes and pipes inside inline code.
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (c === '`') {
      inCode = !inCode;
      cur += c;
    } else if (c === '|' && !inCode) {
      cells.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

export function isSeparatorRow(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
}

export interface Table {
  header: string[];
  rows: { cells: string[]; index: number }[];
}

/** First markdown table found inside the range. */
export function tableIn(doc: MdDoc, range: { start: number; end: number }): Table | undefined {
  const tables = tablesIn(doc, range);
  return tables[0];
}

export function tablesIn(doc: MdDoc, range: { start: number; end: number }): Table[] {
  const tables: Table[] = [];
  let current: Table | undefined;
  for (let i = range.start; i < range.end; i++) {
    const line = doc.lines[i];
    if (doc.fenced[i] || !line.trim().startsWith('|')) {
      current = undefined;
      continue;
    }
    if (isSeparatorRow(line)) continue;
    const cells = splitRow(line);
    if (!current) {
      current = { header: cells, rows: [] };
      tables.push(current);
    } else current.rows.push({ cells, index: i });
  }
  return tables;
}

/** Index of the first header cell matching the regex, or -1. */
export function column(table: Table, re: RegExp): number {
  return table.header.findIndex((h) => re.test(h.replace(/[*`_]/g, '')));
}

/** Template placeholder such as "[Feature Name]" or "[y/n]". */
export function isPlaceholder(s: string): boolean {
  return /^\s*\[[^\]]+\]\s*$/.test(s);
}

/** True when the value still holds a template choice list ("Draft | Approved"). */
export function isChoiceList(s: string): boolean {
  return s.includes('|');
}

const FIELD_BOLD_RE = /^\s*(?:[-*+]\s+)?(?:\*\*|__)([^*_]+?)(?:\*\*|__)\s*(?:\([^)]*\)\s*)?:\s*(.*)$/;
const FIELD_BOLD_COLON_IN_RE = /^\s*(?:[-*+]\s+)?(?:\*\*|__)([^*_]+?):(?:\*\*|__)\s*(.*)$/;
const FIELD_PLAIN_RE = /^\s*(?:[-*+]\s+)?([A-Za-z][A-Za-z /&-]{1,30}?)\s*:\s*(.*)$/;

/**
 * Reads a "**Key**: value" / "**Key:** value" / "- **Key**: value" line.
 * Plain "Key: value" is accepted only for keys in `plainKeys` (lowercase).
 */
export function readField(line: string, plainKeys?: readonly string[]): { key: string; value: string } | undefined {
  const m = FIELD_BOLD_RE.exec(line) ?? FIELD_BOLD_COLON_IN_RE.exec(line);
  if (m) return { key: m[1].trim().toLowerCase(), value: cleanValue(m[2]) };
  if (plainKeys) {
    const p = FIELD_PLAIN_RE.exec(line);
    if (p && plainKeys.includes(p[1].trim().toLowerCase())) {
      return { key: p[1].trim().toLowerCase(), value: cleanValue(p[2]) };
    }
  }
  return undefined;
}

function cleanValue(v: string): string {
  return v.replace(/<!--.*?-->/g, '').trim();
}

export function checkbox(line: string): { checked: boolean; text: string } | undefined {
  const m = /^\s*[-*+]\s+\[([ xX✓✔])\]\s*(.*)$/.exec(line);
  return m ? { checked: m[1] !== ' ', text: m[2].trim() } : undefined;
}

export function checklistIn(doc: MdDoc, range: { start: number; end: number }): { total: number; done: number } {
  let total = 0;
  let done = 0;
  for (const { text } of bodyLines(doc, range)) {
    const c = checkbox(text);
    if (!c || isPlaceholder(c.text)) continue;
    total++;
    if (c.checked) done++;
  }
  return { total, done };
}

/** Strips markdown emphasis/code markers for display. */
export function plain(s: string): string {
  return s
    .replace(/<!--.*?-->/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/`/g, '')
    .trim();
}

export const REQ_ID_RE = /\b[A-Z][A-Z0-9]*-\d+\b/g;
export const TASK_ID_RE = /\bT\d+\b/g;
