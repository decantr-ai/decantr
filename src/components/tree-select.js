/**
 * TreeSelect — Dropdown overlay with hierarchical tree selection.
 * Supports single/multiple selection, checkboxes, and search filtering.
 * Uses createOverlay behavior.
 *
 * @module decantr/components/tree-select
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay, caret, createCheckControl } from './_behaviors.js';

/**
 * @typedef {Object} TreeSelectNode
 * @property {string} value
 * @property {string} label
 * @property {boolean} [disabled]
 * @property {TreeSelectNode[]} [children]
 */

/**
 * @param {Object} [props]
 * @param {TreeSelectNode[]} [props.options] - Tree data
 * @param {string|Array<string>|Function} [props.value]
 * @param {boolean} [props.multiple=false]
 * @param {boolean} [props.checkable=false] - Show checkboxes
 * @param {Function} [props.onchange] - Called with selected value(s)
 * @param {string} [props.placeholder='Select']
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function TreeSelect(props = {}) {
  injectBase();
  const {
    options = [], value, multiple = false, checkable = false,
    onchange, placeholder = 'Select', disabled, class: cls
  } = props;

  const selected = new Set();
  const expanded = new Set();
  let searchText = '';

  function parseValue(v) {
    selected.clear();
    if (!v) return;
    const val = typeof v === 'function' ? v() : v;
    if (Array.isArray(val)) val.forEach(s => selected.add(s));
    else if (val) selected.add(val);
  }

  parseValue(value);

  function findLabel(nodes, val) {
    for (const n of nodes) {
      if (n.value === val) return n.label;
      if (n.children) { const r = findLabel(n.children, val); if (r) return r; }
    }
    return null;
  }

  function getDisplayText() {
    if (!selected.size) return '';
    const vals = [...selected];
    return vals.map(v => findLabel(options, v) || v).join(', ');
  }

  // Trigger
  const displayEl = h('span', { class: 'd-treeselect-display' });
  const arrowEl = caret('down', { class: 'd-treeselect-arrow' });
  const trigger = h('button', {
    type: 'button',
    class: cx('d-treeselect-trigger', 'd-select'),
    'aria-haspopup': 'listbox',
    'aria-expanded': 'false'
  }, displayEl, arrowEl);

  const panel = h('div', {
    class: 'd-treeselect-panel',
    style: { display: 'none' },
    role: 'tree'
  });

  const wrap = h('div', { class: cx('d-treeselect', cls) }, trigger, panel);

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

  function selectNode(node) {
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

  function toggleExpand(node) {
    if (expanded.has(node.value)) expanded.delete(node.value);
    else expanded.add(node.value);
    renderTree();
  }

  function matchesSearch(node) {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    if (node.label.toLowerCase().includes(q)) return true;
    if (node.children) return node.children.some(c => matchesSearch(c));
    return false;
  }

  function renderNode(node, depth) {
    if (!matchesSearch(node)) return null;

    const hasChildren = node.children && node.children.length;
    const isExpanded = expanded.has(node.value);
    const isSelected = selected.has(node.value);

    const content = h('div', {
      class: cx('d-tree-node-content', isSelected && 'd-tree-node-selected'),
      role: 'treeitem',
      'aria-selected': String(isSelected),
      'aria-expanded': hasChildren ? String(isExpanded) : undefined
    });

    // Indent
    for (let i = 0; i < depth; i++) {
      content.appendChild(h('span', { class: 'd-tree-node-indent' }));
    }

    // Switcher
    if (hasChildren) {
      const switcher = h('button', {
        type: 'button',
        class: cx('d-tree-node-switcher', isExpanded && 'd-tree-node-switcher-open'),
        'aria-label': isExpanded ? 'Collapse' : 'Expand',
        tabindex: '-1'
      }, caret('right', { size: '0.875em' }));
      switcher.addEventListener('click', (e) => { e.stopPropagation(); toggleExpand(node); });
      content.appendChild(switcher);
    } else {
      content.appendChild(h('span', { class: 'd-tree-node-indent' }));
    }

    // Checkbox
    if (checkable) {
      const { wrap: cbWrap, input: cb } = createCheckControl({
        tabindex: '-1',
        disabled: node.disabled ? '' : undefined
      });
      cb.checked = isSelected;
      cb.addEventListener('change', (e) => { e.stopPropagation(); selectNode(node); });
      content.appendChild(cbWrap);
    }

    // Label
    const label = h('span', { class: 'd-tree-node-label' }, node.label);
    content.appendChild(label);

    if (!checkable && !node.disabled) {
      content.addEventListener('click', () => selectNode(node));
    }

    const wrapper = h('div', { class: 'd-tree-node' }, content);

    // Children
    if (hasChildren && isExpanded) {
      const childContainer = h('div', { class: 'd-tree-children', role: 'group' });
      node.children.forEach(child => {
        const childEl = renderNode(child, depth + 1);
        if (childEl) childContainer.appendChild(childEl);
      });
      wrapper.appendChild(childContainer);
    }

    return wrapper;
  }

  function renderTree() {
    // Preserve search input at top
    const existingSearch = panel.querySelector('.d-treeselect-search');
    const hadFocus = existingSearch && document.activeElement === existingSearch;
    const cursorPos = existingSearch ? existingSearch.selectionStart : 0;

    panel.replaceChildren();

    // Search input
    const searchInput = h('input', {
      type: 'text',
      class: 'd-treeselect-search',
      placeholder: 'Search...',
      'aria-label': 'Search options'
    });
    searchInput.value = searchText;
    searchInput.addEventListener('input', (e) => {
      searchText = e.target.value;
      renderTree();
    });
    panel.appendChild(searchInput);

    // Tree
    const treeWrap = h('div', { class: 'd-tree', role: 'tree' });
    options.forEach(node => {
      const el = renderNode(node, 0);
      if (el) treeWrap.appendChild(el);
    });
    panel.appendChild(treeWrap);

    if (hadFocus) {
      requestAnimationFrame(() => {
        searchInput.focus();
        searchInput.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }

  const overlay = createOverlay(trigger, panel, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: () => { searchText = ''; wrap.classList.add('d-treeselect-open'); renderTree(); },
    onClose: () => { searchText = ''; wrap.classList.remove('d-treeselect-open'); }
  });

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const dis = disabled();
      trigger.disabled = dis;
      trigger.setAttribute('aria-disabled', String(!!dis));
    });
  } else if (disabled) {
    trigger.disabled = true;
    trigger.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { parseValue(value); updateDisplay(); });
  }

  updateDisplay();
  return wrap;
}
