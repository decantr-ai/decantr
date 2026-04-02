import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon as iconHelper } from './icon.js';

import { component } from '../runtime/component.js';
export interface ChipProps {
  icon?: string | Node;
  label?: string;
  variant?: string;
  size?: string;
  removable?: boolean;
  onRemove?: (...args: unknown[]) => unknown;
  onClick?: (...args: unknown[]) => unknown;
  selected?: boolean;
  class?: string;
  color?: unknown;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string|Node} [props.icon] - Leading icon (string = icon name, Node = element)
 * @param {string} props.label - Text content
 * @param {string} [props.variant] - default|outline|filled (default: 'default')
 * @param {string} [props.size] - xs|sm|lg
 * @param {boolean} [props.removable] - Show dismiss X button
 * @param {Function} [props.onRemove] - Dismiss callback
 * @param {Function} [props.onClick] - Click handler (makes chip interactive)
 * @param {boolean} [props.selected] - Selected/active state
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Chip = component<ChipProps>((props: ChipProps = {} as ChipProps) => {
  injectBase();

  const {
    icon, label, variant, color, size, removable, onRemove, onClick,
    selected, class: cls
  } = props;

  // Semantic color variants (success, error, warning, info)
  const semanticColors = ['success', 'error', 'warning', 'info'];
  // @ts-expect-error -- strict-mode fix (auto)
  const resolvedColor = color || (semanticColors.includes(variant) ? variant : null);

  const className = cx(
    'd-chip',
    variant === 'outline' && 'd-chip-outline',
    variant === 'filled' && 'd-chip-filled',
    resolvedColor && `d-chip-${resolvedColor}`,
    size && `d-chip-${size}`,
    selected && 'd-chip-selected',
    (onClick || removable) && 'd-chip-interactive',
    cls
  );

  const el = h('span', {
    class: className,
    role: onClick ? 'button' : undefined,
    tabindex: onClick ? '0' : undefined
  });

  if (onClick) {
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    });
  }

  if (icon) {
    const iconEl = typeof icon === 'string'
      // @ts-expect-error -- strict-mode fix (auto)
      ? iconHelper(icon, { size: '1em', class: 'd-chip-icon' })
      : icon;
    // @ts-expect-error -- strict-mode fix (auto)
    if (iconEl && !iconEl.classList.contains('d-chip-icon')) {
      // @ts-expect-error -- strict-mode fix (auto)
      iconEl.classList.add('d-chip-icon');
    }
    // @ts-expect-error -- strict-mode fix (auto)
    iconEl.setAttribute('aria-hidden', 'true');
    el.appendChild(iconEl);
  }

  if (label) {
    el.appendChild(h('span', { class: 'd-chip-label' }, label));
  }

  if (removable) {
    const removeBtn = h('button', {
      class: 'd-chip-remove',
      type: 'button',
      'aria-label': `Remove ${label || ''}`.trim(),
      onclick: (e: MouseEvent) => {
        e.stopPropagation();
        if (onRemove) onRemove(e);
      }
    // @ts-expect-error -- strict-mode fix (auto)
    }, iconHelper('x', { size: '1em' }));
    el.appendChild(removeBtn);
  }

  return el;
})
