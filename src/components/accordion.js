import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createDisclosure } from './_behaviors.js';

const { div, button: buttonTag } = tags;

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
 * @param {boolean} [props.multiple]
 * @param {string[]} [props.defaultOpen]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Accordion(props = {}) {
  injectBase();

  const { items = [], multiple = false, defaultOpen = [], disabled, class: cls } = props;

  const openSet = new Set();
  const container = div({ class: cx('d-accordion', cls) });
  const regions = [];
  const sections = [];
  const triggers = [];

  items.forEach((item) => {
    const content = div({ class: 'd-accordion-content', role: 'region' });
    const region = div({ class: 'd-accordion-region' });
    region.appendChild(content);
    region.style.height = '0px';
    region.style.overflow = 'hidden';
    regions.push(region);

    const trigger = buttonTag({
      type: 'button',
      class: 'd-accordion-trigger',
      'aria-expanded': 'false'
    }, item.title, caret('down', { class: 'd-accordion-icon' }));

    const section = div({ class: 'd-accordion-item' }, trigger, region);
    sections.push(section);
    triggers.push(trigger);

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
              triggers[i].setAttribute('aria-expanded', 'false');
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

    // Keyboard navigation between items
    trigger.addEventListener('keydown', (e) => {
      const idx = triggers.indexOf(trigger);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % triggers.length;
        triggers[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + triggers.length) % triggers.length;
        triggers[prev].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        triggers[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        triggers[triggers.length - 1].focus();
      }
    });

    container.appendChild(section);
  });

  // Open items specified by defaultOpen
  if (defaultOpen.length) {
    items.forEach((item, i) => {
      if (!defaultOpen.includes(item.id)) return;
      openSet.add(item.id);
      const content = regions[i].querySelector('.d-accordion-content');
      if (content) {
        content.replaceChildren();
        const rendered = item.content();
        if (typeof rendered === 'string') content.appendChild(document.createTextNode(rendered));
        else if (rendered) content.appendChild(rendered);
      }
      regions[i].style.height = '';
      regions[i].style.overflow = '';
      sections[i].classList.add('d-accordion-open');
      triggers[i].setAttribute('aria-expanded', 'true');
    });
  }

  return container;
}
