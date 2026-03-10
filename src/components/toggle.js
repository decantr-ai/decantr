/**
 * Toggle — A pressable button with on/off state.
 * Uses aria-pressed for accessibility. Supports reactive pressed state.
 *
 * @module decantr/components/toggle
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.pressed=false] - Pressed state (static or signal getter)
 * @param {string} [props.variant] - default|outline
 * @param {string} [props.size] - default|sm|lg
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

  const el = h('button', {
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
 *
 * @param {Object} [props]
 * @param {{ value: string, label?: string, icon?: string|Node, disabled?: boolean }[]} [props.items]
 * @param {string|string[]|Function} [props.value] - Selected value(s)
 * @param {'single'|'multiple'} [props.type='single']
 * @param {boolean} [props.multiple] - Alias for type='multiple'
 * @param {string} [props.variant]
 * @param {string} [props.size]
 * @param {Function} [props.onchange] - Called with new value(s)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ToggleGroup(props = {}) {
  injectBase();

  const { items = [], value, type, multiple, variant, size, onchange, class: cls } = props;

  // Accept 'multiple' as alias for type='multiple'
  const effectiveType = multiple ? 'multiple' : (type || 'single');

  let current = typeof value === 'function' ? value() : (value || (effectiveType === 'multiple' ? [] : ''));

  const group = h('div', {
    class: cx('d-toggle-group', cls),
    role: 'group'
  });

  // Sliding indicator for single-select
  const indicator = effectiveType === 'single'
    ? h('div', { class: 'd-toggle-indicator' })
    : null;
  if (indicator) {
    indicator.style.opacity = '0'; // hidden until first position
    group.appendChild(indicator);
  }

  function isSelected(val) {
    return effectiveType === 'multiple' ? current.includes(val) : current === val;
  }

  function select(val) {
    if (effectiveType === 'multiple') {
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

    const btn = h('button', {
      type: 'button',
      class: cx('d-toggle', variant && `d-toggle-${variant}`, size && `d-toggle-${size}`),
      role: 'button',
      'aria-pressed': String(isSelected(item.value)),
      'aria-label': item.label || item.value,
      disabled: item.disabled ? '' : undefined
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
      indicator.style.transform = `translateX(${btn.offsetLeft - 2}px)`;
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.opacity = '1';
    } else {
      indicator.style.opacity = '0';
    }
  }

  function updateAll() {
    buttons.forEach(({ btn, value: v }) => {
      btn.setAttribute('aria-pressed', String(isSelected(v)));
    });
    // Defer indicator positioning to allow DOM layout
    requestAnimationFrame(positionIndicator);
  }

  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      updateAll();
    });
  }

  // Initial indicator position after mount
  requestAnimationFrame(positionIndicator);

  return group;
}
