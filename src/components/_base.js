/**
 * Base structural CSS for ALL Decantr components (~75 components).
 * Injected once on first component render.
 * Visual styling (colors, shadows, gradients) comes from active theme (src/css/themes/).
 * This file handles STRUCTURE ONLY: layout, sizing, spacing, typography, transitions.
 *
 * Naming: .d-{component} root, .d-{component}-{variant|part|state} for sub-parts.
 * All sizing uses design tokens: var(--d-*) with fallbacks.
 */
import { createEffect } from '../state/index.js';

let injected = false;

const BASE_CSS = [
  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════
  '.d-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
  // Field sizing utility — override density tokens locally so child form elements inherit the tier
  '.d-field-xs{--d-density-min-h:var(--d-field-h-xs);--d-density-pad-y:var(--d-field-py-xs);--d-density-pad-x:var(--d-field-px-xs);--d-density-text:var(--d-field-text-xs);--d-density-gap:var(--d-field-gap-xs)}',
  '.d-field-sm{--d-density-min-h:var(--d-field-h-sm);--d-density-pad-y:var(--d-field-py-sm);--d-density-pad-x:var(--d-field-px-sm);--d-density-text:var(--d-field-text-sm);--d-density-gap:var(--d-field-gap-sm)}',
  '.d-field-lg{--d-density-min-h:var(--d-field-h-lg);--d-density-pad-y:var(--d-field-py-lg);--d-density-pad-x:var(--d-field-px-lg);--d-density-text:var(--d-field-text-lg);--d-density-gap:var(--d-field-gap-lg)}',
  // Field visual base — border, background, transitions, states
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
  '.d-i{display:inline-block;vertical-align:middle;background:currentColor;mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;flex-shrink:0}',
  '@keyframes d-spin{to{transform:rotate(360deg)}}',
  '@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
  '@keyframes d-fadein{from{opacity:0}to{opacity:1}}',
  '@keyframes d-fadeout{from{opacity:1}to{opacity:0}}',
  '@keyframes d-slidein-b{from{opacity:0;transform:translateY(var(--d-slide-distance))}to{opacity:1;transform:translateY(0)}}',
  '@keyframes d-slidein-t{from{opacity:0;transform:translateY(calc(var(--d-slide-distance) * -1))}to{opacity:1;transform:translateY(0)}}',
  '@keyframes d-slidein-l{from{opacity:0;transform:translateX(calc(var(--d-slide-distance) * -1))}to{opacity:1;transform:translateX(0)}}',
  '@keyframes d-slidein-r{from{opacity:0;transform:translateX(var(--d-slide-distance))}to{opacity:1;transform:translateX(0)}}',
  '@keyframes d-scalein{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
  '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
  '@keyframes d-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}',

  // ═══════════════════════════════════════════════════════════════
  // BUTTON
  // ═══════════════════════════════════════════════════════════════
  '.d-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-density-gap,var(--d-sp-2));font-family:inherit;font-size:var(--d-density-text,var(--d-text-base));font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-4));min-height:var(--d-density-min-h,auto);cursor:pointer;user-select:none;white-space:nowrap;outline:none;text-decoration:none;border:none;background:none}',
  '.d-btn:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-btn[disabled]{cursor:not-allowed;pointer-events:none;opacity:var(--d-disabled-opacity)}',
  '.d-btn-xs{min-height:var(--d-field-h-xs);font-size:var(--d-field-text-xs);padding:var(--d-field-py-xs) var(--d-field-px-xs);gap:var(--d-field-gap-xs)}',
  '.d-btn-sm{min-height:var(--d-field-h-sm);font-size:var(--d-field-text-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm);gap:var(--d-field-gap-sm)}',
  '.d-btn-lg{min-height:var(--d-field-h-lg);font-size:var(--d-field-text-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg);gap:var(--d-field-gap-lg)}',
  '.d-btn-icon{padding:var(--d-sp-2);aspect-ratio:1}',
  '.d-btn-icon-xs{min-height:var(--d-field-h-xs);padding:var(--d-field-py-xs);aspect-ratio:1;font-size:var(--d-field-text-xs)}',
  '.d-btn-icon-sm{min-height:var(--d-field-h-sm);padding:var(--d-field-py-sm);aspect-ratio:1;font-size:var(--d-field-text-sm)}',
  '.d-btn-icon-lg{min-height:var(--d-field-h-lg);padding:var(--d-field-py-lg);aspect-ratio:1;font-size:var(--d-field-text-lg)}',
  '.d-btn-block{display:flex;width:100%}',
  '.d-btn-rounded{border-radius:var(--d-radius-full)}',
  '.d-btn-group{display:inline-flex;gap:var(--d-density-gap,0)}',
  '.d-btn-group>.d-btn{border-radius:0}',
  '.d-btn-group>.d-btn:first-child{border-top-left-radius:var(--d-radius);border-bottom-left-radius:var(--d-radius)}',
  '.d-btn-group>.d-btn:last-child{border-top-right-radius:var(--d-radius);border-bottom-right-radius:var(--d-radius)}',
  '.d-btn-group>.d-btn:not(:first-child){margin-left:-1px}',
  '.d-btn-loading{position:relative;cursor:wait;color:transparent !important}',
  '.d-btn-loading>*:not(.d-btn-spinner){visibility:hidden}',
  '.d-btn-spinner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}',

  // ═══════════════════════════════════════════════════════════════
  // TOGGLE / TOGGLE GROUP
  // ═══════════════════════════════════════════════════════════════
  '.d-toggle{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-density-gap,var(--d-sp-2));padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));font:inherit;font-size:var(--d-density-text,var(--d-text-base));min-height:var(--d-density-min-h,auto);cursor:pointer;border:none;background:none;outline:none}',
  '.d-toggle:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-toggle[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-toggle[aria-pressed="true"]{font-weight:var(--d-fw-medium,500)}',
  '.d-toggle-xs{min-height:var(--d-field-h-xs);font-size:var(--d-field-text-xs);padding:var(--d-field-py-xs) var(--d-field-px-xs)}',
  '.d-toggle-sm{min-height:var(--d-field-h-sm);font-size:var(--d-field-text-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm)}',
  '.d-toggle-lg{min-height:var(--d-field-h-lg);font-size:var(--d-field-text-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg)}',
  '.d-toggle-group{display:inline-flex;position:relative;padding:var(--d-sp-0-5);gap:var(--d-density-gap,var(--d-sp-0-5));border-radius:var(--d-radius-panel);overflow:hidden}',
  '.d-toggle-group>.d-toggle{position:relative;z-index:1;border-radius:var(--d-radius-inner)}',
  '.d-toggle-indicator{position:absolute;top:var(--d-sp-0-5);bottom:var(--d-sp-0-5);border-radius:var(--d-radius-inner);transition:transform var(--d-duration-fast) var(--d-easing-standard),width var(--d-duration-fast) var(--d-easing-standard),opacity var(--d-duration-fast) var(--d-easing-standard);pointer-events:none;z-index:0}',
  '.d-toggle-group-sm{padding:var(--d-sp-0-25);gap:var(--d-sp-0-25)}',
  '.d-toggle-group-sm>.d-toggle{min-height:var(--d-field-h-sm);font-size:var(--d-field-text-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm)}',
  '.d-toggle-group-lg{padding:var(--d-sp-1);gap:var(--d-sp-0-5)}',
  '.d-toggle-group-lg>.d-toggle{min-height:var(--d-field-h-lg);font-size:var(--d-field-text-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg)}',
  '.d-toggle-group-block{display:flex;width:100%}',
  '.d-toggle-group-block>.d-toggle{flex:1}',
  '.d-toggle-group[data-disabled]{opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none}',

  // ═══════════════════════════════════════════════════════════════
  // SPINNER
  // ═══════════════════════════════════════════════════════════════
  // ── CARET (shared icon-based arrow for dropdowns, accordions, trees) ──
  '.d-caret{transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease);flex-shrink:0;display:inline-flex;align-items:center}',
  '.d-caret-open{transform:rotate(180deg)}',
  '.d-caret-open-90{transform:rotate(90deg)}',
  // Unified chevron rotation — any component toggles *-open on its wrapper
  '.d-select-open .d-caret,.d-combobox-open .d-caret,.d-cascader-open > .d-cascader-trigger .d-caret,.d-treeselect-open > .d-treeselect-trigger .d-caret{transform:rotate(180deg)}',

  '.d-spinner{display:inline-block}',
  '.d-spinner-xs{width:var(--d-spinner-size-xs);height:var(--d-spinner-size-xs)}',
  '.d-spinner-sm{width:var(--d-spinner-size-sm);height:var(--d-spinner-size-sm)}',
  '.d-spinner-lg{width:var(--d-spinner-size-lg);height:var(--d-spinner-size-lg)}',
  '.d-spinner-xl{width:var(--d-spinner-size-xl);height:var(--d-spinner-size-xl)}',
  '.d-spinner-arc{animation:d-spin var(--d-duration-spin) linear infinite;transform-origin:center;transform-box:fill-box}',
  '.d-spinner-wrap{display:inline-flex;align-items:center;justify-content:center}',
  // ── Spinner variants ──
  '@keyframes d-dots{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}',
  '@keyframes d-bars{0%,100%{transform:scaleY(0.4)}20%{transform:scaleY(1)}}',
  '@keyframes d-orbit{0%{transform:rotate(0deg) translateX(150%) rotate(0deg)}100%{transform:rotate(360deg) translateX(150%) rotate(-360deg)}}',
  '.d-spinner-dots{display:inline-flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-spinner-dots>span{width:25%;aspect-ratio:1;border-radius:50%;background:currentColor;animation:d-dots calc(var(--d-duration-spin) * 1.6) ease-in-out infinite}',
  '.d-spinner-dots>span:nth-child(2){animation-delay:0.16s}',
  '.d-spinner-dots>span:nth-child(3){animation-delay:0.32s}',
  '.d-spinner-pulse{display:inline-flex;align-items:center;justify-content:center}',
  '.d-spinner-pulse>span{width:100%;height:100%;border-radius:50%;background:currentColor;animation:d-pulse calc(var(--d-duration-spin) * 1.8) ease-in-out infinite}',
  '.d-spinner-bars{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-sp-0-5)}',
  '.d-spinner-bars>span{width:3px;height:60%;background:currentColor;border-radius:1px;animation:d-bars calc(var(--d-duration-spin) * 1.4) ease-in-out infinite}',
  '.d-spinner-bars>span:nth-child(2){animation-delay:0.1s}',
  '.d-spinner-bars>span:nth-child(3){animation-delay:0.2s}',
  '.d-spinner-bars>span:nth-child(4){animation-delay:0.3s}',
  '.d-spinner-orbit{display:inline-flex;align-items:center;justify-content:center;position:relative}',
  '.d-spinner-orbit>span{position:absolute;width:20%;aspect-ratio:1;border-radius:50%;background:currentColor;animation:d-orbit calc(var(--d-duration-spin) * 1.8) linear infinite}',
  '.d-spinner-orbit>span:nth-child(2){animation-delay:-0.75s}',
  // ── Hybrid spinner (ring + center icon) ──
  '.d-spinner-hybrid{position:relative;display:inline-flex;align-items:center;justify-content:center}',
  '.d-spinner-hybrid>svg{position:absolute;inset:0}',
  '.d-spinner-hybrid>.d-i{position:relative;z-index:1}',
  '.d-spinner-dots,.d-spinner-pulse,.d-spinner-bars,.d-spinner-orbit,.d-spinner-hybrid{width:100%;height:100%}',
  // ── Spinner colors ──
  '.d-spinner-primary{color:var(--d-primary)}',
  '.d-spinner-success{color:var(--d-success)}',
  '.d-spinner-warning{color:var(--d-warning)}',
  '.d-spinner-destructive{color:var(--d-destructive)}',
  '.d-spinner-info{color:var(--d-info)}',
  '.d-spinner-muted{color:var(--d-muted-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // INPUT
  // ═══════════════════════════════════════════════════════════════
  '.d-input-wrap{display:flex;align-items:center}',
  '.d-input{background:transparent;border:none;outline:none;width:100%;font:inherit;font-size:var(--d-density-text,inherit);padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));min-height:var(--d-density-min-h,auto)}',
  '.d-input-prefix,.d-input-suffix{display:flex;align-items:center;padding:0 var(--d-sp-2);color:var(--d-muted);flex-shrink:0}',
  '.d-input[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-input-xs{min-height:var(--d-field-h-xs);padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-input-sm{min-height:var(--d-field-h-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-input-lg{min-height:var(--d-field-h-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',
  // ── INPUT GROUP ──
  // Structure only — group draws the border, children go borderless.
  // Three custom properties cascade to children:
  //   --d-group-border: 0   (children lose all borders)
  //   --d-group-radius: ... (positional border-radius)
  //   --d-group-shadow: none (suppress child focus rings)
  '.d-input-group{display:flex;align-items:stretch}',
  '.d-input-group-vertical{flex-direction:column;overflow:hidden}',
  '.d-input-group>.d-input-wrap,.d-input-group>.d-select-wrap,.d-input-group>.d-combobox-input-wrap,.d-input-group>.d-inputnumber,.d-input-group>.d-textarea-wrap,.d-input-group>.d-cascader-trigger{flex:1;min-width:0}',
  '.d-input-group-addon{display:flex;align-items:center;padding:0 var(--d-sp-3);font-size:var(--d-text-sm);white-space:nowrap;flex-shrink:0}',
  // Horizontal — set group contract on children
  '.d-input-group>*{--d-group-border:0;--d-group-shadow:none;--d-group-radius:0}',
  '.d-input-group>:first-child{--d-group-radius:var(--d-radius) 0 0 var(--d-radius)}',
  '.d-input-group>:last-child{--d-group-radius:0 var(--d-radius) var(--d-radius) 0}',
  '.d-input-group>:only-child{--d-group-radius:var(--d-radius)}',
  // Vertical — container clips corners via overflow:hidden + border-radius; reset ALL children
  '.d-input-group-vertical>*{--d-group-radius:0}',
  '.d-input-group-vertical>:first-child{--d-group-radius:0}',
  '.d-input-group-vertical>:last-child{--d-group-radius:0}',
  '.d-input-group-vertical>:only-child{--d-group-radius:0}',
  // Group-level disabled
  '.d-input-group[data-disabled]>*{opacity:var(--d-disabled-opacity);pointer-events:none}',
  // Size variants for addons
  '.d-input-group-xs .d-input-group-addon{padding:0 var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-input-group-sm .d-input-group-addon{padding:0 var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-input-group-lg .d-input-group-addon{padding:0 var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',
  // ── COMPACT GROUP ──
  '.d-compact-group{display:inline-flex;align-items:stretch}',
  '.d-compact-group>.d-input-wrap,.d-compact-group>.d-select-wrap,.d-compact-group>.d-combobox-input-wrap,.d-compact-group>.d-inputnumber{flex:1;min-width:0}',
  '.d-compact-group>*{--d-group-border:0;--d-group-shadow:none;--d-group-radius:0}',
  '.d-compact-group>:first-child{--d-group-radius:var(--d-radius) 0 0 var(--d-radius)}',
  '.d-compact-group>:last-child{--d-group-radius:0 var(--d-radius) var(--d-radius) 0}',
  '.d-compact-group>:only-child{--d-group-radius:var(--d-radius)}',

  // ═══════════════════════════════════════════════════════════════
  // INPUT NUMBER
  // ═══════════════════════════════════════════════════════════════
  '.d-inputnumber{display:inline-flex;align-items:center}',
  '.d-inputnumber-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);text-align:center;-moz-appearance:textfield}',
  '.d-inputnumber-input::-webkit-inner-spin-button,.d-inputnumber-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}',
  '.d-inputnumber-step{display:flex;align-items:center;justify-content:center;cursor:pointer;width:var(--d-stepper-w);flex-shrink:0;font-size:var(--d-text-sm);user-select:none;border:none;background:none;padding:0}',
  '.d-inputnumber-step:first-child{border-right:var(--d-border-width,1px) var(--d-border-style,solid) var(--d-border);border-radius:var(--d-group-radius,var(--d-radius)) 0 0 var(--d-group-radius,var(--d-radius))}',
  '.d-inputnumber-step:last-child{border-left:var(--d-border-width,1px) var(--d-border-style,solid) var(--d-border);border-radius:0 var(--d-group-radius,var(--d-radius)) var(--d-group-radius,var(--d-radius)) 0}',
  '.d-inputnumber-step[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity-soft)}',

  // ═══════════════════════════════════════════════════════════════
  // INPUT OTP
  // ═══════════════════════════════════════════════════════════════
  '.d-otp{display:inline-flex;gap:var(--d-sp-2)}',
  '.d-otp-slot{width:var(--d-otp-w);height:var(--d-otp-h);--d-field-radius:var(--d-radius-full);text-align:center;font:inherit;font-size:var(--d-otp-text);font-weight:var(--d-fw-medium,500);padding:0;outline:none}',
  '.d-otp-sm .d-otp-slot{width:var(--d-otp-w-sm);height:var(--d-otp-h-sm);font-size:var(--d-otp-text-sm)}',
  '.d-otp-lg .d-otp-slot{width:var(--d-otp-w-lg);height:var(--d-otp-h-lg);font-size:var(--d-otp-text-lg)}',
  // focus-visible handled by .d-field:focus-within (slot IS the field — no separate outline needed)
  '.d-otp-separator{display:flex;align-items:center;padding:0 var(--d-sp-1);font-size:var(--d-text-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // TEXTAREA
  // ═══════════════════════════════════════════════════════════════
  '.d-textarea-wrap{display:flex;--d-field-radius:var(--d-radius-panel)}',
  '.d-textarea{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);min-height:4rem;border-radius:inherit}',
  '.d-textarea[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-textarea-xs{padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-textarea-sm{padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-textarea-lg{padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // CARD
  // ═══════════════════════════════════════════════════════════════
  '.d-card{display:flex;flex-direction:column;overflow:hidden}',
  '.d-card-header{padding:var(--d-compound-pad) var(--d-compound-pad) 0;font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-card-body{padding:var(--d-compound-gap) var(--d-compound-pad)}',
  '.d-card-body:first-child{padding-top:var(--d-compound-pad)}',
  '.d-card-body:last-child{padding-bottom:var(--d-compound-pad)}',
  '.d-card-footer{padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
  '.d-card-cover{overflow:hidden}',
  '.d-card-cover>img{width:100%;display:block}',
  '.d-card-meta{display:flex;align-items:center;gap:var(--d-sp-3)}',

  // ═══════════════════════════════════════════════════════════════
  // BADGE
  // ═══════════════════════════════════════════════════════════════
  '.d-badge{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);padding:var(--d-sp-1) var(--d-sp-2);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);vertical-align:middle}',
  '.d-badge-dot{width:var(--d-badge-dot);height:var(--d-badge-dot);border-radius:50%;flex-shrink:0}',
  '.d-badge-wrapper{position:relative;display:inline-flex}',
  '.d-badge-sup{position:absolute;top:-4px;right:-4px;z-index:1}',

  // ═══════════════════════════════════════════════════════════════
  // TAG (extends Badge concept — removable labels)
  // ═══════════════════════════════════════════════════════════════
  '.d-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);padding:var(--d-sp-1) var(--d-sp-2);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);white-space:nowrap;vertical-align:middle}',
  '.d-tag-close{display:inline-flex;align-items:center;cursor:pointer;background:none;border:none;padding:0;font-size:0.875em;line-height:var(--d-lh-none);opacity:var(--d-icon-muted)}',
  '.d-tag-close:hover{opacity:1}',
  '.d-tag-checkable{cursor:pointer}',
  '.d-tag-custom{background:var(--d-tag-bg);color:var(--d-tag-fg);border-color:var(--d-tag-bg)}',

  // ═══════════════════════════════════════════════════════════════
  // CHIP (pill-shaped tag with icon support)
  // ═══════════════════════════════════════════════════════════════
  '.d-chip{display:inline-flex;align-items:center;gap:var(--d-sp-1-5);border-radius:var(--d-radius-full);padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal);cursor:default;white-space:nowrap;vertical-align:middle}',
  '.d-chip-xs{padding:0 var(--d-sp-1-5);font-size:var(--d-text-xs);gap:var(--d-sp-1)}',
  '.d-chip-sm{padding:0.125rem var(--d-sp-2);font-size:var(--d-text-sm);gap:var(--d-sp-1)}',
  '.d-chip-lg{padding:var(--d-sp-1-5) var(--d-sp-4);font-size:var(--d-text-base);gap:var(--d-sp-2)}',
  '.d-chip-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-chip-label{overflow:hidden;text-overflow:ellipsis}',
  '.d-chip-remove{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;font-size:1em;line-height:var(--d-lh-none);padding:0;margin-left:0.125rem;opacity:var(--d-icon-muted)}',
  '.d-chip-remove:hover{opacity:1}',
  '.d-chip-interactive{cursor:pointer}',

  // ═══════════════════════════════════════════════════════════════
  // CHECKBOX
  // ═══════════════════════════════════════════════════════════════
  '.d-checkbox{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-checkbox-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-checkbox-check{display:flex;align-items:center;justify-content:center;width:var(--d-checkbox-size,1.125rem);height:var(--d-checkbox-size,1.125rem);flex-shrink:0;position:relative;overflow:hidden}',
  '.d-checkbox-check::after{content:"";display:block;width:100%;height:100%;-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20width%3D\'24\'%20height%3D\'24\'%20viewBox%3D\'0%200%2024%2024\'%20fill%3D\'none\'%20stroke%3D\'black\'%20stroke-width%3D\'2\'%20stroke-linecap%3D\'round\'%20stroke-linejoin%3D\'round\'%3E%3Cpolyline%20points%3D\'20%206%209%2017%204%2012\'%2F%3E%3C%2Fsvg%3E");mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20width%3D\'24\'%20height%3D\'24\'%20viewBox%3D\'0%200%2024%2024\'%20fill%3D\'none\'%20stroke%3D\'black\'%20stroke-width%3D\'2\'%20stroke-linecap%3D\'round\'%20stroke-linejoin%3D\'round\'%3E%3Cpolyline%20points%3D\'20%206%209%2017%204%2012\'%2F%3E%3C%2Fsvg%3E");-webkit-mask-size:65% 65%;mask-size:65% 65%;-webkit-mask-position:center;mask-position:center;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;background:currentColor;opacity:0;transform:scale(0.5);transition:opacity var(--d-duration-fast) var(--d-easing-standard),transform var(--d-duration-fast) var(--d-easing-bounce,var(--d-easing-standard))}',
  '.d-checkbox:has(:checked) .d-checkbox-check::after,.d-checkbox-inline:has(:checked) .d-checkbox-check::after{opacity:1;transform:scale(1)}',
  '@keyframes d-check-pop{0%{transform:scale(1)}40%{transform:scale(0.85)}70%{transform:scale(1.08)}100%{transform:scale(1)}}',
  '.d-checkbox:has(:checked) .d-checkbox-check,.d-checkbox-inline:has(:checked) .d-checkbox-check{animation:d-check-pop var(--d-duration-normal) var(--d-easing-bounce,var(--d-easing-standard))}',
  '.d-checkbox:has(:indeterminate) .d-checkbox-check::after,.d-checkbox-inline:has(:indeterminate) .d-checkbox-check::after{-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20width%3D\'24\'%20height%3D\'24\'%20viewBox%3D\'0%200%2024%2024\'%20fill%3D\'none\'%20stroke%3D\'black\'%20stroke-width%3D\'2\'%20stroke-linecap%3D\'round\'%20stroke-linejoin%3D\'round\'%3E%3Cline%20x1%3D\'5\'%20y1%3D\'12\'%20x2%3D\'19\'%20y2%3D\'12\'%2F%3E%3C%2Fsvg%3E");mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20width%3D\'24\'%20height%3D\'24\'%20viewBox%3D\'0%200%2024%2024\'%20fill%3D\'none\'%20stroke%3D\'black\'%20stroke-width%3D\'2\'%20stroke-linecap%3D\'round\'%20stroke-linejoin%3D\'round\'%3E%3Cline%20x1%3D\'5\'%20y1%3D\'12\'%20x2%3D\'19\'%20y2%3D\'12\'%2F%3E%3C%2Fsvg%3E");opacity:1;transform:scale(1)}',
  '@media(prefers-reduced-motion:reduce){.d-checkbox:has(:checked) .d-checkbox-check,.d-checkbox-inline:has(:checked) .d-checkbox-check{animation:none}.d-checkbox-check::after{transition:none}}',
  '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-checkbox-label{font-size:var(--d-text-base)}',
  '.d-checkbox-xs .d-checkbox-check{width:var(--d-checkbox-size-xs);height:var(--d-checkbox-size-xs)}',
  '.d-checkbox-xs .d-checkbox-label{font-size:var(--d-field-text-xs)}',
  '.d-checkbox-sm .d-checkbox-check{width:var(--d-checkbox-size-sm);height:var(--d-checkbox-size-sm)}',
  '.d-checkbox-sm .d-checkbox-label{font-size:var(--d-field-text-sm)}',
  '.d-checkbox-lg .d-checkbox-check{width:var(--d-checkbox-size-lg);height:var(--d-checkbox-size-lg)}',
  '.d-checkbox-lg .d-checkbox-label{font-size:var(--d-field-text-lg)}',
  '.d-checkbox-native:disabled~.d-checkbox-check{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-checkbox-native:disabled~.d-checkbox-label{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-checkbox-group{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-checkbox-group-horizontal{flex-direction:row;gap:var(--d-sp-4)}',
  '.d-checkbox-inline{display:inline-flex;align-items:center;position:relative}',

  // ═══════════════════════════════════════════════════════════════
  // SWITCH
  // ═══════════════════════════════════════════════════════════════
  '.d-switch{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-switch-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-switch-track{position:relative;width:var(--d-switch-w);height:var(--d-switch-h);border-radius:calc(var(--d-switch-h) / 2);flex-shrink:0}',
  '.d-switch-thumb{position:absolute;width:var(--d-switch-thumb);height:var(--d-switch-thumb);border-radius:50%;top:50%;transform:translateY(-50%);left:calc((var(--d-switch-h) - var(--d-switch-thumb)) / 2)}',
  '.d-switch:has(:checked) .d-switch-thumb{left:calc(var(--d-switch-w) - var(--d-switch-thumb) - (var(--d-switch-h) - var(--d-switch-thumb)) / 2)}',
  // Switch size variants
  '.d-switch-xs{--d-switch-w:var(--d-switch-w-xs);--d-switch-h:var(--d-switch-h-xs);--d-switch-thumb:var(--d-switch-thumb-xs)}',
  '.d-switch-xs .d-switch-label{font-size:var(--d-field-text-xs)}',
  '.d-switch-sm{--d-switch-w:var(--d-switch-w-sm);--d-switch-h:var(--d-switch-h-sm);--d-switch-thumb:var(--d-switch-thumb-sm)}',
  '.d-switch-sm .d-switch-label{font-size:var(--d-field-text-sm)}',
  '.d-switch-lg{--d-switch-w:var(--d-switch-w-lg);--d-switch-h:var(--d-switch-h-lg);--d-switch-thumb:var(--d-switch-thumb-lg)}',
  '.d-switch-lg .d-switch-label{font-size:var(--d-field-text-lg)}',
  '.d-switch-label{font-size:var(--d-text-base)}',
  '.d-switch-native:disabled~.d-switch-track{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-switch:has(:disabled),.d-switch[data-disabled]{cursor:not-allowed}',

  // ═══════════════════════════════════════════════════════════════
  // RADIO GROUP
  // ═══════════════════════════════════════════════════════════════
  '.d-radiogroup{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-radiogroup-horizontal{flex-direction:row;gap:var(--d-sp-4)}',
  '.d-radio{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
  '.d-radio-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
  '.d-radio-indicator{display:flex;align-items:center;justify-content:center;width:var(--d-checkbox-size);height:var(--d-checkbox-size);border-radius:50%;flex-shrink:0}',
  '.d-radio-dot{width:calc(var(--d-checkbox-size) * 0.44);height:calc(var(--d-checkbox-size) * 0.44);border-radius:50%;transform:scale(0);transition:transform var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-radio:has(:checked) .d-radio-dot{transform:scale(1)}',
  '.d-radio-label{font-size:var(--d-text-base)}',
  '.d-radiogroup-xs .d-radio-indicator{width:var(--d-checkbox-size-xs);height:var(--d-checkbox-size-xs)}',
  '.d-radiogroup-xs .d-radio-dot{width:calc(var(--d-checkbox-size-xs) * 0.44);height:calc(var(--d-checkbox-size-xs) * 0.44)}',
  '.d-radiogroup-xs .d-radio-label{font-size:var(--d-field-text-xs)}',
  '.d-radiogroup-sm .d-radio-indicator{width:var(--d-checkbox-size-sm);height:var(--d-checkbox-size-sm)}',
  '.d-radiogroup-sm .d-radio-dot{width:calc(var(--d-checkbox-size-sm) * 0.44);height:calc(var(--d-checkbox-size-sm) * 0.44)}',
  '.d-radiogroup-sm .d-radio-label{font-size:var(--d-field-text-sm)}',
  '.d-radiogroup-lg .d-radio-indicator{width:var(--d-checkbox-size-lg);height:var(--d-checkbox-size-lg)}',
  '.d-radiogroup-lg .d-radio-dot{width:calc(var(--d-checkbox-size-lg) * 0.44);height:calc(var(--d-checkbox-size-lg) * 0.44)}',
  '.d-radiogroup-lg .d-radio-label{font-size:var(--d-field-text-lg)}',
  '.d-radio-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',

  // ═══════════════════════════════════════════════════════════════
  // SELECT
  // ═══════════════════════════════════════════════════════════════
  '.d-select-wrap{position:relative;display:inline-flex;flex-direction:column}',
  '.d-select{display:flex;align-items:center;justify-content:space-between;gap:var(--d-density-gap,var(--d-sp-2));width:100%;font:inherit;font-size:var(--d-density-text,var(--d-text-base));padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));min-height:var(--d-density-min-h,auto);cursor:pointer;outline:none;text-align:left;border:none;background:none}',
  // focus-visible handled by .d-field:focus-within on .d-select-wrap
  '.d-select[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-select-display{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-select-arrow{flex-shrink:0;font-size:var(--d-text-sm);transition:transform var(--d-duration-fast)}',
  // Chevron rotation now handled by unified rule above (.d-select-open .d-caret, etc.)
  '.d-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:var(--d-z-dropdown);max-height:var(--d-panel-max-h);overflow:auto;margin-top:var(--d-offset-dropdown);padding:var(--d-sp-1)}',
  '.d-select-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);border-radius:var(--d-radius-inner)}',
  '.d-select-option-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-select-placeholder{color:var(--d-muted)}',
  '.d-select-optgroup{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-title);color:var(--d-muted)}',
  '.d-select-clear{display:flex;align-items:center;cursor:pointer;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);opacity:var(--d-icon-muted)}',
  '.d-select-clear:hover{opacity:1}',
  '.d-select-multi-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);padding:var(--d-sp-1) var(--d-sp-2);font-size:var(--d-text-sm);border-radius:var(--d-radius)}',
  '.d-select-multi-tag-close{cursor:pointer;font-size:0.75em;opacity:var(--d-icon-muted)}',
  '.d-select-multi-tag-close:hover{opacity:1}',
  // Size variants
  '.d-select-xs .d-select{min-height:var(--d-field-h-xs);padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-select-xs .d-select-option{padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-select-sm .d-select{min-height:var(--d-field-h-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-select-sm .d-select-option{padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-select-lg .d-select{min-height:var(--d-field-h-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',
  '.d-select-lg .d-select-option{padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // COMBOBOX / AUTOCOMPLETE
  // ═══════════════════════════════════════════════════════════════
  '.d-combobox{position:relative;display:inline-flex;flex-direction:column}',
  '.d-combobox-input-wrap{display:flex;align-items:center}',
  '.d-combobox-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-combobox-input[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-combobox-arrow{flex-shrink:0;padding:0 var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm)}',
  '.d-combobox-listbox{position:absolute;top:100%;left:0;right:0;z-index:var(--d-z-dropdown);max-height:var(--d-panel-max-h);overflow:auto;margin-top:var(--d-offset-dropdown);padding:var(--d-sp-1)}',
  '.d-combobox-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);border-radius:var(--d-radius-inner)}',
  '.d-combobox-option-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-combobox-empty{padding:var(--d-sp-3);font-size:var(--d-text-sm);text-align:center}',
  // Size variants
  '.d-combobox-xs .d-combobox-input{min-height:var(--d-field-h-xs);padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-combobox-xs .d-combobox-option{padding:var(--d-field-py-xs) var(--d-field-px-xs);font-size:var(--d-field-text-xs)}',
  '.d-combobox-sm .d-combobox-input{min-height:var(--d-field-h-sm);padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-combobox-sm .d-combobox-option{padding:var(--d-field-py-sm) var(--d-field-px-sm);font-size:var(--d-field-text-sm)}',
  '.d-combobox-lg .d-combobox-input{min-height:var(--d-field-h-lg);padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',
  '.d-combobox-lg .d-combobox-option{padding:var(--d-field-py-lg) var(--d-field-px-lg);font-size:var(--d-field-text-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // SLIDER
  // ═══════════════════════════════════════════════════════════════
  '.d-slider{display:flex;align-items:center;gap:var(--d-sp-3);width:100%;user-select:none}',
  '.d-slider-track{position:relative;flex:1;height:var(--d-slider-track-h);border-radius:var(--d-radius-full);cursor:pointer}',
  '.d-slider-fill{position:absolute;top:0;left:0;height:100%;border-radius:var(--d-radius-full)}',
  '.d-slider-thumb{position:absolute;top:50%;width:var(--d-slider-thumb);height:var(--d-slider-thumb);border-radius:50%;transform:translate(-50%,-50%);cursor:grab;outline:none}',
  '.d-slider-thumb:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-slider-active .d-slider-thumb{cursor:grabbing}',
  '.d-slider-disabled{opacity:var(--d-disabled-opacity);pointer-events:none}',
  '.d-slider-value{font-size:var(--d-text-sm);min-width:2em;text-align:center}',
  '.d-slider-marks{position:relative;width:100%;margin-top:var(--d-sp-1)}',
  '.d-slider-mark{position:absolute;font-size:var(--d-text-xs);transform:translateX(-50%)}',
  '.d-slider-vertical{flex-direction:column;width:auto;height:200px}',
  '.d-slider-vertical .d-slider-track{width:var(--d-slider-track-h);height:100%;flex:1}',
  '.d-slider-vertical .d-slider-fill{width:100%;height:auto;bottom:0;top:auto}',
  '.d-slider-vertical .d-slider-thumb{left:50%;top:auto;transform:translate(-50%,50%)}',

  // ═══════════════════════════════════════════════════════════════
  // RATE (Star rating)
  // ═══════════════════════════════════════════════════════════════
  '.d-rate{display:inline-flex;gap:var(--d-sp-1);font-size:var(--d-rate-size)}',
  '.d-rate-star{cursor:pointer;transition:transform var(--d-duration-instant),color var(--d-duration-instant);user-select:none;background:none;border:none;padding:0;font-size:inherit;line-height:var(--d-lh-none)}',
  '.d-rate:not([aria-disabled="true"]) .d-rate-star:hover{transform:scale(1.15)}',
  '.d-rate-star:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-rate[aria-disabled="true"] .d-rate-star{cursor:default;transform:none}',
  '.d-rate-sm{font-size:var(--d-rate-size-sm);gap:var(--d-rate-gap-sm)}',
  '.d-rate-lg{font-size:var(--d-rate-size-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // COLOR PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-colorpicker{position:relative;display:inline-flex;flex-direction:column}',
  '.d-colorpicker-trigger{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-base);border:none;background:none;outline:none}',
  '.d-colorpicker-swatch{width:var(--d-colorpicker-swatch);height:var(--d-colorpicker-swatch);border-radius:var(--d-radius-inner);flex-shrink:0}',
  '.d-colorpicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);padding:var(--d-sp-3);margin-top:var(--d-offset-dropdown);min-width:240px}',
  '.d-colorpicker-saturation{position:relative;width:100%;height:var(--d-colorpicker-sat-h);cursor:crosshair;border-radius:var(--d-radius-inner)}',
  '.d-colorpicker-hue{position:relative;width:100%;height:var(--d-colorpicker-bar-h);border-radius:var(--d-radius-inner);cursor:pointer;margin-top:var(--d-sp-2);background:linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)}',
  '.d-colorpicker-alpha{position:relative;width:100%;height:var(--d-colorpicker-bar-h);border-radius:var(--d-radius-inner);cursor:pointer;margin-top:var(--d-sp-2)}',
  '.d-colorpicker-thumb{position:absolute;width:var(--d-colorpicker-thumb);height:var(--d-colorpicker-thumb);border-radius:50%;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.3);transform:translate(-50%,-50%);pointer-events:none}',
  '.d-colorpicker-input{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
  '.d-colorpicker-presets{display:flex;flex-wrap:wrap;gap:var(--d-sp-1);margin-top:var(--d-sp-2)}',
  '.d-colorpicker-preset{width:var(--d-colorpicker-preset);height:var(--d-colorpicker-preset);border-radius:var(--d-radius-inner);cursor:pointer;border:none;padding:0}',

  // ═══════════════════════════════════════════════════════════════
  // DATE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-datepicker{position:relative;display:inline-flex;flex-direction:column}',
  '.d-datepicker-input{display:flex;align-items:center}',
  '.d-datepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);padding:var(--d-sp-3);min-width:280px}',
  '.d-datepicker-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:var(--d-sp-2)}',
  '.d-datepicker-title{font-weight:var(--d-fw-title);font-size:var(--d-text-base);cursor:pointer}',
  '.d-datepicker-nav{display:flex;gap:var(--d-sp-1)}',
  '.d-datepicker-nav-btn{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-sm);line-height:var(--d-lh-none)}',
  '.d-datepicker-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center}',
  '.d-datepicker-weekday{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-1);color:var(--d-muted)}',
  '.d-datepicker-day{padding:var(--d-sp-1);font-size:var(--d-text-sm);cursor:pointer;border-radius:var(--d-radius-inner);border:none;background:none;font:inherit;line-height:2}',
  '.d-datepicker-day:hover{background:var(--d-item-hover-bg)}',
  '.d-datepicker-day:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-datepicker-day-today{font-weight:var(--d-fw-heading)}',
  '.d-datepicker-day-selected{font-weight:var(--d-fw-medium,500)}',
  '.d-datepicker-day-outside{opacity:var(--d-disabled-opacity-soft)}',
  '.d-datepicker-day-disabled{opacity:var(--d-disabled-opacity-soft);cursor:not-allowed}',
  '.d-datepicker-months,.d-datepicker-years{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--d-sp-2)}',
  '.d-datepicker-month,.d-datepicker-year{padding:var(--d-sp-2);text-align:center;cursor:pointer;border:none;background:none;font:inherit;border-radius:var(--d-radius-inner)}',

  // ═══════════════════════════════════════════════════════════════
  // TIME PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-timepicker{position:relative;display:inline-flex;flex-direction:column}',
  '.d-timepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
  '.d-timepicker-column{display:flex;flex-direction:column;height:200px;overflow-y:auto;min-width:56px;text-align:center;scrollbar-width:thin}',
  '.d-timepicker-cell{padding:var(--d-sp-1-5) var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm);border:none;background:none;font:inherit}',
  '.d-timepicker-cell-selected{font-weight:var(--d-fw-medium,500)}',
  '.d-timepicker-cell-disabled{opacity:var(--d-disabled-opacity-soft);cursor:not-allowed}',

  // ═══════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════
  '.d-upload{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-upload-dragger{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--d-sp-8);cursor:pointer;border:var(--d-border-width-strong) dashed var(--d-border);border-radius:var(--d-radius-lg,var(--d-radius));text-align:center;gap:var(--d-sp-2)}',
  '.d-upload-dragger:hover{border-color:var(--d-ring)}',
  '.d-upload-dragger-active{border-color:var(--d-ring);background:var(--d-surface-1)}',
  '.d-upload-input{display:none}',
  '.d-upload-list{display:flex;flex-direction:column;gap:var(--d-sp-1)}',
  '.d-upload-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-2);font-size:var(--d-text-sm);border-radius:var(--d-radius-inner)}',
  '.d-upload-item-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-upload-item-remove{cursor:pointer;background:none;border:none;padding:0;font-size:1em;opacity:var(--d-disabled-opacity)}',
  '.d-upload-item-remove:hover{opacity:1}',

  // ═══════════════════════════════════════════════════════════════
  // TRANSFER
  // ═══════════════════════════════════════════════════════════════
  '.d-transfer{display:flex;align-items:stretch;gap:var(--d-sp-3)}',
  '.d-transfer-panel{display:flex;flex-direction:column;flex:1;min-width:200px;overflow:hidden}',
  '.d-transfer-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
  '.d-transfer-body{flex:1;overflow:auto;min-height:200px}',
  '.d-transfer-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-sm)}',
  '.d-transfer-item:hover{background:var(--d-item-hover-bg)}',
  '.d-transfer-item-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-transfer-search{padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-transfer-actions{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--d-sp-2)}',
  '.d-transfer-footer{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm)}',

  // ═══════════════════════════════════════════════════════════════
  // CASCADER
  // ═══════════════════════════════════════════════════════════════
  '.d-cascader{position:relative;display:inline-flex;flex-direction:column}',
  '.d-cascader-trigger{display:flex;align-items:center}',
  '.d-cascader-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-cascader-disabled{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-cascader-clear{display:flex;align-items:center;cursor:pointer;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);opacity:var(--d-icon-muted);border:none;background:none}',
  '.d-cascader-clear:hover{opacity:1}',
  '.d-cascader-dropdown{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);display:flex;margin-top:var(--d-offset-dropdown)}',
  '.d-cascader-column{min-width:140px;max-height:256px;overflow:auto;padding:var(--d-sp-1)}',
  '.d-cascader-option{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);white-space:nowrap;border-radius:var(--d-radius-inner)}',
  '.d-cascader-option:hover{background:var(--d-item-hover-bg)}',
  '.d-cascader-option-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-cascader-option-active{font-weight:var(--d-fw-medium,500)}',
  '.d-cascader-arrow{font-size:var(--d-text-xs);opacity:var(--d-icon-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // MENTIONS
  // ═══════════════════════════════════════════════════════════════
  '.d-mentions{position:relative;display:inline-flex;flex-direction:column}',
  '.d-mentions-dropdown{position:absolute;bottom:100%;left:0;z-index:var(--d-z-dropdown);min-width:160px;max-height:var(--d-panel-max-h);overflow:auto;margin-bottom:var(--d-offset-dropdown);padding:var(--d-sp-1)}',
  '.d-mentions-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);border-radius:var(--d-radius-inner)}',
  '.d-mentions-option:hover{background:var(--d-item-hover-bg)}',

  // ═══════════════════════════════════════════════════════════════
  // LABEL
  // ═══════════════════════════════════════════════════════════════
  '.d-label{display:inline-block;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal);cursor:default}',
  '.d-label-required::after{content:" *";color:var(--d-error)}',

  // ═══════════════════════════════════════════════════════════════
  // FORM FIELD (wrapper for any form control)
  // ═══════════════════════════════════════════════════════════════
  '.d-form-field{display:flex;flex-direction:column;gap:var(--d-sp-1-5)}',
  '.d-form-field-label{font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal)}',
  '.d-form-field-required{color:var(--d-error)}',
  '.d-form-field-help{font-size:var(--d-text-xs);color:var(--d-muted)}',
  '.d-form-field-error{font-size:var(--d-text-xs);color:var(--d-error)}',
  '.d-form{display:flex;flex-direction:column;gap:var(--d-sp-4)}',
  '.d-form-horizontal{display:grid;grid-template-columns:auto 1fr;gap:var(--d-sp-3) var(--d-sp-4);align-items:start}',
  '.d-form-actions{display:flex;gap:var(--d-sp-2);justify-content:flex-end}',

  // ═══════════════════════════════════════════════════════════════
  // MODAL (native <dialog>)
  // ═══════════════════════════════════════════════════════════════
  'dialog.d-modal-content{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-modal-content[open]{display:flex;align-items:center;justify-content:center}',
  'dialog.d-modal-content::backdrop{background:var(--d-overlay)}',
  '.d-modal-panel{max-width:90vw;max-height:85vh;overflow:auto;display:flex;flex-direction:column}',
  '.d-modal-header{display:flex;justify-content:space-between;align-items:center;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
  '.d-modal-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-modal-body{padding:var(--d-compound-gap) var(--d-compound-pad)}',
  '.d-modal-body:last-child{padding-bottom:var(--d-compound-pad)}',
  '.d-modal-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
  '.d-modal-close,.d-drawer-close,.d-sheet-close,.d-notification-close,.d-tour-close{cursor:pointer;line-height:var(--d-lh-none);background:none;border:none;font-size:var(--d-text-xl);padding:var(--d-sp-1);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}',

  // ═══════════════════════════════════════════════════════════════
  // ALERT DIALOG (confirmation modal)
  // ═══════════════════════════════════════════════════════════════
  'dialog.d-alertdialog{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-alertdialog[open]{display:flex;align-items:center;justify-content:center}',
  'dialog.d-alertdialog::backdrop{background:var(--d-overlay)}',
  '.d-alertdialog-panel{max-width:420px;display:flex;flex-direction:column}',
  '.d-alertdialog-body{padding:var(--d-compound-pad)}',
  '.d-alertdialog-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg);margin-bottom:var(--d-sp-2)}',
  '.d-alertdialog-desc{font-size:var(--d-text-base);color:var(--d-muted);line-height:var(--d-lh-normal)}',
  '.d-alertdialog-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',

  // ═══════════════════════════════════════════════════════════════
  // DRAWER (native <dialog>, 4 positions)
  // ═══════════════════════════════════════════════════════════════
  'dialog.d-drawer{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-drawer::backdrop{background:var(--d-overlay)}',
  '.d-drawer-panel{position:absolute;display:flex;flex-direction:column;overflow:auto;outline:none}',
  '.d-drawer-left{top:0;bottom:0;left:0}',
  '.d-drawer-right{top:0;bottom:0;right:0}',
  '.d-drawer-top{top:0;left:0;right:0}',
  '.d-drawer-bottom{bottom:0;left:0;right:0}',
  '.d-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
  '.d-drawer-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-drawer-body{flex:1;overflow:auto;padding:var(--d-compound-gap) var(--d-compound-pad)}',
  '.d-drawer-body:last-child{padding-bottom:var(--d-compound-pad)}',
  '.d-drawer-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',

  // ═══════════════════════════════════════════════════════════════
  // SHEET (like Drawer but slide-over from bottom on mobile)
  // ═══════════════════════════════════════════════════════════════
  'dialog.d-sheet{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-sheet::backdrop{background:var(--d-overlay)}',
  '.d-sheet-panel{position:absolute;display:flex;flex-direction:column;overflow:auto;outline:none}',
  '.d-sheet-left{top:0;bottom:0;left:0}',
  '.d-sheet-right{top:0;bottom:0;right:0}',
  '.d-sheet-top{top:0;left:0;right:0}',
  '.d-sheet-bottom{bottom:0;left:0;right:0;max-height:85vh;border-top-left-radius:var(--d-radius-lg,12px);border-top-right-radius:var(--d-radius-lg,12px)}',
  '.d-sheet-handle{display:flex;justify-content:center;padding:var(--d-sp-2) 0}',
  '.d-sheet-handle-bar{width:var(--d-sheet-handle-w);height:var(--d-sheet-handle-h);border-radius:var(--d-radius-sm);background:var(--d-border)}',
  '.d-sheet-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
  '.d-sheet-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-sheet-body{flex:1;overflow:auto;padding:var(--d-compound-gap) var(--d-compound-pad)}',
  '.d-sheet-body:last-child{padding-bottom:var(--d-compound-pad)}',
  '.d-sheet-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',

  // ═══════════════════════════════════════════════════════════════
  // TOOLTIP
  // ═══════════════════════════════════════════════════════════════
  '.d-tooltip-wrap{position:relative;display:inline-flex}',
  '.d-tooltip{position:absolute;z-index:var(--d-z-tooltip);padding:var(--d-sp-1-5) var(--d-sp-2-5);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);white-space:nowrap;pointer-events:none}',
  '.d-tooltip-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-tooltip)}',
  '.d-tooltip-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:var(--d-offset-tooltip)}',
  '.d-tooltip-left{right:100%;top:50%;transform:translateY(-50%);margin-right:var(--d-offset-tooltip)}',
  '.d-tooltip-right{left:100%;top:50%;transform:translateY(-50%);margin-left:var(--d-offset-tooltip)}',

  // ═══════════════════════════════════════════════════════════════
  // POPOVER
  // ═══════════════════════════════════════════════════════════════
  '.d-popover{position:relative;display:inline-flex}',
  '.d-popover-content{position:absolute;z-index:var(--d-z-popover);min-width:200px;padding:var(--d-sp-3)}',
  '.d-popover-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-popover)}',
  '.d-popover-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:var(--d-offset-popover)}',
  '.d-popover-left{right:100%;top:50%;transform:translateY(-50%);margin-right:var(--d-offset-popover)}',
  '.d-popover-right{left:100%;top:50%;transform:translateY(-50%);margin-left:var(--d-offset-popover)}',
  '.d-popover-align-start{left:0;transform:none}',
  '.d-popover-align-end{left:auto;right:0;transform:none}',
  '.d-popover-top.d-popover-align-start,.d-popover-bottom.d-popover-align-start{left:0;transform:none}',
  '.d-popover-top.d-popover-align-end,.d-popover-bottom.d-popover-align-end{left:auto;right:0;transform:none}',

  // ═══════════════════════════════════════════════════════════════
  // HOVER CARD
  // ═══════════════════════════════════════════════════════════════
  '.d-hovercard{position:relative;display:inline-flex}',
  '.d-hovercard-content{position:absolute;z-index:var(--d-z-popover);min-width:240px;padding:var(--d-sp-3);pointer-events:auto}',

  // ═══════════════════════════════════════════════════════════════
  // DROPDOWN
  // ═══════════════════════════════════════════════════════════════
  '.d-dropdown{position:relative;display:inline-flex}',
  '.d-dropdown-menu{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);min-width:180px;margin-top:var(--d-offset-menu);overflow:auto;max-height:var(--d-panel-max-h);padding:var(--d-sp-1)}',
  '.d-dropdown-right{left:auto;right:0}',
  '.d-dropdown-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none;border-radius:var(--d-radius-inner)}',
  '.d-dropdown-item-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-dropdown-item-label{flex:1}',
  '.d-dropdown-item-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-dropdown-item-shortcut{flex-shrink:0;font-size:var(--d-text-sm);opacity:var(--d-icon-muted)}',
  '.d-dropdown-separator{height:1px;margin:var(--d-sp-1) 0}',
  '.d-dropdown-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted);text-transform:uppercase;letter-spacing:var(--d-ls-caps)}',

  // ═══════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ═══════════════════════════════════════════════════════════════
  '.d-contextmenu{position:fixed;z-index:var(--d-z-popover);min-width:180px;max-height:320px;overflow:auto;padding:var(--d-sp-1)}',

  // ═══════════════════════════════════════════════════════════════
  // COMMAND PALETTE
  // ═══════════════════════════════════════════════════════════════
  'dialog.d-command{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
  'dialog.d-command[open]{display:flex;align-items:center;justify-content:center}',
  '.d-command-panel{display:flex;flex-direction:column;max-height:400px;overflow:hidden;width:560px;max-width:90vw}',
  '.d-command-input-wrap{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3);gap:var(--d-sp-2)}',
  '.d-command-input{flex:1;background:transparent;border:none;outline:none;font:inherit;font-size:var(--d-text-base)}',
  '.d-command-icon{flex-shrink:0;opacity:var(--d-icon-muted)}',
  '.d-command-list{flex:1;overflow:auto;padding:var(--d-sp-1)}',
  '.d-command-group{padding:var(--d-sp-1) 0}',
  '.d-command-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted);text-transform:uppercase;letter-spacing:var(--d-ls-caps)}',
  '.d-command-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none;border-radius:var(--d-radius-inner)}',
  '.d-command-item-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-command-item-label{flex:1}',
  '.d-command-item-shortcut{font-size:var(--d-text-sm);opacity:var(--d-icon-muted)}',
  '.d-command-empty{padding:var(--d-sp-6);text-align:center;font-size:var(--d-text-sm);color:var(--d-muted)}',
  '.d-command-separator{height:1px;margin:var(--d-sp-1) 0;background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // POPCONFIRM
  // ═══════════════════════════════════════════════════════════════
  '.d-popconfirm-wrap{position:relative;display:inline-flex}',
  '.d-popconfirm{position:absolute;z-index:var(--d-z-popover);min-width:220px;padding:var(--d-sp-3)}',
  '.d-popconfirm-body{display:flex;align-items:flex-start;gap:var(--d-sp-2);margin-bottom:var(--d-sp-3)}',
  '.d-popconfirm-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
  '.d-popconfirm-desc{font-size:var(--d-text-sm);color:var(--d-muted);margin-bottom:var(--d-sp-3);line-height:var(--d-lh-normal)}',
  '.d-popconfirm-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2)}',

  // ═══════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════
  '.d-tabs{display:flex;flex-direction:column}',
  '.d-tabs-list{display:flex;gap:0}',
  '.d-tab{font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-2-5) var(--d-sp-4);cursor:pointer;outline:none;background:transparent;border:none;white-space:nowrap}',
  '.d-tab:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-tabs-panel{padding:var(--d-sp-6) var(--d-sp-4) var(--d-sp-4)}',
  '.d-tabs-vertical{flex-direction:row}',
  '.d-tabs-vertical .d-tabs-list{flex-direction:column}',
  '.d-tab[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-tabs[data-disabled]{opacity:var(--d-disabled-opacity);pointer-events:none}',
  '.d-tabs-sm .d-tab{padding:var(--d-sp-1-5) var(--d-sp-3);font-size:var(--d-text-sm)}',
  '.d-tabs-lg .d-tab{padding:var(--d-sp-3) var(--d-sp-5);font-size:var(--d-text-md)}',
  '.d-tab-closable{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-tab-close{opacity:var(--d-disabled-opacity);font-size:0.75em;cursor:pointer;background:none;border:none;padding:0;color:inherit}',
  '.d-tab-close:hover{opacity:1}',
  '.d-tabs-panel-container{flex:1;min-width:0}',
  '.d-tabs-vertical .d-tabs-list{min-width:max-content}',

  // ═══════════════════════════════════════════════════════════════
  // ACCORDION / COLLAPSIBLE
  // ═══════════════════════════════════════════════════════════════
  '.d-accordion{display:flex;flex-direction:column}',
  '.d-accordion-item{overflow:hidden}',
  '.d-accordion-trigger{display:flex;align-items:center;justify-content:space-between;width:100%;font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-4) var(--d-sp-5);cursor:pointer;outline:none;background:transparent;border:none;text-align:left}',
  '.d-accordion-trigger:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-accordion-icon{font-size:var(--d-text-sm);transition:transform var(--d-duration-fast)}',
  '.d-accordion-open .d-accordion-icon{transform:rotate(180deg)}',
  '.d-accordion-region{transition:height var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-accordion-content{padding:0 var(--d-sp-5) var(--d-sp-3)}',
  '.d-collapsible{display:flex;flex-direction:column}',
  '.d-collapsible-trigger{cursor:pointer;user-select:none}',
  '.d-collapsible-content{overflow:hidden;transition:height var(--d-duration-normal) var(--d-easing-decelerate)}',

  // ═══════════════════════════════════════════════════════════════
  // SEPARATOR / DIVIDER
  // ═══════════════════════════════════════════════════════════════
  '.d-separator{border:none;margin:var(--d-sp-3) 0}',
  'hr.d-separator{height:1px;background:var(--d-border)}',
  '.d-separator-vertical{display:inline-block;width:1px;height:1em;margin:0 var(--d-sp-2);vertical-align:middle}',
  'div.d-separator{display:flex;align-items:center;gap:var(--d-sp-3)}',
  '.d-separator-line{flex:1;height:1px;background:var(--d-border)}',
  '.d-separator-label{font-size:var(--d-text-sm);white-space:nowrap}',

  // ═══════════════════════════════════════════════════════════════
  // BREADCRUMB
  // ═══════════════════════════════════════════════════════════════
  '.d-breadcrumb-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0;flex-wrap:wrap}',
  '.d-breadcrumb-item{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-breadcrumb-link{font:inherit;font-size:var(--d-text-base);text-decoration:none;cursor:pointer;background:transparent;border:none;padding:0}',
  '.d-breadcrumb-separator{font-size:var(--d-text-sm)}',
  '.d-breadcrumb-current{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500)}',

  // ═══════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════
  '.d-pagination{display:flex;align-items:center}',
  '.d-pagination-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0}',
  '.d-pagination-btn{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;padding:0 var(--d-sp-2);font:inherit;font-size:var(--d-text-base);cursor:pointer;outline:none;background:transparent;border:none}',
  '.d-pagination-btn:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-pagination-disabled{opacity:var(--d-disabled-opacity-soft);cursor:not-allowed;pointer-events:none}',
  '.d-pagination-ellipsis{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;font-size:var(--d-text-base)}',
  '.d-pagination-simple{display:flex;align-items:center;gap:var(--d-sp-2)}',
  '.d-pagination-sm .d-pagination-btn{min-width:var(--d-field-h-sm);height:var(--d-field-h-sm);font-size:var(--d-field-text-sm)}',
  '.d-pagination-sm .d-pagination-ellipsis{min-width:var(--d-field-h-sm);height:var(--d-field-h-sm);font-size:var(--d-field-text-sm)}',
  '.d-pagination-lg .d-pagination-btn{min-width:var(--d-field-h-lg);height:var(--d-field-h-lg);font-size:var(--d-field-text-lg)}',
  '.d-pagination-lg .d-pagination-ellipsis{min-width:var(--d-field-h-lg);height:var(--d-field-h-lg);font-size:var(--d-field-text-lg)}',

  // ═══════════════════════════════════════════════════════════════
  // STEPS / STEPPER
  // ═══════════════════════════════════════════════════════════════
  '.d-steps{display:flex;align-items:flex-start}',
  '.d-steps-vertical{flex-direction:column}',
  '.d-step{display:flex;align-items:flex-start;flex:1;gap:var(--d-sp-2)}',
  '.d-step-icon{display:flex;align-items:center;justify-content:center;width:var(--d-step-icon-size);height:var(--d-step-icon-size);border-radius:50%;flex-shrink:0;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
  '.d-step-content{display:flex;flex-direction:column;gap:var(--d-sp-1);min-width:0}',
  '.d-step-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);line-height:var(--d-step-icon-size)}',
  '.d-step-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
  '.d-step-connector{flex:1;height:var(--d-border-width);margin-top:calc(var(--d-step-icon-size) / 2);min-width:var(--d-sp-6)}',
  '.d-steps-vertical .d-step-connector{width:var(--d-border-width);height:auto;min-height:var(--d-sp-6);margin-top:0;margin-left:calc(var(--d-step-icon-size) / 2)}',

  // ═══════════════════════════════════════════════════════════════
  // SEGMENTED CONTROL
  // ═══════════════════════════════════════════════════════════════
  '.d-segmented{display:inline-flex;padding:var(--d-sp-0-5);border-radius:var(--d-radius-panel);gap:var(--d-sp-0-5)}',
  '.d-segmented-item{display:inline-flex;align-items:center;justify-content:center;padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);cursor:pointer;border:none;background:none;outline:none;border-radius:var(--d-radius-inner);white-space:nowrap;transition:all var(--d-duration-fast)}',
  '.d-segmented-item:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-segmented-item[aria-checked="true"]{font-weight:var(--d-fw-medium,500)}',
  '.d-segmented-item[disabled]{cursor:not-allowed;opacity:var(--d-disabled-opacity)}',
  '.d-segmented-sm .d-segmented-item{padding:var(--d-field-py-xs) var(--d-sp-2);font-size:var(--d-field-text-xs)}',
  '.d-segmented-lg .d-segmented-item{padding:var(--d-sp-2) var(--d-sp-4);font-size:var(--d-field-text-md)}',
  '.d-segmented-block{display:flex;width:100%}',
  '.d-segmented-block>.d-segmented-item{flex:1}',
  '.d-segmented[data-disabled]{opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none}',

  // ═══════════════════════════════════════════════════════════════
  // MENU / MENUBAR / NAVIGATION MENU
  // ═══════════════════════════════════════════════════════════════
  '.d-menu{display:flex;flex-direction:column;min-width:180px;padding:var(--d-sp-1)}',
  '.d-menu-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none;border:none;background:none;text-align:left;width:100%;font:inherit;border-radius:var(--d-radius-inner)}',
  '.d-menu-item:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-menu-item-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed}',
  '.d-menu-item-icon{flex-shrink:0;width:1em;height:1em}',
  '.d-menu-item-label{flex:1}',
  '.d-menu-item-arrow{flex-shrink:0;font-size:var(--d-text-xs);opacity:var(--d-icon-muted)}',
  '.d-menu-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted)}',
  '.d-menu-separator{height:1px;margin:var(--d-sp-1) 0;background:var(--d-border)}',
  '.d-menu-sub{position:absolute;left:100%;top:0;z-index:var(--d-z-dropdown);min-width:180px;padding:var(--d-sp-1)}',
  '.d-menubar{display:flex;align-items:center;gap:0}',
  '.d-menubar-item{display:flex;align-items:center;padding:var(--d-sp-1-5) var(--d-sp-3);cursor:pointer;font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);background:none;border:none;outline:none}',
  '.d-menubar-item:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-navmenu{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-navmenu-item{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3);font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);cursor:pointer;text-decoration:none;border:none;background:none;outline:none;white-space:nowrap}',
  '.d-navmenu-item:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-navmenu-content{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);min-width:200px;padding:var(--d-sp-3)}',

  // ═══════════════════════════════════════════════════════════════
  // AFFIX (sticky)
  // ═══════════════════════════════════════════════════════════════
  '.d-affix{position:relative}',
  '.d-affix-fixed{position:fixed;z-index:var(--d-z-sticky)}',

  // ═══════════════════════════════════════════════════════════════
  // TABLE
  // ═══════════════════════════════════════════════════════════════
  '.d-table-wrap{overflow-x:auto}',
  '.d-table{width:100%;border-collapse:collapse;font-size:var(--d-text-base)}',
  '.d-th{text-align:left;font-weight:var(--d-fw-title);padding:var(--d-sp-3)}',
  '.d-td{padding:var(--d-sp-3)}',
  '.d-table-compact .d-th,.d-table-compact .d-td{padding:var(--d-sp-1-5) var(--d-sp-3)}',
  '.d-th-sortable{cursor:pointer;user-select:none}',
  '.d-th-sort-icon{display:inline-flex;margin-left:var(--d-sp-1);font-size:var(--d-text-xs);opacity:var(--d-disabled-opacity-soft)}',
  '.d-th-sort-active .d-th-sort-icon{opacity:1}',
  '.d-table-expandable .d-td:first-child{padding-left:var(--d-sp-6)}',
  '.d-table-expand-btn{background:none;border:none;cursor:pointer;padding:0;font-size:var(--d-text-sm);margin-right:var(--d-sp-2)}',
  '.d-table-row-selected{font-weight:var(--d-fw-medium,500)}',
  '.d-table-sticky{position:sticky;top:0;z-index:2}',
  '.d-table-footer{padding:var(--d-sp-3);display:flex;align-items:center;justify-content:space-between}',

  // ═══════════════════════════════════════════════════════════════
  // DATATABLE
  // ═══════════════════════════════════════════════════════════════
  '.d-datatable{display:flex;flex-direction:column;width:100%;font-size:var(--d-text-base)}',
  '.d-datatable-header{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-3)}',
  '.d-datatable-scroll{overflow:auto;flex:1}',
  '.d-datatable-table{width:100%;border-collapse:collapse;table-layout:auto}',
  '.d-datatable-th{text-align:left;font-weight:var(--d-fw-title,600);padding:var(--d-sp-3);position:relative;white-space:nowrap;font-size:var(--d-text-sm);letter-spacing:var(--d-ls-caps);text-transform:uppercase}',
  '.d-datatable-th-sortable{cursor:pointer;user-select:none}',
  '.d-datatable-th-sortable:hover{opacity:0.8}',
  '.d-datatable-sort-icon{display:inline;margin-left:var(--d-sp-1);font-size:var(--d-text-xs);opacity:var(--d-disabled-opacity-soft)}',
  '.d-datatable-th-sorted-asc .d-datatable-sort-icon,.d-datatable-th-sorted-desc .d-datatable-sort-icon{opacity:1}',
  '.d-datatable-td{padding:var(--d-sp-3);vertical-align:middle}',
  '.d-datatable-td-editing{padding:0}',
  '.d-datatable-edit-input{width:100%;padding:var(--d-sp-2) var(--d-sp-3);border:var(--d-border-width-strong) solid var(--d-primary);background:var(--d-surface-0);color:var(--d-fg);font:inherit;font-size:var(--d-text-base);outline:none;box-sizing:border-box}',
  '.d-datatable-row{transition:background var(--d-duration-fast,100ms) var(--d-easing-standard,ease)}',
  '.d-datatable-hoverable .d-datatable-row:hover{background:var(--d-surface-1,rgba(0,0,0,0.03))}',
  '.d-datatable-striped .d-datatable-row:nth-child(even){background:var(--d-surface-0,rgba(0,0,0,0.02))}',
  '.d-datatable-row-selected{background:var(--d-selected-bg) !important;font-weight:var(--d-fw-medium,500)}',
  '.d-datatable-row-expanded{background:var(--d-surface-1)}',
  '.d-datatable-expand-row{background:var(--d-surface-0)}',
  '.d-datatable-expand-row .d-datatable-td{padding:var(--d-sp-4) var(--d-sp-6)}',
  '.d-datatable-expand-btn{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-sm);color:var(--d-muted-fg);line-height:var(--d-lh-none)}',
  '.d-datatable-expand-btn:hover{color:var(--d-fg)}',
  '.d-datatable-checkbox{cursor:pointer;width:16px;height:16px;accent-color:var(--d-primary)}',
  '.d-datatable-sticky{position:sticky;top:0;z-index:4;background:var(--d-surface-0)}',
  '.d-datatable-pinned-left,.d-datatable-pinned-right{position:sticky;z-index:2;background:var(--d-surface-0)}',
  '.d-datatable-resize-handle{position:absolute;right:0;top:0;bottom:0;width:4px;cursor:col-resize;user-select:none}',
  '.d-datatable-resize-handle:hover{background:var(--d-primary,#3b82f6)}',
  '.d-datatable-filter-icon{background:none;border:none;cursor:pointer;font-size:var(--d-text-xs);padding:var(--d-sp-1);color:var(--d-muted-fg);line-height:var(--d-lh-none)}',
  '.d-datatable-filter-icon:hover,.d-datatable-filter-active{color:var(--d-primary)}',
  '.d-datatable-filter-popup{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown,1000);padding:var(--d-sp-2);min-width:180px}',
  '.d-datatable-filter-popup input{width:100%;padding:var(--d-sp-1-5) var(--d-sp-2);border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius-inner,4px);font:inherit;font-size:var(--d-text-sm);background:var(--d-surface-0);color:var(--d-fg);outline:none;box-sizing:border-box}',
  '.d-datatable-filter-popup input:focus{border-color:var(--d-primary);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-ring)}',
  '.d-datatable-pagination{display:flex;align-items:center;justify-content:flex-end;gap:var(--d-sp-3);padding:var(--d-sp-3);font-size:var(--d-text-sm)}',
  '.d-datatable-page-size{display:flex;align-items:center;gap:var(--d-sp-2)}',
  '.d-datatable-page-size select{padding:var(--d-sp-1) var(--d-sp-2);border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius-inner,4px);font:inherit;font-size:var(--d-text-sm);background:var(--d-surface-0);color:var(--d-fg);cursor:pointer}',
  '.d-datatable-page-btn{background:none;border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius-inner,4px);padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);cursor:pointer;color:var(--d-fg)}',
  '.d-datatable-page-btn:hover:not([disabled]){background:var(--d-item-hover-bg);border-color:var(--d-border-strong)}',
  '.d-datatable-page-btn[disabled]{opacity:var(--d-disabled-opacity-soft);cursor:not-allowed}',
  '.d-datatable-page-info{color:var(--d-muted-fg)}',
  '.d-datatable-empty{text-align:center}',
  '.d-datatable-empty .d-datatable-td{padding:var(--d-sp-8);color:var(--d-muted-fg);font-style:italic}',
  '.d-datatable-export-btn{background:none;border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius,4px);padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);cursor:pointer;color:var(--d-fg);margin-left:auto}',
  '.d-datatable-export-btn:hover{background:var(--d-item-hover-bg);border-color:var(--d-border-strong)}',
  '@media(prefers-reduced-motion:reduce){.d-datatable-row{transition:none}}',

  // ═══════════════════════════════════════════════════════════════
  // LIST
  // ═══════════════════════════════════════════════════════════════
  '.d-list{display:flex;flex-direction:column}',
  '.d-list-item{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3)}',
  '.d-list-item-meta{display:flex;flex-direction:column;gap:var(--d-sp-1);flex:1;min-width:0}',
  '.d-list-item-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500)}',
  '.d-list-item-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
  '.d-list-item-actions{display:flex;gap:var(--d-sp-2);align-items:center;flex-shrink:0}',
  '.d-list-item-avatar{flex-shrink:0}',
  '.d-list-header{padding:var(--d-sp-3);font-weight:var(--d-fw-title)}',
  '.d-list-footer{padding:var(--d-sp-3)}',
  '.d-list-grid{display:grid}',
  '.d-list-loading{display:flex;justify-content:center;padding:var(--d-sp-4)}',

  // ═══════════════════════════════════════════════════════════════
  // TREE
  // ═══════════════════════════════════════════════════════════════
  '.d-tree{display:flex;flex-direction:column}',
  '.d-tree-node{display:flex;flex-direction:column}',
  '.d-tree-node-content{display:flex;align-items:center;gap:var(--d-sp-1);padding:var(--d-sp-1) 0;cursor:pointer;font-size:var(--d-text-base)}',
  '.d-tree-node-content:hover{background:var(--d-item-hover-bg)}',
  '.d-tree-node-indent{display:inline-flex;width:var(--d-tree-indent);flex-shrink:0}',
  '.d-tree-node-switcher{display:inline-flex;align-items:center;justify-content:center;width:var(--d-tree-indent);cursor:pointer;font-size:var(--d-text-sm);transition:transform var(--d-duration-fast);background:none;border:none;padding:0}',
  '.d-tree-node-switcher-open{transform:rotate(90deg)}',
  '.d-tree-node-checkbox{flex-shrink:0}',
  '.d-tree-node-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-tree-node-selected .d-tree-node-label{font-weight:var(--d-fw-medium,500)}',
  '.d-tree-children{padding-left:var(--d-tree-indent)}',
  '.d-tree-node-dragging{opacity:var(--d-disabled-opacity)}',

  // ═══════════════════════════════════════════════════════════════
  // AVATAR
  // ═══════════════════════════════════════════════════════════════
  '.d-avatar{display:inline-flex;align-items:center;justify-content:center;width:var(--d-avatar-size);height:var(--d-avatar-size);overflow:hidden;flex-shrink:0}',
  '.d-avatar-sm{width:var(--d-avatar-size-sm);height:var(--d-avatar-size-sm);font-size:var(--d-text-xs)}',
  '.d-avatar-lg{width:var(--d-avatar-size-lg);height:var(--d-avatar-size-lg);font-size:var(--d-text-md)}',
  '.d-avatar-xl{width:var(--d-avatar-size-xl);height:var(--d-avatar-size-xl);font-size:var(--d-text-lg)}',
  '.d-avatar-img{width:100%;height:100%;object-fit:cover}',
  '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--d-text-sm);font-weight:var(--d-fw-title)}',
  '.d-avatar-group{display:flex}',
  '.d-avatar-group>.d-avatar{margin-left:calc(var(--d-sp-2) * -1);outline:var(--d-border-width-strong) solid var(--d-bg)}',
  '.d-avatar-group>.d-avatar:first-child{margin-left:0}',
  '.d-avatar-group-count{display:inline-flex;align-items:center;justify-content:center;margin-left:calc(var(--d-sp-2) * -1);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);z-index:1}',

  // ═══════════════════════════════════════════════════════════════
  // PROGRESS
  // ═══════════════════════════════════════════════════════════════
  '.d-progress-wrap{position:relative;width:100%}',
  '.d-progress{position:relative;width:100%;height:var(--d-progress-h);overflow:hidden}',
  '.d-progress-sm{height:var(--d-progress-h-sm)}',
  '.d-progress-md{height:var(--d-progress-h-md)}',
  '.d-progress-lg{height:var(--d-progress-h-lg)}',
  '.d-progress-bar{height:100%;transition:width var(--d-duration-normal) var(--d-easing-standard)}',
  '.d-progress-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-title);line-height:var(--d-lh-none);margin-top:var(--d-sp-1);text-align:right}',
  '.d-progress-md .d-progress-label,.d-progress-lg .d-progress-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;margin-top:0}',
  '.d-progress-circle{display:inline-flex;position:relative}',
  '.d-progress-circle-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--d-text-sm);font-weight:var(--d-fw-title)}',

  // ═══════════════════════════════════════════════════════════════
  // SKELETON
  // ═══════════════════════════════════════════════════════════════
  '.d-skeleton{animation:d-shimmer calc(var(--d-duration-spin) * 1.8) infinite linear;overflow:hidden}',
  '.d-skeleton-text{height:var(--d-text-base);border-radius:var(--d-radius-inner)}',
  '.d-skeleton-rect{border-radius:var(--d-radius-inner)}',
  '.d-skeleton-circle{border-radius:50%}',
  '.d-skeleton-group{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-skeleton-avatar{border-radius:50%;flex-shrink:0}',
  '.d-skeleton-button{height:var(--d-field-h-sm);border-radius:var(--d-radius);width:6rem}',
  '.d-skeleton-input{height:var(--d-field-h-md);border-radius:var(--d-radius);width:100%}',

  // ═══════════════════════════════════════════════════════════════
  // ALERT
  // ═══════════════════════════════════════════════════════════════
  '.d-alert{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base)}',
  '.d-alert-icon{flex-shrink:0;font-size:var(--d-text-lg);line-height:var(--d-lh-none)}',
  '.d-alert-body{flex:1;min-width:0}',
  '.d-alert-title{font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
  '.d-alert-desc{font-size:var(--d-text-sm);line-height:var(--d-lh-normal);color:var(--d-muted)}',
  '.d-alert-dismiss{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-lg);line-height:var(--d-lh-none);padding:0}',
  '.d-alert-closable{padding-right:var(--d-sp-8)}',

  // ═══════════════════════════════════════════════════════════════
  // TOAST / MESSAGE / NOTIFICATION
  // ═══════════════════════════════════════════════════════════════
  '.d-toast-container{position:fixed;z-index:var(--d-z-toast);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;max-width:360px}',
  '.d-toast-top-right{top:var(--d-sp-4);right:var(--d-sp-4)}',
  '.d-toast-top-left{top:var(--d-sp-4);left:var(--d-sp-4)}',
  '.d-toast-top-center{top:var(--d-sp-4);left:50%;transform:translateX(-50%)}',
  '.d-toast-bottom-right{bottom:var(--d-sp-4);right:var(--d-sp-4)}',
  '.d-toast-bottom-left{bottom:var(--d-sp-4);left:var(--d-sp-4)}',
  '.d-toast-bottom-center{bottom:var(--d-sp-4);left:50%;transform:translateX(-50%)}',
  '.d-toast{display:flex;align-items:flex-start;gap:var(--d-sp-2);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base);pointer-events:auto;animation:d-slidein-t var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-toast-message{flex:1}',
  '.d-toast-close{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-md);line-height:var(--d-lh-none);padding:0}',
  '.d-toast-exit{opacity:0;transform:translateY(calc(var(--d-slide-distance) * -1));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  // Notification (stacked notification system)
  '.d-notification-container{position:fixed;z-index:var(--d-z-toast);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;max-width:400px}',
  '.d-notification-top-right{top:var(--d-sp-4);right:var(--d-sp-4)}',
  '.d-notification-top-left{top:var(--d-sp-4);left:var(--d-sp-4)}',
  '.d-notification-bottom-right{bottom:var(--d-sp-4);right:var(--d-sp-4);flex-direction:column-reverse}',
  '.d-notification-bottom-left{bottom:var(--d-sp-4);left:var(--d-sp-4);flex-direction:column-reverse}',
  '.d-notification{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4);min-width:320px;max-width:400px;pointer-events:auto;animation:d-slidein-t var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-notification-icon{flex-shrink:0;font-size:var(--d-text-lg);line-height:var(--d-lh-none)}',
  '.d-notification-content{flex:1;min-width:0}',
  '.d-notification-title{font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
  '.d-notification-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
  '.d-notification-action{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
  '.d-notification-exit{opacity:0;transform:translateY(calc(var(--d-slide-distance) * -1));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  // Message (inline centered toast)
  '.d-message-container{position:fixed;z-index:var(--d-z-toast);top:var(--d-sp-4);left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;align-items:center}',
  '.d-message{display:inline-flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-4);font-size:var(--d-text-base);pointer-events:auto;animation:d-slidein-b var(--d-duration-fast) var(--d-easing-standard);white-space:nowrap}',

  // ═══════════════════════════════════════════════════════════════
  // RESULT (success/error/404 pages)
  // ═══════════════════════════════════════════════════════════════
  '.d-result{display:flex;flex-direction:column;align-items:center;padding:var(--d-sp-12) var(--d-sp-4);text-align:center;gap:var(--d-sp-3)}',
  '.d-result-icon{font-size:3rem;line-height:var(--d-lh-none)}',
  '.d-result-title{font-size:var(--d-text-xl);font-weight:var(--d-fw-title)}',
  '.d-result-desc{font-size:var(--d-text-base);color:var(--d-muted);max-width:480px;line-height:var(--d-lh-normal)}',
  '.d-result-actions{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
  '.d-result-extra{margin-top:var(--d-sp-4)}',

  // ═══════════════════════════════════════════════════════════════
  // DESCRIPTIONS (key-value pairs)
  // ═══════════════════════════════════════════════════════════════
  '.d-descriptions{display:flex;flex-direction:column}',
  '.d-descriptions-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg);margin-bottom:var(--d-sp-3)}',
  '.d-descriptions-table{width:100%;border-collapse:collapse}',
  '.d-descriptions-label{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);color:var(--d-muted);white-space:nowrap;vertical-align:top}',
  '.d-descriptions-content{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-base)}',
  '.d-descriptions-horizontal .d-descriptions-label{text-align:right;width:30%}',

  // ═══════════════════════════════════════════════════════════════
  // STATISTIC
  // ═══════════════════════════════════════════════════════════════
  '.d-statistic{display:flex;flex-direction:column;gap:var(--d-sp-1)}',
  '.d-statistic-label{font-size:var(--d-text-sm);color:var(--d-muted)}',
  '.d-statistic-value{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading)}',
  '.d-statistic-prefix,.d-statistic-suffix{font-size:var(--d-text-lg);vertical-align:baseline}',
  '.d-statistic-trend{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
  '.d-statistic-countdown{font-variant-numeric:tabular-nums}',

  // ═══════════════════════════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════════════════════════
  '.d-calendar{display:flex;flex-direction:column}',
  '.d-calendar-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-3)}',
  '.d-calendar-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
  '.d-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);text-align:center}',
  '.d-calendar-weekday{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-2);color:var(--d-muted)}',
  '.d-calendar-cell{padding:var(--d-sp-1);min-height:4rem;cursor:pointer;border:none;background:none;font:inherit;text-align:left;vertical-align:top;position:relative}',
  '.d-calendar-cell-content{font-size:var(--d-text-sm)}',
  '.d-calendar-mini .d-calendar-cell{min-height:auto;text-align:center;padding:var(--d-sp-1)}',

  // ═══════════════════════════════════════════════════════════════
  // CAROUSEL
  // ═══════════════════════════════════════════════════════════════
  '.d-carousel{position:relative;overflow:hidden}',
  '.d-carousel-track{display:flex;transition:transform var(--d-duration-normal) var(--d-easing-standard)}',
  '.d-carousel-slide{flex:0 0 100%;min-width:0}',
  '.d-carousel-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:1;background:none;border:none;cursor:pointer;padding:var(--d-sp-2);font-size:var(--d-text-xl);opacity:0.7}',
  '.d-carousel-nav:hover{opacity:1}',
  '.d-carousel-prev{left:var(--d-sp-2)}',
  '.d-carousel-next{right:var(--d-sp-2)}',
  '.d-carousel-dots{display:flex;justify-content:center;gap:var(--d-sp-2);padding:var(--d-sp-3)}',
  '.d-carousel-dot{width:var(--d-carousel-dot);height:var(--d-carousel-dot);border-radius:50%;cursor:pointer;border:none;padding:0;opacity:var(--d-disabled-opacity-soft)}',
  '.d-carousel-dot-active{opacity:1}',

  // ═══════════════════════════════════════════════════════════════
  // EMPTY (no data placeholder)
  // ═══════════════════════════════════════════════════════════════
  '.d-empty{display:flex;flex-direction:column;align-items:center;padding:var(--d-sp-8) var(--d-sp-4);text-align:center;gap:var(--d-sp-2)}',
  '.d-empty-icon{font-size:2.5rem;opacity:var(--d-disabled-opacity-soft);line-height:var(--d-lh-none)}',
  '.d-empty-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',

  // ═══════════════════════════════════════════════════════════════
  // IMAGE (lightbox)
  // ═══════════════════════════════════════════════════════════════
  '.d-image{display:inline-block;overflow:hidden;position:relative}',
  '.d-image>img{display:block;width:100%;height:100%;object-fit:cover}',
  '.d-image-preview{cursor:zoom-in}',
  '.d-image-overlay{position:fixed;inset:0;z-index:var(--d-z-modal);background:var(--d-overlay);display:flex;align-items:center;justify-content:center;cursor:zoom-out}',
  '.d-image-overlay>img{max-width:90vw;max-height:90vh;object-fit:contain}',
  '.d-image-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--d-text-sm);color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // TIMELINE
  // ═══════════════════════════════════════════════════════════════
  '.d-timeline{display:flex;flex-direction:column}',
  '.d-timeline-item{display:flex;gap:var(--d-sp-3);position:relative;padding-bottom:var(--d-sp-4)}',
  '.d-timeline-item:last-child{padding-bottom:0}',
  '.d-timeline-dot{display:flex;align-items:center;justify-content:center;width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px;z-index:1}',
  '.d-timeline-dot-lg{width:24px;height:24px;margin-top:0}',
  '.d-timeline-line{position:absolute;left:4px;top:15px;bottom:0;width:2px}',
  '.d-timeline-item:last-child .d-timeline-line{display:none}',
  '.d-timeline-content{flex:1;min-width:0}',
  '.d-timeline-label{font-size:var(--d-text-xs);color:var(--d-muted);margin-bottom:var(--d-sp-1)}',
  '.d-timeline-alternate .d-timeline-item:nth-child(even){flex-direction:row-reverse;text-align:right}',

  // Timeline: size small
  '.d-timeline-sm .d-timeline-dot{width:8px;height:8px;margin-top:6px}',
  '.d-timeline-sm .d-timeline-dot-lg{width:20px;height:20px}',
  '.d-timeline-sm .d-timeline-line{left:3px;top:14px;width:2px}',
  '.d-timeline-sm .d-timeline-item{gap:var(--d-sp-2);padding-bottom:var(--d-sp-2)}',
  '.d-timeline-sm .d-timeline-label{font-size:var(--d-text-xs)}',

  // Timeline: size large
  '.d-timeline-lg .d-timeline-dot{width:32px;height:32px;margin-top:0;font-size:var(--d-text-sm)}',
  '.d-timeline-lg .d-timeline-dot-lg{width:40px;height:40px}',
  '.d-timeline-lg .d-timeline-line{left:15px;top:32px;width:2px}',
  '.d-timeline-lg .d-timeline-item{gap:var(--d-sp-4);padding-bottom:var(--d-sp-6)}',
  '.d-timeline-lg .d-timeline-content{padding-top:var(--d-sp-1)}',

  // Timeline: active dot
  '.d-timeline-dot-active{transform:scale(1.3);box-shadow:0 0 12px currentColor;transition:transform var(--d-duration-fast),box-shadow var(--d-duration-fast)}',

  // Timeline: gradient line
  '.d-timeline-gradient .d-timeline-line{background:linear-gradient(to bottom,var(--d-primary),var(--d-accent)) !important}',

  // Timeline: glass dots
  '.d-timeline-glass .d-timeline-dot{backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1)}',

  // Timeline: status dot colors
  '.d-timeline-dot[data-status="success"]{background-color:var(--d-success)}',
  '.d-timeline-dot[data-status="warning"]{background-color:var(--d-warning)}',
  '.d-timeline-dot[data-status="error"]{background-color:var(--d-error)}',
  '.d-timeline-dot[data-status="info"]{background-color:var(--d-info)}',

  // Timeline: tag label
  '.d-timeline-tag{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-0-5) var(--d-sp-1-5);border-radius:var(--d-radius-full);display:inline-flex;align-items:center}',

  // ═══════════════════════════════════════════════════════════════
  // KBD (keyboard shortcut)
  // ═══════════════════════════════════════════════════════════════
  '.d-kbd{display:inline-flex;align-items:center;justify-content:center;padding:0.125rem var(--d-sp-1-5);font-family:var(--d-font-mono);font-size:0.75em;line-height:var(--d-lh-none);border-radius:var(--d-radius-sm);white-space:nowrap;vertical-align:baseline}',
  '.d-kbd-group{display:inline-flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-kbd-separator{font-size:0.75em;opacity:var(--d-icon-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  '.d-text{margin:0}',
  '.d-text-secondary{color:var(--d-muted)}',
  '.d-text-success{color:var(--d-success)}',
  '.d-text-warning{color:var(--d-warning)}',
  '.d-text-danger{color:var(--d-error)}',
  '.d-text-disabled{opacity:var(--d-disabled-opacity);cursor:not-allowed;user-select:none}',
  '.d-text-mark{padding:0 0.125em}',
  '.d-text-code{font-family:var(--d-font-mono);font-size:0.875em;padding:0.125em 0.375em;border-radius:var(--d-radius-sm)}',
  '.d-text-keyboard{font-family:var(--d-font-mono);font-size:0.875em}',
  '.d-text-underline{text-decoration:underline}',
  '.d-text-strikethrough{text-decoration:line-through}',
  '.d-text-strong{font-weight:var(--d-fw-heading)}',
  '.d-text-italic{font-style:italic}',
  '.d-title{margin:0;font-weight:var(--d-fw-heading);letter-spacing:var(--d-ls-heading);line-height:var(--d-lh-tight)}',
  '.d-title-1{font-size:var(--d-text-4xl)}',
  '.d-title-2{font-size:var(--d-text-3xl)}',
  '.d-title-3{font-size:var(--d-text-2xl)}',
  '.d-title-4{font-size:var(--d-text-xl)}',
  '.d-title-5{font-size:var(--d-text-lg)}',
  '.d-paragraph{margin:0;font-size:var(--d-text-base);line-height:var(--d-lh-relaxed)}',
  '.d-link{color:var(--d-primary);text-decoration:none;cursor:pointer}',
  '.d-link:hover{text-decoration:underline}',
  '.d-blockquote{margin:0;padding-left:var(--d-sp-4);font-style:italic;line-height:var(--d-lh-relaxed)}',

  // ═══════════════════════════════════════════════════════════════
  // SPACE / FLEX (layout utility components)
  // ═══════════════════════════════════════════════════════════════
  '.d-space{display:flex;gap:var(--d-sp-2)}',
  '.d-space-vertical{flex-direction:column}',
  '.d-space-wrap{flex-wrap:wrap}',

  // ═══════════════════════════════════════════════════════════════
  // ASPECT RATIO
  // ═══════════════════════════════════════════════════════════════
  '.d-aspect{position:relative;width:100%}',
  '.d-aspect>*{position:absolute;inset:0;width:100%;height:100%}',

  // ═══════════════════════════════════════════════════════════════
  // RESIZABLE (split panes)
  // ═══════════════════════════════════════════════════════════════
  '.d-resizable{display:flex;overflow:hidden;position:relative}',
  '.d-resizable-vertical{flex-direction:column}',
  '.d-resizable-panel{overflow:auto;min-width:0;min-height:0}',
  '.d-resizable-handle{flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:col-resize;user-select:none;width:8px}',
  '.d-resizable-handle-vertical{cursor:row-resize;height:8px;width:auto}',
  '.d-resizable-handle-bar{width:4px;height:20px;border-radius:2px;opacity:var(--d-disabled-opacity-soft)}',
  '.d-resizable-handle-vertical .d-resizable-handle-bar{width:20px;height:4px}',
  '.d-resizable-handle:hover .d-resizable-handle-bar{opacity:var(--d-icon-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // SCROLL AREA
  // ═══════════════════════════════════════════════════════════════
  '.d-scrollarea{position:relative;overflow:hidden}',
  '.d-scrollarea-viewport{width:100%;height:100%;overflow:auto;scrollbar-width:thin}',
  '.d-scrollarea-viewport::-webkit-scrollbar{width:6px;height:6px}',
  '.d-scrollarea-viewport::-webkit-scrollbar-thumb{border-radius:3px}',

  // ═══════════════════════════════════════════════════════════════
  // WATERMARK
  // ═══════════════════════════════════════════════════════════════
  '.d-watermark{position:relative}',
  '.d-watermark-canvas{position:absolute;inset:0;pointer-events:none;z-index:10}',

  // ═══════════════════════════════════════════════════════════════
  // TOUR
  // ═══════════════════════════════════════════════════════════════
  '.d-tour-overlay{position:fixed;inset:0;z-index:var(--d-z-modal);pointer-events:none}',
  '.d-tour-highlight{position:fixed;z-index:calc(var(--d-z-modal) + 1);box-shadow:0 0 0 9999px var(--d-overlay);border-radius:var(--d-radius-panel);pointer-events:none}',
  '.d-tour-popover{position:fixed;z-index:calc(var(--d-z-modal) + 2);min-width:280px;max-width:400px;padding:var(--d-sp-4);pointer-events:auto}',
  '.d-tour-title{font-weight:var(--d-fw-title);font-size:var(--d-text-base);margin-bottom:var(--d-sp-2)}',
  '.d-tour-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal);margin-bottom:var(--d-sp-3)}',
  '.d-tour-footer{display:flex;align-items:center;justify-content:space-between}',
  '.d-tour-steps{font-size:var(--d-text-xs);color:var(--d-muted)}',
  '.d-tour-actions{display:flex;gap:var(--d-sp-2)}',

  // ═══════════════════════════════════════════════════════════════
  // FLOAT BUTTON (FAB)
  // ═══════════════════════════════════════════════════════════════
  '.d-float-btn{position:fixed;z-index:var(--d-z-sticky);display:flex;align-items:center;justify-content:center;width:var(--d-float-btn-size);height:var(--d-float-btn-size);border-radius:50%;cursor:pointer;border:none;font-size:var(--d-text-xl);box-shadow:var(--d-elevation-2)}',
  '.d-float-btn:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-float-btn-group{position:fixed;z-index:var(--d-z-sticky);display:flex;flex-direction:column-reverse;gap:var(--d-sp-2)}',
  '.d-float-btn-group .d-float-btn{position:relative}',
  '.d-float-btn-badge{position:absolute;top:-4px;right:-4px}',

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
  // DATE RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-daterange{position:relative;display:inline-flex;flex-direction:column}',
  '.d-daterange-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
  '.d-daterange-calendars{display:flex;gap:var(--d-sp-2)}',
  '.d-daterange-calendar{padding:var(--d-sp-3);min-width:280px}',
  '.d-daterange-presets{display:flex;flex-direction:column;gap:var(--d-sp-1);padding:var(--d-sp-3);border-right:var(--d-border-width) solid var(--d-border);min-width:140px}',
  '.d-daterange-preset{padding:var(--d-sp-1-5) var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm);border:none;background:none;font:inherit;text-align:left;border-radius:var(--d-radius-inner);white-space:nowrap}',
  '.d-daterange-preset:hover{background:var(--d-item-hover-bg)}',
  '.d-daterange-preset:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-datepicker-day-in-range{background:var(--d-selected-bg);border-radius:0}',
  '.d-datepicker-day-range-start{border-radius:var(--d-radius-inner) 0 0 var(--d-radius-inner)}',
  '.d-datepicker-day-range-end{border-radius:0 var(--d-radius-inner) var(--d-radius-inner) 0}',

  // ═══════════════════════════════════════════════════════════════
  // TIME RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-timerange{position:relative;display:inline-flex;flex-direction:column}',
  '.d-timerange-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
  '.d-timerange-section{display:flex;flex-direction:column;align-items:center}',
  '.d-timerange-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-1-5);color:var(--d-muted)}',
  '.d-timerange-columns{display:flex;gap:0}',
  '.d-timerange-divider{display:flex;align-items:center;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);color:var(--d-muted)}',
  '.d-timerange-error{font-size:var(--d-text-xs);color:var(--d-error);padding:var(--d-sp-1) var(--d-sp-2)}',

  // ═══════════════════════════════════════════════════════════════
  // RANGE SLIDER
  // ═══════════════════════════════════════════════════════════════
  '.d-rangeslider{position:relative;display:flex;align-items:center;width:100%;height:32px;cursor:pointer;touch-action:none;user-select:none}',
  '.d-rangeslider[data-disabled]{opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none}',
  '.d-rangeslider-track{position:absolute;left:0;right:0;height:var(--d-slider-track-h);border-radius:var(--d-radius-full);background:var(--d-surface-1)}',
  '.d-rangeslider-fill{position:absolute;height:var(--d-slider-track-h);border-radius:var(--d-radius-full);background:var(--d-primary)}',
  '.d-rangeslider-thumb{position:absolute;width:var(--d-rangeslider-thumb);height:var(--d-rangeslider-thumb);border-radius:50%;background:var(--d-primary);transform:translate(-50%,-50%);top:50%;cursor:grab;outline:none;z-index:1}',
  '.d-rangeslider-thumb:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-rangeslider-thumb:active{cursor:grabbing}',
  '.d-rangeslider-tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-tooltip);font-size:var(--d-text-xs);white-space:nowrap;padding:var(--d-sp-1);border-radius:var(--d-radius-panel);pointer-events:none}',

  // ═══════════════════════════════════════════════════════════════
  // TREE SELECT
  // ═══════════════════════════════════════════════════════════════
  '.d-treeselect{position:relative;display:inline-flex;flex-direction:column}',
  '.d-treeselect-trigger{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3)}',
  '.d-treeselect-display{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.d-treeselect-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);min-width:240px;max-height:var(--d-panel-max-h);overflow:auto}',
  '.d-treeselect-panel .d-tree{padding:var(--d-sp-1) 0}',
  '.d-treeselect-panel .d-tree-node-content{padding:var(--d-sp-1) var(--d-sp-2)}',
  '.d-treeselect-search{display:block;width:100%;border:none;background:transparent;outline:none;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);border-bottom:var(--d-border-width) solid var(--d-border)}',
  '.d-treeselect-tags{display:flex;flex-wrap:wrap;gap:var(--d-sp-1);padding:var(--d-sp-1) var(--d-sp-2)}',
  '.d-treeselect-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-1-5);border-radius:var(--d-radius)}',
  '.d-treeselect-tag-remove{cursor:pointer;background:none;border:none;padding:0;font-size:0.75em;opacity:var(--d-icon-muted);line-height:var(--d-lh-none)}',
  '.d-treeselect-tag-remove:hover{opacity:1}',

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION MENU (horizontal nav with dropdowns)
  // ═══════════════════════════════════════════════════════════════
  '.d-navmenu-list{display:flex;align-items:center;gap:0;list-style:none;margin:0;padding:0}',
  '.d-navmenu-trigger{position:relative}',
  '.d-navmenu-link{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);text-decoration:none;cursor:pointer;border-radius:var(--d-radius-inner);outline:none}',
  '.d-navmenu-link:hover{background:var(--d-item-hover-bg)}',
  '.d-navmenu-link:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-navmenu-link-desc{font-size:var(--d-text-xs);color:var(--d-muted);line-height:var(--d-lh-normal)}',
  '.d-navmenu-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--d-sp-1)}',

  // ═══════════════════════════════════════════════════════════════
  // SPLITTER (resizable panels)
  // ═══════════════════════════════════════════════════════════════
  '.d-splitter{display:flex;width:100%;height:100%;overflow:hidden}',
  '.d-splitter-vertical{flex-direction:column}',
  '.d-splitter-panel{overflow:auto;flex-shrink:0}',
  '.d-splitter-handle{display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--d-surface-1);cursor:col-resize;user-select:none;touch-action:none}',
  '.d-splitter-handle-h{width:4px;cursor:col-resize}',
  '.d-splitter-handle-v{height:4px;cursor:row-resize}',
  '.d-splitter-handle:hover{background:var(--d-item-active-bg)}',
  '.d-splitter-handle:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-splitter-handle-dot{width:4px;height:24px;border-radius:2px;background:var(--d-border-strong);pointer-events:none}',
  '.d-splitter-handle-v .d-splitter-handle-dot{width:24px;height:4px}',

  // ═══════════════════════════════════════════════════════════════
  // BACK TOP
  // ═══════════════════════════════════════════════════════════════
  '.d-backtop{position:fixed;bottom:var(--d-sp-8);right:var(--d-sp-8);z-index:var(--d-z-sticky);display:flex;align-items:center;justify-content:center;width:var(--d-backtop-size);height:var(--d-backtop-size);border-radius:50%;cursor:pointer;border:none;font-size:var(--d-text-lg);box-shadow:var(--d-elevation-2);transition:opacity var(--d-duration-fast) var(--d-easing-standard),transform var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-backtop:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-backtop-hidden{opacity:0;pointer-events:none;transform:translateY(var(--d-slide-distance))}',
  '.d-backtop-visible{opacity:1;pointer-events:auto;transform:translateY(0)}',

  // Route outlet (View Transitions API)
  'd-route{display:block;view-transition-name:d-route;contain:layout}',

  // ═══════════════════════════════════════════════════════════════
  // PROSE (vertical rhythm for content-heavy sections)
  // ═══════════════════════════════════════════════════════════════
  '.d-prose{font-size:var(--d-text-base);line-height:var(--d-lh-relaxed);color:var(--d-fg)}',
  '.d-prose>*+*{margin-top:var(--d-sp-4)}',
  '.d-prose>*:first-child{margin-top:0}',
  '.d-prose h1{font-size:var(--d-text-4xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-12);margin-bottom:var(--d-sp-4)}',
  '.d-prose h2{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-10);margin-bottom:var(--d-sp-3)}',
  '.d-prose h3{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-snug);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-8);margin-bottom:var(--d-sp-3)}',
  '.d-prose h4{font-size:var(--d-text-xl);font-weight:var(--d-fw-title);line-height:var(--d-lh-snug);margin-top:var(--d-sp-6);margin-bottom:var(--d-sp-2)}',
  '.d-prose p{margin:0}',
  '.d-prose ul,.d-prose ol{padding-left:var(--d-sp-6);margin:0}',
  '.d-prose li{margin-top:var(--d-sp-1)}',
  '.d-prose li>p{margin:0}',
  '.d-prose blockquote{border-left:3px solid var(--d-primary);padding-left:var(--d-sp-4);margin-left:0;margin-right:0;font-style:italic;color:var(--d-muted-fg)}',
  '.d-prose pre{padding:var(--d-sp-4);overflow-x:auto;font-family:var(--d-font-mono);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);border-radius:var(--d-radius-panel)}',
  '.d-prose code{font-family:var(--d-font-mono);font-size:0.9em;padding:var(--d-sp-1) var(--d-sp-1-5);border-radius:var(--d-radius-sm,4px)}',
  '.d-prose pre code{padding:0;border-radius:0;font-size:inherit}',
  '.d-prose img{max-width:100%;height:auto;border-radius:var(--d-radius-panel)}',
  '.d-prose hr{border:none;height:1px;background:var(--d-border);margin:var(--d-sp-8) 0}',
  '.d-prose a{color:var(--d-primary);text-decoration:underline}',
  '.d-prose a:hover{color:var(--d-primary-hover)}',
  '.d-prose table{width:100%;border-collapse:collapse}',
  '.d-prose th,.d-prose td{padding:var(--d-sp-2) var(--d-sp-3);text-align:left;border-bottom:var(--d-border-width) solid var(--d-border)}',
  '.d-prose th{font-weight:var(--d-fw-title)}',

  // ═══════════════════════════════════════════════════════════════
  // SPACE-Y / SPACE-X (child spacing utilities)
  // ═══════════════════════════════════════════════════════════════
  '.d-spacey-1>*+*{margin-top:0.25rem}','.d-spacey-2>*+*{margin-top:0.5rem}','.d-spacey-3>*+*{margin-top:0.75rem}',
  '.d-spacey-4>*+*{margin-top:1rem}','.d-spacey-5>*+*{margin-top:1.25rem}','.d-spacey-6>*+*{margin-top:1.5rem}',
  '.d-spacey-8>*+*{margin-top:2rem}','.d-spacey-10>*+*{margin-top:2.5rem}','.d-spacey-12>*+*{margin-top:3rem}',
  '.d-spacey-14>*+*{margin-top:3.5rem}','.d-spacey-16>*+*{margin-top:4rem}','.d-spacey-20>*+*{margin-top:5rem}',
  '.d-spacey-24>*+*{margin-top:6rem}',
  '.d-spacex-1>*+*{margin-left:0.25rem}','.d-spacex-2>*+*{margin-left:0.5rem}','.d-spacex-3>*+*{margin-left:0.75rem}',
  '.d-spacex-4>*+*{margin-left:1rem}','.d-spacex-5>*+*{margin-left:1.25rem}','.d-spacex-6>*+*{margin-left:1.5rem}',
  '.d-spacex-8>*+*{margin-left:2rem}','.d-spacex-10>*+*{margin-left:2.5rem}','.d-spacex-12>*+*{margin-left:3rem}',
  '.d-spacex-14>*+*{margin-left:3.5rem}','.d-spacex-16>*+*{margin-left:4rem}','.d-spacex-20>*+*{margin-left:5rem}',
  '.d-spacex-24>*+*{margin-left:6rem}',

  // ═══════════════════════════════════════════════════════════════
  // DIVIDE (border between stacked children)
  // ═══════════════════════════════════════════════════════════════
  '.d-dividey>*+*{border-top:var(--d-border-width) solid var(--d-border)}',
  '.d-dividex>*+*{border-left:var(--d-border-width) solid var(--d-border)}',
  '.d-dividey-strong>*+*{border-top:var(--d-border-width) solid var(--d-border-strong)}',
  '.d-dividex-strong>*+*{border-left:var(--d-border-width) solid var(--d-border-strong)}',

  // ═══════════════════════════════════════════════════════════════
  // BANNER (full-width announcement bar)
  // ═══════════════════════════════════════════════════════════════
  '.d-banner{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-2-5) var(--d-sp-4);width:100%;font-size:var(--d-text-sm);line-height:var(--d-lh-normal)}',
  '.d-banner-sticky-top{position:sticky;top:0;z-index:var(--d-z-sticky)}',
  '.d-banner-sticky-bottom{position:sticky;bottom:0;z-index:var(--d-z-sticky)}',
  '.d-banner-icon{flex-shrink:0;font-size:var(--d-text-md)}',
  '.d-banner-body{flex:1;min-width:0}',
  '.d-banner-action{flex-shrink:0}',
  '.d-banner-dismiss{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-lg);line-height:var(--d-lh-none);opacity:var(--d-icon-muted);flex-shrink:0}',
  '.d-banner-dismiss:hover{opacity:1}',
  '.d-banner-dismiss:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',

  // ═══════════════════════════════════════════════════════════════
  // MASKED INPUT (inherits d-input styling)
  // ═══════════════════════════════════════════════════════════════
  '.d-masked-input{font-family:var(--d-font-mono);letter-spacing:var(--d-ls-caps)}',

  // ═══════════════════════════════════════════════════════════════
  // CODE BLOCK
  // ═══════════════════════════════════════════════════════════════
  '.d-codeblock{position:relative;border-radius:var(--d-radius-panel);overflow:hidden;background:var(--d-surface-1);color:var(--d-surface-1-fg);border:var(--d-border-width) solid var(--d-border)}',
  '.d-codeblock-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-xs);gap:var(--d-sp-2);background:var(--d-surface-2);border-bottom:var(--d-border-width) solid var(--d-border);color:var(--d-surface-2-fg)}',
  '.d-codeblock-lang{opacity:var(--d-icon-muted);text-transform:uppercase;font-weight:var(--d-fw-medium,500);letter-spacing:var(--d-ls-caps)}',
  '.d-codeblock-copy{background:none;border:none;cursor:pointer;font:inherit;font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-2);border-radius:var(--d-radius-inner);opacity:var(--d-icon-muted)}',
  '.d-codeblock-copy:hover{opacity:1;background:var(--d-surface-2)}',
  '.d-codeblock-copy:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset)}',
  '.d-codeblock-pre{margin:0;padding:var(--d-sp-4);overflow-x:auto;font-family:var(--d-font-mono);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);display:flex;gap:var(--d-sp-4)}',
  '.d-codeblock-gutter{display:flex;flex-direction:column;text-align:right;user-select:none;opacity:var(--d-disabled-opacity-soft);flex-shrink:0;min-width:2ch}',
  '.d-codeblock-ln{display:block}',
  '.d-codeblock-code{flex:1;min-width:0;white-space:pre;tab-size:2}',

  // ═══════════════════════════════════════════════════════════════
  // SORTABLE LIST
  // ═══════════════════════════════════════════════════════════════
  '.d-sortable{display:flex;flex-direction:column;gap:0;position:relative}',
  '.d-sortable-h{flex-direction:row}',
  '.d-sortable-item{position:relative;transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease)}',
  '.d-sortable-dragging{opacity:var(--d-disabled-opacity);z-index:1}',
  '.d-sortable-handle{cursor:grab;display:inline-flex;align-items:center;justify-content:center;padding:var(--d-sp-1);font-size:var(--d-text-lg);opacity:var(--d-disabled-opacity-soft);user-select:none;touch-action:none}',
  '.d-sortable-handle:hover{opacity:0.7}',
  '.d-sortable-handle:active{cursor:grabbing}',
  '.d-sortable-indicator{height:2px;background:var(--d-primary);border-radius:1px;flex-shrink:0}',
  '.d-sortable-h .d-sortable-indicator{width:2px;height:auto}',
  '.d-sortable-active .d-sortable-item{transition:none}',

  // ═══════════════════════════════════════════════════════════════
  // DATETIME PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-datetimepicker{position:relative;display:inline-flex;flex-direction:column}',
  '.d-datetimepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;flex-direction:column;min-width:280px}',
  '.d-datetimepicker-date{padding:var(--d-sp-3)}',
  '.d-datetimepicker-time{padding:var(--d-sp-2) var(--d-sp-3);border-top:var(--d-border-width) solid var(--d-border);display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.d-datetimepicker-time-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);color:var(--d-muted)}',
  '.d-datetimepicker-time-row{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-datetimepicker-spinner{width:3rem;text-align:center;font-family:var(--d-font-mono);font-size:var(--d-text-sm);padding:var(--d-sp-1);border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius-inner);background:transparent;color:inherit;outline:none}',
  '.d-datetimepicker-spinner:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
  '.d-datetimepicker-sep{font-size:var(--d-text-sm);color:var(--d-muted);font-weight:var(--d-fw-medium,500)}',
  '.d-datetimepicker-ampm{font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-2);border:var(--d-border-width) solid var(--d-border);border-radius:var(--d-radius-inner);background:transparent;color:inherit;cursor:pointer;font-weight:var(--d-fw-medium,500)}',
  '.d-datetimepicker-ampm:hover{background:var(--d-item-hover-bg)}',
  '.d-datetimepicker-now{font-size:var(--d-text-xs);color:var(--d-primary);background:none;border:none;cursor:pointer;padding:0;font:inherit;text-align:left}',
  '.d-datetimepicker-now:hover{text-decoration:underline}',
  '.d-datetimepicker-footer{display:flex;justify-content:flex-end;padding:var(--d-sp-2) var(--d-sp-3);border-top:var(--d-border-width) solid var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // REDUCED MOTION
  // ═══════════════════════════════════════════════════════════════
  '@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}',

  // Scrollbar defaults (overridable per style)
  '::-webkit-scrollbar{width:var(--d-scrollbar-w);height:var(--d-scrollbar-w)}',
  '::-webkit-scrollbar-track{background:var(--d-scrollbar-track)}',
  '::-webkit-scrollbar-thumb{background:var(--d-scrollbar-thumb);border-radius:var(--d-radius-full)}',
  '::-webkit-scrollbar-thumb:hover{background:var(--d-scrollbar-thumb-hover)}'
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

/**
 * Resolve a prop that may be a static value or signal getter.
 * @param {*|Function} prop
 * @returns {*}
 */
export function resolve(prop) {
  return typeof prop === 'function' ? prop() : prop;
}
