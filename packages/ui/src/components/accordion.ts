import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface AccordionProps {
  multiple?: boolean;
  collapsible?: boolean;
  defaultOpen?: string[];
  disabled?: boolean | (() => boolean);
  onValueChange?: (...args: unknown[]) => unknown;
  class?: string;
  items?: unknown;
  [key: string]: unknown;
}

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

let uid = 0;

/**
 * @param {Object} [props]
 * @param {{ id: string, title: string, content: Function|string, disabled?: boolean }[]} props.items
 * @param {boolean} [props.multiple]
 * @param {boolean} [props.collapsible]
 * @param {string[]} [props.defaultOpen]
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onValueChange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Accordion = component<AccordionProps>((props: AccordionProps = {} as AccordionProps) => {
  injectBase();

  const {
    items = [],
    multiple = false,
    collapsible = true,
    defaultOpen = [],
    disabled,
    onValueChange,
    class: cls
  } = props;

  const instanceId = ++uid;
  const openSet = new Set();
  const rootCls = cx('d-accordion', cls);
  const container = div({ class: rootCls });
  const regions = [];
  const sections = [];
  const triggers = [];

  function isItemDisabled(item) {
    if (item.disabled) return true;
    if (typeof disabled === 'function') return disabled(item);
    return !!disabled;
  }

  function notifyChange() {
    if (onValueChange) onValueChange(Array.from(openSet));
  }

  function findNextEnabled(fromIdx, direction) {
    const len = triggers.length;
    let idx = fromIdx;
    for (let i = 0; i < len; i++) {
      idx = (idx + direction + len) % len;
      if (triggers[idx].getAttribute('aria-disabled') !== 'true') return idx;
    }
    return fromIdx;
  }

  items.forEach((item, index) => {
    const triggerId = `d-acc-t-${instanceId}-${index}`;
    const regionId = `d-acc-r-${instanceId}-${index}`;

    const content = div({ class: 'd-accordion-content', role: 'region', id: regionId, 'aria-labelledby': triggerId });
    const region = div({ class: 'd-accordion-region' });
    region.appendChild(content);
    region.style.height = '0px';
    region.style.overflow = 'hidden';
    regions.push(region);

    const triggerAttrs = {
      type: 'button',
      class: 'd-accordion-trigger',
      id: triggerId,
      'aria-expanded': 'false',
      'aria-controls': regionId
    };
    if (isItemDisabled(item)) {
      triggerAttrs['data-disabled'] = '';
      triggerAttrs['aria-disabled'] = 'true';
    }

    const trigger = buttonTag(triggerAttrs, item.title, caret('down', { class: 'd-accordion-icon' }));

    const section = div({ class: 'd-accordion-item' }, trigger, region);
    sections.push(section);
    triggers.push(trigger);

    trigger.addEventListener('click', () => {
      if (isItemDisabled(item)) return;

      const isOpen = openSet.has(item.id);
      if (isOpen) {
        if (!multiple && !collapsible) return;
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
        const rendered = typeof item.content === 'function' ? item.content() : item.content;
        if (typeof rendered === 'string') content.appendChild(document.createTextNode(rendered));
        else if (rendered) content.appendChild(rendered);
        animateOpen(region);
        section.classList.add('d-accordion-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      notifyChange();
    });

    trigger.addEventListener('keydown', (e) => {
      const idx = triggers.indexOf(trigger);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        triggers[findNextEnabled(idx, 1)].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggers[findNextEnabled(idx, -1)].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        const first = findNextEnabled(triggers.length - 1, 1);
        triggers[first].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = findNextEnabled(0, -1);
        triggers[last].focus();
      }
    });

    container.appendChild(section);
  });

  if (defaultOpen.length) {
    items.forEach((item, i) => {
      if (!defaultOpen.includes(item.id)) return;
      openSet.add(item.id);
      const content = regions[i].querySelector('.d-accordion-content');
      if (content) {
        content.replaceChildren();
        const rendered = typeof item.content === 'function' ? item.content() : item.content;
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
})
