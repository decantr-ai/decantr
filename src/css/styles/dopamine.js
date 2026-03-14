/**
 * Dopamine — Saturated maximalism. Y2K revival.
 * Joyful, loud, electric. Maximum saturation, heavy type, gradient everything.
 * The anti-minimal design language.
 */
export const dopamine = {
  id: 'dopamine',
  name: 'Dopamine',
  seed: {
    primary: '#ff00e5',
    accent: '#00ff88',
    tertiary: '#ffea00',
    neutral: '#8b8b8b',
    success: '#00ff88',
    warning: '#ffea00',
    error: '#ff3366',
    info: '#00ccff',
    bg: '#fff5fc',
    bgDark: '#0d0015',
  },
  personality: {
    radius: 'pill',
    elevation: 'raised',
    motion: 'bouncy',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '800',
    '--d-fw-title': '700',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {
      '--d-field-bg': 'rgba(255,255,255,0.7)',
      '--d-field-border': 'rgba(255,0,229,0.15)',
      '--d-field-border-hover': 'rgba(255,0,229,0.3)',
      '--d-item-hover-bg': 'rgba(255,0,229,0.06)',
    },
    dark: {
      '--d-border': 'rgba(255,0,229,0.12)',
      '--d-border-strong': 'rgba(255,0,229,0.25)',
      '--d-field-bg': 'rgba(255,255,255,0.04)',
      '--d-field-border': 'rgba(255,0,229,0.15)',
      '--d-field-border-hover': 'rgba(255,0,229,0.3)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.06)',
      '--d-chart-0': '#ff00e5',
      '--d-chart-1': '#00ff88',
      '--d-chart-2': '#ffea00',
      '--d-chart-3': '#00ccff',
      '--d-chart-4': '#ff3366',
      '--d-chart-5': '#9d4edd',
      '--d-chart-6': '#ff6b00',
      '--d-chart-7': '#00ffd5',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-primary);color:#fff}',
    // Scrollbar — gradient thumb
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--d-primary),var(--d-accent));border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--d-accent),var(--d-primary))}',
    // Card — gradient border
    '.d-card{border:var(--d-border-width) solid transparent;background-clip:padding-box;box-shadow:var(--d-elevation-1);position:relative}',
    // Modal — elevated glow
    '.d-modal-content{box-shadow:var(--d-elevation-3),0 0 40px rgba(255,0,229,0.15)}',
    // Button — glow + hue-rotate on hover
    '.d-btn-primary{box-shadow:0 0 16px rgba(255,0,229,0.3),0 0 4px rgba(0,255,136,0.2)}',
    '.d-btn-primary:hover{box-shadow:0 0 24px rgba(255,0,229,0.4),0 0 8px rgba(0,255,136,0.3);filter:hue-rotate(15deg)}',
    // Badge/chip uppercase
    '.d-badge,.d-badge-sup,.d-chip{text-transform:uppercase;letter-spacing:0.04em}',
    // Dopamine utilities
    '.d-dopamine-glow{box-shadow:0 0 20px rgba(255,0,229,0.25),0 0 40px rgba(0,255,136,0.15)}',
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary),var(--d-primary));background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Mesh — electric neon radials
    '.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(255,0,229,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(0,255,136,0.1) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(255,234,0,0.08) 0%,transparent 50%),var(--d-bg)}',
  ].join(''),
};
