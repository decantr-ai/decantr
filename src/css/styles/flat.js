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
    ].join('')
  }
};
