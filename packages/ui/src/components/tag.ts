/**
 * Tag — Categorization label with optional close/checkable behavior.
 *
 * @module decantr/components/tag
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { pickForeground } from '../css/derive.js';

import { component } from '../runtime/component.js';
export interface TagProps {
  color?: string;
  closable?: boolean;
  checked?: boolean | (() => boolean);
  onClose?: () => void;
  onCheck?: (...args: unknown[]) => unknown;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.color] - Preset: primary|success|warning|danger or custom hex
 * @param {boolean} [props.closable=false]
 * @param {boolean|Function} [props.checked] - For checkable tags
 * @param {Function} [props.onClose]
 * @param {Function} [props.onCheck] - Called with new checked state
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Tag = component<TagProps>((props: TagProps = {} as TagProps, ...children: (string | Node)[]) => {
  injectBase();
  const { color, closable, checked, onClose, onCheck, class: cls, ...rest } = props;

  const isCheckable = checked !== undefined;
  const isCustomColor = color && !['primary', 'success', 'warning', 'danger'].includes(color);

  const className = cx(
    'd-tag',
    color && !isCustomColor && `d-tag-${color}`,
    isCustomColor && 'd-tag-custom',
    isCheckable && 'd-tag-checkable',
    cls
  );

  const tag = isCheckable
    ? h('button', { type: 'button', class: className, role: 'checkbox', ...rest })
    : h('span', { class: className, ...rest });

  if (isCustomColor) {
    tag.style.setProperty('--d-tag-bg', color);
    tag.style.setProperty('--d-tag-fg', pickForeground(color));
  }

  children.forEach(child => {
    if (child && typeof child === 'object' && child.nodeType) tag.appendChild(child);
    else if (child != null) tag.appendChild(document.createTextNode(String(child)));
  });

  if (closable) {
    const closeBtn = h('button', {
      type: 'button',
      class: 'd-tag-close',
      'aria-label': 'Remove'
    }, '\u00d7');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onClose) onClose();
      tag.remove();
    });
    tag.appendChild(closeBtn);
  }

  if (isCheckable) {
    let _checked = typeof checked === 'function' ? checked() : checked;
    tag.setAttribute('aria-checked', String(!!_checked));

    tag.addEventListener('click', () => {
      _checked = !_checked;
      tag.setAttribute('aria-checked', String(_checked));
      if (onCheck) onCheck(_checked);
    });

    if (typeof checked === 'function') {
      createEffect(() => {
        _checked = checked();
        tag.setAttribute('aria-checked', String(!!_checked));
      });
    }
  }

  return tag;
})

/**
 * Tag.CheckableGroup — Group of checkable tags.
 * @param {Object} [props]
 * @param {{ value: string, label: string }[]} [props.options]
 * @param {string[]} [props.value] - Selected values
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */

export interface TagCheckableGroupProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Tag.CheckableGroup = function CheckableGroup(props: TagCheckableGroupProps = {} as TagCheckableGroupProps) {
  injectBase();
  const { options = [], value = [], onchange, class: cls } = props;
  // @ts-expect-error -- strict-mode fix (auto)
  let selected = [...value];

  const group = h('div', { class: cx('d-space d-space-wrap', cls), role: 'group' });

  // @ts-expect-error -- strict-mode fix (auto)
  options.forEach((opt: any) => {
    const tag = Tag({
      checked: selected.includes(opt.value),
      onCheck: (checked) => {
        if (checked) selected.push(opt.value);
        else selected = selected.filter(v => v !== opt.value);
        // @ts-expect-error -- strict-mode fix (auto)
        if (onchange) onchange([...selected]);
      }
    }, opt.label);
    group.appendChild(tag);
  });

  return group;
};
