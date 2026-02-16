import { h } from '../core/index.js';

/**
 * @param {string} name
 * @param {Object} [opts]
 * @param {string|number} [opts.size] - CSS size (default: 1.25em)
 * @param {string} [opts.class]
 * @returns {HTMLElement}
 */
export function icon(name, opts = {}) {
  const { size = '1.25em', class: cls } = opts;

  // Detect Material Icons (class on element or data attribute)
  if (typeof document !== 'undefined' &&
      (document.querySelector('.material-icons') ||
       document.querySelector('[data-icons="material"]'))) {
    const el = h('span', {
      class: cls ? `material-icons ${cls}` : 'material-icons',
      style: { fontSize: size, lineHeight: '1', verticalAlign: 'middle' }
    }, name);
    return el;
  }

  // Detect Lucide (data attribute or global)
  if (typeof document !== 'undefined' &&
      (document.querySelector('[data-icons="lucide"]') ||
       (typeof window !== 'undefined' && window.lucide))) {
    const el = h('i', {
      'data-lucide': name,
      class: cls || '',
      style: { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }
    });
    // Trigger Lucide to process new icons
    if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
      queueMicrotask(() => window.lucide.createIcons());
    }
    return el;
  }

  // Fallback: empty span with title
  return h('span', {
    class: cls || '',
    title: name,
    style: { display: 'inline-block', width: size, height: size }
  });
}
