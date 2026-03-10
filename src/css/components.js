/**
 * Shared component visual CSS — colors, backgrounds, borders, shadows.
 * Same rules for all styles; visual differences come from token values.
 * Injected into @layer d.theme alongside style-specific component CSS.
 *
 * @module css/components
 */

export const componentCSS = [
  // ═══════════════════════════════════════════════════════════════
  // GLOBAL — suppress default outline on inner inputs where the
  // parent wrapper already shows a :focus-within ring
  // ═══════════════════════════════════════════════════════════════
  '.d-input-wrap .d-input:focus-visible,.d-textarea-wrap .d-textarea:focus-visible,.d-combobox-input-wrap .d-combobox-input:focus-visible,.d-inputnumber .d-inputnumber-input:focus-visible,.d-select .d-select:focus-visible,.d-cascader-trigger .d-cascader-input:focus-visible,.d-command-input-wrap .d-command-input:focus-visible,.d-colorpicker-trigger:focus-visible{outline:none}',

  // ═══════════════════════════════════════════════════════════════
  // BUTTON
  // ═══════════════════════════════════════════════════════════════
  '.d-btn{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-btn:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
  '.d-btn:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale));box-shadow:var(--d-active-shadow)}',
  '.d-btn-primary{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
  '.d-btn-primary:hover{background:var(--d-primary-hover);border-color:var(--d-primary-hover)}',
  '.d-btn-primary:active{background:var(--d-primary-active)}',
  '.d-btn-secondary{background:var(--d-accent-subtle);color:var(--d-accent);border-color:var(--d-accent-border)}',
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

  // ═══════════════════════════════════════════════════════════════
  // TOGGLE
  // ═══════════════════════════════════════════════════════════════
  '.d-toggle{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-toggle:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
  '.d-toggle:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale))}',
  '.d-toggle[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary);border-color:var(--d-primary-border)}',
  '.d-toggle[aria-pressed="true"]:hover{background:var(--d-primary-subtle);filter:brightness(0.95)}',
  '.d-toggle-outline{background:transparent;border-color:var(--d-border-strong)}',
  '.d-toggle-outline:hover{background:var(--d-surface-1)}',
  '.d-toggle-outline[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary);border-color:var(--d-primary-border)}',
  // ── Toggle Group (segmented pill container) ──
  '.d-toggle-group{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
  '.d-toggle-group>.d-toggle{background:transparent;border:none;border-radius:var(--d-radius-inner);color:var(--d-muted)}',
  '.d-toggle-group>.d-toggle:hover{background:var(--d-surface-0);color:var(--d-fg);transform:none;box-shadow:none}',
  '.d-toggle-group>.d-toggle:active{transform:none}',
  '.d-toggle-group>.d-toggle[aria-pressed="true"]{background:transparent;box-shadow:none;color:var(--d-fg)}',
  '.d-toggle-indicator{background:var(--d-bg);box-shadow:var(--d-elevation-1)}',

  // ═══════════════════════════════════════════════════════════════
  // SPINNER
  // ═══════════════════════════════════════════════════════════════
  '.d-spinner{color:var(--d-primary)}',
  '.d-spinner-dots>span,.d-spinner-pulse>span,.d-spinner-bars>span,.d-spinner-orbit>span{color:inherit;background:currentColor}',
  '.d-btn-primary .d-spinner,.d-btn-secondary .d-spinner,.d-btn-tertiary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:inherit}',

  // ═══════════════════════════════════════════════════════════════
  // CARD
  // ═══════════════════════════════════════════════════════════════
  '.d-card{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1);color:var(--d-fg);backdrop-filter:var(--d-surface-1-filter);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-card-hover:hover{box-shadow:var(--d-elevation-2);transform:translate(var(--d-hover-translate))}',
  '.d-card-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // INPUT
  // ═══════════════════════════════════════════════════════════════
  '.d-input-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-input-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-input{color:var(--d-fg)}',
  '.d-input::placeholder{color:var(--d-muted)}',
  '.d-input-error{border-color:var(--d-error)}',
  '.d-input-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',

  // ── INPUT GROUP / COMPACT GROUP — visual ──
  // Group draws the outer border. Children are borderless. Separators between children.
  '.d-input-group{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-input-group:focus-within{border-color:var(--d-ring);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle)}',
  '.d-input-group-error{border-color:var(--d-error)}',
  '.d-input-group-error:focus-within{border-color:var(--d-error);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-error-subtle)}',
  // Horizontal separators
  '.d-input-group>:not(:first-child){border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-input-group-error>:not(:first-child){border-left-color:var(--d-error)}',
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

  // ═══════════════════════════════════════════════════════════════
  // INPUT NUMBER
  // ═══════════════════════════════════════════════════════════════
  '.d-inputnumber{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-inputnumber:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-inputnumber-step{color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-inputnumber-step:hover{color:var(--d-fg);background:var(--d-surface-1)}',
  '.d-inputnumber-step:active{background:var(--d-surface-0)}',

  // ═══════════════════════════════════════════════════════════════
  // INPUT OTP
  // ═══════════════════════════════════════════════════════════════
  '.d-otp-slot{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg)}',
  '.d-otp-slot:focus-visible{border-color:var(--d-ring)}',
  '.d-otp-separator{color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // TEXTAREA
  // ═══════════════════════════════════════════════════════════════
  '.d-textarea-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius-panel));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-textarea-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-textarea{color:var(--d-fg);resize:vertical}',
  '.d-textarea::placeholder{color:var(--d-muted)}',
  '.d-textarea-error{border-color:var(--d-error)}',
  '.d-textarea-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',

  // ═══════════════════════════════════════════════════════════════
  // BADGE
  // ═══════════════════════════════════════════════════════════════
  '.d-badge{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full)}',
  '.d-badge-dot{background:var(--d-primary)}',
  '.d-badge-dot.d-badge-processing{animation:d-pulse 2s ease-in-out infinite}',

  // ═══════════════════════════════════════════════════════════════
  // TAG
  // ═══════════════════════════════════════════════════════════════
  '.d-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg)}',
  '.d-tag-close{color:var(--d-muted)}',
  '.d-tag-close:hover{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // CHIP
  // ═══════════════════════════════════════════════════════════════
  '.d-chip{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-chip-outline{background:transparent}',
  '.d-chip-filled{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
  '.d-chip-selected{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary)}',
  '.d-chip-interactive:hover{background:var(--d-border);transform:translate(var(--d-hover-translate))}',
  '.d-chip-remove{color:var(--d-muted)}',
  '.d-chip-remove:hover{color:var(--d-error)}',

  // ═══════════════════════════════════════════════════════════════
  // CHECKBOX
  // ═══════════════════════════════════════════════════════════════
  '.d-checkbox{color:var(--d-fg)}',
  '.d-checkbox-check{border-radius:var(--d-checkbox-radius,4px);border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-checkbox:has(:checked) .d-checkbox-check,.d-checkbox-inline:has(:checked) .d-checkbox-check{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-checkbox:has(:indeterminate) .d-checkbox-check,.d-checkbox-inline:has(:indeterminate) .d-checkbox-check{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // SWITCH
  // ═══════════════════════════════════════════════════════════════
  '.d-switch-track{background:var(--d-border);border:var(--d-border-width) var(--d-border-style) var(--d-border);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-switch-thumb{background:var(--d-bg);box-shadow:var(--d-elevation-1);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-switch:has(:checked) .d-switch-track{background:var(--d-primary);border-color:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // RADIO GROUP
  // ═══════════════════════════════════════════════════════════════
  '.d-radio-indicator{border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--d-primary)}',
  '.d-radio-dot{background:var(--d-primary)}',
  '.d-radio-label{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // SELECT
  // ═══════════════════════════════════════════════════════════════
  '.d-select-wrap{transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-select{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-select:focus-visible{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle));outline:none}',
  '.d-select-open .d-select{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-select-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-select-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  // Unified listitem state contract — hover/highlight/active for all dropdown types
  '.d-select-option:hover,.d-select-option-highlight,.d-combobox-option:hover,.d-combobox-option-highlight,.d-dropdown-item:hover,.d-dropdown-item-highlight,.d-cascader-option:hover,.d-cascader-option-highlight{background:var(--d-surface-1);color:var(--d-fg)}',
  '.d-select-option-active,.d-combobox-option-active{background:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-select-option-active:hover,.d-combobox-option-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
  '.d-select-error{border-color:var(--d-error)}',
  '.d-select-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',
  '.d-select-multi-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // COMBOBOX
  // ═══════════════════════════════════════════════════════════════
  '.d-combobox-input-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-combobox-input-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-combobox-input{color:var(--d-fg)}',
  '.d-combobox-input::placeholder{color:var(--d-muted)}',
  '.d-combobox-arrow{color:var(--d-muted)}',
  '.d-combobox-listbox{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-combobox-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  // Combobox hover/highlight/active handled by unified listitem contract above
  '.d-combobox-empty{color:var(--d-muted)}',
  '.d-combobox-error .d-combobox-input-wrap{border-color:var(--d-error)}',

  // ═══════════════════════════════════════════════════════════════
  // SLIDER
  // ═══════════════════════════════════════════════════════════════
  '.d-slider-track{background:var(--d-border)}',
  '.d-slider-fill{background:var(--d-primary)}',
  '.d-slider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
  '.d-slider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
  '.d-slider-active .d-slider-thumb{box-shadow:0 0 0 6px var(--d-primary-subtle)}',
  '.d-slider-value{color:var(--d-fg)}',
  '.d-slider-mark{color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // RATE
  // ═══════════════════════════════════════════════════════════════
  '.d-rate-star{color:var(--d-muted)}',
  '.d-rate-star-active{color:var(--d-warning)}',
  '.d-rate-star-half{color:var(--d-warning);opacity:0.55}',
  '.d-rate-star:hover:not([disabled]){color:var(--d-warning-hover)}',

  // ═══════════════════════════════════════════════════════════════
  // COLOR PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-colorpicker-trigger{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-colorpicker-trigger:focus-within,.d-colorpicker-trigger:focus-visible{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-colorpicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',

  // ═══════════════════════════════════════════════════════════════
  // DATE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-datepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
  '.d-datepicker-day:hover{background:var(--d-surface-1)}',
  '.d-datepicker-day-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-datepicker-nav-btn{color:var(--d-muted)}',
  '.d-datepicker-nav-btn:hover{color:var(--d-fg);background:var(--d-surface-1)}',
  '.d-datepicker-month:hover,.d-datepicker-year:hover{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // DATETIME PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-datetimepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // TIME PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-timepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-timepicker-cell:hover{background:var(--d-surface-1)}',
  '.d-timepicker-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════
  '.d-upload-dragger{border-color:var(--d-border);background:var(--d-surface-0);color:var(--d-muted)}',
  '.d-upload-dragger:hover{border-color:var(--d-primary);color:var(--d-primary)}',
  '.d-upload-dragger-active{border-color:var(--d-primary);background:var(--d-primary-subtle)}',
  '.d-upload-item{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // TRANSFER
  // ═══════════════════════════════════════════════════════════════
  '.d-transfer-panel{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-bg)}',
  '.d-transfer-header{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
  '.d-transfer-item:hover{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // CASCADER
  // ═══════════════════════════════════════════════════════════════
  '.d-cascader-trigger{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-cascader-trigger:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
  '.d-cascader-input::placeholder{color:var(--d-muted)}',
  '.d-cascader-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-cascader-column{border-right:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-cascader-option:hover{background:var(--d-surface-1)}',
  '.d-cascader-option-active{background:var(--d-primary-subtle);color:var(--d-primary)}',
  '.d-cascader-option-active:hover{background:var(--d-primary-subtle);color:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // MENTIONS
  // ═══════════════════════════════════════════════════════════════
  '.d-mentions-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-mentions-option:hover{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // LABEL
  // ═══════════════════════════════════════════════════════════════
  '.d-label{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // MODAL
  // ═══════════════════════════════════════════════════════════════
  '.d-modal-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-modal-close,.d-drawer-close,.d-sheet-close,.d-notification-close,.d-tour-close{color:var(--d-muted);border-radius:var(--d-radius-inner);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-modal-close:hover,.d-drawer-close:hover,.d-sheet-close:hover,.d-notification-close:hover,.d-tour-close:hover{color:var(--d-fg);background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // ALERT DIALOG
  // ═══════════════════════════════════════════════════════════════
  '.d-alertdialog-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',

  // ═══════════════════════════════════════════════════════════════
  // DRAWER
  // ═══════════════════════════════════════════════════════════════
  '.d-drawer-panel{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
  '.d-drawer-left{animation:d-slidein-l var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-drawer-right{animation:d-slidein-r var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-drawer-top{animation:d-slidein-t var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-drawer-bottom{animation:d-slidein-b var(--d-duration-normal) var(--d-easing-decelerate)}',

  // ═══════════════════════════════════════════════════════════════
  // SHEET
  // ═══════════════════════════════════════════════════════════════
  '.d-sheet-panel{background:var(--d-surface-1);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
  '.d-sheet-left{animation:d-slidein-l var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-sheet-right{animation:d-slidein-r var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-sheet-top{animation:d-slidein-t var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-sheet-bottom{animation:d-slidein-b var(--d-duration-normal) var(--d-easing-decelerate)}',
  '.d-sheet-handle-bar{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // TOOLTIP
  // ═══════════════════════════════════════════════════════════════
  '.d-tooltip{background:var(--d-fg);color:var(--d-bg);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',

  // ═══════════════════════════════════════════════════════════════
  // POPOVER
  // ═══════════════════════════════════════════════════════════════
  '.d-popover-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',

  // ═══════════════════════════════════════════════════════════════
  // HOVER CARD
  // ═══════════════════════════════════════════════════════════════
  '.d-hovercard-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // DROPDOWN
  // ═══════════════════════════════════════════════════════════════
  '.d-dropdown-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-dropdown-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  // Dropdown item hover/highlight handled by unified listitem contract in SELECT section
  '.d-dropdown-separator{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ═══════════════════════════════════════════════════════════════
  '.d-contextmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',

  // ═══════════════════════════════════════════════════════════════
  // COMMAND PALETTE
  // ═══════════════════════════════════════════════════════════════
  '.d-command-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
  '.d-command-input-wrap{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-command-item:hover,.d-command-item-highlight{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // POPCONFIRM
  // ═══════════════════════════════════════════════════════════════
  '.d-popconfirm{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════
  '.d-tabs-list{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-tab{color:var(--d-muted);border-bottom:2px solid transparent;transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-tab:hover{color:var(--d-fg)}',
  '.d-tab-active{color:var(--d-primary);border-bottom-color:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // ACCORDION / COLLAPSIBLE
  // ═══════════════════════════════════════════════════════════════
  '.d-accordion-item{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-bg);margin-bottom:var(--d-sp-2)}',
  '.d-accordion-trigger{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-accordion-trigger:hover{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // SEPARATOR
  // ═══════════════════════════════════════════════════════════════
  '.d-separator{background:var(--d-border)}',
  '.d-separator-line{background:var(--d-border)}',
  '.d-separator-vertical{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // BREADCRUMB
  // ═══════════════════════════════════════════════════════════════
  '.d-breadcrumb-link{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-breadcrumb-link:hover{color:var(--d-primary)}',
  '.d-breadcrumb-separator{color:var(--d-muted)}',
  '.d-breadcrumb-current{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════
  '.d-pagination-btn{border-radius:var(--d-radius-inner);color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-pagination-btn:hover{background:var(--d-surface-1);color:var(--d-fg)}',
  '.d-pagination-active{background:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-pagination-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
  '.d-pagination-ellipsis{color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // TABLE
  // ═══════════════════════════════════════════════════════════════
  '.d-table{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);overflow:hidden}',
  '.d-th{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1);color:var(--d-fg)}',
  '.d-td{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
  '.d-table-striped tbody .d-tr:nth-child(even){background:var(--d-surface-1)}',
  '.d-table-hover .d-tr:hover{background:var(--d-primary-subtle)}',
  '.d-table-row-selected{background:var(--d-primary-subtle)}',
  '.d-table-sticky{background:var(--d-surface-1)}',
  '.d-table-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // LIST
  // ═══════════════════════════════════════════════════════════════
  '.d-list{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-bg)}',
  '.d-list-item{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-list-item:last-child{border-bottom:none}',

  // ═══════════════════════════════════════════════════════════════
  // TREE
  // ═══════════════════════════════════════════════════════════════
  '.d-tree-node-content:hover{background:var(--d-surface-1)}',
  '.d-tree-node-selected .d-tree-node-label{color:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // AVATAR
  // ═══════════════════════════════════════════════════════════════
  '.d-avatar{border-radius:50%;background:var(--d-primary);border:2px solid var(--d-border)}',
  '.d-avatar-fallback{color:var(--d-primary-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // PROGRESS
  // ═══════════════════════════════════════════════════════════════
  '.d-progress{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-full);overflow:hidden}',
  '.d-progress-bar{background:var(--d-primary);border-radius:var(--d-radius-full)}',
  '.d-progress-success .d-progress-bar{background:var(--d-success)}',
  '.d-progress-warning .d-progress-bar{background:var(--d-warning)}',
  '.d-progress-error .d-progress-bar{background:var(--d-error)}',
  '.d-progress-label{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // SKELETON
  // ═══════════════════════════════════════════════════════════════
  '.d-skeleton{background:var(--d-surface-1);background-image:linear-gradient(90deg,var(--d-surface-1),var(--d-border),var(--d-surface-1));background-size:200% 100%}',

  // ═══════════════════════════════════════════════════════════════
  // ALERT
  // ═══════════════════════════════════════════════════════════════
  '.d-alert{border-radius:var(--d-radius-panel);border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);color:var(--d-fg)}',
  '.d-alert-info{background:var(--d-info-subtle);border-color:var(--d-info-border)}',
  '.d-alert-success{background:var(--d-success-subtle);border-color:var(--d-success-border)}',
  '.d-alert-warning{background:var(--d-warning-subtle);border-color:var(--d-warning-border)}',
  '.d-alert-error{background:var(--d-error-subtle);border-color:var(--d-error-border)}',
  '.d-alert-dismiss{color:var(--d-muted);border-radius:var(--d-radius-inner)}',
  '.d-alert-dismiss:hover{color:var(--d-fg);background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // TOAST / NOTIFICATION / MESSAGE
  // ═══════════════════════════════════════════════════════════════
  '.d-toast{border-radius:var(--d-radius-panel);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
  '.d-toast-info{border-left:3px solid var(--d-info)}',
  '.d-toast-success{border-left:3px solid var(--d-success)}',
  '.d-toast-warning{border-left:3px solid var(--d-warning)}',
  '.d-toast-error{border-left:3px solid var(--d-error)}',
  '.d-toast-close{color:var(--d-muted)}',
  '.d-toast-close:hover{color:var(--d-fg)}',
  // Notification
  '.d-notification{border-radius:var(--d-radius-panel);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
  '.d-notification-info{border-left:3px solid var(--d-info)}',
  '.d-notification-success{border-left:3px solid var(--d-success)}',
  '.d-notification-warning{border-left:3px solid var(--d-warning)}',
  '.d-notification-error{border-left:3px solid var(--d-error)}',
  '.d-message{border-radius:var(--d-radius-panel);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',

  // ═══════════════════════════════════════════════════════════════
  // RESULT
  // ═══════════════════════════════════════════════════════════════
  '.d-result{color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // DESCRIPTIONS
  // ═══════════════════════════════════════════════════════════════
  '.d-descriptions-table{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.d-descriptions-label{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
  '.d-descriptions-content{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // SEGMENTED CONTROL
  // ═══════════════════════════════════════════════════════════════
  '.d-segmented{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-segmented-item{color:var(--d-muted)}',
  '.d-segmented-item:hover{color:var(--d-fg)}',
  '.d-segmented-item[aria-checked="true"]{background:var(--d-bg);color:var(--d-fg);box-shadow:var(--d-elevation-1)}',

  // ═══════════════════════════════════════════════════════════════
  // STEPS
  // ═══════════════════════════════════════════════════════════════
  '.d-step-icon{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted)}',
  '.d-step-finish .d-step-icon{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary)}',
  '.d-step-active .d-step-icon{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-step-connector{background:var(--d-border)}',
  '.d-step-finish~.d-step-connector{background:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // MENU / MENUBAR / NAVIGATION MENU
  // ═══════════════════════════════════════════════════════════════
  '.d-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-1)}',
  '.d-menu-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-menu-item:hover{background:var(--d-surface-1)}',
  '.d-menu-item-active{background:var(--d-primary-subtle);color:var(--d-primary)}',
  '.d-menu-separator{background:var(--d-border)}',
  '.d-menu-sub{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-menubar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
  '.d-menubar-item{color:var(--d-fg)}',
  '.d-menubar-item:hover,.d-menubar-item-active{background:var(--d-surface-1)}',
  '.d-navmenu-item{color:var(--d-fg)}',
  '.d-navmenu-item:hover{color:var(--d-primary)}',
  '.d-navmenu-item-active{color:var(--d-primary)}',
  '.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',

  // ═══════════════════════════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════════════════════════
  '.d-calendar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.d-calendar-cell:hover{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // CAROUSEL
  // ═══════════════════════════════════════════════════════════════
  '.d-carousel-nav{color:var(--d-fg);background:var(--d-bg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-1)}',
  '.d-carousel-dot{background:var(--d-border)}',
  '.d-carousel-dot-active{background:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // EMPTY
  // ═══════════════════════════════════════════════════════════════
  '.d-empty{color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // IMAGE
  // ═══════════════════════════════════════════════════════════════
  '.d-image{border-radius:var(--d-radius-panel)}',

  // ═══════════════════════════════════════════════════════════════
  // TIMELINE
  // ═══════════════════════════════════════════════════════════════
  '.d-timeline-dot{background:var(--d-primary)}',
  '.d-timeline-line{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // KBD
  // ═══════════════════════════════════════════════════════════════
  '.d-kbd{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);box-shadow:0 1px 0 var(--d-border);color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  '.d-text{color:var(--d-fg)}',
  '.d-text-mark{background:var(--d-warning-subtle)}',
  '.d-text-code{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.d-link{color:var(--d-primary)}',
  '.d-link:hover{color:var(--d-primary-hover)}',
  '.d-blockquote{border-left:3px solid var(--d-border);color:var(--d-muted-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // RESIZABLE
  // ═══════════════════════════════════════════════════════════════
  '.d-resizable{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.d-resizable-handle{background:var(--d-surface-0)}',
  '.d-resizable-handle-bar{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // SCROLL AREA
  // ═══════════════════════════════════════════════════════════════
  '.d-scrollarea-viewport::-webkit-scrollbar-thumb{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // TOUR
  // ═══════════════════════════════════════════════════════════════
  '.d-tour-popover{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',

  // ═══════════════════════════════════════════════════════════════
  // FLOAT BUTTON
  // ═══════════════════════════════════════════════════════════════
  '.d-float-btn{background:var(--d-primary);color:var(--d-primary-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-float-btn:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',

  // ═══════════════════════════════════════════════════════════════
  // SHARED OPTION
  // ═══════════════════════════════════════════════════════════════
  '.d-option{color:var(--d-fg)}',
  '.d-option:hover{background:var(--d-surface-1)}',
  '.d-option-active{background:var(--d-surface-1)}',

  // ═══════════════════════════════════════════════════════════════
  // DATE RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-daterange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-datepicker-day-in-range{background:var(--d-primary-subtle)}',
  '.d-datepicker-day-range-start,.d-datepicker-day-range-end{background:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-daterange-presets button{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-daterange-presets button:hover{color:var(--d-primary)}',

  // ═══════════════════════════════════════════════════════════════
  // TIME RANGE PICKER
  // ═══════════════════════════════════════════════════════════════
  '.d-timerange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-timerange-cell:hover{background:var(--d-surface-1)}',
  '.d-timerange-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
  '.d-timerange-error{color:var(--d-error)}',

  // ═══════════════════════════════════════════════════════════════
  // RANGE SLIDER
  // ═══════════════════════════════════════════════════════════════
  '.d-rangeslider-track{background:var(--d-border)}',
  '.d-rangeslider-fill{background:var(--d-primary)}',
  '.d-rangeslider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
  '.d-rangeslider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
  '.d-rangeslider-thumb:focus-visible{box-shadow:0 0 0 4px var(--d-primary-subtle);outline:none}',

  // ═══════════════════════════════════════════════════════════════
  // TREE SELECT
  // ═══════════════════════════════════════════════════════════════
  '.d-treeselect-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-treeselect-node:hover{background:var(--d-surface-1)}',
  '.d-treeselect-node-selected{color:var(--d-primary)}',
  '.d-treeselect-search{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // AVATAR GROUP
  // ═══════════════════════════════════════════════════════════════
  '.d-avatar-group-overflow{background:var(--d-surface-1);border:2px solid var(--d-border);color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION MENU
  // ═══════════════════════════════════════════════════════════════
  '.d-navmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.d-navmenu-trigger{color:var(--d-fg);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-navmenu-trigger:hover,.d-navmenu-trigger-active{color:var(--d-primary)}',
  '.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-2)}',
  '.d-navmenu-link{color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-navmenu-link:hover{background:var(--d-surface-1);color:var(--d-primary)}',
  '.d-navmenu-link-desc{color:var(--d-muted)}',

  // ═══════════════════════════════════════════════════════════════
  // SPLITTER
  // ═══════════════════════════════════════════════════════════════
  '.d-splitter{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.d-splitter-handle{background:var(--d-surface-0);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-splitter-handle:hover{background:var(--d-surface-1)}',
  '.d-splitter-handle-bar{background:var(--d-border)}',

  // ═══════════════════════════════════════════════════════════════
  // BACK TOP
  // ═══════════════════════════════════════════════════════════════
  '.d-backtop{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-2);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
  '.d-backtop:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',

  // ═══════════════════════════════════════════════════════════════
  // DATA TABLE
  // ═══════════════════════════════════════════════════════════════
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
].join('');
