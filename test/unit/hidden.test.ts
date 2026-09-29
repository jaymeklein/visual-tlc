// Specs hidden by hand (spec: .specs/features/hidden-specs/spec.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HiddenSpecs, hiddenKey, isHidden, type Memento } from '../../src/core/hidden.ts';
import type { Feature, Health } from '../../src/core/types.ts';

/** In-memory workspace state: what VS Code keeps between two openings of the workspace. */
function memento(initial: Record<string, unknown> = {}): Memento {
  const data = { ...initial };
  return {
    get: (key) => data[key],
    update: async (key, value) => {
      data[key] = value;
    },
  };
}

const project = 'file:///ws/.specs';
const auth = { projectId: project, feature: 'user-auth' };
const billing = { projectId: project, feature: 'billing-invoices' };

test('HID-13 a spec marked as hidden is still marked for the next instance over the same workspace state', async () => {
  const state = memento();
  await new HiddenSpecs(state).set(auth, true);
  const reopened = new HiddenSpecs(state);
  assert.equal(reopened.isMarked(auth), true);
  assert.equal(reopened.isMarked(billing), false);
  assert.deepEqual(reopened.keys(), [hiddenKey(project, 'user-auth')]);
});

test('HID-12/HID-13 unhiding a spec takes its mark out of the workspace state', async () => {
  const state = memento();
  const hidden = new HiddenSpecs(state);
  await hidden.set(auth, true);
  await hidden.set(billing, true);
  await hidden.set(auth, false);
  assert.equal(hidden.isMarked(auth), false);
  assert.equal(hidden.isMarked(billing), true);
  assert.deepEqual(new HiddenSpecs(state).keys(), [hiddenKey(project, 'billing-invoices')]);
});

test('HID-13 a mark belongs to the spec of one specs folder, not to the same name in another folder', async () => {
  const hidden = new HiddenSpecs(memento());
  await hidden.set(auth, true);
  assert.equal(hidden.isMarked({ projectId: 'file:///ws/docs/specs', feature: 'user-auth' }), false);
});

test('HID-11/HID-12 marking and unmarking tell the listeners, a call that changes nothing does not', async () => {
  const hidden = new HiddenSpecs(memento());
  let fired = 0;
  const sub = hidden.onDidChange(() => fired++);
  await hidden.set(auth, true);
  assert.equal(fired, 1, 'hiding');
  await hidden.set(auth, true);
  assert.equal(fired, 1, 'hiding again');
  await hidden.set(auth, false);
  assert.equal(fired, 2, 'unhiding');
  await hidden.set(auth, false);
  assert.equal(fired, 2, 'unhiding again');
  sub.dispose();
  await hidden.set(auth, true);
  assert.equal(fired, 2, 'after dispose');
});

test('a stored value that is not a list of texts reads as no mark', () => {
  for (const value of [undefined, null, 'user-auth', 42, { user: 'auth' }, [1, 2]]) {
    assert.deepEqual(new HiddenSpecs(memento({ 'tlcSpecs.hidden': value })).keys(), [], JSON.stringify(value));
  }
});

test('HID-02 a spec is hidden when it is completed, marked or both, and only then', () => {
  const f = (health: Health) => ({ health }) as Feature;
  assert.equal(isHidden(f('complete'), false), true);
  assert.equal(isHidden(f('ok'), true), true);
  assert.equal(isHidden(f('complete'), true), true);
  for (const health of ['ok', 'attention', 'failed'] as const) assert.equal(isHidden(f(health), false), false, health);
});
