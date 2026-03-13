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
import { Dropdown } from '../src/components/dropdown.js';
import { Spinner } from '../src/components/spinner.js';
import { Drawer } from '../src/components/drawer.js';
import { Pagination } from '../src/components/pagination.js';
import { RadioGroup } from '../src/components/radiogroup.js';
import { Popover } from '../src/components/popover.js';
import { Combobox } from '../src/components/combobox.js';
import { Slider } from '../src/components/slider.js';
import { InputGroup, CompactGroup } from '../src/components/input-group.js';

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
    assert.ok(b.style.background === 'var(--d-error)');
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
  it('returns a dialog element', () => {
    const [vis] = createSignal(false);
    const m = Modal({ visible: vis });
    assert.equal(m.tagName, 'DIALOG');
    assert.ok(m.className.includes('d-modal-content'));
  });

  it('opens dialog when visible signal is true', () => {
    const [vis, setVis] = createSignal(false);
    const dialog = Modal({ visible: vis, title: 'Test' }, 'Content');
    assert.equal(dialog.open, false);

    setVis(true);
    assert.equal(dialog.open, true);
    assert.ok(dialog.querySelector('.d-modal-header'));
    assert.ok(dialog.querySelector('.d-modal-body'));
  });

  it('closes dialog when visible becomes false', () => {
    const [vis, setVis] = createSignal(true);
    const dialog = Modal({ visible: vis }, 'Hello');
    assert.equal(dialog.open, true);

    setVis(false);
    assert.equal(dialog.open, false);
  });

  it('calls onClose on close button click', () => {
    let closed = false;
    const [vis] = createSignal(true);
    const dialog = Modal({ visible: vis, title: 'X', onClose: () => { closed = true; } });
    const closeBtn = dialog.querySelector('.d-modal-close');
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
  it('renders span with d-i base class', () => {
    const el = icon('check');
    assert.equal(el.tagName, 'SPAN');
    assert.ok(el.className.includes('d-i'));
    assert.ok(el.className.includes('d-i-check'));
  });

  it('sets role and aria-hidden for accessibility', () => {
    const el = icon('star');
    assert.equal(el.getAttribute('role'), 'img');
    assert.equal(el.getAttribute('aria-hidden'), 'true');
  });

  it('applies custom size', () => {
    const el = icon('star', { size: '2rem' });
    assert.equal(el.style.width, '2rem');
    assert.equal(el.style.height, '2rem');
  });

  it('applies custom class', () => {
    const el = icon('check', { class: 'my-icon' });
    assert.ok(el.className.includes('my-icon'));
    assert.ok(el.className.includes('d-i'));
  });

  it('forwards extra attributes', () => {
    const el = icon('star', { 'aria-label': 'Star' });
    assert.equal(el.getAttribute('aria-label'), 'Star');
  });

  it('uses default size of 1.25em', () => {
    const el = icon('home');
    assert.equal(el.style.width, '1.25em');
    assert.equal(el.style.height, '1.25em');
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
  });

  it('handles reactive checked', () => {
    const [checked, setChecked] = createSignal(false);
    const el = Checkbox({ checked });
    assert.ok(!el.querySelector('input').checked);
    setChecked(true);
    assert.ok(el.querySelector('input').checked);
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
  it('renders track, thumb, and role="switch"', () => {
    const el = Switch({});
    assert.ok(el.className.includes('d-switch'));
    assert.ok(el.querySelector('.d-switch-track'));
    assert.ok(el.querySelector('.d-switch-thumb'));
    const input = el.querySelector('input');
    assert.equal(input.getAttribute('role'), 'switch');
  });

  it('sets aria-checked="false" by default', () => {
    const el = Switch({});
    assert.equal(el.querySelector('input').getAttribute('aria-checked'), 'false');
  });

  it('sets aria-checked="true" when checked', () => {
    const el = Switch({ checked: true });
    const input = el.querySelector('input');
    assert.ok(input.checked);
    assert.equal(input.getAttribute('aria-checked'), 'true');
  });

  it('handles reactive checked', () => {
    const [checked, setChecked] = createSignal(false);
    const el = Switch({ checked });
    const input = el.querySelector('input');
    assert.ok(!input.checked);
    assert.equal(input.getAttribute('aria-checked'), 'false');
    setChecked(true);
    assert.ok(input.checked);
    assert.equal(input.getAttribute('aria-checked'), 'true');
  });

  it('renders label', () => {
    const el = Switch({ label: 'Dark mode' });
    assert.ok(el.textContent.includes('Dark mode'));
    assert.ok(el.querySelector('.d-switch-label'));
  });

  it('applies size classes', () => {
    const xs = Switch({ size: 'xs' });
    assert.ok(xs.className.includes('d-switch-xs'));
    const sm = Switch({ size: 'sm' });
    assert.ok(sm.className.includes('d-switch-sm'));
    const lg = Switch({ size: 'lg' });
    assert.ok(lg.className.includes('d-switch-lg'));
  });

  it('handles static disabled', () => {
    const el = Switch({ disabled: true });
    assert.ok(el.querySelector('input').disabled);
    assert.ok(el.hasAttribute('data-disabled'));
  });

  it('handles reactive disabled', () => {
    const [disabled, setDisabled] = createSignal(false);
    const el = Switch({ disabled });
    assert.ok(!el.querySelector('input').disabled);
    setDisabled(true);
    assert.ok(el.querySelector('input').disabled);
    assert.ok(el.hasAttribute('data-disabled'));
  });

  it('handles static error', () => {
    const el = Switch({ error: true });
    assert.ok(el.hasAttribute('data-error'));
    assert.equal(el.querySelector('input').getAttribute('aria-invalid'), 'true');
  });

  it('handles reactive error', () => {
    const [error, setError] = createSignal(false);
    const el = Switch({ error });
    assert.ok(!el.hasAttribute('data-error'));
    setError(true);
    assert.ok(el.hasAttribute('data-error'));
    assert.equal(el.querySelector('input').getAttribute('aria-invalid'), 'true');
  });

  it('fires onchange with checked state', () => {
    let changed = null;
    const el = Switch({ onchange: (v) => { changed = v; } });
    const input = el.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    assert.equal(changed, true);
  });

  it('forwards aria-label to input', () => {
    const el = Switch({ 'aria-label': 'Toggle notifications' });
    assert.equal(el.querySelector('input').getAttribute('aria-label'), 'Toggle notifications');
  });

  it('forwards ref to input element', () => {
    let refEl = null;
    Switch({ ref: (el) => { refEl = el; } });
    assert.ok(refEl);
    assert.equal(refEl.tagName, 'INPUT');
  });

  it('sets name and required on input', () => {
    const el = Switch({ name: 'notifications', required: true });
    const input = el.querySelector('input');
    assert.equal(input.getAttribute('name'), 'notifications');
    assert.ok(input.hasAttribute('required'));
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
    { id: 'two', label: 'Tab 2', content: () => document.createTextNode('Content 2') },
    { id: 'three', label: 'Tab 3', content: () => document.createTextNode('Content 3') }
  ];

  it('renders tablist/tab/tabpanel roles with correct count', () => {
    const el = Tabs({ tabs: tabConfig });
    assert.ok(el.className.includes('d-tabs'));
    assert.ok(el.querySelector('[role="tablist"]'));
    const tabs = el.querySelectorAll('[role="tab"]');
    assert.equal(tabs.length, 3);
    assert.ok(el.querySelector('[role="tabpanel"]'));
  });

  it('has aria-controls and aria-labelledby cross-references', () => {
    const el = Tabs({ tabs: tabConfig });
    const tab = el.querySelector('[role="tab"]');
    const panelId = tab.getAttribute('aria-controls');
    assert.ok(panelId);
    const panel = el.querySelector('[role="tabpanel"]');
    assert.equal(panel.id, panelId);
    assert.equal(panel.getAttribute('aria-labelledby'), tab.id);
  });

  it('sets aria-orientation on tablist', () => {
    const el = Tabs({ tabs: tabConfig });
    assert.equal(el.querySelector('[role="tablist"]').getAttribute('aria-orientation'), 'horizontal');
  });

  it('shows first tab content by default', () => {
    const el = Tabs({ tabs: tabConfig });
    assert.ok(el.querySelector('[role="tabpanel"]').textContent.includes('Content 1'));
  });

  it('respects active prop', () => {
    const el = Tabs({ tabs: tabConfig, active: 'two' });
    const tabs = el.querySelectorAll('[role="tab"]');
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.ok(tabs[1].className.includes('d-tab-active'));
    assert.ok(el.querySelector('[role="tabpanel"]').textContent.includes('Content 2'));
  });

  it('switches tab on click and fires onchange', () => {
    let changed = null;
    const el = Tabs({ tabs: tabConfig, onchange: (id) => { changed = id; } });
    const tabs = el.querySelectorAll('[role="tab"]');
    tabs[1].click();
    assert.equal(changed, 'two');
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  });

  it('applies d-tabs-vertical and vertical aria-orientation', () => {
    const el = Tabs({ tabs: tabConfig, orientation: 'vertical' });
    assert.ok(el.className.includes('d-tabs-vertical'));
    assert.equal(el.querySelector('[role="tablist"]').getAttribute('aria-orientation'), 'vertical');
  });

  it('applies size classes', () => {
    const sm = Tabs({ tabs: tabConfig, size: 'sm' });
    assert.ok(sm.className.includes('d-tabs-sm'));
    const lg = Tabs({ tabs: tabConfig, size: 'lg' });
    assert.ok(lg.className.includes('d-tabs-lg'));
  });

  it('disables individual tabs', () => {
    const config = [
      { id: 'one', label: 'Tab 1', content: () => document.createTextNode('C1') },
      { id: 'two', label: 'Tab 2', content: () => document.createTextNode('C2'), disabled: true }
    ];
    let changed = null;
    const el = Tabs({ tabs: config, onchange: (id) => { changed = id; } });
    const tabs = el.querySelectorAll('[role="tab"]');
    assert.ok(tabs[1].disabled);
    tabs[1].click();
    assert.equal(changed, null); // click blocked
  });

  it('applies group disabled', () => {
    const el = Tabs({ tabs: tabConfig, disabled: true });
    assert.ok(el.hasAttribute('data-disabled'));
    const tabs = el.querySelectorAll('[role="tab"]');
    tabs.forEach(t => assert.ok(t.disabled));
  });

  it('renders closable tabs with close button and fires onclose', () => {
    const config = [
      { id: 'one', label: 'Tab 1', content: () => document.createTextNode('C1'), closable: true },
      { id: 'two', label: 'Tab 2', content: () => document.createTextNode('C2') }
    ];
    let closed = null;
    const el = Tabs({ tabs: config, onclose: (id) => { closed = id; } });
    const tab = el.querySelector('.d-tab-closable');
    assert.ok(tab);
    const closeBtn = tab.querySelector('.d-tab-close');
    assert.ok(closeBtn);
    closeBtn.click();
    assert.equal(closed, 'one');
  });

  it('destroyInactive=false keeps all panels in DOM', () => {
    const el = Tabs({ tabs: tabConfig, destroyInactive: false });
    const panels = el.querySelectorAll('[role="tabpanel"]');
    assert.equal(panels.length, 3);
    // First panel visible, others hidden
    assert.notEqual(panels[0].style.display, 'none');
    assert.equal(panels[1].style.display, 'none');
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

describe('Dropdown', () => {
  it('renders .d-dropdown with trigger having aria-haspopup="menu"', () => {
    const el = Dropdown({
      trigger: () => document.createElement('button'),
      items: [{ label: 'Edit' }, { label: 'Delete' }]
    });
    assert.ok(el.className.includes('d-dropdown'));
    const trig = el.querySelector('[aria-haspopup="menu"]');
    assert.ok(trig);
  });

  it('renders menu items on trigger click, including separators', () => {
    const btn = document.createElement('button');
    btn.textContent = 'Menu';
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'Copy' }, { separator: true }, { label: 'Paste' }]
    });
    document.body.appendChild(el);
    btn.click();
    const items = el.querySelectorAll('.d-dropdown-item');
    assert.equal(items.length, 2);
    assert.ok(el.querySelector('.d-dropdown-separator'));
    document.body.removeChild(el);
  });

  it('calls onclick with value and closes menu after item click', () => {
    let clicked = null;
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'Save', value: 'save', onclick: (v) => { clicked = v; } }]
    });
    document.body.appendChild(el);
    btn.click();
    assert.ok(el.classList.contains('d-dropdown-open'));
    el.querySelector('.d-dropdown-item').click();
    assert.equal(clicked, 'save');
    // Menu should close after selection
    assert.ok(!el.classList.contains('d-dropdown-open'));
    document.body.removeChild(el);
  });

  it('applies disabled class and blocks click on disabled items', () => {
    let clicked = false;
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'Locked', disabled: true, onclick: () => { clicked = true; } }]
    });
    document.body.appendChild(el);
    btn.click();
    const item = el.querySelector('.d-dropdown-item');
    assert.ok(item.className.includes('d-dropdown-item-disabled'));
    item.click();
    assert.equal(clicked, false);
    document.body.removeChild(el);
  });

  it('sets aria-expanded on trigger when opened/closed', () => {
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'A' }]
    });
    document.body.appendChild(el);
    assert.equal(btn.getAttribute('aria-expanded'), 'false');
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'true');
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'false');
    document.body.removeChild(el);
  });

  it('opens on ArrowDown keydown on trigger', () => {
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'First' }, { label: 'Second' }]
    });
    document.body.appendChild(el);
    const ev = new Event('keydown', { bubbles: true });
    ev.key = 'ArrowDown';
    btn.dispatchEvent(ev);
    assert.equal(btn.getAttribute('aria-expanded'), 'true');
    assert.ok(el.classList.contains('d-dropdown-open'));
    document.body.removeChild(el);
  });

  it('menu has role="menu" and items have role="menuitem"', () => {
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'A' }, { label: 'B' }]
    });
    document.body.appendChild(el);
    btn.click();
    const menu = el.querySelector('[role="menu"]');
    assert.ok(menu);
    const menuItems = el.querySelectorAll('[role="menuitem"]');
    assert.equal(menuItems.length, 2);
    document.body.removeChild(el);
  });

  it('closes on outside click', () => {
    const btn = document.createElement('button');
    const el = Dropdown({
      trigger: () => btn,
      items: [{ label: 'A' }]
    });
    document.body.appendChild(el);
    btn.click();
    assert.ok(el.classList.contains('d-dropdown-open'));
    // createOverlay closes on mousedown outside trigger+menu
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    const ev = new Event('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: outside });
    document.dispatchEvent(ev);
    assert.ok(!el.classList.contains('d-dropdown-open'));
    document.body.removeChild(outside);
    document.body.removeChild(el);
  });
});

