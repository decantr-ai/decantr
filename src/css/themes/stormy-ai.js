export const stormyAi = {
  id: 'stormy-ai',
  name: 'Stormy AI',
  colors: {
    '--c0': '#0a0c10',
    '--c1': '#38bdf8',
    '--c2': '#111318',
    '--c3': '#c5d3e8',
    '--c4': '#6b7a94',
    '--c5': '#252a33',
    '--c6': '#7dd3fc',
    '--c7': '#4ade80',
    '--c8': '#fbbf24',
    '--c9': '#ef4444'
  },
  meta: {
    isDark: true,
    contrastText: '#ffffff',
    surfaceAlpha: 'rgba(17,19,24,0.9)'
  },
  tokens: {
    '--d-radius': '12px',
    '--d-radius-lg': '16px',
    '--d-shadow': '0 8px 32px rgba(0,0,0,0.3)',
    '--d-transition': 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    '--d-pad': '1.5rem',
    '--d-font': 'Inter,"Inter Fallback",system-ui,sans-serif',
    '--d-font-mono': 'ui-monospace,"JetBrains Mono",monospace',
    '--d-text-xs': '0.625rem', '--d-text-sm': '0.75rem', '--d-text-base': '0.875rem', '--d-text-md': '1rem',
    '--d-text-lg': '1.125rem', '--d-text-xl': '1.25rem', '--d-text-2xl': '1.5rem', '--d-text-3xl': '2rem', '--d-text-4xl': '2.5rem',
    '--d-lh-none': '1', '--d-lh-tight': '1.1', '--d-lh-snug': '1.25', '--d-lh-normal': '1.5', '--d-lh-relaxed': '1.6', '--d-lh-loose': '1.75',
    '--d-fw-heading': '700', '--d-fw-title': '600', '--d-fw-medium': '500', '--d-ls-heading': '-0.015em',
    '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem', '--d-sp-2-5': '0.625rem', '--d-sp-3': '0.75rem', '--d-sp-4': '1rem', '--d-sp-5': '1.25rem',
    '--d-sp-6': '1.5rem', '--d-sp-8': '2rem', '--d-sp-10': '2.5rem', '--d-sp-12': '3rem', '--d-sp-16': '4rem'
  },
  global: 'body{font-family:var(--d-font)}',
  components: {
    button: [
      '.d-btn{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn-default{background:color-mix(in srgb,var(--c2) 40%,transparent);border-color:color-mix(in srgb,var(--c3) 8%,transparent);color:var(--c3)}',
      '.d-btn:hover{background:color-mix(in srgb,var(--c2) 60%,transparent);box-shadow:0 12px 40px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.08);transform:translateY(-2px)}',
      '.d-btn:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px rgba(0,0,0,0.2)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:color-mix(in srgb,var(--c1) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c1) 25%,transparent),0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-btn-primary:hover{background:color-mix(in srgb,var(--c6) 90%,transparent);box-shadow:0 0 32px color-mix(in srgb,var(--c1) 40%,transparent),0 14px 44px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.2);transform:translateY(-2px)}',
      '.d-btn-primary:active{transform:translateY(0) scale(0.97);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 15%,transparent),0 4px 16px rgba(0,0,0,0.2)}',
      '.d-btn-secondary{background:color-mix(in srgb,var(--c4) 15%,transparent);border-color:color-mix(in srgb,var(--c3) 8%,transparent)}',
      '.d-btn-secondary:hover{background:color-mix(in srgb,var(--c4) 25%,transparent);transform:translateY(-2px)}',
      '.d-btn-destructive{background:color-mix(in srgb,var(--c9) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c9) 30%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c9) 20%,transparent),0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12)}',
      '.d-btn-destructive:hover{background:color-mix(in srgb,var(--c9) 95%,transparent);box-shadow:0 0 32px color-mix(in srgb,var(--c9) 35%,transparent),0 14px 44px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-2px)}',
      '.d-btn-destructive:active{transform:translateY(0) scale(0.97);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 10%,transparent),0 4px 16px rgba(0,0,0,0.2)}',
      '.d-btn-success{background:color-mix(in srgb,var(--c7) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c7) 30%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c7) 20%,transparent),0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 95%,transparent);box-shadow:0 0 32px color-mix(in srgb,var(--c7) 35%,transparent),0 14px 44px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-2px)}',
      '.d-btn-success:active{transform:translateY(0) scale(0.97);box-shadow:0 0 12px color-mix(in srgb,var(--c7) 10%,transparent),0 4px 16px rgba(0,0,0,0.2)}',
      '.d-btn-warning{background:color-mix(in srgb,var(--c8) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c8) 30%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c8) 20%,transparent),0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 95%,transparent);box-shadow:0 0 32px color-mix(in srgb,var(--c8) 35%,transparent),0 14px 44px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-2px)}',
      '.d-btn-warning:active{transform:translateY(0) scale(0.97);box-shadow:0 0 12px color-mix(in srgb,var(--c8) 10%,transparent),0 4px 16px rgba(0,0,0,0.2)}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1);box-shadow:none;backdrop-filter:none}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 10%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c1) 25%,transparent);transform:translateY(-2px)}',
      '.d-btn-outline:active{transform:translateY(0) scale(0.97);box-shadow:none}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none}',
      '.d-btn-ghost:hover{background:color-mix(in srgb,var(--c3) 8%,transparent);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;backdrop-filter:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-btn-group>.d-btn{border-color:color-mix(in srgb,var(--c3) 8%,transparent)}',
      '.d-btn-group>.d-btn:not(:first-child){border-left-color:color-mix(in srgb,var(--c3) 4%,transparent)}'
    ].join(''),
    spinner: [
      '.d-spinner{color:var(--c1);filter:drop-shadow(0 0 3px color-mix(in srgb,var(--c1) 35%,transparent))}',
      '.d-btn-primary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:#fff}',
      '.d-btn-outline .d-spinner{color:var(--c1)}'
    ].join(''),
    card: [
      '.d-card{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 20px 56px rgba(0,0,0,0.35),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 0 rgba(255,255,255,0.08);transform:translateY(-4px)}',
      '.d-card-footer{border-top:1px solid color-mix(in srgb,var(--c5) 40%,transparent)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06);transition:var(--d-transition)}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 2px rgba(0,0,0,0.1);transform:translateY(-1px)}',
      '.d-input{color:var(--c3)}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 15%,transparent),0 0 20px color-mix(in srgb,var(--c9) 10%,transparent),inset 0 1px 2px rgba(0,0,0,0.1)}'
    ].join(''),
    badge: [
      '.d-badge{background:color-mix(in srgb,var(--c1) 80%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:9999px;border:1px solid color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-badge-dot{background:var(--c1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}',
      '@keyframes d-pulse{0%,100%{opacity:1;box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}50%{opacity:0.5;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 70%,transparent)}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      'dialog.d-modal-content::backdrop{background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.d-modal-content{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 24px 64px rgba(0,0,0,0.4),0 0 20px color-mix(in srgb,var(--c1) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);color:var(--c3);animation:d-scale-in 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '.d-modal-header{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
      '.d-modal-close{background:color-mix(in srgb,var(--c3) 8%,transparent);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:var(--d-text-xl);line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 15%,transparent)}',
      '@keyframes d-scale-in{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 2px rgba(0,0,0,0.1);transform:translateY(-1px)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 15%,transparent),0 0 20px color-mix(in srgb,var(--c9) 10%,transparent),inset 0 1px 2px rgba(0,0,0,0.1)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{color:var(--c3)}',
      '.d-checkbox-check{border-radius:4px;border:1px solid color-mix(in srgb,var(--c3) 12%,transparent);background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06);transition:var(--d-transition)}',
      '.d-checkbox:has(:checked) .d-checkbox-check{background:color-mix(in srgb,var(--c1) 85%,transparent);border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.15);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent)}'
    ].join(''),
    switch: [
      '.d-switch-track{width:40px;height:22px;border-radius:11px;background:color-mix(in srgb,var(--c4) 25%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);box-shadow:inset 0 1px 3px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.04);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);position:absolute;top:1px;left:1px;transition:var(--d-transition)}',
      '.d-switch:has(:checked) .d-switch-track{background:color-mix(in srgb,var(--c1) 85%,transparent);border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.08)}',
      '.d-switch:has(:checked) .d-switch-thumb{left:19px;box-shadow:0 2px 8px rgba(0,0,0,0.25),0 0 8px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent)}'
    ].join(''),
    select: [
      '.d-select{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06);color:var(--c3);padding:var(--d-sp-2) var(--d-sp-3);transition:var(--d-transition);cursor:pointer}',
      '.d-select:focus-visible{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent);outline:none}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-dropdown{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 40px rgba(0,0,0,0.35),0 0 20px color-mix(in srgb,var(--c1) 6%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);margin-top:4px;overflow:hidden}',
      '.d-select-option{color:var(--c3);cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option-highlight{background:color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-select-option-active{background:color-mix(in srgb,var(--c1) 80%,transparent);color:#fff}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 15%,transparent),0 0 20px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{border-bottom:1px solid color-mix(in srgb,var(--c5) 40%,transparent)}',
      '.d-tab{color:var(--c4);border-bottom:2px solid transparent;transition:var(--d-transition);border-radius:var(--d-radius) var(--d-radius) 0 0;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '.d-tab:hover{color:var(--c3);background:color-mix(in srgb,var(--c2) 40%,transparent)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1);background:color-mix(in srgb,var(--c1) 8%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.06)}',
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);margin-bottom:var(--d-sp-2);overflow:hidden}',
      '.d-accordion-trigger{color:var(--c3);transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:color-mix(in srgb,var(--c2) 80%,transparent)}',
      '.d-accordion-content{padding:0 var(--d-sp-5) var(--d-sp-4);color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator-line{background:color-mix(in srgb,var(--c5) 50%,transparent);box-shadow:0 1px 0 rgba(255,255,255,0.03)}',
      '.d-separator-label{color:var(--c4)}',
      '.d-separator-vertical{background:color-mix(in srgb,var(--c5) 50%,transparent);box-shadow:1px 0 0 rgba(255,255,255,0.03)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c4);text-decoration:none;transition:var(--d-transition);padding:0.25rem 0.375rem;border-radius:var(--d-radius)}',
      '.d-breadcrumb-link:hover{color:var(--c1);background:color-mix(in srgb,var(--c1) 10%,transparent);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 var(--d-sp-1)}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:500}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);overflow:hidden}',
      '.d-th{padding:var(--d-sp-3) var(--d-sp-4);text-align:left;font-weight:var(--d-fw-title);color:var(--c3);border-bottom:1px solid color-mix(in srgb,var(--c5) 40%,transparent);background:color-mix(in srgb,var(--c2) 80%,transparent)}',
      '.d-td{padding:var(--d-sp-3) var(--d-sp-4);color:var(--c3);border-bottom:1px solid color-mix(in srgb,var(--c5) 25%,transparent)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:color-mix(in srgb,var(--c2) 40%,transparent)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 6%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--c1) 80%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:2px solid color-mix(in srgb,var(--c3) 8%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 15%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center}',
      '.d-avatar-fallback{color:#fff;font-weight:var(--d-fw-title);font-size:var(--d-text-base)}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:8px;border-radius:4px;background:color-mix(in srgb,var(--c2) 50%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid color-mix(in srgb,var(--c3) 6%,transparent);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)}',
      '.d-progress-bar{height:100%;border-radius:4px;background:color-mix(in srgb,var(--c1) 85%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15);transition:width 0.4s cubic-bezier(0.4,0,0.2,1)}',
      '.d-progress-success .d-progress-bar{background:color-mix(in srgb,var(--c7) 85%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c7) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-progress-warning .d-progress-bar{background:color-mix(in srgb,var(--c8) 85%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c8) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-progress-error .d-progress-bar{background:color-mix(in srgb,var(--c9) 85%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-progress-striped .d-progress-bar{background-image:linear-gradient(45deg,rgba(255,255,255,0.1) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.1) 75%,transparent 75%,transparent);background-size:1rem 1rem}'
    ].join(''),
    skeleton: [
      '.d-skeleton{background:color-mix(in srgb,var(--c2) 60%,transparent);background-image:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c1) 4%,transparent),transparent);background-size:200% 100%;border-radius:var(--d-radius);animation:d-shimmer 1.5s ease-in-out infinite}',
      '@keyframes d-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:color-mix(in srgb,var(--c3) 85%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--c0);padding:0.375rem 0.625rem;border-radius:var(--d-radius);font-size:var(--d-text-sm);box-shadow:0 8px 24px rgba(0,0,0,0.3),0 0 12px color-mix(in srgb,var(--c1) 8%,transparent);border:1px solid color-mix(in srgb,var(--c3) 12%,transparent)}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.875rem var(--d-sp-4);border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:var(--c3);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06)}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 10%,transparent);border-color:color-mix(in srgb,var(--c1) 20%,transparent);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 6%,transparent)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 10%,transparent);border-color:color-mix(in srgb,var(--c7) 20%,transparent);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c7) 6%,transparent)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 10%,transparent);border-color:color-mix(in srgb,var(--c8) 20%,transparent);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c8) 6%,transparent)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 10%,transparent);border-color:color-mix(in srgb,var(--c9) 20%,transparent);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c9) 6%,transparent)}',
      '.d-alert-dismiss{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-alert-dismiss:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 10%,transparent)}'
    ].join(''),
    chip: [
      '.d-chip{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);color:var(--c3);box-shadow:0 2px 8px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.06);transition:var(--d-transition)}',
      '.d-chip-outline{background:transparent;border:1px solid color-mix(in srgb,var(--c3) 12%,transparent);box-shadow:none}',
      '.d-chip-filled{background:color-mix(in srgb,var(--c1) 80%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 0 rgba(255,255,255,0.12)}',
      '.d-chip-selected{background:color-mix(in srgb,var(--c1) 12%,transparent);border-color:color-mix(in srgb,var(--c1) 25%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-chip-interactive:hover{background:color-mix(in srgb,var(--c2) 60%,transparent);box-shadow:0 4px 16px rgba(0,0,0,0.25),0 0 12px color-mix(in srgb,var(--c1) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.08);transform:translateY(-1px)}',
      '.d-chip-interactive:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-chip-remove{color:var(--c4)}',
      '.d-chip-remove:hover{color:var(--c9)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem var(--d-sp-4);border-radius:var(--d-radius);background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);color:var(--c3);box-shadow:0 12px 40px rgba(0,0,0,0.35),0 0 16px color-mix(in srgb,var(--c1) 6%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);animation:d-toast-in 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '.d-toast-info{border-left:3px solid var(--c1)}',
      '.d-toast-success{border-left:3px solid var(--c7)}',
      '.d-toast-warning{border-left:3px solid var(--c8)}',
      '.d-toast-error{border-left:3px solid var(--c9)}',
      '.d-toast-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-toast-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 10%,transparent)}',
      '@keyframes d-toast-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}'
    ].join(''),
    dropdown: [
      '.d-dropdown-menu{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 12px color-mix(in srgb,var(--c1) 5%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);overflow:hidden}',
      '.d-dropdown-item{color:var(--c3);transition:var(--d-transition)}',
      '.d-dropdown-item:hover,.d-dropdown-item-highlight{background:color-mix(in srgb,var(--c1) 8%,transparent)}',
      '.d-dropdown-item-shortcut{color:var(--c4)}',
      '.d-dropdown-separator{background:color-mix(in srgb,var(--c3) 8%,transparent)}'
    ].join(''),
    drawer: [
      'dialog.d-drawer::backdrop{background:rgba(0,0,0,0.4)}',
      '.d-drawer-panel{background:color-mix(in srgb,var(--c2) 85%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 20px color-mix(in srgb,var(--c1) 6%,transparent);color:var(--c3)}',
      '.d-drawer-left{animation:d-drawer-left 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-drawer-right{animation:d-drawer-right 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-drawer-close{color:var(--c4);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-drawer-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 10%,transparent)}',
      '@keyframes d-drawer-left{from{transform:translateX(-100%)}to{transform:translateX(0)}}',
      '@keyframes d-drawer-right{from{transform:translateX(100%)}to{transform:translateX(0)}}'
    ].join(''),
    pagination: [
      '.d-pagination-btn{border-radius:var(--d-radius);color:var(--c4);transition:var(--d-transition)}',
      '.d-pagination-btn:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);color:var(--c3)}',
      '.d-pagination-active{background:color-mix(in srgb,var(--c1) 85%,transparent);color:#fff;font-weight:600;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-pagination-active:hover{box-shadow:0 0 24px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-pagination-ellipsis{color:var(--c4)}'
    ].join(''),
    radiogroup: [
      '.d-radio-indicator{border:1px solid color-mix(in srgb,var(--c3) 12%,transparent);background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);transition:var(--d-transition)}',
      '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--c1);box-shadow:0 0 10px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-radio-dot{background:var(--c1);box-shadow:0 0 6px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-radio-label{color:var(--c3)}',
      '.d-radio-native:focus-visible~.d-radio-indicator{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    popover: [
      '.d-popover-content{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 12px color-mix(in srgb,var(--c1) 5%,transparent),inset 0 1px 0 rgba(255,255,255,0.06);color:var(--c3)}'
    ].join(''),
    combobox: [
      '.d-combobox-input-wrap{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06);transition:var(--d-transition)}',
      '.d-combobox-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 15%,transparent),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 2px rgba(0,0,0,0.1);transform:translateY(-1px)}',
      '.d-combobox-input{color:var(--c3)}',
      '.d-combobox-input::placeholder{color:var(--c4)}',
      '.d-combobox-arrow{color:var(--c4)}',
      '.d-combobox-listbox{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);border-radius:var(--d-radius);box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06)}',
      '.d-combobox-option{color:var(--c3);transition:var(--d-transition)}',
      '.d-combobox-option-highlight,.d-combobox-option:hover{background:color-mix(in srgb,var(--c1) 8%,transparent)}',
      '.d-combobox-option-active{background:color-mix(in srgb,var(--c1) 80%,transparent);color:#fff}',
      '.d-combobox-empty{color:var(--c4)}',
      '.d-combobox-error .d-combobox-input-wrap{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 15%,transparent),0 0 12px color-mix(in srgb,var(--c9) 8%,transparent)}'
    ].join(''),
    slider: [
      '.d-slider-track{background:color-mix(in srgb,var(--c2) 50%,transparent);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '.d-slider-fill{background:color-mix(in srgb,var(--c1) 85%,transparent);box-shadow:0 0 10px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-slider-thumb{background:color-mix(in srgb,var(--c2) 60%,transparent);border:2px solid var(--c1);box-shadow:0 0 10px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:var(--d-transition)}',
      '.d-slider-thumb:hover{box-shadow:0 0 16px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.12);transform:translate(-50%,-50%) scale(1.1)}',
      '.d-slider-active .d-slider-thumb{box-shadow:0 0 20px color-mix(in srgb,var(--c1) 40%,transparent)}',
      '.d-slider-value{color:var(--c3)}'
    ].join(''),
    chart: [
      ':root{--d-chart-0:#38BDF8;--d-chart-1:#22D3EE;--d-chart-2:var(--c8);--d-chart-3:var(--c9);--d-chart-4:color-mix(in srgb,#38BDF8 60%,#22D3EE);--d-chart-5:color-mix(in srgb,var(--c8) 60%,var(--c9));--d-chart-6:color-mix(in srgb,var(--c1) 50%,var(--c4));--d-chart-7:var(--c6);--d-chart-tooltip-bg:color-mix(in srgb,var(--c2) 60%,transparent)}',
      '.d-chart-line{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--c1) 35%,transparent))}',
      '.d-chart-tooltip{background:var(--d-chart-tooltip-bg);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);box-shadow:0 4px 16px rgba(0,0,0,0.4);border-radius:var(--d-radius);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.d-chart-grid line{stroke:color-mix(in srgb,var(--c3) 8%,transparent)}',
      '.d-chart-area{opacity:0.18}'
    ].join('')
  }
};
