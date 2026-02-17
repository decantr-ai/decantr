export const flat = {
  id: 'flat',
  name: 'Minimal',
  global: '--d-radius:6px;--d-radius-lg:8px;--d-shadow:none;--d-transition:all 0.2s cubic-bezier(0.4,0,0.2,1);',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:none;color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{background:var(--c5);transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,0.08)}',
      '.d-btn:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;border-color:var(--c1)}',
      '.d-btn-primary:hover{background:var(--c6);border-color:var(--c6);transform:translateY(-1px);box-shadow:0 4px 14px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-btn-primary:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-secondary{background:transparent;color:var(--c4);border-color:var(--c5)}',
      '.d-btn-secondary:hover{background:var(--c2);color:var(--c3);transform:translateY(-1px)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;border-color:var(--c9)}',
      '.d-btn-destructive:hover{background:color-mix(in srgb,var(--c9) 85%,#000);border-color:color-mix(in srgb,var(--c9) 85%,#000);transform:translateY(-1px);box-shadow:0 4px 14px color-mix(in srgb,var(--c9) 20%,transparent)}',
      '.d-btn-destructive:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-success{background:var(--c7);color:#fff;border-color:var(--c7)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 85%,#000);border-color:color-mix(in srgb,var(--c7) 85%,#000);transform:translateY(-1px);box-shadow:0 4px 14px color-mix(in srgb,var(--c7) 25%,transparent)}',
      '.d-btn-success:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-warning{background:var(--c8);color:#fff;border-color:var(--c8)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 85%,#000);border-color:color-mix(in srgb,var(--c8) 85%,#000);transform:translateY(-1px);box-shadow:0 4px 14px color-mix(in srgb,var(--c8) 25%,transparent)}',
      '.d-btn-warning:active{transform:translateY(0) scale(0.98);box-shadow:none}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1)}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);border-color:var(--c6);color:var(--c6);transform:translateY(-1px)}',
      '.d-btn-outline:active{transform:translateY(0) scale(0.98)}',
      '.d-btn-ghost{background:transparent;border-color:transparent}',
      '.d-btn-ghost:hover{background:var(--c2);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:1px solid var(--c5);border-radius:var(--d-radius-lg);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{border-color:var(--c1);box-shadow:0 4px 16px rgba(0,0,0,0.06);transform:translateY(-2px)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:1px solid var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 12%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:var(--c1);color:#fff;border-radius:9999px;font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.2s ease}',
      '.d-modal-content{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius-lg);box-shadow:0 16px 48px rgba(0,0,0,0.12);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-slide-in 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem}',
      '.d-modal-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;font-size:1.25rem;line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:var(--c2)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-slide-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 12%,transparent)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;color:var(--c3)}',
      '.d-checkbox-check{width:18px;height:18px;border-radius:4px;border:1px solid var(--c5);background:var(--c0);transition:var(--d-transition);display:flex;align-items:center;justify-content:center}',
      '.d-checkbox-checked .d-checkbox-check{background:var(--c1);border-color:var(--c1);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:40px;height:22px;border-radius:11px;background:var(--c5);border:1px solid var(--c5);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);position:absolute;top:1px;left:1px;transition:var(--d-transition)}',
      '.d-switch-checked .d-switch-track{background:var(--c1);border-color:var(--c1)}',
      '.d-switch-checked .d-switch-thumb{left:19px}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px}'
    ].join(''),
    select: [
      '.d-select{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);color:var(--c3);padding:0.5rem 0.75rem;transition:var(--d-transition);cursor:pointer}',
      '.d-select:focus-visible{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 12%,transparent);outline:none}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 12%,transparent)}',
      '.d-select-dropdown{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:0 4px 16px rgba(0,0,0,0.08);margin-top:4px;overflow:hidden}',
      '.d-select-option{padding:0.5rem 0.75rem;color:var(--c3);cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option-highlight{background:var(--c2)}',
      '.d-select-option-active{background:var(--c1);color:#fff}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 12%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;border-bottom:1px solid var(--c5);gap:0.25rem}',
      '.d-tab{padding:0.625rem 1rem;color:var(--c4);cursor:pointer;border-bottom:2px solid transparent;transition:var(--d-transition);background:transparent}',
      '.d-tab:hover{color:var(--c3)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1)}',
      '.d-tabs-panel{padding:1rem 0}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid var(--c5);border-radius:var(--d-radius);background:var(--c0);margin-bottom:0.5rem;overflow:hidden}',
      '.d-accordion-trigger{width:100%;padding:1rem 1.25rem;background:transparent;border:none;color:var(--c3);cursor:pointer;font:inherit;font-weight:500;display:flex;justify-content:space-between;align-items:center;transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:var(--c2)}',
      '.d-accordion-content{padding:0 1.25rem 1rem;color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem}',
      '.d-separator-line{flex:1;height:1px;background:var(--c5)}',
      '.d-separator-label{color:var(--c4);font-size:0.75rem;font-weight:500}',
      '.d-separator-vertical{width:1px;height:100%;background:var(--c5)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c4);text-decoration:none;transition:var(--d-transition)}',
      '.d-breadcrumb-link:hover{color:var(--c1)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 0.25rem}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:500}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius-lg);overflow:hidden}',
      '.d-th{padding:0.75rem 1rem;text-align:left;font-weight:600;color:var(--c3);border-bottom:1px solid var(--c5);background:var(--c2)}',
      '.d-td{padding:0.75rem 1rem;color:var(--c3);border-bottom:1px solid var(--c5)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:var(--c2)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 5%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:50%;overflow:hidden;background:var(--c1);border:2px solid var(--c5);display:flex;align-items:center;justify-content:center}',
      '.d-avatar-fallback{color:#fff;font-weight:600;font-size:0.875rem}'
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
      '.d-tooltip{background:var(--c3);color:var(--c0);padding:0.375rem 0.625rem;border-radius:var(--d-radius);font-size:0.75rem;box-shadow:0 4px 12px rgba(0,0,0,0.1)}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.875rem 1rem;border-radius:var(--d-radius);border:1px solid var(--c5);background:var(--c0);color:var(--c3);display:flex;align-items:flex-start;gap:0.75rem}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 8%,transparent);border-color:color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 8%,transparent);border-color:color-mix(in srgb,var(--c7) 20%,transparent)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 8%,transparent);border-color:color-mix(in srgb,var(--c8) 20%,transparent)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 8%,transparent);border-color:color-mix(in srgb,var(--c9) 20%,transparent)}',
      '.d-alert-dismiss{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-alert-dismiss:hover{color:var(--c3);background:var(--c2)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem 1rem;border-radius:var(--d-radius);background:var(--c0);border:1px solid var(--c5);color:var(--c3);box-shadow:0 8px 24px rgba(0,0,0,0.1);display:flex;align-items:center;gap:0.75rem;animation:d-toast-in 0.25s cubic-bezier(0.4,0,0.2,1)}',
      '.d-toast-info{border-left:3px solid var(--c1)}',
      '.d-toast-success{border-left:3px solid var(--c7)}',
      '.d-toast-warning{border-left:3px solid var(--c8)}',
      '.d-toast-error{border-left:3px solid var(--c9)}',
      '.d-toast-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;margin-left:auto;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-toast-close:hover{color:var(--c3);background:var(--c2)}',
      '@keyframes d-toast-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}'
    ].join('')
  }
};
