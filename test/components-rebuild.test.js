/**
 * Test suite for v0.5.0 component rebuild.
 * Verifies tags usage, .d-field class, variant/size/error/success,
 * ARIA attributes, keyboard nav, and cleanup.
 */
import { describe, it, before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

async function importComponents() {
  const { resetBase } = await import('../src/components/_base.js');
  resetBase();
  return {
    Input: (await import('../src/components/input.js')).Input,
    Textarea: (await import('../src/components/textarea.js')).Textarea,
    Checkbox: (await import('../src/components/checkbox.js')).Checkbox,
    Switch: (await import('../src/components/switch.js')).Switch,
    InputNumber: (await import('../src/components/input-number.js')).InputNumber,
    InputOTP: (await import('../src/components/input-otp.js')).InputOTP,
    RadioGroup: (await import('../src/components/radiogroup.js')).RadioGroup,
    Slider: (await import('../src/components/slider.js')).Slider,
    Select: (await import('../src/components/select.js')).Select,
    Combobox: (await import('../src/components/combobox.js')).Combobox,
    Accordion: (await import('../src/components/accordion.js')).Accordion,
    Segmented: (await import('../src/components/segmented.js')).Segmented,
    Pagination: (await import('../src/components/pagination.js')).Pagination,
    ContextMenu: (await import('../src/components/context-menu.js')).ContextMenu,
    DatePicker: (await import('../src/components/date-picker.js')).DatePicker,
    TimePicker: (await import('../src/components/time-picker.js')).TimePicker,
    DateRangePicker: (await import('../src/components/date-range-picker.js')).DateRangePicker,
    TimeRangePicker: (await import('../src/components/time-range-picker.js')).TimeRangePicker,
    Cascader: (await import('../src/components/cascader.js')).Cascader,
    TreeSelect: (await import('../src/components/tree-select.js')).TreeSelect,
    Mentions: (await import('../src/components/mentions.js')).Mentions,
    ColorPicker: (await import('../src/components/color-picker.js')).ColorPicker,
    DataTable: (await import('../src/components/data-table.js')).DataTable,
    Rate: (await import('../src/components/rate.js')).Rate,
  };
}

// ═══════════════════════════════════════════════════════════════
// _PRIMITIVES
// ═══════════════════════════════════════════════════════════════

describe('_primitives', () => {
  it('applyFieldState adds d-field class', async () => {
    const { applyFieldState } = await import('../src/components/_primitives.js');
    const el = document.createElement('div');
    applyFieldState(el, { variant: 'filled', size: 'sm' });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.classList.contains('d-field-filled'));
    assert.ok(el.classList.contains('d-field-sm'));
  });

  it('applyFieldState sets data-error attribute', async () => {
    const { applyFieldState } = await import('../src/components/_primitives.js');
    const el = document.createElement('div');
    applyFieldState(el, { error: 'Something went wrong' });
    assert.ok(el.classList.contains('d-field'));
    assert.equal(el.getAttribute('data-error'), 'Something went wrong');
  });

  it('applyFieldState sets data-success attribute', async () => {
    const { applyFieldState } = await import('../src/components/_primitives.js');
    const el = document.createElement('div');
    applyFieldState(el, { success: true });
    assert.equal(el.getAttribute('data-success'), '');
  });

  it('applyFieldState sets data-disabled attribute', async () => {
    const { applyFieldState } = await import('../src/components/_primitives.js');
    const el = document.createElement('div');
    applyFieldState(el, { disabled: true });
    assert.equal(el.getAttribute('data-disabled'), '');
  });

  it('hexToOklch and oklchToHex round-trip', async () => {
    const { hexToOklch, oklchToHex } = await import('../src/components/_primitives.js');
    const hex = '#ff6600';
    const oklch = hexToOklch(hex);
    assert.ok(oklch.l > 0 && oklch.l < 1, 'lightness in range');
    assert.ok(oklch.c >= 0, 'chroma non-negative');
    assert.ok(oklch.h >= 0 && oklch.h <= 360, 'hue in range');
    // Round-trip should be close
    const back = oklchToHex(oklch.l, oklch.c, oklch.h);
    assert.ok(back.startsWith('#'), 'returns hex');
    assert.equal(back.length, 7, 'hex length');
  });

  it('renderCalendar returns element with grid', async () => {
    const { renderCalendar } = await import('../src/components/_primitives.js');
    const el = renderCalendar({
      viewDate: new Date(2026, 2, 1),
      onSelect: () => {},
      onNav: () => {}
    });
    assert.ok(el);
    assert.ok(el.querySelector('[role="grid"]'));
    assert.ok(el.querySelectorAll('.d-datepicker-day').length > 0);
  });

  it('renderTimeColumns returns element with columns', async () => {
    // Polyfill requestAnimationFrame for test DOM
    if (typeof globalThis.requestAnimationFrame === 'undefined') {
      globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
    }
    const { renderTimeColumns } = await import('../src/components/_primitives.js');
    const el = renderTimeColumns({
      hours: 10,
      minutes: 30,
      onChange: () => {}
    });
    assert.ok(el);
    assert.ok(el.querySelectorAll('.d-timepicker-column').length >= 2);
  });

  it('renderMenuItems populates container', async () => {
    const { renderMenuItems } = await import('../src/components/_primitives.js');
    const container = document.createElement('div');
    renderMenuItems(container, [
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { separator: true },
      { label: 'Paste' },
    ]);
    assert.equal(container.querySelectorAll('[role="menuitem"]').length, 2);
    assert.equal(container.querySelectorAll('[role="separator"]').length, 1);
  });
});

