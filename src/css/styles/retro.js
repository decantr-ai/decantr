/**
 * Retro Style — Neobrutalism. Bold borders, offset shadows, sharp corners, snappy motion.
 * Opinionated and distinctive. Everything feels physical and tactile.
 *
 * Personality: sharp + brutalist elevation + snappy motion + bold borders + no gradients
 * Works in both light and dark mode from the same definition.
 */
export const retro = {
  id: 'retro',
  name: 'Retro',
  seed: {
    primary: '#e63946',
    accent: '#457b9d',
    tertiary: '#2a9d8f',
    neutral: '#6b7280',
    success: '#1a7a42',
    warning: '#e06600',
    error: '#c41e1e',
    info: '#2e6b8a',
    bg: '#fffef5',
    bgDark: '#1a1a1a',
  },
  personality: {
    radius: 'sharp',
    elevation: 'brutalist',
    motion: 'snappy',
    borders: 'bold',
    density: 'comfortable',
    gradient: 'none',
  },
  /** Typography overrides — retro uses heavier weights and wider letter spacing */
  typography: {
    '--d-fw-heading': '800',
    '--d-fw-title': '800',
    '--d-fw-medium': '700',
    '--d-ls-heading': '0.05em',
  },
  overrides: {
    light: {
      '--d-field-border-width': 'var(--d-border-width-strong)',
    },
    dark: {
      '--d-bg': '#1a1a1a',
      '--d-field-border-width': 'var(--d-border-width-strong)',
    },
  },
  /** Component CSS — only for effects that tokens alone can't express */
  components: [
    // Global
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-primary);color:var(--d-primary-fg)}',
    // Neobrutalist uppercase accents
    '.d-btn{text-transform:uppercase;letter-spacing:0.05em}',
    '.d-badge,.d-badge-sup{text-transform:uppercase;letter-spacing:0.05em}',
    '.d-chip{text-transform:uppercase;letter-spacing:0.03em}',
    // Retro-specific keyframes
    '@keyframes d-drop-in{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}',
    // Bold scrollbar
    '::-webkit-scrollbar{width:10px;height:10px}',
    '::-webkit-scrollbar-track{background:var(--d-surface-0);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
    '::-webkit-scrollbar-thumb{background:var(--d-fg);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  ].join(''),
};
