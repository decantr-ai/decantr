import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ id: string, title: string, content: Function }[]} props.items
 * @param {boolean} [props.multiple] - Allow multiple panels open
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Accordion(props = {}) {
  injectBase();

  const { items = [], multiple = false, class: cls } = props;

  const openSet = new Set();
  const container = h('div', { class: cx('d-accordion', cls) });
  const contentEls = [];

  items.forEach((item) => {
    const content = h('div', { class: 'd-accordion-content', role: 'region' });
    content.style.display = 'none';
    contentEls.push(content);

    const trigger = h('button', {
      type: 'button',
      class: 'd-accordion-trigger',
      'aria-expanded': 'false'
    }, item.title, h('span', { class: 'd-accordion-icon' }, '\u25BE'));

    const section = h('div', { class: 'd-accordion-item' }, trigger, content);

    trigger.addEventListener('click', () => {
      const isOpen = openSet.has(item.id);
      if (isOpen) {
        openSet.delete(item.id);
        content.style.display = 'none';
        section.classList.remove('d-accordion-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        if (!multiple) {
          openSet.clear();
          contentEls.forEach(el => { el.style.display = 'none'; });
          container.querySelectorAll('.d-accordion-item').forEach(el => {
            el.classList.remove('d-accordion-open');
            el.querySelector('.d-accordion-trigger')?.setAttribute('aria-expanded', 'false');
          });
        }
        openSet.add(item.id);
        content.replaceChildren();
        const rendered = item.content();
        if (typeof rendered === 'string') content.appendChild(document.createTextNode(rendered));
        else if (rendered) content.appendChild(rendered);
        content.style.display = '';
        section.classList.add('d-accordion-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    container.appendChild(section);
  });

  return container;
}