// ═══════════════════════════════════════════════════════════════
// _BEHAVIORS createFormField
// ═══════════════════════════════════════════════════════════════

describe('createFormField (d-form-field wrapper)', () => {
  it('uses d-form-field class (not d-field)', async () => {
    const { createFormField } = await import('../src/components/_behaviors.js');
    const control = document.createElement('input');
    const result = createFormField(control, { label: 'Name' });
    assert.ok(result.wrapper.classList.contains('d-form-field'));
    assert.ok(!result.wrapper.classList.contains('d-field'));
  });

  it('returns setError and setSuccess functions', async () => {
    const { createFormField } = await import('../src/components/_behaviors.js');
    const control = document.createElement('input');
    const result = createFormField(control, { label: 'Email' });
    assert.equal(typeof result.setError, 'function');
    assert.equal(typeof result.setSuccess, 'function');
    assert.equal(typeof result.destroy, 'function');
  });

  it('renders label and help text', async () => {
    const { createFormField } = await import('../src/components/_behaviors.js');
    const control = document.createElement('input');
    const result = createFormField(control, { label: 'Username', help: 'Enter your username', required: true });
    assert.ok(result.wrapper.querySelector('.d-form-field-label'));
    assert.ok(result.wrapper.querySelector('.d-form-field-help'));
    assert.ok(result.wrapper.querySelector('.d-form-field-required'));
  });
});

// ═══════════════════════════════════════════════════════════════
// SIMPLE FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════

describe('Input', () => {
  it('renders with d-field class', async () => {
    const { Input } = await importComponents();
    const el = Input({ placeholder: 'Type here' });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('input'));
  });

  it('applies variant class', async () => {
    const { Input } = await importComponents();
    const el = Input({ variant: 'filled' });
    assert.ok(el.classList.contains('d-field-filled'));
  });

  it('applies size class', async () => {
    const { Input } = await importComponents();
    const el = Input({ size: 'sm' });
    assert.ok(el.classList.contains('d-field-sm'));
  });

  it('sets data-error on error', async () => {
    const { Input } = await importComponents();
    const el = Input({ error: true });
    assert.ok(el.hasAttribute('data-error'));
  });

  it('sets data-success on success', async () => {
    const { Input } = await importComponents();
    const el = Input({ success: true });
    assert.ok(el.hasAttribute('data-success'));
  });

  it('wraps with createFormField when label provided', async () => {
    const { Input } = await importComponents();
    const el = Input({ label: 'Email', help: 'Enter email' });
    assert.ok(el.classList.contains('d-form-field'));
    assert.ok(el.querySelector('.d-form-field-label'));
  });

  it('passes aria-label to input', async () => {
    const { Input } = await importComponents();
    const el = Input({ 'aria-label': 'Search' });
    assert.equal(el.querySelector('input').getAttribute('aria-label'), 'Search');
  });

  it('renders prefix and suffix', async () => {
    const { Input } = await importComponents();
    const el = Input({ prefix: '$', suffix: 'USD' });
    assert.ok(el.querySelector('.d-input-prefix'));
    assert.ok(el.querySelector('.d-input-suffix'));
  });
});