describe('Drawer', () => {
  it('creates a drawer dialog element', () => {
    const [visible] = createSignal(false);
    const el = Drawer({ visible, title: 'Settings' }, document.createTextNode('Content'));
    assert.equal(el.tagName, 'DIALOG');
    assert.ok(el.querySelector('.d-drawer-panel'));
    assert.ok(el.querySelector('.d-drawer-title').textContent === 'Settings');
    assert.ok(el.querySelector('.d-drawer-body').textContent === 'Content');
  });

  it('applies side class', () => {
    const [visible] = createSignal(false);
    const el = Drawer({ visible, side: 'left' });
    assert.ok(el.querySelector('.d-drawer-left'));
  });

  it('opens when visible signal is true', () => {
    const [visible, setVisible] = createSignal(false);
    const el = Drawer({ visible });
    assert.equal(el.open, false);
    setVisible(true);
    assert.equal(el.open, true);
  });
});

describe('Pagination', () => {
  it('creates pagination navigation', () => {
    const el = Pagination({ total: 50, perPage: 10 });
    assert.equal(el.tagName, 'NAV');
    assert.ok(el.getAttribute('aria-label') === 'Pagination');
  });

  it('renders correct number of pages', () => {
    const el = Pagination({ total: 30, perPage: 10, current: 1 });
    const allBtns = el.querySelectorAll('.d-pagination-btn');
    // Filter out prev/next buttons
    const pageButtons = allBtns.filter(b =>
      !b.className.includes('d-pagination-prev') && !b.className.includes('d-pagination-next')
    );
    assert.equal(pageButtons.length, 3); // 1, 2, 3
  });

  it('marks current page as active', () => {
    const el = Pagination({ total: 50, perPage: 10, current: 2 });
    const active = el.querySelector('.d-pagination-active');
    assert.ok(active);
    assert.equal(active.textContent, '2');
  });

  it('calls onchange on page click', () => {
    let page = null;
    const el = Pagination({ total: 30, perPage: 10, current: 1, onchange: (p) => { page = p; } });
    const buttons = el.querySelectorAll('.d-pagination-btn');
    // Click page 2 (index: 0=prev, 1=page1, 2=page2, 3=page3, 4=next)
    buttons[2].click();
    assert.equal(page, 2);
  });
});

