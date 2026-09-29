import type { Feature, FeatureFile, Handoff, Health, Issue, Stage, StageId, Task, TaskStats } from './types.ts';
import { parseSpec } from './spec.ts';
import { parseTasks, taskStats } from './tasks.ts';
import { parseValidation } from './validation.ts';
import { parseContext, parseDesign } from './docs.ts';
import { STAGE_ORDER } from './labels.ts';

const STAGE_WEIGHT: Record<StageId, number> = { spec: 0.15, design: 0.1, tasks: 0.1, execute: 0.5, verify: 0.15 };

export type ArtifactKind = 'spec' | 'context' | 'design' | 'tasks' | 'validation';

export interface FeatureInput {
  name: string;
  /** Relative to .specs, e.g. "features/auth". */
  dir: string;
  files: FeatureFile[];
  texts: Partial<Record<ArtifactKind, string>>;
}

export interface AnalyzeOptions {
  now: number;
  staleAfterDays: number;
  active: boolean;
  handoff: Handoff | null;
}

const DAY = 24 * 60 * 60 * 1000;

export function analyzeFeature(input: FeatureInput, opts: AnalyzeOptions): Feature {
  const issues: Issue[] = [];
  const pathOf = (k: ArtifactKind) => `${input.dir}/${k}.md`;
  const textOf = (k: ArtifactKind): string | undefined => {
    const t = input.texts[k];
    if (t === undefined) return undefined;
    if (t.trim() === '') {
      issues.push({
        severity: 'warning',
        message: `${k}.md está vazio — a skill só cria artefatos quando a fase produz conteúdo`,
        file: pathOf(k),
      });
      return undefined;
    }
    return t;
  };

  const specText = textOf('spec');
  const spec = specText !== undefined ? parseSpec(specText, pathOf('spec')) : null;
  const contextText = textOf('context');
  const context = contextText !== undefined ? parseContext(contextText, pathOf('context')) : null;
  const designText = textOf('design');
  const design = designText !== undefined ? parseDesign(designText, pathOf('design')) : null;
  const tasksText = textOf('tasks');
  const tasks = tasksText !== undefined ? parseTasks(tasksText, pathOf('tasks')) : null;
  const validationText = textOf('validation');
  const validation = validationText !== undefined ? parseValidation(validationText, pathOf('validation')) : null;

  for (const doc of [spec, context, design, tasks, validation]) if (doc) issues.push(...doc.issues);
  if (!spec && input.texts.spec === undefined) {
    issues.push({ severity: 'error', message: 'spec.md ausente — toda feature começa pela fase Specify', file: input.dir });
  }

  const stats: TaskStats = tasks ? taskStats(tasks.tasks) : { total: 0, done: 0, inProgress: 0, blocked: 0, pending: 0 };
  const reqs = spec?.requirements ?? [];

  // ---- execution signals ----
  const reqStarted = reqs.some((r) => r.statusKind === 'implementing' || r.statusKind === 'verified' || r.statusKind === 'needs-fix');
  const execStarted =
    stats.done + stats.inProgress + stats.blocked > 0 ||
    tasks?.status === 'in-progress' ||
    tasks?.status === 'done' ||
    reqStarted ||
    validation !== null;
  const execComplete = tasks
    ? (stats.total > 0 && stats.done === stats.total) || tasks.status === 'done'
    : reqs.length > 0 && reqs.every((r) => r.statusKind === 'verified');

  // ---- current phase ----
  let phase: StageId;
  if (validation || (spec && execComplete)) phase = 'verify';
  else if (spec && execStarted) phase = 'execute';
  else if (tasks) phase = 'tasks';
  else if (design) phase = 'design';
  else phase = 'spec';

  const verifyPassed = validation?.verdict === 'pass' && validation.hasEvidence;
  const verifyFailed = validation?.verdict === 'fail';
  const phaseIdx = STAGE_ORDER.indexOf(phase);

  const stages: Stage[] = STAGE_ORDER.map((id, idx): Stage => {
    const file = id === 'execute' ? (tasks ? pathOf('tasks') : undefined) : id === 'verify' ? (validation ? pathOf('validation') : undefined) : undefined;
    switch (id) {
      case 'spec':
        return {
          id,
          state: !spec ? (phase === 'spec' ? 'active' : 'pending') : phase === 'spec' ? 'active' : 'done',
          detail: spec
            ? `${spec.stories.length} história(s) · ${reqs.length} requisito(s)${context ? ' · discuss' : ''}`
            : 'spec.md ausente',
          file: spec ? pathOf('spec') : undefined,
        };
      case 'design':
        return {
          id,
          state: design ? (phase === 'design' ? 'active' : 'done') : idx < phaseIdx ? 'skipped' : 'pending',
          detail: design
            ? `${design.components.length} componente(s)${design.status ? ` · ${design.status === 'approved' ? 'aprovado' : 'rascunho'}` : ''}`
            : idx < phaseIdx
              ? 'pulada (escopo não exigiu)'
              : '—',
          file: design ? pathOf('design') : undefined,
        };
      case 'tasks':
        return {
          id,
          state: tasks ? (phase === 'tasks' ? 'active' : 'done') : idx < phaseIdx ? 'skipped' : 'pending',
          detail: tasks
            ? `${stats.total} task(s) · ${tasks.phases.length} fase(s)${tasks.status ? ` · ${docStatusLabel(tasks.status)}` : ''}`
            : idx < phaseIdx
              ? 'pulada (tasks implícitas)'
              : '—',
          file: tasks ? pathOf('tasks') : undefined,
        };
      case 'execute':
        return {
          id,
          state: phase === 'execute' ? 'active' : idx < phaseIdx ? 'done' : 'pending',
          detail: tasks && stats.total > 0 ? `${stats.done}/${stats.total} concluída(s)` : phase === 'execute' ? 'em andamento' : idx < phaseIdx ? 'concluída' : '—',
          file,
        };
      case 'verify':
        return {
          id,
          state: verifyPassed ? 'done' : verifyFailed ? 'failed' : phase === 'verify' ? 'active' : 'pending',
          detail: validation
            ? verifyPassed
              ? 'PASS'
              : verifyFailed
                ? 'FAIL'
                : validation.verdict === 'pass'
                  ? 'PASS sem evidência'
                  : 'veredito incompleto'
            : phase === 'verify'
              ? 'aguardando Verifier'
              : '—',
          file,
        };
    }
  });

  // ---- cross-file checks ----
  const specIds = new Set(reqs.map((r) => r.id));
  let mapped = 0;
  if (tasks && spec) {
    const referenced = new Set(tasks.tasks.flatMap((t) => t.requirements));
    if (specIds.size > 0) {
      for (const t of tasks.tasks) {
        for (const r of t.requirements) {
          if (!specIds.has(r)) issues.push({ severity: 'warning', message: `${t.id} cita ${r}, que não existe na spec`, file: pathOf('tasks'), line: t.line });
        }
      }
    }
    const unmapped = reqs.filter((r) => !referenced.has(r.id));
    mapped = reqs.length - unmapped.length;
    if (referenced.size === 0 && reqs.length > 0 && tasks.tasks.length > 0) {
      issues.push({ severity: 'info', message: 'Nenhuma task cita requisitos (campo "Requirement") — rastreabilidade incompleta', file: pathOf('tasks') });
    } else if (unmapped.length > 0) {
      issues.push({
        severity: 'warning',
        message: `Requisito(s) sem task: ${unmapped.map((r) => r.id).join(', ')}`,
        file: pathOf('spec'),
        line: unmapped[0].line,
      });
    }
  }
  if (execComplete && !validation && spec) {
    issues.push({
      severity: 'error',
      message: 'Execução concluída, mas validation.md não existe — o Verifier ainda não rodou (feature não está pronta)',
      file: input.dir,
    });
  }
  if (verifyPassed && tasks && stats.done < stats.total) {
    issues.push({ severity: 'warning', message: `validation.md é PASS, mas ${stats.total - stats.done} task(s) não estão marcadas como concluídas`, file: pathOf('tasks') });
  }
  if (verifyPassed && reqs.length > 0) {
    const notVerified = reqs.filter((r) => r.statusKind !== 'verified');
    if (notVerified.length > 0) {
      issues.push({
        severity: 'info',
        message: `Rastreabilidade não atualizada: ${notVerified.length} requisito(s) ainda não estão como Verified`,
        file: pathOf('spec'),
        line: notVerified[0].line,
      });
    }
  }
  if (tasks?.status === 'draft' && execStarted) {
    issues.push({ severity: 'info', message: 'tasks.md continua como Draft, mas a execução já começou', file: pathOf('tasks') });
  }
  for (const t of tasks?.tasks ?? []) {
    if (t.status === 'blocked') issues.push({ severity: 'warning', message: `${t.id} está bloqueada: ${t.title}`, file: pathOf('tasks'), line: t.line });
  }

  const lastModified = input.files.reduce<number | null>((m, f) => (f.mtime !== null && (m === null || f.mtime > m) ? f.mtime : m), null);
  if (!verifyPassed && opts.staleAfterDays > 0 && lastModified !== null) {
    const days = Math.floor((opts.now - lastModified) / DAY);
    if (days >= opts.staleAfterDays) issues.push({ severity: 'info', message: `Feature parada: sem alterações há ${days} dia(s)` });
  }
  if (opts.active && opts.handoff?.blockers && !/^(none|nenhum|-|n\/a)\.?$/i.test(opts.handoff.blockers)) {
    issues.push({ severity: 'warning', message: `Handoff registra bloqueio: ${opts.handoff.blockers}`, file: 'STATE.md', line: opts.handoff.line });
  }

  // ---- summary ----
  const hasErrors = issues.some((i) => i.severity === 'error');
  const health: Health = verifyPassed ? 'complete' : verifyFailed || stats.blocked > 0 ? 'failed' : hasErrors ? 'attention' : 'ok';

  let progress = 0;
  for (const s of stages) {
    const w = STAGE_WEIGHT[s.id];
    if (s.state === 'done' || s.state === 'skipped') progress += w;
    else if (s.state === 'active' || s.state === 'failed') {
      progress += s.id === 'execute' && stats.total > 0 ? (w * stats.done) / stats.total : w * 0.5;
    }
  }

  return {
    name: input.name,
    dir: input.dir,
    files: input.files,
    spec,
    context,
    design,
    tasks,
    validation,
    stages,
    phase,
    phaseLabel: phaseLabel(phase, { verifyPassed, verifyFailed, hasValidation: !!validation, validationPassNoEvidence: validation?.verdict === 'pass', stats, tasksStatus: tasks?.status ?? null, designStatus: design?.status ?? null, discuss: !!context }),
    health,
    progress: Math.min(1, Math.round(progress * 100) / 100),
    taskStats: stats,
    requirementStats: { total: reqs.length, verified: reqs.filter((r) => r.statusKind === 'verified').length, mapped },
    nextStep: nextStep(phase, {
      spec: !!spec,
      specErrors: spec?.issues.filter((i) => i.severity === 'error').length ?? 0,
      tasksErrors: tasks?.issues.filter((i) => i.severity === 'error').length ?? 0,
      tasks: tasks?.tasks ?? [],
      tasksStatus: tasks?.status ?? null,
      verifyPassed,
      verifyFailed,
      hasValidation: !!validation,
      handoff: opts.active ? opts.handoff : null,
    }),
    issues,
    lastModified,
    active: opts.active,
  };
}