describe('Textarea', () => {
  it('renders with d-field class', async () => {
    const { Textarea } = await importComponents();
    const el = Textarea();
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('textarea'));
  });

  it('applies variant and size', async () => {
    const { Textarea } = await importComponents();
    const el = Textarea({ variant: 'ghost', size: 'lg' });
    assert.ok(el.classList.contains('d-field-ghost'));
    assert.ok(el.classList.contains('d-field-lg'));
  });
});

describe('Checkbox', () => {
  it('renders checkbox with label', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ label: 'Accept terms' });
    assert.ok(el.querySelector('.d-checkbox-native'));
    assert.ok(el.querySelector('.d-checkbox-label'));
  });

  it('supports error attribute', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ error: true });
    assert.ok(el.hasAttribute('data-error'));
    assert.equal(el.querySelector('input').getAttribute('aria-invalid'), 'true');
  });

  it('supports aria-label', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ 'aria-label': 'Toggle notifications' });
    assert.equal(el.querySelector('input').getAttribute('aria-label'), 'Toggle notifications');
  });
});

describe('Switch', () => {
  it('renders switch with role', async () => {
    const { Switch } = await importComponents();
    const el = Switch({ label: 'Dark mode' });
    assert.ok(el.querySelector('[role="switch"]'));
    assert.ok(el.querySelector('.d-switch-label'));
  });

  it('supports error and aria-label', async () => {
    const { Switch } = await importComponents();
    const el = Switch({ error: true, 'aria-label': 'Enable feature' });
    assert.ok(el.hasAttribute('data-error'));
    assert.equal(el.querySelector('input').getAttribute('aria-label'), 'Enable feature');
  });

  it('sets aria-checked', async () => {
    const { Switch } = await importComponents();
    const el = Switch({ checked: true });
    assert.equal(el.querySelector('input').getAttribute('aria-checked'), 'true');
  });
});

