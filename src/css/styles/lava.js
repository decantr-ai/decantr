export const lava = {
  id: 'lava',
  name: 'Hot Lava',
  global: '--d-radius:10px;--d-radius-lg:14px;--d-shadow:0 4px 24px rgba(249,115,22,0.15),0 2px 8px rgba(0,0,0,0.3);--d-transition:all 0.3s cubic-bezier(0.22,1,0.36,1);',
  components: {
    button: [
      '.d-btn{background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),var(--c2));border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-btn:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 80%,var(--c1)),color-mix(in srgb,var(--c2) 95%,var(--c1)));box-shadow:0 8px 32px rgba(249,115,22,0.25),0 2px 8px rgba(0,0,0,0.3);transform:translateY(-2px)}',
      '.d-btn:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 8px rgba(249,115,22,0.1),0 1px 4px rgba(0,0,0,0.2)}',
      '.d-btn:focus-visible{outline:2px solid var(--c1);outline-offset:2px}',
      '.d-btn[disabled]{opacity:0.5;pointer-events:none}',
      '.d-btn-primary{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c1) 30%,transparent),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-btn-primary:hover{background:linear-gradient(135deg,var(--c6),var(--c1));box-shadow:0 8px 40px color-mix(in srgb,var(--c1) 45%,transparent),0 2px 12px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.2);transform:translateY(-3px)}',
      '.d-btn-primary:active{background:linear-gradient(135deg,color-mix(in srgb,var(--c1) 80%,#000),var(--c1));transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-btn-secondary{background:linear-gradient(135deg,var(--c2),color-mix(in srgb,var(--c2) 90%,#000));border-color:var(--c5)}',
      '.d-btn-secondary:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),var(--c2));border-color:color-mix(in srgb,var(--c1) 30%,transparent);transform:translateY(-2px)}',
      '.d-btn-destructive{background:linear-gradient(135deg,var(--c9),color-mix(in srgb,var(--c9) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c9) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c9) 25%,transparent),0 2px 8px rgba(0,0,0,0.3)}',
      '.d-btn-destructive:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c9) 90%,#fff),var(--c9));box-shadow:0 8px 40px color-mix(in srgb,var(--c9) 40%,transparent),0 2px 12px rgba(0,0,0,0.3);transform:translateY(-3px)}',
      '.d-btn-destructive:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c9) 15%,transparent)}',
      '.d-btn-success{background:linear-gradient(135deg,var(--c7),color-mix(in srgb,var(--c7) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c7) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c7) 20%,transparent),0 2px 8px rgba(0,0,0,0.3)}',
      '.d-btn-success:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c7) 90%,#fff),var(--c7));box-shadow:0 8px 40px color-mix(in srgb,var(--c7) 35%,transparent),0 2px 12px rgba(0,0,0,0.3);transform:translateY(-3px)}',
      '.d-btn-success:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c7) 15%,transparent)}',
      '.d-btn-warning{background:linear-gradient(135deg,var(--c8),color-mix(in srgb,var(--c8) 70%,#000));color:#fff;border-color:color-mix(in srgb,var(--c8) 60%,#000);box-shadow:0 4px 24px color-mix(in srgb,var(--c8) 20%,transparent),0 2px 8px rgba(0,0,0,0.3)}',
      '.d-btn-warning:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--c8) 90%,#fff),var(--c8));box-shadow:0 8px 40px color-mix(in srgb,var(--c8) 35%,transparent),0 2px 12px rgba(0,0,0,0.3);transform:translateY(-3px)}',
      '.d-btn-warning:active{transform:translateY(1px) scale(0.97);box-shadow:0 2px 12px color-mix(in srgb,var(--c8) 15%,transparent)}',
      '.d-btn-outline{background:transparent;border:2px solid var(--c1);color:var(--c1);box-shadow:none}',
      '.d-btn-outline:hover{background:color-mix(in srgb,var(--c1) 10%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c1) 20%,transparent),0 4px 16px rgba(0,0,0,0.2);transform:translateY(-2px)}',
      '.d-btn-outline:active{transform:translateY(1px) scale(0.97);box-shadow:none}',
      '.d-btn-ghost{background:transparent;border-color:transparent;box-shadow:none}',
      '.d-btn-ghost:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);transform:translateY(-1px)}',
      '.d-btn-link{background:transparent;border:none;box-shadow:none;color:var(--c1);text-decoration:underline}',
      '.d-btn-link:hover{color:var(--c6);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-btn-sm{font-size:0.75rem;padding:0.375rem 0.75rem}',
      '.d-btn-lg{font-size:1rem;padding:0.625rem 1.5rem}'
    ].join(''),
    card: [
      '.d-card{background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius-lg);box-shadow:var(--d-shadow);color:var(--c3);transition:var(--d-transition)}',
      '.d-card-hover:hover{box-shadow:0 12px 48px rgba(249,115,22,0.2),0 4px 16px rgba(0,0,0,0.3);transform:translateY(-4px);border-color:color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-card-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem}',
      '.d-card-body{padding:1.5rem}',
      '.d-card-footer{padding:0 1.5rem 1.5rem;border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent)}'
    ].join(''),
    input: [
      '.d-input-wrap{background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 95%,var(--c2)),var(--c0));border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15);transition:var(--d-transition);display:flex;align-items:center}',
      '.d-input-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-input{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem}',
      '.d-input::placeholder{color:var(--c4)}',
      '.d-input-error{border-color:var(--c9)}',
      '.d-input-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    badge: [
      '.d-badge{display:inline-flex;align-items:center;gap:0.25rem;background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff;border-radius:9999px;border:1px solid color-mix(in srgb,var(--c1) 40%,transparent);font-size:0.75rem;padding:0.125rem 0.5rem;font-weight:500;box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--c1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}',
      '@keyframes d-ember-pulse{0%,100%{box-shadow:0 0 8px color-mix(in srgb,var(--c1) 50%,transparent)}50%{box-shadow:0 0 16px color-mix(in srgb,var(--c1) 80%,transparent),0 0 4px color-mix(in srgb,var(--c1) 30%,transparent)}}',
      '.d-badge-processing .d-badge-dot{animation:d-ember-pulse 2s ease-in-out infinite}'
    ].join(''),
    modal: [
      '.d-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000;animation:d-fade-in 0.25s ease}',
      '.d-modal-content{background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);border-radius:var(--d-radius-lg);box-shadow:0 24px 80px rgba(0,0,0,0.4),0 0 40px color-mix(in srgb,var(--c1) 10%,transparent);max-width:90vw;max-height:85vh;overflow:auto;color:var(--c3);animation:d-lava-rise 0.35s cubic-bezier(0.22,1,0.36,1)}',
      '.d-modal-header{padding:1.5rem 1.5rem 0;font-weight:600;font-size:1.125rem;display:flex;justify-content:space-between;align-items:center}',
      '.d-modal-body{padding:1.5rem}',
      '.d-modal-footer{padding:0 1.5rem 1.5rem;display:flex;justify-content:flex-end;gap:0.5rem;border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-modal-close{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:1.25rem;line-height:1;border-radius:var(--d-radius);transition:var(--d-transition)}',
      '.d-modal-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}',
      '@keyframes d-fade-in{from{opacity:0}to{opacity:1}}',
      '@keyframes d-lava-rise{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}'
    ].join(''),
    textarea: [
      '.d-textarea-wrap{background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 95%,var(--c2)),var(--c0));border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15);transition:var(--d-transition)}',
      '.d-textarea-wrap:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-textarea{background:transparent;border:none;outline:none;color:var(--c3);width:100%;font:inherit;padding:0.5rem 0.75rem;resize:vertical;min-height:80px}',
      '.d-textarea::placeholder{color:var(--c4)}',
      '.d-textarea-error{border-color:var(--c9)}',
      '.d-textarea-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),inset 0 2px 4px rgba(0,0,0,0.15),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    checkbox: [
      '.d-checkbox{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-checkbox:hover{transform:translateY(-1px)}',
      '.d-checkbox-check{width:20px;height:20px;border:1px solid var(--c5);border-radius:calc(var(--d-radius) * 0.4);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 95%,var(--c2)),var(--c0));transition:var(--d-transition);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1)}',
      '.d-checkbox-checked .d-checkbox-check{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}',
      '.d-checkbox-native:focus-visible~.d-checkbox-check{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    switch: [
      '.d-switch-track{width:44px;height:24px;border:1px solid var(--c5);border-radius:12px;background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));transition:var(--d-transition);position:relative;box-shadow:inset 0 2px 4px rgba(0,0,0,0.15)}',
      '.d-switch-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#fff,#e0e0e0);position:absolute;top:2px;left:3px;transition:var(--d-transition);box-shadow:0 2px 6px rgba(0,0,0,0.2)}',
      '.d-switch-checked .d-switch-track{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-color:color-mix(in srgb,var(--c1) 60%,#000);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 0 12px color-mix(in srgb,var(--c1) 20%,transparent)}',
      '.d-switch-checked .d-switch-thumb{left:22px;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-switch-native:focus-visible~.d-switch-track{outline:2px solid var(--c1);outline-offset:2px;box-shadow:0 0 16px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    select: [
      '.d-select{background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 95%,var(--c2)),var(--c0));border:1px solid var(--c5);border-radius:var(--d-radius);box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);color:var(--c3);padding:0.5rem 0.75rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-select:hover{border-color:color-mix(in srgb,var(--c1) 30%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-open .d-select{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 20%,transparent),0 0 16px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-dropdown{background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 40px rgba(0,0,0,0.3),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent);margin-top:4px;overflow:hidden}',
      '.d-select-option{padding:0.5rem 0.75rem;cursor:pointer;transition:var(--d-transition)}',
      '.d-select-option:hover{background:color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-select-option-active{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));color:#fff}',
      '.d-select-option-highlight{background:color-mix(in srgb,var(--c1) 8%,transparent)}',
      '.d-select-error{border-color:var(--c9)}',
      '.d-select-error:focus-within{border-color:var(--c9);box-shadow:0 0 0 3px color-mix(in srgb,var(--c9) 20%,transparent),0 0 16px color-mix(in srgb,var(--c9) 10%,transparent)}'
    ].join(''),
    tabs: [
      '.d-tabs-list{display:flex;gap:0;border-bottom:1px solid color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-tab{padding:0.5rem 1rem;cursor:pointer;border:none;border-bottom:2px solid transparent;color:var(--c4);font-weight:500;transition:var(--d-transition);background:transparent;position:relative}',
      '.d-tab:hover{color:var(--c3);background:color-mix(in srgb,var(--c1) 5%,transparent);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-tab-active{color:var(--c1);border-bottom-color:var(--c1);text-shadow:0 0 12px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-tabs-panel{padding:1rem 0}'
    ].join(''),
    accordion: [
      '.d-accordion-item{border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);margin-bottom:0.5rem;box-shadow:var(--d-shadow);overflow:hidden;background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 90%,#000))}',
      '.d-accordion-trigger{width:100%;padding:0.75rem 1rem;background:transparent;border:none;color:var(--c3);font:inherit;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:var(--d-transition)}',
      '.d-accordion-trigger:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-accordion-content{padding:0.75rem 1rem;border-top:1px solid color-mix(in srgb,var(--c1) 10%,transparent);background:color-mix(in srgb,var(--c0) 80%,var(--c2))}'
    ].join(''),
    separator: [
      '.d-separator{display:flex;align-items:center;gap:0.75rem;margin:1rem 0}',
      '.d-separator-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c1) 20%,transparent),transparent)}',
      '.d-separator-label{color:var(--c4);font-size:0.85rem}',
      '.d-separator-vertical{width:1px;align-self:stretch;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--c1) 20%,transparent),transparent);margin:0 1rem}'
    ].join(''),
    breadcrumb: [
      '.d-breadcrumb-link{color:var(--c1);text-decoration:none;cursor:pointer;transition:var(--d-transition);font-weight:500}',
      '.d-breadcrumb-link:hover{color:var(--c6);text-shadow:0 0 8px color-mix(in srgb,var(--c1) 25%,transparent)}',
      '.d-breadcrumb-separator{color:var(--c4);margin:0 0.5rem}',
      '.d-breadcrumb-current{color:var(--c3);font-weight:600}'
    ].join(''),
    table: [
      '.d-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow);overflow:hidden}',
      '.d-th{background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),var(--c2));color:var(--c3);font-weight:600;text-align:left;padding:0.75rem 1rem;border-bottom:1px solid color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-td{padding:0.75rem 1rem;border-bottom:1px solid color-mix(in srgb,var(--c1) 8%,transparent);color:var(--c3)}',
      '.d-tr{transition:var(--d-transition)}',
      '.d-table-striped tbody .d-tr:nth-child(even){background:color-mix(in srgb,var(--c1) 3%,transparent)}',
      '.d-table-hover .d-tr:hover{background:color-mix(in srgb,var(--c1) 8%,transparent);box-shadow:inset 0 0 20px color-mix(in srgb,var(--c1) 5%,transparent)}'
    ].join(''),
    avatar: [
      '.d-avatar{width:40px;height:40px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c1) 30%,transparent);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,color-mix(in srgb,var(--c2) 90%,var(--c1)),var(--c2));box-shadow:0 2px 12px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-avatar img{width:100%;height:100%;object-fit:cover}',
      '.d-avatar-fallback{font-weight:600;color:var(--c1);font-size:1rem;text-shadow:0 0 8px color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    progress: [
      '.d-progress{width:100%;height:10px;background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));border:1px solid color-mix(in srgb,var(--c1) 10%,transparent);border-radius:9999px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.15)}',
      '.d-progress-bar{height:100%;background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1) 70%,#000));border-radius:9999px;transition:width 0.4s cubic-bezier(0.22,1,0.36,1);box-shadow:0 0 8px color-mix(in srgb,var(--c1) 30%,transparent)}',
      '.d-progress-success .d-progress-bar{background:linear-gradient(135deg,var(--c7),color-mix(in srgb,var(--c7) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c7) 30%,transparent)}',
      '.d-progress-warning .d-progress-bar{background:linear-gradient(135deg,var(--c8),color-mix(in srgb,var(--c8) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c8) 30%,transparent)}',
      '.d-progress-error .d-progress-bar{background:linear-gradient(135deg,var(--c9),color-mix(in srgb,var(--c9) 70%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--c9) 30%,transparent)}',
      '@keyframes d-lava-stripe{0%{background-position:0 0}100%{background-position:20px 0}}',
      '.d-progress-striped .d-progress-bar{background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.1) 5px,rgba(255,255,255,0.1) 10px);animation:d-lava-stripe 0.8s linear infinite}'
    ].join(''),
    skeleton: [
      '@keyframes d-lava-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
      '.d-skeleton{background:linear-gradient(90deg,var(--c2) 25%,color-mix(in srgb,var(--c2) 70%,var(--c1)) 50%,var(--c2) 75%);background-size:200% 100%;animation:d-lava-shimmer 2s ease-in-out infinite;border-radius:var(--d-radius);border:1px solid color-mix(in srgb,var(--c1) 8%,transparent)}'
    ].join(''),
    tooltip: [
      '.d-tooltip{background:linear-gradient(135deg,color-mix(in srgb,var(--c3) 95%,var(--c1)),var(--c3));color:var(--c0);padding:0.375rem 0.75rem;border-radius:var(--d-radius);font-size:0.8rem;box-shadow:0 4px 16px rgba(0,0,0,0.3),0 0 8px color-mix(in srgb,var(--c1) 15%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent)}'
    ].join(''),
    alert: [
      '.d-alert{padding:0.75rem 1rem;border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:var(--d-shadow);color:var(--c3);background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 90%,#000));display:flex;align-items:flex-start;gap:0.75rem;transition:var(--d-transition)}',
      '.d-alert-info{border-color:color-mix(in srgb,var(--c1) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c1)),var(--c0));box-shadow:0 4px 24px color-mix(in srgb,var(--c1) 10%,transparent)}',
      '.d-alert-success{border-color:color-mix(in srgb,var(--c7) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c7)),var(--c0));box-shadow:0 4px 24px color-mix(in srgb,var(--c7) 10%,transparent)}',
      '.d-alert-warning{border-color:color-mix(in srgb,var(--c8) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c8)),var(--c0));box-shadow:0 4px 24px color-mix(in srgb,var(--c8) 10%,transparent)}',
      '.d-alert-error{border-color:color-mix(in srgb,var(--c9) 30%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--c0) 92%,var(--c9)),var(--c0));box-shadow:0 4px 24px color-mix(in srgb,var(--c9) 10%,transparent)}',
      '.d-alert-dismiss{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:1rem;line-height:1;border-radius:var(--d-radius);transition:var(--d-transition);margin-left:auto}',
      '.d-alert-dismiss:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}'
    ].join(''),
    toast: [
      '.d-toast{padding:0.75rem 1rem;border:1px solid color-mix(in srgb,var(--c1) 15%,transparent);border-radius:var(--d-radius);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 20px color-mix(in srgb,var(--c1) 10%,transparent);color:var(--c3);background:linear-gradient(145deg,var(--c2),color-mix(in srgb,var(--c2) 85%,#000));display:flex;align-items:center;gap:0.75rem;transition:var(--d-transition);animation:d-lava-rise 0.35s cubic-bezier(0.22,1,0.36,1)}',
      '.d-toast-info{border-color:color-mix(in srgb,var(--c1) 30%,transparent);border-left:4px solid var(--c1);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c1) 15%,transparent)}',
      '.d-toast-success{border-color:color-mix(in srgb,var(--c7) 30%,transparent);border-left:4px solid var(--c7);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c7) 15%,transparent)}',
      '.d-toast-warning{border-color:color-mix(in srgb,var(--c8) 30%,transparent);border-left:4px solid var(--c8);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c8) 15%,transparent)}',
      '.d-toast-error{border-color:color-mix(in srgb,var(--c9) 30%,transparent);border-left:4px solid var(--c9);box-shadow:0 12px 48px rgba(0,0,0,0.3),0 0 16px color-mix(in srgb,var(--c9) 15%,transparent)}',
      '.d-toast-close{background:color-mix(in srgb,var(--c1) 10%,transparent);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);color:var(--c4);cursor:pointer;padding:0.25rem 0.5rem;font-size:1rem;line-height:1;border-radius:var(--d-radius);transition:var(--d-transition);margin-left:auto}',
      '.d-toast-close:hover{color:var(--c3);background:color-mix(in srgb,var(--c9) 80%,transparent);border-color:var(--c9);box-shadow:0 0 12px color-mix(in srgb,var(--c9) 30%,transparent)}'
    ].join('')
  }
};
