/** @type {Set<string>} */
const injected = new Set();

/** @type {HTMLStyleElement|null} */
let styleEl = null;

/** @type {HTMLStyleElement|null} */
let layerEl = null;

/** Responsive breakpoints (mobile-first, min-width) */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 };
const BP_ORDER = ['sm', 'md', 'lg', 'xl'];

/** Container query breakpoints */
export const CQ_WIDTHS = [320, 480, 640, 768, 1024];

/** @type {Record<string, HTMLStyleElement>|null} */
let bpEls = null;

/** @type {HTMLStyleElement|null} */
let cqEl = null;

/** CSS cascade layer order declaration */
const LAYER_ORDER = '@layer d.base,d.theme,d.atoms,d.user;';

function ensureLayerOrder() {
  if (layerEl) return;
  if (typeof document === 'undefined') return;
  layerEl = document.createElement('style');
  layerEl.setAttribute('data-decantr-layers', '');
  layerEl.textContent = LAYER_ORDER;
  document.head.prepend(layerEl);
}

function getStyleElement() {
  if (!styleEl) {
    if (typeof document === 'undefined') return null;
    ensureLayerOrder();
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

function ensureBpElements() {
  if (bpEls) return bpEls;
  if (typeof document === 'undefined') return null;
  bpEls = {};
  getStyleElement();
  for (const bp of BP_ORDER) {
    const el = document.createElement('style');
    el.setAttribute(`data-decantr-${bp}`, '');
    document.head.appendChild(el);
    bpEls[bp] = el;
  }
  return bpEls;
}

/**
 * @param {string} className
 * @param {string} declaration
 */
export function inject(className, declaration) {
  if (injected.has(className)) return;
  injected.add(className);
  const style = getStyleElement();
  if (!style) return;
  style.textContent = (style.textContent || '') + `@layer d.atoms{.${className}{${declaration}}}`;
}

/**
 * Inject a responsive (breakpoint-wrapped) atom.
 * @param {string} className — e.g. '_sm:gc3'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} bp — breakpoint key (sm|md|lg|xl)
 */
export function injectResponsive(className, declaration, bp) {
  if (injected.has(className)) return;
  injected.add(className);
  const els = ensureBpElements();
  if (!els) return;
  const el = els[bp];
  const escaped = className.replace(/:/g, '\\:');
  el.textContent = (el.textContent || '') + `@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){.${escaped}{${declaration}}}}`;
}

function ensureCqElement() {
  if (cqEl) return cqEl;
  if (typeof document === 'undefined') return null;
  getStyleElement();
  cqEl = document.createElement('style');
  cqEl.setAttribute('data-decantr-cq', '');
  document.head.appendChild(cqEl);
  return cqEl;
}

/**
 * Inject a container query-wrapped atom.
 * @param {string} className — e.g. '_cq640:gc3'
 * @param {string} declaration — CSS declaration(s)
 * @param {number} width — container min-width in px
 */
export function injectContainer(className, declaration, width) {
  if (injected.has(className)) return;
  injected.add(className);
  const el = ensureCqElement();
  if (!el) return;
  const escaped = className.replace(/:/g, '\\:');
  el.textContent = (el.textContent || '') + `@layer d.atoms{@container(min-width:${width}px){.${escaped}{${declaration}}}}`;
}

/**
 * @returns {string}
 */
export function extractCSS() {
  let css = layerEl ? layerEl.textContent || '' : '';
  css += styleEl ? styleEl.textContent || '' : '';
  if (bpEls) {
    for (const bp of BP_ORDER) {
      if (bpEls[bp]) css += bpEls[bp].textContent || '';
    }
  }
  if (cqEl) css += cqEl.textContent || '';
  return css;
}

/**
 * @returns {Set<string>}
 */
export function getInjectedClasses() {
  return new Set(injected);
}

export function reset() {
  injected.clear();
  if (layerEl) {
    layerEl.textContent = LAYER_ORDER;
  }
  if (styleEl) {
    styleEl.textContent = '';
  }
  if (bpEls) {
    for (const bp of BP_ORDER) {
      if (bpEls[bp]) bpEls[bp].textContent = '';
    }
  }
  if (cqEl) {
    cqEl.textContent = '';
  }
}