describe('InputNumber', () => {
  it('renders with d-field class and spinbutton role', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5 });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[role="spinbutton"]'));
  });

  it('renders increment/decrement buttons', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5 });
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    assert.equal(buttons.length, 2);
  });

  it('applies variant and size', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ variant: 'filled', size: 'sm' });
    assert.ok(el.classList.contains('d-field-filled'));
    assert.ok(el.classList.contains('d-field-sm'));
  });

  it('inc button click increments value', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5, step: 1 });
    const input = el.querySelector('[role="spinbutton"]');
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    buttons[1].dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(input.value, '6');
    assert.equal(input.getAttribute('aria-valuenow'), '6');
  });

  it('dec button click decrements value', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 10, step: 2 });
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    buttons[0].dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(el.querySelector('[role="spinbutton"]').value, '8');
  });

  it('dec button disabled at min boundary', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 0, min: 0 });
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    assert.ok(buttons[0].hasAttribute('disabled'));
  });

  it('buttons disabled when parent disabled (static)', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5, disabled: true });
    const input = el.querySelector('[role="spinbutton"]');
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    assert.ok(input.disabled);
    assert.ok(buttons[0].hasAttribute('disabled'));
    assert.ok(buttons[1].hasAttribute('disabled'));
  });

  it('buttons disabled when parent disabled (reactive)', async () => {
    const { createSignal } = await import('../src/state/index.js');
    const { InputNumber } = await importComponents();
    const [dis, setDis] = createSignal(false);
    const el = InputNumber({ value: 5, disabled: dis });
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    assert.ok(!buttons[0].hasAttribute('disabled'));
    assert.ok(!buttons[1].hasAttribute('disabled'));
    setDis(true);
    const input = el.querySelector('[role="spinbutton"]');
    assert.ok(input.disabled);
    assert.ok(buttons[0].hasAttribute('disabled'));
    assert.ok(buttons[1].hasAttribute('disabled'));
  });

  it('error state sets data-error', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5, error: true });
    assert.ok(el.hasAttribute('data-error'));
  });

  it('ArrowUp/ArrowDown keyboard changes value', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 5 });
    const input = el.querySelector('[role="spinbutton"]');
    const upEvent = new Event('keydown', { bubbles: true, cancelable: true });
    upEvent.key = 'ArrowUp';
    input.dispatchEvent(upEvent);
    assert.equal(input.getAttribute('aria-valuenow'), '6');
    const downEvent = new Event('keydown', { bubbles: true, cancelable: true });
    downEvent.key = 'ArrowDown';
    input.dispatchEvent(downEvent);
    assert.equal(input.getAttribute('aria-valuenow'), '5');
  });

  it('label/help wraps with createFormField', async () => {
    const { InputNumber } = await importComponents();
    const el = InputNumber({ value: 0, label: 'Quantity', help: 'Enter amount' });
    assert.ok(el.classList.contains('d-form-field'));
    assert.ok(el.querySelector('.d-form-field-label'));
  });

  it('fires onchange callback', async () => {
    const { InputNumber } = await importComponents();
    let received = null;
    const el = InputNumber({ value: 10, onchange: (v) => { received = v; } });
    const buttons = el.querySelectorAll('.d-inputnumber-step');
    buttons[1].dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(received, 11);
  });
});

describe('InputOTP', () => {
  it('renders correct number of slots', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4 });
    assert.equal(el.querySelectorAll('.d-otp-slot').length, 4);
  });

  it('renders separators', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 6, separator: 3 });
    assert.ok(el.querySelector('.d-otp-separator'));
  });

  it('slots have d-field class', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4 });
    const slots = el.querySelectorAll('.d-otp-slot');
    slots.forEach(s => assert.ok(s.classList.contains('d-field')));
  });

  it('supports aria-label', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ 'aria-label': 'Verification code' });
    assert.equal(el.getAttribute('aria-label'), 'Verification code');
  });

  it('disables all slots (static)', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, disabled: true });
    const slots = el.querySelectorAll('.d-otp-slot');
    slots.forEach(s => assert.ok(s.disabled));
  });

  it('disables all slots (reactive)', async () => {
    const { createSignal } = await import('../src/state/index.js');
    const { InputOTP } = await importComponents();
    const [dis, setDis] = createSignal(false);
    const el = InputOTP({ length: 4, disabled: dis });
    const slots = el.querySelectorAll('.d-otp-slot');
    slots.forEach(s => assert.ok(!s.disabled));
    setDis(true);
    slots.forEach(s => assert.ok(s.disabled));
  });

  it('data-error on container and slots (static)', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, error: true });
    assert.ok(el.hasAttribute('data-error'));
    const slots = el.querySelectorAll('.d-otp-slot');
    slots.forEach(s => assert.ok(s.hasAttribute('data-error')));
  });

  it('aria-invalid when error (static)', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, error: true });
    assert.equal(el.getAttribute('aria-invalid'), 'true');
  });

  it('aria-invalid when error (reactive)', async () => {
    const { createSignal } = await import('../src/state/index.js');
    const { InputOTP } = await importComponents();
    const [err, setErr] = createSignal(false);
    const el = InputOTP({ length: 4, error: err });
    assert.equal(el.getAttribute('aria-invalid'), 'false');
    setErr(true);
    assert.equal(el.getAttribute('aria-invalid'), 'true');
  });

  it('masked mode sets type=password', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, masked: true });
    const slots = el.querySelectorAll('.d-otp-slot');
    slots.forEach(s => assert.equal(s.getAttribute('type'), 'password'));
  });

  it('initial value populates slots', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, value: '1234' });
    const slots = el.querySelectorAll('.d-otp-slot');
    assert.equal(slots[0].value, '1');
    assert.equal(slots[1].value, '2');
    assert.equal(slots[2].value, '3');
    assert.equal(slots[3].value, '4');
  });

  it('size class applied', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, size: 'sm' });
    assert.ok(el.classList.contains('d-otp-sm'));
  });

  it('label/help wraps with createFormField', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, label: 'Code', help: 'Enter OTP' });
    assert.ok(el.classList.contains('d-form-field'));
    assert.ok(el.querySelector('.d-form-field-label'));
  });

  it('success state sets data-success', async () => {
    const { InputOTP } = await importComponents();
    const el = InputOTP({ length: 4, success: true });
    assert.ok(el.hasAttribute('data-success'));
  });
});

