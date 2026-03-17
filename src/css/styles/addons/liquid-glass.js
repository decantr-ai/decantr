/**
 * Liquid Glass — Apple-inspired premium glass aesthetic.
 * Refined, dynamic refraction feel. Extreme blur values,
 * dramatic opacity ramp, specular highlights. True black dark mode.
 */
export const liquidGlass = {
  id: 'liquid-glass',
  name: 'Liquid Glass',
  seed: {
    primary: '#007aff',
    accent: '#5856d6',
    tertiary: '#34c759',
    neutral: '#8e8e93',
    success: '#34c759',
    warning: '#ff9f0a',
    error: '#ff3b30',
    info: '#5ac8fa',
    bg: '#f2f2f7',
    bgDark: '#000000',
  },
  personality: {
    radius: 'pill',
    elevation: 'glass',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {
      '--d-surface-1': 'rgba(242,242,247,0.45)',
      '--d-surface-2': 'rgba(242,242,247,0.65)',
      '--d-surface-3': 'rgba(242,242,247,0.9)',
      '--d-surface-1-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-2-filter': 'blur(28px) saturate(2.0)',
      '--d-surface-3-filter': 'blur(36px) saturate(2.2)',
      '--d-field-bg': 'rgba(255,255,255,0.5)',
      '--d-field-border': 'rgba(0,0,0,0.08)',
      '--d-field-border-hover': 'rgba(0,0,0,0.15)',
      '--d-item-hover-bg': 'rgba(0,0,0,0.04)',
    },
    dark: {
      '--d-surface-1': 'rgba(0,0,0,0.45)',
      '--d-surface-2': 'rgba(0,0,0,0.65)',
      '--d-surface-3': 'rgba(0,0,0,0.9)',
      '--d-surface-1-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-2-filter': 'blur(28px) saturate(2.0)',
      '--d-surface-3-filter': 'blur(36px) saturate(2.2)',
      '--d-border': 'rgba(255,255,255,0.08)',
      '--d-border-strong': 'rgba(255,255,255,0.18)',
      '--d-field-bg': 'rgba(255,255,255,0.06)',
      '--d-field-border': 'rgba(255,255,255,0.1)',
      '--d-field-border-hover': 'rgba(255,255,255,0.2)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.06)',
      '--d-chart-0': '#007aff',
      '--d-chart-1': '#5856d6',
      '--d-chart-2': '#34c759',
      '--d-chart-3': '#ff9f0a',
      '--d-chart-4': '#ff3b30',
      '--d-chart-5': '#af52de',
      '--d-chart-6': '#ff2d55',
      '--d-chart-7': '#5ac8fa',
    },
  },
  components: [
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Scrollbar — true black with subtle gray thumb
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(142,142,147,0.3);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(142,142,147,0.5)}',
    // Card — specular top-edge highlight
    '.d-card{border:var(--d-border-width) solid rgba(255,255,255,0.1);box-shadow:var(--d-elevation-1),inset 0 0.5px 0 rgba(255,255,255,0.4)}',
    '.d-card-inner{border:var(--d-border-width) solid rgba(255,255,255,0.06);box-shadow:none}',
    // Modal — strong specular
    '.d-modal-content{border:var(--d-border-width) solid rgba(255,255,255,0.12);box-shadow:var(--d-elevation-3),inset 0 0.5px 0 rgba(255,255,255,0.4)}',
    // Button — iOS blue glow
    '.d-btn-primary{box-shadow:0 0 12px rgba(0,122,255,0.2)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(0,122,255,0.35)}',
    // Liquid Glass utilities
    '.d-liquid-refract{transition:transform var(--d-tr-normal) var(--d-ease-standard),backdrop-filter var(--d-tr-normal) var(--d-ease-standard)}',
    '.d-liquid-refract:hover{transform:scale(1.01)}',
    '.d-liquid-highlight{position:relative;overflow:hidden}',
    '.d-liquid-highlight::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:d-liquid-sweep 4s ease-in-out infinite;pointer-events:none}',
    '@keyframes d-liquid-sweep{0%{left:-100%}50%{left:100%}100%{left:100%}}',
    '.d-liquid-depth{box-shadow:0 1px 2px rgba(0,0,0,0.05),0 4px 8px rgba(0,0,0,0.05),0 12px 24px rgba(0,0,0,0.08),inset 0 0.5px 0 rgba(255,255,255,0.3)}',
    // Glass panels with specular
    '.d-glass-subtle{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) solid rgba(255,255,255,0.08);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-0),inset 0 0.5px 0 rgba(255,255,255,0.3)}',
    '.d-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 0.5px 0 rgba(255,255,255,0.4)}',
    '.d-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 0.5px 0 rgba(255,255,255,0.4)}',
    // Gradient text
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Mesh
    '.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(0,122,255,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(88,86,214,0.06) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(52,199,89,0.04) 0%,transparent 50%),var(--d-bg)}',
    // Frosted-glass backdrop
    'dialog::backdrop{background:rgba(0,0,0,0.3);backdrop-filter:blur(20px) saturate(1.8);-webkit-backdrop-filter:blur(20px) saturate(1.8)}',
  ].join(''),
};
