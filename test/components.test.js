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
import { Textarea } from '../src/components/textarea.js';
import { Checkbox } from '../src/components/checkbox.js';
import { Switch } from '../src/components/switch.js';
import { Select } from '../src/components/select.js';
import { Tabs } from '../src/components/tabs.js';
import { Accordion } from '../src/components/accordion.js';
import { Separator } from '../src/components/separator.js';
import { Breadcrumb } from '../src/components/breadcrumb.js';
import { Table } from '../src/components/table.js';
import { Avatar } from '../src/components/avatar.js';
import { Progress } from '../src/components/progress.js';
import { Skeleton } from '../src/components/skeleton.js';
import { Tooltip } from '../src/components/tooltip.js';
import { Alert } from '../src/components/alert.js';
import { toast, resetToasts } from '../src/components/toast.js';

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

describe('Textarea', () => {
  it('creates a textarea with wrapper', () => {
    const el = Textarea({});
    assert.ok(el.className.includes('d-textarea-wrap'));
    assert.ok(el.querySelector('textarea'));
  });

  it('sets placeholder and rows', () => {
    const el = Textarea({ placeholder: 'Type...', rows: 5 });
    const ta = el.querySelector('textarea');
    assert.equal(ta.getAttribute('placeholder'), 'Type...');
    assert.equal(ta.getAttribute('rows'), '5');
  });

  it('handles reactive value', () => {
    const [val, setVal] = createSignal('hello');
    const el = Textarea({ value: val });
    const ta = el.querySelector('textarea');
    assert.equal(ta.value, 'hello');
    setVal('world');
    assert.equal(ta.value, 'world');
  });

  it('shows error state', () => {
    const el = Textarea({ error: true });
    assert.ok(el.className.includes('d-textarea-error'));
  });

  it('calls ref with textarea element', () => {
    let refEl = null;
    Textarea({ ref: el => { refEl = el; } });
    assert.ok(refEl);
    assert.equal(refEl.tagName, 'TEXTAREA');
  });
});

describe('Checkbox', () => {
  it('creates a checkbox with label', () => {
    const el = Checkbox({ label: 'Accept' });
    assert.ok(el.className.includes('d-checkbox'));
    assert.ok(el.querySelector('.d-checkbox-check'));
    assert.ok(el.textContent.includes('Accept'));
  });

  it('handles static checked', () => {
    const el = Checkbox({ checked: true });
    assert.ok(el.querySelector('input').checked);
    assert.ok(el.className.includes('d-checkbox-checked'));
  });

  it('handles reactive checked', () => {
    const [checked, setChecked] = createSignal(false);
    const el = Checkbox({ checked });
    assert.ok(!el.querySelector('input').checked);
    setChecked(true);
    assert.ok(el.querySelector('input').checked);
    assert.ok(el.className.includes('d-checkbox-checked'));
  });

  it('calls onchange', () => {
    let value = null;
    const el = Checkbox({ onchange: v => { value = v; } });
    const input = el.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new window.Event('change'));
    assert.equal(value, true);
  });
});

describe('Switch', () => {
  it('creates a switch with track and thumb', () => {
    const el = Switch({});
    assert.ok(el.className.includes('d-switch'));
    assert.ok(el.querySelector('.d-switch-track'));
    assert.ok(el.querySelector('.d-switch-thumb'));
  });

  it('handles reactive checked', () => {
    const [checked, setChecked] = createSignal(false);
    const el = Switch({ checked });
    assert.ok(!el.className.includes('d-switch-checked'));
    setChecked(true);
    assert.ok(el.className.includes('d-switch-checked'));
  });

  it('renders label', () => {
    const el = Switch({ label: 'Dark mode' });
    assert.ok(el.textContent.includes('Dark mode'));
  });
});

describe('Select', () => {
  const opts = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' }
  ];

  it('creates a select with trigger', () => {
    const el = Select({ options: opts, placeholder: 'Pick one' });
    assert.ok(el.className.includes('d-select-wrap'));
    assert.ok(el.querySelector('.d-select'));
    assert.ok(el.querySelector('.d-select-display').textContent === 'Pick one');
  });

  it('shows selected value', () => {
    const el = Select({ options: opts, value: 'b' });
    assert.ok(el.querySelector('.d-select-display').textContent === 'Beta');
  });

  it('handles error state', () => {
    const el = Select({ options: opts, error: true });
    assert.ok(el.className.includes('d-select-error'));
  });
});

