/**
 * FloatButton — Floating action button (FAB) fixed to viewport corner.
 * Supports expandable group of actions.
 *
 * @module decantr/components/float-button
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const { div, span, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {string|Node} [props.icon='+']
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

  const iconEl = typeof icon === 'string' ? span({ class: 'd-float-btn-icon' }, icon) : icon;

  const btn = buttonTag({
    type: 'button',
    class: cx('d-float-btn', `d-float-btn-${shape}`, `d-float-btn-${type}`, cls),
    'aria-label': tooltip || 'Action'
  }, iconEl);

  if (tooltip) {
    btn.setAttribute('title', tooltip);
  }

  if (onClick) btn.addEventListener('click', onClick);

  const wrap = div({ class: cx('d-float-btn-wrap', `d-float-btn-${position}`) }, btn);

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

  const iconEl = typeof icon === 'string' ? span({ class: 'd-float-btn-icon' }, icon) : icon;

  const trigger = buttonTag({
    type: 'button',
    class: cx('d-float-btn', `d-float-btn-${shape}`, 'd-float-btn-primary'),
    'aria-label': 'Actions',
    'aria-expanded': 'false'
  }, iconEl);

  const menu = div({ class: cx('d-float-btn-group-menu', `d-float-btn-group-${direction}`) });
  children.forEach(c => { if (c && c.nodeType) menu.appendChild(c); });

  const overlay = createOverlay(trigger, menu, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: () => trigger.classList.add('d-float-btn-active'),
    onClose: () => trigger.classList.remove('d-float-btn-active')
  });

  const wrap = div({ class: cx('d-float-btn-wrap', `d-float-btn-${position}`, cls) }, menu, trigger);

  onDestroy(() => {
    overlay.destroy();
  });

  return wrap;
};
