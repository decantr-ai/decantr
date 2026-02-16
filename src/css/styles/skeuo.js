export const skeuo = {
  id: 'skeuo',
  name: 'Skeuomorphic',
  global: '--d-radius:8px;--d-radius-lg:10px;--d-shadow:0 2px 4px rgba(0,0,0,0.2),0 1px 2px rgba(0,0,0,0.1);--d-transition:all 0.2s ease;',
  components: {
    button: [
      '.d-btn{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.4);color:var(--c3);transition:var(--d-transition);text-shadow:0 1px 0 rgba(255,255,255,0.3)}',
      '.d-btn:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000));box-shadow:0 3px 6px rgba(0,0,0,0.2),0 1px 3px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)}',
      '.d-btn:active{background:linear-gradient(to bottom,var(--c2),color-mix(in srgb,var(--c2) 95%,#fff));box-shadow:inset 0 2px 4px rgba(0,0,0,0.15);transform:translateY(1px)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:1px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;border-color:color-mix(in srgb,var(--c1) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.25)}',
      '.d-btn-primary:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 90%,#fff),color-mix(in srgb,var(--c1) 90%,#000))}',
      '.d-btn-primary:active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 90%,#000),color-mix(in srgb,var(--c1) 85%,#fff));box-shadow:inset 0 2px 4px rgba(0,0,0,0.3)}',
      '.d-btn-secondary{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 95%,#000))}',
      '.d-btn-destructive{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 85%,#fff),var(--c9));color:#fff;border-color:color-mix(in srgb,var(--c9) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2)}',
      '.d-btn-destructive:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 90%,#fff),color-mix(in srgb,var(--c9) 90%,#000))}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none;text-shadow:none}',
      '.d-btn-ghost:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));box-shadow:var(--d-shadow)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline;text-shadow:none}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.4);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 4px 12px rgba(0,0,0,0.2),0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.4)}',
      '.d-card-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.25rem}',
      '.d-card-footer{padding:0 1.25rem 1.25rem;border-top:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1))}'
    ].join(''),
    input: [
      '.d-input-wrap{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 97%,#000),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 1px 0 rgba(255,255,255,0.4);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;border-radius:9999px;border:1px solid color-mix(in srgb,var(--c1) 70%,#000);font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.2);text-shadow:0 -1px 0 rgba(0,0,0,0.15)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 30% 30%,color-mix(in srgb,var(--c1) 80%,#fff),var(--c1));box-shadow:0 1px 2px rgba(0,0,0,0.2)}',
      '@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
      '.d-badge-processing .d-badge-dot{animation:d-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.2s ease}',
      '.d-modal-content{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 98%,#fff),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius-lg);box-shadow:0 8px 32px rgba(0,0,0,0.3),0 2px 8px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.5);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-scale-in 0.2s ease}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1))}',
      '.d-modal-close{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid var(--c5);color:var(--c4);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;border-radius:var(--d-radius);box-shadow:0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.3)}',
      '.d-modal-close:hover{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000))}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-scale-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}'
    ].join('')
  }
};
