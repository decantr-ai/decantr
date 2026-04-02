/**
 * TreeSelect — Dropdown with hierarchical tree selection.
 * Supports single/multiple selection, checkboxes, and search.
 * Uses createFieldOverlay behavior.
 *
 * @module decantr/components/tree-select
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createCheckControl, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface TreeSelectProps {
  value?: string|Array<string>|Function;
  multiple?: boolean;
  checkable?: boolean;
  onchange?: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  class?: string;
  options?: unknown;
  [key: string]: unknown;
}

const { div, button: buttonTag, span, input: inputTag } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean, children?: Object[] }[]} [props.options]
 * @param {string|Array<string>|Function} [props.value]
 * @param {boolean} [props.multiple=false]
 * @param {boolean} [props.checkable=false]
 * @param {Function} [props.onchange]
 * @param {string} [props.placeholder='Select']
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const TreeSelect = component<TreeSelectProps>((props: TreeSelectProps = {} as TreeSelectProps) => {
  injectBase();
  const {
    options = [], value, multiple = false, checkable = false,
    onchange, placeholder = 'Select', disabled, error, success,
    variant, size, label, help, required, class: cls
  } = props;

  const selected = new Set();
  const expanded = new Set();
  let searchText = '';

  function parseValue(v: any) {
    selected.clear();
    if (!v) return;
    const val = typeof v === 'function' ? v() : v;
    if (Array.isArray(val)) val.forEach(s => selected.add(s));
    else if (val) selected.add(val);
  }

  parseValue(value);

  // @ts-expect-error -- strict-mode fix (auto)
  function findLabel(nodes: any, val: any) {
    for (const n of nodes) {
      if (n.value === val) return n.label;
      // @ts-expect-error -- strict-mode fix (auto)
      if (n.children) { const r = findLabel(n.children, val); if (r) return r; }
    }
    return null;
  }

  function getDisplayText() {
    if (!selected.size) return '';
    return [...selected].map(v => findLabel(options, v) || v).join(', ');
  }

  // Trigger
  const displayEl = span({ class: 'd-treeselect-display' });
  const arrowEl = caret('down', { class: 'd-treeselect-arrow' });
  const trigger = buttonTag({
    type: 'button',
    class: cx('d-treeselect-trigger', 'd-select'),
    'aria-haspopup': 'listbox',
    'aria-expanded': 'false'
  }, displayEl, arrowEl);

  const panel = div({ class: 'd-treeselect-panel', role: 'tree' });
  const wrap = div({ class: cx('d-treeselect', cls) }, trigger, panel);

  // @ts-expect-error -- strict-mode fix (auto)
  applyFieldState(wrap, { error, success, disabled, variant, size });

  function updateDisplay() {
    const text = getDisplayText();
    displayEl.textContent = text || placeholder;
    if (!text) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  function emit() {
    updateDisplay();
    if (!onchange) return;
    if (multiple || checkable) onchange([...selected]);
    else onchange(selected.size ? [...selected][0] : null);
  }

  function selectNode(node: any) {
    if (node.disabled) return;
    if (multiple || checkable) {
      if (selected.has(node.value)) selected.delete(node.value);
      else selected.add(node.value);
    } else {
      selected.clear();
      selected.add(node.value);
      overlay.close();
    }
    emit();
    renderTree();
  }

  function toggleExpand(node: any) {
    if (expanded.has(node.value)) expanded.delete(node.value);
    else expanded.add(node.value);
    renderTree();
  }

  function matchesSearch(node: any) {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    if (node.label.toLowerCase().includes(q)) return true;
    if (node.children) return node.children.some((c: any) => matchesSearch(c));
    return false;
  }

  function renderNode(node: any, depth: any) {
    if (!matchesSearch(node)) return null;

    const hasChildren = node.children && node.children.length;
    const isExpanded = expanded.has(node.value);
    const isSelected = selected.has(node.value);

    const content = div({
      class: cx('d-tree-node-content', isSelected && 'd-tree-node-selected'),
      role: 'treeitem',
      'aria-selected': String(isSelected),
      'aria-expanded': hasChildren ? String(isExpanded) : undefined
    });

    for (let i = 0; i < depth; i++) {
      content.appendChild(span({ class: 'd-tree-node-indent' }));
    }

    if (hasChildren) {
      const switcher = buttonTag({
        type: 'button',
        class: cx('d-tree-node-switcher', isExpanded && 'd-tree-node-switcher-open'),
        'aria-label': isExpanded ? 'Collapse' : 'Expand',
        tabindex: '-1'
      }, caret('right', { size: '0.875em' }));
      switcher.addEventListener('click', (e) => { e.stopPropagation(); toggleExpand(node); });
      content.appendChild(switcher);
    } else {
      content.appendChild(span({ class: 'd-tree-node-indent' }));
    }

    if (checkable) {
      const { wrap: cbWrap, input: cb } = createCheckControl({
        tabindex: '-1',
        disabled: node.disabled ? '' : undefined
      });
      cb.checked = isSelected;
      cb.addEventListener('change', (e) => { e.stopPropagation(); selectNode(node); });
      content.appendChild(cbWrap);
    }

    content.appendChild(span({ class: 'd-tree-node-label' }, node.label));

    if (!checkable && !node.disabled) {
      content.addEventListener('click', () => selectNode(node));
    }

    const wrapper = div({ class: 'd-tree-node' }, content);

    if (hasChildren && isExpanded) {
      const childContainer = div({ class: 'd-tree-children', role: 'group' });
      node.children.forEach((child: any) => {
        const childEl = renderNode(child, depth + 1);
        if (childEl) childContainer.appendChild(childEl);
      });
      wrapper.appendChild(childContainer);
    }

    return wrapper;
  }

  function renderTree() {
    const existingSearch = panel.querySelector('.d-treeselect-search');
    const hadFocus = existingSearch && document.activeElement === existingSearch;
    // @ts-expect-error -- strict-mode fix (auto)
    const cursorPos = existingSearch ? existingSearch.selectionStart : 0;

    panel.replaceChildren();

    const searchInput = inputTag({
      type: 'text',
      class: 'd-treeselect-search',
      placeholder: 'Search...',
      'aria-label': 'Search options'
    });
    // @ts-expect-error -- strict-mode fix (auto)
    searchInput.value = searchText;
    searchInput.addEventListener('input', (e) => {
      // @ts-expect-error -- strict-mode fix (auto)
      searchText = e.target.value;
      renderTree();
    });
    panel.appendChild(searchInput);

    const treeWrap = div({ class: 'd-tree', role: 'tree' });
    // @ts-expect-error -- strict-mode fix (auto)
    options.forEach((node: any) => {
      const el = renderNode(node, 0);
      if (el) treeWrap.appendChild(el);
    });
    panel.appendChild(treeWrap);

    if (hadFocus) {
      requestAnimationFrame(() => {
        searchInput.focus();
        // @ts-expect-error -- strict-mode fix (auto)
        searchInput.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }

  const overlay = createFieldOverlay(trigger, panel, {
    matchWidth: false,
    onOpen: () => { searchText = ''; wrap.classList.add('d-treeselect-open'); renderTree(); },
    onClose: () => { searchText = ''; wrap.classList.remove('d-treeselect-open'); }
  });

  trigger.addEventListener('mousedown', (e) => {
    e.preventDefault();
    overlay.toggle();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      overlay.isOpen() ? overlay.close() : overlay.open();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!overlay.isOpen()) overlay.open();
    } else if (e.key === 'Escape') {
      overlay.close();
    }
  });

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const dis = disabled();
      // @ts-expect-error -- strict-mode fix (auto)
      trigger.disabled = dis;
      trigger.setAttribute('aria-disabled', String(!!dis));
    });
  } else if (disabled) {
    // @ts-expect-error -- strict-mode fix (auto)
    trigger.disabled = true;
    trigger.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { parseValue(value); updateDisplay(); });
  }

  onDestroy(() => { overlay.destroy(); });

  updateDisplay();

  if (label || help) {
    // @ts-expect-error -- strict-mode fix (auto)
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
