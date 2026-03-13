/**
 * Glassmorphism — Stormy blue frosted glass aesthetic.
 * Dark glass surfaces with blue-tinted borders, sky-blue primary,
 * cyan accents, and atmospheric gradient backgrounds.
 * Inspired by stormy/lightning design language.
 */
export const glassmorphism = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  seed: {
    primary: '#38bdf8',
    accent: '#22d3ee',
    tertiary: '#4ade80',
    neutral: '#6b7a94',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#38bdf8',
    bg: '#f0f4f9',
    bgDark: '#0a0c10',
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
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {
      '--d-surface-1': 'rgba(240,244,249,0.6)',
      '--d-surface-2': 'rgba(240,244,249,0.72)',
      '--d-surface-3': 'rgba(240,244,249,0.82)',
      '--d-surface-1-filter': 'blur(16px) saturate(1.6)',
      '--d-surface-2-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-3-filter': 'blur(24px) saturate(2)',
      '--d-field-bg': 'rgba(255,255,255,0.5)',
      '--d-field-border': 'rgba(0,0,0,0.1)',
      '--d-field-border-hover': 'rgba(0,0,0,0.18)',
      '--d-item-hover-bg': 'rgba(0,0,0,0.04)',
    },
    dark: {
      '--d-surface-1': 'rgba(17,19,24,0.7)',
      '--d-surface-2': 'rgba(17,19,24,0.78)',
      '--d-surface-3': 'rgba(17,19,24,0.85)',
      '--d-surface-1-filter': 'blur(12px) saturate(1.4)',
      '--d-surface-2-filter': 'blur(16px) saturate(1.5)',
      '--d-surface-3-filter': 'blur(20px) saturate(1.6)',
      '--d-border': 'rgba(56,189,248,0.1)',
      '--d-border-strong': 'rgba(56,189,248,0.2)',
      '--d-field-bg': 'rgba(255,255,255,0.06)',
      '--d-field-border': 'rgba(56,189,248,0.1)',
      '--d-field-border-hover': 'rgba(56,189,248,0.2)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.08)',
      '--d-fg': '#c5d3e8',
      '--d-muted-fg': '#8494ad',
      '--d-chart-0': '#38bdf8',
      '--d-chart-1': '#22d3ee',
      '--d-chart-2': '#4ade80',
      '--d-chart-3': '#fbbf24',
      '--d-chart-4': '#f87171',
      '--d-chart-5': '#a78bfa',
      '--d-chart-6': '#fb923c',
      '--d-chart-7': '#e879f9',
    },
  },
  components: [
    // Body + selection + font smoothing
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Scrollbar — sky-blue tinted
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:var(--d-primary-border);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-primary-hover)}',
    // Card — blue-tinted border, no white inset highlight
    '.d-card{border:var(--d-border-width) solid rgba(56,189,248,0.15);box-shadow:var(--d-elevation-1)}',
    // Modal — slightly stronger blue border
    '.d-modal-content{border:var(--d-border-width) solid rgba(56,189,248,0.18);box-shadow:var(--d-elevation-3)}',
    // Button primary glow — sky-blue
    '.d-btn-primary{box-shadow:0 0 16px rgba(56,189,248,0.2)}',
    '.d-btn-primary:hover{box-shadow:0 0 24px rgba(56,189,248,0.35)}',
    // Mesh gradient background utility — stormy blue radials
    '.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(56,189,248,0.12) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(34,211,238,0.08) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(74,222,128,0.06) 0%,transparent 50%),var(--d-bg)}',
    // Gradient text utilities — stormy blue spectrum
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Glass panel utilities — three tiers with blue-tinted borders
    '.d-glass-subtle{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) solid rgba(56,189,248,0.08);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-0)}',
    '.d-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) solid rgba(56,189,248,0.15);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1)}',
    '.d-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) solid rgba(56,189,248,0.2);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2)}',
    // Frosted-glass dialog backdrops
    'dialog::backdrop{background:rgba(10,12,16,0.45);backdrop-filter:blur(12px) saturate(1.4);-webkit-backdrop-filter:blur(12px) saturate(1.4)}',
  ].join(''),
};
