import { h } from '../core/index.js';
import { getIconPath } from '../icons/index.js';

let styleEl = null;
const injectedIcons = new Set();

function ensureStyleEl() {
  if (styleEl) return styleEl;
  if (typeof document === 'undefined') return null;
  styleEl = document.querySelector('style[data-decantr-icons]');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr-icons', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

function buildDataUri(inner) {
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`)}")`;
}

function injectIconCSS(name, inner) {
  if (injectedIcons.has(name)) return;
  injectedIcons.add(name);
  const el = ensureStyleEl();
  if (!el) return;
  const uri = buildDataUri(inner);
  const sel = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(`d-i-${name}`) : `d-i-${name}`;
  el.textContent += `.${sel}{-webkit-mask-image:${uri};mask-image:${uri}}`;
}

/**
 * @param {string} name - Icon name (kebab-case, e.g. 'check', 'chevron-down')
 * @param {Object} [opts]
 * @param {string|number} [opts.size] - CSS size (default: 1.25em)
 * @param {string} [opts.class]
 * @returns {HTMLElement}
 */
export function icon(name, opts = {}) {
  const { size = '1.25em', class: cls, ...rest } = opts;

  const className = cls ? `d-i d-i-${name} ${cls}` : `d-i d-i-${name}`;
  const el = h('span', {
    class: className,
    role: 'img',
    'aria-hidden': 'true',
    style: { width: size, height: size },
    ...rest
  });

  const inner = getIconPath(name);
  if (inner) {
    injectIconCSS(name, inner);
  }

  return el;
}
