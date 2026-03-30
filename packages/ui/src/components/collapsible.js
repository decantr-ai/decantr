/**
 * Collapsible — Simple expand/collapse container.
 * Uses createDisclosure behavior for smooth animation.
 *
 * @module decantr/components/collapsible
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createDisclosure } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.open=false] - Open state
 * @param {Function} [props.onToggle] - Called with new open state
 * @param {string} [props.class]
 * @param {Function} props.trigger - Function returning the trigger element
 * @param {...Node} children - Collapsible content
 * @returns {HTMLElement}
 */
export function Collapsible(props = {}, ...children) {
  injectBase();
  const { open = false, onToggle, trigger, class: cls, ...rest } = props;

  const triggerEl = typeof trigger === 'function' ? trigger() : h('button', { type: 'button' }, 'Toggle');
  const content = h('div', { class: 'd-collapsible-content' }, ...children);
  const region = h('div', { class: 'd-disclosure-region' }, content);

  const wrap = h('div', {
    class: cx('d-collapsible', cls),
    ...rest
  }, triggerEl, region);

  const defaultOpen = typeof open === 'function' ? open() : open;
  const disclosure = createDisclosure(triggerEl, content, {
    defaultOpen,
    animate: true,
    onToggle: (isOpen) => { if (onToggle) onToggle(isOpen); }
  });

  if (typeof open === 'function') {
    createEffect(() => {
      const v = open();
      if (v && !disclosure.isOpen()) disclosure.open();
      else if (!v && disclosure.isOpen()) disclosure.close();
    });
  }

  return wrap;
}
