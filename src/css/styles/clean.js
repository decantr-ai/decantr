/**
 * Clean Style — Professional, understated, universally appropriate.
 * Subtle shadows, smooth motion, rounded corners. The safe default.
 *
 * Personality: rounded + subtle elevation + smooth motion + thin borders + no gradients
 * Works in both light and dark mode from the same definition.
 */
export const clean = {
  id: 'clean',
  name: 'Clean',
  seed: {
    primary: '#1366D9',
    accent: '#7c3aed',
    tertiary: '#0891b2',
    neutral: '#71717a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    bg: '#ffffff',
    bgDark: '#0a0a0a',
  },
  personality: {
    radius: 'rounded',
    elevation: 'subtle',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '-0.025em',
  },
  overrides: {
    light: {
      '--d-border': 'rgba(0,0,0,0.12)',
      '--d-border-strong': 'rgba(0,0,0,0.22)',
    },
    dark: {
      '--d-border': 'rgba(255,255,255,0.12)',
      '--d-border-strong': 'rgba(255,255,255,0.22)',
    },
  },
  /** Component CSS (injected into d.theme layer). Minimal — most styling comes from tokens. */
  components: [
    // Global body + selection
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Smooth scrollbar
    '::-webkit-scrollbar{width:8px;height:8px}',
    '::-webkit-scrollbar-track{background:var(--d-surface-0)}',
    '::-webkit-scrollbar-thumb{background:var(--d-border);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-border-strong)}',
  ].join(''),
};
