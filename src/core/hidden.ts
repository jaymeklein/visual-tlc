import type { FeatureRef } from './protocol.ts';
import type { Feature } from './types.ts';

// What the user chose with the eye of each spec, kept in the workspace state: the extension never writes under the
// specs folders. No vscode import, so it runs under node --test.

/** The part of vscode.Memento this needs. */
export interface Memento {
  get(key: string): unknown;
  update(key: string, value: unknown): PromiseLike<void>;
}

/** Specs the user hid. The key predates the completed specs kept in view. */
const HIDDEN_KEY = 'tlcSpecs.hidden';
/** Completed specs the user keeps in view. */
const SHOWN_KEY = 'tlcSpecs.shown';

/** The eye of a spec: chosen hidden, chosen in view, or nothing chosen. */
export type Choice = 'hidden' | 'shown' | undefined;

/** Identifies a spec by its specs folder and name, in the host and in the webview. */
export const hiddenKey = (projectId: string, feature: string) => `${projectId}|${feature}`;

/** Out of the tree and of the board while their eye is closed: the specs chosen hidden, and the completed ones not chosen in view. */
export const isHidden = (f: Feature, choice: Choice): boolean => choice === 'hidden' || (choice !== 'shown' && f.health === 'complete');

const texts = (stored: unknown): string[] => (Array.isArray(stored) ? stored.filter((k): k is string => typeof k === 'string') : []);

export class HiddenSpecs {
  private readonly hidden: Set<string>;
  private readonly shown: Set<string>;
  private readonly listeners = new Set<() => void>();
  private readonly memento: Memento;

  constructor(memento: Memento) {
    this.memento = memento;
    this.hidden = new Set(texts(memento.get(HIDDEN_KEY)));
    this.shown = new Set(texts(memento.get(SHOWN_KEY)));
  }

  choiceOf(ref: FeatureRef): Choice {
    const key = hiddenKey(ref.projectId, ref.feature);
    return this.hidden.has(key) ? 'hidden' : this.shown.has(key) ? 'shown' : undefined;
  }

  isMarked(ref: FeatureRef): boolean {
    return this.choiceOf(ref) === 'hidden';
  }

  /** The specs chosen hidden. */
  keys(): string[] {
    return [...this.hidden];
  }

  /** The completed specs chosen in view. */
  shownKeys(): string[] {
    return [...this.shown];
  }

  /**
   * Hides or shows the spec, stores the choice and tells the listeners. Only a choice that differs from what the spec
   * is by default (hidden when completed) is stored; one equal to it clears the choice. Does nothing when nothing changes.
   */
  async set(ref: FeatureRef, hidden: boolean, complete: boolean): Promise<void> {
    const choice: Choice = hidden === complete ? undefined : hidden ? 'hidden' : 'shown';
    if (this.choiceOf(ref) === choice) return;
    const key = hiddenKey(ref.projectId, ref.feature);
    this.hidden.delete(key);
    this.shown.delete(key);
    if (choice === 'hidden') this.hidden.add(key);
    if (choice === 'shown') this.shown.add(key);
    await this.memento.update(HIDDEN_KEY, this.keys());
    await this.memento.update(SHOWN_KEY, this.shownKeys());
    for (const listener of this.listeners) listener();
  }

  onDidChange(listener: () => void): { dispose(): void } {
    this.listeners.add(listener);
    return { dispose: () => this.listeners.delete(listener) };
  }
}
