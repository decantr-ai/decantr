/**
 * Prismatic — Chromatic depth shifting. Iridescent, futuristic.
 * Surfaces change hue as they layer deeper, creating a rainbow-depth effect.
 * Each elevation level has a different hue tint.
 */
export const prismatic = {
  id: 'prismatic',
  name: 'Prismatic',
  seed: {
    primary: '#6366f1',
    accent: '#ec4899',
    tertiary: '#14b8a6',
    neutral: '#71717a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    bg: '#fafafa',
    bgDark: '#0a0a0f',
  },
  personality: {
    radius: 'rounded',
    elevation: 'raised',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '0',
  },
  overrides: {
    light: {
      // Hue-shifted surfaces — each depth has a different tint
      '--d-surface-0': '#fafafa',
      '--d-surface-1': 'rgba(99,102,241,0.04)',
      '--d-surface-1-fg': '#1a1a2e',
      '--d-surface-2': 'rgba(236,72,153,0.05)',
      '--d-surface-2-fg': '#1a1a2e',
      '--d-surface-3': 'rgba(20,184,166,0.06)',
      '--d-surface-3-fg': '#1a1a2e',
      '--d-field-bg': 'rgba(255,255,255,0.8)',
      '--d-field-border': 'rgba(99,102,241,0.15)',
      '--d-field-border-hover': 'rgba(99,102,241,0.3)',
      '--d-item-hover-bg': 'rgba(99,102,241,0.05)',
    },
    dark: {
      // Hue-shifted surfaces — dark mode
      '--d-surface-0': '#0a0a0f',
      '--d-surface-1': 'rgba(99,102,241,0.08)',
      '--d-surface-1-fg': '#e8e8f0',
      '--d-surface-2': 'rgba(236,72,153,0.08)',
      '--d-surface-2-fg': '#e8e8f0',
      '--d-surface-3': 'rgba(20,184,166,0.08)',
      '--d-surface-3-fg': '#e8e8f0',
      '--d-border': 'rgba(99,102,241,0.12)',
      '--d-border-strong': 'rgba(99,102,241,0.22)',
      '--d-field-bg': 'rgba(255,255,255,0.04)',
      '--d-field-border': 'rgba(99,102,241,0.15)',
      '--d-field-border-hover': 'rgba(99,102,241,0.3)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.05)',
      '--d-chart-0': '#6366f1',
      '--d-chart-1': '#ec4899',
      '--d-chart-2': '#14b8a6',
      '--d-chart-3': '#f59e0b',
      '--d-chart-4': '#ef4444',
      '--d-chart-5': '#8b5cf6',
      '--d-chart-6': '#06b6d4',
      '--d-chart-7': '#f97316',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Scrollbar — iridescent gradient thumb
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--d-primary),var(--d-accent),var(--d-tertiary));border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--d-accent),var(--d-tertiary),var(--d-primary))}',
    // Card — chromatic border based on depth
    '.d-card{border:var(--d-border-width) solid rgba(99,102,241,0.15);box-shadow:var(--d-elevation-1)}',
    // Modal — gradient border
    '.d-modal-content{border:var(--d-border-width) solid rgba(236,72,153,0.15);box-shadow:var(--d-elevation-3)}',
    // Button — indigo glow
    '.d-btn-primary{box-shadow:0 0 12px rgba(99,102,241,0.2)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(99,102,241,0.35)}',
    // Prismatic utilities
    '.d-prismatic-shift{transition:filter var(--d-tr-normal) var(--d-ease-standard)}',
    '.d-prismatic-shift:hover{filter:hue-rotate(30deg)}',
    '.d-prismatic-border{border-image:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary)) 1}',
    // Gradient text
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Mesh — iridescent
    '.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(99,102,241,0.1) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(236,72,153,0.08) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(20,184,166,0.06) 0%,transparent 50%),var(--d-bg)}',
  ].join(''),
};
