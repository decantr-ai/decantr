/**
 * Editorial — Digital print magazine aesthetic.
 * High-contrast, dramatic typography, zero decoration.
 * Content is the design. Ink-on-paper warmth with modern sensibility.
 */
export const editorial = {
  id: 'editorial',
  name: 'Editorial',
  seed: {
    primary: '#1a1a1a',
    accent: '#c41e3a',
    tertiary: '#1a5276',
    neutral: '#6b6b6b',
    success: '#2d6a4f',
    warning: '#b45309',
    error: '#9b1b30',
    info: '#1a5276',
    bg: '#fefcf9',
    bgDark: '#111111',
  },
  personality: {
    radius: 'sharp',
    elevation: 'flat',
    motion: 'instant',
    borders: 'none',
    density: 'spacious',
    gradient: 'none',
  },
  typography: {
    '--d-font': 'Charter,"Bitstream Charter","Sitka Text",Cambria,serif',
    '--d-fw-heading': '900',
    '--d-fw-title': '800',
    '--d-fw-medium': '600',
    '--d-ls-heading': '0.06em',
  },
  overrides: {
    light: {
      '--d-border': 'rgba(0,0,0,0.1)',
      '--d-border-strong': 'rgba(0,0,0,0.2)',
      '--d-muted-fg': '#6b6b6b',
      '--d-field-bg': 'transparent',
      '--d-field-border': 'rgba(0,0,0,0.15)',
      '--d-field-border-hover': 'rgba(0,0,0,0.3)',
      '--d-item-hover-bg': 'rgba(0,0,0,0.03)',
    },
    dark: {
      '--d-bg': '#111111',
      '--d-fg': '#e8e4df',
      '--d-muted-fg': '#8a8580',
      '--d-border': 'rgba(255,255,255,0.1)',
      '--d-border-strong': 'rgba(255,255,255,0.2)',
      '--d-field-bg': 'transparent',
      '--d-field-border': 'rgba(255,255,255,0.15)',
      '--d-field-border-hover': 'rgba(255,255,255,0.3)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.04)',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-accent);color:#fff}',
    // Minimal scrollbar — 2px thin line
    '::-webkit-scrollbar{width:2px;height:2px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:var(--d-border-strong);border-radius:0}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-fg)}',
    // Card — top-border accent, no shadow
    '.d-card{border:none;border-top:2px solid var(--d-accent);box-shadow:none}',
    // Modal — clean, borderless
    '.d-modal-content{border:none;box-shadow:none;border-top:2px solid var(--d-accent)}',
    // Buttons — text-only or outlined, uppercase, tracked
    '.d-btn{text-transform:uppercase;letter-spacing:0.08em;font-weight:700;border-radius:0}',
    '.d-btn-primary{background:var(--d-fg);color:var(--d-bg);box-shadow:none}',
    '.d-btn-primary:hover{box-shadow:none;opacity:0.85}',
    // Editorial utilities
    '.d-editorial-rule{border:none;border-top:2px solid var(--d-fg);margin:var(--d-sp-6) 0}',
    '.d-editorial-pull{font-size:var(--d-text-xl);font-style:italic;font-weight:400;border-left:3px solid var(--d-accent);padding-left:var(--d-sp-4);margin:var(--d-sp-6) 0;line-height:var(--d-lh-relaxed)}',
    '.d-editorial-cap::first-letter{float:left;font-size:3.5em;line-height:0.8;font-weight:900;margin-right:var(--d-sp-2);margin-top:var(--d-sp-1)}',
  ].join(''),
};
