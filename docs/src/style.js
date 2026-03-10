/**
 * Decantr Site — Custom style for the marketing landing page.
 * Dark glass aesthetic with vibrant logo-derived colors.
 */
export const decantrSite = {
  id: 'decantr-site',
  name: 'Decantr Site',
  seed: {
    primary: '#6500C6',
    accent: '#0AF3EB',
    tertiary: '#FE4474',
    neutral: '#8892a4',
    success: '#00C388',
    warning: '#FDA303',
    error: '#D80F4A',
    info: '#0AF3EB',
    bg: '#f0f4ff',
    bgDark: '#060918',
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
    '--d-fw-heading': '800',
    '--d-fw-title': '700',
    '--d-ls-heading': '-0.03em',
  },
  overrides: {
    light: {},
    dark: {
      '--d-surface-1': 'rgba(12,15,40,0.55)',
      '--d-surface-2': 'rgba(12,15,40,0.7)',
      '--d-surface-3': 'rgba(12,15,40,0.8)',
      '--d-surface-1-filter': 'blur(16px) saturate(1.6)',
      '--d-surface-2-filter': 'blur(20px) saturate(1.8)',
      '--d-surface-3-filter': 'blur(24px) saturate(2)',
      '--d-border': 'rgba(255,255,255,0.08)',
      '--d-border-strong': 'rgba(255,255,255,0.15)',
      // Vibrant chart palette from logo colors
      '--d-chart-0': '#6500C6',
      '--d-chart-1': '#0AF3EB',
      '--d-chart-2': '#FE4474',
      '--d-chart-3': '#00C388',
      '--d-chart-4': '#FDA303',
      '--d-chart-5': '#D80F4A',
      '--d-chart-6': '#8B5CF6',
      '--d-chart-7': '#38BDF8',
    },
  },
  components: [
    // Body + selection
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
    // Scrollbar
    '::-webkit-scrollbar{width:6px;height:6px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:rgba(101,0,198,0.3);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(101,0,198,0.5)}',
    // Glass card enhancements
    '.d-card{border:1px solid rgba(255,255,255,0.1);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
    // Button glow
    '.d-btn-primary{box-shadow:0 0 12px rgba(101,0,198,0.25)}',
    '.d-btn-primary:hover{box-shadow:0 0 20px rgba(101,0,198,0.4)}',
    // ── Keyframe animations ──
    '@keyframes ds-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes ds-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}',
    '@keyframes ds-pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}',
    '@keyframes ds-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}',
    '@keyframes ds-glow{0%,100%{box-shadow:0 0 12px rgba(101,0,198,0.2),0 0 30px rgba(101,0,198,0.06)}50%{box-shadow:0 0 20px rgba(10,243,235,0.25),0 0 40px rgba(10,243,235,0.08)}}',
    '@keyframes ds-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes ds-scale-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}',
    // ── Utility classes ──
    '.ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
    '.ds-hidden{opacity:0;transform:translateY(30px)}',
    '.ds-visible .ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
    '.ds-delay-1{animation-delay:100ms}',
    '.ds-delay-2{animation-delay:200ms}',
    '.ds-delay-3{animation-delay:300ms}',
    '.ds-delay-4{animation-delay:400ms}',
    '.ds-delay-5{animation-delay:500ms}',
    '.ds-delay-6{animation-delay:600ms}',
    '.ds-delay-7{animation-delay:700ms}',
    '.ds-delay-8{animation-delay:800ms}',
    '.ds-delay-9{animation-delay:900ms}',
    '.ds-float{animation:ds-float 4s var(--d-easing-standard) infinite}',
    '.ds-glow{animation:ds-glow 3s var(--d-easing-standard) infinite}',
    '.ds-pulse{animation:ds-pulse 3s var(--d-easing-standard) infinite}',
    // Gradient text
    '.ds-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.ds-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // Mesh gradient background
    '.ds-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(101,0,198,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(10,243,235,0.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(254,68,116,0.08) 0%,transparent 50%),var(--d-bg)}',
    // Glass panel utility
    '.ds-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
    '.ds-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:1px solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 1px 0 rgba(255,255,255,0.08)}',
    // Decorative orb
    '.ds-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}',
    // Stat number
    '.ds-stat{font-size:3rem;font-weight:800;line-height:1;letter-spacing:-0.04em}',
    // Section spacing
    '.ds-section{padding:var(--d-sp-16) var(--d-sp-8);position:relative;overflow:hidden}',
    '@media(max-width:768px){.ds-section{padding:var(--d-sp-12) var(--d-sp-4)}.ds-stat{font-size:2rem}}',
    // Pink accent color for branding dots
    '.ds-pink{color:#FE4474}',
    '.ds-cyan{color:#0AF3EB}',
    '.ds-purple{color:#6500C6}',
    // Chart text readability on dark glass
    '.d-chart-axis text{fill:rgba(255,255,255,0.7)!important;font-size:0.75rem!important}',
    '.d-chart-axis-label{fill:rgba(255,255,255,0.7)!important}',
    '.d-chart text{fill:rgba(255,255,255,0.85);font-family:var(--d-font)}',
    '.d-chart-legend{color:rgba(255,255,255,0.8)}',
    '.d-chart-label{fill:rgba(255,255,255,0.9)!important;font-weight:600!important;font-size:0.7rem!important}',
    '.d-chart{background:transparent!important;border:none!important;box-shadow:none!important}',
    '.d-chart-inner{background:transparent!important}',
    '.d-chart-grid line{stroke:rgba(255,255,255,0.06)!important}',
    '.d-chart-tooltip{background:rgba(12,15,40,0.9)!important;border:1px solid rgba(255,255,255,0.15)!important;color:rgba(255,255,255,0.9)!important;backdrop-filter:blur(12px)}',
    // Sparkline on dark glass
    '.d-chart-spark{background:transparent!important}',
    // Responsive footer
    '@media(max-width:640px){.ds-footer-links{flex-direction:column;gap:0.5rem;align-items:center}}',
  ].join(''),
};