function docStatusLabel(s: string): string {
  return ({ draft: 'rascunho', approved: 'aprovadas', 'in-progress': 'em andamento', done: 'concluídas' } as Record<string, string>)[s] ?? s;
}

function phaseLabel(
  phase: StageId,
  c: {
    verifyPassed: boolean;
    verifyFailed: boolean;
    hasValidation: boolean;
    validationPassNoEvidence: boolean;
    stats: TaskStats;
    tasksStatus: string | null;
    designStatus: string | null;
    discuss: boolean;
  },
): string {
  switch (phase) {
    case 'verify':
      if (c.verifyPassed) return 'Concluída';
      if (c.verifyFailed) return 'Verificação falhou';
      if (c.validationPassNoEvidence) return 'Verificação sem evidência';
      return c.hasValidation ? 'Verificação incompleta' : 'Aguardando verificação';
    case 'execute':
      return c.stats.total > 0 ? `Execução ${c.stats.done}/${c.stats.total}` : 'Execução';
    case 'tasks':
      return c.tasksStatus === 'draft' ? 'Tasks (rascunho)' : c.tasksStatus === 'approved' ? 'Tasks aprovadas' : 'Tasks';
    case 'design':
      return c.designStatus === 'draft' ? 'Design (rascunho)' : c.designStatus === 'approved' ? 'Design aprovado' : 'Design';
    case 'spec':
      return c.discuss ? 'Spec · discuss' : 'Spec';
  }
}

