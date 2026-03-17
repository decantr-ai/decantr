/**
 * Clay — Soft, pillowy, pastel aesthetic.
 * Everything looks molded from clay. Rounded forms, inner highlights,
 * squishy interactions. Gentle and tactile.
 *
 * Decorative classes (cy-* prefix) are injected via the components field,
 * following the same pattern as gaming-guild's gg-* utilities.
 * These classes are used by the Clay recipe to compose
 * standard Decantr components into the clay visual language.
 */
export const clay = {
  id: 'clay',
  name: 'Clay',
  seed: {
    primary: '#a78bfa',
    accent: '#67e8f9',
    tertiary: '#fda4af',
    neutral: '#9ca3af',
    success: '#86efac',
    warning: '#fcd34d',
    error: '#fca5a5',
    info: '#93c5fd',
    bg: '#faf5ff',
    bgDark: '#1e1b2e',
  },
  personality: {
    radius: 'rounded',
    elevation: 'clay',
    motion: 'smooth',
    borders: 'none',
    density: 'spacious',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '0.01em',
  },
  overrides: {
    light: {
      '--d-border': 'rgba(0,0,0,0.06)',
      '--d-border-strong': 'rgba(0,0,0,0.12)',
      '--d-field-bg': 'rgba(255,255,255,0.7)',
      '--d-field-border': 'rgba(0,0,0,0.08)',
      '--d-field-border-hover': 'rgba(0,0,0,0.15)',
      '--d-item-hover-bg': 'rgba(0,0,0,0.03)',
    },
    dark: {
      '--d-border': 'rgba(255,255,255,0.06)',
      '--d-border-strong': 'rgba(255,255,255,0.12)',
      '--d-field-bg': 'rgba(255,255,255,0.06)',
      '--d-field-border': 'rgba(255,255,255,0.08)',
      '--d-field-border-hover': 'rgba(255,255,255,0.15)',
      '--d-item-hover-bg': 'rgba(255,255,255,0.05)',
    },
  },
  components: [
    // ── Body / base ──
    'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
    '::selection{background:var(--d-primary-subtle);color:var(--d-primary-subtle-fg)}',
    // ── Scrollbar — rounded pill thumb ──
    '::-webkit-scrollbar{width:8px;height:8px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:var(--d-border-strong);border-radius:var(--d-radius-full)}',
    '::-webkit-scrollbar-thumb:hover{background:var(--d-muted-fg)}',
    // ── Component overrides: Card — soft inner highlight ──
    '.d-card{border:none;box-shadow:var(--d-elevation-1),inset 0 2px 4px rgba(255,255,255,0.5)}',
    '[data-mode="dark"] .d-card,.d-card[data-mode="dark"]{box-shadow:var(--d-elevation-1),inset 0 2px 4px rgba(255,255,255,0.1)}',
    '.d-card-inner{box-shadow:inset 0 1px 2px rgba(255,255,255,0.3)}',
    // ── Component overrides: Modal — pillow shadow ──
    '.d-modal-content{border:none;box-shadow:var(--d-elevation-3),inset 0 2px 4px rgba(255,255,255,0.5)}',
    // ── Component overrides: Button — soft squish ──
    '.d-btn-primary{box-shadow:var(--d-elevation-1),inset 0 1px 2px rgba(255,255,255,0.3)}',
    '.d-btn-primary:hover{box-shadow:var(--d-elevation-2),inset 0 1px 2px rgba(255,255,255,0.4)}',
    // ── Component overrides: Input — dimple style ──
    '.d-input,.d-textarea,.d-select-trigger{border:none;box-shadow:inset 0 2px 6px rgba(0,0,0,0.08),inset 0 1px 2px rgba(0,0,0,0.06);background:var(--d-field-bg)}',
    '.d-input:focus,.d-textarea:focus,.d-select-trigger:focus{box-shadow:inset 0 2px 6px rgba(0,0,0,0.08),inset 0 1px 2px rgba(0,0,0,0.06),0 0 0 3px var(--d-primary-subtle)}',
    // ── Component overrides: Statistic ──
    '.d-statistic-value{font-weight:700;letter-spacing:-0.01em}',
    // ── Component overrides: Gradient text ──
    '.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    // ── Component overrides: Mesh background ──
    '.d-mesh{background:radial-gradient(ellipse at 20% 30%,rgba(167,139,250,0.1) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(103,232,249,0.08) 0%,transparent 50%),radial-gradient(ellipse at 50% 90%,rgba(253,164,175,0.06) 0%,transparent 50%),var(--d-bg)}',
    // ── Keyframes ──
    '@keyframes cy-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}',
    '@keyframes cy-bounce{0%{transform:scale(0.8);opacity:0}50%{transform:scale(1.06)}70%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}',
    '@keyframes cy-jelly{0%{transform:scale(1)}25%{transform:scale(0.96,1.04)}50%{transform:scale(1.03,0.97)}75%{transform:scale(0.98,1.02)}100%{transform:scale(1)}}',
    '@keyframes cy-pulse-soft{0%,100%{box-shadow:0 8px 24px rgba(167,139,250,0.15),inset 0 2px 4px rgba(255,255,255,0.5)}50%{box-shadow:0 12px 32px rgba(167,139,250,0.25),inset 0 2px 4px rgba(255,255,255,0.5)}}',
    // ── cy-pillow: pillow shadow + inner white highlight ──
    '.cy-pillow{box-shadow:0 8px 24px rgba(167,139,250,0.12),0 2px 8px rgba(0,0,0,0.06),inset 0 2px 4px rgba(255,255,255,0.5);border:none;border-radius:var(--d-radius)}',
    '.cy-pillow-strong{box-shadow:0 12px 32px rgba(167,139,250,0.2),0 4px 12px rgba(0,0,0,0.08),inset 0 2px 6px rgba(255,255,255,0.6);border:none;border-radius:var(--d-radius-lg)}',
    // ── cy-squish: tactile press effect ──
    '.cy-squish{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1)}.cy-squish:active{transform:scale(0.97)}',
    // ── cy-float: floating bob animation ──
    '.cy-float{animation:cy-float 5s ease-in-out infinite}',
    // ── cy-blob: decorative pastel blob ──
    '.cy-blob{position:absolute;border-radius:var(--d-radius-full);filter:blur(80px);opacity:0.5;pointer-events:none}',
    // ── cy-soft: ultra-soft shadow, no border ──
    '.cy-soft{box-shadow:0 4px 16px rgba(0,0,0,0.04),0 1px 4px rgba(0,0,0,0.03);border:none}',
    // ── cy-dimple: inset shadow for recessed surfaces ──
    '.cy-dimple{box-shadow:inset 0 2px 8px rgba(0,0,0,0.08),inset 0 1px 3px rgba(0,0,0,0.05);border:none;background:var(--d-field-bg)}',
    // ── cy-bounce: elastic bounce-in ──
    '.cy-bounce{animation:cy-bounce 0.5s ease-out}',
    // ── cy-jelly: jelly wobble on hover ──
    '.cy-jelly:hover{animation:cy-jelly 0.4s ease-out}',
    // ── cy-pastel-mesh: radial gradient bg with violet/cyan/pink layers ──
    '.cy-pastel-mesh{background:radial-gradient(ellipse at 25% 20%,rgba(167,139,250,0.15) 0%,transparent 50%),radial-gradient(ellipse at 75% 60%,rgba(103,232,249,0.12) 0%,transparent 50%),radial-gradient(ellipse at 50% 90%,rgba(253,164,175,0.1) 0%,transparent 50%),var(--d-bg)}',
    // ── cy-label: rounded pill label with pastel bg ──
    '.cy-label{display:inline-flex;align-items:center;padding:var(--d-sp-0-5) var(--d-sp-2-5);border-radius:var(--d-radius-full);background:var(--d-primary-subtle);color:var(--d-primary-subtle-fg);font-size:var(--d-text-xs);font-weight:var(--d-fw-medium);letter-spacing:0.04em;text-transform:uppercase}',
    // ── cy-swatch: color swatch with pillow shadow ──
    '.cy-swatch{border-radius:var(--d-radius);box-shadow:0 6px 20px rgba(0,0,0,0.1),inset 0 2px 4px rgba(255,255,255,0.4);border:none;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s ease}.cy-swatch:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 10px 28px rgba(0,0,0,0.14),inset 0 2px 4px rgba(255,255,255,0.5)}',
    // ── cy-glow: soft pastel glow shadow ──
    '.cy-glow{box-shadow:0 0 20px rgba(167,139,250,0.2),0 0 8px rgba(167,139,250,0.1)}',
    // ── cy-pulse-soft: gentle shadow pulse ──
    '.cy-pulse-soft{animation:cy-pulse-soft 4s ease-in-out infinite}',
    // ── Shell nav override ──
    '.d-shell-nav{padding:var(--d-sp-2) 0}',
  ].join(''),
};
