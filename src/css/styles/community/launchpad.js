/**
 * Launchpad — Clean, professional aesthetic inspired by fly.io.
 * Navy-violet palette, semi-transparent surfaces, violet-tinted shadows.
 * Gradient accent buttons, transparent nav with violet active states.
 *
 * Decorative classes (lp-* prefix) are injected via the components field,
 * following the same pattern as gaming-guild's gg-* utilities.
 * These classes are used by the Launchpad recipe to compose
 * standard Decantr components into the launchpad visual language.
 */
export const launchpad = {
  id: 'launchpad',
  name: 'Launchpad',
  seed: {
    primary: '#7C3AED',
    accent: '#4F46E5',
    tertiary: '#06B6D4',
    neutral: '#281950',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    bg: '#F9F9FD',
    bgDark: '#0F0B1A',
  },
  personality: {
    radius: 'rounded',
    elevation: 'shadow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '-0.01em',
  },
  overrides: {
    light: {
      '--d-bg': '#F9F9FD',
      '--d-fg': '#22183C',
      '--d-muted-fg': 'rgba(40,25,80,0.6)',
      '--d-surface-1': 'rgba(255,255,255,0.75)',
      '--d-surface-2': 'rgba(255,255,255,0.5)',
      '--d-surface-3': '#F0EEF7',
      '--d-border': '#E7E6F4',
      '--d-border-strong': '#D4CEE9',
      '--d-field-bg': '#FFFFFF',
      '--d-field-border': '#D4CEE9',
      '--d-field-border-hover': '#8B5CF6',
      '--d-item-hover-bg': 'rgba(139,92,246,0.05)',
    },
    dark: {
      '--d-bg': '#0F0B1A',
      '--d-fg': '#EEEDF5',
      '--d-muted-fg': 'rgba(200,195,220,0.6)',
      '--d-surface-1': 'rgba(30,22,50,0.75)',
      '--d-surface-2': 'rgba(30,22,50,0.5)',
      '--d-surface-3': '#2A2040',
      '--d-border': '#2A2040',
      '--d-border-strong': '#3D3060',
      '--d-field-bg': '#1E1632',
      '--d-field-border': '#2A2040',
      '--d-field-border-hover': '#8B5CF6',
      '--d-item-hover-bg': 'rgba(139,92,246,0.08)',
    },
  },
  components: [
    // ── Body / base ──
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-primary-subtle);color:var(--d-primary-subtle-fg)}',
    // ── Scrollbar ──
    '::-webkit-scrollbar{width:8px;height:8px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:var(--d-border-strong);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-muted-fg)}',
    // ── Component overrides: Card — violet-tinted shadow ──
    '.d-card{border:1px solid #E7E6F4;box-shadow:rgba(91,33,182,0.05) 0px 4px 6px -4px;border-radius:10px}',
    '.d-card:hover{box-shadow:rgba(91,33,182,0.1) 0px 4px 6px -2px}',
    // ── Component overrides: Input — violet focus ring ──
    '.d-input,.d-textarea,.d-select-trigger{border:1px solid #D4CEE9;background:var(--d-field-bg)}',
    '.d-input:focus,.d-textarea:focus,.d-select-trigger:focus{border-color:var(--d-primary);box-shadow:0 0 0 3px rgba(124,58,237,0.1)}',
    // ── Component overrides: Button — gradient primary ──
    '.d-btn-primary{background:#7C3AED;background-image:linear-gradient(to right bottom,#A02BE4,transparent,#4F46E5);box-shadow:rgba(67,56,202,0.25) 0px 0px 0px 1px inset,rgba(91,33,182,0.2) 0px 2px 4px;border-radius:9px;color:#fff}',
    '.d-btn-primary:hover{filter:brightness(1.05);box-shadow:rgba(67,56,202,0.3) 0px 0px 0px 1px inset,rgba(91,33,182,0.3) 0px 4px 8px}',
    // ── Shell header override ──
    '.d-shell-header{background:rgba(255,255,255,0.75);backdrop-filter:blur(12px);box-shadow:rgba(0,0,0,0.1) 0px 1px 3px,rgba(0,0,0,0.1) 0px 1px 2px -1px}',
    // ── Keyframes ──
    '@keyframes lp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    // ── lp-panel: main content panel with violet shadow ──
    '.lp-panel{background:rgba(255,255,255,0.75);border-radius:10px;box-shadow:rgba(91,33,182,0.075) 0px 10px 15px -3px,rgba(91,33,182,0.075) 0px 4px 6px -4px,rgba(91,33,182,0.075) 0px 0px 0px 1px}',
    // ── lp-card: card inside panel ──
    '.lp-card{background:#fff;border:1px solid #E7E6F4;border-radius:10px;box-shadow:rgba(91,33,182,0.05) 0px 4px 6px -4px}',
    // ── lp-card-hover: card with hover shadow escalation ──
    '.lp-card-hover{background:#fff;border:1px solid #E7E6F4;border-radius:10px;box-shadow:rgba(91,33,182,0.05) 0px 4px 6px -4px;transition:box-shadow 0.15s ease,border-color 0.15s ease}.lp-card-hover:hover{box-shadow:rgba(91,33,182,0.12) 0px 8px 16px -4px;border-color:#D4CEE9}',
    // ── lp-header: full-width header bar ──
    '.lp-header{background:rgba(255,255,255,0.75);backdrop-filter:blur(12px);box-shadow:rgba(0,0,0,0.1) 0px 1px 3px,rgba(0,0,0,0.1) 0px 1px 2px -1px}',
    // ── lp-btn-gradient: primary gradient button ──
    '.lp-btn-gradient{background:#7C3AED;background-image:linear-gradient(to right bottom,#A02BE4,transparent,#4F46E5);color:#fff;box-shadow:rgba(67,56,202,0.25) 0px 0px 0px 1px inset;border-radius:9px;border:none;padding:8px 16px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:14px}.lp-btn-gradient:hover{filter:brightness(1.08)}',
    // ── lp-btn-outline: outline button ──
    '.lp-btn-outline{background:#fff;border:1px solid #D4CEE9;box-shadow:rgba(221,214,254,0.5) 0px 1px 2px;border-radius:9px;color:#22183C;padding:8px 16px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:14px}.lp-btn-outline:hover{border-color:#8B5CF6;background:rgba(139,92,246,0.03)}',
    // ── lp-nav-item: nav link styling ──
    '.lp-nav-item{background:transparent;padding:8px 10px;border-radius:8px;font-weight:450;font-size:14.5px;color:#22183C;display:flex;align-items:center;gap:10px;text-decoration:none;transition:background 0.15s ease}.lp-nav-item:hover{background:rgba(139,92,246,0.05)}',
    // ── lp-nav-active: active nav link ──
    '.lp-nav-active{background:rgba(139,92,246,0.1)!important;color:#6D28D9}',
    // ── lp-divider: section divider ──
    '.lp-divider{border:none;border-top:1px solid #E7E6F4;margin:8px 0}',
    // ── lp-surface: elevated surface ──
    '.lp-surface{background:rgba(255,255,255,0.5);border-radius:var(--d-radius)}',
    // ── lp-dot: status indicators ──
    '.lp-dot{display:inline-block;width:8px;height:8px;border-radius:var(--d-radius-full);background:var(--d-muted-fg)}',
    '.lp-dot-success{background:var(--d-success)}',
    '.lp-dot-warning{background:var(--d-warning)}',
    '.lp-dot-error{background:var(--d-error)}',
    // ── lp-brand-bg: deep violet brand background ──
    '.lp-brand-bg{background:#4C1D95;color:#FAFAFA}',
    '[data-mode="dark"] .lp-brand-bg,.lp-brand-bg[data-mode="dark"]{background:#2E1065}',
    // ── lp-gradient-hero: violet-to-transparent gradient ──
    '.lp-gradient-hero{background:linear-gradient(180deg,rgba(124,58,237,0.15) 0%,transparent 60%)}',
    '[data-mode="dark"] .lp-gradient-hero,.lp-gradient-hero[data-mode="dark"]{background:linear-gradient(180deg,rgba(124,58,237,0.2) 0%,transparent 60%)}',
    // ── lp-kbd: keyboard shortcut badge ──
    '.lp-kbd{display:inline-flex;align-items:center;padding:2px 6px;border-radius:4px;border:1px solid #E7E6F4;background:rgba(255,255,255,0.5);font-family:var(--d-font-mono);font-size:var(--d-text-xs);color:var(--d-muted-fg);line-height:1}',
    // ── lp-code-inline: inline code styling ──
    '.lp-code-inline{padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.5);font-family:var(--d-font-mono);font-size:0.875em;color:var(--d-fg)}',
    // ── lp-shimmer: subtle shimmer animation ──
    '.lp-shimmer{background:linear-gradient(90deg,transparent 25%,rgba(255,255,255,0.5) 50%,transparent 75%);background-size:200% 100%;animation:lp-shimmer 2s ease-in-out infinite}',
    // ── Shell nav override ──
    '.d-shell-nav{padding:var(--d-sp-2) 0}',
    // ── Dark mode overrides ──
    '[data-mode="dark"] .lp-panel{background:rgba(30,22,50,0.75);box-shadow:rgba(91,33,182,0.15) 0px 10px 15px -3px,rgba(91,33,182,0.15) 0px 4px 6px -4px,rgba(91,33,182,0.15) 0px 0px 0px 1px}',
    '[data-mode="dark"] .lp-card,[data-mode="dark"] .lp-card-hover{background:#1E1632;border-color:#2A2040}',
    '[data-mode="dark"] .lp-header{background:rgba(15,11,26,0.85)}',
    '[data-mode="dark"] .lp-nav-item{color:#EEEDF5}',
    '[data-mode="dark"] .lp-nav-active{background:rgba(139,92,246,0.15)!important;color:#A78BFA}',
    '[data-mode="dark"] .lp-divider{border-color:#2A2040}',
    '[data-mode="dark"] .lp-btn-outline{background:#1E1632;border-color:#3D3060;color:#EEEDF5}',
    '[data-mode="dark"] .d-card{border-color:#2A2040}',
    '[data-mode="dark"] .d-input,[data-mode="dark"] .d-textarea,[data-mode="dark"] .d-select-trigger{border-color:#2A2040}',
    '[data-mode="dark"] .d-shell-header{background:rgba(15,11,26,0.85)}',
  ].join(''),
};
