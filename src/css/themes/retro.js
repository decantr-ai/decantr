export const retro = {
  id: 'retro',
  name: 'Retro',
  colors: {
    '--c0': '#fffef5',
    '--c1': '#e63946',
    '--c2': '#fff8e7',
    '--c3': '#1a1a1a',
    '--c4': '#6b7280',
    '--c5': '#1a1a1a',
    '--c6': '#c1121f',
    '--c7': '#2d6a4f',
    '--c8': '#f77f00',
    '--c9': '#d00000'
  },
  meta: {
    isDark: false,
    contrastText: '#ffffff',
    surfaceAlpha: 'rgba(255,248,231,0.9)'
  },
  tokens: {
    '--d-radius': '4px',
    '--d-radius-lg': '4px',
    '--d-shadow': '4px 4px 0 var(--c3)',
    '--d-transition': 'all 0.1s ease',
    '--d-pad': '1.25rem',
    '--d-font': 'Inter,"Inter Fallback",system-ui,sans-serif',
    '--d-font-mono': 'ui-monospace,"JetBrains Mono",monospace',
    '--d-text-xs': '0.625rem', '--d-text-sm': '0.75rem', '--d-text-base': '0.875rem', '--d-text-md': '1rem',
    '--d-text-lg': '1.125rem', '--d-text-xl': '1.25rem', '--d-text-2xl': '1.5rem', '--d-text-3xl': '2rem', '--d-text-4xl': '2.5rem',
    '--d-lh-none': '1', '--d-lh-tight': '1.1', '--d-lh-snug': '1.25', '--d-lh-normal': '1.5', '--d-lh-relaxed': '1.6', '--d-lh-loose': '1.75',
    '--d-fw-heading': '800', '--d-fw-title': '800', '--d-fw-medium': '700', '--d-ls-heading': '0.05em',
    '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem', '--d-sp-2-5': '0.625rem', '--d-sp-3': '0.75rem', '--d-sp-4': '1rem', '--d-sp-5': '1.25rem',
    '--d-sp-6': '1.5rem', '--d-sp-8': '2rem', '--d-sp-10': '2.5rem', '--d-sp-12': '3rem', '--d-sp-16': '4rem'
  },
  global: 'body{font-family:var(--d-font)}',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition);font-weight:800;text-transform:uppercase;letter-spacing:0.05em}',
      '.d-btn-default{background:var(--c2);border-color:var(--c3);color:var(--c3)}',
      '.d-btn:hover{transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c3)}',
      '.d-btn:focus-visible{outline:3px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;border-color:var(--c3)}',
      '.d-btn-primary:hover{background:var(--c6);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn-primary:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c3)}',
      '.d-btn-secondary{background:transparent;border-color:var(--c3)}',
      '.d-btn-secondary:hover{background:var(--c2);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;border-color:var(--c3)}',
      '.d-btn-destructive:hover{background:color-mix(in srgb,var(--c9) 85%,#000);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn-destructive:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c3)}',
      '.d-btn-success{background:var(--c7);color:#fff;border-color:var(--c3);box-shadow:var(--d-shadow)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 85%,#000);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn-success:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c3)}',
      '.d-btn-warning{background:var(--c8);color:#fff;border-color:var(--c3);box-shadow:var(--d-shadow)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 85%,#000);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-btn-warning:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c3)}',
      '.d-btn-outline{background:transparent;border:3px solid var(--c1);color:var(--c1);box-shadow:var(--d-shadow)}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c1)}',
      '.d-btn-outline:active{transform:translate(3px,3px);box-shadow:0px 0px 0 var(--c1)}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{border-color:var(--c3);box-shadow:var(--d-shadow);transform:translate(-2px,-2px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline;text-transform:none;font-weight:700}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-group>.d-btn{border-color:var(--c3)}',
      '.d-btn-group>.d-btn:not(:first-child){margin-left:-3px}'
    ].join(''),
    spinner: [
      '.d-spinner{color:var(--c3)}',
      '.d-spinner circle{stroke-width:4}',
      '.d-btn-primary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:#fff}',
      '.d-btn-outline .d-spinner{color:var(--c1)}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:3px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-card-header{font-weight:var(--d-fw-heading);font-size:var(--d-text-xl);text-transform:uppercase;letter-spacing:0.05em}',
      '.d-card-footer{border-top:3px solid var(--c3)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition)}',
      '.d-input-wrap:focus-within{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}',
      '.d-input{color:var(--c3);font-weight:700}',
      '.d-input::placeholder{color:var(--c4);font-weight:400}',
      '.d-input-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-input-error:focus-within{box-shadow:5px 5px 0 var(--c9)}'
    ].join(''),
    badge: [
      '.d-badge{background:var(--c1);color:#fff;border-radius:var(--d-radius);border:2px solid var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;box-shadow:2px 2px 0 var(--c3)}',
      '.d-badge-dot{background:var(--c1);border:2px solid var(--c3)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.3}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 1s steps(2) infinite}'
    ].join(''),
    modal: [
      'dialog.d-modal-content::backdrop{background:rgba(0,0,0,0.5)}',
      '.d-modal-content{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:8px 8px 0 var(--c3);color:var(--c3);animation:d-drop-in 0.15s ease}',
      '.d-modal-header{font-weight:var(--d-fw-heading);font-size:var(--d-text-xl);text-transform:uppercase;letter-spacing:0.05em}',
      '.d-modal-footer{border-top:3px solid var(--c3)}',
      '.d-modal-close{background:transparent;border:3px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:var(--d-text-md);line-height:1;font-weight:var(--d-fw-heading);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition)}',
      '.d-modal-close:hover{background:var(--c9);color:#fff;border-color:var(--c9);box-shadow:2px 2px 0 color-mix(in srgb,var(--c9) 60%,#000);transform:translate(-1px,-1px)}',
      '@keyframes d-drop-in{from{transform:translateY(-20px)}to{transform:translateY(0)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}',
      '.d-textarea{color:var(--c3);font-weight:700;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4);font-weight:400}',
      '.d-textarea-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-textarea-error:focus-within{box-shadow:5px 5px 0 var(--c9)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c3)}',
      '.d-checkbox-check{width:22px;height:22px;border:3px solid var(--c3);border-radius:var(--d-radius);background:var(--c0);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition)}',
      '.d-checkbox:has(:checked) .d-checkbox-check{background:var(--c1);border-color:var(--c3);box-shadow:2px 2px 0 var(--c3);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:3px solid var(--c1);outline-offset:2px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:3px solid var(--c3);border-radius:var(--d-radius);background:var(--c2);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:14px;height:14px;border:2px solid var(--c3);border-radius:var(--d-radius);background:var(--c0);position:absolute;top:2px;left:2px;transition:var(--d-transition);box-shadow:1px 1px 0 var(--c3)}',
      '.d-switch:has(:checked) .d-switch-track{background:var(--c1);border-color:var(--c3)}',
      '.d-switch:has(:checked) .d-switch-thumb{left:20px;background:#fff}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:3px solid var(--c1);outline-offset:2px}'
    ].join(''),
    select: [
      '.d-select{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition);color:var(--c3);padding:var(--d-sp-2) var(--d-sp-3);font:inherit;font-weight:700;cursor:pointer;width:100%}',
      '.d-select-dropdown{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);margin-top:0.25rem;overflow:hidden;z-index:100;position:absolute;width:100%}',
      '.d-select-option{cursor:pointer;font-weight:700;transition:var(--d-transition);color:var(--c3)}',
      '.d-select-option-active{background:var(--c1);color:#fff}',
      '.d-select-option-highlight{background:var(--c2)}',
      '.d-select-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-select-open .d-select{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{border-bottom:3px solid var(--c3)}',
      '.d-tab{padding:var(--d-sp-2-5) var(--d-sp-5);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;border:3px solid transparent;border-bottom:none;color:var(--c4);transition:var(--d-transition);position:relative;top:3px}',
      '.d-tab:hover{color:var(--c3);background:var(--c2)}',
      '.d-tab-active{color:var(--c3);background:var(--c0);border-color:var(--c3);box-shadow:3px -3px 0 var(--c3)}',
      '.d-tabs-panel{padding:1.25rem;border:3px solid var(--c3);border-top:none;background:var(--c0)}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);margin-bottom:var(--d-sp-2);background:var(--c0);transition:var(--d-transition)}',
      '.d-accordion-trigger{padding:var(--d-sp-3) var(--d-sp-4);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;background:var(--c2);border-bottom:3px solid var(--c3);color:var(--c3);transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:var(--c0);transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--c3)}',
      '.d-accordion-content{padding:var(--d-sp-4);color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator{margin:var(--d-sp-4) 0}',
      '.d-separator-line{height:3px;background:var(--c3)}',
      '.d-separator-label{font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;color:var(--c3);padding:0 0.5rem;background:var(--c0)}',
      '.d-separator-vertical{width:3px;background:var(--c3);align-self:stretch;margin:0 1rem}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;font-size:var(--d-text-base);transition:var(--d-transition);border-bottom:2px solid transparent}',
      '.d-breadcrumb-link:hover{color:var(--c6);border-bottom-color:var(--c6);transform:translate(-1px,-1px)}',
      '.d-breadcrumb-separator{color:var(--c3);font-weight:var(--d-fw-heading);margin:0 var(--d-sp-2)}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;font-size:var(--d-text-base)}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);overflow:hidden}',
      '.d-th{padding:var(--d-sp-3) var(--d-sp-4);background:var(--c3);color:var(--c0);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:3px solid var(--c3)}',
      '.d-td{padding:var(--d-sp-3) var(--d-sp-4);border-bottom:2px solid var(--c5);color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:var(--c2)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 10%,var(--c0));transform:translate(-2px,-2px);box-shadow:4px 4px 0 var(--c3)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:var(--d-radius);border:3px solid var(--c3);box-shadow:2px 2px 0 var(--c3);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:var(--c1);color:#fff;font-weight:800;text-transform:uppercase;font-size:var(--d-text-md)}',
      '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--c1);color:#fff;font-weight:800;text-transform:uppercase}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:20px;background:var(--c2);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);overflow:hidden}',
      '.d-progress-bar{height:100%;background:var(--c1);transition:width 0.3s ease}',
      '.d-progress-success .d-progress-bar{background:var(--c7)}',
      '.d-progress-warning .d-progress-bar{background:var(--c8)}',
      '.d-progress-error .d-progress-bar{background:var(--c9)}',
      '.d-progress-striped .d-progress-bar{background-image:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.2) 10px,rgba(255,255,255,0.2) 20px)}'
    ].join(''),
    skeleton: [
      '.d-skeleton{background:var(--c2);border:2px solid var(--c5);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c5);background-image:linear-gradient(90deg,var(--c2) 0%,var(--c0) 50%,var(--c2) 100%);background-size:200% 100%;animation:d-shimmer 1.5s ease-in-out infinite}',
      '@keyframes d-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:var(--c3);color:var(--c0);padding:0.375rem 0.75rem;border-radius:var(--d-radius);border:3px solid var(--c3);box-shadow:3px 3px 0 color-mix(in srgb,var(--c3) 60%,#000);font-weight:var(--d-fw-heading);font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;z-index:1100}'
    ].join(''),
    alert: [
      '.d-alert{padding:var(--d-sp-4) var(--d-sp-5);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);background:var(--c2);color:var(--c3);font-weight:700;position:relative}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 10%,var(--c0));border-color:var(--c1);box-shadow:4px 4px 0 var(--c1)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 10%,var(--c0));border-color:var(--c7);box-shadow:4px 4px 0 var(--c7)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 10%,var(--c0));border-color:var(--c8);box-shadow:4px 4px 0 var(--c8)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 10%,var(--c0));border-color:var(--c9);box-shadow:4px 4px 0 var(--c9)}',
      '.d-alert-dismiss{background:transparent;border:3px solid var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-weight:var(--d-fw-heading);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);color:var(--c3);margin-left:auto;font-size:var(--d-text-base);line-height:1}',
      '.d-alert-dismiss:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}'
    ].join(''),
    chip: [
      '.d-chip{background:var(--c2);border:2px solid var(--c3);color:var(--c3);box-shadow:2px 2px 0 var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-chip-outline{background:transparent;border:2px solid var(--c3)}',
      '.d-chip-filled{background:var(--c1);color:#fff;border-color:var(--c3)}',
      '.d-chip-selected{background:color-mix(in srgb,var(--c1) 15%,var(--c0));border-color:var(--c1);box-shadow:2px 2px 0 var(--c1)}',
      '.d-chip-interactive:hover{transform:translate(-2px,-2px);box-shadow:4px 4px 0 var(--c3)}',
      '.d-chip-interactive:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--c3)}',
      '.d-chip-interactive:focus-visible{outline:3px solid var(--c1);outline-offset:2px}',
      '.d-chip-remove{color:var(--c3);font-weight:var(--d-fw-heading)}',
      '.d-chip-remove:hover{color:var(--c9)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem var(--d-sp-5);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);background:var(--c0);color:var(--c3);font-weight:700;min-width:280px;animation:d-toast-in 0.2s ease}',
      '.d-toast-info{border-color:var(--c1);box-shadow:4px 4px 0 var(--c1)}',
      '.d-toast-success{border-color:var(--c7);box-shadow:4px 4px 0 var(--c7)}',
      '.d-toast-warning{border-color:var(--c8);box-shadow:4px 4px 0 var(--c8)}',
      '.d-toast-error{border-color:var(--c9);box-shadow:4px 4px 0 var(--c9)}',
      '.d-toast-close{background:transparent;border:3px solid var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-weight:var(--d-fw-heading);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);color:var(--c3);margin-left:auto;font-size:var(--d-text-base);line-height:1}',
      '.d-toast-close:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}',
      '@keyframes d-toast-in{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}'
    ].join(''),
    dropdown: [
      '.d-dropdown-menu{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);overflow:hidden}',
      '.d-dropdown-item{color:var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em;transition:var(--d-transition)}',
      '.d-dropdown-item:hover,.d-dropdown-item-highlight{background:var(--c2)}',
      '.d-dropdown-item-shortcut{color:var(--c4);font-weight:500}',
      '.d-dropdown-separator{background:var(--c3);height:2px}'
    ].join(''),
    drawer: [
      'dialog.d-drawer::backdrop{background:rgba(0,0,0,0.4)}',
      '.d-drawer-panel{background:var(--c0);border:3px solid var(--c3);box-shadow:8px 0 0 var(--c3);color:var(--c3)}',
      '.d-drawer-left{animation:d-drawer-left 0.15s ease;box-shadow:-8px 0 0 var(--c3)}',
      '.d-drawer-right{animation:d-drawer-right 0.15s ease}',
      '.d-drawer-close{color:var(--c3);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);font-weight:var(--d-fw-heading);transition:var(--d-transition)}',
      '.d-drawer-close:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}',
      '.d-drawer-title{text-transform:uppercase;letter-spacing:0.05em}',
      '@keyframes d-drawer-left{from{transform:translateX(-100%)}to{transform:translateX(0)}}',
      '@keyframes d-drawer-right{from{transform:translateX(100%)}to{transform:translateX(0)}}'
    ].join(''),
    pagination: [
      '.d-pagination-btn{border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);color:var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;transition:var(--d-transition)}',
      '.d-pagination-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}',
      '.d-pagination-btn:active{transform:translate(1px,1px);box-shadow:0 0 0 var(--c3)}',
      '.d-pagination-active{background:var(--c1);color:#fff;border-color:var(--c3);box-shadow:2px 2px 0 var(--c3)}',
      '.d-pagination-active:hover{background:var(--c1);transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}',
      '.d-pagination-ellipsis{color:var(--c3);font-weight:var(--d-fw-heading)}'
    ].join(''),
    radiogroup: [
      '.d-radio-indicator{border:3px solid var(--c3);background:var(--c0);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition)}',
      '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--c1);box-shadow:2px 2px 0 var(--c1)}',
      '.d-radio-dot{background:var(--c1)}',
      '.d-radio-label{color:var(--c3);font-weight:var(--d-fw-heading);text-transform:uppercase;letter-spacing:0.05em}',
      '.d-radio-native:focus-visible~.d-radio-indicator{outline:3px solid var(--c1);outline-offset:2px}'
    ].join(''),
    popover: [
      '.d-popover-content{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);color:var(--c3)}'
    ].join(''),
    combobox: [
      '.d-combobox-input-wrap{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition)}',
      '.d-combobox-input-wrap:focus-within{border-color:var(--c1);box-shadow:5px 5px 0 var(--c1);transform:translate(-1px,-1px)}',
      '.d-combobox-input{color:var(--c3);font-weight:500}',
      '.d-combobox-input::placeholder{color:var(--c4)}',
      '.d-combobox-arrow{color:var(--c3);font-weight:var(--d-fw-heading)}',
      '.d-combobox-listbox{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3)}',
      '.d-combobox-option{color:var(--c3);font-weight:500;transition:var(--d-transition)}',
      '.d-combobox-option-highlight,.d-combobox-option:hover{background:var(--c2)}',
      '.d-combobox-option-active{background:var(--c1);color:#fff}',
      '.d-combobox-empty{color:var(--c4);font-weight:var(--d-fw-heading);text-transform:uppercase}',
      '.d-combobox-error .d-combobox-input-wrap{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}'
    ].join(''),
    slider: [
      '.d-slider-track{background:var(--c2);border:2px solid var(--c3);box-shadow:2px 2px 0 var(--c3);border-radius:var(--d-radius)}',
      '.d-slider-fill{background:var(--c1);border-radius:var(--d-radius)}',
      '.d-slider-thumb{background:var(--c0);border:3px solid var(--c3);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition)}',
      '.d-slider-thumb:hover{transform:translate(-50%,-50%) translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}',
      '.d-slider-active .d-slider-thumb{transform:translate(-50%,-50%) translate(1px,1px);box-shadow:0 0 0 var(--c3)}',
      '.d-slider-value{color:var(--c3);font-weight:var(--d-fw-heading)}'
    ].join(''),
    chart: [
      ':root{--d-chart-0:var(--c1);--d-chart-1:var(--c7);--d-chart-2:var(--c8);--d-chart-3:var(--c9);--d-chart-4:color-mix(in srgb,var(--c1) 60%,var(--c7));--d-chart-5:color-mix(in srgb,var(--c8) 60%,var(--c9));--d-chart-6:color-mix(in srgb,var(--c1) 50%,var(--c4));--d-chart-7:var(--c6);--d-chart-tooltip-bg:var(--c0)}',
      '.d-chart-line{stroke-width:3}',
      '.d-chart-tooltip{background:var(--d-chart-tooltip-bg);border:3px solid var(--c3);box-shadow:4px 4px 0 var(--c3);border-radius:0}',
      '.d-chart-grid line{stroke:var(--c3);stroke-opacity:0.15}',
      '.d-chart-bar{rx:0}',
      '.d-chart-legend-swatch{border:2px solid var(--c3);border-radius:0}'
    ].join('')
  }
};
