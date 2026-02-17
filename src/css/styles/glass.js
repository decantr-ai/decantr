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
    ].join('')
  }
};
