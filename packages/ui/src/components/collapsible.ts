/**
 * Collapsible — Simple expand/collapse container.
 * Uses createDisclosure behavior for smooth animation.
 *
 * @module decantr/components/collapsible
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createDisclosure } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface CollapsibleProps {
  open?: boolean | (() => boolean);
  onToggle?: (...args: unknown[]) => unknown;
  class?: string;
  trigger?: (...args: unknown[]) => unknown;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.open=false] - Open state
 * @param {Function} [props.onToggle] - Called with new open state
 * @param {string} [props.class]
 * @param {Function} props.trigger - Function returning the trigger element
 * @param {...Node} children - Collapsible content
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Collapsible = component<CollapsibleProps>((props: CollapsibleProps = {} as CollapsibleProps, ...children: (string | Node)[]) => {
  injectBase();
  const { open = false, onToggle, trigger, class: cls, ...rest } = props;

  const triggerEl = typeof trigger === 'function' ? trigger() : h('button', { type: 'button' }, 'Toggle');
  const content = h('div', { class: 'd-collapsible-content' }, ...children);
  const region = h('div', { class: 'd-disclosure-region' }, content);

  const wrap = h('div', {
    class: cx('d-collapsible', cls),
    ...rest
  // @ts-expect-error -- strict-mode fix (auto)
  }, triggerEl, region);

  const defaultOpen = typeof open === 'function' ? open() : open;
  // @ts-expect-error -- strict-mode fix (auto)
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
})
