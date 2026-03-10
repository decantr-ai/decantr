/**
 * Tag — Categorization label with optional close/checkable behavior.
 *
 * @module decantr/components/tag
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

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
export function Tag(props = {}, ...children) {
  injectBase();
  const { color, closable, checked, onClose, onCheck, class: cls, ...rest } = props;

  const isCheckable = checked !== undefined;
  const isCustomColor = color && !['primary', 'success', 'warning', 'danger'].includes(color);

  const className = cx(
    'd-tag',
    color && !isCustomColor && `d-tag-${color}`,
    isCheckable && 'd-tag-checkable',
    cls
  );

  const tag = isCheckable
    ? h('button', { type: 'button', class: className, role: 'checkbox', ...rest })
    : h('span', { class: className, ...rest });

  if (isCustomColor) {
    tag.style.backgroundColor = color;
    tag.style.color = '#fff';
    tag.style.borderColor = color;
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
}

/**
 * Tag.CheckableGroup — Group of checkable tags.
 * @param {Object} [props]
 * @param {{ value: string, label: string }[]} [props.options]
 * @param {string[]} [props.value] - Selected values
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
Tag.CheckableGroup = function CheckableGroup(props = {}) {
  injectBase();
  const { options = [], value = [], onchange, class: cls } = props;
  let selected = [...value];

  const group = h('div', { class: cx('d-space d-space-wrap', cls), role: 'group' });

  options.forEach(opt => {
    const tag = Tag({
      checked: selected.includes(opt.value),
      onCheck: (checked) => {
        if (checked) selected.push(opt.value);
        else selected = selected.filter(v => v !== opt.value);
        if (onchange) onchange([...selected]);
      }
    }, opt.label);
    group.appendChild(tag);
  });

  return group;
};
