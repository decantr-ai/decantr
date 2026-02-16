export const mono = {
  id: 'mono',
  name: 'Monochromatic',
  global: '--d-radius:6px;--d-radius-lg:8px;--d-shadow:0 1px 3px rgba(0,0,0,0.08);--d-transition:all 0.2s ease;',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{background:var(--c5);box-shadow:0 2px 6px rgba(0,0,0,0.12)}',
      '.d-btn:active{box-shadow:inset 0 1px 2px rgba(0,0,0,0.1)}',
      '.d-btn:focus-visible{outline:2px solid var(--c3);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.4;pointer-events:none}',
      '.d-btn-primary{background:var(--c3);color:var(--c0);border-color:var(--c3)}',
      '.d-btn-primary:hover{background:var(--c6)}',
      '.d-btn-secondary{background:transparent;border-color:var(--c5)}',
      '.d-btn-secondary:hover{background:var(--c2)}',
      '.d-btn-destructive{background:var(--c3);color:var(--c0);border-color:var(--c3)}',
      '.d-btn-destructive:hover{opacity:0.85}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{background:var(--c2)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c3);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c4)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:1px solid var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-color:var(--c3);box-shadow:0 0 0 1px var(--c3)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c3)}',
      '.d-input-error:focus-within{box-shadow:0 0 0 1px var(--c3)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:var(--c3);color:var(--c0);border-radius:9999px;font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c3)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.4}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.2s ease}',
      '.d-modal-content{background:var(--c0);border:1px solid var(--c5);border-radius:var(--d-radius-lg);box-shadow:0 8px 24px rgba(0,0,0,0.15);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-scale-in 0.2s ease}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:1px solid var(--c5)}',
      '.d-modal-close{background:transparent;border:1px solid var(--c5);color:var(--c4);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;border-radius:var(--d-radius)}',
      '.d-modal-close:hover{color:var(--c3);border-color:var(--c3)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-scale-in{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}'
    ].join('')
  }
};
