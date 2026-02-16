export const clay = {
  id: 'clay',
  name: 'Claymorphism',
  global: '--d-radius:16px;--d-radius-lg:24px;--d-shadow:8px 8px 16px rgba(0,0,0,0.1),-8px -8px 16px rgba(255,255,255,0.7);--d-shadow-inset:inset 4px 4px 8px rgba(0,0,0,0.06),inset -4px -4px 8px rgba(255,255,255,0.5);--d-transition:all 0.25s ease;',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:none;border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{box-shadow:10px 10px 20px rgba(0,0,0,0.12),-10px -10px 20px rgba(255,255,255,0.8);transform:translateY(-1px)}',
      '.d-btn:active{box-shadow:var(--d-shadow-inset);transform:translateY(0)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;box-shadow:6px 6px 12px color-mix(in srgb,var(--c1) 40%,rgba(0,0,0,0.3)),-6px -6px 12px color-mix(in srgb,var(--c1) 20%,rgba(255,255,255,0.2))}',
      '.d-btn-primary:hover{box-shadow:8px 8px 16px color-mix(in srgb,var(--c1) 50%,rgba(0,0,0,0.3)),-8px -8px 16px color-mix(in srgb,var(--c1) 20%,rgba(255,255,255,0.3))}',
      '.d-btn-primary:active{box-shadow:inset 3px 3px 6px rgba(0,0,0,0.2),inset -3px -3px 6px rgba(255,255,255,0.1)}',
      '.d-btn-secondary{background:var(--c2);color:var(--c4)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;box-shadow:6px 6px 12px color-mix(in srgb,var(--c9) 30%,rgba(0,0,0,0.2)),-6px -6px 12px rgba(255,255,255,0.5)}',
      '.d-btn-ghost{background:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{background:var(--c2);box-shadow:var(--d-shadow)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem;border-radius:12px}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem;border-radius:20px}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:none;border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:12px 12px 24px rgba(0,0,0,0.12),-12px -12px 24px rgba(255,255,255,0.8);transform:translateY(-2px)}',
      '.d-card-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.5rem}',
      '.d-card-footer{padding:0 1.5rem 1.5rem;border-top:1px solid var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c2);border:none;border-radius:var(--d-radius);box-shadow:var(--d-shadow-inset);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{box-shadow:var(--d-shadow-inset),0 0 0 3px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{box-shadow:var(--d-shadow-inset),0 0 0 2px var(--c9)}',
      '.d-input-error:focus-within{box-shadow:var(--d-shadow-inset),0 0 0 3px color-mix(in srgb,var(--c9) 25%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:var(--c1);color:#fff;border-radius:9999px;border:none;font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500;box-shadow:3px 3px 6px color-mix(in srgb,var(--c1) 30%,rgba(0,0,0,0.2)),-3px -3px 6px rgba(255,255,255,0.3)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1);box-shadow:2px 2px 4px rgba(0,0,0,0.1)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.25s ease}',
      '.d-modal-content{background:var(--c2);border:none;border-radius:var(--d-radius-lg);box-shadow:16px 16px 32px rgba(0,0,0,0.15),-16px -16px 32px rgba(255,255,255,0.7);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-clay-in 0.3s ease}',
      '.d-modal-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.5rem}',
      '.d-modal-footer{padding:0 1.5rem 1.5rem;display:flex;justify-content:flex-end;gap:0.5rem}',
      '.d-modal-close{background:transparent;border:none;color:var(--c4);cursor:pointer;padding:0.25rem;font-size:1.25rem;line-height:1}',
      '.d-modal-close:hover{color:var(--c3)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-clay-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}'
    ].join('')
  }
};
