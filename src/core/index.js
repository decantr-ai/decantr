import { createEffect } from '../state/index.js';
export { onMount, onDestroy } from './lifecycle.js';
import { drainMountQueue, drainDestroyQueue } from './lifecycle.js';

/**
 * @param {string} tag
 * @param {Object|null} props
 * @param {...(string|number|Node|Function)} children
 * @returns {HTMLElement}
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  if (props) {
    for (const key in props) {
      const val = props[key];
      if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (typeof val === 'function' && key !== 'ref') {
        createEffect(() => {
          const v = val();
          if (key === 'class' || key === 'className') {
            el.className = v;
          } else if (key === 'style' && typeof v === 'object') {
            Object.assign(el.style, v);
          } else {
            el.setAttribute(key, v);
          }
        });
      } else if (key === 'ref' && typeof val === 'function') {
        val(el);
      } else if (key === 'class' || key === 'className') {
        el.className = val;
      } else if (key === 'style' && typeof val === 'object') {
        Object.assign(el.style, val);
      } else if (val !== false && val != null) {
        el.setAttribute(key, val === true ? '' : String(val));
      }
    }
  }

  appendChildren(el, children);
  return el;
}

/**
 * @param {Function} getter
 * @returns {Text}
 */
export function text(getter) {
  const node = document.createTextNode('');
  createEffect(() => {
    node.nodeValue = String(getter());
  });
  return node;
}

/**
 * @param {Function} condition
 * @param {Function} thenFn
 * @param {Function} [elseFn]
 * @returns {HTMLElement}
 */
export function cond(condition, thenFn, elseFn) {
  const container = document.createElement('d-cond');
  let currentNode = null;

  createEffect(() => {
    const result = condition();
    if (currentNode) {
      container.removeChild(currentNode);
      currentNode = null;
    }
    const fn = result ? thenFn : elseFn;
    if (fn) {
      currentNode = fn();
      if (currentNode) container.appendChild(currentNode);
    }
  });

  return container;
}

/**
 * @param {Function} itemsGetter
 * @param {Function} keyFn
 * @param {Function} renderFn
 * @returns {HTMLElement}
 */
export function list(itemsGetter, keyFn, renderFn) {
  const container = document.createElement('d-list');
  /** @type {Map<*, {node: Node}>} */
  let currentMap = new Map();

  createEffect(() => {
    const items = itemsGetter();
    const newMap = new Map();
    const newNodes = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = keyFn(item, i);
      const existing = currentMap.get(key);

      if (existing) {
        newMap.set(key, existing);
        newNodes.push(existing.node);
      } else {
        const node = renderFn(item, i);
        newMap.set(key, { node });
        newNodes.push(node);
      }
    }

    // Remove nodes no longer in list
    for (const [key, entry] of currentMap) {
      if (!newMap.has(key) && entry.node.parentNode === container) {
        container.removeChild(entry.node);
      }
    }

    // Append/reorder
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i];
      const current = container.childNodes[i];
      if (node !== current) {
        container.insertBefore(node, current || null);
      }
    }

    currentMap = newMap;
  });

  return container;
}

/**
 * @param {HTMLElement} root
 * @param {Function} component
 */
export function mount(root, component) {
  const result = component();
  if (result) root.appendChild(result);
  // Flush mount queue
  const fns = drainMountQueue();
  for (const fn of fns) {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      // store cleanup for later
    }
  }
}

/**
 * @param {HTMLElement} el
 * @param {Array} children
 */
function appendChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (child && typeof child === 'object' && child.nodeType) {
      el.appendChild(child);
    } else if (typeof child === 'function') {
      const textNode = document.createTextNode('');
      createEffect(() => {
        textNode.nodeValue = String(child());
      });
      el.appendChild(textNode);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}
