export const sketchy = {
  id: 'sketchy',
  name: 'Hand-drawn',
  global: '--d-radius:255px 15px 225px 15px/15px 225px 15px 255px;--d-radius-lg:255px 25px 225px 25px/25px 225px 25px 255px;--d-shadow:2px 3px 0 rgba(0,0,0,0.15);--d-transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);',
  components: {
    button: [
      '.d-btn{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{transform:rotate(-1deg) scale(1.02);box-shadow:3px 4px 0 rgba(0,0,0,0.2)}',
      '.d-btn:active{transform:rotate(0.5deg) scale(0.98);box-shadow:1px 1px 0 rgba(0,0,0,0.1)}',
      '.d-btn:focus-visible{outline:2px dashed var(--c1);outline-offset:3px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:var(--c1);color:#fff;border-color:color-mix(in srgb,var(--c1) 70%,#000)}',
      '.d-btn-primary:hover{background:var(--c6)}',
      '.d-btn-secondary{background:transparent;border-style:dashed}',
      '.d-btn-secondary:hover{background:var(--c2)}',
      '.d-btn-destructive{background:var(--c9);color:#fff;border-color:color-mix(in srgb,var(--c9) 70%,#000)}',
      '.d-btn-destructive:hover{transform:rotate(1deg) scale(1.02)}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{background:var(--c2);border-color:var(--c3);border-style:dashed}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline;text-decoration-style:wavy}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:var(--c2);border:2px solid var(--c3);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{transform:rotate(-0.5deg);box-shadow:4px 5px 0 rgba(0,0,0,0.2)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:700;font-size:1.125rem}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:2px dashed var(--c5)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:var(--c0);border:2px solid var(--c3);border-radius:var(--d-radius);box-shadow:var(--d-shadow);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-style:dashed;border-color:var(--c1);transform:rotate(-0.5deg)}',
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
      '.d-modal-close{background:transparent;border:2px solid var(--c3);color:var(--c3);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;font-weight:700;border-radius:255px 10px 225px 10px/10px 225px 10px 255px}',
      '.d-modal-close:hover{background:var(--c9);color:#fff;border-color:var(--c9);transform:rotate(3deg)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-wobble-in{from{opacity:0;transform:rotate(-3deg) scale(0.9)}to{opacity:1;transform:rotate(-0.5deg) scale(1)}}'
    ].join('')
  }
};
