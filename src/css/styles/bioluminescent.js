/**
 * Bioluminescent — Deep ocean aesthetic. Organic glow.
 * Luminescent edges on dark backgrounds, living and breathing UI.
 * Glowing borders, pulsing animations, deep abyss backgrounds.
 */
export const bioluminescent = {
  id: 'bioluminescent',
  name: 'Bioluminescent',
  seed: {
    primary: '#00ffd5',
    accent: '#7b61ff',
    tertiary: '#ff6b9d',
    neutral: '#6b8299',
    success: '#00e676',
    warning: '#ffab40',
    error: '#ff5252',
    info: '#40c4ff',
    bg: '#f0fdf4',
    bgDark: '#020817',
  },
  personality: {
    radius: 'pill',
    elevation: 'glow',
    motion: 'smooth',
    borders: 'none',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '500',
    '--d-fw-title': '400',
    '--d-ls-heading': '0.03em',
  },
  overrides: {
    light: {
      '--d-border': 'rgba(0,255,213,0.12)',
      '--d-border-strong': 'rgba(0,255,213,0.22)',
      '--d-field-bg': 'rgba(255,255,255,0.6)',
      '--d-field-border': 'rgba(0,255,213,0.15)',
      '--d-field-border-hover': 'rgba(0,255,213,0.3)',
      '--d-item-hover-bg': 'rgba(0,255,213,0.06)',
    },
    dark: {
      '--d-bg': '#020817',
      '--d-fg': '#c8e6df',
      '--d-muted-fg': '#5a8a7d',
      '--d-border': 'rgba(0,255,213,0.1)',
      '--d-border-strong': 'rgba(0,255,213,0.2)',
      '--d-field-bg': 'rgba(0,255,213,0.04)',
      '--d-field-border': 'rgba(0,255,213,0.12)',
      '--d-field-border-hover': 'rgba(0,255,213,0.25)',
      '--d-item-hover-bg': 'rgba(0,255,213,0.06)',
      '--d-chart-0': '#00ffd5',
      '--d-chart-1': '#7b61ff',
      '--d-chart-2': '#ff6b9d',
      '--d-chart-3': '#00e676',
      '--d-chart-4': '#ffab40',
      '--d-chart-5': '#40c4ff',
      '--d-chart-6': '#e040fb',
      '--d-chart-7': '#76ff03',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:rgba(0,255,213,0.25);color:var(--d-fg)}',
    // Scrollbar — dark with glowing thumb
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(0,255,213,0.2);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(0,255,213,0.4);box-shadow:0 0 8px rgba(0,255,213,0.3)}',
    // Card — glowing edges
    '.d-card{border:none;box-shadow:var(--d-elevation-1),0 0 1px rgba(0,255,213,0.2)}',
    // Modal — intense glow
    '.d-modal-content{border:none;box-shadow:var(--d-elevation-3),0 0 2px rgba(0,255,213,0.3)}',
    // Button — bioluminescent glow
    '.d-btn-primary{box-shadow:0 0 12px rgba(0,255,213,0.25),0 0 4px rgba(0,255,213,0.15)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(0,255,213,0.35),0 0 8px rgba(0,255,213,0.2)}',
    // Bioluminescent utilities
    '@keyframes d-biolum-pulse{0%,100%{box-shadow:0 0 8px rgba(0,255,213,0.15)}50%{box-shadow:0 0 20px rgba(0,255,213,0.3),0 0 4px rgba(0,255,213,0.15)}}',
    '.d-biolum-pulse{animation:d-biolum-pulse 3s ease-in-out infinite}',
    '.d-biolum-edge{box-shadow:0 0 8px rgba(0,255,213,0.2),inset 0 0 8px rgba(0,255,213,0.05)}',
    '.d-biolum-trail{transition:box-shadow var(--d-tr-normal) var(--d-ease-standard)}',
    '.d-biolum-trail:hover{box-shadow:0 0 16px rgba(0,255,213,0.25),4px 0 12px rgba(123,97,255,0.15),-4px 0 12px rgba(255,107,157,0.15)}',
    // Gradient text — oceanic
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Mesh — underwater glow
    '.d-mesh{background:radial-gradient(ellipse at 30% 60%,rgba(0,255,213,0.08) 0%,transparent 50%),radial-gradient(ellipse at 70% 30%,rgba(123,97,255,0.06) 0%,transparent 50%),radial-gradient(ellipse at 50% 90%,rgba(255,107,157,0.04) 0%,transparent 50%),var(--d-bg)}',
    // Frosted dialog
    'dialog::backdrop{background:rgba(2,8,23,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
  ].join(''),
};
