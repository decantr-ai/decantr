export const skeuo = {
  id: 'skeuo',
  name: 'Skeuomorphic',
  global: '--d-radius:8px;--d-radius-lg:10px;--d-shadow:0 2px 4px rgba(0,0,0,0.2),0 1px 2px rgba(0,0,0,0.1);--d-transition:all 0.2s ease;',
  components: {
    button: [
      '.d-btn{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.4);color:var(--c3);transition:var(--d-transition);text-shadow:0 1px 0 rgba(255,255,255,0.3)}',
      '.d-btn:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000));box-shadow:0 3px 8px rgba(0,0,0,0.22),0 1px 3px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.5);transform:translateY(-1px)}',
      '.d-btn:active{background:linear-gradient(to bottom,var(--c2),color-mix(in srgb,var(--c2) 95%,#fff));box-shadow:inset 0 2px 4px rgba(0,0,0,0.15);transform:translateY(1px)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:1px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;border-color:color-mix(in srgb,var(--c1) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.25)}',
      '.d-btn-primary:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 90%,#fff),color-mix(in srgb,var(--c1) 90%,#000));box-shadow:0 4px 10px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.3);transform:translateY(-1px)}',
      '.d-btn-primary:active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 90%,#000),color-mix(in srgb,var(--c1) 85%,#fff));box-shadow:inset 0 3px 6px rgba(0,0,0,0.35);transform:translateY(1px)}',
      '.d-btn-secondary{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 95%,#000))}',
      '.d-btn-secondary:hover{box-shadow:0 3px 8px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.5);transform:translateY(-1px)}',
      '.d-btn-destructive{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 85%,#fff),var(--c9));color:#fff;border-color:color-mix(in srgb,var(--c9) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.2)}',
      '.d-btn-destructive:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 90%,#fff),color-mix(in srgb,var(--c9) 90%,#000));transform:translateY(-1px)}',
      '.d-btn-destructive:active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 90%,#000),color-mix(in srgb,var(--c9) 85%,#fff));box-shadow:inset 0 3px 6px rgba(0,0,0,0.35);transform:translateY(1px)}',
      '.d-btn-success{background:linear-gradient(to bottom,color-mix(in srgb,var(--c7) 85%,#fff),var(--c7));color:#fff;border-color:color-mix(in srgb,var(--c7) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.25)}',
      '.d-btn-success:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c7) 90%,#fff),color-mix(in srgb,var(--c7) 90%,#000));transform:translateY(-1px)}',
      '.d-btn-success:active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c7) 90%,#000),color-mix(in srgb,var(--c7) 85%,#fff));box-shadow:inset 0 3px 6px rgba(0,0,0,0.35);transform:translateY(1px)}',
      '.d-btn-warning{background:linear-gradient(to bottom,color-mix(in srgb,var(--c8) 85%,#fff),var(--c8));color:#fff;border-color:color-mix(in srgb,var(--c8) 70%,#000);text-shadow:0 -1px 0 rgba(0,0,0,0.2);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.25)}',
      '.d-btn-warning:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c8) 90%,#fff),color-mix(in srgb,var(--c8) 90%,#000));transform:translateY(-1px)}',
      '.d-btn-warning:active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c8) 90%,#000),color-mix(in srgb,var(--c8) 85%,#fff));box-shadow:inset 0 3px 6px rgba(0,0,0,0.35);transform:translateY(1px)}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1);box-shadow:none;text-shadow:none}',
      '.d-btn-outline:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 8%,transparent),color-mix(in srgb,var(--c1) 12%,transparent));box-shadow:var(--d-shadow);transform:translateY(-1px)}',
      '.d-btn-outline:active{transform:translateY(1px);box-shadow:none}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none;text-shadow:none}',
      '.d-btn-ghost:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));box-shadow:var(--d-shadow);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline;text-shadow:none}',
      '.d-btn-link:hover{color:var(--c6)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.4);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 6px 16px rgba(0,0,0,0.22),0 2px 6px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.4);transform:translateY(-3px)}',
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
      '.d-modal-content{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 98%,#fff),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius-lg);box-shadow:0 12px 40px rgba(0,0,0,0.3),0 4px 12px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.5);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-scale-in 0.25s ease}',
      '.d-modal-header{padding:1.25rem 1.25rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.25rem}',
      '.d-modal-footer{padding:0 1.25rem 1.25rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1))}',
      '.d-modal-close{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid var(--c5);color:var(--c4);cursor:pointer;padding:0.125rem 0.375rem;font-size:1rem;line-height:1;border-radius:var(--d-radius);box-shadow:0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.3);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000))}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-scale-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 97%,#000),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 1px 0 rgba(255,255,255,0.4);transition:var(--d-transition);display:flex}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;resize:vertical;min-height:5rem}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem;color:var(--c3)}',
      '.d-checkbox-check{width:18px;height:18px;border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.3));border-radius:var(--d-radius);background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 97%,#000),var(--c0));box-shadow:inset 0 2px 3px rgba(0,0,0,0.1),0 1px 0 rgba(255,255,255,0.4);transition:var(--d-transition);display:flex;align-items:center;justify-content:center}',
      '.d-checkbox-checked .d-checkbox-check{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));border-color:color-mix(in srgb,var(--c1) 70%,#000);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25),0 1px 2px rgba(0,0,0,0.2);color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.2)}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:1px}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.3));border-radius:12px;background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#000),var(--c2));box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 1px 0 rgba(255,255,255,0.3);transition:var(--d-transition);position:relative;cursor:pointer}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(to bottom,#fff,color-mix(in srgb,var(--c0) 95%,#000));border:1px solid color-mix(in srgb,var(--c5) 70%,rgba(0,0,0,0.2));position:absolute;top:2px;left:2px;transition:var(--d-transition);box-shadow:0 2px 4px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.8)}',
      '.d-switch-checked .d-switch-track{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));border-color:color-mix(in srgb,var(--c1) 70%,#000);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 1px 0 rgba(255,255,255,0.2)}',
      '.d-switch-checked .d-switch-thumb{left:22px}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:1px}'
    ].join(''),
    select: [
      '.d-select{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 97%,#000),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 1px 0 rgba(255,255,255,0.4);transition:var(--d-transition);color:var(--c3);padding:0.5rem 0.75rem;font:inherit;cursor:pointer;width:100%}',
      '.d-select-dropdown{background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 98%,#fff),var(--c0));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.25),0 2px 6px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.4);margin-top:0.25rem;overflow:hidden;z-index:100;position:absolute;width:100%}',
      '.d-select-option{padding:0.5rem 0.75rem;cursor:pointer;transition:var(--d-transition);color:var(--c3)}',
      '.d-select-option-active{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.2)}',
      '.d-select-option-highlight{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2))}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;gap:0;border-bottom:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1))}',
      '.d-tab{padding:0.625rem 1.25rem;font-weight:500;cursor:pointer;color:var(--c4);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 95%,#000));border:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1));border-bottom:none;border-radius:var(--d-radius) var(--d-radius) 0 0;transition:var(--d-transition);position:relative;top:1px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.3)}',
      '.d-tab:hover{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 98%,#fff),var(--c2))}',
      '.d-tab-active{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 98%,#fff),var(--c0));border-color:color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1));border-bottom-color:var(--c0);box-shadow:0 -2px 4px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.5)}',
      '.d-tabs-panel{padding:1.25rem;border:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1));border-top:none;background:var(--c0)}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.3);margin-bottom:0.5rem;background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),var(--c2));transition:var(--d-transition)}',
      '.d-accordion-trigger{width:100%;padding:0.75rem 1rem;font-weight:500;cursor:pointer;background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:none;border-bottom:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1));color:var(--c3);text-align:left;transition:var(--d-transition);font:inherit;border-radius:var(--d-radius) var(--d-radius) 0 0;text-shadow:0 1px 0 rgba(255,255,255,0.3)}',
      '.d-accordion-trigger:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000))}',
      '.d-accordion-content{padding:1rem;color:var(--c3);background:var(--c0)}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem;margin:1rem 0}',
      '.d-separator-line{flex:1;height:1px;background:linear-gradient(to right,transparent,color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15)),transparent);border:none;box-shadow:0 1px 0 rgba(255,255,255,0.4)}',
      '.d-separator-label{font-size:0.75rem;color:var(--c4);padding:0 0.5rem;background:var(--c0);text-shadow:0 1px 0 rgba(255,255,255,0.3)}',
      '.d-separator-vertical{width:1px;background:linear-gradient(to bottom,transparent,color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15)),transparent);align-self:stretch;margin:0 1rem;box-shadow:1px 0 0 rgba(255,255,255,0.4)}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);text-decoration:none;font-size:0.875rem;transition:var(--d-transition);text-shadow:0 1px 0 rgba(255,255,255,0.3)}',
      '.d-breadcrumb-link:hover{color:var(--c6);text-decoration:underline}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 0.5rem}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:600;font-size:0.875rem;text-shadow:0 1px 0 rgba(255,255,255,0.3)}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.3);overflow:hidden}',
      '.d-th{padding:0.75rem 1rem;background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),color-mix(in srgb,var(--c2) 95%,#000));font-weight:600;text-align:left;border-bottom:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));text-shadow:0 1px 0 rgba(255,255,255,0.3);box-shadow:inset 0 1px 0 rgba(255,255,255,0.4)}',
      '.d-td{padding:0.75rem 1rem;border-bottom:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.08));color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 98%,#fff),var(--c2))}',
      '.d-table-hover .d-tr:hover{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 5%,var(--c0)),color-mix(in srgb,var(--c1) 8%,var(--c0)));box-shadow:inset 0 1px 0 rgba(255,255,255,0.3)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.3);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;font-weight:600;font-size:1rem;text-shadow:0 -1px 0 rgba(0,0,0,0.2)}',
      '.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 85%,#fff),var(--c1));color:#fff;font-weight:600;text-shadow:0 -1px 0 rgba(0,0,0,0.2)}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:18px;background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#000),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.2));border-radius:9999px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.12),0 1px 0 rgba(255,255,255,0.4);overflow:hidden}',
      '.d-progress-bar{height:100%;background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 80%,#fff),var(--c1));border-radius:9999px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.3),0 1px 2px rgba(0,0,0,0.15);transition:width 0.3s ease;text-shadow:0 -1px 0 rgba(0,0,0,0.2)}',
      '.d-progress-success .d-progress-bar{background:linear-gradient(to bottom,color-mix(in srgb,var(--c7) 80%,#fff),var(--c7))}',
      '.d-progress-warning .d-progress-bar{background:linear-gradient(to bottom,color-mix(in srgb,var(--c8) 80%,#fff),var(--c8))}',
      '.d-progress-error .d-progress-bar{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 80%,#fff),var(--c9))}',
      '.d-progress-striped .d-progress-bar{background-image:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.15) 8px,rgba(255,255,255,0.15) 16px)}'
    ].join(''),
    skeleton: [
      '.d-skeleton{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),var(--c2));border:1px solid color-mix(in srgb,var(--c5) 60%,rgba(0,0,0,0.1));border-radius:var(--d-radius);box-shadow:inset 0 1px 3px rgba(0,0,0,0.06),0 1px 0 rgba(255,255,255,0.4);background-image:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%);background-size:200% 100%;animation:d-shimmer 1.8s ease-in-out infinite}',
      '@keyframes d-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:linear-gradient(to bottom,color-mix(in srgb,var(--c3) 90%,#fff),var(--c3));color:var(--c0);padding:0.375rem 0.75rem;border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c3) 70%,#000);box-shadow:0 4px 12px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1);font-size:0.8125rem;text-shadow:0 -1px 0 rgba(0,0,0,0.2);z-index:1100}'
    ].join(''),
    alert: [
      '.d-alert{padding:1rem 1.25rem;border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius);box-shadow:var(--d-shadow),inset 0 1px 0 rgba(255,255,255,0.4);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),var(--c2));color:var(--c3);display:flex;align-items:flex-start;gap:0.75rem;position:relative}',
      '.d-alert-info{background:linear-gradient(to bottom,color-mix(in srgb,var(--c1) 8%,var(--c0)),color-mix(in srgb,var(--c1) 12%,var(--c0)));border-color:color-mix(in srgb,var(--c1) 40%,var(--c5))}',
      '.d-alert-success{background:linear-gradient(to bottom,color-mix(in srgb,var(--c7) 8%,var(--c0)),color-mix(in srgb,var(--c7) 12%,var(--c0)));border-color:color-mix(in srgb,var(--c7) 40%,var(--c5))}',
      '.d-alert-warning{background:linear-gradient(to bottom,color-mix(in srgb,var(--c8) 8%,var(--c0)),color-mix(in srgb,var(--c8) 12%,var(--c0)));border-color:color-mix(in srgb,var(--c8) 40%,var(--c5))}',
      '.d-alert-error{background:linear-gradient(to bottom,color-mix(in srgb,var(--c9) 8%,var(--c0)),color-mix(in srgb,var(--c9) 12%,var(--c0)));border-color:color-mix(in srgb,var(--c9) 40%,var(--c5))}',
      '.d-alert-dismiss{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid var(--c5);cursor:pointer;padding:0.125rem 0.375rem;border-radius:var(--d-radius);box-shadow:0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.3);transition:var(--d-transition);color:var(--c4);margin-left:auto;font-size:0.875rem;line-height:1}',
      '.d-alert-dismiss:hover{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000))}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.875rem 1.25rem;border:1px solid color-mix(in srgb,var(--c5) 80%,rgba(0,0,0,0.15));border-radius:var(--d-radius);box-shadow:0 8px 24px rgba(0,0,0,0.2),0 2px 6px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.4);background:linear-gradient(to bottom,color-mix(in srgb,var(--c0) 98%,#fff),var(--c0));color:var(--c3);display:flex;align-items:center;gap:0.75rem;min-width:280px}',
      '.d-toast-info{border-color:color-mix(in srgb,var(--c1) 40%,var(--c5));border-left:4px solid var(--c1)}',
      '.d-toast-success{border-color:color-mix(in srgb,var(--c7) 40%,var(--c5));border-left:4px solid var(--c7)}',
      '.d-toast-warning{border-color:color-mix(in srgb,var(--c8) 40%,var(--c5));border-left:4px solid var(--c8)}',
      '.d-toast-error{border-color:color-mix(in srgb,var(--c9) 40%,var(--c5));border-left:4px solid var(--c9)}',
      '.d-toast-close{background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 90%,#fff),var(--c2));border:1px solid var(--c5);cursor:pointer;padding:0.125rem 0.375rem;border-radius:var(--d-radius);box-shadow:0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.3);transition:var(--d-transition);color:var(--c4);margin-left:auto;font-size:0.875rem;line-height:1}',
      '.d-toast-close:hover{color:var(--c3);background:linear-gradient(to bottom,color-mix(in srgb,var(--c2) 95%,#fff),color-mix(in srgb,var(--c2) 90%,#000))}'
    ].join('')
  }
};
