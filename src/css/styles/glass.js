export const glass = {
  id: 'glass',
  name: 'Glassmorphism',
  global: '--d-radius:12px;--d-radius-lg:16px;--d-shadow:0 8px 32px rgba(0,0,0,0.1);--d-transition:all 0.25s cubic-bezier(0.4,0,0.2,1);',
  components: {
    button: [
      '.d-btn{background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{background:color-mix(in srgb,var(--c2) 60%,transparent);box-shadow:0 12px 40px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-2px)}',
      '.d-btn:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px rgba(0,0,0,0.1)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:color-mix(in srgb,var(--c1) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 8px 32px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-btn-primary:hover{background:color-mix(in srgb,var(--c6) 90%,transparent);box-shadow:0 14px 44px color-mix(in srgb,var(--c1) 35%,transparent),inset 0 1px 0 rgba(255,255,255,0.25);transform:translateY(-3px)}',
      '.d-btn-primary:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-btn-secondary{background:color-mix(in srgb,var(--c4) 15%,transparent)}',
      '.d-btn-secondary:hover{background:color-mix(in srgb,var(--c4) 25%,transparent);transform:translateY(-2px)}',
      '.d-btn-destructive{background:color-mix(in srgb,var(--c9) 85%,transparent);color:#fff;border-color:transparent;box-shadow:0 8px 32px color-mix(in srgb,var(--c9) 20%,transparent)}',
      '.d-btn-destructive:hover{background:color-mix(in srgb,var(--c9) 95%,transparent);box-shadow:0 14px 44px color-mix(in srgb,var(--c9) 30%,transparent);transform:translateY(-3px)}',
      '.d-btn-destructive:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px color-mix(in srgb,var(--c9) 15%,transparent)}',
      '.d-btn-success{background:color-mix(in srgb,var(--c7) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c7) 30%,transparent);box-shadow:0 8px 32px color-mix(in srgb,var(--c7) 20%,transparent)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 95%,transparent);box-shadow:0 14px 44px color-mix(in srgb,var(--c7) 30%,transparent);transform:translateY(-3px)}',
      '.d-btn-success:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px color-mix(in srgb,var(--c7) 15%,transparent)}',
      '.d-btn-warning{background:color-mix(in srgb,var(--c8) 85%,transparent);color:#fff;border-color:color-mix(in srgb,var(--c8) 30%,transparent);box-shadow:0 8px 32px color-mix(in srgb,var(--c8) 20%,transparent)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 95%,transparent);box-shadow:0 14px 44px color-mix(in srgb,var(--c8) 30%,transparent);transform:translateY(-3px)}',
      '.d-btn-warning:active{transform:translateY(0) scale(0.97);box-shadow:0 4px 16px color-mix(in srgb,var(--c8) 15%,transparent)}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1);box-shadow:none;backdrop-filter:none}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 10%,transparent);box-shadow:0 8px 32px color-mix(in srgb,var(--c1) 15%,transparent);transform:translateY(-2px)}',
      '.d-btn-outline:active{transform:translateY(0) scale(0.97)}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none}',
      '.d-btn-ghost:hover{background:color-mix(in srgb,var(--c3) 8%,transparent);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;backdrop-filter:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:color-mix(in srgb,var(--c2) 50%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 20px 56px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-4px)}',
      '.d-card-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.5rem}',
      '.d-card-footer{padding:0 1.5rem 1.5rem;border-top:1px solid color-mix(in srgb,var(--c5) 30%,transparent)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:color-mix(in srgb,var(--c2) 30%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 2px rgba(0,0,0,0.06);transform:translateY(-1px)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 1px 2px rgba(0,0,0,0.06)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:color-mix(in srgb,var(--c1) 80%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:9999px;border:1px solid color-mix(in srgb,var(--c1) 30%,transparent);font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500;box-shadow:0 2px 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1);box-shadow:0 0 6px color-mix(in srgb,var(--c1) 40%,transparent)}',
      '@keyframes d-pulse{0%,100%{opacity:1;box-shadow:0 0 6px color-mix(in srgb,var(--c1) 40%,transparent)}50%{opacity:0.5;box-shadow:0 0 12px color-mix(in srgb,var(--c1) 60%,transparent)}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.25s ease}',
      '.d-modal-content{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 24px 64px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.1);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-scale-in 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '.d-modal-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.5rem}',
      '.d-modal-footer{padding:0 1.5rem 1.5rem;display:flex;justify-content:flex-end;gap:0.5rem}',
      '.d-modal-close{background:color-mix(in srgb,var(--c3) 8%,transparent);border:none;color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:1.25rem;line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 15%,transparent)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-scale-in{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:color-mix(in srgb,var(--c2) 30%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 1px 2px rgba(0,0,0,0.06);transform:translateY(-1px)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 1px 2px rgba(0,0,0,0.06)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;color:var(--c3)}',
      '.d-checkbox-check{width:18px;height:18px;border-radius:4px;border:1px solid color-mix(in srgb,var(--c3) 15%,transparent);background:color-mix(in srgb,var(--c2) 30%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 1px 2px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.1);transition:var(--d-transition);display:flex;align-items:center;justify-content:center}',
      '.d-checkbox-checked .d-checkbox-check{background:color-mix(in srgb,var(--c1) 85%,transparent);border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 2px 8px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.2);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    switch: [
      '.d-switch-track{width:40px;height:22px;border-radius:11px;background:color-mix(in srgb,var(--c4) 25%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.3);position:absolute;top:1px;left:1px;transition:var(--d-transition)}',
      '.d-switch-checked .d-switch-track{background:color-mix(in srgb,var(--c1) 85%,transparent);border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 2px 8px color-mix(in srgb,var(--c1) 25%,transparent),inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-switch-checked .d-switch-thumb{left:19px}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    select: [
      '.d-select{background:color-mix(in srgb,var(--c2) 30%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);color:var(--c3);padding:0.5rem 0.75rem;transition:var(--d-transition);cursor:pointer}',
      '.d-select:focus-visible{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent);outline:none}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-select-dropdown{background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 40px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.1);margin-top:4px;overflow:hidden}',
      '.d-select-option{padding:0.5rem 0.75rem;color:var(--c3);cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option-highlight{background:color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-select-option-active{background:color-mix(in srgb,var(--c1) 80%,transparent);color:#fff}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;border-bottom:1px solid color-mix(in srgb,var(--c5) 30%,transparent);gap:0.25rem}',
      '.d-tab{padding:0.625rem 1rem;color:var(--c4);cursor:pointer;border-bottom:2px solid transparent;transition:var(--d-transition);background:transparent;border-radius:var(--d-radius) var(--d-radius) 0 0;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '.d-tab:hover{color:var(--c3);background:color-mix(in srgb,var(--c2) 40%,transparent)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1);background:color-mix(in srgb,var(--c1) 8%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}',
      '.d-tabs-panel{padding:1rem 0}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius);background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);margin-bottom:0.5rem;overflow:hidden}',
      '.d-accordion-trigger{width:100%;padding:1rem 1.25rem;background:transparent;border:none;color:var(--c3);cursor:pointer;font:inherit;font-weight:500;display:flex;justify-content:space-between;align-items:center;transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:color-mix(in srgb,var(--c2) 60%,transparent)}',
      '.d-accordion-content{padding:0 1.25rem 1rem;color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem}',
      '.d-separator-line{flex:1;height:1px;background:color-mix(in srgb,var(--c5) 40%,transparent);box-shadow:0 1px 0 rgba(255,255,255,0.05)}',
      '.d-separator-label{color:var(--c4);font-size:0.75rem;font-weight:500}',
      '.d-separator-vertical{width:1px;height:100%;background:color-mix(in srgb,var(--c5) 40%,transparent);box-shadow:1px 0 0 rgba(255,255,255,0.05)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c4);text-decoration:none;transition:var(--d-transition);padding:0.25rem 0.375rem;border-radius:var(--d-radius)}',
      '.d-breadcrumb-link:hover{color:var(--c1);background:color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 0.25rem}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:500}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);overflow:hidden}',
      '.d-th{padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--c3);border-bottom:1px solid color-mix(in srgb,var(--c5) 30%,transparent);background:color-mix(in srgb,var(--c2) 60%,transparent)}',
      '.d-td{padding:0.75rem 1rem;color:var(--c3);border-bottom:1px solid color-mix(in srgb,var(--c5) 20%,transparent)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:color-mix(in srgb,var(--c2) 30%,transparent)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 8%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--c1) 80%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:2px solid color-mix(in srgb,var(--c3) 10%,transparent);box-shadow:0 4px 12px color-mix(in srgb,var(--c1) 15%,transparent),inset 0 1px 0 rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center}',
      '.d-avatar-fallback{color:#fff;font-weight:600;font-size:0.875rem}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:8px;border-radius:4px;background:color-mix(in srgb,var(--c2) 40%,transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid color-mix(in srgb,var(--c3) 8%,transparent);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.06)}',
      '.d-progress-bar{height:100%;border-radius:4px;background:color-mix(in srgb,var(--c1) 85%,transparent);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2);transition:width 0.4s cubic-bezier(0.4,0,0.2,1)}',
      '.d-progress-success .d-progress-bar{background:color-mix(in srgb,var(--c7) 85%,transparent);box-shadow:0 0 8px color-mix(in srgb,var(--c7) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-warning .d-progress-bar{background:color-mix(in srgb,var(--c8) 85%,transparent);box-shadow:0 0 8px color-mix(in srgb,var(--c8) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-error .d-progress-bar{background:color-mix(in srgb,var(--c9) 85%,transparent);box-shadow:0 0 8px color-mix(in srgb,var(--c9) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-progress-striped .d-progress-bar{background-image:linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-size:1rem 1rem}'
    ].join(''),
    skeleton: [
      '.d-skeleton{background:color-mix(in srgb,var(--c2) 50%,transparent);background-image:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c3) 5%,transparent),transparent);background-size:200% 100%;border-radius:var(--d-radius);animation:d-shimmer 1.5s ease-in-out infinite}',
      '@keyframes d-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:color-mix(in srgb,var(--c3) 85%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--c0);padding:0.375rem 0.625rem;border-radius:var(--d-radius);font-size:0.75rem;box-shadow:0 8px 24px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.05);border:1px solid color-mix(in srgb,var(--c3) 15%,transparent)}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.875rem 1rem;border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);background:color-mix(in srgb,var(--c2) 50%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--c3);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.1);display:flex;align-items:flex-start;gap:0.75rem}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 12%,transparent);border-color:color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 12%,transparent);border-color:color-mix(in srgb,var(--c7) 25%,transparent)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 12%,transparent);border-color:color-mix(in srgb,var(--c8) 25%,transparent)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 12%,transparent);border-color:color-mix(in srgb,var(--c9) 25%,transparent)}',
      '.d-alert-dismiss{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-alert-dismiss:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 10%,transparent)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem 1rem;border-radius:var(--d-radius);background:color-mix(in srgb,var(--c2) 70%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid color-mix(in srgb,var(--c3) 10%,transparent);color:var(--c3);box-shadow:0 12px 40px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.1);display:flex;align-items:center;gap:0.75rem;animation:d-toast-in 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '.d-toast-info{border-left:3px solid var(--c1)}',
      '.d-toast-success{border-left:3px solid var(--c7)}',
      '.d-toast-warning{border-left:3px solid var(--c8)}',
      '.d-toast-error{border-left:3px solid var(--c9)}',
      '.d-toast-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-toast-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c3) 10%,transparent)}',
      '@keyframes d-toast-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}'
    ].join('')
  }
};
