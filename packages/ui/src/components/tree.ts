/**
 * Tree — Hierarchical tree view with expand/collapse, checkboxes, and selection.
 * Uses createDisclosure behavior for node expand/collapse.
 *
 * @module decantr/components/tree
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createCheckControl } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface TreeProps {
  // @ts-expect-error -- strict-mode fix (auto)
  data?: TreeNode[];
  expandedKeys?: string[];
  selectedKeys?: string[];
  checkedKeys?: string[];
  checkable?: boolean;
  selectable?: boolean;
  defaultExpandAll?: boolean;
  onSelect?: (value: unknown) => void;
  onCheck?: (...args: unknown[]) => unknown;
  onExpand?: (...args: unknown[]) => unknown;
  class?: string;
  [key: string]: unknown;
}

/**
 * @typedef {Object} TreeNode
 * @property {string} key - Unique identifier
 * @property {string} label
 * @property {string|Node} [icon]
 * @property {boolean} [disabled]
 * @property {boolean} [isLeaf]
 * @property {TreeNode[]} [children]
 */

/**
 * @param {Object} [props]
 * @param {TreeNode[]} [props.data]
 * @param {string[]} [props.expandedKeys] - Initially expanded keys
 * @param {string[]} [props.selectedKeys] - Selected keys
 * @param {string[]} [props.checkedKeys] - Checked keys (requires checkable)
 * @param {boolean} [props.checkable=false] - Show checkboxes
 * @param {boolean} [props.selectable=true]
 * @param {boolean} [props.defaultExpandAll=false]
 * @param {Function} [props.onSelect] - Called with (selectedKeys, {node, selected})
 * @param {Function} [props.onCheck] - Called with (checkedKeys, {node, checked})
 * @param {Function} [props.onExpand] - Called with (expandedKeys, {node, expanded})
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Tree = component<TreeProps>((props: TreeProps = {} as TreeProps) => {
  injectBase();
  const { data = [], expandedKeys: initExpanded = [], selectedKeys: initSelected = [], checkedKeys: initChecked = [], checkable = false, selectable = true, defaultExpandAll = false, onSelect, onCheck, onExpand, class: cls } = props;

  const expanded = new Set(initExpanded);
  const selected = new Set(initSelected);
  const checked = new Set(initChecked);

  if (defaultExpandAll) {
    const collectKeys = (nodes: any) => { nodes.forEach((n: any) => { if (n.children?.length) { expanded.add(n.key); collectKeys(n.children); } }); };
    collectKeys(data);
  }

  const tree = h('div', { class: cx('d-tree', cls), role: 'tree' });

  function renderNode(node: any, depth: any, posInSet: any, setSize: any) {
    const hasChildren = node.children && node.children.length;
    const isExpanded = expanded.has(node.key);
    const isSelected = selected.has(node.key);
    const isChecked = checked.has(node.key);

    const nodeEl = h('div', {
      class: cx('d-tree-node', isSelected && 'd-tree-node-selected'),
      role: 'treeitem',
      'aria-expanded': hasChildren ? String(isExpanded) : undefined,
      'aria-level': depth + 1,
      'aria-setsize': setSize,
      'aria-posinset': posInSet
    });

    const content = h('div', { class: 'd-tree-node-content' });

    // Indent
    for (let i = 0; i < depth; i++) {
      content.appendChild(h('span', { class: 'd-tree-node-indent' }));
    }

    // Switcher
    if (hasChildren) {
      const switcher = h('button', {
        type: 'button',
        class: cx('d-tree-node-switcher', isExpanded && 'd-tree-node-switcher-open'),
        'aria-label': isExpanded ? 'Collapse' : 'Expand'
      }, caret('right'));
      switcher.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expanded.has(node.key)) expanded.delete(node.key);
        else expanded.add(node.key);
        render();
        if (onExpand) onExpand([...expanded], { node, expanded: expanded.has(node.key) });
      });
      content.appendChild(switcher);
    } else {
      content.appendChild(h('span', { class: 'd-tree-node-indent' }));
    }

    // Checkbox
    if (checkable) {
      const { wrap: cbWrap, input: cb } = createCheckControl({
        disabled: node.disabled ? '' : undefined
      });
      cb.checked = isChecked;
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        if (cb.checked) checked.add(node.key);
        else checked.delete(node.key);
        if (onCheck) onCheck([...checked], { node, checked: cb.checked });
      });
      content.appendChild(cbWrap);
    }

    // Icon
    if (node.icon) {
      const icon = typeof node.icon === 'string'
        ? h('span', { 'aria-hidden': 'true' }, node.icon)
        : node.icon;
      content.appendChild(icon);
    }

    // Label
    const label = h('span', { class: 'd-tree-node-label' }, node.label);
    content.appendChild(label);

    // Selection
    if (selectable && !node.disabled) {
      content.addEventListener('click', () => {
        if (selected.has(node.key)) selected.delete(node.key);
        else { selected.clear(); selected.add(node.key); }
        render();
        // @ts-expect-error -- strict-mode fix (auto)
        if (onSelect) onSelect([...selected], { node, selected: selected.has(node.key) });
      });
    }

    nodeEl.appendChild(content);

    // Children
    if (hasChildren && isExpanded) {
      const childContainer = h('div', { class: 'd-tree-children', role: 'group' });
      node.children.forEach((child: any, ci: any) => childContainer.appendChild(renderNode(child, depth + 1, ci + 1, node.children.length)));
      nodeEl.appendChild(childContainer);
    }

    return nodeEl;
  }

  function render() {
    tree.replaceChildren();
    data.forEach((node, i) => tree.appendChild(renderNode(node, 0, i + 1, data.length)));
  }

  render();
  return tree;
})
