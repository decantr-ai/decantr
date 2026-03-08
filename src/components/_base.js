/**
 * Base structural CSS for all components.
 * Injected once on first component render.
 * Visual styling comes from the active design style (src/css/styles.js).
 */
import { createEffect } from '../state/index.js';

let injected = false;

const BASE_CSS = [
  // Button structure
  '.d-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-sp-2);font-family:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);padding:var(--d-sp-2) var(--d-sp-4);cursor:pointer;user-select:none;white-space:nowrap;outline:none;text-decoration:none}',
  '.d-btn[disabled]{cursor:not-allowed;pointer-events:none}',
  '.d-btn-sm{font-size:var(--d-text-sm);padding:var(--d-sp-1-5) var(--d-sp-3)}',
  '.d-btn-lg{font-size:var(--d-text-md);padding:var(--d-sp-2-5) var(--d-sp-6)}',
  '.d-btn-xs{font-size:0.6875rem;padding:var(--d-sp-1) var(--d-sp-2);gap:var(--d-sp-1)}',
  '.d-btn-icon{padding:var(--d-sp-2);aspect-ratio:1}',
  '.d-btn-icon-xs{padding:var(--d-sp-1);aspect-ratio:1;font-size:0.6875rem}',
  '.d-btn-icon-sm{padding:var(--d-sp-1-5);aspect-ratio:1;font-size:var(--d-text-sm)}',
  '.d-btn-icon-lg{padding:var(--d-sp-2-5);aspect-ratio:1;font-size:var(--d-text-md)}',
  '.d-btn-block{display:flex;width:100%}',
  '.d-btn-rounded{border-radius:9999px}',
  '.d-btn-group{display:inline-flex}',
  '.d-btn-group>.d-btn{border-radius:0}',
  '.d-btn-group>.d-btn:first-child{border-top-left-radius:var(--d-radius);border-bottom-left-radius:var(--d-radius)}',
  '.d-btn-group>.d-btn:last-child{border-top-right-radius:var(--d-radius);border-bottom-right-radius:var(--d-radius)}',
  '.d-btn-group>.d-btn:not(:first-child){margin-left:-1px}',
  '@keyframes d-spin{to{transform:rotate(360deg)}}',
  '.d-btn-loading{position:relative;cursor:wait;color:transparent !important}',
  '.d-btn-loading>*:not(.d-btn-spinner){visibility:hidden}',
  '.d-btn-spinner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}',
  '.d-spinner{display:inline-block}',
  '.d-spinner-xs{width:12px;height:12px}',
  '.d-spinner-sm{width:16px;height:16px}',
  '.d-spinner-lg{width:28px;height:28px}',
  '.d-spinner-arc{animation:d-spin 0.75s linear infinite}',
  '.d-spinner-wrap{display:inline-flex;align-items:center;justify-content:center}',
  '.d-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',

  // Input structure
  '.d-input-wrap{display:flex;align-items:center}',
  '.d-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-input-prefix,.d-input-suffix{display:flex;align-items:center;padding:0 var(--d-sp-2);color:var(--c4);flex-shrink:0}',
  '.d-input[disabled]{cursor:not-allowed;opacity:0.5}',

  // Card structure
  '.d-card{display:flex;flex-direction:column;overflow:hidden}',
  '.d-card-header{padding:var(--d-pad,1.25rem);font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-card-body{padding:0 var(--d-pad,1.25rem) var(--d-pad,1.25rem)}',
  '.d-card-body:first-child{padding-top:var(--d-pad,1.25rem)}',
  '.d-card-footer{padding:var(--d-sp-3,0.75rem) var(--d-pad,1.25rem) var(--d-pad,1.25rem)}',

  // Badge structure
  '.d-badge{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);padding:var(--d-sp-1) var(--d-sp-2);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);vertical-align:middle}',
  '.d-badge-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',
  '.d-badge-wrapper{position:relative;display:inline-flex}',
  '.d-badge-sup{position:absolute;top:-4px;right:-4px;z-index:1}',

  // Modal structure (native <dialog>)
  'dialog.d-modal-content{border:0;padding:0;max-width:90vw;max-height:85vh;overflow:auto}',
  'dialog.d-modal-content::backdrop{background:rgba(0,0,0,0.3)}',
  '.d-modal-header{display:flex;justify-content:space-between;align-items:center;padding:var(--d-pad,1.25rem) var(--d-pad,1.25rem) 0}',
  '.d-modal-body{padding:var(--d-pad,1.25rem)}',
  '.d-modal-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:0 var(--d-pad,1.25rem) var(--d-pad,1.25rem)}',
  '.d-modal-close{cursor:pointer;line-height:1}',

  // Textarea structure
  '.d-textarea-wrap{display:flex}',
  '.d-textarea{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);min-height:4rem}',
  '.d-textarea[disabled]{cursor:not-allowed;opacity:0.5}',

  // Checkbox structure
  '.d-checkbox{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-checkbox-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-checkbox-check{display:flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0}',
  '.d-checkbox-label{font-size:var(--d-text-base)}',
  '.d-checkbox-native:disabled~.d-checkbox-check{opacity:0.5;cursor:not-allowed}',
  '.d-checkbox-native:disabled~.d-checkbox-label{opacity:0.5;cursor:not-allowed}',

  // Switch structure
  '.d-switch{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-switch-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-switch-track{position:relative;width:40px;height:22px;border-radius:11px;flex-shrink:0}',
  '.d-switch-thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%}',
  '.d-switch:has(:checked) .d-switch-thumb{left:20px}',
  '.d-switch-label{font-size:var(--d-text-base)}',
  '.d-switch-native:disabled~.d-switch-track{opacity:0.5;cursor:not-allowed}',

  // Select structure
  '.d-select-wrap{position:relative;display:inline-flex;flex-direction:column}',
  '.d-select{display:flex;align-items:center;justify-content:space-between;gap:var(--d-sp-2);width:100%;font:inherit;font-size:var(--d-text-base);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;outline:none;text-align:left}',
  '.d-select[disabled]{cursor:not-allowed;opacity:0.5}',
  '.d-select-display{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-select-arrow{flex-shrink:0;font-size:var(--d-text-sm)}',
  '.d-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:1001;max-height:200px;overflow:auto;margin-top:2px}',
  '.d-select-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base)}',
  '.d-select-option-disabled{opacity:0.5;cursor:not-allowed}',
  '.d-select-placeholder{color:var(--c4)}',

  // Tabs structure
  '.d-tabs{display:flex;flex-direction:column}',
  '.d-tabs-list{display:flex;gap:0}',
  '.d-tab{font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-2-5) var(--d-sp-4);cursor:pointer;outline:none;background:transparent;border:none}',
  '.d-tab:focus-visible{outline:2px solid var(--c1);outline-offset:-2px}',
  '.d-tabs-panel{padding:var(--d-sp-4) 0}',

  // Accordion structure
  '.d-accordion{display:flex;flex-direction:column}',
  '.d-accordion-item{overflow:hidden}',
  '.d-accordion-trigger{display:flex;align-items:center;justify-content:space-between;width:100%;font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-4) var(--d-sp-5);cursor:pointer;outline:none;background:transparent;border:none;text-align:left}',
  '.d-accordion-trigger:focus-visible{outline:2px solid var(--c1);outline-offset:-2px}',
  '.d-accordion-icon{font-size:var(--d-text-sm);transition:transform 0.2s}',
  '.d-accordion-open .d-accordion-icon{transform:rotate(180deg)}',
  '.d-accordion-region{transition:height 0.25s ease-out}',
  '.d-accordion-content{padding:0 var(--d-sp-4) var(--d-sp-3)}',

  // Separator structure
  '.d-separator{border:none;margin:var(--d-sp-3) 0}',
  '.d-separator-vertical{display:inline-block;width:1px;height:1em;margin:0 var(--d-sp-2);vertical-align:middle}',
  'div.d-separator{display:flex;align-items:center;gap:var(--d-sp-3)}',
  '.d-separator-line{flex:1;height:1px}',
  '.d-separator-label{font-size:var(--d-text-sm);white-space:nowrap}',

  // Breadcrumb structure
  '.d-breadcrumb-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0;flex-wrap:wrap}',
  '.d-breadcrumb-item{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-breadcrumb-link{font:inherit;font-size:var(--d-text-base);text-decoration:none;cursor:pointer;background:transparent;border:none;padding:0}',
  '.d-breadcrumb-separator{font-size:var(--d-text-sm)}',
  '.d-breadcrumb-current{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500)}',

  // Table structure
  '.d-table-wrap{overflow-x:auto}',
  '.d-table{width:100%;border-collapse:collapse;font-size:var(--d-text-base)}',
  '.d-th{text-align:left;font-weight:600;padding:var(--d-sp-3)}',
  '.d-td{padding:var(--d-sp-3)}',
  '.d-table-compact .d-th,.d-table-compact .d-td{padding:var(--d-sp-1-5) var(--d-sp-3)}',

  // Avatar structure
  '.d-avatar{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;overflow:hidden;flex-shrink:0}',
  '.d-avatar-sm{width:24px;height:24px;font-size:var(--d-text-xs)}',
  '.d-avatar-lg{width:48px;height:48px;font-size:var(--d-text-md)}',
  '.d-avatar-img{width:100%;height:100%;object-fit:cover}',
  '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--d-text-sm);font-weight:600}',

  // Progress structure
  '.d-progress-wrap{position:relative;width:100%}',
  '.d-progress{position:relative;width:100%;height:8px;overflow:hidden}',
  '.d-progress-sm{height:4px}',
  '.d-progress-md{height:16px}',
  '.d-progress-lg{height:24px}',
  '.d-progress-bar{height:100%;transition:width 0.3s ease}',
  '.d-progress-label{font-size:var(--d-text-xs);font-weight:600;line-height:var(--d-lh-none);margin-top:var(--d-sp-1);text-align:right}',
  '.d-progress-md .d-progress-label,.d-progress-lg .d-progress-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;margin-top:0}',

  // Skeleton structure
  '@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
  '.d-skeleton{animation:d-shimmer 1.5s infinite linear}',
  '.d-skeleton-text{height:var(--d-text-base);border-radius:4px;margin-bottom:var(--d-sp-2)}',
  '.d-skeleton-rect{border-radius:4px}',
  '.d-skeleton-circle{border-radius:50%}',
  '.d-skeleton-group{display:flex;flex-direction:column}',

  // Popover API reset — override browser defaults for positioned popovers
  '.d-tooltip[popover],.d-popover-content[popover],.d-dropdown-menu[popover]{position:absolute;inset:auto;margin:0;border:0;overflow:visible;background:transparent;color:inherit}',

  // Tooltip structure
  '.d-tooltip-wrap{position:relative;display:inline-flex}',
  '.d-tooltip{z-index:1002;padding:var(--d-sp-1-5) var(--d-sp-2-5);font-size:var(--d-text-sm);line-height:1.4;white-space:nowrap;pointer-events:none}',
  '.d-tooltip-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:6px}',
  '.d-tooltip-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:6px}',
  '.d-tooltip-left{right:100%;top:50%;transform:translateY(-50%);margin-right:6px}',
  '.d-tooltip-right{left:100%;top:50%;transform:translateY(-50%);margin-left:6px}',

  // Alert structure
  '.d-alert{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base)}',
  '.d-alert-icon{flex-shrink:0;font-size:var(--d-text-lg);line-height:var(--d-lh-none)}',
  '.d-alert-body{flex:1;min-width:0}',
  '.d-alert-dismiss{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-lg);line-height:var(--d-lh-none);padding:0}',

  // Toast structure
  '.d-toast-container{position:fixed;z-index:1100;display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;max-width:360px}',
  '.d-toast-top-right{top:var(--d-sp-4);right:var(--d-sp-4)}',
  '.d-toast-top-left{top:var(--d-sp-4);left:var(--d-sp-4)}',
  '.d-toast-bottom-right{bottom:var(--d-sp-4);right:var(--d-sp-4)}',
  '.d-toast-bottom-left{bottom:var(--d-sp-4);left:var(--d-sp-4)}',
  '.d-toast{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base);pointer-events:auto}',
  '.d-toast-message{flex:1}',
  '.d-toast-close{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-md);line-height:var(--d-lh-none);padding:0}',
  '@keyframes d-toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
  '.d-toast{animation:d-toast-in 0.2s ease}',
  '.d-toast-exit{opacity:0;transform:translateY(-8px);transition:all 0.2s ease}',

  // Chip structure
  '.d-chip{display:inline-flex;align-items:center;gap:var(--d-sp-1-5);border-radius:9999px;padding:var(--d-sp-1) var(--d-sp-3);font-size:0.8125rem;font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal);cursor:default;transition:all 0.2s ease;white-space:nowrap;vertical-align:middle}',
  '.d-chip-sm{padding:0.125rem var(--d-sp-2);font-size:var(--d-text-sm);gap:var(--d-sp-1)}',
  '.d-chip-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-chip-label{overflow:hidden;text-overflow:ellipsis}',
  '.d-chip-remove{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;font-size:1em;line-height:var(--d-lh-none);padding:0;margin-left:0.125rem;opacity:0.6;transition:opacity 0.15s;font-family:inherit}',
  '.d-chip-remove:hover{opacity:1}',
  '.d-chip-interactive{cursor:pointer}',

  // Dropdown structure
  '.d-dropdown{position:relative;display:inline-flex}',
  '.d-dropdown-menu{top:100%;left:0;z-index:1001;min-width:180px;margin-top:4px;overflow:auto;max-height:320px}',
  '.d-dropdown-right{left:auto;right:0}',
  '.d-dropdown-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none}',
  '.d-dropdown-item-disabled{opacity:0.5;cursor:not-allowed}',
  '.d-dropdown-item-label{flex:1}',
  '.d-dropdown-item-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-dropdown-item-shortcut{flex-shrink:0;font-size:var(--d-text-sm);opacity:0.5}',
  '.d-dropdown-separator{height:1px;margin:var(--d-sp-1) 0}',

  // Drawer structure (native <dialog>)
  'dialog.d-drawer{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-drawer::backdrop{background:rgba(0,0,0,0.3)}',
  '.d-drawer-panel{position:absolute;display:flex;flex-direction:column;overflow:auto;outline:none}',
  '.d-drawer-left{top:0;bottom:0;left:0}',
  '.d-drawer-right{top:0;bottom:0;right:0}',
  '.d-drawer-top{top:0;left:0;right:0}',
  '.d-drawer-bottom{bottom:0;left:0;right:0}',
  '.d-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-pad,1.25rem)}',
  '.d-drawer-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-drawer-close{cursor:pointer;line-height:1;background:transparent;border:none;font-size:var(--d-text-xl);padding:0.25rem}',
  '.d-drawer-body{flex:1;overflow:auto;padding:0 var(--d-pad,1.25rem) var(--d-pad,1.25rem)}',

  // Pagination structure
  '.d-pagination{display:flex;align-items:center}',
  '.d-pagination-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0}',
  '.d-pagination-btn{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;padding:0 var(--d-sp-2);font:inherit;font-size:var(--d-text-base);cursor:pointer;outline:none;background:transparent;border:none}',
  '.d-pagination-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
  '.d-pagination-disabled{opacity:0.4;cursor:not-allowed;pointer-events:none}',
  '.d-pagination-ellipsis{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;font-size:var(--d-text-base)}',

  // RadioGroup structure
  '.d-radiogroup{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-radiogroup-horizontal{flex-direction:row;gap:var(--d-sp-4)}',
  '.d-radio{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-radio-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-radio-indicator{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;flex-shrink:0}',
  '.d-radio-dot{width:8px;height:8px;border-radius:50%;transform:scale(0);transition:transform 0.15s ease}',
  '.d-radio:has(:checked) .d-radio-dot{transform:scale(1)}',
  '.d-radio-label{font-size:var(--d-text-base)}',
  '.d-radio-disabled{opacity:0.5;cursor:not-allowed}',

  // Popover structure
  '.d-popover{position:relative;display:inline-flex}',
  '.d-popover-content{z-index:1001;min-width:200px;padding:var(--d-sp-3)}',
  '.d-popover-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px}',
  '.d-popover-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:8px}',
  '.d-popover-left{right:100%;top:50%;transform:translateY(-50%);margin-right:8px}',
  '.d-popover-right{left:100%;top:50%;transform:translateY(-50%);margin-left:8px}',
  '.d-popover-align-start{left:0;transform:none}',
  '.d-popover-align-end{left:auto;right:0;transform:none}',
  '.d-popover-top.d-popover-align-start,.d-popover-bottom.d-popover-align-start{left:0;transform:none}',
  '.d-popover-top.d-popover-align-end,.d-popover-bottom.d-popover-align-end{left:auto;right:0;transform:none}',

  // Combobox structure
  '.d-combobox{position:relative;display:inline-flex;flex-direction:column}',
  '.d-combobox-input-wrap{display:flex;align-items:center}',
  '.d-combobox-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-combobox-input[disabled]{cursor:not-allowed;opacity:0.5}',
  '.d-combobox-arrow{flex-shrink:0;padding:0 var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm)}',
  '.d-combobox-listbox{position:absolute;top:100%;left:0;right:0;z-index:1001;max-height:200px;overflow:auto;margin-top:2px}',
  '.d-combobox-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base)}',
  '.d-combobox-option-disabled{opacity:0.5;cursor:not-allowed}',
  '.d-combobox-empty{padding:var(--d-sp-3);font-size:var(--d-text-sm);text-align:center}',

  // Slider structure
  '.d-slider{display:flex;align-items:center;gap:var(--d-sp-3);width:100%;user-select:none}',
  '.d-slider-track{position:relative;flex:1;height:6px;border-radius:3px;cursor:pointer}',
  '.d-slider-fill{position:absolute;top:0;left:0;height:100%;border-radius:3px}',
  '.d-slider-thumb{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);cursor:grab;outline:none}',
  '.d-slider-thumb:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
  '.d-slider-active .d-slider-thumb{cursor:grabbing}',
  '.d-slider-disabled{opacity:0.5;pointer-events:none}',
  '.d-slider-value{font-size:var(--d-text-sm);min-width:2em;text-align:center}',

  // Route outlet (View Transitions API)
  'd-route{display:block;view-transition-name:d-route;contain:layout}',

  // Reduced motion
  '@media(prefers-reduced-motion:reduce){.d-btn,.d-card,.d-input-wrap,.d-badge,.d-badge-dot,.d-modal-overlay,.d-modal-content,.d-spinner-arc,.d-textarea-wrap,.d-checkbox-check,.d-switch-track,.d-switch-thumb,.d-select,.d-select-dropdown,.d-tab,.d-accordion-icon,.d-accordion-region,.d-accordion-content,.d-progress-bar,.d-skeleton,.d-tooltip,.d-toast,.d-toast-exit,.d-chip,.d-dropdown-menu,.d-drawer,.d-drawer-panel,.d-drawer-overlay,.d-popover-content,.d-slider-fill,.d-slider-thumb,.d-radio-dot{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
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
  el.textContent = `@layer d.base{${BASE_CSS}}`;
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

/**
 * Toggle a boolean attribute reactively.
 * @param {HTMLElement} el
 * @param {boolean|Function} prop
 * @param {string} attr
 */
export function reactiveAttr(el, prop, attr) {
  if (typeof prop === 'function') {
    createEffect(() => { prop() ? el.setAttribute(attr, '') : el.removeAttribute(attr); });
  } else if (prop) {
    el.setAttribute(attr, '');
  }
}

/**
 * Toggle a CSS class reactively.
 * @param {HTMLElement} el
 * @param {boolean|Function} prop
 * @param {string} baseClass
 * @param {string} activeClass
 */
export function reactiveClass(el, prop, baseClass, activeClass) {
  if (typeof prop === 'function') {
    createEffect(() => { el.className = prop() ? cx(baseClass, activeClass) : baseClass; });
  } else if (prop) {
    el.className = cx(baseClass, activeClass);
  }
}

/**
 * Sync a DOM property reactively.
 * @param {HTMLElement} el
 * @param {*|Function} prop
 * @param {string} domProp
 */
export function reactiveProp(el, prop, domProp) {
  if (typeof prop === 'function') {
    createEffect(() => { el[domProp] = prop(); });
  } else if (prop !== undefined) {
    el[domProp] = prop;
  }
}
