import { createSignal } from '../state/index.js';
import { glass } from './styles/glass.js';
import { flat } from './styles/flat.js';
import { brutalist } from './styles/brutalist.js';
import { skeuo } from './styles/skeuo.js';
import { sketchy } from './styles/sketchy.js';

/** @type {Map<string, Object>} */
const styles = new Map();
const [_getStyle, _setStyle] = createSignal('flat');

/** @type {HTMLStyleElement|null} */
let styleEl = null;

const [_getAnimations, _setAnimations] = createSignal(true);
let animEl = null;

const ANIM_OFF_CSS = '.d-btn,.d-card,.d-input-wrap,.d-badge,.d-badge-dot,.d-modal-overlay,.d-modal-content,.d-btn-loading::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}';

export function setAnimations(enabled) {
  _setAnimations(!!enabled);
  if (typeof document === 'undefined') return;
  if (!enabled) {
    if (!animEl) {
      animEl = document.createElement('style');
      animEl.setAttribute('data-decantr-anim', '');
      document.head.appendChild(animEl);
    }
    animEl.textContent = ANIM_OFF_CSS;
  } else if (animEl) {
    animEl.textContent = '';
  }
}

export function getAnimations() { return _getAnimations; }

function getStyleElement() {
  if (!styleEl && typeof document !== 'undefined') {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr-style', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

/**
 * @param {Object} style
 * @returns {string}
 */
function buildCSS(style) {
  let css = `:root{${style.global}}`;
  for (const rules of Object.values(style.components)) {
    css += rules;
  }
  return css;
}

const builtins = [glass, flat, brutalist, skeuo, sketchy];
for (const s of builtins) styles.set(s.id, s);

/**
 * @param {string} id
 */
export function setStyle(id) {
  const style = styles.get(id);
  if (!style) throw new Error(`Unknown style: ${id}`);
  _setStyle(id);
  const el = getStyleElement();
  if (el) el.textContent = buildCSS(style);
}

/** @returns {() => string} */
export function getStyle() { return _getStyle; }

/**
 * @param {{ id: string, name: string, global: string, components: Object }} style
 */
export function registerStyle(style) {
  styles.set(style.id, style);
}

/** @returns {{ id: string, name: string }[]} */
export function getStyleList() {
  return [...styles.values()].map(s => ({ id: s.id, name: s.name }));
}

/** @returns {string} */
export function getActiveCSS() {
  const style = styles.get(_getStyle());
  return style ? buildCSS(style) : '';
}

export function resetStyles() {
  if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
  styleEl = null;
  _setStyle('flat');
  if (animEl && animEl.parentNode) animEl.parentNode.removeChild(animEl);
  animEl = null;
  _setAnimations(true);
}
