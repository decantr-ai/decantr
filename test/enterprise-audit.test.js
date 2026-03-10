/**
 * Tests for the 8 new components/behaviors from the enterprise component audit.
 * P0: createHotkey, MaskedInput, Banner
 * P1: CodeBlock, SortableList, DateTimePicker
 * P2: createInfiniteScroll, createMasonry
 */
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM, Event_ } from '../src/test/dom.js';
import { resetBase } from '../src/components/_base.js';
import { h } from '../src/core/index.js';
import { MaskedInput } from '../src/components/masked-input.js';
import { Banner } from '../src/components/banner.js';
import { CodeBlock } from '../src/components/code-block.js';
import { SortableList } from '../src/components/sortable-list.js';
import { DateTimePicker } from '../src/components/datetime-picker.js';
import { createHotkey, createInfiniteScroll, createMasonry } from '../src/components/_behaviors.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;

  // Stub IntersectionObserver for createInfiniteScroll tests
  globalThis.IntersectionObserver = class {
    constructor(cb) { this._cb = cb; this._els = []; }
    observe(el) { this._els.push(el); }
    disconnect() { this._els = []; }
  };

  // Stub ResizeObserver for createMasonry tests
  globalThis.ResizeObserver = class {
    constructor(cb) { this._cb = cb; }
    observe() {}
    disconnect() {}
  };
});

after(() => {
  if (cleanup) cleanup();
  delete globalThis.IntersectionObserver;
  delete globalThis.ResizeObserver;
});

beforeEach(() => {
  resetBase();
  document.body.replaceChildren();
  document.head.replaceChildren();
});

/** Helper: create a keyboard-like event compatible with the test DOM */
function keyEvent(key, mods = {}) {
  const e = new Event_('keydown', { bubbles: true });
  e.key = key;
  e.ctrlKey = mods.ctrlKey || false;
  e.shiftKey = mods.shiftKey || false;
  e.altKey = mods.altKey || false;
  e.metaKey = mods.metaKey || false;
  return e;
}

// ─── P0: createHotkey ───────────────────────────────────────────

describe('createHotkey', () => {
  it('registers and fires single key binding', () => {
    let fired = false;
    const el = h('div', null);
    document.body.appendChild(el);
    const hk = createHotkey(el, { 'a': () => { fired = true; } });
    el.dispatchEvent(keyEvent('a'));
    assert.ok(fired);
    hk.destroy();
  });

  it('registers modifier key bindings', () => {
    let fired = false;
    const el = h('div', null);
    document.body.appendChild(el);
    const hk = createHotkey(el, {
      'ctrl+k': () => { fired = true; }
    });
    el.dispatchEvent(keyEvent('k', { ctrlKey: true }));
    assert.ok(fired);
    hk.destroy();
  });

  it('does not fire for wrong modifiers', () => {
    let fired = false;
    const el = h('div', null);
    document.body.appendChild(el);
    const hk = createHotkey(el, {
      'ctrl+k': () => { fired = true; }
    });
    el.dispatchEvent(keyEvent('k'));
    assert.ok(!fired);
    hk.destroy();
  });

  it('update() changes bindings', () => {
    let result = '';
    const el = h('div', null);
    document.body.appendChild(el);
    const hk = createHotkey(el, { 'a': () => { result = 'a'; } });
    hk.update({ 'b': () => { result = 'b'; } });
    el.dispatchEvent(keyEvent('a'));
    assert.equal(result, ''); // 'a' no longer bound
    el.dispatchEvent(keyEvent('b'));
    assert.equal(result, 'b');
    hk.destroy();
  });

  it('destroy() removes listeners', () => {
    let fired = false;
    const el = h('div', null);
    document.body.appendChild(el);
    const hk = createHotkey(el, { 'x': () => { fired = true; } });
    hk.destroy();
    el.dispatchEvent(keyEvent('x'));
    assert.ok(!fired);
  });
});

// ─── P0: MaskedInput ────────────────────────────────────────────

describe('MaskedInput', () => {
  it('renders an input element with d-masked-input class', () => {
    const el = MaskedInput({ mask: '###-####' });
    assert.equal(el.tagName, 'INPUT');
    assert.ok(el.className.includes('d-masked-input'));
  });

  it('renders input with d-input class', () => {
    const el = MaskedInput({ mask: '###' });
    assert.ok(el.className.includes('d-input'));
  });

  it('applies error class', () => {
    const el = MaskedInput({ mask: '###', error: 'Required' });
    assert.ok(el.className.includes('d-input-error'));
  });

  it('applies custom class', () => {
    const el = MaskedInput({ mask: '###', class: 'my-mask' });
    assert.ok(el.className.includes('my-mask'));
  });

  it('throws if no mask provided', () => {
    assert.throws(() => MaskedInput({}), /requires a mask/);
  });

  it('sets aria-invalid when error present', () => {
    const el = MaskedInput({ mask: '###', error: 'bad' });
    assert.equal(el.getAttribute('aria-invalid'), 'true');
  });
});

