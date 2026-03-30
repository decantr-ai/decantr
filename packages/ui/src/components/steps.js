/**
 * Steps — Step-by-step navigation indicator.
 * Shows progress through a multi-step process.
 *
 * @module decantr/components/steps
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

/**
 * @param {Object} [props]
 * @param {{ title: string, description?: string, icon?: string|Node, status?: 'wait'|'process'|'finish'|'error' }[]} [props.items]
 * @param {number|Function} [props.current=0] - Current step index
 * @param {'horizontal'|'vertical'} [props.direction='horizontal']
 * @param {Function} [props.onChange] - Called with step index on click
 * @param {boolean} [props.clickable=false]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Steps(props = {}) {
  injectBase();
  const { items = [], current = 0, direction = 'horizontal', onChange, clickable = false, class: cls } = props;

  const isVert = direction === 'vertical';
  const container = h('div', {
    class: cx('d-steps', isVert && 'd-steps-vertical', cls),
    role: 'list'
  });

  function getStatus(index, cur) {
    const item = items[index];
    if (item.status) return item.status;
    if (index < cur) return 'finish';
    if (index === cur) return 'process';
    return 'wait';
  }

  function renderIcon(index, status) {
    const item = items[index];
    if (item.icon) {
      return typeof item.icon === 'string'
        ? h('span', null, item.icon)
        : item.icon;
    }
    if (status === 'finish') return icon('check', { size: '1em' });
    if (status === 'error') return icon('x', { size: '1em' });
    return h('span', null, String(index + 1));
  }

  function render() {
    const cur = typeof current === 'function' ? current() : current;
    container.replaceChildren();

    items.forEach((item, i) => {
      const status = getStatus(i, cur);

      const iconEl = h('div', {
        class: cx('d-step-icon', `d-step-icon-${status}`)
      }, renderIcon(i, status));

      const content = h('div', { class: 'd-step-content' });
      content.appendChild(h('div', { class: 'd-step-title' }, item.title));
      if (item.description) {
        content.appendChild(h('div', { class: 'd-step-desc' }, item.description));
      }

      const step = h('div', {
        class: cx('d-step', `d-step-${status}`),
        role: 'listitem',
        'aria-current': status === 'process' ? 'step' : undefined
      }, iconEl, content);

      if (clickable && onChange) {
        step.classList.add('d-step-clickable');
        step.addEventListener('click', () => onChange(i));
      }

      // Connector between steps (child of step, not sibling)
      if (i < items.length - 1) {
        const connector = h('div', {
          class: cx('d-step-connector', status === 'finish' && 'd-step-connector-done')
        });
        step.appendChild(connector);
      }

      container.appendChild(step);
    });
  }

  render();

  if (typeof current === 'function') {
    createEffect(() => { current(); render(); });
  }

  return container;
}
