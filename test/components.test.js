import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createSignal } from '../src/state/index.js';
import { resetBase } from '../src/components/_base.js';
import { Button } from '../src/components/button.js';
import { Badge } from '../src/components/badge.js';
import { Input } from '../src/components/input.js';
import { Card } from '../src/components/card.js';
import { Modal } from '../src/components/modal.js';
import { icon } from '../src/components/icon.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  resetBase();
  document.body.replaceChildren();
  document.head.replaceChildren();
});

describe('Button', () => {
  it('creates a button element', () => {
    const btn = Button({}, 'Click');
    assert.equal(btn.tagName, 'BUTTON');
    assert.ok(btn.className.includes('d-btn'));
  });

  it('applies variant class', () => {
    const btn = Button({ variant: 'primary' }, 'Go');
    assert.ok(btn.className.includes('d-btn-primary'));
  });

  it('applies size class', () => {
    const sm = Button({ size: 'sm' }, 'S');
    assert.ok(sm.className.includes('d-btn-sm'));
    const lg = Button({ size: 'lg' }, 'L');
    assert.ok(lg.className.includes('d-btn-lg'));
  });

  it('applies block class', () => {
    const btn = Button({ block: true }, 'Full');
    assert.ok(btn.className.includes('d-btn-block'));
  });

  it('handles static disabled', () => {
    const btn = Button({ disabled: true }, 'No');
    assert.ok(btn.hasAttribute('disabled'));
  });

  it('handles reactive disabled', () => {
    const [dis, setDis] = createSignal(false);
    const btn = Button({ disabled: dis }, 'Toggle');
    assert.ok(!btn.hasAttribute('disabled'));
    setDis(true);
    assert.ok(btn.hasAttribute('disabled'));
  });

  it('handles static loading', () => {
    const btn = Button({ loading: true }, 'Wait');
    assert.ok(btn.className.includes('d-btn-loading'));
    assert.ok(btn.hasAttribute('disabled'));
  });

  it('handles reactive loading', () => {
    const [load, setLoad] = createSignal(false);
    const btn = Button({ loading: load }, 'Load');
    assert.ok(!btn.className.includes('d-btn-loading'));
    setLoad(true);
    assert.ok(btn.className.includes('d-btn-loading'));
    setLoad(false);
    assert.ok(!btn.className.includes('d-btn-loading'));
  });

  it('renders children as text', () => {
    const btn = Button({}, 'Hello');
    assert.ok(btn.textContent.includes('Hello'));
  });

  it('attaches onclick handler', () => {
    let clicked = false;
    const btn = Button({ onclick: () => { clicked = true; } }, 'Click');
    btn.dispatchEvent(new window.Event('click'));
    assert.ok(clicked);
  });

  it('applies success variant class', () => {
    const btn = Button({ variant: 'success' }, 'OK');
    assert.ok(btn.className.includes('d-btn-success'));
  });

  it('applies warning variant class', () => {
    const btn = Button({ variant: 'warning' }, 'Warn');
    assert.ok(btn.className.includes('d-btn-warning'));
  });

  it('applies outline variant class', () => {
    const btn = Button({ variant: 'outline' }, 'Outline');
    assert.ok(btn.className.includes('d-btn-outline'));
  });

  it('injects base CSS on first render', () => {
    Button({}, 'Test');
    const baseEl = document.querySelector('[data-decantr-base]');
    assert.ok(baseEl);
    assert.ok(baseEl.textContent.includes('.d-btn{'));
  });
});

describe('Badge', () => {
  it('creates a standalone badge with count', () => {
    const b = Badge({ count: 5 });
    assert.ok(b.className.includes('d-badge'));
    assert.ok(b.textContent.includes('5'));
  });

  it('handles reactive count', () => {
    const [count, setCount] = createSignal(3);
    const b = Badge({ count });
    assert.ok(b.textContent.includes('3'));
    setCount(10);
    assert.ok(b.textContent.includes('10'));
  });

  it('renders dot variant', () => {
    const b = Badge({ dot: true });
    assert.ok(b.className.includes('d-badge-dot'));
  });

  it('wraps children with superscript badge', () => {
    const b = Badge({ count: 2 }, document.createElement('span'));
    assert.ok(b.className.includes('d-badge-wrapper'));
    assert.equal(b.children.length, 2); // child + sup wrapper
  });

  it('applies status color', () => {
    const b = Badge({ status: 'error', count: 1 });
    assert.ok(b.style.background === 'var(--c9)');
  });

  it('adds processing animation class', () => {
    const b = Badge({ dot: true, status: 'processing' });
    assert.ok(b.className.includes('d-badge-processing'));
  });
});

