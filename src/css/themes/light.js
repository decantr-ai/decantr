export const light = {
  id: 'light',
  name: 'Light',
  colors: {
    '--c0': '#ffffff',
    '--c1': '#1366D9',
    '--c2': '#f8fafc',
    '--c3': '#020817',
    '--c4': '#606D80',
    '--c5': '#DDE3ED',
    '--c6': '#0f52b5',
    '--c7': '#22c55e',
    '--c8': '#f59e0b',
    '--c9': '#ef4444'
  },
  meta: {
    isDark: false,
    contrastText: '#ffffff',
    surfaceAlpha: 'rgba(255,255,255,0.8)'
  },
  tokens: {
    '--d-radius': '8px',
    '--d-radius-lg': '16px',
    '--d-shadow': 'none',
    '--d-transition': 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    '--d-pad': '1.5rem',
    '--d-font': 'Inter,"Inter Fallback",system-ui,sans-serif',
    '--d-font-mono': 'ui-monospace,"JetBrains Mono",monospace',
    '--d-text-xs': '0.625rem', '--d-text-sm': '0.75rem', '--d-text-base': '0.875rem', '--d-text-md': '1rem',
    '--d-text-lg': '1.125rem', '--d-text-xl': '1.25rem', '--d-text-2xl': '1.5rem', '--d-text-3xl': '2rem', '--d-text-4xl': '2.5rem',
    '--d-lh-none': '1', '--d-lh-tight': '1.1', '--d-lh-snug': '1.25', '--d-lh-normal': '1.5', '--d-lh-relaxed': '1.6', '--d-lh-loose': '1.75',
    '--d-fw-heading': '700', '--d-fw-title': '600', '--d-fw-medium': '500', '--d-ls-heading': '-0.025em',
    '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem', '--d-sp-2-5': '0.625rem', '--d-sp-3': '0.75rem', '--d-sp-4': '1rem', '--d-sp-5': '1.25rem',
    '--d-sp-6': '1.5rem', '--d-sp-8': '2rem', '--d-sp-10': '2.5rem', '--d-sp-12': '3rem', '--d-sp-16': '4rem'
  },
  global: 'body{font-family:var(--d-font)}',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:none;color:var(--c3);transition:var(--d-transition)}',
      '.d-btn-default{background:var(--c2);border-color:var(--c5);color:var(--c3)}',
      '.d-btn:hover{background:var(--c5);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}',
      '.d-btn:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;border-color:var(--c1)}',
      '.d-btn-primary:hover{background:var(--c6);border-color:var(--c6);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-btn-primary:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-secondary{background:transparent;color:var(--c4);border-color:var(--c5)}',
      '.d-btn-secondary:hover{background:var(--c2);color:var(--c3);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;border-color:var(--c9)}',
      '.d-btn-destructive:hover{background:color-mix(in srgb,var(--c9) 85%,#000);border-color:color-mix(in srgb,var(--c9) 85%,#000);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c9) 20%,transparent)}',
      '.d-btn-destructive:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-success{background:var(--c7);color:#fff;border-color:var(--c7)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 85%,#000);border-color:color-mix(in srgb,var(--c7) 85%,#000);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c7) 25%,transparent)}',
      '.d-btn-success:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-warning{background:var(--c8);color:#fff;border-color:var(--c8)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 85%,#000);border-color:color-mix(in srgb,var(--c8) 85%,#000);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c8) 25%,transparent)}',
      '.d-btn-warning:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1)}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 6%,transparent);border-color:var(--c6);color:var(--c6);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.04)}',
      '.d-btn-outline:active{transform:translateY(0) scale(0.98)}',
      '.d-btn-ghost{background:transparent;border-color:transparent}',
      '.d-btn-ghost:hover{background:var(--c2);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-group>.d-btn{border-color:var(--c5)}',
      '.d-btn-group>.d-btn:not(:first-child){border-left-color:color-mix(in srgb,var(--c5) 60%,transparent)}'
    ].join(''),
    spinner: [
      '.d-spinner{color:var(--c1)}',
      '.d-btn-primary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:#fff}',
      '.d-btn-outline .d-spinner{color:var(--c1)}'
    ].join(''),
    card: [
      '.d-card{background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--c5);border-radius:var(--d-radius-lg);box-shadow:0 1px 3px rgba(0,0,0,0.04);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 20px 40px rgba(0,0,0,0.08);transform:translateY(-2px);border-color:color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-card-footer{border-top:1px solid var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-input{color:var(--c3)}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{background:var(--c1);color:#fff;border-radius:9999px}',
      '.d-badge-dot{background:var(--c1)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      'dialog.d-modal-content::backdrop{background:rgba(0,0,0,0.3)}',
      '.d-modal-content{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--c5);border-radius:var(--d-radius-lg);box-shadow:0 20px 60px rgba(0,0,0,0.1);color:var(--c3);animation:d-slide-in 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-modal-header{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
      '.d-modal-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;font-size:var(--d-text-xl);line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:var(--c2)}',
      '@keyframes d-slide-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{color:var(--c3)}',
      '.d-checkbox-check{border-radius:4px;border:1px solid var(--c5);background:var(--c0);transition:var(--d-transition)}',
      '.d-checkbox:has(:checked) .d-checkbox-check{background:var(--c1);border-color:var(--c1);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:40px;height:22px;border-radius:11px;background:var(--c5);border:1px solid var(--c5);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);position:absolute;top:1px;left:1px;transition:var(--d-transition)}',
      '.d-switch:has(:checked) .d-switch-track{background:var(--c1);border-color:var(--c1)}',
      '.d-switch:has(:checked) .d-switch-thumb{left:19px}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    select: [
      '.d-select{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);color:var(--c3);padding:var(--d-sp-2) var(--d-sp-3);transition:var(--d-transition);cursor:pointer}',
      '.d-select:focus-visible{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 10%,transparent);outline:none}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-dropdown{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.08);margin-top:4px;overflow:hidden}',
      '.d-select-option{color:var(--c3);cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option-highlight{background:var(--c2)}',
      '.d-select-option-active{background:var(--c1);color:#fff}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{border-bottom:1px solid var(--c5)}',
      '.d-tab{color:var(--c4);border-bottom:2px solid transparent;transition:var(--d-transition)}',
      '.d-tab:hover{color:var(--c3)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1)}',
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid var(--c5);border-radius:var(--d-radius);background:var(--c0);margin-bottom:var(--d-sp-2)}',
      '.d-accordion-trigger{color:var(--c3);transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:var(--c2)}',
      '.d-accordion-content{padding:0 var(--d-sp-5) var(--d-sp-4);color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator-line{background:var(--c5)}',
      '.d-separator-label{color:var(--c4)}',
      '.d-separator-vertical{background:var(--c5)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c4);text-decoration:none;transition:var(--d-transition)}',
      '.d-breadcrumb-link:hover{color:var(--c1)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 var(--d-sp-1)}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:500}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius-lg);overflow:hidden}',
      '.d-th{padding:var(--d-sp-3) var(--d-sp-4);text-align:left;font-weight:var(--d-fw-title);color:var(--c3);border-bottom:1px solid var(--c5);background:var(--c2)}',
      '.d-td{padding:var(--d-sp-3) var(--d-sp-4);color:var(--c3);border-bottom:1px solid var(--c5)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:var(--c2)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 4%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{border-radius:50%;background:var(--c1);border:2px solid var(--c5)}',
      '.d-avatar-fallback{color:#fff;font-weight:var(--d-fw-title);font-size:var(--d-text-base)}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:8px;border-radius:4px;background:var(--c2);border:1px solid var(--c5);overflow:hidden}',
      '.d-progress-bar{height:100%;border-radius:4px;background:var(--c1);transition:width 0.4s cubic-bezier(0.4,0,0.2,1)}',
      '.d-progress-success .d-progress-bar{background:var(--c7)}',
      '.d-progress-warning .d-progress-bar{background:var(--c8)}',
      '.d-progress-error .d-progress-bar{background:var(--c9)}',
      '.d-progress-striped .d-progress-bar{background-image:linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-size:1rem 1rem}'
    ].join(''),
    skeleton: [
      '.d-skeleton{background:var(--c2);background-image:linear-gradient(90deg,var(--c2),var(--c5),var(--c2));background-size:200% 100%;border-radius:var(--d-radius);animation:d-shimmer 1.5s ease-in-out infinite}',
      '@keyframes d-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:var(--c3);color:var(--c0);padding:0.375rem 0.625rem;border-radius:var(--d-radius);font-size:var(--d-text-sm);box-shadow:0 4px 12px rgba(0,0,0,0.1)}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.875rem var(--d-sp-4);border-radius:var(--d-radius);border:1px solid var(--c5);background:var(--c0);color:var(--c3)}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 6%,transparent);border-color:color-mix(in srgb,var(--c1) 18%,transparent)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 6%,transparent);border-color:color-mix(in srgb,var(--c7) 18%,transparent)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 6%,transparent);border-color:color-mix(in srgb,var(--c8) 18%,transparent)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 6%,transparent);border-color:color-mix(in srgb,var(--c9) 18%,transparent)}',
      '.d-alert-dismiss{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-alert-dismiss:hover{color:var(--c3);background:var(--c2)}'
    ].join(''),
    chip: [
      '.d-chip{background:var(--c2);border:1px solid var(--c5);color:var(--c3);transition:var(--d-transition)}',
      '.d-chip-outline{background:transparent;border:1px solid var(--c5)}',
      '.d-chip-filled{background:var(--c1);color:#fff;border-color:var(--c1)}',
      '.d-chip-selected{background:color-mix(in srgb,var(--c1) 12%,transparent);border-color:var(--c1);color:var(--c1)}',
      '.d-chip-interactive:hover{background:var(--c5);transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,0.06)}',
      '.d-chip-interactive:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-chip-remove{color:var(--c4)}',
      '.d-chip-remove:hover{color:var(--c9)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem var(--d-sp-4);border-radius:var(--d-radius);background:var(--c0);border:1px solid var(--c5);color:var(--c3);box-shadow:0 12px 32px rgba(0,0,0,0.08);animation:d-toast-in 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '.d-toast-info{border-left:3px solid var(--c1)}',
      '.d-toast-success{border-left:3px solid var(--c7)}',
      '.d-toast-warning{border-left:3px solid var(--c8)}',
      '.d-toast-error{border-left:3px solid var(--c9)}',
      '.d-toast-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-toast-close:hover{color:var(--c3);background:var(--c2)}',
      '@keyframes d-toast-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}'
    ].join(''),
    dropdown: [
      '.d-dropdown-menu{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.08);overflow:hidden}',
      '.d-dropdown-item{color:var(--c3);transition:var(--d-transition)}',
      '.d-dropdown-item:hover,.d-dropdown-item-highlight{background:var(--c2)}',
      '.d-dropdown-item-shortcut{color:var(--c4)}',
      '.d-dropdown-separator{background:var(--c5)}'
    ].join(''),
    drawer: [
      'dialog.d-drawer::backdrop{background:rgba(0,0,0,0.3)}',
      '.d-drawer-panel{background:var(--c0);border:1px solid var(--c5);box-shadow:0 20px 60px rgba(0,0,0,0.1);color:var(--c3)}',
      '.d-drawer-left{animation:d-drawer-left 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-drawer-right{animation:d-drawer-right 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-drawer-close{color:var(--c4);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-drawer-close:hover{color:var(--c3);background:var(--c2)}',
      '@keyframes d-drawer-left{from{transform:translateX(-100%)}to{transform:translateX(0)}}',
      '@keyframes d-drawer-right{from{transform:translateX(100%)}to{transform:translateX(0)}}'
    ].join(''),
    pagination: [
      '.d-pagination-btn{border-radius:var(--d-radius);color:var(--c4);transition:var(--d-transition)}',
      '.d-pagination-btn:hover{background:var(--c2);color:var(--c3)}',
      '.d-pagination-active{background:var(--c1);color:#fff;font-weight:600}',
      '.d-pagination-active:hover{background:var(--c6);color:#fff}',
      '.d-pagination-ellipsis{color:var(--c4)}'
    ].join(''),
    radiogroup: [
      '.d-radio-indicator{border:1px solid var(--c5);background:var(--c0);transition:var(--d-transition)}',
      '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--c1);background:var(--c0)}',
      '.d-radio-dot{background:var(--c1)}',
      '.d-radio-label{color:var(--c3)}',
      '.d-radio-native:focus-visible~.d-radio-indicator{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    popover: [
      '.d-popover-content{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.08);color:var(--c3);animation:d-slide-in 0.15s ease}'
    ].join(''),
    combobox: [
      '.d-combobox-input-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-combobox-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-combobox-input{color:var(--c3)}',
      '.d-combobox-input::placeholder{color:var(--c4)}',
      '.d-combobox-arrow{color:var(--c4)}',
      '.d-combobox-listbox{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.08)}',
      '.d-combobox-option{color:var(--c3);transition:var(--d-transition)}',
      '.d-combobox-option-highlight,.d-combobox-option:hover{background:var(--c2)}',
      '.d-combobox-option-active{background:var(--c1);color:#fff}',
      '.d-combobox-empty{color:var(--c4)}',
      '.d-combobox-error .d-combobox-input-wrap{border-color:var(--c9)}',
      '.d-combobox-error .d-combobox-input-wrap:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    slider: [
      '.d-slider-track{background:var(--c5);transition:var(--d-transition)}',
      '.d-slider-fill{background:var(--c1)}',
      '.d-slider-thumb{background:var(--c0);border:2px solid var(--c1);box-shadow:0 1px 3px rgba(0,0,0,0.1);transition:box-shadow 0.15s ease}',
      '.d-slider-thumb:hover{box-shadow:0 0 0 4px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-slider-active .d-slider-thumb{box-shadow:0 0 0 6px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-slider-value{color:var(--c3)}'
    ].join(''),
    chart: [
      ':root{--d-chart-0:var(--c1);--d-chart-1:var(--c7);--d-chart-2:var(--c8);--d-chart-3:var(--c9);--d-chart-4:color-mix(in srgb,var(--c1) 60%,var(--c7));--d-chart-5:color-mix(in srgb,var(--c8) 60%,var(--c9));--d-chart-6:color-mix(in srgb,var(--c1) 50%,var(--c4));--d-chart-7:var(--c6);--d-chart-tooltip-bg:var(--c0)}',
      '.d-chart-tooltip{background:var(--d-chart-tooltip-bg);border:1px solid var(--c5);box-shadow:0 2px 8px rgba(0,0,0,0.08);border-radius:var(--d-radius)}',
      '.d-chart-grid line{stroke:var(--c5);stroke-opacity:0.4}',
      '.d-chart-bar{rx:3}'
    ].join('')
  }
};
