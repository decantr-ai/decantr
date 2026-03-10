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

// ─── Buffered injection ─────────────────────────────────────────
// Rules are buffered in arrays and flushed to DOM in batches via
// microtask, avoiding O(n²) string concatenation on textContent.

/** @type {string[]} */
let atomBuffer = [];
/** @type {Record<string, string[]>} */
let bpBuffers = {};
/** @type {string[]} */
let cqBuffer = [];
/** @type {boolean} */
let flushScheduled = false;

function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(flushBuffers);
  } else {
    Promise.resolve().then(flushBuffers);
  }
}

function flushBuffers() {
  flushScheduled = false;
  if (atomBuffer.length) {
    const el = getStyleElement();
    if (el) el.textContent = (el.textContent || '') + atomBuffer.join('');
    atomBuffer.length = 0;
  }
  if (Object.keys(bpBuffers).length) {
    const els = ensureBpElements();
    if (els) {
      for (const bp of BP_ORDER) {
        if (bpBuffers[bp] && bpBuffers[bp].length) {
          els[bp].textContent = (els[bp].textContent || '') + bpBuffers[bp].join('');
          bpBuffers[bp].length = 0;
        }
      }
    }
    bpBuffers = {};
  }
  if (cqBuffer.length) {
    const el = ensureCqElement();
    if (el) el.textContent = (el.textContent || '') + cqBuffer.join('');
    cqBuffer.length = 0;
  }
}

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
  if (typeof document === 'undefined') return;
  atomBuffer.push(`@layer d.atoms{.${className}{${declaration}}}`);
  scheduleFlush();
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
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  if (!bpBuffers[bp]) bpBuffers[bp] = [];
  bpBuffers[bp].push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
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
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  cqBuffer.push(`@layer d.atoms{@container(min-width:${width}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/**
 * @returns {string}
 */
export function extractCSS() {
  flushBuffers();
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
  atomBuffer.length = 0;
  bpBuffers = {};
  cqBuffer.length = 0;
  flushScheduled = false;
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
