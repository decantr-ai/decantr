import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapArray, indexArray, createProjection } from '../src/state/arrays.js';
import { createSignal, createEffect } from '../src/state/index.js';

describe('mapArray', () => {
  it('maps initial items', () => {
    const [items] = createSignal([1, 2, 3]);
    const mapped = mapArray(items, (item) => item * 10);
    assert.deepEqual(mapped(), [10, 20, 30]);
  });

  it('reacts to array changes', () => {
    const [items, setItems] = createSignal([1, 2]);
    const mapped = mapArray(items, (item) => item * 10);
    assert.deepEqual(mapped(), [10, 20]);
    setItems([1, 2, 3]);
    assert.deepEqual(mapped(), [10, 20, 30]);
  });

  it('removes mapped items when source items removed', () => {
    const [items, setItems] = createSignal([1, 2, 3]);
    const mapped = mapArray(items, (item) => item * 10);
    setItems([1, 3]);
    assert.deepEqual(mapped(), [10, 30]);
  });

  it('preserves stable references for existing items', () => {
    const item1 = { id: 1 };
    const item2 = { id: 2 };
    const item3 = { id: 3 };
    const [items, setItems] = createSignal([item1, item2]);
    let mapCalls = 0;
    const mapped = mapArray(items, (item) => { mapCalls++; return item.id; });
    assert.equal(mapCalls, 2);
    // Adding a new item, keeping same references — should only map the new one
    setItems([item1, item2, item3]);
    assert.deepEqual(mapped(), [1, 2, 3]); // trigger lazy recomputation
    assert.equal(mapCalls, 3);
  });
});

describe('indexArray', () => {
  it('maps by index', () => {
    const [items] = createSignal(['a', 'b', 'c']);
    const mapped = indexArray(items, (itemGetter, i) => `${i}:${itemGetter()}`);
    assert.deepEqual(mapped(), ['0:a', '1:b', '2:c']);
  });

  it('grows and shrinks with array', () => {
    const [items, setItems] = createSignal(['a', 'b', 'c']);
    // indexArray returns static results per index — itemGetter is a signal
    // The mapFn runs once per index position during creation
    const mapped = indexArray(items, (itemGetter, i) => {
      // Return a function so we can read the current value
      return { index: i, get: itemGetter };
    });
    assert.equal(mapped().length, 3);
    assert.equal(mapped()[0].get(), 'a');
    assert.equal(mapped()[1].get(), 'b');

    // Shrink
    setItems(['a']);
    assert.equal(mapped().length, 1);

    // Grow
    setItems(['a', 'x', 'y']);
    assert.equal(mapped().length, 3);
    assert.equal(mapped()[1].get(), 'x');
  });
});

describe('createProjection', () => {
  it('projects items by key', () => {
    const [items] = createSignal([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
    const projected = createProjection(items, i => i.id, i => i.name);
    assert.deepEqual(projected(), ['Alice', 'Bob']);
  });

  it('updates when source changes', () => {
    const [items, setItems] = createSignal([
      { id: 1, name: 'Alice' }
    ]);
    const projected = createProjection(items, i => i.id, i => i.name.toUpperCase());
    assert.deepEqual(projected(), ['ALICE']);
    setItems([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    assert.deepEqual(projected(), ['ALICE', 'BOB']);
  });
});
