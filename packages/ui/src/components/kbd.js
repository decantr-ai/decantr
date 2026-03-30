/**
 * Kbd — Keyboard shortcut display component.
 * Renders keyboard keys with proper styling.
 *
 * @module decantr/components/kbd
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string|string[]} [props.keys] - Key(s) to display. Array = combination (e.g. ['Ctrl', 'S'])
 * @param {string} [props.separator='+'] - Separator between keys in combination
 * @param {string} [props.class]
 * @param {...(string|Node)} children - Alternative: pass key text as children
 * @returns {HTMLElement}
 */
export function Kbd(props = {}, ...children) {
  injectBase();
  const { keys, separator = '+', class: cls, ...rest } = props;

  if (keys) {
    const keyArr = Array.isArray(keys) ? keys : [keys];
    if (keyArr.length === 1) {
      return h('kbd', { class: cx('d-kbd', cls), ...rest }, keyArr[0]);
    }
    const group = h('span', { class: cx('d-kbd-group', cls), ...rest });
    keyArr.forEach((key, i) => {
      if (i > 0) group.appendChild(h('span', { class: 'd-kbd-separator' }, separator));
      group.appendChild(h('kbd', { class: 'd-kbd' }, key));
    });
    return group;
  }

  return h('kbd', { class: cx('d-kbd', cls), ...rest }, ...children);
}
