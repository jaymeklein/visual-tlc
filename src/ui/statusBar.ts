import * as vscode from 'vscode';
import type { Feature } from '../core/types.ts';
import type { FeatureRef } from '../core/protocol.ts';
import type { SpecsStore } from './store.ts';
import { featureTooltip } from './featuresTree.ts';

/** Shows the feature in focus: the Handoff feature, else the most recently touched unfinished one. */
export class StatusBar implements vscode.Disposable {
  private readonly item = vscode.window.createStatusBarItem('tlcSpecs.status', vscode.StatusBarAlignment.Left, 50);

  private readonly store: SpecsStore;

  constructor(store: SpecsStore) {
    this.store = store;
    this.item.name = 'TLC Specs';
    store.onDidChange(() => this.update());
  }

  private update(): void {
    const focus = this.focus();
    if (!focus) {
      this.item.hide();
      return;
    }
    const { feature: f, ref } = focus;
    const errors = f.issues.filter((i) => i.severity === 'error').length;
    const icon = f.health === 'complete' ? '$(pass-filled)' : f.health === 'failed' ? '$(error)' : '$(tasklist)';
    this.item.text = `${icon} ${f.name} · ${f.phaseLabel}${errors ? ` $(warning) ${errors}` : ''}`;
    this.item.tooltip = featureTooltip(f);
    this.item.backgroundColor = f.health === 'failed' ? new vscode.ThemeColor('statusBarItem.errorBackground') : undefined;
    this.item.command = { command: 'tlcSpecs.showFeature', title: 'Abrir no painel', arguments: [ref] };
    this.item.show();
  }

  private focus(): { feature: Feature; ref: FeatureRef } | undefined {
    const all = this.store.projects.flatMap((l) => l.project.features.map((feature) => ({ feature, ref: { projectId: l.project.id, feature: feature.name } })));
    return (
      all.find((x) => x.feature.active) ??
      all.filter((x) => x.feature.health !== 'complete').sort((a, b) => (b.feature.lastModified ?? 0) - (a.feature.lastModified ?? 0))[0]
    );
  }

  dispose(): void {
    this.item.dispose();
  }
}
