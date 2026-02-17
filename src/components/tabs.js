import { h } from '../core/index.js';
import { createEffect, createSignal } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ id: string, label: string, content: Function }[]} props.tabs
 * @param {string|Function} [props.active] - Active tab id
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Tabs(props = {}) {
  injectBase();

  const { tabs = [], active, onchange, class: cls } = props;

  const [getActive, setActive] = createSignal(
    typeof active === 'function' ? active() : (active || (tabs[0] && tabs[0].id))
  );

  const tabList = h('div', { class: 'd-tabs-list', role: 'tablist' });
  const panel = h('div', { class: 'd-tabs-panel', role: 'tabpanel' });
  const container = h('div', { class: cx('d-tabs', cls) }, tabList, panel);

  const tabEls = [];

  tabs.forEach((tab, i) => {
    const tabEl = h('button', {
      type: 'button',
      class: 'd-tab',
      role: 'tab',
      'aria-selected': 'false',
      tabindex: '-1'
    }, tab.label);

    tabEl.addEventListener('click', () => {
      setActive(tab.id);
      if (onchange) onchange(tab.id);
    });

    tabEl.addEventListener('keydown', (e) => {
      let newIndex = i;
      if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') newIndex = 0;
      else if (e.key === 'End') newIndex = tabs.length - 1;
      else return;
      e.preventDefault();
      setActive(tabs[newIndex].id);
      if (onchange) onchange(tabs[newIndex].id);
      tabEls[newIndex].focus();
    });

    tabEls.push(tabEl);
    tabList.appendChild(tabEl);
  });

  createEffect(() => {
    const activeId = typeof active === 'function' ? active() : getActive();
    tabEls.forEach((el, i) => {
      const isActive = tabs[i].id === activeId;
      el.classList.toggle('d-tab-active', isActive);
      el.setAttribute('aria-selected', isActive ? 'true' : 'false');
      el.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    const activeTab = tabs.find(t => t.id === activeId);
    panel.replaceChildren();
    if (activeTab && activeTab.content) {
      const content = activeTab.content();
      if (typeof content === 'string') panel.appendChild(document.createTextNode(content));
      else if (content) panel.appendChild(content);
    }
  });

  return container;
}