describe('RadioGroup', () => {
  const opts = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' }
  ];

  it('creates radio group with options', () => {
    const el = RadioGroup({ options: opts });
    assert.ok(el.className.includes('d-radiogroup'));
    const radios = el.querySelectorAll('.d-radio');
    assert.equal(radios.length, 3);
  });

  it('selects value', () => {
    const el = RadioGroup({ options: opts, value: 'b' });
    const radios = el.querySelectorAll('.d-radio');
    const checkedRadio = radios.find(r => r.querySelector('input').checked);
    assert.ok(checkedRadio);
    assert.ok(checkedRadio.textContent.includes('Option B'));
  });

  it('calls onchange', () => {
    let selected = null;
    const el = RadioGroup({ options: opts, onchange: (v) => { selected = v; } });
    // Find inputs inside each .d-radio wrapper
    const radios = el.querySelectorAll('.d-radio');
    const input = radios[1].querySelector('input');
    input.checked = true;
    input.dispatchEvent(new window.Event('change'));
    assert.equal(selected, 'b');
  });

  it('supports horizontal orientation', () => {
    const el = RadioGroup({ options: opts, orientation: 'horizontal' });
    assert.ok(el.className.includes('d-radiogroup-horizontal'));
  });
});

describe('Popover', () => {
  it('creates a popover with trigger', () => {
    const el = Popover({
      trigger: () => document.createElement('button')
    }, document.createTextNode('Popover content'));
    assert.ok(el.className.includes('d-popover'));
    assert.ok(el.querySelector('.d-popover-content'));
  });

  it('applies position class', () => {
    const el = Popover({
      trigger: () => document.createElement('button'),
      position: 'top'
    }, document.createTextNode('Content'));
    assert.ok(el.querySelector('.d-popover-top'));
  });

  it('toggles on trigger click', () => {
    const btn = document.createElement('button');
    const el = Popover({ trigger: () => btn }, document.createTextNode('Content'));
    document.body.appendChild(el);
    assert.equal(btn.getAttribute('aria-expanded'), 'false');
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'true');
    assert.ok(el.classList.contains('d-popover-open'));
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'false');
    document.body.removeChild(el);
  });
});

