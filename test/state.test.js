import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal, createEffect, createMemo, createStore, batch } from '../src/state/index.js';

describe('createSignal', () => {
  it('returns initial value', () => {
    const [count] = createSignal(0);
    assert.equal(count(), 0);
  });

  it('updates value with direct set', () => {
    const [count, setCount] = createSignal(0);
    setCount(5);
    assert.equal(count(), 5);
  });

  it('updates value with updater function', () => {
    const [count, setCount] = createSignal(10);
    setCount(prev => prev + 5);
    assert.equal(count(), 15);
  });

  it('does not trigger subscribers if value unchanged', () => {
    const [count, setCount] = createSignal(1);
    let runs = 0;
    createEffect(() => { count(); runs++; });
    assert.equal(runs, 1);
    setCount(1);
    assert.equal(runs, 1);
  });

  it('handles NaN correctly with Object.is', () => {
    const [val, setVal] = createSignal(NaN);
    let runs = 0;
    createEffect(() => { val(); runs++; });
    assert.equal(runs, 1);
    setVal(NaN);
    assert.equal(runs, 1);
  });
});

describe('createEffect', () => {
  it('runs immediately', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    assert.equal(ran, true);
  });

  it('re-runs when signal changes', () => {
    const [count, setCount] = createSignal(0);
    let observed = -1;
    createEffect(() => { observed = count(); });
    assert.equal(observed, 0);
    setCount(1);
    assert.equal(observed, 1);
  });

  it('tracks multiple signals', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let sum = 0;
    createEffect(() => { sum = a() + b(); });
    assert.equal(sum, 3);
    setA(10);
    assert.equal(sum, 12);
    setB(20);
    assert.equal(sum, 30);
  });

  it('calls cleanup on re-run', () => {
    const [count, setCount] = createSignal(0);
    let cleaned = 0;
    createEffect(() => {
      count();
      return () => { cleaned++; };
    });
    assert.equal(cleaned, 0);
    setCount(1);
    assert.equal(cleaned, 1);
    setCount(2);
    assert.equal(cleaned, 2);
  });

  it('dispose stops tracking', () => {
    const [count, setCount] = createSignal(0);
    let observed = -1;
    const dispose = createEffect(() => { observed = count(); });
    assert.equal(observed, 0);
    dispose();
    setCount(5);
    assert.equal(observed, 0);
  });
});

describe('createMemo', () => {
  it('computes initial value', () => {
    const [a] = createSignal(2);
    const doubled = createMemo(() => a() * 2);
    assert.equal(doubled(), 4);
  });

  it('updates when dependency changes', () => {
    const [a, setA] = createSignal(3);
    const doubled = createMemo(() => a() * 2);
    assert.equal(doubled(), 6);
    setA(5);
    assert.equal(doubled(), 10);
  });

  it('caches value when read multiple times', () => {
    let computeCount = 0;
    const [a] = createSignal(1);
    const memo = createMemo(() => { computeCount++; return a() + 1; });
    memo();
    memo();
    memo();
    assert.equal(computeCount, 1);
  });

  it('propagates to effects', () => {
    const [a, setA] = createSignal(1);
    const doubled = createMemo(() => a() * 2);
    let observed = 0;
    createEffect(() => { observed = doubled(); });
    assert.equal(observed, 2);
    setA(5);
    assert.equal(observed, 10);
  });
});

describe('createStore', () => {
  it('reads properties reactively', () => {
    const store = createStore({ name: 'Alice', age: 30 });
    let observed = '';
    createEffect(() => { observed = store.name; });
    assert.equal(observed, 'Alice');
    store.name = 'Bob';
    assert.equal(observed, 'Bob');
  });

  it('does not trigger for unchanged property', () => {
    const store = createStore({ x: 1 });
    let runs = 0;
    createEffect(() => { store.x; runs++; });
    assert.equal(runs, 1);
    store.x = 1;
    assert.equal(runs, 1);
  });

  it('tracks only accessed properties', () => {
    const store = createStore({ a: 1, b: 2 });
    let runs = 0;
    createEffect(() => { store.a; runs++; });
    assert.equal(runs, 1);
    store.b = 99;
    assert.equal(runs, 1);
    store.a = 10;
    assert.equal(runs, 2);
  });
});

describe('batch', () => {
  it('batches multiple updates into one effect run', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let runs = 0;
    createEffect(() => { a(); b(); runs++; });
    assert.equal(runs, 1);
    batch(() => {
      setA(10);
      setB(20);
    });
    assert.equal(runs, 2);
  });

  it('applies all updates before effects run', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let sum = 0;
    createEffect(() => { sum = a() + b(); });
    assert.equal(sum, 3);
    batch(() => {
      setA(10);
      setB(20);
    });
    assert.equal(sum, 30);
  });
});
