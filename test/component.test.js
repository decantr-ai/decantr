import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { h, component, onCleanup, disposeNode, onDestroy } from '../src/core/index.js';
import { createSignal, createEffect, createRoot } from '../src/state/index.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

describe('component()', () => {
  it('returns a wrapper function', () => {
    const Comp = component(() => h('div', null));
    assert.equal(typeof Comp, 'function');
  });

  it('wrapper has __d_isComponent flag', () => {
    const Comp = component(() => h('div', null));
    assert.equal(Comp.__d_isComponent, true);
  });

  it('wrapper has displayName from function name', () => {
    const Comp = component(function MyWidget() { return h('div', null); });
    assert.equal(Comp.displayName, 'MyWidget');
  });

  it('wrapped function returns DOM node', () => {
    const Comp = component(() => h('div', { class: 'test' }));
    const el = Comp();
    assert.equal(el.tagName, 'DIV');
    assert.equal(el.className, 'test');
  });

  it('DOM node has __d_owner reference', () => {
    const Comp = component(() => h('div', null));
    const el = Comp();
    assert.ok(el.__d_owner, 'node should have __d_owner');
    assert.ok(el.__d_owner.cleanups, 'owner should have cleanups array');
  });

  it('signals work inside component', () => {
    const Comp = component(() => {
      const [count, setCount] = createSignal(0);
      const el = h('span', null, () => `${count()}`);
      setCount(42);
      return el;
    });
    const el = Comp();
    assert.equal(el.textContent, '42');
  });

  it('effects inside component are owned by root', () => {
    let effectRan = 0;
    const [val, setVal] = createSignal(0);

    const Comp = component(() => {
      createEffect(() => { val(); effectRan++; });
      return h('div', null);
    });

    const el = Comp();
    assert.equal(effectRan, 1);
    setVal(1);
    assert.equal(effectRan, 2);

    // Dispose — effect should stop
    disposeNode(el);
    setVal(2);
    assert.equal(effectRan, 2, 'effect should not fire after disposal');
  });

  it('onCleanup runs on disposal', () => {
    let cleaned = false;

    const Comp = component(() => {
      onCleanup(() => { cleaned = true; });
      return h('div', null);
    });

    const el = Comp();
    assert.equal(cleaned, false);
    disposeNode(el);
    assert.equal(cleaned, true);
  });

  it('multiple onCleanup callbacks run in reverse order', () => {
    const order = [];

    const Comp = component(() => {
      onCleanup(() => order.push('first'));
      onCleanup(() => order.push('second'));
      onCleanup(() => order.push('third'));
      return h('div', null);
    });

    const el = Comp();
    disposeNode(el);
    assert.deepEqual(order, ['third', 'second', 'first']);
  });

  it('disposeNode is no-op on null', () => {
    assert.doesNotThrow(() => disposeNode(null));
  });

  it('disposeNode is no-op on node without owner', () => {
    const el = h('div', null);
    assert.doesNotThrow(() => disposeNode(el));
  });

  it('disposeNode clears __d_owner after disposal', () => {
    const Comp = component(() => h('div', null));
    const el = Comp();
    assert.ok(el.__d_owner);
    disposeNode(el);
    assert.equal(el.__d_owner, null);
  });

  it('double disposeNode is safe', () => {
    const Comp = component(() => {
      onCleanup(() => {});
      return h('div', null);
    });
    const el = Comp();
    disposeNode(el);
    assert.doesNotThrow(() => disposeNode(el));
  });

  it('component with no return value does not crash', () => {
    const Comp = component(() => { /* no return */ });
    assert.doesNotThrow(() => Comp());
    const result = Comp();
    assert.equal(result, undefined);
  });

  it('nested components get separate owners', () => {
    let outerOwner, innerOwner;

    const Inner = component(() => {
      innerOwner = h('span', null).__d_owner; // won't have owner, use the component's
      const el = h('span', null);
      return el;
    });

    const Outer = component(() => {
      const inner = Inner();
      const el = h('div', null, inner);
      return el;
    });

    const el = Outer();
    const innerEl = el.childNodes[0];

    assert.ok(el.__d_owner, 'outer should have owner');
    assert.ok(innerEl.__d_owner, 'inner should have owner');
    assert.notEqual(el.__d_owner, innerEl.__d_owner, 'owners should be different');
  });

  it('disposing outer does not dispose inner (independent roots)', () => {
    let innerEffect = 0;
    const [val, setVal] = createSignal(0);

    const Inner = component(() => {
      createEffect(() => { val(); innerEffect++; });
      return h('span', null);
    });

    const Outer = component(() => {
      return h('div', null, Inner());
    });

    const el = Outer();
    assert.equal(innerEffect, 1);
    setVal(1);
    assert.equal(innerEffect, 2);

    // Dispose outer only
    disposeNode(el);
    setVal(2);
    // Inner's root is independent — still alive
    assert.equal(innerEffect, 3);

    // Dispose inner explicitly
    disposeNode(el.childNodes[0]);
    setVal(3);
    assert.equal(innerEffect, 3, 'inner effect should stop after inner disposal');
  });

  it('passes arguments through to wrapped function', () => {
    const Comp = component((props) => {
      return h('div', { class: props.className }, props.label);
    });
    const el = Comp({ className: 'btn', label: 'Click' });
    assert.equal(el.className, 'btn');
    assert.equal(el.textContent, 'Click');
  });
});

describe('onDestroy bridge', () => {
  it('onDestroy inside component fires on disposeNode', () => {
    let destroyed = false;

    const Comp = component(() => {
      onDestroy(() => { destroyed = true; });
      return h('div', null);
    });

    const el = Comp();
    assert.equal(destroyed, false);
    disposeNode(el);
    assert.equal(destroyed, true);
  });
});

describe('bare functions (backward compat)', () => {
  it('bare function components still return nodes', () => {
    function Page() {
      return h('main', null, h('p', null, 'hello'));
    }
    const el = Page();
    assert.equal(el.tagName, 'MAIN');
    assert.equal(el.textContent, 'hello');
  });

  it('bare functions have no __d_owner', () => {
    function Page() { return h('div', null); }
    const el = Page();
    assert.equal(el.__d_owner, undefined);
  });
});
