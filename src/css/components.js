/**
 * Shared component visual CSS — colors, backgrounds, borders, shadows.
 * Same rules for all styles; visual differences come from token values.
 * Injected into @layer d.theme alongside style-specific component CSS.
 *
 * @module css/components
 */

export const componentCSSMap = {
  // ═══════════════════════════════════════════════════════════════
  // GLOBAL — suppress default outline on inner inputs where the
  // parent wrapper already shows a :focus-within ring
  // ═══════════════════════════════════════════════════════════════
  global: [
    '.d-input-wrap .d-input:focus-visible,.d-textarea-wrap .d-textarea:focus-visible,.d-combobox-input-wrap .d-combobox-input:focus-visible,.d-inputnumber .d-inputnumber-input:focus-visible,.d-inputnumber .d-inputnumber-step:focus-visible,.d-select .d-select:focus-visible,.d-cascader-trigger .d-cascader-input:focus-visible,.d-command-input-wrap .d-command-input:focus-visible,.d-colorpicker-trigger:focus-visible{outline:none}',
    // Overlay exit animation — applied by createOverlay() during close
    '.d-overlay-exit{animation:d-scaleout var(--d-duration-fast) var(--d-easing-accelerate) both !important}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // BUTTON
  // ═══════════════════════════════════════════════════════════════
  button: [
    '.d-btn{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-btn:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
    '.d-btn:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale));box-shadow:var(--d-active-shadow)}',
    '.d-btn-primary{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
    '.d-btn-primary:hover{background:var(--d-primary-hover);border-color:var(--d-primary-hover)}',
    '.d-btn-primary:active{background:var(--d-primary-active)}',
    '.d-btn-secondary{background:var(--d-accent-subtle);color:var(--d-accent-on-subtle);border-color:var(--d-accent-border)}',
    '.d-btn-secondary:hover{background:var(--d-accent-hover);color:var(--d-accent-fg);border-color:var(--d-accent-hover)}',
    '.d-btn-secondary:active{background:var(--d-accent-active)}',
    '.d-btn-tertiary{background:var(--d-tertiary);color:var(--d-tertiary-fg);border-color:var(--d-tertiary)}',
    '.d-btn-tertiary:hover{background:var(--d-tertiary-hover);border-color:var(--d-tertiary-hover)}',
    '.d-btn-tertiary:active{background:var(--d-tertiary-active)}',
    '.d-btn-destructive{background:var(--d-error);color:var(--d-error-fg);border-color:var(--d-error)}',
    '.d-btn-destructive:hover{background:var(--d-error-hover);border-color:var(--d-error-hover)}',
    '.d-btn-destructive:active{background:var(--d-error-active)}',
    '.d-btn-success{background:var(--d-success);color:var(--d-success-fg);border-color:var(--d-success)}',
    '.d-btn-success:hover{background:var(--d-success-hover);border-color:var(--d-success-hover)}',
    '.d-btn-warning{background:var(--d-warning);color:var(--d-warning-fg);border-color:var(--d-warning)}',
    '.d-btn-warning:hover{background:var(--d-warning-hover);border-color:var(--d-warning-hover)}',
    '.d-btn-outline{background:transparent;border:var(--d-border-width-strong) var(--d-border-style) var(--d-primary);border-width:var(--d-group-border, var(--d-border-width-strong));color:var(--d-primary)}',
    '.d-btn-outline:hover{background:var(--d-primary-subtle);border-color:var(--d-primary-hover);color:var(--d-primary-hover)}',
    '.d-btn-ghost{background:transparent;border-color:transparent}',
    '.d-btn-ghost:hover{background:var(--d-surface-1)}',
    '.d-btn-link{background:transparent;border:none;color:var(--d-primary);text-decoration:underline}',
    '.d-btn-link:hover{color:var(--d-primary-hover)}',
    '.d-btn-group>.d-btn{border-color:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TOGGLE
  // ═══════════════════════════════════════════════════════════════
  toggle: [
    '.d-toggle{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-toggle:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
    '.d-toggle:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale))}',
    '.d-toggle[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle);border-color:var(--d-primary-border)}',
    '.d-toggle[aria-pressed="true"]:hover{background:var(--d-primary-subtle);filter:brightness(0.95)}',
    '.d-toggle-outline{background:transparent;border-color:var(--d-border-strong)}',
    '.d-toggle-outline:hover{background:var(--d-surface-1)}',
    '.d-toggle-outline[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle);border-color:var(--d-primary-border)}',
    // ── Toggle Group (segmented pill container) ──
    '.d-toggle-group{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-toggle-group>.d-toggle{background:transparent;border:none;border-radius:var(--d-radius-inner);color:var(--d-muted)}',
    '.d-toggle-group>.d-toggle:hover{background:var(--d-surface-0);color:var(--d-fg);transform:none;box-shadow:none}',
    '.d-toggle-group>.d-toggle:active{transform:none}',
    '.d-toggle-group>.d-toggle[aria-pressed="true"],.d-toggle-group>.d-toggle[aria-checked="true"]{background:transparent;box-shadow:none;color:var(--d-selection-fg)}',
    '.d-toggle-indicator{background:var(--d-selection-bg);box-shadow:var(--d-selection-shadow)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SPINNER
  // ═══════════════════════════════════════════════════════════════
  spinner: [
    '.d-spinner{color:var(--d-primary)}',
    '.d-spinner-dots>span,.d-spinner-pulse>span,.d-spinner-bars>span,.d-spinner-orbit>span{color:inherit;background:currentColor}',
    '.d-btn-primary .d-spinner,.d-btn-secondary .d-spinner,.d-btn-tertiary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:inherit}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CARD
  // ═══════════════════════════════════════════════════════════════
  card: [
    '.d-card{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1);color:var(--d-fg);backdrop-filter:var(--d-surface-1-filter);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-card-hover:hover{box-shadow:var(--d-elevation-2);transform:translate(var(--d-hover-translate));border-color:var(--d-primary-border)}',
    '.d-card-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-card-inner{background:var(--d-surface-0);box-shadow:none;border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-card-borderless{border-color:transparent}',
    '.d-card-actions{border-top:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted-fg)}',
    '.d-card-actions>*:hover{color:var(--d-primary)}',
    '.d-card-grid-hover>*{transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-card-grid-hover>*:hover{background:var(--d-surface-0);box-shadow:var(--d-elevation-1)}',
    '.d-card-meta-description{color:var(--d-muted-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // INPUT
  // ═══════════════════════════════════════════════════════════════
  input: [
    // .d-input-wrap visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-input{color:var(--d-fg)}',
    '.d-input::placeholder{color:var(--d-muted)}',
    // ── INPUT GROUP / COMPACT GROUP — visual ──
    // Group draws the outer border. Children are borderless. Separators between children.
    '.d-input-group{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-input-group:focus-within{border-color:var(--d-ring);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle)}',
    '.d-input-group-error{border-color:var(--d-error)}',
    '.d-input-group-error:focus-within{border-color:var(--d-error);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-error-subtle)}',
    // Horizontal separators
    '.d-input-group>:not(:first-child){border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-input-group-error>:not(:first-child){border-left-color:var(--d-error)}',
    // Vertical — panel-level radius, container clips children
    '.d-input-group-vertical{border-radius:var(--d-radius-panel)}',
    // Vertical separators (override horizontal)
    '.d-input-group-vertical>:not(:first-child){border-left-width:0;border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-input-group-error.d-input-group-vertical>:not(:first-child){border-top-color:var(--d-error)}',
    // Addon visual
    '.d-input-group-addon{background:var(--d-surface-1);border-radius:var(--d-group-radius, var(--d-radius));color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-input-group:not([data-disabled]) .d-input-group-addon:hover{background:var(--d-surface-0)}',
    '.d-input-group:focus-within .d-input-group-addon{color:var(--d-fg)}',
    '.d-input-group-error .d-input-group-addon{color:var(--d-error)}',
    // Compact group — same outer-border pattern
    '.d-compact-group{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-compact-group:focus-within{border-color:var(--d-ring);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle)}',
    '.d-compact-group>:not(:first-child){border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // INPUT NUMBER
  // ═══════════════════════════════════════════════════════════════
  'input-number': [
    // .d-inputnumber visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-inputnumber-step{color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-inputnumber-step:hover{color:var(--d-fg);background:var(--d-surface-1)}',
    '.d-inputnumber-step:active{background:var(--d-surface-0)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // INPUT OTP
  // ═══════════════════════════════════════════════════════════════
  'input-otp': [
    // .d-otp-slot visual (bg, border) now handled by .d-field in d.base layer
    '.d-otp-separator{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TEXTAREA
  // ═══════════════════════════════════════════════════════════════
  textarea: [
    // .d-textarea-wrap visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-textarea{color:var(--d-fg);resize:vertical}',
    '.d-textarea::placeholder{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // BADGE
  // ═══════════════════════════════════════════════════════════════
  badge: [
    '.d-badge{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full)}',
    '.d-badge-dot{background:var(--d-primary)}',
    '.d-badge-dot.d-badge-processing{animation:d-pulse 2s ease-in-out infinite}',
    '.d-badge-success{background:var(--d-success);color:var(--d-success-fg)}',
    '.d-badge-error{background:var(--d-error);color:var(--d-error-fg)}',
    '.d-badge-warning{background:var(--d-warning);color:var(--d-warning-fg)}',
    '.d-badge-info{background:var(--d-info);color:var(--d-info-fg)}',
    '.d-badge-processing{background:var(--d-primary);color:var(--d-primary-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TAG
  // ═══════════════════════════════════════════════════════════════
  tag: [
    '.d-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg)}',
    '.d-tag-close{color:var(--d-muted)}',
    '.d-tag-close:hover{color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CHIP
  // ═══════════════════════════════════════════════════════════════
  chip: [
    '.d-chip{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-chip-outline{background:transparent}',
    '.d-chip-filled{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
    '.d-chip-selected{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary-on-subtle)}',
    '.d-chip-interactive:hover{background:var(--d-border);transform:translate(var(--d-hover-translate))}',
    '.d-chip-remove{color:var(--d-muted)}',
    '.d-chip-remove:hover{color:var(--d-error)}',
    '.d-chip-success{background:var(--d-success-subtle);color:var(--d-success-on-subtle);border-color:var(--d-success-border)}',
    '.d-chip-error{background:var(--d-error-subtle);color:var(--d-error-on-subtle);border-color:var(--d-error-border)}',
    '.d-chip-warning{background:var(--d-warning-subtle);color:var(--d-warning-on-subtle);border-color:var(--d-warning-border)}',
    '.d-chip-info{background:var(--d-info-subtle);color:var(--d-info-on-subtle);border-color:var(--d-info-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CHECKBOX
  // ═══════════════════════════════════════════════════════════════
  checkbox: [
    '.d-checkbox{color:var(--d-fg)}',
    '.d-checkbox-check{border-radius:var(--d-checkbox-radius,4px);border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-checkbox:has(:checked) .d-checkbox-check,.d-checkbox-inline:has(:checked) .d-checkbox-check{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-checkbox:has(:indeterminate) .d-checkbox-check,.d-checkbox-inline:has(:indeterminate) .d-checkbox-check{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-checkbox[data-error] .d-checkbox-check{border-color:var(--d-error)}',
    '.d-checkbox[data-success] .d-checkbox-check{border-color:var(--d-success)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SWITCH
  // ═══════════════════════════════════════════════════════════════
  switch: [
    '.d-switch-track{background:var(--d-border);border:var(--d-border-width) var(--d-border-style) var(--d-border);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-switch-thumb{background:var(--d-bg);box-shadow:var(--d-elevation-1);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-switch:has(:checked) .d-switch-track{background:var(--d-primary);border-color:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // RADIO GROUP
  // ═══════════════════════════════════════════════════════════════
  'radio-group': [
    '.d-radio-indicator{border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--d-primary)}',
    '.d-radio-dot{background:var(--d-primary)}',
    '.d-radio-label{color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SELECT
  // ═══════════════════════════════════════════════════════════════
  select: [
    // .d-select-wrap/.d-select visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-select-open .d-field{border-color:var(--d-field-border-focus);box-shadow:var(--d-group-shadow,var(--d-field-ring))}',
    '.d-select-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
    '.d-select-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    // Unified listitem state contract — hover/highlight/active for all dropdown types
    '.d-select-option:hover,.d-select-option-highlight,.d-combobox-option:hover,.d-combobox-option-highlight,.d-dropdown-item:hover,.d-dropdown-item-highlight,.d-cascader-option:hover,.d-cascader-option-highlight,.d-menu-item:hover,.d-menu-item-highlight{background:var(--d-surface-1);color:var(--d-fg)}',
    '.d-select-option-active,.d-combobox-option-active{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-select-option-active:hover,.d-combobox-option-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
    // .d-select-error removed — error state now via .d-field[data-error] in d.base
    '.d-select-multi-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // COMBOBOX
  // ═══════════════════════════════════════════════════════════════
  combobox: [
    // .d-combobox-input-wrap visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-combobox-input{color:var(--d-fg)}',
    '.d-combobox-input::placeholder{color:var(--d-muted)}',
    '.d-combobox-arrow{color:var(--d-muted)}',
    '.d-combobox-listbox{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
    '.d-combobox-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    // Combobox hover/highlight/active handled by unified listitem contract above
    '.d-combobox-empty{color:var(--d-muted)}',
    // .d-combobox-error removed — error state now via .d-field[data-error] in d.base
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SLIDER
  // ═══════════════════════════════════════════════════════════════
  slider: [
    '.d-slider-track{background:var(--d-border)}',
    '.d-slider-fill{background:var(--d-primary)}',
    '.d-slider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
    '.d-slider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
    '.d-slider-active .d-slider-thumb{box-shadow:0 0 0 6px var(--d-primary-subtle)}',
    '.d-slider-value{color:var(--d-fg)}',
    '.d-slider-mark{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // RATE
  // ═══════════════════════════════════════════════════════════════
  rate: [
    '.d-rate-star{color:var(--d-muted)}',
    '.d-rate-star-active{color:var(--d-warning)}',
    '.d-rate-star-half{color:var(--d-warning);opacity:0.55}',
    '.d-rate-star:hover:not([disabled]){color:var(--d-warning-hover)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // COLOR PICKER
  // ═══════════════════════════════════════════════════════════════
  'color-picker': [
    // .d-colorpicker-trigger visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-colorpicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // COLOR PALETTE
  // ═══════════════════════════════════════════════════════════════
  'color-palette': [
    '.d-colorpalette-swatch-color{box-shadow:var(--d-elevation-1)}',
    '.d-colorpalette-swatch-color:hover{box-shadow:var(--d-elevation-2)}',
    '.d-colorpalette-contrast{background:rgba(0,0,0,0.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DATE PICKER
  // ═══════════════════════════════════════════════════════════════
  'date-picker': [
    '.d-datepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
    '.d-datepicker-day:hover{background:var(--d-surface-1)}',
    '.d-datepicker-day:active:not(.d-datepicker-day-selected){background:var(--d-surface-2)}',
    '.d-datepicker-day-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-datepicker-day-selected:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
    '.d-datepicker-day-selected:active{background:var(--d-primary-active);color:var(--d-primary-fg)}',
    '.d-datepicker-day-today.d-datepicker-day-selected{box-shadow:inset 0 0 0 1px var(--d-primary-fg)}',
    '.d-datepicker-title:hover{background:var(--d-surface-1)}',
    '.d-datepicker-title:active{background:var(--d-surface-2)}',
    '.d-datepicker-nav-btn{color:var(--d-muted)}',
    '.d-datepicker-nav-btn:hover{color:var(--d-fg);background:var(--d-surface-1)}',
    '.d-datepicker-nav-btn:active{background:var(--d-surface-2)}',
    '.d-datepicker-month:hover,.d-datepicker-year:hover{background:var(--d-surface-1)}',
    '.d-datepicker-month:active,.d-datepicker-year:active{background:var(--d-surface-2)}',
    '.d-datepicker-month.d-datepicker-day-selected,.d-datepicker-year.d-datepicker-day-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-datepicker-month.d-datepicker-day-selected:hover,.d-datepicker-year.d-datepicker-day-selected:hover{background:var(--d-primary-hover)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DATETIME PICKER
  // ═══════════════════════════════════════════════════════════════
  'datetime-picker': [
    '.d-datetimepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TIME PICKER
  // ═══════════════════════════════════════════════════════════════
  'time-picker': [
    '.d-timepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-timepicker-cell:hover{background:var(--d-surface-1)}',
    '.d-timepicker-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════
  upload: [
    '.d-upload-dragger{border-color:var(--d-border);background:var(--d-surface-0);color:var(--d-muted)}',
    '.d-upload-dragger:hover{border-color:var(--d-primary);color:var(--d-primary)}',
    '.d-upload-dragger-active{border-color:var(--d-primary);background:var(--d-primary-subtle)}',
    '.d-upload-item{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TRANSFER
  // ═══════════════════════════════════════════════════════════════
  transfer: [
    '.d-transfer-panel{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-bg)}',
    '.d-transfer-header{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
    '.d-transfer-item:hover{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CASCADER
  // ═══════════════════════════════════════════════════════════════
  cascader: [
    // .d-cascader-trigger visual (bg, border, focus) now handled by .d-field in d.base layer
    '.d-cascader-input::placeholder{color:var(--d-muted)}',
    '.d-cascader-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-cascader-column:not(:last-child){border-right:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-cascader-option:hover{background:var(--d-surface-1)}',
    '.d-cascader-option-active{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle)}',
    '.d-cascader-option-active:hover{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // MENTIONS
  // ═══════════════════════════════════════════════════════════════
  mentions: [
    '.d-mentions-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-mentions-option:hover{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // LABEL
  // ═══════════════════════════════════════════════════════════════
  label: [
    '.d-label{color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // MODAL
  // ═══════════════════════════════════════════════════════════════
  modal: [
    '.d-modal-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',
    '.d-modal-close,.d-drawer-close,.d-notification-close,.d-tour-close{color:var(--d-muted);border-radius:var(--d-radius-inner);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-modal-close:hover,.d-drawer-close:hover,.d-notification-close:hover,.d-tour-close:hover{color:var(--d-fg);background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // ALERT DIALOG
  // ═══════════════════════════════════════════════════════════════
  'alert-dialog': [
    '.d-alertdialog-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DRAWER
  // ═══════════════════════════════════════════════════════════════
  drawer: [
    '.d-drawer-panel{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
    '.d-drawer-left{animation:d-slidein-l var(--d-duration-normal) var(--d-easing-decelerate)}',
    '.d-drawer-right{animation:d-slidein-r var(--d-duration-normal) var(--d-easing-decelerate)}',
    '.d-drawer-top{animation:d-slidein-t var(--d-duration-normal) var(--d-easing-decelerate)}',
    '.d-drawer-bottom{animation:d-slidein-b var(--d-duration-normal) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TOOLTIP
  // ═══════════════════════════════════════════════════════════════
  tooltip: [
    '.d-tooltip{background:var(--d-fg);color:var(--d-bg);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);animation:d-fadein var(--d-duration-fast) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // POPOVER
  // ═══════════════════════════════════════════════════════════════
  popover: [
    '.d-popover-content{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // HOVER CARD
  // ═══════════════════════════════════════════════════════════════
  'hover-card': [
    '.d-hovercard-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DROPDOWN
  // ═══════════════════════════════════════════════════════════════
  dropdown: [
    '.d-dropdown-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
    '.d-dropdown-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    // Dropdown item hover/highlight handled by unified listitem contract in SELECT section
    '.d-dropdown-separator{background:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ═══════════════════════════════════════════════════════════════
  'context-menu': [
    '.d-contextmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // COMMAND PALETTE
  // ═══════════════════════════════════════════════════════════════
  'command-palette': [
    '.d-command-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
    '.d-command-input-wrap,.d-command-search{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-command-search:focus-within{border-bottom-color:var(--d-primary)}',
    '.d-command-search-icon{color:var(--d-muted);flex-shrink:0}',
    '.d-command-item:hover,.d-command-item-highlight{background:var(--d-item-hover-bg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // POPCONFIRM
  // ═══════════════════════════════════════════════════════════════
  popconfirm: [
    '.d-popconfirm{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════
  tabs: [
    '.d-tabs-list{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);position:relative}',
    '.d-tab{color:var(--d-muted);border-bottom:var(--d-border-width-strong) solid transparent;transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-tab:hover:not([disabled]){color:var(--d-fg)}',
    '.d-tab-active{color:var(--d-primary);border-bottom-color:transparent}',
    '.d-tabs-indicator{position:absolute;bottom:0;left:0;background:var(--d-primary);border-radius:var(--d-radius-full);transition:transform var(--d-duration-fast) var(--d-easing-standard),width var(--d-duration-fast) var(--d-easing-standard),height var(--d-duration-fast) var(--d-easing-standard);pointer-events:none;z-index:1}',
    '.d-tab[disabled]{color:var(--d-muted)}',
    '.d-tabs-vertical .d-tabs-list{border-bottom:none;border-right:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-tabs-vertical .d-tab{border-bottom:none;border-left:var(--d-border-width-strong) solid transparent}',
    '.d-tabs-vertical .d-tab-active{border-left-color:transparent;border-bottom-color:transparent}',
    '.d-tabs-vertical .d-tabs-indicator{bottom:auto;left:0;top:0}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // ACCORDION / COLLAPSIBLE
  // ═══════════════════════════════════════════════════════════════
  accordion: [
    '.d-accordion-trigger{color:var(--d-fg)}',
    '.d-accordion-content{color:var(--d-muted-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SEPARATOR
  // ═══════════════════════════════════════════════════════════════
  separator: [
    '.d-separator{background:var(--d-border)}',
    '.d-separator-line{background:var(--d-border)}',
    '.d-separator-vertical{background:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // BREADCRUMB
  // ═══════════════════════════════════════════════════════════════
  breadcrumb: [
    '.d-breadcrumb-link{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-breadcrumb-link:hover{color:var(--d-primary)}',
    '.d-breadcrumb-separator{color:var(--d-muted)}',
    '.d-breadcrumb-current{color:var(--d-fg)}',
    '.d-breadcrumb-ellipsis{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard),background var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-breadcrumb-ellipsis:hover{color:var(--d-fg);background:var(--d-surface-1)}',
    '.d-breadcrumb-menu{background:var(--d-bg);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════
  pagination: [
    '.d-pagination-btn{border-radius:var(--d-radius-inner);color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-pagination-btn:hover{background:var(--d-surface-1);color:var(--d-fg)}',
    '.d-pagination-active{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-pagination-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
    '.d-pagination-ellipsis{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TABLE
  // ═══════════════════════════════════════════════════════════════
  table: [
    '.d-table{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);overflow:hidden}',
    '.d-th{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1);color:var(--d-fg)}',
    '.d-td{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
    '.d-table-striped tbody .d-tr:nth-child(even){background:var(--d-surface-1)}',
    '.d-table-hover .d-tr:hover{background:var(--d-primary-subtle)}',
    '.d-table-row-selected{background:var(--d-primary-subtle)}',
    '.d-table-sticky{background:var(--d-surface-1)}',
    '.d-table-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // LIST
  // ═══════════════════════════════════════════════════════════════
  list: [
    '.d-list{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-bg)}',
    '.d-list-item{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-list-item:last-child{border-bottom:none}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TREE
  // ═══════════════════════════════════════════════════════════════
  tree: [
    '.d-tree-node-content:hover{background:var(--d-item-hover-bg)}',
    '.d-tree-node-selected .d-tree-node-label{color:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // AVATAR
  // ═══════════════════════════════════════════════════════════════
  avatar: [
    '.d-avatar{border-radius:50%;background:var(--d-primary);border:2px solid var(--d-border)}',
    '.d-avatar-fallback{color:var(--d-primary-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // PROGRESS
  // ═══════════════════════════════════════════════════════════════
  progress: [
    '.d-progress{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-full);overflow:hidden}',
    '.d-progress-bar{background:var(--d-primary);border-radius:var(--d-radius-full)}',
    '.d-progress-success .d-progress-bar{background:var(--d-success)}',
    '.d-progress-warning .d-progress-bar{background:var(--d-warning)}',
    '.d-progress-error .d-progress-bar{background:var(--d-error)}',
    '.d-progress-label{color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SKELETON
  // ═══════════════════════════════════════════════════════════════
  skeleton: [
    '.d-skeleton{background:var(--d-surface-1);background-image:linear-gradient(90deg,var(--d-surface-1),var(--d-border),var(--d-surface-1));background-size:200% 100%}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // ALERT
  // ═══════════════════════════════════════════════════════════════
  alert: [
    '.d-alert{border-radius:var(--d-radius-panel);border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);color:var(--d-fg)}',
    '.d-alert-info{background:var(--d-info-subtle);border-color:var(--d-info-border)}',
    '.d-alert-success{background:var(--d-success-subtle);border-color:var(--d-success-border)}',
    '.d-alert-warning{background:var(--d-warning-subtle);border-color:var(--d-warning-border)}',
    '.d-alert-error{background:var(--d-error-subtle);border-color:var(--d-error-border)}',
    '.d-alert-dismiss{color:var(--d-muted);border-radius:var(--d-radius-inner)}',
    '.d-alert-dismiss:hover{color:var(--d-fg);background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TOAST / NOTIFICATION / MESSAGE
  // ═══════════════════════════════════════════════════════════════
  toast: [
    '.d-toast{border-radius:var(--d-radius-panel);background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
    '.d-toast-info{border-left:var(--d-border-width-strong) solid var(--d-info)}',
    '.d-toast-success{border-left:var(--d-border-width-strong) solid var(--d-success)}',
    '.d-toast-warning{border-left:var(--d-border-width-strong) solid var(--d-warning)}',
    '.d-toast-error{border-left:var(--d-border-width-strong) solid var(--d-error)}',
    '.d-toast-close{color:var(--d-muted)}',
    '.d-toast-close:hover{color:var(--d-fg)}',
    // Notification
    '.d-notification{border-radius:var(--d-radius-panel);background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
    '.d-notification-info{border-left:var(--d-border-width-strong) solid var(--d-info)}',
    '.d-notification-success{border-left:var(--d-border-width-strong) solid var(--d-success)}',
    '.d-notification-warning{border-left:var(--d-border-width-strong) solid var(--d-warning)}',
    '.d-notification-error{border-left:var(--d-border-width-strong) solid var(--d-error)}',
    '.d-message{border-radius:var(--d-radius-panel);background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // RESULT
  // ═══════════════════════════════════════════════════════════════
  result: [
    '.d-result{color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DESCRIPTIONS
  // ═══════════════════════════════════════════════════════════════
  descriptions: [
    '.d-descriptions-table{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-descriptions-label{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
    '.d-descriptions-content{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SEGMENTED CONTROL
  // ═══════════════════════════════════════════════════════════════
  'segmented-control': [
    '.d-segmented{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-segmented-item{color:var(--d-muted)}',
    '.d-segmented-item:hover{color:var(--d-fg)}',
    '.d-segmented-item[aria-checked="true"]{background:var(--d-selection-bg);color:var(--d-selection-fg);box-shadow:var(--d-selection-shadow)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // STEPS
  // ═══════════════════════════════════════════════════════════════
  steps: [
    '.d-step-icon{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted)}',
    '.d-step-finish .d-step-icon{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary-on-subtle)}',
    '.d-step-process .d-step-icon{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-step-error .d-step-icon{background:var(--d-error-subtle);border-color:var(--d-error);color:var(--d-error-on-subtle)}',
    '.d-step-connector{background:var(--d-border)}',
    '.d-step-connector-done{background:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // MENU / MENUBAR / NAVIGATION MENU
  // ═══════════════════════════════════════════════════════════════
  menu: [
    '.d-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-1)}',
    '.d-menu-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-menu-item-active{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle)}',
    '.d-menu-separator{background:var(--d-border)}',
    '.d-menu-sub{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-menubar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-menubar-item{color:var(--d-fg)}',
    '.d-menubar-item:hover,.d-menubar-item-active{background:var(--d-surface-1)}',
    '.d-navmenu-item{color:var(--d-fg)}',
    '.d-navmenu-item:hover{color:var(--d-primary)}',
    '.d-navmenu-item-active{color:var(--d-primary)}',
    '.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-navmenu-link-highlight{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════════════════════════
  calendar: [
    '.d-calendar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-calendar-cell:hover{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // CAROUSEL
  // ═══════════════════════════════════════════════════════════════
  carousel: [
    '.d-carousel-nav{color:var(--d-fg);background:var(--d-bg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-1)}',
    '.d-carousel-dot{background:var(--d-border)}',
    '.d-carousel-dot-active{background:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // EMPTY
  // ═══════════════════════════════════════════════════════════════
  empty: [
    '.d-empty{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // PLACEHOLDER
  // ═══════════════════════════════════════════════════════════════
  placeholder: [
    '.d-placeholder{background:linear-gradient(135deg,var(--d-surface-0),var(--d-surface-1));border-radius:var(--d-radius-panel);color:var(--d-muted)}',
    '.d-placeholder-avatar{border-radius:50%;border:2px solid var(--d-border);background:linear-gradient(135deg,var(--d-primary-subtle),var(--d-surface-1))}',
    '.d-placeholder-label{color:var(--d-muted-fg)}',
    '.d-placeholder-animate{background:linear-gradient(90deg,var(--d-surface-0) 25%,var(--d-surface-1) 50%,var(--d-surface-0) 75%);background-size:200% 100%}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // IMAGE
  // ═══════════════════════════════════════════════════════════════
  image: [
    '.d-image{border-radius:var(--d-radius-panel)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TIMELINE
  // ═══════════════════════════════════════════════════════════════
  timeline: [
    '.d-timeline-dot{background:var(--d-primary)}',
    '.d-timeline-line{background:var(--d-border)}',
    '.d-timeline-tag{background:var(--d-surface-1);color:var(--d-muted-fg)}',
    '.d-timeline-dot-active{color:var(--d-primary)}',
    '.d-timeline-dot-pending{background:var(--d-primary)}',
    '.d-timeline-skeleton .d-timeline-skel-bar{background:linear-gradient(90deg,var(--d-surface-0) 25%,var(--d-surface-1) 50%,var(--d-surface-0) 75%);background-size:200% 100%}',
    '.d-timeline-item-clickable:hover .d-timeline-content{color:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // COMMENT
  // ═══════════════════════════════════════════════════════════════
  comment: [
    '.d-comment-author{color:var(--d-fg)}',
    '.d-comment-time{color:var(--d-muted)}',
    '.d-comment-content{color:var(--d-fg)}',
    '.d-comment-action{color:var(--d-muted)}',
    '.d-comment-action:hover{color:var(--d-primary)}',
    '.d-comment-action-active{color:var(--d-primary)}',
    '.d-comment-bordered{background:var(--d-surface-1)}',
    '.d-comment-nested{border-color:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // QRCODE
  // ═══════════════════════════════════════════════════════════════
  qrcode: [
    '.d-qrcode-bordered{background:var(--d-surface-1);border-color:var(--d-border);box-shadow:var(--d-elevation-1)}',
    '.d-qrcode-status{background:var(--d-overlay)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // KBD
  // ═══════════════════════════════════════════════════════════════
  kbd: [
    '.d-kbd{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);box-shadow:0 1px 0 var(--d-border);color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  typography: [
    '.d-text{color:var(--d-fg)}',
    '.d-text-mark{background:var(--d-warning-subtle)}',
    '.d-text-code{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-link{color:var(--d-primary)}',
    '.d-link:hover{color:var(--d-primary-hover)}',
    '.d-blockquote{border-left:3px solid var(--d-border);color:var(--d-muted-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // RESIZABLE
  // ═══════════════════════════════════════════════════════════════
  resizable: [
    '.d-resizable{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-resizable-handle{background:var(--d-surface-0)}',
    '.d-resizable-handle-bar{background:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SCROLL AREA
  // ═══════════════════════════════════════════════════════════════
  'scroll-area': [
    '.d-scrollarea-viewport::-webkit-scrollbar-thumb{background:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TOUR
  // ═══════════════════════════════════════════════════════════════
  tour: [
    '.d-tour-popover{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // FLOAT BUTTON
  // ═══════════════════════════════════════════════════════════════
  'float-button': [
    '.d-float-btn{background:var(--d-primary);color:var(--d-primary-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-float-btn:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SHARED OPTION
  // ═══════════════════════════════════════════════════════════════
  'shared-option': [
    '.d-option{color:var(--d-fg)}',
    '.d-option:hover{background:var(--d-surface-1)}',
    '.d-option-active{background:var(--d-surface-1)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DATE RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  'date-range-picker': [
    '.d-daterange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-datepicker-day-in-range{background:var(--d-primary-subtle)}',
    '.d-datepicker-day-range-start,.d-datepicker-day-range-end{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-daterange-presets button{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-daterange-presets button:hover{color:var(--d-primary)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TIME RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  'time-range-picker': [
    '.d-timerange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-timerange-cell:hover{background:var(--d-surface-1)}',
    '.d-timerange-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
    '.d-timerange-error{color:var(--d-error)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // RANGE SLIDER
  // ═══════════════════════════════════════════════════════════════
  'range-slider': [
    '.d-rangeslider-track{background:var(--d-border)}',
    '.d-rangeslider-fill{background:var(--d-primary)}',
    '.d-rangeslider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
    '.d-rangeslider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
    '.d-rangeslider-thumb:focus-visible{box-shadow:0 0 0 4px var(--d-primary-subtle);outline:none}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // TREE SELECT
  // ═══════════════════════════════════════════════════════════════
  'tree-select': [
    '.d-treeselect-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-treeselect-search{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // AVATAR GROUP
  // ═══════════════════════════════════════════════════════════════
  'avatar-group': [
    '.d-avatar-group-overflow{background:var(--d-surface-1);border:2px solid var(--d-border);color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION MENU
  // ═══════════════════════════════════════════════════════════════
  'navigation-menu': [
    '.d-navmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-navmenu-trigger{color:var(--d-fg);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-navmenu-trigger:hover,.d-navmenu-trigger-active{color:var(--d-primary)}',
    '.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-navmenu-link{color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-navmenu-link:hover{background:var(--d-surface-1);color:var(--d-primary)}',
    '.d-navmenu-link-desc{color:var(--d-muted)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SPLITTER
  // ═══════════════════════════════════════════════════════════════
  splitter: [
    '.d-splitter{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
    '.d-splitter-handle{background:var(--d-surface-0);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-splitter-handle:hover{background:var(--d-surface-1)}',
    '.d-splitter-handle-bar{background:var(--d-border)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // BACK TOP
  // ═══════════════════════════════════════════════════════════════
  'back-top': [
    '.d-backtop{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-2);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-backtop:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DATA TABLE
  // ═══════════════════════════════════════════════════════════════
  'data-table': [
    '.d-datatable{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);overflow:hidden}',
    '.d-datatable-th{background:var(--d-surface-1);border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
    '.d-datatable-th-sortable{cursor:pointer;user-select:none;transition:background var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-datatable-th-sortable:hover{background:var(--d-surface-0)}',
    '.d-datatable-td{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
    '.d-datatable-td-editing{background:var(--d-primary-subtle)}',
    '.d-datatable-row-selected{background:var(--d-primary-subtle)}',
    '.d-datatable-pagination{border-top:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted)}',
    '.d-datatable-pagination button{color:var(--d-muted);border-radius:var(--d-radius-inner);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
    '.d-datatable-pagination button:hover:not([disabled]){background:var(--d-surface-1);color:var(--d-fg)}',
    '.d-datatable-empty{color:var(--d-muted)}',
    '.d-datatable-filter-popup{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
    '.d-datatable-resize-handle{background:transparent;transition:background var(--d-duration-fast)}',
    '.d-datatable-resize-handle:hover{background:var(--d-primary)}',
    '.d-datatable-export-btn{color:var(--d-muted);transition:color var(--d-duration-fast)}',
    '.d-datatable-export-btn:hover{color:var(--d-fg)}',
    '.d-datatable-pinned-left{background:var(--d-bg)}',
    '.d-datatable-pinned-right{background:var(--d-bg)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // SHELL
  // ═══════════════════════════════════════════════════════════════
  shell: [
    '.d-shell{background:var(--d-bg);color:var(--d-fg)}',
    '.d-shell-header{background:var(--d-surface-0);border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-shell-nav{background:var(--d-surface-0);border-right:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-shell-nav-right{border-right:none;border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-shell-body{background:var(--d-bg)}',
    '.d-shell-footer{background:var(--d-surface-0);border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-shell-aside{background:var(--d-surface-0);border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '.d-shell-nav-item:hover{background:var(--d-item-hover-bg);color:var(--d-fg)}',
    '.d-shell-nav-item:focus-visible{outline:var(--d-focus-ring-width) var(--d-focus-ring-style,solid) var(--d-focus-ring-color,var(--d-ring));outline-offset:var(--d-focus-ring-offset-inset)}',
    '.d-shell-nav-item-active{background:var(--d-primary-subtle);color:var(--d-primary-on-subtle)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // PROSE — rich text content typography
  // ═══════════════════════════════════════════════════════════════
  prose: [
    '.d-prose h1{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);margin-bottom:var(--d-sp-4)}',
    '.d-prose h2{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);margin-top:var(--d-sp-8);margin-bottom:var(--d-sp-3)}',
    '.d-prose h3{font-size:var(--d-text-xl);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25);margin-top:var(--d-sp-6);margin-bottom:var(--d-sp-2)}',
    '.d-prose h4{font-size:var(--d-text-lg);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25);margin-top:var(--d-sp-4);margin-bottom:var(--d-sp-2)}',
    '.d-prose p{margin-bottom:var(--d-sp-4);line-height:var(--d-lh-relaxed,1.6)}',
    '.d-prose blockquote{border-left:3px solid var(--d-primary);padding-left:var(--d-sp-4);margin:var(--d-sp-4) 0;color:var(--d-muted-fg);font-style:italic}',
    '.d-prose code{background:var(--d-surface-1);padding:0.15em 0.3em;border-radius:var(--d-radius-sm);font-family:var(--d-font-mono);font-size:0.9em}',
    '.d-prose pre{background:var(--d-surface-1);padding:var(--d-sp-4);border-radius:var(--d-radius);overflow-x:auto;margin:var(--d-sp-4) 0}',
    '.d-prose pre code{background:none;padding:0;border-radius:0;font-size:0.85em;line-height:1.6}',
    '.d-prose ul,.d-prose ol{padding-left:var(--d-sp-6);margin-bottom:var(--d-sp-4)}',
    '.d-prose li{margin-bottom:var(--d-sp-1);line-height:var(--d-lh-relaxed,1.6)}',
    '.d-prose hr{border:none;border-top:1px solid var(--d-border);margin:var(--d-sp-8) 0}',
    '.d-prose a{color:var(--d-primary);text-decoration:underline}',
    '.d-prose a:hover{color:var(--d-primary-hover)}',
    '.d-prose img{max-width:100%;border-radius:var(--d-radius)}',
    '.d-prose table{width:100%;border-collapse:collapse;margin:var(--d-sp-4) 0}',
    '.d-prose th,.d-prose td{padding:var(--d-sp-2) var(--d-sp-3);border-bottom:1px solid var(--d-border);text-align:left}',
    '.d-prose th{font-weight:var(--d-fw-title,600);background:var(--d-surface-0)}',
  ].join(''),

  // ═══════════════════════════════════════════════════════════════
  // DIVIDE — child separator borders
  // ═══════════════════════════════════════════════════════════════
  divide: [
    '.d-divide-y>:not(:first-child){border-top:1px solid var(--d-border)}',
    '.d-divide-x>:not(:first-child){border-left:1px solid var(--d-border)}',
  ].join(''),
};

export const componentCSS = Object.values(componentCSSMap).join('');
