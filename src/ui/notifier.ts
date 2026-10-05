import * as vscode from 'vscode';
import type { FeatureRef } from '../core/protocol.ts';
import type { Feature } from '../core/types.ts';
import type { SpecsStore } from './store.ts';

interface Snapshot {
  phaseLabel: string;
  health: Feature['health'];
}

/** Toasts when a feature appears, changes phase, completes or fails verification. Never on first load. */
export class PhaseNotifier {
  private previous: Map<string, Snapshot> | undefined;

  private readonly show: (ref: FeatureRef) => void;

  constructor(store: SpecsStore, show: (ref: FeatureRef) => void) {
    this.show = show;
    store.onDidChange(() => {
      const next = new Map<string, Snapshot>();
      const events: { ref: FeatureRef; message: string; level: 'info' | 'warning' }[] = [];
      for (const { project } of store.projects) {
        for (const f of project.features) {
          const key = `${project.id}::${f.name}`;
          next.set(key, { phaseLabel: f.phaseLabel, health: f.health });
          const before = this.previous?.get(key);
          if (!this.previous) continue;
          const ref = { projectId: project.id, feature: f.name };
          if (!before) events.push({ ref, message: `New spec detected: ${f.name} (${f.phaseLabel})`, level: 'info' });
          else if (f.health === 'failed' && before.health !== 'failed') events.push({ ref, message: `${f.name}: ${f.phaseLabel}`, level: 'warning' });
          else if (f.health === 'complete' && before.health !== 'complete') events.push({ ref, message: `${f.name} was verified and completed ✔`, level: 'info' });
          else if (before.phaseLabel !== f.phaseLabel && phaseOf(before.phaseLabel) !== phaseOf(f.phaseLabel)) {
            events.push({ ref, message: `${f.name}: ${before.phaseLabel} → ${f.phaseLabel}`, level: 'info' });
          }
        }
      }
      this.previous = next;
      if (!vscode.workspace.getConfiguration('tlcSpecs').get<boolean>('notifications.enabled', true)) return;
      for (const e of events.slice(0, 3)) {
        const text = `TLC · ${e.message}`;
        const shown = e.level === 'warning' ? vscode.window.showWarningMessage(text, 'Open Dashboard') : vscode.window.showInformationMessage(text, 'Open Dashboard');
        void shown.then((choice) => {
          if (choice) this.show(e.ref);
        });
      }
    });
  }
}

/** "Execution 3/7" and "Execution 4/7" are the same phase: only phase changes notify. */
function phaseOf(label: string): string {
  return label.replace(/\s*\d+\/\d+$/, '');
}