describe('Tabs', () => {
  const tabConfig = [
    { id: 'one', label: 'Tab 1', content: () => document.createTextNode('Content 1') },
    { id: 'two', label: 'Tab 2', content: () => document.createTextNode('Content 2') }
  ];

  it('renders tab list and panel', () => {
    const el = Tabs({ tabs: tabConfig });
    assert.ok(el.className.includes('d-tabs'));
    const tabs = el.querySelectorAll('.d-tab');
    assert.equal(tabs.length, 2);
    assert.ok(el.querySelector('.d-tabs-panel'));
  });

  it('shows first tab content by default', () => {
    const el = Tabs({ tabs: tabConfig });
    assert.ok(el.querySelector('.d-tabs-panel').textContent.includes('Content 1'));
  });

  it('marks active tab', () => {
    const el = Tabs({ tabs: tabConfig, active: 'two' });
    const tabs = el.querySelectorAll('.d-tab');
    assert.ok(tabs[1].className.includes('d-tab-active'));
  });
});

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'Section A', content: () => document.createTextNode('Body A') },
    { id: 'b', title: 'Section B', content: () => document.createTextNode('Body B') }
  ];

  it('renders accordion items', () => {
    const el = Accordion({ items });
    assert.ok(el.className.includes('d-accordion'));
    assert.equal(el.querySelectorAll('.d-accordion-item').length, 2);
  });

  it('opens item on trigger click', () => {
    const el = Accordion({ items });
    const trigger = el.querySelector('.d-accordion-trigger');
    trigger.click();
    const item = el.querySelector('.d-accordion-item');
    assert.ok(item.className.includes('d-accordion-open'));
  });
});

describe('Separator', () => {
  it('renders a horizontal separator', () => {
    const el = Separator({});
    assert.equal(el.tagName, 'HR');
    assert.ok(el.className.includes('d-separator'));
  });

  it('renders with label', () => {
    const el = Separator({ label: 'OR' });
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.querySelector('.d-separator-label').textContent === 'OR');
  });

  it('applies vertical class', () => {
    const el = Separator({ vertical: true });
    assert.ok(el.className.includes('d-separator-vertical'));
  });
});

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Widget' }
  ];

  it('renders breadcrumb navigation', () => {
    const el = Breadcrumb({ items });
    assert.equal(el.tagName, 'NAV');
    assert.ok(el.getAttribute('aria-label') === 'Breadcrumb');
  });

  it('marks last item as current', () => {
    const el = Breadcrumb({ items });
    const current = el.querySelector('.d-breadcrumb-current');
    assert.ok(current);
    assert.equal(current.textContent, 'Widget');
    assert.equal(current.getAttribute('aria-current'), 'page');
  });

  it('renders separators', () => {
    const el = Breadcrumb({ items });
    const seps = el.querySelectorAll('.d-breadcrumb-separator');
    assert.equal(seps.length, 2);
  });
});

describe('Table', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' }
  ];
  const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ];

  it('renders a table with headers and rows', () => {
    const el = Table({ columns, data });
    assert.ok(el.querySelector('.d-table'));
    const ths = el.querySelectorAll('.d-th');
    assert.equal(ths.length, 2);
    assert.equal(ths[0].textContent, 'Name');
    const tds = el.querySelectorAll('.d-td');
    assert.equal(tds.length, 4);
  });

  it('applies striped and hover classes', () => {
    const el = Table({ columns, data, striped: true, hoverable: true });
    const table = el.querySelector('table');
    assert.ok(table.className.includes('d-table-striped'));
    assert.ok(table.className.includes('d-table-hover'));
  });

  it('uses custom renderer', () => {
    const cols = [{ key: 'name', label: 'Name', render: (v) => document.createTextNode(v.toUpperCase()) }];
    const el = Table({ columns: cols, data: [{ name: 'test' }] });
    assert.ok(el.querySelector('.d-td').textContent === 'TEST');
  });
});

