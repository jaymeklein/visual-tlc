import type { Project } from '../core/types.ts';
import type { FromWebview, ToWebview } from '../core/protocol.ts';
import { actionFor, DEFAULT_VIEW, renderApp, type ViewState } from './render.ts';

declare function acquireVsCodeApi(): {
  postMessage(message: FromWebview): void;
  getState(): ViewState | undefined;
  setState(state: ViewState): void;
};

const vscode = acquireVsCodeApi();
const app = document.getElementById('app')!;
let projects: Project[] = [];
let now = Date.now();
let loaded = false;
let view: ViewState = { ...DEFAULT_VIEW, ...vscode.getState() };

function setView(patch: Partial<ViewState>): void {
  view = { ...view, ...patch };
  vscode.setState(view);
  render();
}

window.addEventListener('message', (event: MessageEvent<ToWebview>) => {
  const msg = event.data;
  if (msg.type === 'state') {
    projects = msg.projects;
    now = msg.now;
    loaded = true;
    render();
  } else if (msg.type === 'select') {
    setView({ selected: msg.target });
    window.scrollTo(0, 0);
  }
});

function render(): void {
  const active = document.activeElement as HTMLInputElement | null;
  const focusSearch = active?.id === 'search' ? [active.selectionStart, active.selectionEnd] : null;

  app.innerHTML = renderApp({ projects, now, loaded, view });

  for (const el of app.querySelectorAll<HTMLElement>('[data-pct]')) el.style.setProperty('--pct', `${el.dataset.pct}%`);
  if (focusSearch) {
    const input = document.getElementById('search') as HTMLInputElement | null;
    input?.focus();
    input?.setSelectionRange(focusSearch[0], focusSearch[1]);
  }
  report();
}

/** Tells the host what is on screen (the integration tests assert on it). */
function report(): void {
  const boards = [...app.querySelectorAll<HTMLElement>('.board')];
  const root = document.documentElement;
  // offsetParent is null for an element that is not displayed (itself or an ancestor).
  const shown = (selector: string) => [...app.querySelectorAll<HTMLElement>(selector)].filter((el) => el.offsetParent !== null);
  vscode.postMessage({
    type: 'rendered',
    projects: projects.map((p) => p.id),
    cards: shown('.card-name').map((el) => el.textContent ?? ''),
    phases: shown('.card-phase').map((el) => el.textContent ?? ''),
    detail: app.querySelector('.detail-title .mono')?.textContent ?? null,
    columns: boards.length ? getComputedStyle(boards[0]).gridTemplateColumns.split(' ').length : 0,
    emptyStages: shown('.column.is-empty').length,
    emptyMessage: app.querySelector('.empty-state h1')?.textContent ?? null,
    width: window.innerWidth,
    boardWidth: boards.length ? boards[0].clientWidth : 0,
    overflow: root.scrollWidth > root.clientWidth || boards.some((b) => b.scrollWidth > b.clientWidth),
  });
}

// ---------- events ----------

function activate(el: HTMLElement): void {
  const result = actionFor(el.dataset, view.expandedTasks);
  if (result.message) vscode.postMessage(result.message);
  if (result.view) setView(result.view);
  if (result.scrollTop) window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-action]');
  if (!el || el.dataset.action === 'toggle-done') return;
  activate(el);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && view.selected) {
    setView({ selected: null });
    return;
  }
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target as HTMLElement;
  if (el.matches('[role="button"][data-action]')) {
    e.preventDefault();
    activate(el);
  }
});

document.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === 'search') setView({ query: el.value });
});

document.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.action === 'toggle-done') setView({ hideDone: el.checked });
});

window.addEventListener('error', (e) => vscode.postMessage({ type: 'error', message: String(e.error?.stack ?? e.message) }));

vscode.postMessage({ type: 'ready' });
