/**
 * Clay — Soft, pillowy, pastel aesthetic.
 * Everything looks molded from clay. Rounded forms, inner highlights,
 * squishy interactions. Gentle and tactile.
 */
export const clay = {
  id: 'clay',
  name: 'Clay',
  seed: {
    primary: '#a78bfa',
    accent: '#67e8f9',
    tertiary: '#fda4af',
    neutral: '#9ca3af',
    success: '#86efac',
    warning: '#fcd34d',
    error: '#fca5a5',
    info: '#93c5fd',
    bg: '#faf5ff',
    bgDark: '#1e1b2e',
  },
  personality: {
    radius: 'rounded',
    elevation: 'clay',
    motion: 'smooth',
    borders: 'none',
    density: 'spacious',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '0.01em',
  },
  overrides: {
    light: {
      '--d-border': 'rgba(0,0,0,0.06)',
      '--d-border-strong': 'rgba(0,0,0,0.12)',
      '--d-field-bg': 'rgba(255,255,255,0.7)',
      '--d-field-border': 'rgba(0,0,0,0.08)',
      '--d-field-border-hover': 'rgba(0,0,0,0.15)',
      '--d-item-hover-bg': 'rgba(0,0,0,0.03)',
    },
    dark: {
      '--d-border': 'rgba(255,255,255,0.06)',
      '--d-border-strong': 'rgba(255,255,255,0.12)',
      '--d-field-bg': 'rgba(255,255,255,0.06)',
      '--d-field-border': 'rgba(255,255,255,0.08)',
      '--d-field-border-hover': 'rgba(255,255,255,0.15)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.05)',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-primary-subtle);color:var(--d-primary-subtle-fg)}',
    // Scrollbar — rounded pill thumb
    '::-webkit-scrollbar{width:8px;height:8px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:var(--d-border-strong);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-muted-fg)}',
    // Card — soft inner highlight
    '.d-card{border:none;box-shadow:var(--d-elevation-1),inset 0 2px 4px rgba(255,255,255,0.5)}',
    '[data-mode="dark"] .d-card,.d-card[data-mode="dark"]{box-shadow:var(--d-elevation-1),inset 0 2px 4px rgba(255,255,255,0.1)}',
    '.d-card-inner{box-shadow:inset 0 1px 2px rgba(255,255,255,0.3)}',
    // Modal — pillow shadow
    '.d-modal-content{border:none;box-shadow:var(--d-elevation-3),inset 0 2px 4px rgba(255,255,255,0.5)}',
    // Button — soft squish
    '.d-btn-primary{box-shadow:var(--d-elevation-1),inset 0 1px 2px rgba(255,255,255,0.3)}',
    '.d-btn-primary:hover{box-shadow:var(--d-elevation-2),inset 0 1px 2px rgba(255,255,255,0.4)}',
  ].join(''),
};
