export { describe, it, test, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
export { assert };
export { createDOM } from './dom.js';
import { createDOM } from './dom.js';
import { flush as flushScheduler } from '../state/scheduler.js';

/**
 * @param {Function} component
 * @returns {{ container: Element, getByText: Function, getByClass: Function, getById: Function }}
 */
export function render(component) {
  const { document, cleanup } = createDOM();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const result = component();
  if (result) container.appendChild(result);

  function getByText(text) {
    return findByText(container, text);
  }

  function getByClass(cls) {
    return container.querySelector(`.${cls}`);
  }

  function getById(id) {
    return container.querySelector(`#${id}`);
  }

  return { container, getByText, getByClass, getById, cleanup };
}

function findByText(el, text) {
  for (const child of el.childNodes) {
    if (child.nodeType === 1) {
      if (child.textContent.trim() === text) return child;
      const found = findByText(child, text);
      if (found) return found;
    }
  }
  return null;
}

/**
 * @param {Element} el
 * @param {string} event
 * @param {Object} [detail]
 */
export function fire(el, event, detail) {
  const evt = { type: event, target: el, bubbles: true, cancelable: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...detail };
  el.dispatchEvent(evt);
}

/**
 * @returns {Promise<void>}
 */
export async function flush() {
  flushScheduler();
  await new Promise(r => setTimeout(r, 0));
}
