import * as vscode from 'vscode';
import type { FeatureRef } from '../core/protocol.ts';
import { featureMarkdown } from '../core/labels.ts';
import type { SpecsStore } from './store.ts';
import { openUri, previewUri } from './common.ts';

/** Opens the feature's markdown in VS Code's Markdown preview (falls back to the text editor). */
export async function previewFeatureMarkdown(store: SpecsStore, ref: FeatureRef): Promise<void> {
  const found = store.findFeature(ref.projectId, ref.feature);
  const file = found && featureMarkdown(found.feature);
  const uri = file && store.uriFor(ref.projectId, file.path);
  if (!uri) {
    void vscode.window.showWarningMessage(`Feature "${ref.feature}" has no markdown files.`);
    return;
  }
  await previewUri(uri);
}

/** Reveals the feature folder (.specs/features/<name>) in the Explorer. */
export async function revealFeatureFolder(store: SpecsStore, ref: FeatureRef): Promise<void> {
  const found = store.findFeature(ref.projectId, ref.feature);
  const uri = found && store.uriFor(ref.projectId, found.feature.dir);
  if (uri) await openUri(uri);
}
