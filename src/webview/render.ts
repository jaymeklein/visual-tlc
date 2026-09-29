import type { Feature, Issue, Project, Stage, Task, TaskPhase } from '../core/types.ts';
import type { FeatureRef, FromWebview } from '../core/protocol.ts';
import { plain } from '../core/markdown.ts';
import { featureMarkdown, HEALTH_LABEL, REQ_STATUS_LABEL, STAGE_LABEL, STAGE_ORDER, STAGE_STATE_LABEL, TASK_STATUS_LABEL } from '../core/labels.ts';

// Pure rendering of the dashboard: state in, HTML out. No DOM access, so it runs under node --test.

export interface ViewState {
  selected: FeatureRef | null;
  query: string;
  hideDone: boolean;
  /** taskKey()s of the task rows expanded in the detail view. */
  expandedTasks: string[];
}

export interface RenderCtx {
  projects: Project[];
  now: number;
  loaded: boolean;
  view: ViewState;
}

/** View state of a panel that just opened: on the board, with the completed features hidden. */
export const DEFAULT_VIEW: ViewState = { selected: null, query: '', hideDone: true, expandedTasks: [] };

let ctx: RenderCtx = { projects: [], now: 0, loaded: false, view: DEFAULT_VIEW };

export const taskKey = (projectId: string, feature: string, taskId: string) => `${projectId}|${feature}|${taskId}`;

