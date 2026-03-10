import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSignal, createEffect, createResource, createContext,
  createSelector, createDeferred, createHistory
} from '../src/state/index.js';

describe('createResource', () => {
  it('fetches data and sets loading/data signals', async () => {
    const fetcher = () => Promise.resolve('hello');
    const { data, loading, error, refetch } = createResource(fetcher);
    assert.equal(loading(), true);
    assert.equal(data(), undefined);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(loading(), false);
    assert.equal(data(), 'hello');
    assert.equal(error(), null);
  });

  it('handles fetch errors', async () => {
    const fetcher = () => Promise.reject(new Error('fail'));
    const { data, loading, error } = createResource(fetcher);
    assert.equal(loading(), true);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(loading(), false);
    assert.equal(data(), undefined);
    assert.ok(error() instanceof Error);
    assert.equal(error().message, 'fail');
  });

  it('refetch re-runs the fetcher', async () => {
    let count = 0;
    const fetcher = () => Promise.resolve(++count);
    const { data, refetch } = createResource(fetcher);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(data(), 1);
    refetch();
    await new Promise(r => setTimeout(r, 10));
    assert.equal(data(), 2);
  });

  it('mutate updates data without re-fetching', async () => {
    let fetchCount = 0;
    const fetcher = () => { fetchCount++; return Promise.resolve('original'); };
    const { data, mutate } = createResource(fetcher);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(data(), 'original');
    assert.equal(fetchCount, 1);
    mutate('mutated');
    assert.equal(data(), 'mutated');
    assert.equal(fetchCount, 1);
  });

  it('lazy option delays initial fetch', async () => {
    let fetched = false;
    const fetcher = () => { fetched = true; return Promise.resolve('data'); };
    const { data, loading, refetch } = createResource(fetcher, { lazy: true });
    assert.equal(fetched, false);
    assert.equal(loading(), false);
    assert.equal(data(), undefined);
    refetch();
    assert.equal(fetched, true);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(data(), 'data');
  });
});

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