describe('Combobox', () => {
  const opts = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' }
  ];

  it('creates a combobox with input', () => {
    const el = Combobox({ options: opts, placeholder: 'Search fruit' });
    assert.ok(el.className.includes('d-combobox'));
    const input = el.querySelector('input');
    assert.ok(input);
    assert.equal(input.getAttribute('placeholder'), 'Search fruit');
  });

  it('shows selected value in input', () => {
    const el = Combobox({ options: opts, value: 'banana' });
    const input = el.querySelector('input');
    assert.equal(input.value, 'Banana');
  });

  it('applies error state', () => {
    const el = Combobox({ options: opts, error: true });
    assert.ok(el.className.includes('d-combobox-error'));
  });
});

describe('Slider', () => {
  it('creates a slider with track and thumb', () => {
    const el = Slider({ value: 50 });
    assert.ok(el.className.includes('d-slider'));
    assert.ok(el.querySelector('.d-slider-track'));
    assert.ok(el.querySelector('.d-slider-fill'));
    assert.ok(el.querySelector('.d-slider-thumb'));
  });

  it('sets initial value position', () => {
    const el = Slider({ value: 50, min: 0, max: 100 });
    const fill = el.querySelector('.d-slider-fill');
    assert.equal(fill.style.width, '50%');
    const thumb = el.querySelector('.d-slider-thumb');
    assert.equal(thumb.getAttribute('aria-valuenow'), '50');
  });

  it('handles reactive value', () => {
    const [val, setVal] = createSignal(25);
    const el = Slider({ value: val });
    assert.equal(el.querySelector('.d-slider-fill').style.width, '25%');
    setVal(75);
    assert.equal(el.querySelector('.d-slider-fill').style.width, '75%');
  });

  it('shows value label when showValue is true', () => {
    const el = Slider({ value: 42, showValue: true });
    const label = el.querySelector('.d-slider-value');
    assert.ok(label);
    assert.equal(label.textContent, '42');
  });

  it('respects min/max/step', () => {
    const el = Slider({ value: 50, min: 0, max: 100, step: 10 });
    const thumb = el.querySelector('.d-slider-thumb');
    assert.equal(thumb.getAttribute('aria-valuemin'), '0');
    assert.equal(thumb.getAttribute('aria-valuemax'), '100');
  });

  it('applies disabled state', () => {
    const el = Slider({ value: 50, disabled: true });
    assert.ok(el.className.includes('d-slider-disabled'));
  });
});