describe('Input', () => {
  it('creates an input with wrapper', () => {
    const inp = Input({});
    assert.equal(inp.tagName, 'DIV');
    assert.ok(inp.className.includes('d-input-wrap'));
    const input = inp.querySelector('input');
    assert.ok(input);
  });

  it('sets type attribute', () => {
    const inp = Input({ type: 'email' });
    const input = inp.querySelector('input');
    assert.equal(input.getAttribute('type'), 'email');
  });

  it('sets placeholder', () => {
    const inp = Input({ placeholder: 'Enter...' });
    const input = inp.querySelector('input');
    assert.equal(input.getAttribute('placeholder'), 'Enter...');
  });

  it('handles static disabled', () => {
    const inp = Input({ disabled: true });
    const input = inp.querySelector('input');
    assert.ok(input.hasAttribute('disabled'));
  });

  it('handles reactive disabled', () => {
    const [dis, setDis] = createSignal(false);
    const inp = Input({ disabled: dis });
    const input = inp.querySelector('input');
    assert.ok(!input.hasAttribute('disabled'));
    setDis(true);
    assert.ok(input.hasAttribute('disabled'));
  });

  it('shows error state', () => {
    const inp = Input({ error: true });
    assert.ok(inp.className.includes('d-input-error'));
  });

  it('handles reactive error', () => {
    const [err, setErr] = createSignal(false);
    const inp = Input({ error: err });
    assert.ok(!inp.className.includes('d-input-error'));
    setErr(true);
    assert.ok(inp.className.includes('d-input-error'));
  });

  it('renders prefix and suffix', () => {
    const inp = Input({ prefix: '$', suffix: '.00' });
    const children = inp.children;
    assert.equal(children.length, 3); // prefix + input + suffix
    assert.ok(children[0].className.includes('d-input-prefix'));
    assert.ok(children[2].className.includes('d-input-suffix'));
  });

  it('calls ref with input element', () => {
    let refEl = null;
    Input({ ref: el => { refEl = el; } });
    assert.ok(refEl);
    assert.equal(refEl.tagName, 'INPUT');
  });
});

describe('Card', () => {
  it('creates a card element', () => {
    const c = Card({}, 'Content');
    assert.ok(c.className.includes('d-card'));
  });

  it('auto-creates header from title prop', () => {
    const c = Card({ title: 'Hello' }, 'Body');
    const header = c.querySelector('.d-card-header');
    assert.ok(header);
    assert.ok(header.textContent.includes('Hello'));
  });

  it('auto-wraps children in body', () => {
    const c = Card({}, 'Content');
    const body = c.querySelector('.d-card-body');
    assert.ok(body);
    assert.ok(body.textContent.includes('Content'));
  });

  it('supports composable sections', () => {
    const c = Card({},
      Card.Header({}, 'Title'),
      Card.Body({}, 'Body text'),
      Card.Footer({}, 'Footer')
    );
    assert.ok(c.querySelector('.d-card-header'));
    assert.ok(c.querySelector('.d-card-body'));
    assert.ok(c.querySelector('.d-card-footer'));
  });

  it('adds hoverable class', () => {
    const c = Card({ hoverable: true }, 'H');
    assert.ok(c.className.includes('d-card-hover'));
  });
});

describe('Modal', () => {
  it('returns a sentinel element', () => {
    const [vis] = createSignal(false);
    const m = Modal({ visible: vis });
    assert.equal(m.tagName, 'D-MODAL');
  });

  it('renders overlay to body when visible', () => {
    const [vis, setVis] = createSignal(false);
    Modal({ visible: vis, title: 'Test' }, 'Content');
    assert.ok(!document.body.querySelector('.d-modal-overlay'));

    setVis(true);
    const overlay = document.body.querySelector('.d-modal-overlay');
    assert.ok(overlay);
    assert.ok(overlay.querySelector('.d-modal-content'));
    assert.ok(overlay.querySelector('.d-modal-header'));
  });

  it('removes overlay when hidden', () => {
    const [vis, setVis] = createSignal(true);
    Modal({ visible: vis }, 'Hello');
    assert.ok(document.body.querySelector('.d-modal-overlay'));

    setVis(false);
    assert.ok(!document.body.querySelector('.d-modal-overlay'));
  });

  it('calls onClose on close button click', () => {
    let closed = false;
    const [vis] = createSignal(true);
    Modal({ visible: vis, title: 'X', onClose: () => { closed = true; } });
    const closeBtn = document.body.querySelector('.d-modal-close');
    assert.ok(closeBtn);
    closeBtn.dispatchEvent(new window.Event('click'));
    assert.ok(closed);
  });
});

describe('base CSS', () => {
  it('contains prefers-reduced-motion media query', () => {
    Button({}, 'Test');
    const baseEl = document.querySelector('[data-decantr-base]');
    assert.ok(baseEl.textContent.includes('prefers-reduced-motion:reduce'));
  });
});

describe('icon', () => {
  it('returns fallback span without icon libraries', () => {
    const el = icon('home');
    assert.equal(el.tagName, 'SPAN');
    assert.equal(el.getAttribute('title'), 'home');
  });

  it('detects Material Icons when indicator present', () => {
    const indicator = document.createElement('link');
    indicator.setAttribute('data-icons', 'material');
    document.head.appendChild(indicator);
    const el = icon('home');
    assert.ok(el.className.includes('material-icons'));
    assert.ok(el.textContent.includes('home'));
  });

  it('applies custom size', () => {
    const el = icon('star', { size: '2rem' });
    assert.equal(el.style.width || el.style.fontSize, '2rem');
  });

  it('applies custom class', () => {
    const el = icon('check', { class: 'my-icon' });
    assert.ok(el.className.includes('my-icon'));
  });
});
