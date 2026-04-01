/**
 * Shared structural CSS used by multiple Decantr components.
 * Contains: reset, utilities (sr-only, skip-link), field base styles,
 * icon system, animations, and shared option/disclosure styles.
 *
 * Components that only need shared CSS call injectSharedCSS().
 * Components that need their own CSS also call injectCSS('component-name', CSS).
 */
import { injectCSS } from '../runtime/css-inject.js';
import { createEffect } from '../state/index.js';

// ─── SHARED CSS ──────────────────────────────────────────────────────────────
// Reset, utilities, field base, icon, animations, shared option, disclosure

const SHARED_CSS = [
  // ═══════════════════════════════════════════════════════════════
  // RESET (inside @layer d.base so atoms can override)
  // ═══════════════════════════════════════════════════════════════
  '*,*::before,*::after{margin:0;box-sizing:border-box}',

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════
  '.d-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
  '.d-skip-link{position:absolute;top:-100%;left:0;z-index:9999;padding:0.75rem 1.5rem;background:var(--d-bg);color:var(--d-fg);border:2px solid var(--d-primary);border-radius:var(--d-radius);font-weight:600;text-decoration:none;opacity:0;pointer-events:none;transition:top 0.15s,opacity 0.15s}',
  '.d-skip-link:focus{top:0.5rem;left:0.5rem;opacity:1;pointer-events:auto;outline:2px solid var(--d-ring);outline-offset:2px}',

  // ═══════════════════════════════════════════════════════════════
  // FIELD SIZING (density tier overrides)
  // ═══════════════════════════════════════════════════════════════
  '.d-field-xs{--d-density-min-h:var(--d-field-h-xs);--d-density-pad-y:var(--d-field-py-xs);--d-density-pad-x:var(--d-field-px-xs);--d-density-text:var(--d-field-text-xs);--d-density-gap:var(--d-field-gap-xs)}',
  '.d-field-sm{--d-density-min-h:var(--d-field-h-sm);--d-density-pad-y:var(--d-field-py-sm);--d-density-pad-x:var(--d-field-px-sm);--d-density-text:var(--d-field-text-sm);--d-density-gap:var(--d-field-gap-sm)}',
  '.d-field-lg{--d-density-min-h:var(--d-field-h-lg);--d-density-pad-y:var(--d-field-py-lg);--d-density-pad-x:var(--d-field-px-lg);--d-density-text:var(--d-field-text-lg);--d-density-gap:var(--d-field-gap-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // FIELD VISUAL BASE (border, background, transitions, states)
  // ═══════════════════════════════════════════════════════════════
  '.d-field{background:var(--d-field-bg);border:var(--d-group-border,var(--d-field-border-width)) var(--d-border-style) var(--d-field-border);border-radius:var(--d-group-radius,var(--d-field-radius));transition:border-color var(--d-duration-fast) var(--d-easing-standard),box-shadow var(--d-duration-fast) var(--d-easing-standard),background var(--d-duration-fast) var(--d-easing-standard);color:var(--d-fg)}',
  '.d-field:hover:not(:disabled,[aria-disabled],[data-disabled]){border-color:var(--d-field-border-hover);background:var(--d-field-bg-hover)}',
  '.d-field:focus-within:not(:disabled,[aria-disabled],[data-disabled]){border-color:var(--d-field-border-focus);box-shadow:var(--d-group-shadow,var(--d-field-ring))}',
  '.d-field[data-error]{border-color:var(--d-field-border-error);background:var(--d-field-bg-error)}',
  '.d-field[data-error]:focus-within{box-shadow:var(--d-field-ring-error)}',
  '.d-field[data-success]{border-color:var(--d-field-border-success);background:var(--d-field-bg-success)}',
  '.d-field[data-success]:focus-within{box-shadow:var(--d-field-ring-success)}',
  '.d-field[aria-disabled],.d-field[data-disabled]{opacity:var(--d-disabled-opacity);background:var(--d-field-bg-disabled);border-color:var(--d-field-border-disabled);cursor:not-allowed}',
  '.d-field[readonly]{background:var(--d-field-bg-readonly)}',
  '.d-field::placeholder{color:var(--d-field-placeholder)}',
  // Field variant modifiers
  '.d-field-outlined{/* default — inherits .d-field as-is */}',
  '.d-field-filled{--d-field-bg:var(--d-surface-1);--d-field-border:transparent;--d-field-border-hover:transparent}',
  '.d-field-ghost{--d-field-bg:transparent;--d-field-border:transparent;--d-field-border-hover:transparent}',
  '.d-field-ghost:focus-within{--d-field-border:var(--d-field-border-focus)}',
  'button,input,select,textarea{color:inherit}',

  // ═══════════════════════════════════════════════════════════════
  // ICON SYSTEM
  // ═══════════════════════════════════════════════════════════════
  '.d-i{display:inline-block;vertical-align:middle;background:currentColor;mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;flex-shrink:0}',

  // ═══════════════════════════════════════════════════════════════
  // CARET (shared chevron for dropdowns, accordions, trees)
  // ═══════════════════════════════════════════════════════════════
  '.d-caret{transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease);flex-shrink:0;display:inline-flex;align-items:center}',
  '.d-caret-open{transform:rotate(180deg)}',
  '.d-caret-open-90{transform:rotate(90deg)}',
  '.d-select-open .d-caret,.d-combobox-open .d-caret,.d-cascader-open > .d-cascader-trigger .d-caret,.d-treeselect-open > .d-treeselect-trigger .d-caret{transform:rotate(180deg)}',

  // ═══════════════════════════════════════════════════════════════
  // ANIMATIONS
  // ═══════════════════════════════════════════════════════════════
  '@keyframes d-spin{to{transform:rotate(360deg)}}',
  '@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
  '@keyframes d-fadein{from{opacity:0}to{opacity:1}}',
  '@keyframes d-fadeout{from{opacity:1}to{opacity:0}}',
  '@keyframes d-slidein-b{from{opacity:0;transform:translateY(var(--d-slide-distance))}to{opacity:1;transform:translateY(0)}}',
  '@keyframes d-slidein-t{from{opacity:0;transform:translateY(calc(var(--d-slide-distance) * -1))}to{opacity:1;transform:translateY(0)}}',
  '@keyframes d-slidein-l{from{opacity:0;transform:translateX(calc(var(--d-slide-distance) * -1))}to{opacity:1;transform:translateX(0)}}',
  '@keyframes d-slidein-r{from{opacity:0;transform:translateX(var(--d-slide-distance))}to{opacity:1;transform:translateX(0)}}',
  '@keyframes d-scalein{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
  '@keyframes d-scaleout{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.95)}}',
  '@keyframes d-slideout-t{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(calc(var(--d-slide-distance) * -1))}}',
  '@keyframes d-slideout-b{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(var(--d-slide-distance))}}',
  '@keyframes d-slideout-l{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(calc(var(--d-slide-distance) * -1))}}',
  '@keyframes d-slideout-r{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(var(--d-slide-distance))}}',
  '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
  '.d-page-enter{animation:d-fadein var(--d-duration-normal) var(--d-easing-decelerate) both}',
  '@keyframes d-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}',

  // ═══════════════════════════════════════════════════════════════
  // SHARED OPTION (used by Select, Combobox, Command, Dropdown, etc.)
  // ═══════════════════════════════════════════════════════════════
  '.d-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none}',
  '.d-option:hover{background:var(--d-item-hover-bg)}',
  '.d-option-active{background:var(--d-item-hover-bg)}',
  '.d-option-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-option-selected{font-weight:var(--d-fw-medium,500)}',

  // ═══════════════════════════════════════════════════════════════
  // DISCLOSURE REGION (shared by Accordion, Collapsible, Tree)
  // ═══════════════════════════════════════════════════════════════
  '.d-disclosure-region{transition:height var(--d-duration-normal) var(--d-easing-decelerate);overflow:hidden}',

  // ═══════════════════════════════════════════════════════════════
  // OVERLAY EXIT ANIMATION
  // ═══════════════════════════════════════════════════════════════
  // (no explicit class defined in _base.js, but exit animation uses d-overlay-exit)

  // ═══════════════════════════════════════════════════════════════
  // REDUCED MOTION
  // ═══════════════════════════════════════════════════════════════
  '@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}',

  // ═══════════════════════════════════════════════════════════════
  // SCROLLBAR DEFAULTS
  // ═══════════════════════════════════════════════════════════════
  '::-webkit-scrollbar{width:var(--d-scrollbar-w);height:var(--d-scrollbar-w)}',
  '::-webkit-scrollbar-track{background:var(--d-scrollbar-track)}',
  '::-webkit-scrollbar-thumb{background:var(--d-scrollbar-thumb);border-radius:var(--d-radius-full)}',
  '::-webkit-scrollbar-thumb:hover{background:var(--d-scrollbar-thumb-hover)}',

  // ═══════════════════════════════════════════════════════════════
  // CORE WRAPPER ELEMENTS
  // ═══════════════════════════════════════════════════════════════
  'd-cond,d-list{display:contents}',
  'd-route{display:block;view-transition-name:d-route;contain:layout;outline:none}',
].join('');