function nextTask(tasks: Task[]): Task | undefined {
  const done = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
  const open = tasks.filter((t) => t.status !== 'done');
  return open.find((t) => t.status === 'in-progress') ?? open.find((t) => t.dependsOn.every((d) => done.has(d))) ?? open[0];
}

function nextStep(
  phase: StageId,
  c: {
    spec: boolean;
    specErrors: number;
    tasksErrors: number;
    tasks: Task[];
    tasksStatus: string | null;
    verifyPassed: boolean;
    verifyFailed: boolean;
    hasValidation: boolean;
    handoff: Handoff | null;
  },
): string {
  if (c.handoff?.nextStep && !c.verifyPassed) return c.handoff.nextStep;
  if (phase === 'spec' && c.specErrors) return `Corrigir o spec.md: ${c.specErrors} erro(s) no closure gate`;
  if (phase === 'tasks' && c.tasksErrors) return `Corrigir o tasks.md: ${c.tasksErrors} erro(s) estrutural(is)`;
  switch (phase) {
    case 'verify':
      if (c.verifyPassed) return 'Nada pendente — feature verificada';
      if (c.verifyFailed) return 'Corrigir os gaps do Verifier (fix tasks) e verificar de novo';
      return c.hasValidation ? 'Completar o validation.md (veredito PASS/FAIL + evidência file:line)' : 'Rodar o Verifier para gerar o validation.md';
    case 'execute': {
      const t = nextTask(c.tasks);
      if (!t) return 'Implementar os passos atômicos e marcar a rastreabilidade';
      return t.status === 'blocked' ? `Desbloquear ${t.id}: ${t.title}` : `${t.status === 'in-progress' ? 'Continuar' : 'Implementar'} ${t.id}: ${t.title}`;
    }
    case 'tasks': {
      if (c.tasksStatus !== 'approved') return 'Revisar e aprovar o tasks.md';
      const t = nextTask(c.tasks);
      return t ? `Implementar ${t.id}: ${t.title}` : 'Iniciar a execução';
    }
    case 'design':
      return 'Aprovar o design e quebrar em tasks';
    case 'spec':
      return c.spec ? 'Confirmar a spec e seguir para Design / Tasks / Execute' : 'Criar o spec.md da feature';
  }
}
