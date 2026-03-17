/**
 * Tabs — Tabbed interface with roving tabindex keyboard navigation.
 * Uses createRovingTabindex for arrow-key focus management.
 *
 * @module decantr/components/tabs
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createRovingTabindex } from './_behaviors.js';
import { icon } from './icon.js';

const { div, button: buttonTag } = tags;

let _tabId = 0;

/**
 * @param {Object} [props]
 * @param {{ id: string, label: string, content?: Function, disabled?: boolean, closable?: boolean }[]} props.tabs
 * @param {string|Function} [props.active] - Active tab id
 * @param {Function} [props.onchange]
 * @param {Function} [props.onclose] - Called with tab id when closable tab is closed
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.size] - sm|lg
 * @param {boolean|Function} [props.disabled] - Group-level disabled
 * @param {boolean} [props.destroyInactive=true] - When false, all panels stay in DOM (hidden)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Tabs(props = {}) {
  injectBase();

  const {
    tabs = [],
    active,
    onchange,
    onclose,
    orientation = 'horizontal',
    size,
    disabled,
    destroyInactive = true,
    class: cls
  } = props;

  const prefix = `d-tabs-${_tabId++}`;

  // Resolve initial active tab
  let currentActive = typeof active === 'function'
    ? active()
    : (active || (tabs[0] && tabs[0].id));

  const tabList = div({
    class: 'd-tabs-list',
    role: 'tablist',
    'aria-orientation': orientation
  });

  // Sliding indicator element
  const indicator = div({ class: 'd-tabs-indicator' });
  tabList.appendChild(indicator);

  const panelContainer = div({ class: 'd-tabs-panel-container' });

  const container = div({
    class: cx(
      'd-tabs',
      orientation === 'vertical' && 'd-tabs-vertical',
      size && `d-tabs-${size}`,
      cls
    )
  }, tabList, panelContainer);

  // Track tab elements and panels for destroyInactive=false mode
  const tabEls = [];
  const panelMap = new Map(); // id -> { el, rendered }

  tabs.forEach(tab => {
    const tabBtnId = `${prefix}-tab-${tab.id}`;
    const panelId = `${prefix}-panel-${tab.id}`;

    const tabEl = buttonTag({
      type: 'button',
      class: cx('d-tab', tab.closable && 'd-tab-closable'),
      role: 'tab',
      id: tabBtnId,
      'aria-selected': 'false',
      'aria-controls': panelId,
      tabindex: '-1'
    }, tab.label);

    if (tab.disabled) {
      tabEl.disabled = true;
    }

    // Close button for closable tabs
    if (tab.closable) {
      const closeBtn = buttonTag({
        class: 'd-tab-close',
        'aria-label': `Close ${tab.label}`,
        tabindex: '-1',
        type: 'button'
      }, icon('x', { size: '1em' }));
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onclose) onclose(tab.id);
      });
      tabEl.appendChild(closeBtn);
    }

    tabEl.addEventListener('click', () => {
      if (tab.disabled) return;
      currentActive = tab.id;
      update();
      if (onchange) onchange(tab.id);
    });

    tabEls.push({ el: tabEl, tab });
    tabList.appendChild(tabEl);

    // Pre-create panels for destroyInactive=false
    if (!destroyInactive) {
      const panelEl = div({
        class: 'd-tabs-panel',
        role: 'tabpanel',
        id: panelId,
        'aria-labelledby': tabBtnId
      });
      panelEl.style.display = 'none';
      panelMap.set(tab.id, { el: panelEl, rendered: false });
      panelContainer.appendChild(panelEl);
    }
  });

  // Single panel for destroyInactive=true (default)
  let singlePanel = null;
  if (destroyInactive) {
    singlePanel = div({
      class: 'd-tabs-panel',
      role: 'tabpanel'
    });
    panelContainer.appendChild(singlePanel);
  }

  // Roving tabindex for keyboard navigation
  const roving = createRovingTabindex(tabList, {
    itemSelector: '.d-tab:not([disabled])',
    orientation,
    onFocus: (el) => el.click()
  });

  function updateIndicator(tabEl) {
    if (!tabEl || !tabList.isConnected) return;
    const listRect = tabList.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    if (orientation === 'vertical') {
      indicator.style.width = '3px';
      indicator.style.height = `${tabRect.height}px`;
      indicator.style.transform = `translateY(${tabRect.top - listRect.top + tabList.scrollTop}px)`;
    } else {
      indicator.style.height = '2px';
      indicator.style.width = `${tabRect.width}px`;
      indicator.style.transform = `translateX(${tabRect.left - listRect.left + tabList.scrollLeft}px)`;
    }
  }

  function update() {
    const activeId = typeof active === 'function' ? active() : currentActive;

    // Update tab button states
    let activeIndex = 0;
    tabEls.forEach(({ el, tab }, i) => {
      const isActive = tab.id === activeId;
      el.classList.toggle('d-tab-active', isActive);
      el.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) activeIndex = i;
    });

    // Position sliding indicator
    updateIndicator(tabEls[activeIndex]?.el);

    // Sync roving active to active tab (find non-disabled index)
    const enabledItems = [...tabList.querySelectorAll('.d-tab:not([disabled])')];
    const enabledIndex = enabledItems.indexOf(tabEls[activeIndex]?.el);
    if (enabledIndex >= 0) roving.setActive(enabledIndex);

    // Update panel content
    if (destroyInactive) {
      const activeTab = tabs.find(t => t.id === activeId);
      singlePanel.id = `${prefix}-panel-${activeId}`;
      singlePanel.setAttribute('aria-labelledby', `${prefix}-tab-${activeId}`);
      singlePanel.replaceChildren();
      if (activeTab && activeTab.content) {
        const content = activeTab.content();
        if (typeof content === 'string') singlePanel.appendChild(document.createTextNode(content));
        else if (content) singlePanel.appendChild(content);
      }
    } else {
      // Show/hide panels, lazy-render on first activation
      panelMap.forEach((entry, id) => {
        const isActive = id === activeId;
        entry.el.style.display = isActive ? '' : 'none';
        if (isActive && !entry.rendered) {
          entry.rendered = true;
          const tab = tabs.find(t => t.id === id);
          if (tab && tab.content) {
            const content = tab.content();
            if (typeof content === 'string') entry.el.appendChild(document.createTextNode(content));
            else if (content) entry.el.appendChild(content);
          }
        }
      });
    }
  }

  // Reactive effect for external active prop changes
  if (typeof active === 'function') {
    createEffect(() => { active(); update(); });
  } else {
    update();
  }

  // Defer initial indicator measurement to after layout
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      const activeId = typeof active === 'function' ? active() : currentActive;
      const idx = tabEls.findIndex(({ tab }) => tab.id === activeId);
      if (idx >= 0) updateIndicator(tabEls[idx].el);
    });
  }

  // Reactive group disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      container.toggleAttribute('data-disabled', v);
      tabEls.forEach(({ el }) => { el.disabled = v; });
    });
  } else if (disabled) {
    container.setAttribute('data-disabled', '');
    tabEls.forEach(({ el }) => { el.disabled = true; });
  }

  onDestroy(() => { roving.destroy(); });

  return container;
}