/**
 * Inject shared CSS that multiple components depend on.
 * Idempotent — only injects once.
 */
export function injectSharedCSS(): void {
  injectCSS('_shared', SHARED_CSS);
}

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────
// Used by virtually every component.

/**
 * Merge class names, filtering falsy values.
 * @param classes - Class names or falsy values
 * @returns Joined class string
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Toggle a boolean attribute reactively.
 * @param el - Target element
 * @param prop - Static boolean or signal getter
 * @param attr - Attribute name
 */
export function reactiveAttr(el: HTMLElement, prop: boolean | (() => boolean) | undefined, attr: string): void {
  if (typeof prop === 'function') {
    createEffect(() => { prop() ? el.setAttribute(attr, '') : el.removeAttribute(attr); });
  } else if (prop) {
    el.setAttribute(attr, '');
  }
}

/**
 * Toggle a CSS class reactively.
 * @param el - Target element
 * @param prop - Static boolean or signal getter
 * @param baseClass - Always-present class
 * @param activeClass - Class added when prop is truthy
 */
export function reactiveClass(el: HTMLElement, prop: boolean | (() => boolean) | undefined, baseClass: string, activeClass: string): void {
  if (typeof prop === 'function') {
    createEffect(() => { el.className = prop() ? cx(baseClass, activeClass) : baseClass; });
  } else if (prop) {
    el.className = cx(baseClass, activeClass);
  }
}

/**
 * Sync a DOM property reactively.
 * @param el - Target element
 * @param prop - Static value or signal getter
 * @param domProp - DOM property name to set
 */
export function reactiveProp(el: HTMLElement, prop: unknown | (() => unknown) | undefined, domProp: string): void {
  if (typeof prop === 'function') {
    createEffect(() => { (el as any)[domProp] = (prop as () => unknown)(); });
  } else if (prop !== undefined) {
    (el as any)[domProp] = prop;
  }
}

/**
 * Resolve a prop that may be a static value or signal getter.
 * @param prop - Static value or signal getter
 * @returns Resolved value
 */
export function resolve<T>(prop: T | (() => T)): T {
  return typeof prop === 'function' ? (prop as () => T)() : prop;
}
