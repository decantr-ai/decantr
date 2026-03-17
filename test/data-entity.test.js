import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEntityStore } from '../src/data/entity.js';
import { createEffect } from '../src/state/index.js';

describe('createEntityStore', () => {
  it('addMany and all()', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    assert.equal(store.all().length, 2);
    assert.equal(store.count(), 2);
  });

  it('upsert adds new and updates existing', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.upsert({ id: 1, name: 'Alice' });
    assert.equal(store.all().length, 1);
    store.upsert({ id: 1, name: 'Alice Updated' });
    assert.equal(store.all().length, 1);
    assert.equal(store.get(1)().name, 'Alice Updated');
  });

  it('update does partial merge', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1, name: 'Alice', age: 30 }]);
    store.update(1, { age: 31 });
    const entity = store.get(1)();
    assert.equal(entity.name, 'Alice');
    assert.equal(entity.age, 31);
  });

  it('remove removes entity', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    store.remove(1);
    assert.equal(store.count(), 1);
    assert.equal(store.get(1)(), undefined);
  });

  it('clear removes all entities', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1 }, { id: 2 }, { id: 3 }]);
    store.clear();
    assert.equal(store.count(), 0);
  });

  it('get() returns per-entity signal', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1, name: 'Alice' }]);
    const getter = store.get(1);
    assert.equal(getter().name, 'Alice');

    // Update should be reflected
    store.update(1, { name: 'Alice Updated' });
    assert.equal(getter().name, 'Alice Updated');
  });

  it('get() is reactive', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([{ id: 1, name: 'Alice' }]);
    let observed = '';
    createEffect(() => {
      const entity = store.get(1)();
      observed = entity ? entity.name : '';
    });
    assert.equal(observed, 'Alice');
    store.update(1, { name: 'Bob' });
    assert.equal(observed, 'Bob');
  });

  it('filter returns derived view', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([
      { id: 1, name: 'Alice', active: true },
      { id: 2, name: 'Bob', active: false },
      { id: 3, name: 'Charlie', active: true }
    ]);
    const activeUsers = store.filter(u => u.active);
    assert.equal(activeUsers().length, 2);
  });

  it('sorted returns derived view', () => {
    const store = createEntityStore({ getId: u => u.id });
    store.addMany([
      { id: 1, name: 'Charlie' },
      { id: 2, name: 'Alice' },
      { id: 3, name: 'Bob' }
    ]);
    const sorted = store.sorted((a, b) => a.name.localeCompare(b.name));
    assert.equal(sorted()[0].name, 'Alice');
    assert.equal(sorted()[2].name, 'Charlie');
  });

  it('paginated returns page slice', () => {
    const store = createEntityStore({ getId: u => u.id });
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
    store.addMany(items);
    const page1 = store.paginated({ page: 1, size: 10 });
    assert.equal(page1().length, 10);
    assert.equal(page1()[0].id, 1);
    const page3 = store.paginated({ page: 3, size: 10 });
    assert.equal(page3().length, 5);
  });
});
