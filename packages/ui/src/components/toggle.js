/**
 * Toggle — A pressable button with on/off state.
 * Uses aria-pressed for accessibility. Supports reactive pressed state.
 *
 * @module decantr/components/toggle
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';
import { createRovingTabindex } from './_behaviors.js';

const { div, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.pressed=false] - Pressed state (static or signal getter)
 * @param {string} [props.variant] - default|outline
 * @param {string} [props.size] - xs|sm|lg
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange] - Called with new pressed state
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Toggle(props = {}, ...children) {
  injectBase();

  const { pressed = false, variant, size, disabled, onchange, class: cls, ...rest } = props;

  const className = cx(
    'd-toggle',
    variant && `d-toggle-${variant}`,
    size && `d-toggle-${size}`,
    cls
  );

  let _pressed = typeof pressed === 'function' ? pressed() : pressed;

  const el = buttonTag({
    type: 'button',
    class: className,
    role: 'button',
    'aria-pressed': String(_pressed),
    ...rest
  }, ...children);

  el.addEventListener('click', () => {
    _pressed = !_pressed;
    el.setAttribute('aria-pressed', String(_pressed));
    if (onchange) onchange(_pressed);
  });

  reactiveAttr(el, disabled, 'disabled');

  if (typeof pressed === 'function') {
    createEffect(() => {
      _pressed = pressed();
      el.setAttribute('aria-pressed', String(_pressed));
    });
  }

  return el;
}

/**
 * ToggleGroup — A group of toggles, single or multi-select.
 * Features a sliding indicator for single-select mode.
 * Uses createRovingTabindex for keyboard navigation.
 *
 * @param {Object} [props]
 * @param {{ value: string, label?: string, icon?: string|Node, disabled?: boolean }[]} [props.items]
 * @param {string|string[]|Function} [props.value] - Selected value(s)
 * @param {'single'|'multiple'} [props.type='single']
 * @param {boolean} [props.multiple] - Alias for type='multiple'
 * @param {string} [props.variant]
 * @param {string} [props.size] - sm|lg
 * @param {boolean} [props.block=false] - Full-width layout
 * @param {boolean|Function} [props.disabled] - Group-level disabled
 * @param {Function} [props.onchange] - Called with new value(s)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ToggleGroup(props = {}) {
  injectBase();

  const { items = [], value, type, multiple, variant, size, block, disabled, onchange, 'aria-label': ariaLabel, class: cls } = props;

  const isMulti = multiple || type === 'multiple';
  const isSingle = !isMulti;

  let current = typeof value === 'function' ? value() : (value || (isMulti ? [] : ''));

  // Single-select uses radiogroup/radio; multi-select uses group/button+aria-pressed
  const groupAttrs = {
    class: cx('d-toggle-group', size && `d-toggle-group-${size}`, block && 'd-toggle-group-block', cls),
    role: isSingle ? 'radiogroup' : 'group'
  };
  if (ariaLabel) groupAttrs['aria-label'] = ariaLabel;
  const group = div(groupAttrs);

  // Sliding indicator for single-select
  let indicator = null;
  if (isSingle) {
    indicator = div({ class: 'd-toggle-indicator' });
    indicator.style.opacity = '0';
    group.appendChild(indicator);
  }

  let _rafId = null;
  const rAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => { fn(); return 0; };
  const cAF = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : () => {};

  function isSelected(val) {
    return isMulti ? current.includes(val) : current === val;
  }

  function select(val) {
    if (isMulti) {
      current = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    } else {
      current = current === val ? '' : val;
    }
    updateAll();
    if (onchange) onchange(current);
  }

  const buttons = items.map(item => {
    const content = item.icon
      ? (typeof item.icon === 'string' ? item.icon : item.icon)
      : (item.label || item.value);

    const ariaAttrs = isSingle
      ? { role: 'radio', 'aria-checked': String(isSelected(item.value)) }
      : { role: 'button', 'aria-pressed': String(isSelected(item.value)) };

    const btn = buttonTag({
      type: 'button',
      class: cx('d-toggle', variant && `d-toggle-${variant}`),
      'aria-label': item.label || item.value,
      disabled: item.disabled ? '' : undefined,
      ...ariaAttrs
    }, content);

    btn.addEventListener('click', () => {
      if (!item.disabled) select(item.value);
    });

    group.appendChild(btn);
    return { btn, value: item.value };
  });

  function positionIndicator() {
    if (!indicator) return;
    const selected = buttons.find(b => isSelected(b.value));
    if (selected) {
      const btn = selected.btn;
      const pad = typeof getComputedStyle === 'function'
        ? (parseFloat(getComputedStyle(group).paddingLeft) || 0)
        : 0;
      indicator.style.transform = `translateX(${btn.offsetLeft - pad}px)`;
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.opacity = '1';
    } else {
      indicator.style.opacity = '0';
    }
  }

  function updateAll() {
    const attr = isSingle ? 'aria-checked' : 'aria-pressed';
    buttons.forEach(({ btn, value: v }) => {
      btn.setAttribute(attr, String(isSelected(v)));
    });
    if (_rafId) cAF(_rafId);
    _rafId = rAF(positionIndicator);
  }

  // Roving tabindex — single mode auto-selects on focus; multi mode focus-only
  const roving = createRovingTabindex(group, {
    itemSelector: '.d-toggle:not([disabled])',
    orientation: 'horizontal',
    onFocus: isSingle ? (el) => el.click() : undefined
  });

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      updateAll();
    });
  }

  // Reactive group-level disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      group.toggleAttribute('data-disabled', v);
      group.setAttribute('aria-disabled', v ? 'true' : 'false');
      buttons.forEach(({ btn }) => { btn.disabled = v; });
    });
  } else if (disabled) {
    group.setAttribute('data-disabled', '');
    group.setAttribute('aria-disabled', 'true');
    buttons.forEach(({ btn }) => { btn.disabled = true; });
  }

  // Initial indicator position after mount
  _rafId = rAF(positionIndicator);

  // Cleanup
  onDestroy(() => {
    roving.destroy();
    if (_rafId) cAF(_rafId);
  });

  return group;
}