describe('InputGroup', () => {
  it('renders with d-input-group class and role=group', () => {
    const el = InputGroup({});
    assert.ok(el.className.includes('d-input-group'));
    assert.equal(el.getAttribute('role'), 'group');
  });

  it('applies vertical class', () => {
    const el = InputGroup({ vertical: true });
    assert.ok(el.className.includes('d-input-group-vertical'));
  });

  it('applies error state', () => {
    const el = InputGroup({ error: true });
    assert.ok(el.className.includes('d-input-group-error'));
  });

  it('applies disabled state', () => {
    const el = InputGroup({ disabled: true });
    assert.ok(el.hasAttribute('data-disabled'));
  });

  it('applies size class', () => {
    const el = InputGroup({ size: 'sm' });
    assert.ok(el.className.includes('d-input-group-sm'));
  });
});

describe('InputGroup.Addon', () => {
  it('renders with d-input-group-addon class', () => {
    const el = InputGroup.Addon('$');
    assert.ok(el.className.includes('d-input-group-addon'));
    assert.equal(el.textContent, '$');
  });

  it('accepts string shorthand', () => {
    const el = InputGroup.Addon('prefix');
    assert.equal(el.textContent, 'prefix');
  });

  it('accepts props object', () => {
    const el = InputGroup.Addon({ class: 'custom' }, 'text');
    assert.ok(el.className.includes('d-input-group-addon'));
    assert.ok(el.className.includes('custom'));
    assert.equal(el.textContent, 'text');
  });

  it('accepts null (empty addon)', () => {
    const el = InputGroup.Addon(null);
    assert.ok(el.className.includes('d-input-group-addon'));
  });
});