// ─── P0: Banner ─────────────────────────────────────────────────

describe('Banner', () => {
  it('renders a banner with d-banner class', () => {
    const el = Banner({}, 'Hello world');
    assert.ok(el.className.includes('d-banner'));
    assert.ok(el.textContent.includes('Hello world'));
  });

  it('applies variant class', () => {
    for (const v of ['info', 'success', 'warning', 'error']) {
      const el = Banner({ variant: v }, 'Test');
      assert.ok(el.className.includes(`d-banner-${v}`));
    }
  });

  it('applies sticky-top class', () => {
    const el = Banner({ sticky: 'top' }, 'Sticky');
    assert.ok(el.className.includes('d-banner-sticky-top'));
  });

  it('applies sticky-bottom class', () => {
    const el = Banner({ sticky: 'bottom' }, 'Sticky');
    assert.ok(el.className.includes('d-banner-sticky-bottom'));
  });

  it('renders dismiss button when dismissible', () => {
    const el = Banner({ dismissible: true }, 'Dismissible');
    const closeBtn = el.querySelector('.d-banner-dismiss');
    assert.ok(closeBtn);
    assert.equal(closeBtn.getAttribute('aria-label'), 'Dismiss banner');
  });

  it('calls onDismiss and removes element on dismiss', () => {
    let dismissed = false;
    const el = Banner({ dismissible: true, onDismiss: () => { dismissed = true; } }, 'Test');
    document.body.appendChild(el);
    const closeBtn = el.querySelector('.d-banner-dismiss');
    closeBtn.click();
    assert.ok(dismissed);
    assert.ok(!document.body.contains(el));
  });

  it('renders icon', () => {
    const el = Banner({ icon: '⚠️' }, 'Warning');
    const iconEl = el.querySelector('.d-banner-icon');
    assert.ok(iconEl);
  });

  it('renders action slot', () => {
    const btn = h('button', null, 'Upgrade');
    const el = Banner({ action: btn }, 'New version');
    const action = el.querySelector('.d-banner-action');
    assert.ok(action);
    assert.ok(action.textContent.includes('Upgrade'));
  });

  it('applies custom class', () => {
    const el = Banner({ class: 'my-banner' }, 'Test');
    assert.ok(el.className.includes('my-banner'));
  });

  it('has role=banner', () => {
    const el = Banner({}, 'Test');
    assert.equal(el.getAttribute('role'), 'banner');
  });
});

// ─── P1: CodeBlock ──────────────────────────────────────────────

describe('CodeBlock', () => {
  it('renders code block with d-codeblock class', () => {
    const el = CodeBlock({}, 'const x = 1;');
    assert.ok(el.className.includes('d-codeblock'));
  });

  it('renders code content', () => {
    const el = CodeBlock({}, 'console.log("hi")');
    const code = el.querySelector('.d-codeblock-code');
    assert.ok(code);
    assert.equal(code.textContent, 'console.log("hi")');
  });

  it('renders language label', () => {
    const el = CodeBlock({ language: 'javascript' }, 'const x = 1;');
    const lang = el.querySelector('.d-codeblock-lang');
    assert.ok(lang);
    assert.equal(lang.textContent, 'javascript');
  });

  it('adds language class to code element', () => {
    const el = CodeBlock({ language: 'python' }, 'x = 1');
    const code = el.querySelector('.d-codeblock-code');
    assert.ok(code.className.includes('language-python'));
  });

  it('renders copy button by default', () => {
    const el = CodeBlock({}, 'code');
    const copy = el.querySelector('.d-codeblock-copy');
    assert.ok(copy);
    assert.equal(copy.getAttribute('aria-label'), 'Copy code');
  });

  it('hides copy button when copyable=false', () => {
    const el = CodeBlock({ copyable: false, language: 'js' }, 'code');
    const copy = el.querySelector('.d-codeblock-copy');
    assert.ok(!copy);
  });

  it('renders line numbers when enabled', () => {
    const el = CodeBlock({ lineNumbers: true }, 'line1\nline2\nline3');
    const gutter = el.querySelector('.d-codeblock-gutter');
    assert.ok(gutter);
    const lineNums = gutter.querySelectorAll('.d-codeblock-ln');
    assert.equal(lineNums.length, 3);
    assert.equal(lineNums[0].textContent, '1');
    assert.equal(lineNums[2].textContent, '3');
  });

  it('does not render line numbers by default', () => {
    const el = CodeBlock({}, 'code');
    const gutter = el.querySelector('.d-codeblock-gutter');
    assert.ok(!gutter);
  });

  it('applies custom class', () => {
    const el = CodeBlock({ class: 'my-code' }, 'x');
    assert.ok(el.className.includes('my-code'));
  });
});

