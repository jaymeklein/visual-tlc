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
  await new HiddenSpecs(state).set(auth, true, false);
  const reopened = new HiddenSpecs(state);
  assert.equal(reopened.isMarked(auth), true);
  assert.equal(reopened.isMarked(billing), false);
  assert.deepEqual(reopened.keys(), [hiddenKey(project, 'user-auth')]);
});

test('HID-12/HID-13 unhiding a spec takes its mark out of the workspace state', async () => {
  const state = memento();
  const hidden = new HiddenSpecs(state);
  await hidden.set(auth, true, false);
  await hidden.set(billing, true, false);
  await hidden.set(auth, false, false);
  assert.equal(hidden.isMarked(auth), false);
  assert.equal(hidden.isMarked(billing), true);
  assert.deepEqual(new HiddenSpecs(state).keys(), [hiddenKey(project, 'billing-invoices')]);
});

test('HID-13 a mark belongs to the spec of one specs folder, not to the same name in another folder', async () => {
  const hidden = new HiddenSpecs(memento());
  await hidden.set(auth, true, false);
  assert.equal(hidden.isMarked({ projectId: 'file:///ws/docs/specs', feature: 'user-auth' }), false);
});

test('HID-11/HID-12 marking and unmarking tell the listeners, a call that changes nothing does not', async () => {
  const hidden = new HiddenSpecs(memento());
  let fired = 0;
  const sub = hidden.onDidChange(() => fired++);
  await hidden.set(auth, true, false);
  assert.equal(fired, 1, 'hiding');
  await hidden.set(auth, true, false);
  assert.equal(fired, 1, 'hiding again');
  await hidden.set(auth, false, false);
  assert.equal(fired, 2, 'unhiding');
  await hidden.set(auth, false, false);
  assert.equal(fired, 2, 'unhiding again');
  sub.dispose();
  await hidden.set(auth, true, false);
  assert.equal(fired, 2, 'after dispose');
});

test('a stored value that is not a list of texts reads as no mark', () => {
  for (const value of [undefined, null, 'user-auth', 42, { user: 'auth' }, [1, 2]]) {
    assert.deepEqual(new HiddenSpecs(memento({ 'tlcSpecs.hidden': value })).keys(), [], JSON.stringify(value));
    assert.deepEqual(new HiddenSpecs(memento({ 'tlcSpecs.shown': value })).shownKeys(), [], JSON.stringify(value));
  }
});

test('HID-02/EYE-04/EYE-06 a spec is hidden when it is completed without a choice, or chosen hidden', () => {
  const f = (health: Health) => ({ health }) as Feature;
  assert.equal(isHidden(f('complete'), undefined), true);
  assert.equal(isHidden(f('ok'), 'hidden'), true);
  assert.equal(isHidden(f('complete'), 'hidden'), true);
  for (const health of ['ok', 'attention', 'failed'] as const) assert.equal(isHidden(f(health), undefined), false, health);
});

// Eye on every spec (spec: .specs/features/eye-on-every-spec/spec.md).

test('EYE-05 a completed spec chosen in view is not hidden', () => {
  const f = (health: Health) => ({ health }) as Feature;
  assert.equal(isHidden(f('complete'), 'shown'), false);
  for (const health of ['ok', 'attention', 'failed'] as const) assert.equal(isHidden(f(health), 'shown'), false, health);
});

test('EYE-05/EYE-09 unhiding a completed spec keeps it in view for the next instance over the same workspace state', async () => {
  const state = memento();
  await new HiddenSpecs(state).set(billing, false, true);
  const reopened = new HiddenSpecs(state);
  assert.equal(reopened.choiceOf(billing), 'shown');
  assert.deepEqual(reopened.shownKeys(), [hiddenKey(project, 'billing-invoices')]);
  assert.deepEqual(reopened.keys(), []);
});

test('EYE-04/EYE-09 hiding a spec that is not completed chooses it hidden, as the hidden-specs marks did', async () => {
  const state = memento({ 'tlcSpecs.hidden': [hiddenKey(project, 'user-auth')] });
  assert.equal(new HiddenSpecs(state).choiceOf(auth), 'hidden');
  await new HiddenSpecs(state).set(billing, true, false);
  assert.equal(new HiddenSpecs(state).choiceOf(billing), 'hidden');
  assert.deepEqual(new HiddenSpecs(state).shownKeys(), []);
});

test('EYE-10 hiding a completed spec in view drops its choice from both lists, so it is hidden again as completed', async () => {
  const state = memento();
  const hidden = new HiddenSpecs(state);
  await hidden.set(billing, false, true);
  await hidden.set(billing, true, true);
  const reopened = new HiddenSpecs(state);
  assert.equal(reopened.choiceOf(billing), undefined);
  assert.deepEqual(reopened.keys(), []);
  assert.deepEqual(reopened.shownKeys(), []);
});

test('EYE-10 a choice equal to what the spec is by default is not stored, and tells no listener', async () => {
  const hidden = new HiddenSpecs(memento());
  let fired = 0;
  hidden.onDidChange(() => fired++);
  await hidden.set(billing, true, true);
  await hidden.set(auth, false, false);
  assert.equal(fired, 0);
  assert.equal(hidden.choiceOf(billing), undefined);
  assert.equal(hidden.choiceOf(auth), undefined);
});