// ---------- helpers ----------

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const pct = (v: number) => Math.round(v * 100);

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
function ago(ms: number | null): string {
  if (!ms) return '';
  const s = Math.round((ms - ctx.now) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return rtf.format(s, 'second');
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day');
  return rtf.format(Math.round(s / (86400 * 30)), 'month');
}

const svg = (body: string, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 16 16" aria-hidden="true">${body}</svg>`;
const I = {
  check: svg('<path d="M3.2 8.4l3 3 6.6-6.8" class="st"/>'),
  x: svg('<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" class="st"/>'),
  ring: svg('<circle cx="8" cy="8" r="5" class="st"/>'),
  half: svg('<circle cx="8" cy="8" r="5" class="st"/><path d="M8 3a5 5 0 0 1 0 10z" class="fl"/>'),
  dot: svg('<circle cx="8" cy="8" r="3.2" class="fl"/>'),
  slash: svg('<circle cx="8" cy="8" r="5" class="st"/><path d="M4.6 11.4l6.8-6.8" class="st"/>'),
  error: svg('<circle cx="8" cy="8" r="6" class="st"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" class="st"/>'),
  warning: svg('<path d="M8 2.2 14.3 13.5H1.7z" class="st"/><path d="M8 6.4v3.3M8 11.6v.1" class="st"/>'),
  info: svg('<circle cx="8" cy="8" r="6" class="st"/><path d="M8 7.2v4M8 4.9v.1" class="st"/>'),
  back: svg('<path d="M9.5 3.5 5 8l4.5 4.5" class="st"/>'),
  refresh: svg('<path d="M13 8a5 5 0 1 1-1.6-3.7" class="st"/><path d="M13 2.5v3h-3" class="st"/>'),
  file: svg('<path d="M4 1.8h5l3 3v9.4H4z" class="st"/><path d="M9 1.8v3h3" class="st"/>'),
  arrow: svg('<path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" class="st"/>'),
  pause: svg('<path d="M6 4v8M10 4v8" class="st"/>'),
  folder: svg('<path d="M1.8 3.6h4.3l1.5 1.7h6.6v7.1H1.8z" class="st"/>'),
  edit: svg('<path d="M10.6 2.6l2.8 2.8-7.7 7.7-3.3.6.6-3.3z" class="st"/>'),
  eye: svg('<path d="M1.5 8s2.4-4.3 6.5-4.3S14.5 8 14.5 8s-2.4 4.3-6.5 4.3S1.5 8 1.5 8z" class="st"/><circle cx="8" cy="8" r="1.9" class="st"/>'),
  branch: svg('<circle cx="5" cy="3.5" r="1.6" class="st"/><circle cx="5" cy="12.5" r="1.6" class="st"/><circle cx="11" cy="6" r="1.6" class="st"/><path d="M5 5.1v5.8M11 7.6c0 2.2-2.5 2.6-6 3.3" class="st"/>'),
};

const STAGE_GLYPH: Record<Stage['state'], string> = { done: I.check, active: I.half, pending: I.ring, skipped: I.slash, failed: I.x };
const TASK_GLYPH: Record<Task['status'], string> = { done: I.check, 'in-progress': I.half, blocked: I.slash, pending: I.ring };
const SEV_GLYPH: Record<Issue['severity'], string> = { error: I.error, warning: I.warning, info: I.info };

function openAttrs(projectId: string, file: string | undefined, line?: number): string {
  if (!file) return '';
  return `data-action="open" data-pid="${esc(projectId)}" data-file="${esc(file)}"${line ? ` data-line="${line}"` : ''} tabindex="0" role="button"`;
}

/** Click opens the markdown in the preview (read-only). */
function previewAttrs(projectId: string, file: string | undefined): string {
  if (!file) return '';
  return `data-action="preview-file" data-pid="${esc(projectId)}" data-file="${esc(file)}" tabindex="0" role="button"`;
}

function counts(f: Feature) {
  return {
    errors: f.issues.filter((i) => i.severity === 'error').length,
    warnings: f.issues.filter((i) => i.severity === 'warning').length,
  };
}

type Column = Feature['phase'] | 'done';
const columnOf = (f: Feature): Column => (f.health === 'complete' ? 'done' : f.phase);
const COLUMNS: { id: Column; label: string }[] = [...STAGE_ORDER.map((id) => ({ id: id as Column, label: STAGE_LABEL[id] })), { id: 'done', label: 'Concluídas' }];

// ---------- render ----------

/** Whole-page HTML for the given state. */
export function renderApp(context: RenderCtx): string {
  ctx = context;
  if (!ctx.loaded) return '<p class="empty">Carregando specs…</p>';
  if (ctx.projects.length === 0) return emptyState();
  const sel = ctx.view.selected && findFeature(ctx.view.selected);
  return sel ? detail(sel.project, sel.feature) : overview();
}

function findFeature(ref: FeatureRef): { project: Project; feature: Feature } | undefined {
  const project = ctx.projects.find((p) => p.id === ref.projectId);
  const feature = project?.features.find((f) => f.name === ref.feature);
  return project && feature ? { project, feature } : undefined;
}

function emptyState(): string {
  return `<div class="empty-state">
    <h1>Nenhuma spec encontrada</h1>
    <p>A extensão procura pastas <code>.specs/</code> no workspace, ou as pastas de <code>tlcSpecs.specsFolders</code>. Elas aparecem assim que a skill
    <code>/tlc-spec-driven</code> criar <code>.specs/features/&lt;feature&gt;/spec.md</code>.</p>
    <button class="btn" data-action="refresh">${I.refresh} Procurar de novo</button>
  </div>`;
}

// ---------- overview ----------

function overview(): string {
  const all = ctx.projects.flatMap((p) => p.features);
  const inProgress = all.filter((f) => f.health !== 'complete').length;
  const attention = all.filter((f) => f.health === 'failed' || counts(f).errors > 0).length;
  const done = all.filter((f) => f.health === 'complete').length;
  const tasksDone = all.reduce((n, f) => n + f.taskStats.done, 0);
  const tasksTotal = all.reduce((n, f) => n + f.taskStats.total, 0);
  const reqV = all.reduce((n, f) => n + f.requirementStats.verified, 0);
  const reqT = all.reduce((n, f) => n + f.requirementStats.total, 0);

  const tile = (label: string, value: string, hint = '', cls = '') =>
    `<div class="tile ${cls}"><div class="tile-value">${value}</div><div class="tile-label">${esc(label)}</div>${hint ? `<div class="tile-hint">${esc(hint)}</div>` : ''}</div>`;

  return `
  <header class="top">
    <div class="brand">
      <h1>TLC Specs</h1>
      <span class="muted">${esc(ctx.projects.map((p) => p.label).join(' · '))}</span>
    </div>
    <div class="toolbar">
      <input id="search" type="search" placeholder="Filtrar features…" value="${esc(ctx.view.query)}" aria-label="Filtrar features">
      <label class="check"><input type="checkbox" data-action="toggle-done" ${ctx.view.hideDone ? 'checked' : ''}> Ocultar concluídas</label>
      <button class="icon-btn" data-action="refresh" title="Atualizar" aria-label="Atualizar">${I.refresh}</button>
    </div>
  </header>

  <section class="tiles" aria-label="Resumo">
    ${tile('Features', String(all.length))}
    ${tile('Em andamento', String(inProgress))}
    ${tile('Precisam de atenção', String(attention), 'erros ou verificação falhou', attention ? 'tile-alert' : '')}
    ${tile('Concluídas', String(done), 'verificadas com PASS', done ? 'tile-ok' : '')}
    ${tile('Tasks', tasksTotal ? `${tasksDone}<span class="of">/${tasksTotal}</span>` : '—', 'concluídas')}
    ${tile('Requisitos', reqT ? `${reqV}<span class="of">/${reqT}</span>` : '—', 'verificados')}
  </section>

  ${ctx.projects.map((p) => projectSection(p)).join('')}`;
}

function projectSection(p: Project): string {
  const q = ctx.view.query.trim().toLowerCase();
  const visible = p.features.filter(
    (f) => (!ctx.view.hideDone || f.health !== 'complete') && (!q || f.name.toLowerCase().includes(q) || (f.spec?.title ?? '').toLowerCase().includes(q)),
  );
  const multi = ctx.projects.length > 1;
  return `
  <section class="project">
    ${multi ? `<h2 class="project-title">${esc(p.label)}</h2>` : ''}
    ${focusCard(p)}
    <div class="board${ctx.view.hideDone ? ' five-stages' : ''}" role="list">
      ${COLUMNS.map((col) => {
        const cards = visible.filter((f) => columnOf(f) === col.id);
        if (col.id === 'done' && ctx.view.hideDone) return '';
        return `<div class="column${cards.length ? '' : ' is-empty'}" role="listitem" aria-label="${esc(col.label)}">
          <div class="column-head"><span>${esc(col.label)}</span><span class="count">${cards.length}</span></div>
          ${cards.length ? cards.map((f) => card(p, f)).join('') : '<div class="column-empty">—</div>'}
        </div>`;
      }).join('')}
    </div>
    ${projectMeta(p)}
  </section>`;
}

function focusCard(p: Project): string {
  const h = p.state?.handoff;
  if (!h) return '';
  const f = p.activeFeature ? p.features.find((x) => x.name === p.activeFeature) : undefined;
  const blocked = h.blockers && !/^(none|nenhum|-|n\/a)\.?$/i.test(h.blockers);
  return `
  <div class="focus ${blocked ? 'focus-blocked' : ''}">
    <div class="focus-label">${I.pause} Em foco (handoff do STATE.md)</div>
    <div class="focus-body">
      <div class="focus-main">
        ${
          f
            ? `<button class="link strong" data-action="select" data-pid="${esc(p.id)}" data-feature="${esc(f.name)}">${esc(f.name)}</button>`
            : `<span class="strong">${esc(h.feature || '—')}</span>`
        }
        ${h.phaseTask ? `<span class="muted"> · ${esc(h.phaseTask)}</span>` : ''}
        ${h.nextStep ? `<div class="focus-next">${I.arrow} ${esc(h.nextStep)}</div>` : ''}
      </div>
      <div class="focus-side">
        ${h.branch ? `<span class="pill">${I.branch} ${esc(h.branch)}</span>` : ''}
        ${blocked ? `<span class="pill pill-warn">${I.warning} ${esc(h.blockers)}</span>` : ''}
        <button class="link" ${previewAttrs(p.id, 'STATE.md')}>abrir STATE.md</button>
      </div>
    </div>
  </div>`;
}

function miniPipe(f: Feature): string {
  return `<div class="pipe" aria-label="Pipeline">${f.stages
    .map((s) => {
      const partial = s.id === 'execute' && s.state === 'active' && f.taskStats.total > 0;
      return `<span class="seg s-${s.state}${partial ? ' partial' : ''}" ${partial ? `data-pct="${pct(f.taskStats.done / f.taskStats.total)}"` : ''} title="${esc(`${STAGE_LABEL[s.id]}: ${STAGE_STATE_LABEL[s.state]} — ${s.detail}`)}"></span>`;
    })
    .join('')}</div>`;
}

/** Preview-markdown and reveal-folder buttons; `labels` renders text buttons (detail header). */
function featureActions(p: Project, f: Feature, labels = false): string {
  const ref = `data-pid="${esc(p.id)}" data-feature="${esc(f.name)}"`;
  const md = featureMarkdown(f);
  const cls = labels ? 'btn-ghost' : 'icon-btn sm';
  const preview = md
    ? `<button class="${cls}" data-action="preview" ${ref} title="Visualizar ${esc(md.name)}" aria-label="Visualizar ${esc(md.name)}">${I.eye}${labels ? ` Visualizar ${esc(md.name)}` : ''}</button>`
    : '';
  const folder = `<button class="${cls}" data-action="reveal" ${ref} title="Abrir pasta da feature no Explorer" aria-label="Abrir pasta da feature">${I.folder}${labels ? ' Abrir pasta' : ''}</button>`;
  return `<span class="feature-actions">${preview}${folder}</span>`;
}

function card(p: Project, f: Feature): string {
  const c = counts(f);
  const badges = [
    f.active ? '<span class="pill pill-focus">em foco</span>' : '',
    c.errors ? `<span class="pill pill-err" title="erros">${I.error}${c.errors}</span>` : '',
    c.warnings ? `<span class="pill pill-warn" title="avisos">${I.warning}${c.warnings}</span>` : '',
  ].join('');
  const tasks = f.taskStats.total ? `${f.taskStats.done}/${f.taskStats.total} tasks` : f.requirementStats.total ? `${f.requirementStats.total} req.` : '';
  return `
  <div class="card h-${f.health}" role="button" tabindex="0" data-action="select" data-pid="${esc(p.id)}" data-feature="${esc(f.name)}" title="${esc(f.nextStep)}" aria-label="Detalhes de ${esc(f.name)}">
    <div class="card-head"><span class="card-name">${esc(f.name)}</span><span class="badges">${badges}</span></div>
    ${f.spec?.title && f.spec.title.toLowerCase() !== f.name.toLowerCase() ? `<div class="card-title">${esc(f.spec.title)}</div>` : ''}
    ${miniPipe(f)}
    <div class="card-meta"><span class="card-phase">${esc(f.phaseLabel)}</span><span>${pct(f.progress)}%</span></div>
    ${f.health !== 'complete' ? `<div class="card-next">${esc(f.nextStep)}</div>` : ''}
    <div class="card-foot"><span>${esc([tasks, ago(f.lastModified)].filter(Boolean).join(' · '))}</span>${featureActions(p, f)}</div>
  </div>`;
}

function projectMeta(p: Project): string {
  const decisions = (p.state?.decisions ?? []).filter((d) => d.active);
  const lessons = p.lessons.filter((l) => l.status === 'confirmed');
  const candidates = p.lessons.filter((l) => l.status === 'candidate').length;
  if (!decisions.length && !p.lessons.length && !p.issues.length) return '';
  return `
  <div class="meta-grid">
    ${
      decisions.length
        ? `<section class="panel"><h3>Decisões ativas <span class="count">${decisions.length}</span></h3>
        <ul class="rows">${decisions
          .map(
            (d) => `<li ${previewAttrs(p.id, 'STATE.md')} title="${esc([d.reason && `Motivo: ${d.reason}`, d.tradeoff && `Trade-off: ${d.tradeoff}`, d.scope && `Escopo: ${d.scope}`].filter(Boolean).join('\n'))}">
              <span class="mono id">${esc(d.id)}</span><span class="grow">${esc(d.decision)}</span><span class="muted small">${esc(d.date)}</span></li>`,
          )
          .join('')}</ul></section>`
        : ''
    }
    ${
      p.lessons.length
        ? `<section class="panel"><h3>Lições confirmadas <span class="count">${lessons.length}</span>${candidates ? `<span class="muted small"> · ${candidates} candidata(s) em observação</span>` : ''}</h3>
        ${
          lessons.length
            ? `<ul class="rows">${lessons
                .map(
                  (l) => `<li ${previewAttrs(p.id, 'LESSONS.md')} title="${esc(`Sinal: ${l.signal}\nFeatures: ${l.features.join(', ')}`)}">
              <span class="mono id">${esc(l.id)}</span><span class="grow">${esc(l.text)}</span><span class="muted small">×${l.recurrence}</span></li>`,
                )
                .join('')}</ul>`
            : '<p class="muted small">Nenhuma lição confirmada ainda — candidatas são promovidas após aparecerem em 2 features.</p>'
        }</section>`
        : ''
    }
    ${p.issues.length ? `<section class="panel"><h3>Avisos do projeto</h3>${issueList(p.id, p.issues)}</section>` : ''}
  </div>`;
}

// ---------- detail ----------

function detail(p: Project, f: Feature): string {
  const c = counts(f);
  return `
  <nav class="crumbs">
    <button class="link" data-action="back">${I.back} Todas as features</button>
    <span class="crumb-actions">
      ${featureActions(p, f, true)}
      <button class="icon-btn" data-action="refresh" title="Atualizar" aria-label="Atualizar">${I.refresh}</button>
    </span>
  </nav>

  <header class="detail-head">
    <div class="detail-title">
      <h1><span class="mono">${esc(f.name)}</span>
        <span class="chip h-${f.health}">${esc(f.phaseLabel)}</span>
        ${f.active ? '<span class="chip chip-focus">em foco</span>' : ''}
      </h1>
      ${f.spec?.title ? `<p class="subtitle">${esc(f.spec.title)}</p>` : ''}
      ${f.spec?.problem ? `<p class="problem">${esc(f.spec.problem)}</p>` : ''}
    </div>
    <div class="detail-progress">
      <div class="big-pct">${pct(f.progress)}<span>%</span></div>
      <div class="bar"><span data-pct="${pct(f.progress)}" class="bar-fill h-${f.health}"></span></div>
      <div class="muted small">${esc(HEALTH_LABEL[f.health])}${f.lastModified ? ` · atualizado ${esc(ago(f.lastModified))}` : ''}</div>
    </div>
  </header>

  <ol class="stepper">${f.stages.map((s) => step(p, f, s)).join('')}</ol>

  <div class="next ${f.health === 'failed' ? 'next-fail' : f.health === 'complete' ? 'next-ok' : ''}">
    <span class="next-label">${f.health === 'complete' ? I.check : I.arrow} Próximo passo</span>
    <span>${esc(f.nextStep)}</span>
  </div>

  <div class="cols">
    <div class="col">
      ${tasksPanel(p, f)}
      <div class="pair">${storiesPanel(p, f)}${requirementsPanel(p, f)}</div>
      ${designPanel(p, f)}
    </div>
    <div class="col">
      <section class="panel">
        <h3>Avisos ${c.errors + c.warnings ? `<span class="count ${c.errors ? 'count-err' : 'count-warn'}">${c.errors + c.warnings}</span>` : ''}</h3>
        ${f.issues.length ? issueList(p.id, f.issues) : `<p class="ok-line">${I.check} Nenhum aviso — os artefatos passam nas mesmas checagens dos validadores da skill.</p>`}
      </section>
      ${verifyPanel(p, f)}
      ${filesPanel(p, f)}
    </div>
  </div>`;
}

function step(p: Project, f: Feature, s: Stage): string {
  const attrs = s.file ? previewAttrs(p.id, s.file) : '';
  return `<li class="step s-${s.state}" ${attrs} title="${esc(s.file ? `Abrir ${s.file}` : '')}">
    <span class="step-dot">${STAGE_GLYPH[s.state]}</span>
    <span class="step-label">${esc(STAGE_LABEL[s.id])}</span>
    <span class="step-detail">${esc(s.detail)}</span>
  </li>`;
}

function tasksPanel(p: Project, f: Feature): string {
  const t = f.tasks;
  const tasksFile = `${f.dir}/tasks.md`;
  if (!t || t.tasks.length === 0) {
    const why =
      f.stages.find((s) => s.id === 'tasks')?.state === 'skipped'
        ? 'Fase Tasks pulada — no escopo Medium/Small a execução lista os passos inline, sem tasks.md.'
        : 'Ainda não há tasks.md para esta feature.';
    return `<section class="panel"><h3>Tasks</h3><p class="muted">${esc(why)}</p></section>`;
  }
  const phased = t.phases.filter((ph) => ph.taskIds.length > 0);
  const loose = t.tasks.filter((x) => x.phase === null || !phased.some((ph) => ph.number === x.phase));
  const groups: { phase: TaskPhase | null; tasks: Task[] }[] = [
    ...phased.map((phase) => ({ phase, tasks: t.tasks.filter((x) => x.phase === phase.number) })),
    ...(loose.length ? [{ phase: null, tasks: loose }] : []),
  ];
  const s = f.taskStats;
  return `
  <section class="panel">
    <h3>Tasks <span class="count">${s.done}/${s.total}</span>
      ${t.status ? `<span class="muted small"> · tasks.md: ${esc(DOC_STATUS[t.status])}</span>` : ''}
      <button class="link small push" ${previewAttrs(p.id, tasksFile)}>abrir tasks.md</button>
    </h3>
    <div class="legend small muted">
      <span class="st-done">${I.check} ${s.done} concluída(s)</span>
      <span class="st-in-progress">${I.half} ${s.inProgress} em andamento</span>
      ${s.blocked ? `<span class="st-blocked">${I.slash} ${s.blocked} bloqueada(s)</span>` : ''}
      <span class="st-pending">${I.ring} ${s.pending} pendente(s)</span>
    </div>
    ${groups
      .map(({ phase, tasks }) => {
        const d = tasks.filter((x) => x.status === 'done').length;
        return `<div class="phase">
          <div class="phase-head" ${phase ? previewAttrs(p.id, tasksFile) : ''}>
            <span>${phase ? `Phase ${phase.number}${phase.name ? ` · ${esc(phase.name)}` : ''}` : 'Sem fase'}</span>
            <span class="phase-bar"><span class="bar-fill h-ok" data-pct="${pct(tasks.length ? d / tasks.length : 0)}"></span></span>
            <span class="muted small">${d}/${tasks.length}</span>
          </div>
          <ul class="rows tasks">${tasks.map((x) => taskRow(p, f, x)).join('')}</ul>
        </div>`;
      })
      .join('')}
  </section>`;
}

/** Read-only task row: a click toggles the details below it, never opens tasks.md. */
function taskRow(p: Project, f: Feature, t: Task): string {
  const key = taskKey(p.id, f.name, t.id);
  const expanded = ctx.view.expandedTasks.includes(key);
  const checks = t.doneWhen.length ? `${t.doneWhen.filter((c) => c.checked).length}/${t.doneWhen.length}` : '';
  const title = `${t.id}: ${t.title} — ${TASK_STATUS_LABEL[t.status]} · ${expanded ? 'clique para recolher' : 'clique para ver os detalhes'}`;
  const details = expanded ? `<li class="task-details" data-key="${esc(key)}">${taskDetailsHtml(t)}</li>` : '';
  return `<li class="task st-${t.status}${expanded ? ' expanded' : ''}" data-action="toggle-task" data-key="${esc(key)}" tabindex="0" role="button" aria-expanded="${expanded}" title="${esc(title)}">
    <span class="glyph">${TASK_GLYPH[t.status]}</span>
    <span class="mono id">${esc(t.id)}</span>
    <span class="grow"><span class="task-title">${esc(t.title)}</span>${t.what ? `<span class="task-what">${esc(t.what)}</span>` : ''}</span>
    <span class="chips">${t.requirements.map((r) => `<span class="chip-sm mono">${esc(r)}</span>`).join('')}</span>
    <span class="muted small nowrap">${esc([t.tests, t.gate].filter(Boolean).join(' · '))}</span>
    <span class="muted small nowrap checks">${checks}</span>
  </li>${details}`;
}

export function taskDetailsHtml(t: Task): string {
  const fields: [string, string][] = [
    ['O quê', t.what],
    ['Onde', plain(t.where)],
    ['Depende de', t.dependsOn.join(', ') || 'nenhuma'],
    ['Requisitos', t.requirements.join(', ')],
    ['Tests / Gate', [t.tests, t.gate].filter(Boolean).join(' · ')],
  ];
  const kv = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('');
  const checks = t.doneWhen.length
    ? `<div class="details-sub">Done when</div><ul class="checklist">${t.doneWhen
        .map((c) => `<li class="check-item ${c.checked ? 'checked' : 'unchecked'}">${c.checked ? I.check : I.ring}<span>${esc(c.text)}</span></li>`)
        .join('')}</ul>`
    : '';
  return `<dl class="kv small">${kv}</dl>${checks}`;
}

function verifyPanel(p: Project, f: Feature): string {
  const v = f.validation;
  const file = `${f.dir}/validation.md`;
  if (!v) {
    const waiting = f.phase === 'verify';
    return `<section class="panel"><h3>Verificação</h3>
      <div class="verdict ${waiting ? 'v-wait' : 'v-none'}">${waiting ? I.warning : I.ring}<span>${waiting ? 'Aguardando o Verifier' : 'Ainda não verificada'}</span></div>
      <p class="muted small">${
        waiting
          ? 'A execução terminou, mas o validation.md não existe. Pela skill, a feature só está pronta quando um Verifier independente grava o relatório com veredito PASS e evidência file:line.'
          : 'O Verifier roda automaticamente após a última task e grava validation.md.'
      }</p></section>`;
  }
  const label = v.verdict === 'pass' ? (v.hasEvidence ? 'PASS' : 'PASS sem evidência') : v.verdict === 'fail' ? 'FAIL' : v.verdict === 'unfilled' ? 'Veredito não preenchido' : 'Sem veredito';
  const cls = v.verdict === 'pass' && v.hasEvidence ? 'v-pass' : v.verdict === 'fail' ? 'v-fail' : 'v-wait';
  const metric = (value: string, name: string, bad = false) => `<div class="metric ${bad ? 'metric-bad' : ''}"><div class="metric-value">${value}</div><div class="metric-name">${esc(name)}</div></div>`;
  return `<section class="panel"><h3>Verificação <button class="link small push" ${previewAttrs(p.id, file)}>abrir validation.md</button></h3>
    <div class="verdict ${cls}">${cls === 'v-pass' ? I.check : cls === 'v-fail' ? I.x : I.warning}<span>${esc(label)}</span>
      ${v.overall ? `<span class="muted small">· ${esc({ ready: 'Ready', issues: 'Issues', 'not-ready': 'Not Ready' }[v.overall])}</span>` : ''}</div>
    <div class="metrics">
      ${v.criteria.total ? metric(`${v.criteria.pass}/${v.criteria.total}`, 'critérios PASS', v.criteria.gap > 0) : ''}
      ${v.criteria.precision ? metric(String(v.criteria.precision), 'spec-precision gaps', true) : ''}
      ${v.mutations.total ? metric(`${v.mutations.killed}/${v.mutations.total}`, 'mutantes mortos', v.mutations.survived > 0) : ''}
      ${v.uat.pass + v.uat.issue + v.uat.skip ? metric(`${v.uat.pass}/${v.uat.pass + v.uat.issue + v.uat.skip}`, 'UAT ok', v.uat.issue > 0) : ''}
      ${v.fixPlans ? metric(String(v.fixPlans), 'fix plans', true) : ''}
    </div>
    <dl class="kv small">
      ${v.date ? `<dt>Data</dt><dd>${esc(v.date)}</dd>` : ''}
      ${v.diffRange ? `<dt>Diff</dt><dd class="mono">${esc(v.diffRange)}</dd>` : ''}
      <dt>Evidência</dt><dd>${v.hasEvidence ? 'cita file:line' : '<span class="err">nenhuma citação file:line</span>'}</dd>
    </dl>
  </section>`;
}

function requirementsPanel(p: Project, f: Feature): string {
  const reqs = f.spec?.requirements ?? [];
  if (!reqs.length) return '';
  const s = f.requirementStats;
  const file = `${f.dir}/spec.md`;
  return `<section class="panel"><h3>Requisitos <span class="count">${s.verified}/${s.total}</span>
      ${f.tasks ? `<span class="muted small"> · ${s.mapped}/${s.total} com task</span>` : ''}</h3>
    <ul class="rows">${reqs
      .map(
        (r) => `<li ${previewAttrs(p.id, file)}>
        <span class="mono id">${esc(r.id)}</span><span class="grow ellipsis">${esc(r.story)}</span>
        <span class="req req-${r.statusKind}">${esc(r.status || REQ_STATUS_LABEL[r.statusKind])}</span></li>`,
      )
      .join('')}</ul></section>`;
}

const DOC_STATUS: Record<string, string> = { draft: 'rascunho', approved: 'aprovado', 'in-progress': 'em andamento', done: 'concluído' };

const EARS_SHORT: Record<string, string> = {
  'event-driven': 'WHEN',
  'state-driven': 'WHILE',
  'unwanted-behavior': 'IF',
  'optional-feature': 'WHERE',
  ubiquitous: 'THE',
  complex: 'MIX',
  unknown: '?',
  invalid: 'sem SHALL',
};

function storiesPanel(p: Project, f: Feature): string {
  const spec = f.spec;
  if (!spec) return '';
  const file = `${f.dir}/spec.md`;
  const facts = [
    spec.goals.total ? `Metas ${spec.goals.done}/${spec.goals.total}` : '',
    spec.successCriteria.total ? `Critérios de sucesso ${spec.successCriteria.done}/${spec.successCriteria.total}` : '',
    spec.edgeCases ? `${spec.edgeCases} edge case(s)` : '',
    spec.outOfScope ? `${spec.outOfScope} fora do escopo` : '',
    spec.assumptions.length ? `${spec.assumptions.length} premissa(s)` : '',
    spec.openQuestionsResolved === true ? 'perguntas resolvidas' : spec.openQuestionsResolved === false ? 'há perguntas em aberto' : '',
  ].filter(Boolean);
  return `<section class="panel"><h3>Histórias <span class="count">${spec.stories.length}</span><button class="link small push" ${previewAttrs(p.id, file)}>abrir spec.md</button></h3>
    <ul class="rows">${spec.stories
      .map(
        (s) => `<li ${previewAttrs(p.id, file)} title="${esc(s.criteria.map((c, i) => `${i + 1}. ${c.text}`).join('\n'))}">
        <span class="prio prio-${esc(s.priority.toLowerCase())}">${esc(s.priority)}</span>
        <span class="grow ellipsis">${esc(s.title)}${s.mvp ? ' <span class="mvp">MVP</span>' : ''}</span>
        <span class="chips">${s.criteria.map((c) => `<span class="chip-sm ears-${c.pattern}" title="${esc(c.text)}">${esc(EARS_SHORT[c.pattern])}</span>`).join('')}</span></li>`,
      )
      .join('')}</ul>
    ${facts.length ? `<p class="muted small facts">${facts.map(esc).join(' · ')}</p>` : ''}
  </section>`;
}

function designPanel(p: Project, f: Feature): string {
  const d = f.design;
  const c = f.context;
  if (!d && !c) return '';
  return `<section class="panel"><h3>Design & contexto</h3>
    ${
      d
        ? `<div class="sub" ${previewAttrs(p.id, `${f.dir}/design.md`)}>
        <div class="sub-head">design.md ${d.status ? `<span class="chip-sm">${d.status === 'approved' ? 'Approved' : 'Draft'}</span>` : ''}</div>
        <div class="muted small">${d.components.length} componente(s) · ${d.risks} risco(s) · ${d.techDecisions} decisão(ões) técnicas</div>
        ${d.components.length ? `<div class="chips wrap">${d.components.map((x) => `<span class="chip-sm">${esc(x)}</span>`).join('')}</div>` : ''}
      </div>`
        : ''
    }
    ${
      c
        ? `<div class="sub" ${previewAttrs(p.id, `${f.dir}/context.md`)}>
        <div class="sub-head">context.md <span class="muted small">(discuss${c.gathered ? ` · ${esc(c.gathered)}` : ''})</span></div>
        ${c.decisionAreas.length ? `<div class="chips wrap">${c.decisionAreas.map((x) => `<span class="chip-sm">${esc(x)}</span>`).join('')}</div>` : ''}
        ${c.hasDeferredIdeas ? '<div class="muted small">Tem ideias adiadas (Deferred Ideas)</div>' : ''}
      </div>`
        : ''
    }
  </section>`;
}

function filesPanel(p: Project, f: Feature): string {
  if (!f.files.length) return '';
  return `<section class="panel"><h3>Arquivos <span class="count">${f.files.length}</span></h3>
    <ul class="rows">${f.files
      .map(
        (x) => `<li ${previewAttrs(p.id, x.path)}>${I.file}<span class="grow mono">${esc(x.name)}</span>
        ${x.empty ? '<span class="req req-needs-fix">vazio</span>' : x.kind === 'other' ? '<span class="muted small">extra</span>' : ''}
        <span class="muted small nowrap">${esc(ago(x.mtime))}</span>
        <button class="icon-btn sm" data-action="open" data-pid="${esc(p.id)}" data-file="${esc(x.path)}" title="Abrir no editor" aria-label="Abrir ${esc(x.name)} no editor">${I.edit}</button></li>`,
      )
      .join('')}</ul></section>`;
}

function issueList(projectId: string, issues: Issue[]): string {
  const rank = { error: 0, warning: 1, info: 2 } as const;
  return `<ul class="rows issues">${[...issues]
    .sort((a, b) => rank[a.severity] - rank[b.severity])
    .map(
      (i) => `<li class="sev-${i.severity}" ${openAttrs(projectId, i.file, i.line)}>
      <span class="glyph">${SEV_GLYPH[i.severity]}</span><span class="grow">${esc(i.message)}</span>
      ${i.file ? `<span class="muted small nowrap mono">${esc(i.file.split('/').pop())}${i.line ? `:${i.line}` : ''}</span>` : ''}</li>`,
    )
    .join('')}</ul>`;
}

// ---------- actions ----------

export interface ActionResult {
  view?: Partial<ViewState>;
  message?: FromWebview;
  scrollTop?: boolean;
}

/** Maps a clicked element's data-* attributes to a view change and/or a message for the extension. */
export function actionFor(d: Record<string, string | undefined>, expandedTasks: readonly string[] = []): ActionResult {
  const ref = (): FeatureRef => ({ projectId: d.pid!, feature: d.feature! });
  switch (d.action) {
    case 'select':
      return { view: { selected: ref() }, scrollTop: true };
    case 'back':
      return { view: { selected: null } };
    case 'refresh':
      return { message: { type: 'refresh' } };
    case 'preview':
      return { message: { type: 'previewMarkdown', target: ref() } };
    case 'reveal':
      return { message: { type: 'revealFolder', target: ref() } };
    case 'preview-file':
      return { message: { type: 'previewFile', projectId: d.pid!, file: d.file! } };
    case 'toggle-task': {
      const key = d.key!;
      return { view: { expandedTasks: expandedTasks.includes(key) ? expandedTasks.filter((k) => k !== key) : [...expandedTasks, key] } };
    }
    case 'open':
      return { message: { type: 'open', projectId: d.pid!, file: d.file!, line: d.line ? Number(d.line) : undefined } };
    default:
      return {};
  }
}