describe('Avatar', () => {
  it('renders fallback when no src', () => {
    const el = Avatar({ alt: 'John Doe' });
    assert.ok(el.className.includes('d-avatar'));
    const fb = el.querySelector('.d-avatar-fallback');
    assert.ok(fb);
    assert.equal(fb.textContent, 'JD');
  });

  it('renders with explicit fallback text', () => {
    const el = Avatar({ fallback: 'AB' });
    assert.equal(el.querySelector('.d-avatar-fallback').textContent, 'AB');
  });

  it('applies size class', () => {
    const el = Avatar({ size: 'lg', fallback: 'X' });
    assert.ok(el.className.includes('d-avatar-lg'));
  });
});

describe('Progress', () => {
  it('renders a progress bar', () => {
    const el = Progress({ value: 50 });
    assert.ok(el.className.includes('d-progress'));
    const bar = el.querySelector('.d-progress-bar');
    assert.ok(bar);
    assert.equal(bar.style.width, '50%');
    assert.equal(bar.getAttribute('aria-valuenow'), '50');
  });

  it('handles reactive value', () => {
    const [val, setVal] = createSignal(25);
    const el = Progress({ value: val });
    const bar = el.querySelector('.d-progress-bar');
    assert.equal(bar.style.width, '25%');
    setVal(75);
    assert.equal(bar.style.width, '75%');
  });

  it('clamps to 0-100', () => {
    const el = Progress({ value: 150 });
    assert.equal(el.querySelector('.d-progress-bar').style.width, '100%');
  });
});

describe('Skeleton', () => {
  it('renders a text skeleton', () => {
    const el = Skeleton({});
    assert.ok(el.className.includes('d-skeleton'));
    assert.ok(el.className.includes('d-skeleton-text'));
  });

  it('renders multiple lines', () => {
    const el = Skeleton({ lines: 3 });
    assert.ok(el.className.includes('d-skeleton-group'));
    assert.equal(el.children.length, 3);
  });

  it('renders circle variant', () => {
    const el = Skeleton({ variant: 'circle', width: '48px', height: '48px' });
    assert.ok(el.className.includes('d-skeleton-circle'));
  });
});

describe('Tooltip', () => {
  it('wraps children with tooltip element', () => {
    const child = document.createElement('span');
    child.textContent = 'Hover me';
    const el = Tooltip({ content: 'Help text' }, child);
    assert.ok(el.className.includes('d-tooltip-wrap'));
    assert.ok(el.querySelector('.d-tooltip'));
    assert.ok(el.querySelector('.d-tooltip').textContent === 'Help text');
  });

  it('applies position class', () => {
    const el = Tooltip({ content: 'Tip', position: 'bottom' }, document.createElement('span'));
    assert.ok(el.querySelector('.d-tooltip').className.includes('d-tooltip-bottom'));
  });
});

describe('Alert', () => {
  it('renders an alert with variant', () => {
    const el = Alert({ variant: 'error' }, 'Something went wrong');
    assert.ok(el.className.includes('d-alert'));
    assert.ok(el.className.includes('d-alert-error'));
    assert.equal(el.getAttribute('role'), 'alert');
  });

  it('renders info variant with status role', () => {
    const el = Alert({ variant: 'info' }, 'Note');
    assert.equal(el.getAttribute('role'), 'status');
  });

  it('dismissible alert removes on click', () => {
    let dismissed = false;
    const el = Alert({ variant: 'warning', dismissible: true, onDismiss: () => { dismissed = true; } }, 'Warn');
    document.body.appendChild(el);
    const btn = el.querySelector('.d-alert-dismiss');
    assert.ok(btn);
    btn.click();
    assert.ok(dismissed);
  });
});

describe('toast', () => {
  beforeEach(() => {
    resetToasts();
  });

  it('creates a toast notification', () => {
    const { dismiss } = toast({ message: 'Saved!' });
    const container = document.querySelector('.d-toast-container');
    assert.ok(container);
    const t = container.querySelector('.d-toast');
    assert.ok(t);
    assert.ok(t.textContent.includes('Saved!'));
    dismiss();
  });

  it('applies variant class', () => {
    const { dismiss } = toast({ message: 'Error', variant: 'error', duration: 0 });
    const t = document.querySelector('.d-toast');
    assert.ok(t.className.includes('d-toast-error'));
    dismiss();
  });

  it('returns dismiss function', () => {
    const { dismiss } = toast({ message: 'Test', duration: 0 });
    assert.equal(typeof dismiss, 'function');
    dismiss();
  });
});
