export const hotLava = {
  id: 'hot-lava',
  name: 'Hot Lava',
  colors: {
    '--c0': '#050810',
    '--c1': '#ff4d4d',
    '--c2': '#0a0f1a',
    '--c3': '#f0f4ff',
    '--c4': '#8892b0',
    '--c5': 'rgba(136,146,176,0.15)',
    '--c6': '#e63946',
    '--c7': '#00e5cc',
    '--c8': '#fbbf24',
    '--c9': '#ef4444'
  },
  meta: {
    isDark: true,
    contrastText: '#ffffff',
    surfaceAlpha: 'rgba(10,15,26,0.9)'
  },
  tokens: {
    '--d-radius': '12px',
    '--d-radius-lg': '16px',
    '--d-shadow': '0 4px 24px rgba(255,77,77,0.15),0 2px 8px rgba(0,0,0,0.3)',
    '--d-transition': 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
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
  global: '@keyframes d-gradient-text{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}body{font-family:var(--d-font)}',
  components: {
    button: [
      '.d-btn{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn-default{background:color-mix(in srgb,var(--c2) 60%,transparent);border-color:color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c3)}',
      '.d-btn:hover{background:color-mix(in srgb,var(--c2) 70%,transparent);box-shadow:0 8px 32px rgba(255,77,77,0.25),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-2px)}',
      '.d-btn:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 8px rgba(255,77,77,0.1),0 1px 4px rgba(0,0,0,0.2)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c1) 30%,transparent),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-btn-primary:hover{background:linear-gradient(135deg,var(--c6),var(--c1));box-shadow:0 8px 40px color-mix(in srgb,var(--c1) 45%,transparent),0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.2);transform:translateY(-3px)}',
      '.d-btn-primary:active{background:linear-gradient(135deg,color-mix(in srgb,var(--c1) 80%,#000),var(--c1));transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-btn-secondary{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-color:var(--c5)}',
      '.d-btn-secondary:hover{background:color-mix(in srgb,var(--c2) 70%,transparent);border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 8px 32px rgba(255,77,77,0.15),inset 0 1px 0 rgba(255,255,255,0.1);transform:translateY(-2px)}',
      '.d-btn-destructive{background:linear-gradient(135deg,var(--c9),color-mix(in srgb,var(--c9) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c9) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c9) 25%,transparent),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-btn-destructive:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c9) 90%,#fff),var(--c9));box-shadow:0 8px 40px color-mix(in srgb,var(--c9) 40%,transparent),0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-3px)}',
      '.d-btn-destructive:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c9) 15%,transparent)}',
      '.d-btn-success{background:linear-gradient(135deg,var(--c7),color-mix(in srgb,var(--c7) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c7) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c7) 20%,transparent),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-btn-success:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c7) 90%,#fff),var(--c7));box-shadow:0 8px 40px color-mix(in srgb,var(--c7) 35%,transparent),0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-3px)}',
      '.d-btn-success:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c7) 15%,transparent)}',
      '.d-btn-warning{background:linear-gradient(135deg,var(--c8),color-mix(in srgb,var(--c8) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c8) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c8) 20%,transparent),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-btn-warning:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c8) 90%,#fff),var(--c8));box-shadow:0 8px 40px color-mix(in srgb,var(--c8) 35%,transparent),0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-3px)}',
      '.d-btn-warning:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c8) 15%,transparent)}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1);box-shadow:none;backdrop-filter:none}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 10%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c1) 20%,transparent),0 4px 16px rgba(0,0,0,0.2);transform:translateY(-2px)}',
      '.d-btn-outline:active{transform:translateY(1px) scale(0.97);box-shadow:none}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none}',
      '.d-btn-ghost:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;backdrop-filter:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-btn-group>.d-btn{border-color:color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-btn-group>.d-btn:not(:first-child){border-left-color:color-mix(in srgb,var(--c1) 10%,transparent)}'
    ].join(''),
    spinner: [
      '.d-spinner{color:var(--c1);filter:drop-shadow(0 0 4px color-mix(in srgb,var(--c1) 40%,transparent))}',
      '.d-btn-primary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:#fff}',
      '.d-btn-outline .d-spinner{color:var(--c1)}'
    ].join(''),
    card: [
      '.d-card{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 4px 24px color-mix(in srgb,var(--c1) 15%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 12px 48px color-mix(in srgb,var(--c1) 25%,transparent),0 4px 16px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-4px);border-color:color-mix(in srgb,var(--c1) 35%,transparent)}',
      '.d-card-footer{border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.05);transition:var(--d-transition)}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-input{color:var(--c3)}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:9999px;border:1px solid color-mix(in srgb,var(--c1) 40%,transparent);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-badge-dot{background:var(--c1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}',
      '@keyframes d-ember-pulse{0%,100%{box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}50%{box-shadow:0 0 16px color-mix(in srgb,var(--c1) 80%,transparent),0 0 4px color-mix(in srgb,var(--c1) 30%,transparent)}}',
      '.d-badge-processing .d-badge-dot{animation:d-ember-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      'dialog.d-modal-content::backdrop{background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.d-modal-content{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 24px 80px rgba(0,0,0,0.4),0 0 40px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);animation:d-lava-rise 0.35s cubic-bezier(0.22,1,0.36,1)}',
      '.d-modal-header{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
      '.d-modal-footer{border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-modal-close{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:var(--d-text-xl);line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}',
      '@keyframes d-lava-rise{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.05);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;resize:vertical;min-height:80px}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{transition:var(--d-transition)}',
      '.d-checkbox:hover{transform:translateY(-1px)}',
      '.d-checkbox-check{width:20px;height:20px;border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:calc(var(--d-radius) * 0.4);background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:var(--d-transition);box-shadow:inset 0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.05)}',
      '.d-checkbox:has(:checked) .d-checkbox-check{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:12px;background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:var(--d-transition);position:relative;box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.05)}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#fff,#e0e0e0);position:absolute;top:2px;left:3px;transition:var(--d-transition);box-shadow:0 2px 6px rgba(0,0,0,0.2)}',
      '.d-switch:has(:checked) .d-switch-track{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 0 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-switch:has(:checked) .d-switch-thumb{left:22px;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    select: [
      '.d-select{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.05);color:var(--c3);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;transition:var(--d-transition)}',
      '.d-select:hover{border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-dropdown{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 40px rgba(0,0,0,0.3),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);margin-top:4px;overflow:hidden}',
      '.d-select-option{cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option:hover{background:color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-option-active{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff}',
      '.d-select-option-highlight{background:color-mix(in srgb,var(--c1) 8%,transparent)}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{border-bottom:1px solid color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-tab{border-bottom:2px solid transparent;color:var(--c4);transition:var(--d-transition);border-radius:var(--d-radius) var(--d-radius) 0 0;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);position:relative}',
      '.d-tab:hover{color:var(--c3);background:color-mix(in srgb,var(--c1) 5%,transparent);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1);background:color-mix(in srgb,var(--c1) 8%,transparent);text-shadow:0 0 12px color-mix(in srgb,var(--c1) 25%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}',
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);margin-bottom:var(--d-sp-2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);overflow:hidden;background:linear-gradient(145deg,color-mix(in srgb,var(--c2) 60%,transparent),color-mix(in srgb,var(--c2) 40%,transparent));backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
      '.d-accordion-trigger{padding:var(--d-sp-3) var(--d-sp-4);color:var(--c3);font-weight:var(--d-fw-title);transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-accordion-content{padding:var(--d-sp-3) var(--d-sp-4);border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent);background:color-mix(in srgb,var(--c0) 80%,var(--c2))}'
    ].join(''),
    separator: [
      '.d-separator{margin:var(--d-sp-4) 0}',
      '.d-separator-line{background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c1) 20%,transparent),transparent)}',
      '.d-separator-label{color:var(--c4);font-size:0.85rem}',
      '.d-separator-vertical{align-self:stretch;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--c1) 20%,transparent),transparent);margin:0 var(--d-sp-4)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);text-decoration:none;cursor:pointer;transition:var(--d-transition);font-weight:500;padding:0.25rem 0.375rem;border-radius:var(--d-radius)}',
      '.d-breadcrumb-link:hover{color:var(--c6);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 25%,transparent);background:color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 var(--d-sp-2)}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:var(--d-fw-title)}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);overflow:hidden}',
      '.d-th{background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),color-mix(in srgb,var(--c2) 60%,transparent));color:var(--c3);font-weight:var(--d-fw-title);text-align:left;padding:var(--d-sp-3) var(--d-sp-4);border-bottom:1px solid color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-td{padding:var(--d-sp-3) var(--d-sp-4);border-bottom:1px solid color-mix(in srgb,var(--c1) 8%,transparent);color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:color-mix(in srgb,var(--c1) 3%,transparent)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);box-shadow:inset 0 0 20px color-mix(in srgb,var(--c1) 5%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c1) 30%,transparent);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),color-mix(in srgb,var(--c2) 60%,transparent));backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 15%,transparent),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-avatar img{width:100%;height:100%;object-fit:cover}',
      '.d-avatar-fallback{font-weight:var(--d-fw-title);color:var(--c1);font-size:var(--d-text-md);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:10px;background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid color-mix(in srgb,var(--c1) 10%,transparent);border-radius:9999px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.15)}',
      '.d-progress-bar{height:100%;background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-radius:9999px;transition:width 0.4s cubic-bezier(0.22,1,0.36,1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-success .d-progress-bar{background:linear-gradient(135deg,var(--c7),color-mix(in srgb,var(--c7) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c7) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-warning .d-progress-bar{background:linear-gradient(135deg,var(--c8),color-mix(in srgb,var(--c8) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c8) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-error .d-progress-bar{background:linear-gradient(135deg,var(--c9),color-mix(in srgb,var(--c9) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c9) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '@keyframes d-lava-stripe{0%{background-position:0 0}100%{background-position:20px 0}}',
      '.d-progress-striped .d-progress-bar{background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.1) 5px,rgba(255,255,255,0.1) 10px);animation:d-lava-stripe 0.8s linear infinite}'
    ].join(''),
    skeleton: [
      '@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
      '.d-skeleton{background:color-mix(in srgb,var(--c2) 60%,transparent);background-image:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c1) 8%,transparent),transparent);background-size:200% 100%;animation:d-shimmer 2s ease-in-out infinite;border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c1) 8%,transparent)}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:color-mix(in srgb,var(--c3) 90%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--c0);padding:0.375rem 0.75rem;border-radius:var(--d-radius);font-size:0.8rem;box-shadow:0 4px 16px rgba(0,0,0,0.3),0 0 8px color-mix(in srgb,var(--c1) 15%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    alert: [
      '.d-alert{padding:var(--d-sp-3) var(--d-sp-4);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:var(--d-transition)}',
      '.d-alert-info{border-color:color-mix(in srgb,var(--c1) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c1)),color-mix(in srgb,var(--c0) 80%,transparent));box-shadow:0 4px 24px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-alert-success{border-color:color-mix(in srgb,var(--c7) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c7)),color-mix(in srgb,var(--c0) 80%,transparent));box-shadow:0 4px 24px color-mix(in srgb,var(--c7) 10%,transparent)}',
      '.d-alert-warning{border-color:color-mix(in srgb,var(--c8) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c8)),color-mix(in srgb,var(--c0) 80%,transparent));box-shadow:0 4px 24px color-mix(in srgb,var(--c8) 10%,transparent)}',
      '.d-alert-error{border-color:color-mix(in srgb,var(--c9) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c9)),color-mix(in srgb,var(--c0) 80%,transparent));box-shadow:0 4px 24px color-mix(in srgb,var(--c9) 10%,transparent)}',
      '.d-alert-dismiss{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:var(--d-text-md);line-height:1;border-radius:var(--d-radius);transition:var(--d-transition);margin-left:auto}',
      '.d-alert-dismiss:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}'
    ].join(''),
    chip: [
      '.d-chip{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c3);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 0 rgba(255,255,255,0.08);transition:var(--d-transition)}',
      '.d-chip-outline{background:transparent;border:1px solid color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:none}',
      '.d-chip-filled{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c1) 40%,transparent);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-chip-selected{background:color-mix(in srgb,var(--c1) 15%,transparent);border-color:var(--c1);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-chip-interactive:hover{background:color-mix(in srgb,var(--c2) 70%,transparent);box-shadow:0 4px 20px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);transform:translateY(-2px)}',
      '.d-chip-interactive:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-chip-remove{color:var(--c4)}',
      '.d-chip-remove:hover{color:var(--c9);text-shadow:0 0 8px color-mix(in srgb,var(--c9) 30%,transparent)}'
    ].join(''),
    toast: [
      '@keyframes d-toast-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}',
      '.d-toast{padding:var(--d-sp-3) var(--d-sp-4);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:var(--d-transition);animation:d-toast-in 0.35s cubic-bezier(0.22,1,0.36,1)}',
      '.d-toast-info{border-color:color-mix(in srgb,var(--c1) 30%,transparent);border-left:4px solid var(--c1);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-toast-success{border-color:color-mix(in srgb,var(--c7) 30%,transparent);border-left:4px solid var(--c7);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c7) 15%,transparent)}',
      '.d-toast-warning{border-color:color-mix(in srgb,var(--c8) 30%,transparent);border-left:4px solid var(--c8);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c8) 15%,transparent)}',
      '.d-toast-error{border-color:color-mix(in srgb,var(--c9) 30%,transparent);border-left:4px solid var(--c9);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c9) 15%,transparent)}',
      '.d-toast-close{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:var(--d-text-md);line-height:1;border-radius:var(--d-radius);transition:var(--d-transition);margin-left:auto}',
      '.d-toast-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}'
    ].join(''),
    dropdown: [
      '.d-dropdown-menu{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.08);overflow:hidden}',
      '.d-dropdown-item{color:var(--c3);transition:var(--d-transition)}',
      '.d-dropdown-item:hover,.d-dropdown-item-highlight{background:color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-dropdown-item-shortcut{color:var(--c4)}',
      '.d-dropdown-separator{background:color-mix(in srgb,var(--c1) 15%,transparent)}'
    ].join(''),
    drawer: [
      'dialog.d-drawer::backdrop{background:rgba(0,0,0,0.5)}',
      '.d-drawer-panel{background:color-mix(in srgb,var(--c2) 80%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 24px color-mix(in srgb,var(--c1) 10%,transparent);color:var(--c3)}',
      '.d-drawer-left{animation:d-drawer-left 0.3s cubic-bezier(0.22,1,0.36,1)}',
      '.d-drawer-right{animation:d-drawer-right 0.3s cubic-bezier(0.22,1,0.36,1)}',
      '.d-drawer-close{color:var(--c4);background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-drawer-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}',
      '@keyframes d-drawer-left{from{transform:translateX(-100%)}to{transform:translateX(0)}}',
      '@keyframes d-drawer-right{from{transform:translateX(100%)}to{transform:translateX(0)}}'
    ].join(''),
    pagination: [
      '.d-pagination-btn{border-radius:var(--d-radius);color:var(--c4);transition:var(--d-transition)}',
      '.d-pagination-btn:hover{background:color-mix(in srgb,var(--c1) 10%,transparent);color:var(--c3);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-pagination-active{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff;font-weight:600;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-pagination-active:hover{box-shadow:0 0 24px color-mix(in srgb,var(--c1) 35%,transparent)}',
      '.d-pagination-ellipsis{color:var(--c4)}'
    ].join(''),
    radiogroup: [
      '.d-radio-indicator{border:1px solid color-mix(in srgb,var(--c1) 25%,transparent);background:color-mix(in srgb,var(--c2) 50%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:inset 0 1px 2px rgba(0,0,0,0.15);transition:var(--d-transition)}',
      '.d-radio:has(:checked) .d-radio-indicator{border-color:var(--c1);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-radio-dot{background:var(--c1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 40%,transparent)}',
      '.d-radio-label{color:var(--c3)}',
      '.d-radio-native:focus-visible~.d-radio-indicator{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    popover: [
      '.d-popover-content{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.08);color:var(--c3)}'
    ].join(''),
    combobox: [
      '.d-combobox-input-wrap{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.05);transition:var(--d-transition)}',
      '.d-combobox-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-combobox-input{color:var(--c3)}',
      '.d-combobox-input::placeholder{color:var(--c4)}',
      '.d-combobox-arrow{color:var(--c4)}',
      '.d-combobox-listbox{background:color-mix(in srgb,var(--c2) 60%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 8%,transparent)}',
      '.d-combobox-option{color:var(--c3);transition:var(--d-transition)}',
      '.d-combobox-option-highlight,.d-combobox-option:hover{background:color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-combobox-option-active{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff}',
      '.d-combobox-empty{color:var(--c4)}',
      '.d-combobox-error .d-combobox-input-wrap{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),0 0 12px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    slider: [
      '.d-slider-track{background:color-mix(in srgb,var(--c2) 60%,transparent);border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '.d-slider-fill{background:linear-gradient(90deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));box-shadow:0 0 12px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-slider-thumb{background:color-mix(in srgb,var(--c2) 80%,transparent);border:2px solid var(--c1);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.15);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:var(--d-transition)}',
      '.d-slider-thumb:hover{box-shadow:0 0 20px color-mix(in srgb,var(--c1) 35%,transparent),inset 0 1px 0 rgba(255,255,255,0.2);transform:translate(-50%,-50%) scale(1.1)}',
      '.d-slider-active .d-slider-thumb{box-shadow:0 0 24px color-mix(in srgb,var(--c1) 45%,transparent);transform:translate(-50%,-50%) scale(1.15)}',
      '.d-slider-value{color:var(--c3)}'
    ].join(''),
    chart: [
      ':root{--d-chart-0:#FF6B6B;--d-chart-1:#4ECDC4;--d-chart-2:#FFE66D;--d-chart-3:#FF8A5B;--d-chart-4:color-mix(in srgb,#FF6B6B 60%,#4ECDC4);--d-chart-5:color-mix(in srgb,#FFE66D 60%,#FF8A5B);--d-chart-6:color-mix(in srgb,var(--c1) 50%,var(--c4));--d-chart-7:var(--c6);--d-chart-tooltip-bg:color-mix(in srgb,var(--c2) 80%,transparent)}',
      '.d-chart-line{filter:drop-shadow(0 0 4px color-mix(in srgb,var(--c1) 30%,transparent))}',
      '.d-chart-tooltip{background:var(--d-chart-tooltip-bg);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);box-shadow:0 4px 16px rgba(0,0,0,0.3);border-radius:var(--d-radius);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.d-chart-grid line{stroke:var(--c5);stroke-opacity:0.2}',
      '.d-chart-area{opacity:0.2}'
    ].join('')
  }
};
