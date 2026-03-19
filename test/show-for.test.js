import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { h, Show, For, cond, list, component, disposeNode } from '../src/core/index.js';
import { createSignal, createEffect, createRoot } from '../src/state/index.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

describe('Show()', () => {
  it('shows content when condition is true', () => {
    const [show] = createSignal(true);
    const el = Show(show, () => h('div', null, 'visible'));
    assert.equal(el.textContent, 'visible');
  });

  it('shows nothing when condition is false and no fallback', () => {
    const [show] = createSignal(false);
    const el = Show(show, () => h('div', null, 'visible'));
    assert.equal(el.childNodes.length, 0);
  });

  it('shows fallback when condition is false', () => {
    const [show] = createSignal(false);
    const el = Show(
      show,
      () => h('div', null, 'visible'),
      () => h('div', null, 'fallback')
    );
    assert.equal(el.textContent, 'fallback');
  });

  it('switches branches when condition changes', () => {
    const [show, setShow] = createSignal(true);
    const el = Show(
      show,
      () => h('div', null, 'yes'),
      () => h('div', null, 'no')
    );
    assert.equal(el.textContent, 'yes');
    setShow(false);
    assert.equal(el.textContent, 'no');
    setShow(true);
    assert.equal(el.textContent, 'yes');
  });

  it('disposes old branch effects when switching', () => {
    let effectCount = 0;
    const [show, setShow] = createSignal(true);
    const [val, setVal] = createSignal(0);

    createRoot(() => {
      Show(show, () => {
        createEffect(() => { val(); effectCount++; });
        return h('div', null, 'branch');
      });
    });

    assert.equal(effectCount, 1);
    setVal(1);
    assert.equal(effectCount, 2);

    // Switch away — old branch should be disposed
    setShow(false);
    setVal(2);
    assert.equal(effectCount, 2, 'old branch effect should not fire');
  });

  it('creates new root per branch activation', () => {
    let effectRuns = 0;
    const [show, setShow] = createSignal(true);
    const [val, setVal] = createSignal(0);

    createRoot(() => {
      Show(show, () => {
        createEffect(() => { val(); effectRuns++; });
        return h('div', null);
      });
    });

    assert.equal(effectRuns, 1);
    // Toggle off and back on — new root, new effect
    setShow(false);
    setShow(true);
    assert.equal(effectRuns, 2, 'new effect should have run');
    setVal(1);
    assert.equal(effectRuns, 3, 'new effect should track');
  });

  it('handles null return from renderFn', () => {
    const [show] = createSignal(true);
    assert.doesNotThrow(() => {
      Show(show, () => null);
    });
  });
});

