import type { FeatureRef } from './protocol.ts';
import type { Feature } from './types.ts';

// Specs hidden by hand, kept in the workspace state: the extension never writes under the specs folders.
// No vscode import, so it runs under node --test.

/** The part of vscode.Memento this needs. */
export interface Memento {
  get(key: string): unknown;
  update(key: string, value: unknown): PromiseLike<void>;
}

const STORAGE_KEY = 'tlcSpecs.hidden';

/** Identifies a spec by its specs folder and name, in the host and in the webview. */
export const hiddenKey = (projectId: string, feature: string) => `${projectId}|${feature}`;

/** Out of the tree and of the board while their eye is closed: the completed specs and the marked ones. */
export const isHidden = (f: Feature, marked: boolean): boolean => f.health === 'complete' || marked;

export class HiddenSpecs {
  private readonly marks: Set<string>;
  private readonly listeners = new Set<() => void>();
  private readonly memento: Memento;

  constructor(memento: Memento) {
    this.memento = memento;
    const stored = memento.get(STORAGE_KEY);
    this.marks = new Set(Array.isArray(stored) ? stored.filter((k): k is string => typeof k === 'string') : []);
  }

  isMarked(ref: FeatureRef): boolean {
    return this.marks.has(hiddenKey(ref.projectId, ref.feature));
  }

  keys(): string[] {
    return [...this.marks];
  }

  /** Marks or unmarks the spec, stores the marks and tells the listeners; does nothing when the mark is already so. */
  async set(ref: FeatureRef, hidden: boolean): Promise<void> {
    const key = hiddenKey(ref.projectId, ref.feature);
    if (this.marks.has(key) === hidden) return;
    if (hidden) this.marks.add(key);
    else this.marks.delete(key);
    await this.memento.update(STORAGE_KEY, this.keys());
    for (const listener of this.listeners) listener();
  }

  onDidChange(listener: () => void): { dispose(): void } {
    this.listeners.add(listener);
    return { dispose: () => this.listeners.delete(listener) };
  }
}
