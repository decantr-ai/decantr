export const sketchy = {
  id: 'sketchy',
  name: 'Hand-drawn',
  global: '--d-radius:255px 15px 225px 15px/15px 225px 15px 255px;--d-radius-lg:255px 25px 225px 25px/25px 225px 25px 255px;--d-shadow:2px 3px 0 rgba(0,0,0,0.15);--d-transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{transform:rotate(-2deg) scale(1.04);box-shadow:4px 5px 0 rgba(0,0,0,0.2)}',
      '.d-btn:active{transform:rotate(1deg) scale(0.96);box-shadow:1px 1px 0 rgba(0,0,0,0.1)}',
      '.d-btn:focus-visible{outline:2px dashed var(--c1);outline-offset:3px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;border-color:color-mix(in srgb,var(--c1) 70%,#000)}',
      '.d-btn-primary:hover{background:var(--c6);transform:rotate(-2deg) scale(1.04)}',
      '.d-btn-primary:active{transform:rotate(1deg) scale(0.96)}',
      '.d-btn-secondary{background:transparent;border-style:dashed}',
      '.d-btn-secondary:hover{background:var(--c2);border-style:solid;transform:rotate(-1deg) scale(1.02)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;border-color:color-mix(in srgb,var(--c9) 70%,#000)}',
      '.d-btn-destructive:hover{transform:rotate(2deg) scale(1.04);box-shadow:4px 5px 0 rgba(0,0,0,0.2)}',
      '.d-btn-destructive:active{transform:rotate(-1deg) scale(0.96)}',
      '.d-btn-success{background:var(--c7);color:#fff;border-color:color-mix(in srgb,var(--c7) 70%,#000);box-shadow:var(--d-shadow)}',
      '.d-btn-success:hover{background:color-mix(in srgb,var(--c7) 85%,#000);transform:rotate(-2deg) scale(1.04)}',
      '.d-btn-success:active{transform:rotate(1deg) scale(0.96)}',
      '.d-btn-warning{background:var(--c8);color:#fff;border-color:color-mix(in srgb,var(--c8) 70%,#000);box-shadow:var(--d-shadow)}',
      '.d-btn-warning:hover{background:color-mix(in srgb,var(--c8) 85%,#000);transform:rotate(2deg) scale(1.04)}',
      '.d-btn-warning:active{transform:rotate(-1deg) scale(0.96)}',
      '.d-btn-outline{background:transparent;border:2px dashed var(--c1);color:var(--c1);box-shadow:none}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);border-style:solid;transform:rotate(-1deg) scale(1.02);box-shadow:var(--d-shadow)}',
      '.d-btn-outline:active{transform:rotate(0.5deg) scale(0.98)}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{background:var(--c2);border-color:var(--c3);border-style:dashed;transform:rotate(-1deg)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline;text-decoration-style:wavy}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{transform:rotate(-0.5deg) translateY(-3px);box-shadow:5px 6px 0 rgba(0,0,0,0.2)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:700;font-size:1.125rem}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:2px dashed var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-style:dashed;border-color:var(--c1);transform:rotate(-0.5deg);box-shadow:3px 4px 0 rgba(0,0,0,0.18)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4);font-style:italic}',
      '.d-input-error{border-color:var(--c9);border-style:wavy}',
      '.d-input-error:focus-within{border-color:var(--c9)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:var(--c1);color:#fff;border-radius:255px 10px 225px 10px/10px 225px 10px 255px;border:2px solid color-mix(in srgb,var(--c1) 70%,#000);font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:600;box-shadow:var(--d-shadow);transform:rotate(-1deg)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1);border:1px solid color-mix(in srgb,var(--c1) 60%,#000)}',
      '@keyframes d-wobble{0%{transform:rotate(-2deg)}25%{transform:rotate(2deg)}50%{transform:rotate(-1deg)}75%{transform:rotate(1deg)}100%{transform:rotate(-2deg)}}',
      '.d-badge-processing{animation:d-wobble 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.2s ease}',
      '.d-modal-content{background:var(--c0);border:3px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:6px 8px 0 rgba(0,0,0,0.15);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-wobble-in 0.3s cubic-bezier(0.34,1.56,0.64,1);transform:rotate(-0.5deg)}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:700;font-size:1.25rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:2px dashed var(--c5)}',
      '.d-modal-close{background:transparent;border:2px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;font-weight:700;border-radius:255px 10px 225px 10px/10px 225px 10px 255px;transition:var(--d-transition)}',
      '.d-modal-close:hover{background:var(--c9);color:#fff;border-color:var(--c9);transform:rotate(3deg)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-wobble-in{from{opacity:0;transform:rotate(-3deg) scale(0.9)}to{opacity:1;transform:rotate(-0.5deg) scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-style:dashed;border-color:var(--c1);transform:rotate(-0.5deg);box-shadow:3px 4px 0 rgba(0,0,0,0.18)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;resize:vertical;min-height:80px}',
      '.d-textarea::placeholder{color:var(--c4);font-style:italic}',
      '.d-textarea-error{border-color:var(--c9);border-style:wavy}',
      '.d-textarea-error:focus-within{border-color:var(--c9)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-checkbox:hover{transform:rotate(-1deg)}',
      '.d-checkbox-check{width:20px;height:20px;border:2px solid var(--c3);border-radius:255px 5px 225px 5px/5px 225px 5px 255px;background:var(--c0);transition:var(--d-transition);display:flex;align-items:center;justify-content:center;box-shadow:var(--d-shadow)}',
      '.d-checkbox-checked .d-checkbox-check{background:var(--c1);border-color:color-mix(in srgb,var(--c1) 70%,#000);transform:rotate(-2deg) scale(1.05)}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px dashed var(--c1);outline-offset:3px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:2px solid var(--c3);border-radius:255px 12px 225px 12px/12px 225px 12px 255px;background:var(--c2);transition:var(--d-transition);position:relative;box-shadow:var(--d-shadow)}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:255px 8px 225px 8px/8px 225px 8px 255px;background:var(--c3);position:absolute;top:1px;left:2px;transition:var(--d-transition);box-shadow:1px 1px 0 rgba(0,0,0,0.1)}',
      '.d-switch-checked .d-switch-track{background:var(--c1);border-color:color-mix(in srgb,var(--c1) 70%,#000);transform:rotate(-1deg)}',
      '.d-switch-checked .d-switch-thumb{left:22px;background:#fff;transform:rotate(2deg)}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px dashed var(--c1);outline-offset:3px}'
    ].join(''),
    select: [
      '.d-select{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);padding:0.5rem 0.75rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-select:hover{transform:rotate(-0.5deg);box-shadow:3px 4px 0 rgba(0,0,0,0.18)}',
      '.d-select-open .d-select{border-style:dashed;border-color:var(--c1);transform:rotate(-0.5deg)}',
      '.d-select-dropdown{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 6px 0 rgba(0,0,0,0.18);margin-top:4px;overflow:hidden;transform:rotate(-0.3deg)}',
      '.d-select-option{padding:0.5rem 0.75rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option:hover{background:var(--c2);transform:rotate(-0.5deg)}',
      '.d-select-option-active{background:var(--c1);color:#fff;transform:rotate(-1deg)}',
      '.d-select-option-highlight{background:var(--c2)}',
      '.d-select-error{border-color:var(--c9);border-style:wavy}',
      '.d-select-error:focus-within{border-color:var(--c9)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;gap:0;border-bottom:2px solid var(--c5)}',
      '.d-tab{padding:0.5rem 1rem;cursor:pointer;border:2px solid transparent;border-bottom:none;border-radius:255px 15px 0 0/15px 225px 0 0;color:var(--c4);font-weight:600;transition:var(--d-transition);background:transparent}',
      '.d-tab:hover{color:var(--c3);background:var(--c2);transform:rotate(-1deg) translateY(-1px)}',
      '.d-tab-active{color:var(--c1);border-color:var(--c5);background:var(--c0);border-bottom:2px solid var(--c0);margin-bottom:-2px;transform:rotate(-0.5deg)}',
      '.d-tabs-panel{padding:1rem 0}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:2px solid var(--c3);border-radius:var(--d-radius);margin-bottom:0.5rem;box-shadow:var(--d-shadow);overflow:hidden;transform:rotate(-0.3deg)}',
      '.d-accordion-trigger{width:100%;padding:0.75rem 1rem;background:var(--c2);border:none;color:var(--c3);font:inherit;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:color-mix(in srgb,var(--c2) 80%,var(--c1));transform:rotate(-0.5deg)}',
      '.d-accordion-content{padding:0.75rem 1rem;border-top:2px dashed var(--c5);background:var(--c0)}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem;margin:1rem 0}',
      '.d-separator-line{flex:1;height:0;border-top:2px dashed var(--c5)}',
      '.d-separator-label{color:var(--c4);font-size:0.85rem;font-style:italic;transform:rotate(-1deg)}',
      '.d-separator-vertical{width:0;align-self:stretch;border-left:2px dashed var(--c5);margin:0 1rem}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);text-decoration:underline;text-decoration-style:wavy;cursor:pointer;transition:var(--d-transition);font-weight:500}',
      '.d-breadcrumb-link:hover{color:var(--c6);transform:rotate(-1deg) scale(1.02)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 0.5rem;transform:rotate(-3deg);display:inline-block}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:700;transform:rotate(-0.5deg);display:inline-block}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);overflow:hidden;transform:rotate(-0.2deg)}',
      '.d-th{background:var(--c2);color:var(--c3);font-weight:700;text-align:left;padding:0.75rem 1rem;border-bottom:2px solid var(--c3)}',
      '.d-td{padding:0.75rem 1rem;border-bottom:2px dashed var(--c5);color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:color-mix(in srgb,var(--c2) 50%,transparent)}',
      '.d-table-hover .d-tr:hover{background:var(--c2);transform:rotate(-0.3deg)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:255px 15px 225px 15px/15px 225px 15px 255px;border:2px solid var(--c3);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:var(--c2);box-shadow:var(--d-shadow);transform:rotate(-2deg)}',
      '.d-avatar img{width:100%;height:100%;object-fit:cover}',
      '.d-avatar-fallback{font-weight:700;color:var(--c1);font-size:1rem}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:12px;background:var(--c2);border:2px solid var(--c3);border-radius:255px 8px 225px 8px/8px 225px 8px 255px;overflow:hidden;box-shadow:var(--d-shadow);transform:rotate(-0.3deg)}',
      '.d-progress-bar{height:100%;background:var(--c1);border-radius:255px 8px 225px 8px/8px 225px 8px 255px;transition:width 0.3s cubic-bezier(0.34,1.56,0.64,1)}',
      '.d-progress-success .d-progress-bar{background:var(--c7)}',
      '.d-progress-warning .d-progress-bar{background:var(--c8)}',
      '.d-progress-error .d-progress-bar{background:var(--c9)}',
      '@keyframes d-sketchy-stripe{0%{background-position:0 0}100%{background-position:20px 0}}',
      '.d-progress-striped .d-progress-bar{background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.2) 5px,rgba(255,255,255,0.2) 10px);animation:d-sketchy-stripe 0.6s linear infinite}'
    ].join(''),
    skeleton: [
      '@keyframes d-sketchy-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
      '.d-skeleton{background:linear-gradient(90deg,var(--c2) 25%,color-mix(in srgb,var(--c2) 60%,var(--c5)) 50%,var(--c2) 75%);background-size:200% 100%;animation:d-sketchy-shimmer 1.8s ease-in-out infinite;border:2px dashed var(--c5);border-radius:var(--d-radius);box-shadow:var(--d-shadow);transform:rotate(-0.5deg)}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:var(--c3);color:var(--c0);padding:0.375rem 0.75rem;border-radius:255px 10px 225px 10px/10px 225px 10px 255px;font-size:0.8rem;box-shadow:3px 4px 0 rgba(0,0,0,0.15);border:2px solid color-mix(in srgb,var(--c3) 80%,#000);transform:rotate(-1deg);font-style:italic}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.75rem 1rem;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);background:var(--c2);display:flex;align-items:flex-start;gap:0.75rem;transform:rotate(-0.3deg);transition:var(--d-transition)}',
      '.d-alert-info{border-color:var(--c1);background:color-mix(in srgb,var(--c1) 8%,var(--c0))}',
      '.d-alert-success{border-color:var(--c7);background:color-mix(in srgb,var(--c7) 8%,var(--c0))}',
      '.d-alert-warning{border-color:var(--c8);background:color-mix(in srgb,var(--c8) 8%,var(--c0));border-style:dashed}',
      '.d-alert-error{border-color:var(--c9);background:color-mix(in srgb,var(--c9) 8%,var(--c0));border-style:wavy}',
      '.d-alert-dismiss{background:transparent;border:2px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:0.875rem;line-height:1;font-weight:700;border-radius:255px 10px 225px 10px/10px 225px 10px 255px;transition:var(--d-transition);margin-left:auto}',
      '.d-alert-dismiss:hover{background:var(--c9);color:#fff;border-color:var(--c9);transform:rotate(3deg)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.75rem 1rem;border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:4px 6px 0 rgba(0,0,0,0.2);color:var(--c3);background:var(--c0);display:flex;align-items:center;gap:0.75rem;transform:rotate(-0.5deg);transition:var(--d-transition);animation:d-wobble-in 0.3s cubic-bezier(0.34,1.56,0.64,1)}',
      '.d-toast-info{border-color:var(--c1);border-left:6px solid var(--c1)}',
      '.d-toast-success{border-color:var(--c7);border-left:6px solid var(--c7)}',
      '.d-toast-warning{border-color:var(--c8);border-left:6px solid var(--c8);border-style:dashed;border-left-style:solid}',
      '.d-toast-error{border-color:var(--c9);border-left:6px solid var(--c9);border-style:wavy;border-left-style:solid}',
      '.d-toast-close{background:transparent;border:2px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:0.875rem;line-height:1;font-weight:700;border-radius:255px 10px 225px 10px/10px 225px 10px 255px;transition:var(--d-transition);margin-left:auto}',
      '.d-toast-close:hover{background:var(--c9);color:#fff;border-color:var(--c9);transform:rotate(3deg)}'
    ].join('')
  }
};
