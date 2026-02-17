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
    ].join('')
  }
};
