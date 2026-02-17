/**
 * Base structural CSS for all components.
 * Injected once on first component render.
 * Visual styling comes from the active design style (src/css/styles.js).
 */

let injected = false;

const BASE_CSS = [
  // Button structure
  '.d-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;font-family:inherit;font-size:0.875rem;font-weight:500;line-height:1;padding:0.5rem 1rem;cursor:pointer;user-select:none;white-space:nowrap;outline:none;text-decoration:none}',
  '.d-btn[disabled]{cursor:not-allowed;pointer-events:none}',
  '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
  '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}',
  '.d-btn-block{display:flex;width:100%}',
  '@keyframes d-spin{to{transform:rotate(360deg)}}',
  '.d-btn-loading{position:relative;color:transparent !important}',
  '.d-btn-loading::after{content:"";position:absolute;width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:d-spin 0.6s linear infinite;color:var(--c3)}',
  '.d-btn-primary.d-btn-loading::after,.d-btn-destructive.d-btn-loading::after,.d-btn-success.d-btn-loading::after,.d-btn-warning.d-btn-loading::after{color:#fff}',
  '.d-btn-outline.d-btn-loading::after{color:var(--c1)}',

  // Input structure
  '.d-input-wrap{display:flex;align-items:center}',
  '.d-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:0.5rem 0.75rem}',
  '.d-input-prefix,.d-input-suffix{display:flex;align-items:center;padding:0 0.5rem;color:var(--c4);flex-shrink:0}',
  '.d-input[disabled]{cursor:not-allowed;opacity:0.5}',

  // Card structure
  '.d-card{overflow:hidden}',
  '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem}',
  '.d-card-body{padding:1.25rem}',
  '.d-card-footer{padding:0 1.25rem 1.25rem}',

  // Badge structure
  '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500;line-height:1.5;vertical-align:middle}',
  '.d-badge-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',
  '.d-badge-wrapper{position:relative;display:inline-flex}',
  '.d-badge-sup{position:absolute;top:-4px;right:-4px;z-index:1}',

  // Modal structure
  '.d-modal-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1000}',
  '.d-modal-content{max-width:90vw;max-height:85vh;overflow:auto}',
  '.d-modal-header{display:flex;justify-content:space-between;align-items:center}',
  '.d-modal-footer{display:flex;justify-content:flex-end;gap:0.5rem}',
  '.d-modal-close{cursor:pointer;line-height:1}',

  // Reduced motion
  '@media(prefers-reduced-motion:reduce){.d-btn,.d-card,.d-input-wrap,.d-badge,.d-badge-dot,.d-modal-overlay,.d-modal-content,.d-btn-loading::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
].join('');

export function injectBase() {
  if (injected) return;
  if (typeof document === 'undefined') return;
  injected = true;
  let el = document.querySelector('[data-decantr-base]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-decantr-base', '');
    document.head.appendChild(el);
  }
  el.textContent = BASE_CSS;
}

/**
 * Merge class names, filtering falsy values.
 * @param {...(string|false|null|undefined)} classes
 * @returns {string}
 */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function resetBase() {
  injected = false;
}