// ═══════════════════════════════════════════════════════════════
// COMPLEX FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════

describe('RadioGroup', () => {
  const opts = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' }
  ];

  it('renders radiogroup with options', async () => {
    const { RadioGroup } = await importComponents();
    const el = RadioGroup({ options: opts });
    assert.equal(el.getAttribute('role'), 'radiogroup');
    assert.equal(el.querySelectorAll('.d-radio').length, 3);
  });

  it('marks error state', async () => {
    const { RadioGroup } = await importComponents();
    const el = RadioGroup({ options: opts, error: true });
    assert.ok(el.hasAttribute('data-error'));
  });

  it('supports aria-label', async () => {
    const { RadioGroup } = await importComponents();
    const el = RadioGroup({ options: opts, 'aria-label': 'Choose option' });
    assert.equal(el.getAttribute('aria-label'), 'Choose option');
  });
});

describe('Slider', () => {
  it('renders slider with ARIA attributes', async () => {
    const { Slider } = await importComponents();
    const el = Slider({ value: 50, min: 0, max: 100 });
    const thumb = el.querySelector('[role="slider"]');
    assert.ok(thumb);
    assert.equal(thumb.getAttribute('aria-valuenow'), '50');
    assert.equal(thumb.getAttribute('aria-valuemin'), '0');
    assert.equal(thumb.getAttribute('aria-valuemax'), '100');
  });
});

describe('Select', () => {
  const opts = [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
    { value: '3', label: 'Three' }
  ];

  it('renders with d-field class', async () => {
    const { Select } = await importComponents();
    const el = Select({ options: opts });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[role="combobox"]'));
  });

  it('applies variant and size', async () => {
    const { Select } = await importComponents();
    const el = Select({ options: opts, variant: 'ghost', size: 'lg' });
    assert.ok(el.classList.contains('d-field-ghost'));
    assert.ok(el.classList.contains('d-field-lg'));
  });

  it('wraps with createFormField when label provided', async () => {
    const { Select } = await importComponents();
    const el = Select({ options: opts, label: 'Country' });
    assert.ok(el.classList.contains('d-form-field'));
  });
});

describe('Combobox', () => {
  const opts = [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' }
  ];

  it('renders with d-field class', async () => {
    const { Combobox } = await importComponents();
    const el = Combobox({ options: opts });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[role="combobox"]'));
  });
});

// ═══════════════════════════════════════════════════════════════
// HIERARCHICAL + COLOR
// ═══════════════════════════════════════════════════════════════

describe('Cascader', () => {
  const opts = [
    { value: 'a', label: 'A', children: [
      { value: 'a1', label: 'A1' },
      { value: 'a2', label: 'A2' }
    ]},
    { value: 'b', label: 'B' }
  ];

  it('renders with d-field class', async () => {
    const { Cascader } = await importComponents();
    const el = Cascader({ options: opts });
    assert.ok(el.classList.contains('d-field'));
  });
});

describe('TreeSelect', () => {
  const opts = [
    { value: 'root', label: 'Root', children: [
      { value: 'child1', label: 'Child 1' }
    ]}
  ];

  it('renders with d-field class', async () => {
    const { TreeSelect } = await importComponents();
    const el = TreeSelect({ options: opts });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[aria-haspopup]'));
  });
});

