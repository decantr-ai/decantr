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

  // Textarea structure
  '.d-textarea-wrap{display:flex}',
  '.d-textarea{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:0.5rem 0.75rem;min-height:4rem}',
  '.d-textarea[disabled]{cursor:not-allowed;opacity:0.5}',

  // Checkbox structure
  '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none}',
  '.d-checkbox-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-checkbox-check{display:flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0}',
  '.d-checkbox-label{font-size:0.875rem}',
  '.d-checkbox-native:disabled~.d-checkbox-check{opacity:0.5;cursor:not-allowed}',
  '.d-checkbox-native:disabled~.d-checkbox-label{opacity:0.5;cursor:not-allowed}',

  // Switch structure
  '.d-switch{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none}',
  '.d-switch-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-switch-track{position:relative;width:40px;height:22px;border-radius:11px;flex-shrink:0}',
  '.d-switch-thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%}',
  '.d-switch-checked .d-switch-thumb{left:20px}',
  '.d-switch-label{font-size:0.875rem}',
  '.d-switch-native:disabled~.d-switch-track{opacity:0.5;cursor:not-allowed}',

  // Select structure
  '.d-select-wrap{position:relative;display:inline-flex;flex-direction:column}',
  '.d-select{display:flex;align-items:center;justify-content:space-between;gap:0.5rem;width:100%;font:inherit;font-size:0.875rem;padding:0.5rem 0.75rem;cursor:pointer;outline:none;text-align:left}',
  '.d-select[disabled]{cursor:not-allowed;opacity:0.5}',
  '.d-select-display{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-select-arrow{flex-shrink:0;font-size:0.75rem}',
  '.d-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:1001;max-height:200px;overflow:auto;margin-top:2px}',
  '.d-select-option{padding:0.5rem 0.75rem;cursor:pointer;font-size:0.875rem}',
  '.d-select-option-disabled{opacity:0.5;cursor:not-allowed}',
  '.d-select-placeholder{color:var(--c4)}',

  // Tabs structure
  '.d-tabs{display:flex;flex-direction:column}',
  '.d-tabs-list{display:flex;gap:0}',
  '.d-tab{font:inherit;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;cursor:pointer;outline:none;background:transparent;border:none}',
  '.d-tab:focus-visible{outline:2px solid var(--c1);outline-offset:-2px}',
  '.d-tabs-panel{padding:1rem 0}',

  // Accordion structure
  '.d-accordion{display:flex;flex-direction:column}',
  '.d-accordion-item{overflow:hidden}',
  '.d-accordion-trigger{display:flex;align-items:center;justify-content:space-between;width:100%;font:inherit;font-size:0.875rem;font-weight:500;padding:0.75rem 1rem;cursor:pointer;outline:none;background:transparent;border:none;text-align:left}',
  '.d-accordion-trigger:focus-visible{outline:2px solid var(--c1);outline-offset:-2px}',
  '.d-accordion-icon{font-size:0.75rem;transition:transform 0.2s}',
  '.d-accordion-open .d-accordion-icon{transform:rotate(180deg)}',
  '.d-accordion-content{padding:0 1rem 0.75rem}',

  // Separator structure
  '.d-separator{border:none;margin:0.75rem 0}',
  '.d-separator-vertical{display:inline-block;width:1px;height:1em;margin:0 0.5rem;vertical-align:middle}',
  'div.d-separator{display:flex;align-items:center;gap:0.75rem}',
  '.d-separator-line{flex:1;height:1px}',
  '.d-separator-label{font-size:0.75rem;white-space:nowrap}',

  // Breadcrumb structure
  '.d-breadcrumb-list{display:flex;align-items:center;gap:0.25rem;list-style:none;margin:0;padding:0;flex-wrap:wrap}',
  '.d-breadcrumb-item{display:flex;align-items:center;gap:0.25rem}',
  '.d-breadcrumb-link{font:inherit;font-size:0.875rem;text-decoration:none;cursor:pointer;background:transparent;border:none;padding:0}',
  '.d-breadcrumb-separator{font-size:0.75rem}',
  '.d-breadcrumb-current{font-size:0.875rem;font-weight:500}',

  // Table structure
  '.d-table-wrap{overflow-x:auto}',
  '.d-table{width:100%;border-collapse:collapse;font-size:0.875rem}',
  '.d-th{text-align:left;font-weight:600;padding:0.75rem}',
  '.d-td{padding:0.75rem}',
  '.d-table-compact .d-th,.d-table-compact .d-td{padding:0.375rem 0.75rem}',

  // Avatar structure
  '.d-avatar{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;overflow:hidden;flex-shrink:0}',
  '.d-avatar-sm{width:24px;height:24px;font-size:0.625rem}',
  '.d-avatar-lg{width:48px;height:48px;font-size:1rem}',
  '.d-avatar-img{width:100%;height:100%;object-fit:cover}',
  '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:0.75rem;font-weight:600}',

  // Progress structure
  '.d-progress{position:relative;width:100%;height:8px;overflow:hidden}',
  '.d-progress-bar{height:100%;transition:width 0.3s ease}',
  '.d-progress-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.625rem;font-weight:600;line-height:1}',

  // Skeleton structure
  '@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
  '.d-skeleton{animation:d-shimmer 1.5s infinite linear}',
  '.d-skeleton-text{height:0.875rem;border-radius:4px;margin-bottom:0.5rem}',
  '.d-skeleton-rect{border-radius:4px}',
  '.d-skeleton-circle{border-radius:50%}',
  '.d-skeleton-group{display:flex;flex-direction:column}',

  // Tooltip structure
  '.d-tooltip-wrap{position:relative;display:inline-flex}',
  '.d-tooltip{position:absolute;z-index:1002;padding:0.375rem 0.625rem;font-size:0.75rem;line-height:1.4;white-space:nowrap;pointer-events:none}',
  '.d-tooltip-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:6px}',
  '.d-tooltip-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:6px}',
  '.d-tooltip-left{right:100%;top:50%;transform:translateY(-50%);margin-right:6px}',
  '.d-tooltip-right{left:100%;top:50%;transform:translateY(-50%);margin-left:6px}',

  // Alert structure
  '.d-alert{display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem 1rem;font-size:0.875rem}',
  '.d-alert-icon{flex-shrink:0;font-size:1.125rem;line-height:1}',
  '.d-alert-body{flex:1;min-width:0}',
  '.d-alert-dismiss{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:1.125rem;line-height:1;padding:0}',

  // Toast structure
  '.d-toast-container{position:fixed;z-index:1100;display:flex;flex-direction:column;gap:0.5rem;pointer-events:none;max-width:360px}',
  '.d-toast-top-right{top:1rem;right:1rem}',
  '.d-toast-top-left{top:1rem;left:1rem}',
  '.d-toast-bottom-right{bottom:1rem;right:1rem}',
  '.d-toast-bottom-left{bottom:1rem;left:1rem}',
  '.d-toast{display:flex;align-items:center;gap:0.5rem;padding:0.75rem 1rem;font-size:0.875rem;pointer-events:auto}',
  '.d-toast-message{flex:1}',
  '.d-toast-close{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:1rem;line-height:1;padding:0}',
  '@keyframes d-toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
  '.d-toast{animation:d-toast-in 0.2s ease}',
  '.d-toast-exit{opacity:0;transform:translateY(-8px);transition:all 0.2s ease}',

  // Reduced motion
  '@media(prefers-reduced-motion:reduce){.d-btn,.d-card,.d-input-wrap,.d-badge,.d-badge-dot,.d-modal-overlay,.d-modal-content,.d-btn-loading::after,.d-textarea-wrap,.d-checkbox-check,.d-switch-track,.d-switch-thumb,.d-select,.d-select-dropdown,.d-tab,.d-accordion-icon,.d-accordion-content,.d-progress-bar,.d-skeleton,.d-tooltip,.d-toast,.d-toast-exit{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
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
