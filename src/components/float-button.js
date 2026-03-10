/**
 * FloatButton — Floating action button (FAB) fixed to viewport corner.
 * Supports expandable group of actions.
 *
 * @module decantr/components/float-button
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string|Node} [props.icon='+'']
 * @param {string} [props.tooltip]
 * @param {'circle'|'square'} [props.shape='circle']
 * @param {'default'|'primary'} [props.type='default']
 * @param {Function} [props.onClick]
 * @param {'right-bottom'|'right-top'|'left-bottom'|'left-top'} [props.position='right-bottom']
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function FloatButton(props = {}) {
  injectBase();
  const { icon = '+', tooltip, shape = 'circle', type = 'default', onClick, position = 'right-bottom', class: cls } = props;

  const iconEl = typeof icon === 'string' ? h('span', { class: 'd-float-btn-icon' }, icon) : icon;

  const btn = h('button', {
    type: 'button',
    class: cx('d-float-btn', `d-float-btn-${shape}`, `d-float-btn-${type}`, cls),
    'aria-label': tooltip || 'Action'
  }, iconEl);

  if (tooltip) {
    btn.setAttribute('title', tooltip);
  }

  if (onClick) btn.addEventListener('click', onClick);

  const wrap = h('div', { class: cx('d-float-btn-wrap', `d-float-btn-${position}`) }, btn);

  return wrap;
}

/**
 * FloatButton.Group — Expandable group of float buttons.
 * @param {Object} [props]
 * @param {string|Node} [props.icon='+']
 * @param {'circle'|'square'} [props.shape='circle']
 * @param {'top'|'bottom'|'left'|'right'} [props.direction='top']
 * @param {'right-bottom'|'right-top'|'left-bottom'|'left-top'} [props.position='right-bottom']
 * @param {string} [props.class]
 * @param {...Node} children - FloatButton elements
 * @returns {HTMLElement}
 */
FloatButton.Group = function FloatButtonGroup(props = {}, ...children) {
  injectBase();
  const { icon = '+', shape = 'circle', direction = 'top', position = 'right-bottom', class: cls } = props;

  const iconEl = typeof icon === 'string' ? h('span', { class: 'd-float-btn-icon' }, icon) : icon;

  const trigger = h('button', {
    type: 'button',
    class: cx('d-float-btn', `d-float-btn-${shape}`, 'd-float-btn-primary'),
    'aria-label': 'Actions',
    'aria-expanded': 'false'
  }, iconEl);

  const menu = h('div', { class: cx('d-float-btn-group-menu', `d-float-btn-group-${direction}`), style: { display: 'none' } });
  children.forEach(c => { if (c && c.nodeType) menu.appendChild(c); });

  let open = false;
  trigger.addEventListener('click', () => {
    open = !open;
    menu.style.display = open ? '' : 'none';
    trigger.setAttribute('aria-expanded', String(open));
    trigger.classList.toggle('d-float-btn-active', open);
  });

  const wrap = h('div', { class: cx('d-float-btn-wrap', `d-float-btn-${position}`, cls) }, menu, trigger);

  return wrap;
};
