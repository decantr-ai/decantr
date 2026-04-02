/**
 * Segmented — Segmented control (pill toggle group).
 * Uses createRovingTabindex for keyboard navigation.
 *
 * @module decantr/components/segmented
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createRovingTabindex } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface SegmentedProps {
  value?: string | (() => string);
  onchange?: (value: unknown) => void;
  block?: boolean;
  disabled?: boolean | (() => boolean);
  size?: string;
  class?: string;
  options?: unknown;
  [key: string]: unknown;
}

const { div, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label?: string, icon?: string|Node, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value]
 * @param {Function} [props.onchange]
 * @param {boolean} [props.block=false]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.size] - sm|lg
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Segmented = component<SegmentedProps>((props: SegmentedProps = {} as SegmentedProps) => {
  injectBase();
  const { options = [], value, onchange, block, disabled, size, class: cls } = props;

  // @ts-expect-error -- strict-mode fix (auto)
  let current = typeof value === 'function' ? value() : (value || (options[0]?.value ?? ''));

  const container = div({
    class: cx('d-segmented', block && 'd-segmented-block', size && `d-segmented-${size}`, cls),
    role: 'radiogroup'
  });

  // @ts-expect-error -- strict-mode fix (auto)
  const items = options.map((opt: any) => {
    const content = opt.icon
      ? (typeof opt.icon === 'string' ? tags.span(opt.icon) : opt.icon)
      : null;
    const label = opt.label || opt.value;

    const el = buttonTag({
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
    items.forEach(({ el, value: v }: any) => {
      el.setAttribute('aria-checked', v === current ? 'true' : 'false');
    });
  }

  const roving = createRovingTabindex(container, {
    itemSelector: '.d-segmented-item:not([disabled])',
    orientation: 'horizontal',
    // @ts-expect-error -- strict-mode fix (auto)
    onFocus: (el) => el.click()
  });

  if (typeof value === 'function') {
    createEffect(() => { current = value(); updateAll(); });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      container.toggleAttribute('data-disabled', v);
      container.setAttribute('aria-disabled', v ? 'true' : 'false');
      items.forEach(({ el }: any) => { el.disabled = v; });
    });
  } else if (disabled) {
    container.setAttribute('data-disabled', '');
    container.setAttribute('aria-disabled', 'true');
    items.forEach(({ el }: any) => { el.disabled = true; });
  }

  onDestroy(() => { roving.destroy(); });

  return container;
})
