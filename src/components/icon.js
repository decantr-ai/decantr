import { h } from '../core/index.js';
import { getIconPath } from '../icons/index.js';

let styleEl = null;
const injectedIcons = new Set();

const WEIGHT_MAP = { thin: 1, light: 1.5, regular: 2, medium: 2.5, bold: 3 };

function resolveWeight(w) {
  if (w == null) return 2;
  if (typeof w === 'string') return WEIGHT_MAP[w] || 2;
  return Math.max(0.5, Math.min(4, Number(w) || 2));
}

function variantKey(name, weight, filled) {
  let key = name;
  if (weight !== 2) key += `--w${String(weight).replace('.', 'p')}`;
  if (filled) key += (weight !== 2 ? '-filled' : '--filled');
  return key;
}

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

function buildDataUri(inner, weight, filled) {
  const isFillBased = /fill=["'](?!none["'])/.test(inner);
  if (isFillBased) {
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='black' stroke='none'>${inner}</svg>`)}")`;
  }
  const fillAttr = filled ? `fill='black'` : `fill='none'`;
  const sw = weight != null ? weight : 2;
  const attrs = `${fillAttr} stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'`;
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' ${attrs}>${inner}</svg>`)}")`;
}

function injectIconCSS(name, inner, weight, filled) {
  const vk = variantKey(name, weight, filled);
  if (injectedIcons.has(vk)) return vk;
  injectedIcons.add(vk);
  const el = ensureStyleEl();
  if (!el) return vk;
  const uri = buildDataUri(inner, weight, filled);
  const sel = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(`d-i-${vk}`) : `d-i-${vk}`;
  el.textContent += `.${sel}{-webkit-mask-image:${uri};mask-image:${uri}}`;
  return vk;
}

/**
 * @param {string} name - Icon name (kebab-case, e.g. 'check', 'chevron-down')
 * @param {Object} [opts]
 * @param {string|number} [opts.size] - CSS size (default: 1.25em)
 * @param {string|number} [opts.weight] - Stroke weight: 'thin'|'light'|'regular'|'medium'|'bold' or number 0.5-4 (default: 2)
 * @param {boolean} [opts.filled] - Fill closed shapes (default: false)
 * @param {string} [opts.class]
 * @returns {HTMLElement}
 */
export function icon(name, opts = {}) {
  const { size = '1.25em', weight: rawWeight, filled = false, class: cls, ...rest } = opts;
  const cssSize = typeof size === 'number' ? `${size}px` : size;
  const weight = resolveWeight(rawWeight);

  const inner = getIconPath(name);
  if (!inner && typeof globalThis !== 'undefined' && globalThis.__DECANTR_DEV__) {
    console.warn(`[decantr] Unknown icon: "${name}"`);
  }
  let vk = name;
  if (inner) {
    vk = injectIconCSS(name, inner, weight, filled);
  }

  const className = cls ? `d-i d-i-${vk} ${cls}` : `d-i d-i-${vk}`;
  const el = h('span', {
    class: className,
    role: 'img',
    'aria-hidden': 'true',
    style: { width: cssSize, height: cssSize },
    ...rest
  });

  return el;
}
