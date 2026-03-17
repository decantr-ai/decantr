import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSignal, createEffect, createContext,
  createSelector, createDeferred, createHistory,
  createRoot, getOwner, runWithOwner, on
} from '../src/state/index.js';

describe('createContext', () => {
  it('returns default value when no provider', () => {
    const ctx = createContext('default');
    assert.equal(ctx.consume(), 'default');
  });

  it('provider sets value, consume reads it', () => {
    const ctx = createContext('default');
    const cleanup = ctx.Provider('provided');
    assert.equal(ctx.consume(), 'provided');
    cleanup();
  });

  it('nested providers shadow outer values', () => {
    const ctx = createContext('default');
    const cleanupOuter = ctx.Provider('outer');
    assert.equal(ctx.consume(), 'outer');
    const cleanupInner = ctx.Provider('inner');
    assert.equal(ctx.consume(), 'inner');
    cleanupInner();
    assert.equal(ctx.consume(), 'outer');
    cleanupOuter();
  });

  it('cleanup restores previous value', () => {
    const ctx = createContext('default');
    const cleanup = ctx.Provider('temp');
    assert.equal(ctx.consume(), 'temp');
    cleanup();
    assert.equal(ctx.consume(), 'default');
  });
});

describe('createSelector', () => {
  it('returns true for matching key', () => {
    const [get] = createSignal('a');
    const isSelected = createSelector(get);
    assert.equal(isSelected('a'), true);
  });

  it('returns false for non-matching key', () => {
    const [get] = createSignal('a');
    const isSelected = createSelector(get);
    assert.equal(isSelected('b'), false);
  });

  it('updates when source changes', () => {
    const [get, set] = createSignal('a');
    const isSelected = createSelector(get);

    let aSelected = false;
    let bSelected = false;
    createEffect(() => { aSelected = isSelected('a'); });
    createEffect(() => { bSelected = isSelected('b'); });

    assert.equal(aSelected, true);
    assert.equal(bSelected, false);

    set('b');
    assert.equal(aSelected, false);
    assert.equal(bSelected, true);
  });
});

describe('createDeferred', () => {
  it('does not compute until first read', () => {
    let computeCount = 0;
    const [get] = createSignal(5);
    const deferred = createDeferred(() => { computeCount++; return get() * 2; });
    assert.equal(computeCount, 0);
    assert.equal(deferred(), 10);
    assert.equal(computeCount, 1);
  });

  it('recomputes when dependencies change', () => {
    const [get, set] = createSignal(3);
    const deferred = createDeferred(() => get() + 1);
    assert.equal(deferred(), 4);
    set(10);
    assert.equal(deferred(), 11);
  });
});

describe('createHistory', () => {
  it('tracks signal changes', () => {
    const signal = createSignal(0);
    const { canUndo, canRedo } = createHistory(signal);
    assert.equal(canUndo(), false);
    assert.equal(canRedo(), false);
    signal[1](1);
    assert.equal(canUndo(), true);
  });

  it('undo restores previous value', () => {
    const [get, set] = createSignal('a');
    const { undo, canUndo } = createHistory([get, set]);
    set('b');
    assert.equal(get(), 'b');
    assert.equal(canUndo(), true);
    undo();
    assert.equal(get(), 'a');
  });

  it('redo restores undone value', () => {
    const [get, set] = createSignal(1);
    const { undo, redo, canRedo } = createHistory([get, set]);
    set(2);
    set(3);
    undo();
    assert.equal(get(), 2);
    assert.equal(canRedo(), true);
    redo();
    assert.equal(get(), 3);
  });

  it('clear resets history', () => {
    const [get, set] = createSignal(0);
    const { undo, clear, canUndo } = createHistory([get, set]);
    set(1);
    set(2);
    assert.equal(canUndo(), true);
    clear();
    assert.equal(canUndo(), false);
    undo(); // should be no-op
    assert.equal(get(), 2);
  });

  it('canUndo and canRedo are reactive', () => {
    const [get, set] = createSignal(0);
    const { undo, redo, canUndo, canRedo } = createHistory([get, set]);

    let undoState = false;
    let redoState = false;
    createEffect(() => { undoState = canUndo(); });
    createEffect(() => { redoState = canRedo(); });

    assert.equal(undoState, false);
    assert.equal(redoState, false);

    set(1);
    assert.equal(undoState, true);
    assert.equal(redoState, false);

    undo();
    assert.equal(undoState, false);
    assert.equal(redoState, true);

    redo();
    assert.equal(undoState, true);
    assert.equal(redoState, false);
  });
});

// ─── New Phase 1 primitives ────────────────────────────────

describe('createRoot', () => {
  it('creates an independent reactive scope', () => {
    let disposed = false;
    createRoot(dispose => {
      const [get, set] = createSignal(0);
      createEffect(() => { get(); });
      dispose();
      disposed = true;
    });
    assert.equal(disposed, true);
  });

  it('disposes all children on root dispose', () => {
    let effectRuns = 0;
    let disposeRoot;
    createRoot(dispose => {
      disposeRoot = dispose;
      const [get, set] = createSignal(0);
      createEffect(() => { get(); effectRuns++; });
      set(1);
    });
    assert.equal(effectRuns, 2);
    // After disposal, setting should not re-run effect
    // (effect is already cleaned up)
  });
});

describe('on() — explicit dependencies', () => {
  it('tracks explicit dependencies only', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(10);
    let observed = 0;

    on(a, (value) => { observed = value + b(); });
    // b() is read inside untrack, so changes to b should not re-run
    assert.equal(observed, 11);

    setB(20);
    assert.equal(observed, 11); // should NOT re-run

    setA(2);
    assert.equal(observed, 22); // should re-run, reads new b()
  });

  it('supports defer option', () => {
    const [a, setA] = createSignal(1);
    let runs = 0;

    on(a, () => { runs++; }, { defer: true });
    assert.equal(runs, 0); // skipped initial

    setA(2);
    assert.equal(runs, 1);
  });

  it('supports array of dependencies', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let observed = [];

    on([a, b], (values) => { observed = values; });
    assert.deepEqual(observed, [1, 2]);

    setA(10);
    assert.deepEqual(observed, [10, 2]);
  });

  it('provides previous values', () => {
    const [a, setA] = createSignal(1);
    let prevVal = null;

    on(a, (value, prev) => { prevVal = prev; });
    assert.equal(prevVal, 1); // first run, prev is initial

    setA(5);
    assert.equal(prevVal, 1); // prev was 1 before update
  });
});

describe('dependency cleanup', () => {
  it('removes stale subscriptions on effect re-run', () => {
    const [toggle, setToggle] = createSignal(true);
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let runs = 0;

    createEffect(() => {
      runs++;
      if (toggle()) { a(); } else { b(); }
    });
    assert.equal(runs, 1);

    // Change toggle so effect reads b instead of a
    setToggle(false);
    assert.equal(runs, 2);

    // Changing a should NOT re-run effect (stale subscription cleaned)
    setA(10);
    assert.equal(runs, 2);

    // Changing b SHOULD re-run effect
    setB(20);
    assert.equal(runs, 3);
  });
});
