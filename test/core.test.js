import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { h, text, cond, list, mount, onMount } from '../src/core/index.js';
import { createSignal } from '../src/state/index.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

describe('h()', () => {
  it('creates an element with tag', () => {
    const el = h('div', null);
    assert.equal(el.tagName, 'DIV');
  });

  it('sets string attributes', () => {
    const el = h('div', { id: 'test', class: 'foo bar' });
    assert.equal(el.id, 'test');
    assert.equal(el.className, 'foo bar');
  });

  it('attaches event listeners', () => {
    let clicked = false;
    const el = h('button', { onclick: () => { clicked = true; } });
    el.dispatchEvent({ type: 'click', target: el });
    assert.equal(clicked, true);
  });

  it('appends static text children', () => {
    const el = h('p', null, 'Hello', ' ', 'World');
    assert.equal(el.textContent, 'Hello World');
  });

  it('appends element children', () => {
    const el = h('div', null, h('span', null, 'inner'));
    assert.equal(el.childNodes.length, 1);
    assert.equal(el.childNodes[0].tagName, 'SPAN');
    assert.equal(el.childNodes[0].textContent, 'inner');
  });

  it('handles reactive function children', () => {
    const [count, setCount] = createSignal(0);
    const el = h('p', null, () => `Count: ${count()}`);
    assert.equal(el.textContent, 'Count: 0');
    setCount(5);
    assert.equal(el.textContent, 'Count: 5');
  });

  it('handles reactive attributes', () => {
    const [cls, setCls] = createSignal('a');
    const el = h('div', { class: cls });
    assert.equal(el.className, 'a');
    setCls('b');
    assert.equal(el.className, 'b');
  });

  it('skips null and false children', () => {
    const el = h('div', null, null, false, 'visible');
    assert.equal(el.textContent, 'visible');
  });

  it('flattens array children', () => {
    const el = h('div', null, ['a', 'b'], 'c');
    assert.equal(el.textContent, 'abc');
  });

  it('handles boolean attributes', () => {
    const el = h('input', { disabled: true, hidden: false });
    assert.equal(el.hasAttribute('disabled'), true);
    assert.equal(el.hasAttribute('hidden'), false);
  });

  it('calls ref function with element', () => {
    let refEl = null;
    const el = h('div', { ref: (e) => { refEl = e; } });
    assert.equal(refEl, el);
  });
});

describe('text()', () => {
  it('creates a reactive text node', () => {
    const [val, setVal] = createSignal('hello');
    const node = text(val);
    assert.equal(node.nodeValue, 'hello');
    setVal('world');
    assert.equal(node.nodeValue, 'world');
  });

  it('handles derived text', () => {
    const [a, setA] = createSignal(1);
    const node = text(() => `Value: ${a()}`);
    assert.equal(node.nodeValue, 'Value: 1');
    setA(42);
    assert.equal(node.nodeValue, 'Value: 42');
  });
});

describe('cond()', () => {
  it('renders then branch when true', () => {
    const [show] = createSignal(true);
    const el = cond(show, () => h('span', null, 'yes'));
    assert.ok(el.textContent.includes('yes'));
  });

  it('renders else branch when false', () => {
    const [show] = createSignal(false);
    const el = cond(show, () => h('span', null, 'yes'), () => h('span', null, 'no'));
    assert.ok(el.textContent.includes('no'));
  });

  it('switches between branches', () => {
    const [show, setShow] = createSignal(true);
    const el = cond(show, () => h('span', null, 'yes'), () => h('span', null, 'no'));
    assert.ok(el.textContent.includes('yes'));
    setShow(false);
    assert.ok(el.textContent.includes('no'));
  });
});

describe('list()', () => {
  it('renders initial items', () => {
    const [items] = createSignal([1, 2, 3]);
    const el = list(items, (item) => item, (item) => h('span', null, String(item)));
    assert.equal(el.children.length, 3);
  });

  it('adds new items', () => {
    const [items, setItems] = createSignal([1, 2]);
    const el = list(items, (item) => item, (item) => h('span', null, String(item)));
    assert.equal(el.children.length, 2);
    setItems([1, 2, 3]);
    assert.equal(el.children.length, 3);
  });

  it('removes items', () => {
    const [items, setItems] = createSignal([1, 2, 3]);
    const el = list(items, (item) => item, (item) => h('span', null, String(item)));
    assert.equal(el.children.length, 3);
    setItems([1, 3]);
    assert.equal(el.children.length, 2);
  });

  it('reuses existing nodes by key', () => {
    const [items, setItems] = createSignal([1, 2, 3]);
    const el = list(items, (item) => item, (item) => h('span', { id: `item-${item}` }, String(item)));
    const firstSpan = el.children[0];
    setItems([1, 2, 3, 4]);
    assert.equal(el.children[0], firstSpan);
  });
});

describe('mount()', () => {
  it('mounts component to root', () => {
    const root = h('div', null);
    mount(root, () => h('p', null, 'Hello'));
    assert.equal(root.textContent, 'Hello');
  });

  it('calls onMount callbacks', () => {
    const root = h('div', null);
    let mounted = false;
    mount(root, () => {
      onMount(() => { mounted = true; });
      return h('p', null, 'test');
    });
    assert.equal(mounted, true);
  });
});
