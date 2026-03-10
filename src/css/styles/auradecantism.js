/**
 * Auradecantism — Decantr's signature design style.
 * Dark glass aesthetic with vibrant purple/cyan/pink palette,
 * mesh gradient backgrounds, and luminous glow effects.
 * Default style for all Decantr implementations.
 */
export const auradecantism = {
  id: 'auradecantism',
  name: 'Auradecantism',
  seed: {
    primary: '#FE4474',
    accent: '#0AF3EB',
    tertiary: '#6500C6',
    neutral: '#8892a4',
    success: '#00C388',
    warning: '#FDA303',
    error: '#EF233C',
    info: '#0AF3EB',
    bg: '#f0f4ff',
    bgDark: '#060918',
  },
  personality: {
    radius: 'pill',
    elevation: 'glass',
    motion: 'bouncy',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '800',
    '--d-fw-title': '700',
    '--d-ls-heading': '-0.03em',
  },
  overrides: {
    light: {
      '--d-surface-1': 'rgba(255,255,255,0.6)',
      '--d-surface-2': 'rgba(255,255,255,0.72)',
      '--d-surface-3': 'rgba(255,255,255,0.82)',
      '--d-surface-1-filter': 'blur(16px) saturate(1.6)',
      '--d-surface-2-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-3-filter': 'blur(24px) saturate(2)',
    },
    dark: {
      '--d-surface-1': 'rgba(12,15,40,0.55)',
      '--d-surface-2': 'rgba(12,15,40,0.7)',
      '--d-surface-3': 'rgba(12,15,40,0.8)',
      '--d-surface-1-filter': 'blur(16px) saturate(1.6)',
      '--d-surface-2-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-3-filter': 'blur(24px) saturate(2)',
      '--d-border': 'rgba(255,255,255,0.08)',
      '--d-border-strong': 'rgba(255,255,255,0.15)',
      '--d-chart-0': '#FE4474',
      '--d-chart-1': '#0AF3EB',
      '--d-chart-2': '#6500C6',
      '--d-chart-3': '#00C388',
      '--d-chart-4': '#FDA303',
      '--d-chart-5': '#EF233C',
      '--d-chart-6': '#8B5CF6',
      '--d-chart-7': '#38BDF8',
    },
  },
  components: [
    // Body + selection + font smoothing
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Scrollbar
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(254,68,116,0.3);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(254,68,116,0.5)}',
    // Glass card enhancements
    '.d-card{border:1px solid rgba(255,255,255,0.1);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
    '.d-modal-content{border:1px solid rgba(255,255,255,0.12);box-shadow:var(--d-elevation-3),inset 0 1px 0 rgba(255,255,255,0.08)}',
    // Button glow
    '.d-btn-primary{box-shadow:0 0 12px rgba(254,68,116,0.25)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(254,68,116,0.4)}',
    // Mesh gradient background utility
    '.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(254,68,116,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(10,243,235,0.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(101,0,198,0.08) 0%,transparent 50%),var(--d-bg)}',
    // Gradient text utilities
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Glass panel utilities
    '.d-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
    '.d-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:1px solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 1px 0 rgba(255,255,255,0.08)}',
  ].join(''),
};