describe('ColorPicker', () => {
  it('renders with d-field class', async () => {
    const { ColorPicker } = await importComponents();
    const el = ColorPicker({ value: '#ff0000' });
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('.d-colorpicker-trigger'));
  });
});

describe('Mentions', () => {
  const opts = [
    { value: 'john', label: 'John' },
    { value: 'jane', label: 'Jane' }
  ];

  it('renders textarea with d-field on wrapper', async () => {
    const { Mentions } = await importComponents();
    const el = Mentions({ options: opts });
    assert.ok(el.querySelector('textarea'));
    // The textarea wrapper div should have d-field
    const textWrap = el.querySelector('.d-textarea-wrap');
    assert.ok(textWrap);
    assert.ok(textWrap.classList.contains('d-field'));
  });
});

// ═══════════════════════════════════════════════════════════════
// DATE/TIME
// ═══════════════════════════════════════════════════════════════

describe('DatePicker', () => {
  it('renders with d-field class', async () => {
    const { DatePicker } = await importComponents();
    const el = DatePicker();
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[aria-haspopup="dialog"]'));
  });

  it('applies variant and size', async () => {
    const { DatePicker } = await importComponents();
    const el = DatePicker({ variant: 'filled', size: 'sm' });
    assert.ok(el.classList.contains('d-field-filled'));
    assert.ok(el.classList.contains('d-field-sm'));
  });
});

describe('DateRangePicker', () => {
  it('renders with d-field class', async () => {
    const { DateRangePicker } = await importComponents();
    const el = DateRangePicker();
    assert.ok(el.classList.contains('d-field'));
  });
});

describe('TimePicker', () => {
  it('renders with d-field class', async () => {
    const { TimePicker } = await importComponents();
    const el = TimePicker();
    assert.ok(el.classList.contains('d-field'));
    assert.ok(el.querySelector('[aria-haspopup="dialog"]'));
  });
});

describe('TimeRangePicker', () => {
  it('renders with d-field class', async () => {
    const { TimeRangePicker } = await importComponents();
    const el = TimeRangePicker();
    assert.ok(el.classList.contains('d-field'));
  });
});

// ═══════════════════════════════════════════════════════════════
// NON-FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════

describe('Accordion', () => {
  it('renders with proper ARIA', async () => {
    const { Accordion } = await importComponents();
    const el = Accordion({
      items: [
        { id: '1', title: 'Section 1', content: () => 'Content 1' },
        { id: '2', title: 'Section 2', content: () => 'Content 2' },
      ]
    });
    assert.ok(el.classList.contains('d-accordion'));
    const triggers = el.querySelectorAll('.d-accordion-trigger');
    assert.equal(triggers.length, 2);
    triggers.forEach(t => assert.equal(t.getAttribute('aria-expanded'), 'false'));
  });

  it('opens defaultOpen items', async () => {
    const { Accordion } = await importComponents();
    const el = Accordion({
      items: [
        { id: '1', title: 'S1', content: () => 'C1' },
        { id: '2', title: 'S2', content: () => 'C2' },
      ],
      defaultOpen: ['1']
    });
    const triggers = el.querySelectorAll('.d-accordion-trigger');
    assert.equal(triggers[0].getAttribute('aria-expanded'), 'true');
    assert.equal(triggers[1].getAttribute('aria-expanded'), 'false');
  });
});

describe('Segmented', () => {
  it('renders radiogroup with options', async () => {
    const { Segmented } = await importComponents();
    const el = Segmented({
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]
    });
    assert.equal(el.getAttribute('role'), 'radiogroup');
    assert.equal(el.querySelectorAll('[role="radio"]').length, 2);
  });
});

