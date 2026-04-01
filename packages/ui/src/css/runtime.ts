const injected = new Set<string>();

let styleEl: HTMLStyleElement | null = null;
let layerEl: HTMLStyleElement | null = null;

/** Responsive breakpoints (mobile-first, min-width) */
export const BREAKPOINTS: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280 };
const BP_ORDER = ['sm', 'md', 'lg', 'xl'];

/** Container query breakpoints */
export const CQ_WIDTHS: number[] = [320, 480, 640, 768, 1024];

let bpEls: Record<string, HTMLStyleElement> | null = null;
let cqEl: HTMLStyleElement | null = null;

/** CSS cascade layer order declaration */
const LAYER_ORDER = '@layer d.base,d.theme,d.atoms,d.user;';

// ─── Buffered injection ─────────────────────────────────────────
// Rules are buffered in arrays and flushed to DOM in batches via
// microtask, avoiding O(n²) string concatenation on textContent.

let atomBuffer: string[] = [];
let bpBuffers: Record<string, string[]> = {};
let cqBuffer: string[] = [];
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
 * @param {string} [escapedName] — pre-escaped class name for special chars (/, [, ], etc.)
 */
export function inject(className: string, declaration: string, escapedName?: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const sel = escapedName || className;
  atomBuffer.push(`@layer d.atoms{.${sel}{${declaration}}}`);
  scheduleFlush();
}

/**
 * Inject a responsive (breakpoint-wrapped) atom.
 * @param {string} className — e.g. '_sm:gc3'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} bp — breakpoint key (sm|md|lg|xl)
 */
export function injectResponsive(className: string, declaration: string, bp: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  if (!bpBuffers[bp]) bpBuffers[bp] = [];
  bpBuffers[bp].push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/**
 * Inject a media query-wrapped atom (for prefers-reduced-motion, etc.).
 * @param {string} className — e.g. '_motionSafe:trans'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} query — media query string (e.g. '(prefers-reduced-motion: no-preference)')
 */
export function injectMediaQuery(className: string, declaration: string, query: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  atomBuffer.push(`@layer d.atoms{@media${query}{.${escaped}{${declaration}}}}`);
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
export function injectContainer(className: string, declaration: string, width: number): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  cqBuffer.push(`@layer d.atoms{@container(min-width:${width}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/** State map for group/peer prefix → CSS pseudo selector */
const GP_STATE = {
  gh: ['group', 'hover'], gf: ['group', 'focus-within'], ga: ['group', 'active'],
  ph: ['peer', 'hover'], pf: ['peer', 'focus'], pa: ['peer', 'active'],
};

/**
 * Inject a group/peer state atom.
 * @param {string} className — e.g. '_gh:fgprimary'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} prefix — 'gh'|'gf'|'ga'|'ph'|'pf'|'pa'
 */
export function injectGroupPeer(className: string, declaration: string, prefix: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:').replace(/\//g, '\\/');
  const [kind, state] = GP_STATE[prefix];
  const combinator = kind === 'group' ? ' ' : ' ~ ';
  atomBuffer.push(`@layer d.atoms{.d-${kind}:${state}${combinator}.${escaped}{${declaration}}}`);
  scheduleFlush();
}

/** Pseudo-class prefix map */
const PSEUDO_MAP = {
  h: 'hover', f: 'focus', fv: 'focus-visible', a: 'active', fw: 'focus-within',
};

/**
 * Inject a pseudo-class atom.
 * @param {string} className — e.g. '_h:bgprimary'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} prefix — 'h'|'f'|'fv'|'a'|'fw'
 */
export function injectPseudo(className: string, declaration: string, prefix: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:').replace(/\//g, '\\/').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/%/g, '\\%').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/,/g, '\\,').replace(/\+/g, '\\+');
  const pseudo = PSEUDO_MAP[prefix];
  atomBuffer.push(`@layer d.atoms{.${escaped}:${pseudo}{${declaration}}}`);
  scheduleFlush();
}

/**
 * Inject a responsive + pseudo-class atom.
 * @param {string} className — e.g. '_sm:h:bgprimary'
 * @param {string} declaration — CSS declaration(s)
 * @param {string} bp — breakpoint key (sm|md|lg|xl)
 * @param {string} pseudo — pseudo-class name (hover|focus|focus-visible|active|focus-within)
 */
export function injectResponsivePseudo(className: string, declaration: string, bp: string, pseudo: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:').replace(/\//g, '\\/').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/%/g, '\\%').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/,/g, '\\,').replace(/\+/g, '\\+');
  if (!bpBuffers[bp]) bpBuffers[bp] = [];
  bpBuffers[bp].push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){.${escaped}:${pseudo}{${declaration}}}}`);
  scheduleFlush();
}

export function extractCSS(): string {
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

export function getInjectedClasses(): Set<string> {
  return new Set(injected);
}

export function reset(): void {
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
