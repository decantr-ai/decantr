import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { caret } from './_behaviors.js';

const ANIM_MS = 250;

function animateOpen(region) {
  if (typeof region.scrollHeight !== 'number') {
    region.style.height = '';
    region.style.overflow = '';
    return;
  }
  region.style.height = '0px';
  region.style.overflow = 'hidden';
  void region.offsetHeight;
  region.style.height = region.scrollHeight + 'px';
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    region.removeEventListener('transitionend', onEnd);
    region.style.height = '';
    region.style.overflow = '';
  };
  const onEnd = (e) => { if (e.propertyName === 'height') finish(); };
  region.addEventListener('transitionend', onEnd);
  setTimeout(finish, ANIM_MS + 50);
}

function animateClose(region) {
  if (typeof region.offsetHeight !== 'number') {
    region.style.height = '0px';
    region.style.overflow = 'hidden';
    return;
  }
  region.style.height = region.offsetHeight + 'px';
  region.style.overflow = 'hidden';
  void region.offsetHeight;
  region.style.height = '0px';
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    region.removeEventListener('transitionend', onEnd);
  };
  const onEnd = (e) => { if (e.propertyName === 'height') finish(); };
  region.addEventListener('transitionend', onEnd);
  setTimeout(finish, ANIM_MS + 50);
}

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
  const regions = [];
  const sections = [];

  items.forEach((item) => {
    const content = h('div', { class: 'd-accordion-content', role: 'region' });
    const region = h('div', { class: 'd-accordion-region' });
    region.appendChild(content);
    region.style.height = '0px';
    region.style.overflow = 'hidden';
    regions.push(region);

    const trigger = h('button', {
      type: 'button',
      class: 'd-accordion-trigger',
      'aria-expanded': 'false'
    }, item.title, caret('down', { class: 'd-accordion-icon' }));

    const section = h('div', { class: 'd-accordion-item' }, trigger, region);
    sections.push(section);

    trigger.addEventListener('click', () => {
      const isOpen = openSet.has(item.id);
      if (isOpen) {
        openSet.delete(item.id);
        animateClose(region);
        section.classList.remove('d-accordion-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        if (!multiple) {
          items.forEach((other, i) => {
            if (openSet.has(other.id)) {
              animateClose(regions[i]);
              sections[i].classList.remove('d-accordion-open');
              sections[i].querySelector('.d-accordion-trigger')
                ?.setAttribute('aria-expanded', 'false');
            }
          });
          openSet.clear();
        }
        openSet.add(item.id);
        content.replaceChildren();
        const rendered = item.content();
        if (typeof rendered === 'string') content.appendChild(document.createTextNode(rendered));
        else if (rendered) content.appendChild(rendered);
        animateOpen(region);
        section.classList.add('d-accordion-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    container.appendChild(section);
  });

  return container;
}