describe('Pagination', () => {
  it('renders navigation with buttons', async () => {
    const { Pagination } = await importComponents();
    const el = Pagination({ total: 100, perPage: 10, current: 1 });
    assert.equal(el.getAttribute('aria-label'), 'Pagination');
    assert.ok(el.querySelector('.d-pagination-prev'));
    assert.ok(el.querySelector('.d-pagination-next'));
  });

  it('disables prev on first page', async () => {
    const { Pagination } = await importComponents();
    const el = Pagination({ total: 100, perPage: 10, current: 1 });
    assert.ok(el.querySelector('.d-pagination-prev').hasAttribute('disabled'));
  });
});

describe('ContextMenu', () => {
  it('renders menu with role', async () => {
    const { ContextMenu } = await importComponents();
    const target = document.createElement('div');
    document.body.appendChild(target);
    const el = ContextMenu({
      target,
      items: [
        { label: 'Cut' },
        { label: 'Copy' },
      ]
    });
    assert.equal(el.getAttribute('role'), 'menu');
    target.remove();
    el.remove();
  });
});

describe('DataTable', () => {
  it('renders grid with columns', async () => {
    const { DataTable } = await importComponents();
    const el = DataTable({
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
      ],
      data: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]
    });
    assert.equal(el.getAttribute('role'), 'region');
    assert.ok(el.querySelector('[role="grid"]'));
    assert.ok(el.querySelectorAll('.d-datatable-th').length >= 2);
  });
});

// ═══════════════════════════════════════════════════════════════
// RATE
// ═══════════════════════════════════════════════════════════════

describe('Rate', () => {
  it('renders with radiogroup role', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ value: 3 });
    assert.equal(el.getAttribute('role'), 'radiogroup');
    assert.equal(el.querySelectorAll('.d-rate-star').length, 5);
  });

  it('supports aria-label override', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ 'aria-label': 'Product rating' });
    assert.equal(el.getAttribute('aria-label'), 'Product rating');
  });

  it('error state sets data-error', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ value: 1, error: true });
    assert.ok(el.hasAttribute('data-error'));
    assert.equal(el.getAttribute('aria-invalid'), 'true');
  });

  it('success state sets data-success', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ value: 5, success: true });
    assert.ok(el.hasAttribute('data-success'));
  });

  it('sets aria-disabled', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ value: 3, disabled: true });
    assert.equal(el.getAttribute('aria-disabled'), 'true');
  });

  it('label/help wraps with createFormField', async () => {
    const { Rate } = await importComponents();
    const el = Rate({ value: 3, label: 'Rating', help: 'Select stars' });
    assert.ok(el.classList.contains('d-form-field'));
    assert.ok(el.querySelector('.d-form-field-label'));
    assert.ok(el.querySelector('.d-form-field-help'));
  });

  it('keyboard ArrowRight changes value', async () => {
    const { Rate } = await importComponents();
    let received = null;
    const el = Rate({ value: 2, onchange: (v) => { received = v; } });
    const stars = el.querySelectorAll('.d-rate-star');
    // Polyfill focus() for test DOM
    stars.forEach(s => { if (!s.focus) s.focus = () => {}; });
    const event = new Event('keydown', { bubbles: true, cancelable: true });
    event.key = 'ArrowRight';
    stars[1].dispatchEvent(event);
    assert.equal(received, 3);
  });

  it('disabled prevents click', async () => {
    const { Rate } = await importComponents();
    let received = null;
    const el = Rate({ value: 2, disabled: true, onchange: (v) => { received = v; } });
    const stars = el.querySelectorAll('.d-rate-star');
    stars[3].dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(received, null);
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECKBOX (additional tests)
// ═══════════════════════════════════════════════════════════════

describe('Checkbox (extended)', () => {
  it('success state sets data-success', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ label: 'Agree', success: true });
    assert.ok(el.hasAttribute('data-success'));
  });

  it('wraps with createFormField when help provided', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ label: 'Accept', help: 'Required to continue' });
    assert.ok(el.classList.contains('d-form-field'));
    assert.ok(el.querySelector('.d-form-field-help'));
  });

  it('sets required on input', async () => {
    const { Checkbox } = await importComponents();
    const el = Checkbox({ label: 'Terms', required: true });
    assert.ok(el.querySelector('input').required);
  });
});
