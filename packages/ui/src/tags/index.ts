import { h } from '../runtime/index.js';

export type TagFunction = (first?: any, ...rest: any[]) => HTMLElement;

/**
 * Proxy-based tag functions. Destructure what you need:
 * @example const { div, p, h2, button } = tags;
 * div({ class: 'card' }, h2('Title'), p('Content'))
 */
export const tags: Record<string, TagFunction> = new Proxy({} as Record<string, TagFunction>, {
  get(_: any, tag: string): TagFunction {
    return (first?: any, ...rest: any[]) => {
      if (first && typeof first === 'object' && !first.nodeType
          && !Array.isArray(first) && typeof first !== 'function') {
        return h(tag, first, ...rest);
      }
      return h(tag, null, ...(first != null ? [first, ...rest] : rest));
    };
  }
});
