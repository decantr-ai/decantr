import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDeepStore, produce, reconcile } from '../src/state/store.js';
import { createEffect, batch } from '../src/state/index.js';

describe('createDeepStore', () => {
  it('tracks top-level property reads', () => {
    const store = createDeepStore({ name: 'Alice', age: 30 });
    let observed = '';
    createEffect(() => { observed = store.name; });
    assert.equal(observed, 'Alice');
    store.name = 'Bob';
    assert.equal(observed, 'Bob');
  });

  it('tracks nested property reads', () => {
    const store = createDeepStore({ user: { name: 'Alice', address: { city: 'NYC' } } });
    let observed = '';
    createEffect(() => { observed = store.user.address.city; });
    assert.equal(observed, 'NYC');
    store.user.address.city = 'LA';
    assert.equal(observed, 'LA');
  });

  it('intercepts array push', () => {
    const store = createDeepStore({ items: [1, 2, 3] });
    let len = 0;
    createEffect(() => { len = store.items.length; });
    assert.equal(len, 3);
    store.items.push(4);
    assert.equal(len, 4);
    assert.deepEqual([...store.items], [1, 2, 3, 4]);
  });

  it('intercepts array splice', () => {
    const store = createDeepStore({ items: ['a', 'b', 'c'] });
    let observed = [];
    createEffect(() => { observed = [...store.items]; });
    assert.deepEqual(observed, ['a', 'b', 'c']);
    store.items.splice(1, 1);
    assert.deepEqual(observed, ['a', 'c']);
  });

  it('does not trigger for unchanged values', () => {
    const store = createDeepStore({ x: 1 });
    let runs = 0;
    createEffect(() => { store.x; runs++; });
    assert.equal(runs, 1);
    store.x = 1;
    assert.equal(runs, 1);
  });
});

describe('produce', () => {
  it('applies mutations via draft', () => {
    const store = createDeepStore({ count: 0, name: 'test' });
    let observed = 0;
    createEffect(() => { observed = store.count; });
    assert.equal(observed, 0);
    produce(store, draft => {
      draft.count = 5;
    });
    assert.equal(observed, 5);
    assert.equal(store.count, 5);
  });

  it('batches multiple mutations', () => {
    const store = createDeepStore({ a: 1, b: 2 });
    let runs = 0;
    createEffect(() => { store.a; store.b; runs++; });
    assert.equal(runs, 1);
    produce(store, draft => {
      draft.a = 10;
      draft.b = 20;
    });
    // Should batch — only one additional run
    assert.equal(runs, 2);
  });
});

describe('reconcile', () => {
  it('updates changed properties', () => {
    const store = createDeepStore({ name: 'Alice', age: 30 });
    let observed = '';
    createEffect(() => { observed = store.name; });
    reconcile(store, { name: 'Bob', age: 30 });
    assert.equal(observed, 'Bob');
    assert.equal(store.age, 30);
  });

  it('does not trigger for unchanged properties', () => {
    const store = createDeepStore({ x: 1, y: 2 });
    let xRuns = 0;
    createEffect(() => { store.x; xRuns++; });
    assert.equal(xRuns, 1);
    reconcile(store, { x: 1, y: 99 });
    assert.equal(xRuns, 1); // x didn't change
  });
});