describe('For()', () => {
  it('renders list of items', () => {
    const [items] = createSignal(['a', 'b', 'c']);
    const el = For(items, (item) => item, (item) => h('li', null, item));
    assert.equal(el.childNodes.length, 3);
    assert.equal(el.childNodes[0].textContent, 'a');
    assert.equal(el.childNodes[2].textContent, 'c');
  });

  it('reuses existing nodes by key', () => {
    const [items, setItems] = createSignal(['a', 'b', 'c']);
    const el = For(items, (item) => item, (item) => h('li', null, item));
    const origNode = el.childNodes[1]; // 'b' node
    setItems(['a', 'b', 'c', 'd']);
    assert.equal(el.childNodes[1], origNode, 'b node should be reused');
    assert.equal(el.childNodes.length, 4);
  });

  it('adds new items', () => {
    const [items, setItems] = createSignal([1, 2]);
    const el = For(items, (i) => i, (i) => h('span', null, String(i)));
    assert.equal(el.childNodes.length, 2);
    setItems([1, 2, 3]);
    assert.equal(el.childNodes.length, 3);
    assert.equal(el.childNodes[2].textContent, '3');
  });

  it('removes items and disposes their reactive trees', () => {
    let effectCount = 0;
    const [items, setItems] = createSignal(['a', 'b', 'c']);
    const [val, setVal] = createSignal(0);

    createRoot(() => {
      For(items, (i) => i, (item) => {
        if (item === 'b') {
          createEffect(() => { val(); effectCount++; });
        }
        return h('li', null, item);
      });
    });

    assert.equal(effectCount, 1);
    setVal(1);
    assert.equal(effectCount, 2);

    // Remove 'b'
    setItems(['a', 'c']);
    setVal(2);
    assert.equal(effectCount, 2, 'disposed item effect should not fire');
  });

  it('reorders items', () => {
    const [items, setItems] = createSignal(['a', 'b', 'c']);
    const el = For(items, (i) => i, (item) => h('li', null, item));
    const aNode = el.childNodes[0];
    const cNode = el.childNodes[2];

    setItems(['c', 'a', 'b']);
    assert.equal(el.childNodes[0], cNode);
    assert.equal(el.childNodes[1], aNode);
  });

  it('handles empty list', () => {
    const [items] = createSignal([]);
    const el = For(items, (i) => i, (i) => h('li', null, String(i)));
    assert.equal(el.childNodes.length, 0);
  });

  it('updates from empty to non-empty', () => {
    const [items, setItems] = createSignal([]);
    const el = For(items, (i) => i, (i) => h('li', null, String(i)));
    assert.equal(el.childNodes.length, 0);
    setItems([1, 2]);
    assert.equal(el.childNodes.length, 2);
  });

  it('clears all items and disposes all roots', () => {
    let effectCount = 0;
    const [items, setItems] = createSignal([1, 2, 3]);
    const [val, setVal] = createSignal(0);

    createRoot(() => {
      For(items, (i) => i, (item) => {
        createEffect(() => { val(); effectCount++; });
        return h('li', null, String(item));
      });
    });

    assert.equal(effectCount, 3);
    setItems([]);
    setVal(1);
    assert.equal(effectCount, 3, 'all effects should be disposed');
  });

  it('per-item effects are independent', () => {
    const counts = { a: 0, b: 0 };
    const [items, setItems] = createSignal(['a', 'b']);
    const [val, setVal] = createSignal(0);

    createRoot(() => {
      For(items, (i) => i, (item) => {
        createEffect(() => { val(); counts[item]++; });
        return h('li', null, item);
      });
    });

    assert.deepEqual(counts, { a: 1, b: 1 });
    setVal(1);
    assert.deepEqual(counts, { a: 2, b: 2 });

    // Remove 'a' — only 'a' effect should stop
    setItems(['b']);
    setVal(2);
    assert.equal(counts.a, 2, 'a effect should be disposed');
    assert.equal(counts.b, 3, 'b effect should still fire');
  });
});

describe('cond() disposal', () => {
  it('disposes reactive tree on branch swap', () => {
    let effectCount = 0;
    const [show, setShow] = createSignal(true);
    const [val, setVal] = createSignal(0);

    const Comp = component(() => {
      return cond(show,
        () => {
          const inner = component(() => {
            createEffect(() => { val(); effectCount++; });
            return h('div', null, 'yes');
          });
          return inner();
        },
        () => h('div', null, 'no')
      );
    });

    Comp();
    assert.equal(effectCount, 1);
    setVal(1);
    assert.equal(effectCount, 2);

    setShow(false);
    setVal(2);
    assert.equal(effectCount, 2, 'inner component effect should be disposed');
  });
});

describe('list() disposal', () => {
  it('disposes reactive tree on item removal', () => {
    let effectCount = 0;
    const [items, setItems] = createSignal([1, 2]);
    const [val, setVal] = createSignal(0);

    const Comp = component(() => {
      return list(items, (i) => i, (item) => {
        const inner = component(() => {
          createEffect(() => { val(); effectCount++; });
          return h('li', null, String(item));
        });
        return inner();
      });
    });

    Comp();
    assert.equal(effectCount, 2);
    setVal(1);
    assert.equal(effectCount, 4);

    setItems([1]);
    setVal(2);
    assert.equal(effectCount, 5, 'only surviving item effect should fire');
  });
});
