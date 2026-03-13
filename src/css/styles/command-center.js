/**
 * Command Center — HUD/radar monochromatic visual language.
 * Dark operational panels with beveled frames, scanlines, status bars,
 * monospace typography, and a monochromatic cyan palette derived from
 * a single primary hue via the `palette: 'monochrome'` personality trait.
 *
 * Decorative classes (cc-* prefix) are injected via the components field,
 * following the same pattern as glassmorphism's .d-glass utilities.
 * These classes are used by the Command Center recipe to compose
 * standard Decantr components into the HUD visual language.
 */
export const commandCenter = {
  id: 'command-center',
  name: 'Command Center',
  seed: {
    primary: '#00e5ff',
    neutral: '#1a2a3a',
    bg: '#c8d6e0',
    bgDark: '#050a10',
  },
  personality: {
    radius: 'sharp',
    elevation: 'flat',
    motion: 'snappy',
    borders: 'bold',
    density: 'compact',
    gradient: 'none',
    palette: 'monochrome',
  },
  typography: {
    '--d-font': 'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-fw-medium': '500',
    '--d-ls-heading': '0.08em',
  },
  overrides: {
    dark: {
      '--d-fg': '#00e5ff',
      '--d-muted-fg': '#00809a',
      '--d-border': 'rgba(0,229,255,0.12)',
      '--d-border-strong': 'rgba(0,229,255,0.25)',
      '--d-surface-0': '#050a10',
      '--d-surface-1': '#0a1520',
      '--d-surface-2': '#0f1d2a',
      '--d-surface-3': '#142535',
      '--d-surface-0-fg': '#00e5ff',
      '--d-surface-1-fg': '#00e5ff',
      '--d-surface-2-fg': '#00e5ff',
      '--d-surface-3-fg': '#00e5ff',
      '--d-surface-1-border': 'rgba(0,229,255,0.15)',
      '--d-surface-2-border': 'rgba(0,229,255,0.18)',
      '--d-surface-3-border': 'rgba(0,229,255,0.22)',
      '--d-overlay': 'rgba(0,10,20,0.85)',
      '--d-chart-grid': 'rgba(0,229,255,0.06)',
      '--d-chart-axis': 'rgba(0,229,255,0.2)',
      '--d-chart-crosshair': 'rgba(0,229,255,0.3)',
      '--d-field-bg': 'var(--d-surface-1)',
      '--d-field-border': 'rgba(0,229,255,0.15)',
      '--d-field-border-hover': 'rgba(0,229,255,0.3)',
      '--d-field-border-focus': 'rgba(0,229,255,0.5)',
      '--d-item-hover-bg': 'rgba(0,229,255,0.06)',
      '--d-scrollbar-thumb': 'rgba(0,229,255,0.2)',
      '--d-scrollbar-thumb-hover': 'rgba(0,229,255,0.4)',
    },
    light: {
      '--d-fg': '#0a1520',
      '--d-muted-fg': '#1a3a50',
      '--d-border': 'rgba(0,80,100,0.15)',
      '--d-border-strong': 'rgba(0,80,100,0.3)',
      '--d-surface-0': '#c8d6e0',
      '--d-surface-1': '#b8c8d4',
      '--d-surface-2': '#a8b8c6',
      '--d-surface-3': '#98a8b8',
      '--d-surface-0-fg': '#0a1520',
      '--d-surface-1-fg': '#0a1520',
      '--d-surface-2-fg': '#0a1520',
      '--d-surface-3-fg': '#0a1520',
      '--d-field-bg': 'var(--d-surface-1)',
      '--d-field-border': 'rgba(0,80,100,0.2)',
      '--d-field-border-hover': 'rgba(0,80,100,0.35)',
      '--d-item-hover-bg': 'rgba(0,80,100,0.06)',
    },
  },
  components: [
    // ── Body / base ──
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:rgba(0,229,255,0.25);color:var(--d-fg)}',
    // ── Scrollbar — cyan tinted ──
    '::-webkit-scrollbar{width:4px;height:4px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.2);border-radius:0}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(0,229,255,0.4)}',
    // ── Component overrides ──
    '.d-card{border-color:rgba(0,229,255,0.15)}',
    '.d-btn{text-transform:uppercase;letter-spacing:0.05em}',
    '.d-btn-primary{box-shadow:0 0 12px rgba(0,229,255,0.15)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(0,229,255,0.3)}',
    '.d-modal-content{border-color:rgba(0,229,255,0.2)}',
    '.d-input,.d-textarea,.d-select-trigger{border-color:rgba(0,229,255,0.15)}',
    '.d-input:focus,.d-textarea:focus,.d-select-trigger:focus{border-color:rgba(0,229,255,0.4);box-shadow:0 0 8px rgba(0,229,255,0.1)}',
    // ── Keyframes ──
    '@keyframes cc-blink{0%,100%{opacity:1}50%{opacity:0.3}}',
    '@keyframes cc-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}',
    '@keyframes cc-pulse{0%,100%{box-shadow:0 0 8px rgba(0,229,255,0.2)}50%{box-shadow:0 0 20px rgba(0,229,255,0.4)}}',
    // ── cc-frame: beveled octagonal border ──
    '.cc-frame{position:relative;clip-path:polygon(var(--d-sp-2) 0,calc(100% - var(--d-sp-2)) 0,100% var(--d-sp-2),100% calc(100% - var(--d-sp-2)),calc(100% - var(--d-sp-2)) 100%,var(--d-sp-2) 100%,0 calc(100% - var(--d-sp-2)),0 var(--d-sp-2));background:var(--d-surface-1);border:var(--d-border-width-strong) var(--d-border-style) rgba(0,229,255,0.2)}',
    '.cc-frame-sm{position:relative;clip-path:polygon(var(--d-sp-1) 0,calc(100% - var(--d-sp-1)) 0,100% var(--d-sp-1),100% calc(100% - var(--d-sp-1)),calc(100% - var(--d-sp-1)) 100%,var(--d-sp-1) 100%,0 calc(100% - var(--d-sp-1)),0 var(--d-sp-1));background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) rgba(0,229,255,0.15)}',
    // ── cc-corner: bracket decorations ──
    '.cc-corner{position:relative}',
    '.cc-corner::before,.cc-corner::after{content:"";position:absolute;width:var(--d-sp-4);height:var(--d-sp-4);pointer-events:none}',
    '.cc-corner::before{top:0;left:0;border-top:var(--d-border-width-strong) solid var(--d-primary);border-left:var(--d-border-width-strong) solid var(--d-primary)}',
    '.cc-corner::after{bottom:0;right:0;border-bottom:var(--d-border-width-strong) solid var(--d-primary);border-right:var(--d-border-width-strong) solid var(--d-primary)}',
    // ── cc-scanline: horizontal scan overlay ──
    '.cc-scanline{position:relative;overflow:hidden}',
    '.cc-scanline::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,0.03) 2px,rgba(0,229,255,0.03) 4px);pointer-events:none;z-index:1}',
    // ── cc-grid: faint grid-line background ──
    '.cc-grid{background-image:repeating-linear-gradient(0deg,rgba(0,229,255,0.04) 0,rgba(0,229,255,0.04) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(0,229,255,0.04) 0,rgba(0,229,255,0.04) 1px,transparent 1px,transparent 40px)}',
    // ── cc-bar: status bar row ──
    '.cc-bar{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-1-5) var(--d-sp-3);border-bottom:var(--d-border-width) solid rgba(0,229,255,0.15);text-transform:uppercase;letter-spacing:0.1em;font-size:var(--d-text-xs);color:var(--d-muted-fg)}',
    '.cc-bar-bottom{border-bottom:none;border-top:var(--d-border-width) solid rgba(0,229,255,0.15)}',
    // ── cc-blink: slow pulse for indicators ──
    '.cc-blink{animation:cc-blink 2s ease-in-out infinite}',
    // ── cc-glow: cyan glow effect ──
    '.cc-glow{box-shadow:0 0 12px rgba(0,229,255,0.15),inset 0 0 12px rgba(0,229,255,0.05)}',
    '.cc-glow-strong{box-shadow:0 0 24px rgba(0,229,255,0.25),inset 0 0 16px rgba(0,229,255,0.08)}',
    '.cc-glow-pulse{animation:cc-pulse 3s ease-in-out infinite}',
    // ── cc-divider: HUD horizontal rule ──
    '.cc-divider{border:none;border-top:var(--d-border-width) dashed rgba(0,229,255,0.2);margin:var(--d-sp-2) 0}',
    // ── cc-label: micro label ──
    '.cc-label{text-transform:uppercase;letter-spacing:0.1em;font-size:var(--d-text-xs);font-weight:var(--d-fw-medium)}',
    // ── cc-data: monospace data readout ──
    '.cc-data{font-family:var(--d-font-mono);font-variant-numeric:tabular-nums;letter-spacing:0.02em}',
    // ── cc-indicator: status dot ──
    '.cc-indicator{display:inline-block;width:var(--d-sp-1-5);height:var(--d-sp-1-5);border-radius:0;background:currentColor}',
    '.cc-indicator-ok{color:var(--d-success)}',
    '.cc-indicator-warn{color:var(--d-warning)}',
    '.cc-indicator-error{color:var(--d-error)}',
    // ── cc-mesh: command center background ──
    '.cc-mesh{background:radial-gradient(ellipse at 20% 30%,rgba(0,229,255,0.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(0,229,255,0.04) 0%,transparent 50%),var(--d-bg)}',
  ].join(''),
};
