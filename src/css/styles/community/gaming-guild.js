/**
 * Gaming Guild — Immersive guild-hall visual language.
 * Electric indigo + neon emerald palette, glow elevation, smooth motion.
 * Deep indigo surface stack in dark mode. RPG-inspired typography with
 * monospace data readouts and uppercase micro labels.
 *
 * Decorative classes (gg-* prefix) are injected via the components field,
 * following the same pattern as command-center's cc-* utilities.
 * These classes are used by the Gaming Guild recipe to compose
 * standard Decantr components into the guild-hall visual language.
 */
export const gamingGuild = {
  id: 'gaming-guild',
  name: 'Gaming Guild',
  seed: {
    primary: '#3b82f6',
    accent: '#06d6a0',
    tertiary: '#a855f7',
    neutral: '#1e293b',
    success: '#06d6a0',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#38bdf8',
    bg: '#e8edf5',
    bgDark: '#050510',
  },
  personality: {
    radius: 'rounded',
    elevation: 'glow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '0.04em',
  },
  overrides: {
    dark: {
      '--d-bg': '#050510',
      '--d-fg': '#e8edf5',
      '--d-muted-fg': '#7a85a0',
      '--d-border': 'rgba(59,130,246,0.12)',
      '--d-border-strong': 'rgba(59,130,246,0.25)',
      '--d-surface-0': '#050510',
      '--d-surface-1': '#0a0f24',
      '--d-surface-2': '#0f1629',
      '--d-surface-3': '#141d36',
      '--d-surface-0-fg': '#e8edf5',
      '--d-surface-1-fg': '#e8edf5',
      '--d-surface-2-fg': '#e8edf5',
      '--d-surface-3-fg': '#e8edf5',
      '--d-surface-1-border': 'rgba(59,130,246,0.12)',
      '--d-surface-2-border': 'rgba(59,130,246,0.15)',
      '--d-surface-3-border': 'rgba(59,130,246,0.18)',
      '--d-overlay': 'rgba(5,5,16,0.85)',
      '--d-field-bg': 'var(--d-surface-1)',
      '--d-field-border': 'rgba(59,130,246,0.15)',
      '--d-field-border-hover': 'rgba(59,130,246,0.3)',
      '--d-field-border-focus': 'rgba(59,130,246,0.5)',
      '--d-item-hover-bg': 'rgba(59,130,246,0.06)',
      '--d-elevation-0': 'none',
      '--d-elevation-1': '0 0 12px rgba(59,130,246,0.12),0 0 4px rgba(59,130,246,0.06)',
      '--d-elevation-2': '0 0 20px rgba(59,130,246,0.18),0 0 8px rgba(59,130,246,0.08)',
      '--d-elevation-3': '0 0 32px rgba(59,130,246,0.25),0 0 12px rgba(59,130,246,0.1)',
      '--d-scrollbar-thumb': 'rgba(59,130,246,0.2)',
      '--d-scrollbar-thumb-hover': 'rgba(59,130,246,0.4)',
    },
    light: {
      '--d-fg': '#0f1629',
      '--d-muted-fg': '#475569',
      '--d-border': 'rgba(30,41,59,0.12)',
      '--d-border-strong': 'rgba(30,41,59,0.25)',
      '--d-surface-0': '#e8edf5',
      '--d-surface-1': '#dce3ef',
      '--d-surface-2': '#d0d9e8',
      '--d-surface-3': '#c4cfe1',
      '--d-surface-0-fg': '#0f1629',
      '--d-surface-1-fg': '#0f1629',
      '--d-surface-2-fg': '#0f1629',
      '--d-surface-3-fg': '#0f1629',
      '--d-field-bg': 'var(--d-surface-1)',
      '--d-field-border': 'rgba(30,41,59,0.15)',
      '--d-field-border-hover': 'rgba(30,41,59,0.3)',
      '--d-item-hover-bg': 'rgba(30,41,59,0.06)',
    },
  },
  components: [
    // ── Body / base ──
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:rgba(59,130,246,0.3);color:var(--d-fg)}',
    // ── Scrollbar ──
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.2);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(59,130,246,0.4)}',
    // ── Component overrides: Card ──
    '.d-card{border:var(--d-border-width) solid rgba(59,130,246,0.12);box-shadow:0 0 12px rgba(59,130,246,0.08)}',
    '.d-card:hover{box-shadow:0 0 20px rgba(59,130,246,0.15)}',
    '.d-card-inner{border-color:rgba(59,130,246,0.08)}',
    // ── Component overrides: Button ──
    '.d-btn-primary{box-shadow:0 0 12px rgba(59,130,246,0.2)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(59,130,246,0.35)}',
    // ── Component overrides: Statistic ──
    '.d-statistic-value{font-family:var(--d-font-mono);font-variant-numeric:tabular-nums;letter-spacing:0.02em}',
    '.d-statistic-label{text-transform:uppercase;letter-spacing:0.08em;font-size:var(--d-text-xs)}',
    '.d-card .d-statistic{background:transparent;border:none;box-shadow:none;padding:0}',
    // ── Component overrides: Badge / Chip ──
    '.d-badge,.d-badge-sup{text-transform:uppercase;letter-spacing:0.05em}',
    '.d-chip{text-transform:uppercase;letter-spacing:0.03em}',
    // ── Component overrides: Gradient text ──
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // ── Component overrides: Mesh background ──
    '.d-mesh{background:radial-gradient(ellipse at 20% 30%,rgba(59,130,246,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(6,214,160,0.06) 0%,transparent 50%),var(--d-bg)}',
    // ── Component overrides: Modal ──
    '.d-modal-panel{border-color:rgba(59,130,246,0.2);box-shadow:0 0 32px rgba(59,130,246,0.15)}',
    'dialog::backdrop{background:rgba(5,5,16,0.8);backdrop-filter:blur(4px)}',
    // ── Component overrides: Input ──
    '.d-input,.d-textarea,.d-select-trigger{border-color:rgba(59,130,246,0.15)}',
    '.d-input:focus,.d-textarea:focus,.d-select-trigger:focus{border-color:rgba(59,130,246,0.4);box-shadow:0 0 8px rgba(59,130,246,0.12)}',
    // ── Keyframes ──
    '@keyframes gg-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    '@keyframes gg-rank-up{0%{transform:scale(0.8);opacity:0}50%{transform:scale(1.15)}70%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}',
    '@keyframes gg-pulse{0%,100%{box-shadow:0 0 8px rgba(6,214,160,0.3)}50%{box-shadow:0 0 20px rgba(6,214,160,0.6)}}',
    '@keyframes gg-xp-fill{from{width:0}to{width:var(--gg-xp,100%)}}',
    '@keyframes gg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '@keyframes gg-glow-border{0%,100%{border-color:rgba(59,130,246,0.4)}50%{border-color:rgba(6,214,160,0.4)}}',
    '@keyframes gg-count-glow{0%,100%{text-shadow:0 0 8px rgba(59,130,246,0.3)}50%{text-shadow:0 0 16px rgba(59,130,246,0.6)}}',
    '@keyframes gg-badge-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}80%{transform:scale(0.9)}100%{transform:scale(1);opacity:1}}',
    // ── gg-glow: indigo glow box-shadow ──
    '.gg-glow{box-shadow:0 0 12px rgba(59,130,246,0.15),inset 0 0 12px rgba(59,130,246,0.05)}',
    '.gg-glow-accent{box-shadow:0 0 12px rgba(6,214,160,0.15),inset 0 0 12px rgba(6,214,160,0.05)}',
    '.gg-glow-strong{box-shadow:0 0 24px rgba(59,130,246,0.25),inset 0 0 16px rgba(59,130,246,0.08)}',
    '.gg-glow-pulse{animation:gg-pulse 3s ease-in-out infinite}',
    // ── gg-shimmer: gradient shimmer sweep ──
    '.gg-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(59,130,246,0.08) 50%,transparent 100%);background-size:200% 100%;animation:gg-shimmer 3s ease-in-out infinite}',
    // ── gg-rank-up: scale bounce rank-up animation ──
    '.gg-rank-up{animation:gg-rank-up 0.6s ease-out}',
    // ── gg-float: floating vertical bob ──
    '.gg-float{animation:gg-float 4s ease-in-out infinite}',
    // ── gg-xp-bar: XP progress bar with gradient fill ──
    '.gg-xp-bar{height:var(--d-sp-1-5);border-radius:var(--d-radius-full);background:var(--d-surface-2);overflow:hidden;position:relative}',
    '.gg-xp-bar::after{content:"";position:absolute;inset:0;width:var(--gg-xp,0%);background:linear-gradient(90deg,var(--d-primary),var(--d-accent));border-radius:var(--d-radius-full);animation:gg-xp-fill 1.2s ease-out forwards}',
    // ── gg-badge-pop: achievement pop-in ──
    '.gg-badge-pop{animation:gg-badge-pop 0.5s ease-out}',
    // ── gg-mesh: page background ──
    '.gg-mesh{background:radial-gradient(ellipse at 20% 20%,rgba(59,130,246,0.1) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(6,214,160,0.06) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(168,85,247,0.04) 0%,transparent 60%),var(--d-bg)}',
    // ── gg-panel: surface-1 panel with indigo border ──
    '.gg-panel{background:var(--d-surface-1);border:var(--d-border-width) solid rgba(59,130,246,0.12);border-radius:var(--d-radius);padding:var(--d-sp-4)}',
    // ── gg-label: uppercase micro label ──
    '.gg-label{text-transform:uppercase;letter-spacing:0.08em;font-size:var(--d-text-xs);font-weight:var(--d-fw-medium)}',
    // ── gg-data: monospace tabular readout ──
    '.gg-data{font-family:var(--d-font-mono);font-variant-numeric:tabular-nums;letter-spacing:0.02em}',
    // ── gg-live: green pulsing dot indicator ──
    '.gg-live{display:inline-block;width:var(--d-sp-1-5);height:var(--d-sp-1-5);border-radius:var(--d-radius-full);background:var(--d-success);animation:gg-pulse 3s ease-in-out infinite}',
    // Shell nav override
    '.d-shell-nav{padding:var(--d-sp-2) 0}',
  ].join(''),
};
