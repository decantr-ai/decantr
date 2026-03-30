import { h } from '../core/index.js';

/**
 * Proxy-based tag functions. Destructure what you need:
 * @example const { div, p, h2, button } = tags;
 * div({ class: 'card' }, h2('Title'), p('Content'))
 * @type {Record<string, Function>}
 */
export const tags = new Proxy({}, {
  get(_, tag) {
    return (first, ...rest) => {
      if (first && typeof first === 'object' && !first.nodeType
          && !Array.isArray(first) && typeof first !== 'function') {
        return h(tag, first, ...rest);
      }
      return h(tag, null, ...(first != null ? [first, ...rest] : rest));
    };
  }
});
