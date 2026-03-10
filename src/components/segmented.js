/**
 * Segmented — Segmented control (pill toggle group).
 * Uses roving tabindex for keyboard navigation.
 *
 * @module decantr/components/segmented
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createRovingTabindex } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {{ value: string, label?: string, icon?: string|Node, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value] - Selected value
 * @param {Function} [props.onchange] - Called with selected value
 * @param {boolean} [props.block=false] - Full width
 * @param {string} [props.size] - default|sm|lg
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Segmented(props = {}) {
  injectBase();
  const { options = [], value, onchange, block, size, class: cls } = props;

  let current = typeof value === 'function' ? value() : (value || (options[0]?.value ?? ''));

  const container = h('div', {
    class: cx('d-segmented', block && 'd-segmented-block', size && `d-segmented-${size}`, cls),
    role: 'radiogroup'
  });

  const items = options.map(opt => {
    const content = opt.icon
      ? (typeof opt.icon === 'string' ? h('span', null, opt.icon) : opt.icon)
      : null;
    const label = opt.label || opt.value;

    const el = h('button', {
      type: 'button',
      class: 'd-segmented-item',
      role: 'radio',
      'aria-checked': current === opt.value ? 'true' : 'false',
      'aria-label': label,
      disabled: opt.disabled ? '' : undefined
    });

    if (content) el.appendChild(content);
    if (!opt.icon || opt.label) el.appendChild(document.createTextNode(label));

    el.addEventListener('click', () => {
      if (opt.disabled) return;
      current = opt.value;
      updateAll();
      if (onchange) onchange(current);
    });

    container.appendChild(el);
    return { el, value: opt.value };
  });

  function updateAll() {
    items.forEach(({ el, value: v }) => {
      el.setAttribute('aria-checked', v === current ? 'true' : 'false');
    });
  }

  // Keyboard navigation
  createRovingTabindex(container, {
    itemSelector: '.d-segmented-item:not([disabled])',
    orientation: 'horizontal',
    onFocus: (el) => el.click()
  });

  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      updateAll();
    });
  }

  return container;
}
