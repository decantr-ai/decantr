export const brutalist = {
  id: 'brutalist',
  name: 'Neobrutalism',
  global: '--d-radius:4px;--d-radius-lg:4px;--d-shadow:4px 4px 0 var(--c3);--d-transition:all 0.1s ease;',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition);font-weight:700;text-transform:uppercase;letter-spacing:0.05em}',
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
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c3)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:800;font-size:1.25rem;text-transform:uppercase;letter-spacing:0.05em}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:2px solid var(--c3)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;font-weight:600}',
      '.d-input::placeholder{color:var(--c4);font-weight:400}',
      '.d-input-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-input-error:focus-within{box-shadow:5px 5px 0 var(--c9)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:var(--c1);color:#fff;border-radius:var(--d-radius);border:2px solid var(--c3);font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;box-shadow:2px 2px 0 var(--c3)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1);border:1px solid var(--c3)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.3}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 1s steps(2) infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000}',
      '.d-modal-content{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:8px 8px 0 var(--c3);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-drop-in 0.15s ease}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:800;font-size:1.25rem;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:2px solid var(--c3)}',
      '.d-modal-close{background:transparent;border:2px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;font-weight:800;border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition)}',
      '.d-modal-close:hover{background:var(--c9);color:#fff;border-color:var(--c9);box-shadow:2px 2px 0 color-mix(in srgb,var(--c9) 60%,#000);transform:translate(-1px,-1px)}',
      '@keyframes d-drop-in{from{transform:translateY(-20px)}to{transform:translateY(0)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition);display:flex}',
      '.d-textarea-wrap:focus-within{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;font-weight:600;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4);font-weight:400}',
      '.d-textarea-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-textarea-error:focus-within{box-shadow:5px 5px 0 var(--c9)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem;color:var(--c3)}',
      '.d-checkbox-check{width:20px;height:20px;border:2px solid var(--c3);border-radius:var(--d-radius);background:var(--c0);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);display:flex;align-items:center;justify-content:center}',
      '.d-checkbox-checked .d-checkbox-check{background:var(--c1);border-color:var(--c3);box-shadow:2px 2px 0 var(--c3);color:#fff}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:3px solid var(--c1);outline-offset:2px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:2px solid var(--c3);border-radius:var(--d-radius);background:var(--c2);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:16px;height:16px;border:2px solid var(--c3);border-radius:var(--d-radius);background:var(--c0);position:absolute;top:2px;left:2px;transition:var(--d-transition);box-shadow:1px 1px 0 var(--c3)}',
      '.d-switch-checked .d-switch-track{background:var(--c1);border-color:var(--c3)}',
      '.d-switch-checked .d-switch-thumb{left:20px;background:#fff}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:3px solid var(--c1);outline-offset:2px}'
    ].join(''),
    select: [
      '.d-select{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);transition:var(--d-transition);color:var(--c3);padding:0.5rem 0.75rem;font:inherit;font-weight:600;cursor:pointer;width:100%}',
      '.d-select-dropdown{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);margin-top:0.25rem;overflow:hidden;z-index:100;position:absolute;width:100%}',
      '.d-select-option{padding:0.5rem 0.75rem;cursor:pointer;font-weight:600;transition:var(--d-transition);color:var(--c3)}',
      '.d-select-option-active{background:var(--c1);color:#fff}',
      '.d-select-option-highlight{background:var(--c2)}',
      '.d-select-error{border-color:var(--c9);box-shadow:3px 3px 0 var(--c9)}',
      '.d-select-open .d-select{box-shadow:5px 5px 0 var(--c1);border-color:var(--c1);transform:translate(-1px,-1px)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;gap:0;border-bottom:3px solid var(--c3)}',
      '.d-tab{padding:0.625rem 1.25rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;border:2px solid transparent;border-bottom:none;cursor:pointer;color:var(--c4);background:transparent;transition:var(--d-transition);position:relative;top:3px}',
      '.d-tab:hover{color:var(--c3);background:var(--c2)}',
      '.d-tab-active{color:var(--c3);background:var(--c0);border-color:var(--c3);box-shadow:3px -3px 0 var(--c3)}',
      '.d-tabs-panel{padding:1.25rem;border:2px solid var(--c3);border-top:none;background:var(--c0)}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);margin-bottom:0.5rem;background:var(--c0);transition:var(--d-transition)}',
      '.d-accordion-trigger{width:100%;padding:0.75rem 1rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer;background:var(--c2);border:none;border-bottom:2px solid var(--c3);color:var(--c3);text-align:left;transition:var(--d-transition);font:inherit}',
      '.d-accordion-trigger:hover{background:var(--c0);transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--c3)}',
      '.d-accordion-content{padding:1rem;color:var(--c3)}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem;margin:1rem 0}',
      '.d-separator-line{flex:1;height:3px;background:var(--c3);border:none}',
      '.d-separator-label{font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.75rem;color:var(--c3);padding:0 0.5rem;background:var(--c0)}',
      '.d-separator-vertical{width:3px;background:var(--c3);align-self:stretch;margin:0 1rem}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem;transition:var(--d-transition);border-bottom:2px solid transparent}',
      '.d-breadcrumb-link:hover{color:var(--c6);border-bottom-color:var(--c6);transform:translate(-1px,-1px)}',
      '.d-breadcrumb-separator{color:var(--c3);font-weight:800;margin:0 0.5rem}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);overflow:hidden}',
      '.d-th{padding:0.75rem 1rem;background:var(--c3);color:var(--c0);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:2px solid var(--c3)}',
      '.d-td{padding:0.75rem 1rem;border-bottom:2px solid var(--c5);color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:var(--c2)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 10%,var(--c0));transform:translate(-2px,-2px);box-shadow:4px 4px 0 var(--c3)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:var(--d-radius);border:2px solid var(--c3);box-shadow:2px 2px 0 var(--c3);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:var(--c1);color:#fff;font-weight:800;text-transform:uppercase;font-size:1rem}',
      '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--c1);color:#fff;font-weight:800;text-transform:uppercase}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:20px;background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:3px 3px 0 var(--c3);overflow:hidden}',
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
      '.d-tooltip{background:var(--c3);color:var(--c0);padding:0.375rem 0.75rem;border-radius:var(--d-radius);border:2px solid var(--c3);box-shadow:3px 3px 0 color-mix(in srgb,var(--c3) 60%,#000);font-weight:700;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;z-index:1100}'
    ].join(''),
    alert: [
      '.d-alert{padding:1rem 1.25rem;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);background:var(--c2);color:var(--c3);font-weight:600;display:flex;align-items:flex-start;gap:0.75rem;position:relative}',
      '.d-alert-info{background:color-mix(in srgb,var(--c1) 10%,var(--c0));border-color:var(--c1);box-shadow:4px 4px 0 var(--c1)}',
      '.d-alert-success{background:color-mix(in srgb,var(--c7) 10%,var(--c0));border-color:var(--c7);box-shadow:4px 4px 0 var(--c7)}',
      '.d-alert-warning{background:color-mix(in srgb,var(--c8) 10%,var(--c0));border-color:var(--c8);box-shadow:4px 4px 0 var(--c8)}',
      '.d-alert-error{background:color-mix(in srgb,var(--c9) 10%,var(--c0));border-color:var(--c9);box-shadow:4px 4px 0 var(--c9)}',
      '.d-alert-dismiss{background:transparent;border:2px solid var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-weight:800;border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);color:var(--c3);margin-left:auto;font-size:0.875rem;line-height:1}',
      '.d-alert-dismiss:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem 1.25rem;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 4px 0 var(--c3);background:var(--c0);color:var(--c3);font-weight:600;display:flex;align-items:center;gap:0.75rem;min-width:280px}',
      '.d-toast-info{border-color:var(--c1);box-shadow:4px 4px 0 var(--c1)}',
      '.d-toast-success{border-color:var(--c7);box-shadow:4px 4px 0 var(--c7)}',
      '.d-toast-warning{border-color:var(--c8);box-shadow:4px 4px 0 var(--c8)}',
      '.d-toast-error{border-color:var(--c9);box-shadow:4px 4px 0 var(--c9)}',
      '.d-toast-close{background:transparent;border:2px solid var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-weight:800;border-radius:var(--d-radius);box-shadow:2px 2px 0 var(--c3);transition:var(--d-transition);color:var(--c3);margin-left:auto;font-size:0.875rem;line-height:1}',
      '.d-toast-close:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--c3)}'
    ].join('')
  }
};
