/**
 * Decantr CSS Runtime - CSS injection and extraction.
 * Ported from decantr-framework/src/css/runtime.js
 */

/** Set of injected class names (prevents duplicates) */
const injected = new Set<string>();

/** Responsive breakpoints (mobile-first, min-width) */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
const BP_ORDER = ['sm', 'md', 'lg', 'xl'] as const;

/** Container query breakpoints */
export const CQ_WIDTHS = [320, 480, 640, 768, 1024] as const;

/** CSS cascade layer order declaration */
const LAYER_ORDER = '@layer d.base,d.theme,d.atoms,d.user;';

// Buffered injection - rules are buffered and flushed to DOM in batches via microtask
let atomBuffer: string[] = [];
let bpBuffers: Record<string, string[]> = {};
let cqBuffer: string[] = [];
let flushScheduled = false;

// DOM elements (browser only)
let styleEl: HTMLStyleElement | null = null;
let layerEl: HTMLStyleElement | null = null;
let bpEls: Record<string, HTMLStyleElement> | null = null;
let cqEl: HTMLStyleElement | null = null;

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(flushBuffers);
  } else {
    Promise.resolve().then(flushBuffers);
  }
}

function flushBuffers(): void {
  flushScheduled = false;
  if (atomBuffer.length) {
    const el = getStyleElement();
    if (el) el.textContent = (el.textContent || '') + atomBuffer.join('');
    atomBuffer = [];
  }
  if (Object.keys(bpBuffers).length) {
    const els = ensureBpElements();
    if (els) {
      for (const bp of BP_ORDER) {
        if (bpBuffers[bp]?.length) {
          els[bp].textContent = (els[bp].textContent || '') + bpBuffers[bp].join('');
          bpBuffers[bp] = [];
        }
      }
    }
    bpBuffers = {};
  }
  if (cqBuffer.length) {
    const el = ensureCqElement();
    if (el) el.textContent = (el.textContent || '') + cqBuffer.join('');
    cqBuffer = [];
  }
}

function ensureLayerOrder(): void {
  if (layerEl) return;
  if (typeof document === 'undefined') return;
  layerEl = document.createElement('style');
  layerEl.setAttribute('data-decantr-layers', '');
  layerEl.textContent = LAYER_ORDER;
  document.head.prepend(layerEl);
}

function getStyleElement(): HTMLStyleElement | null {
  if (!styleEl) {
    if (typeof document === 'undefined') return null;
    ensureLayerOrder();
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

function ensureBpElements(): Record<string, HTMLStyleElement> | null {
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

function ensureCqElement(): HTMLStyleElement | null {
  if (cqEl) return cqEl;
  if (typeof document === 'undefined') return null;
  getStyleElement();
  cqEl = document.createElement('style');
  cqEl.setAttribute('data-decantr-cq', '');
  document.head.appendChild(cqEl);
  return cqEl;
}

/**
 * Inject a CSS rule for a class.
 * @param className - The class name (e.g., '_flex')
 * @param declaration - CSS declaration(s) (e.g., 'display:flex')
 * @param escapedName - Pre-escaped class name for special chars
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
 * @param className - e.g., '_sm:gc3'
 * @param declaration - CSS declaration(s)
 * @param bp - breakpoint key (sm|md|lg|xl)
 */
export function injectResponsive(className: string, declaration: string, bp: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  if (!bpBuffers[bp]) bpBuffers[bp] = [];
  bpBuffers[bp].push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp as keyof typeof BREAKPOINTS]}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/**
 * Inject a pseudo-class atom.
 * @param className - e.g., '_h:bgprimary'
 * @param declaration - CSS declaration(s)
 * @param prefix - 'h'|'f'|'fv'|'a'|'fw'
 */
export function injectPseudo(className: string, declaration: string, prefix: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = escapeSelector(className);
  const PSEUDO_MAP: Record<string, string> = {
    h: 'hover', f: 'focus', fv: 'focus-visible', a: 'active', fw: 'focus-within',
  };
  const pseudo = PSEUDO_MAP[prefix];
  atomBuffer.push(`@layer d.atoms{.${escaped}:${pseudo}{${declaration}}}`);
  scheduleFlush();
}

/**
 * Inject a responsive + pseudo-class atom.
 * @param className - e.g., '_sm:h:bgprimary'
 * @param declaration - CSS declaration(s)
 * @param bp - breakpoint key
 * @param pseudo - pseudo-class name
 */
export function injectResponsivePseudo(className: string, declaration: string, bp: string, pseudo: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = escapeSelector(className);
  if (!bpBuffers[bp]) bpBuffers[bp] = [];
  bpBuffers[bp].push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp as keyof typeof BREAKPOINTS]}px){.${escaped}:${pseudo}{${declaration}}}}`);
  scheduleFlush();
}

/**
 * Inject a container query-wrapped atom.
 * @param className - e.g., '_cq640:gc3'
 * @param declaration - CSS declaration(s)
 * @param width - container min-width in px
 */
export function injectContainer(className: string, declaration: string, width: number): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  cqBuffer.push(`@layer d.atoms{@container(min-width:${width}px){.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/**
 * Inject a group/peer state atom.
 * @param className - e.g., '_gh:fgprimary'
 * @param declaration - CSS declaration(s)
 * @param prefix - 'gh'|'gf'|'ga'|'ph'|'pf'|'pa'
 */
export function injectGroupPeer(className: string, declaration: string, prefix: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = escapeSelector(className);
  const GP_STATE: Record<string, [string, string]> = {
    gh: ['group', 'hover'], gf: ['group', 'focus-within'], ga: ['group', 'active'],
    ph: ['peer', 'hover'], pf: ['peer', 'focus'], pa: ['peer', 'active'],
  };
  const [kind, state] = GP_STATE[prefix];
  const combinator = kind === 'group' ? ' ' : ' ~ ';
  atomBuffer.push(`@layer d.atoms{.d-${kind}:${state}${combinator}.${escaped}{${declaration}}}`);
  scheduleFlush();
}

/**
 * Inject a media query-wrapped atom.
 * @param className - e.g., '_motionSafe:trans'
 * @param declaration - CSS declaration(s)
 * @param query - media query string
 */
export function injectMediaQuery(className: string, declaration: string, query: string): void {
  if (injected.has(className)) return;
  injected.add(className);
  if (typeof document === 'undefined') return;
  const escaped = className.replace(/:/g, '\\:');
  atomBuffer.push(`@layer d.atoms{@media${query}{.${escaped}{${declaration}}}}`);
  scheduleFlush();
}

/** Escape special characters in a CSS selector */
function escapeSelector(className: string): string {
  return className
    .replace(/:/g, '\\:')
    .replace(/\//g, '\\/')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/,/g, '\\,')
    .replace(/\+/g, '\\+');
}

/**
 * Extract all injected CSS as a string (for SSR).
 */
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

/**
 * Get set of injected class names.
 */
export function getInjectedClasses(): Set<string> {
  return new Set(injected);
}

/**
 * Reset all injected styles (for testing).
 */
export function reset(): void {
  injected.clear();
  atomBuffer = [];
  bpBuffers = {};
  cqBuffer = [];
  flushScheduled = false;
  if (layerEl) layerEl.textContent = LAYER_ORDER;
  if (styleEl) styleEl.textContent = '';
  if (bpEls) {
    for (const bp of BP_ORDER) {
      if (bpEls[bp]) bpEls[bp].textContent = '';
    }
  }
  if (cqEl) cqEl.textContent = '';
}