// ─── P1: SortableList ───────────────────────────────────────────

describe('SortableList', () => {
  const items = ['Alpha', 'Beta', 'Gamma'];

  it('renders a sortable list with role=list', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    assert.equal(el.getAttribute('role'), 'list');
    assert.ok(el.className.includes('d-sortable'));
  });

  it('renders correct number of items', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    const listItems = el.querySelectorAll('.d-sortable-item');
    assert.equal(listItems.length, 3);
  });

  it('renders items with role=listitem', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    const listItems = el.querySelectorAll('[role="listitem"]');
    assert.equal(listItems.length, 3);
  });

  it('renders drag handles', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    const handles = el.querySelectorAll('.d-sortable-handle');
    assert.equal(handles.length, 3);
  });

  it('has live region for announcements', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    const live = el.querySelector('[aria-live]');
    assert.ok(live);
    assert.equal(live.getAttribute('aria-live'), 'assertive');
  });

  it('applies vertical direction by default', () => {
    const el = SortableList({
      items,
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    assert.ok(el.className.includes('d-sortable-v'));
  });

  it('applies horizontal direction class', () => {
    const el = SortableList({
      items,
      direction: 'horizontal',
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    assert.ok(el.className.includes('d-sortable-h'));
  });

  it('applies custom class', () => {
    const el = SortableList({
      items,
      class: 'my-sort',
      renderFn: (item, i, handle) => h('div', null, handle, item)
    });
    assert.ok(el.className.includes('my-sort'));
  });
});

// ─── P1: DateTimePicker ─────────────────────────────────────────

describe('DateTimePicker', () => {
  it('renders datetimepicker container', () => {
    const el = DateTimePicker({});
    assert.ok(el.className.includes('d-datetimepicker'));
  });

  it('shows placeholder text', () => {
    const el = DateTimePicker({ placeholder: 'Pick datetime' });
    assert.ok(el.textContent.includes('Pick datetime'));
  });

  it('shows default placeholder', () => {
    const el = DateTimePicker({});
    assert.ok(el.textContent.includes('Select date and time'));
  });

  it('renders trigger button with haspopup', () => {
    const el = DateTimePicker({});
    const trigger = el.querySelector('button');
    assert.ok(trigger);
    assert.equal(trigger.getAttribute('aria-haspopup'), 'dialog');
  });

  it('applies custom class', () => {
    const el = DateTimePicker({ class: 'my-dt' });
    assert.ok(el.className.includes('my-dt'));
  });

  it('shows formatted value when provided', () => {
    const el = DateTimePicker({ value: new Date(2025, 0, 15, 14, 30) });
    const display = el.querySelector('.d-select-display');
    assert.ok(display);
    assert.ok(display.textContent.includes('2025'));
    assert.ok(display.textContent.includes('14:30'));
  });

  it('disables trigger when disabled', () => {
    const el = DateTimePicker({ disabled: true });
    const trigger = el.querySelector('button');
    assert.ok(trigger.disabled);
  });
});

// ─── P2: createInfiniteScroll ───────────────────────────────────

describe('createInfiniteScroll', () => {
  it('returns destroy and loading functions', () => {
    const container = h('div', null);
    document.body.appendChild(container);
    const is = createInfiniteScroll(container, {
      loadMore: () => {},
      threshold: 50
    });
    assert.equal(typeof is.destroy, 'function');
    assert.equal(typeof is.loading, 'function');
    assert.equal(is.loading(), false);
    is.destroy();
  });

  it('creates sentinel element when none provided', () => {
    const container = h('div', null);
    document.body.appendChild(container);
    const childCount = container.childNodes.length;
    const is = createInfiniteScroll(container, { loadMore: () => {} });
    assert.equal(container.childNodes.length, childCount + 1);
    is.destroy();
  });
});

// ─── P2: createMasonry ──────────────────────────────────────────

describe('createMasonry', () => {
  it('returns refresh, setColumns, and destroy functions', () => {
    const container = h('div', null);
    container.appendChild(h('div', null, 'Item 1'));
    container.appendChild(h('div', null, 'Item 2'));
    document.body.appendChild(container);
    const m = createMasonry(container, { columns: 2, gap: 8 });
    assert.equal(typeof m.refresh, 'function');
    assert.equal(typeof m.setColumns, 'function');
    assert.equal(typeof m.destroy, 'function');
    m.destroy();
  });

  it('sets container to relative positioning', () => {
    const container = h('div', null);
    container.appendChild(h('div', null, 'A'));
    document.body.appendChild(container);
    const m = createMasonry(container, { columns: 2 });
    assert.equal(container.style.position, 'relative');
    m.destroy();
  });
});