describe('CompactGroup', () => {
  it('renders with d-compact-group class and role=group', () => {
    const el = CompactGroup({});
    assert.ok(el.className.includes('d-compact-group'));
    assert.equal(el.getAttribute('role'), 'group');
  });

  it('applies custom class', () => {
    const el = CompactGroup({ class: 'my-group' });
    assert.ok(el.className.includes('d-compact-group'));
    assert.ok(el.className.includes('my-group'));
  });
});

describe('Spinner', () => {
  it('renders .d-spinner-wrap with role="status"', () => {
    const el = Spinner();
    assert.ok(el.className.includes('d-spinner-wrap'));
    assert.equal(el.getAttribute('role'), 'status');
  });

  it('default variant renders SVG ring with .d-spinner-arc', () => {
    const el = Spinner();
    const arc = el.querySelector('.d-spinner-arc');
    assert.ok(arc);
  });

  it('dots variant renders .d-spinner-dots', () => {
    const el = Spinner({ variant: 'dots' });
    assert.ok(el.querySelector('.d-spinner-dots'));
  });

  it('pulse variant renders .d-spinner-pulse', () => {
    const el = Spinner({ variant: 'pulse' });
    assert.ok(el.querySelector('.d-spinner-pulse'));
  });

  it('bars variant renders .d-spinner-bars', () => {
    const el = Spinner({ variant: 'bars' });
    assert.ok(el.querySelector('.d-spinner-bars'));
  });

  it('orbit variant renders .d-spinner-orbit', () => {
    const el = Spinner({ variant: 'orbit' });
    assert.ok(el.querySelector('.d-spinner-orbit'));
  });

  it('applies size class to wrapper', () => {
    const el = Spinner({ size: 'lg' });
    assert.ok(el.className.includes('d-spinner-lg'));
  });

  it('applies color class to wrapper', () => {
    const el = Spinner({ color: 'primary' });
    assert.ok(el.className.includes('d-spinner-primary'));
  });

  it('uses custom aria-label', () => {
    const el = Spinner({ label: 'Processing' });
    assert.equal(el.getAttribute('aria-label'), 'Processing');
  });

  it('includes screen reader text', () => {
    const el = Spinner({ label: 'Saving' });
    const sr = el.querySelector('.d-sr-only');
    assert.ok(sr);
    assert.equal(sr.textContent, 'Saving');
  });

  it('SVG does not have duplicate role="status"', () => {
    const el = Spinner();
    const svg = el.querySelector('svg');
    assert.ok(svg);
    assert.notEqual(svg.getAttribute('role'), 'status');
  });
});
