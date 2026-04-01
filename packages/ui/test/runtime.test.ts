import { describe, it, expect, vi } from 'vitest';
import { createRoot } from '../src/state/scheduler.js';
import { createSignal } from '../src/state/index.js';
import { h, mount, text } from '../src/runtime/index.js';
import { component } from '../src/runtime/component.js';

// ─── h() ─────────────────────────────────────────────────────

describe('h()', () => {
  it('creates an element with the given tag', () => {
    const el = h('div');
    expect(el.tagName).toBe('DIV');
  });

  it('sets static props as attributes', () => {
    const el = h('div', { id: 'test', 'data-x': '1' });
    expect(el.getAttribute('id')).toBe('test');
    expect(el.getAttribute('data-x')).toBe('1');
  });

  it('appends string children as text nodes', () => {
    const el = h('p', null, 'hello', ' world');
    expect(el.textContent).toBe('hello world');
  });

  it('appends DOM node children', () => {
    const child = document.createElement('span');
    child.textContent = 'inner';
    const el = h('div', null, child);
    expect(el.firstChild).toBe(child);
    expect(el.textContent).toBe('inner');
  });

  it('binds onclick event listeners', () => {
    const handler = vi.fn();
    const el = h('button', { onclick: handler });
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('creates reactive bindings for function props', () => {
    createRoot(() => {
      const [cls, setCls] = createSignal('a');
      const el = h('div', { class: cls });
      expect(el.className).toBe('a');
      setCls('b');
      expect(el.className).toBe('b');
    });
  });

  it('sets class prop as className', () => {
    const el = h('div', { class: 'foo bar' });
    expect(el.className).toBe('foo bar');
  });

  it('calls ref with the element', () => {
    let refEl: HTMLElement | null = null;
    const el = h('div', { ref: (r: HTMLElement) => { refEl = r; } });
    expect(refEl).toBe(el);
  });
});

// ─── mount() ─────────────────────────────────────────────────

describe('mount()', () => {
  it('mounts a component into the root element', () => {
    const root = document.createElement('div');
    mount(root, () => h('span', null, 'hi'));
    expect(root.innerHTML).toContain('hi');
    expect(root.firstChild!.nodeName).toBe('SPAN');
  });
});

// ─── component() ─────────────────────────────────────────────

describe('component()', () => {
  it('wraps a function with __d_isComponent flag', () => {
    const Comp = component((props: { label: string }) => {
      return h('div', null, props.label);
    });
    expect(Comp.__d_isComponent).toBe(true);
  });

  it('returns the DOM node created by the inner function', () => {
    const Comp = component(() => h('p', null, 'wrapped'));
    const node = Comp({});
    expect(node.tagName).toBe('P');
    expect(node.textContent).toBe('wrapped');
  });

  it('attaches __d_owner for disposal', () => {
    const Comp = component(() => h('div'));
    const node = Comp({}) as any;
    expect(node.__d_owner).toBeTruthy();
    expect(node.__d_owner.children).toBeDefined();
  });
});
