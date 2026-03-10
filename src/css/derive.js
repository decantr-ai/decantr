/**
 * Decantr Design System v2 — Derivation Engine
 * Expands 8-12 seed values + personality traits into 170+ semantic design tokens.
 * Pure functions, zero side effects, zero dependencies.
 *
 * @module derive
 */

// ============================================================
// Color Math
// ============================================================

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  ];
}

/** WCAG 2.1 relative luminance */
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG 2.1 contrast ratio */
function contrast(rgb1, rgb2) {
  const l1 = luminance(...rgb1), l2 = luminance(...rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function darken(hex, amount) {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  return rgbToHex(...hslToRgb(h, s, Math.max(0, l - amount)));
}

function lighten(hex, amount) {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  return rgbToHex(...hslToRgb(h, s, Math.min(100, l + amount)));
}

function alpha(hex, opacity) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

function mixColors(hex1, hex2, weight) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(
    Math.round(r1 + (r2 - r1) * weight),
    Math.round(g1 + (g2 - g1) * weight),
    Math.round(b1 + (b2 - b1) * weight)
  );
}

/** Pick foreground (white or near-black) for WCAG AA on given background */
function pickForeground(bgHex) {
  const bgRgb = hexToRgb(bgHex);
  return contrast([255, 255, 255], bgRgb) >= 4.5 ? '#ffffff' : '#09090b';
}

/** Rotate hue by degrees */
function rotateHue(hex, degrees) {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  return rgbToHex(...hslToRgb((h + degrees + 360) % 360, s, l));
}

// Export color utils for testing and style overrides
export { hexToRgb, rgbToHex, darken, lighten, alpha, mixColors, pickForeground, rotateHue, contrast, validateContrast, adjustForContrast };

// ============================================================
// Contrast Validation (WCAG AA)
// ============================================================

/**
 * Validates and auto-adjusts color pairs that fail WCAG AA contrast (4.5:1).
 * Adjusts hover/active/subtle-fg colors to meet minimum contrast against their backgrounds.
 * @param {Object} tokens - The full token map
 * @returns {Object} tokens with any necessary adjustments
 */
function validateContrast(tokens) {
  const PAIRS = [
    // [foreground-token, background-token, min-ratio]
    ['--d-primary-fg', '--d-primary', 4.5],
    ['--d-accent-fg', '--d-accent', 4.5],
    ['--d-tertiary-fg', '--d-tertiary', 4.5],
    ['--d-success-fg', '--d-success', 4.5],
    ['--d-warning-fg', '--d-warning', 4.5],
    ['--d-error-fg', '--d-error', 4.5],
    ['--d-info-fg', '--d-info', 4.5],
    ['--d-fg', '--d-bg', 4.5],
    ['--d-muted-fg', '--d-bg', 4.5],
    ['--d-surface-0-fg', '--d-surface-0', 4.5],
    ['--d-surface-1-fg', '--d-surface-1', 4.5],
    ['--d-surface-2-fg', '--d-surface-2', 4.5],
    ['--d-surface-3-fg', '--d-surface-3', 4.5],
    // Subtle foreground on subtle background
    ['--d-primary-subtle-fg', '--d-primary-subtle', 4.5],
    ['--d-error-subtle-fg', '--d-error-subtle', 4.5],
    ['--d-success-subtle-fg', '--d-success-subtle', 4.5],
    ['--d-warning-subtle-fg', '--d-warning-subtle', 4.5],
    ['--d-info-subtle-fg', '--d-info-subtle', 4.5],
  ];

  for (const [fgKey, bgKey, minRatio] of PAIRS) {
    const fg = tokens[fgKey];
    const bg = tokens[bgKey];
    if (!fg || !bg) continue;

    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    const ratio = contrast(fgRgb, bgRgb);

    if (ratio < minRatio) {
      // Auto-adjust: darken or lighten fg until contrast meets threshold
      tokens[fgKey] = adjustForContrast(fg, bg, minRatio);
    }
  }

  return tokens;
}

function adjustForContrast(fgHex, bgHex, targetRatio) {
  const bgRgb = hexToRgb(bgHex);
  const bgLum = luminance(...bgRgb);
  let [h, s, l] = rgbToHsl(...hexToRgb(fgHex));

  // Determine direction: if bg is dark, lighten fg; if bg is light, darken fg
  const direction = bgLum < 0.5 ? 1 : -1;

  for (let i = 0; i < 50; i++) {
    l = l + direction * 2;
    l = Math.max(0, Math.min(100, l));
    const adjusted = rgbToHex(...hslToRgb(h, s, l));
    const adjRgb = hexToRgb(adjusted);
    if (contrast(adjRgb, bgRgb) >= targetRatio) return adjusted;
  }

  // Fallback: pure white or black
  return bgLum < 0.5 ? '#ffffff' : '#09090b';
}

// ============================================================
// Personality Presets
// ============================================================

const RADIUS = {
  sharp:   { sm: '2px',  default: '0',    lg: '0',    full: '9999px' },
  rounded: { sm: '4px',  default: '8px',  lg: '12px', full: '9999px' },
  pill:    { sm: '6px',  default: '12px', lg: '16px', full: '9999px' },
};

const ELEVATION = {
  flat: {
    light: ['none', 'none', 'none', 'none'],
    dark:  ['none', 'none', 'none', 'none'],
  },
  subtle: {
    light: [
      'none',
      '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)',
      '0 4px 12px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.04)',
      '0 12px 32px rgba(0,0,0,0.12),0 4px 8px rgba(0,0,0,0.06)',
    ],
    dark: [
      'none',
      '0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2)',
      '0 4px 12px rgba(0,0,0,0.3),0 2px 4px rgba(0,0,0,0.2)',
      '0 12px 32px rgba(0,0,0,0.4),0 4px 8px rgba(0,0,0,0.3)',
    ],
  },
  raised: {
    light: [
      'none',
      '0 2px 6px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.06)',
      '0 8px 24px rgba(0,0,0,0.12),0 4px 8px rgba(0,0,0,0.06)',
      '0 20px 48px rgba(0,0,0,0.16),0 8px 16px rgba(0,0,0,0.08)',
    ],
    dark: [
      'none',
      '0 2px 6px rgba(0,0,0,0.4),0 1px 3px rgba(0,0,0,0.3)',
      '0 8px 24px rgba(0,0,0,0.4),0 4px 8px rgba(0,0,0,0.3)',
      '0 20px 48px rgba(0,0,0,0.5),0 8px 16px rgba(0,0,0,0.4)',
    ],
  },
  glass: {
    light: [
      'none',
      '0 1px 3px rgba(0,0,0,0.06)',
      '0 4px 16px rgba(0,0,0,0.08)',
      '0 12px 40px rgba(0,0,0,0.1)',
    ],
    dark: [
      'none',
      '0 1px 3px rgba(0,0,0,0.2)',
      '0 4px 16px rgba(0,0,0,0.3)',
      '0 12px 40px rgba(0,0,0,0.4)',
    ],
  },
  brutalist: {
    light: ['none', '2px 2px 0 var(--d-fg)', '4px 4px 0 var(--d-fg)', '6px 6px 0 var(--d-fg)'],
    dark:  ['none', '2px 2px 0 var(--d-fg)', '4px 4px 0 var(--d-fg)', '6px 6px 0 var(--d-fg)'],
  },
};

const SURFACE_BLUR = {
  flat:      ['none', 'none', 'none'],
  subtle:    ['none', 'none', 'none'],
  raised:    ['none', 'none', 'none'],
  glass:     ['blur(8px)', 'blur(12px)', 'blur(16px)'],
  brutalist: ['none', 'none', 'none'],
};

const MOTION = {
  instant: {
    instant: '0ms', fast: '0ms', normal: '50ms', slow: '100ms',
    standard: 'ease', decelerate: 'ease-out', accelerate: 'ease-in', bounce: 'steps(1)',
  },
  snappy: {
    instant: '30ms', fast: '80ms', normal: '120ms', slow: '200ms',
    standard: 'ease', decelerate: 'ease-out', accelerate: 'ease-in', bounce: 'steps(2)',
  },
  smooth: {
    instant: '50ms', fast: '150ms', normal: '250ms', slow: '400ms',
    standard: 'cubic-bezier(0.4,0,0.2,1)', decelerate: 'cubic-bezier(0,0,0.2,1)',
    accelerate: 'cubic-bezier(0.4,0,1,1)', bounce: 'cubic-bezier(0.34,1.56,0.64,1)',
  },
  bouncy: {
    instant: '50ms', fast: '150ms', normal: '300ms', slow: '500ms',
    standard: 'cubic-bezier(0.22,1,0.36,1)', decelerate: 'cubic-bezier(0,0,0.2,1)',
    accelerate: 'cubic-bezier(0.4,0,1,1)', bounce: 'cubic-bezier(0.34,1.56,0.64,1)',
  },
};

/** Interaction feel — derived from elevation personality */
const INTERACTION = {
  subtle: {
    hoverTranslate: '0, -1px', hoverBrightness: '1',
    activeScale: '0.98', activeTranslate: '0, 0',
  },
  raised: {
    hoverTranslate: '0, -2px', hoverBrightness: '1.02',
    activeScale: '0.97', activeTranslate: '0, 1px',
  },
  flat: {
    hoverTranslate: '0, 0', hoverBrightness: '1.05',
    activeScale: '0.98', activeTranslate: '0, 0',
  },
  brutalist: {
    hoverTranslate: '-2px, -2px', hoverBrightness: '1',
    activeScale: '1', activeTranslate: '2px, 2px',
  },
};

const ELEVATION_TO_INTERACTION = {
  flat: 'flat', subtle: 'subtle', raised: 'raised', glass: 'subtle', brutalist: 'brutalist',
};

const BORDER = {
  none: { width: '0',   widthStrong: '0',   style: 'none' },
  thin: { width: '1px', widthStrong: '2px', style: 'solid' },
  bold: { width: '2px', widthStrong: '3px', style: 'solid' },
};

/** Palette derivation tuning per elevation type — controls hover/active shifts and alpha values */
const PALETTE_TUNING = {
  flat:      { hoverShift: 8,  activeShift: 15, subtleAlphaLight: 0.10, subtleAlphaDark: 0.15, borderAlphaLight: 0.30, borderAlphaDark: 0.40 },
  subtle:    { hoverShift: 8,  activeShift: 15, subtleAlphaLight: 0.10, subtleAlphaDark: 0.15, borderAlphaLight: 0.30, borderAlphaDark: 0.40 },
  raised:    { hoverShift: 8,  activeShift: 15, subtleAlphaLight: 0.10, subtleAlphaDark: 0.15, borderAlphaLight: 0.30, borderAlphaDark: 0.40 },
  glass:     { hoverShift: 5,  activeShift: 10, subtleAlphaLight: 0.20, subtleAlphaDark: 0.25, borderAlphaLight: 0.20, borderAlphaDark: 0.30 },
  brutalist: { hoverShift: 12, activeShift: 20, subtleAlphaLight: 0.15, subtleAlphaDark: 0.20, borderAlphaLight: 0.80, borderAlphaDark: 0.80 },
};

const DENSITY = {
  compact: {
    padX: 'var(--d-sp-2)', padY: 'var(--d-sp-1)', gap: 'var(--d-sp-1-5)',
    minH: '1.75rem', text: 'var(--d-text-sm,0.75rem)',
    compoundPad: 'var(--d-sp-3)', compoundGap: 'var(--d-sp-2)',
  },
  comfortable: {
    padX: 'var(--d-sp-4)', padY: 'var(--d-sp-2)', gap: 'var(--d-sp-2)',
    minH: '2.25rem', text: 'var(--d-text-base,0.875rem)',
    compoundPad: 'var(--d-sp-5)', compoundGap: 'var(--d-sp-3)',
  },
  spacious: {
    padX: 'var(--d-sp-6)', padY: 'var(--d-sp-3)', gap: 'var(--d-sp-3)',
    minH: '2.75rem', text: 'var(--d-text-md,1rem)',
    compoundPad: 'var(--d-sp-8)', compoundGap: 'var(--d-sp-4)',
  },
};

// ============================================================
// Defaults
// ============================================================

export const defaultSeed = {
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
};

export const defaultPersonality = {
  radius: 'rounded',
  elevation: 'subtle',
  motion: 'smooth',
  borders: 'thin',
  density: 'comfortable',
  gradient: 'none',
};

// ============================================================
// Shared Typography & Spacing (stable across styles/modes)
// ============================================================

const TYPOGRAPHY = {
  '--d-font': 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  '--d-font-mono': 'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
  '--d-text-xs': '0.625rem', '--d-text-sm': '0.75rem', '--d-text-base': '0.875rem',
  '--d-text-md': '1rem', '--d-text-lg': '1.125rem', '--d-text-xl': '1.25rem',
  '--d-text-2xl': '1.5rem', '--d-text-3xl': '2rem', '--d-text-4xl': '2.5rem',
  '--d-lh-none': '1', '--d-lh-tight': '1.1', '--d-lh-snug': '1.25',
  '--d-lh-normal': '1.5', '--d-lh-relaxed': '1.6', '--d-lh-loose': '1.75',
  '--d-fw-heading': '700', '--d-fw-title': '600', '--d-fw-medium': '500',
  '--d-ls-heading': '-0.025em',
};

const SPACING = {
  '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem',
  '--d-sp-2-5': '0.625rem', '--d-sp-3': '0.75rem', '--d-sp-4': '1rem',
  '--d-sp-5': '1.25rem', '--d-sp-6': '1.5rem', '--d-sp-8': '2rem',
  '--d-sp-10': '2.5rem', '--d-sp-12': '3rem', '--d-sp-16': '4rem',
  '--d-pad': '1.25rem',
  // Compound component spacing contract (Card, Modal, AlertDialog, Drawer, Sheet)
  '--d-compound-gap': 'var(--d-sp-3)',
  '--d-compound-pad': 'var(--d-pad)',
  // Popup offset tokens — distance between trigger and floating layer
  '--d-offset-dropdown': '2px',
  '--d-offset-menu': '4px',
  '--d-offset-tooltip': '6px',
  '--d-offset-popover': '8px',
  // Dropdown panel max-height — unified for all select-like components
  '--d-panel-max-h': '240px',
  // Tree indentation per level
  '--d-tree-indent': '1em',
  // Switch track/thumb dimensions (token-based for size variants + centering)
  '--d-switch-w': '2.5rem',
  '--d-switch-h': '1.375rem',
  '--d-switch-thumb': '1rem',
  // InputNumber stepper button width
  '--d-stepper-w': '2rem',
};

const Z_INDEX = {
  '--d-z-dropdown': '1000',
  '--d-z-sticky': '1100',
  '--d-z-modal': '1200',
  '--d-z-popover': '1300',
  '--d-z-toast': '1400',
  '--d-z-tooltip': '1500',
};

// ============================================================
// Sub-Derivation Functions
// ============================================================

/** Derive 7 tokens for a single palette color role */
function derivePaletteColor(hex, mode, bgHex, personality) {
  const isDark = mode === 'dark';
  const elev = (personality && personality.elevation) || 'subtle';
  const t = PALETTE_TUNING[elev] || PALETTE_TUNING.subtle;
  return {
    base: hex,
    fg: pickForeground(hex),
    hover: isDark ? lighten(hex, t.hoverShift) : darken(hex, t.hoverShift),
    active: isDark ? lighten(hex, Math.round(t.hoverShift / 2)) : darken(hex, t.activeShift),
    subtle: alpha(hex, isDark ? t.subtleAlphaDark : t.subtleAlphaLight),
    subtleFg: isDark ? lighten(hex, 15) : darken(hex, 10),
    border: alpha(hex, isDark ? t.borderAlphaDark : t.borderAlphaLight),
  };
}

/** Derive neutral palette (bg, fg, muted, border, etc.) */
function deriveNeutral(neutralHex, bgHex, mode) {
  const isDark = mode === 'dark';
  return {
    bg: bgHex,
    fg: isDark ? '#fafafa' : '#09090b',
    muted: isDark ? lighten(neutralHex, 10) : neutralHex,
    mutedFg: isDark ? lighten(neutralHex, 25) : darken(neutralHex, 10),
    border: isDark ? lighten(bgHex, 12) : darken(bgHex, 12),
    borderStrong: isDark ? lighten(bgHex, 25) : darken(bgHex, 30),
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
  };
}

/** Derive 4 surface levels (bg, fg, border, filter) */
function deriveSurfaces(neutralHex, bgHex, fgHex, mode, elevationType) {
  const isDark = mode === 'dark';
  const isGlass = elevationType === 'glass';

  const s0 = bgHex;
  const s1 = isGlass
    ? (isDark ? alpha(lighten(bgHex, 8), 0.7) : alpha(bgHex, 0.7))
    : (isDark ? lighten(bgHex, 4) : mixColors(bgHex, neutralHex, 0.03));
  const s2 = isGlass
    ? (isDark ? alpha(lighten(bgHex, 10), 0.8) : alpha(bgHex, 0.8))
    : (isDark ? lighten(bgHex, 7) : mixColors(bgHex, neutralHex, 0.02));
  const s3 = isGlass
    ? (isDark ? alpha(lighten(bgHex, 6), 0.85) : alpha(bgHex, 0.85))
    : (isDark ? lighten(bgHex, 3) : bgHex);

  const blur = SURFACE_BLUR[elevationType] || SURFACE_BLUR.subtle;

  return {
    '--d-surface-0': s0, '--d-surface-0-fg': fgHex, '--d-surface-0-border': isDark ? lighten(bgHex, 12) : darken(bgHex, 12),
    '--d-surface-1': s1, '--d-surface-1-fg': fgHex, '--d-surface-1-border': isDark ? lighten(bgHex, 15) : darken(bgHex, 10),
    '--d-surface-2': s2, '--d-surface-2-fg': fgHex, '--d-surface-2-border': isDark ? lighten(bgHex, 18) : darken(bgHex, 8),
    '--d-surface-3': s3, '--d-surface-3-fg': fgHex, '--d-surface-3-border': isDark ? lighten(bgHex, 10) : darken(bgHex, 6),
    '--d-surface-1-filter': blur[0],
    '--d-surface-2-filter': blur[1],
    '--d-surface-3-filter': blur[2],
  };
}

// ============================================================
// Main Derivation
// ============================================================

/**
 * Derive full token set from seed + personality + mode.
 * @param {Object} seed - Color seed values (8-12 properties)
 * @param {Object} personality - Visual personality traits
 * @param {'light'|'dark'} mode - Color mode
 * @param {Object} [typography] - Typography overrides (e.g. retro's heavier weights)
 * @param {Object} [overrides] - Per-mode token overrides
 * @returns {Record<string, string>} Complete token map (~170 CSS custom properties)
 */
export function derive(seed, personality, mode, typography, overrides) {
  const s = { ...defaultSeed, ...seed };
  const p = { ...defaultPersonality, ...personality };
  const isDark = mode === 'dark';

  // Auto-derive missing seed colors
  if (!seed.accent) s.accent = rotateHue(s.primary, 60);
  if (!seed.tertiary) s.tertiary = rotateHue(s.primary, -60);
  if (!seed.info) s.info = rotateHue(s.primary, 20);

  // Resolve bg per mode
  const bgHex = isDark ? (s.bgDark || '#0a0a0a') : (s.bg || '#ffffff');
  const fgHex = isDark ? '#fafafa' : '#09090b';

  // --- Palette colors (7 roles × 7 modifiers = 49 tokens) ---
  const palette = {};
  const roles = ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
  for (const role of roles) {
    const d = derivePaletteColor(s[role], mode, bgHex, p);
    palette[`--d-${role}`] = d.base;
    palette[`--d-${role}-fg`] = d.fg;
    palette[`--d-${role}-hover`] = d.hover;
    palette[`--d-${role}-active`] = d.active;
    palette[`--d-${role}-subtle`] = d.subtle;
    palette[`--d-${role}-subtle-fg`] = d.subtleFg;
    palette[`--d-${role}-border`] = d.border;
  }

  // --- Neutral (8 tokens) ---
  const n = deriveNeutral(s.neutral, bgHex, mode);
  const neutralTokens = {
    '--d-bg': n.bg,
    '--d-fg': n.fg,
    '--d-muted': n.muted,
    '--d-muted-fg': n.mutedFg,
    '--d-border': n.border,
    '--d-border-strong': n.borderStrong,
    '--d-ring': 'var(--d-primary)',
    '--d-overlay': n.overlay,
  };

  // --- Surfaces (15 tokens) ---
  const surfaces = deriveSurfaces(s.neutral, bgHex, fgHex, mode, p.elevation);

  // --- Elevation (4 tokens) ---
  const elev = (ELEVATION[p.elevation] || ELEVATION.subtle)[mode] || ELEVATION.subtle.light;
  const elevation = {
    '--d-elevation-0': elev[0],
    '--d-elevation-1': elev[1],
    '--d-elevation-2': elev[2],
    '--d-elevation-3': elev[3],
  };

  // --- Interaction (12 tokens) ---
  const interType = ELEVATION_TO_INTERACTION[p.elevation] || 'subtle';
  const inter = INTERACTION[interType];
  const hoverShadow = elev[1] === 'none' ? 'none' : elev[2];
  const activeShadow = elev[0] === 'none' ? 'none' : elev[1];
  const interaction = {
    '--d-hover-translate': inter.hoverTranslate,
    '--d-hover-shadow': hoverShadow,
    '--d-hover-brightness': inter.hoverBrightness,
    '--d-active-scale': inter.activeScale,
    '--d-active-translate': inter.activeTranslate,
    '--d-active-shadow': activeShadow,
    '--d-focus-ring-width': p.borders === 'bold' ? '3px' : '2px',
    '--d-focus-ring-color': 'var(--d-ring)',
    '--d-focus-ring-offset': '2px',
    '--d-focus-ring-style': p.elevation === 'brutalist' ? 'dashed' : 'solid',
    '--d-selection-bg': 'var(--d-primary-subtle)',
    '--d-selection-fg': 'var(--d-primary)',
  };

  // --- Motion (8 tokens) ---
  const m = MOTION[p.motion] || MOTION.smooth;
  const motion = {
    '--d-duration-instant': m.instant,
    '--d-duration-fast': m.fast,
    '--d-duration-normal': m.normal,
    '--d-duration-slow': m.slow,
    '--d-easing-standard': m.standard,
    '--d-easing-decelerate': m.decelerate,
    '--d-easing-accelerate': m.accelerate,
    '--d-easing-bounce': m.bounce,
  };

  // --- Radius (4 tokens) ---
  const rad = RADIUS[p.radius] || RADIUS.rounded;
  const radius = {
    '--d-radius-sm': rad.sm,
    '--d-radius': rad.default,
    '--d-radius-lg': rad.lg,
    '--d-radius-full': rad.full,
  };

  // --- Border (3 tokens) ---
  const brd = BORDER[p.borders] || BORDER.thin;
  const border = {
    '--d-border-width': brd.width,
    '--d-border-width-strong': brd.widthStrong,
    '--d-border-style': brd.style,
  };

  // --- Density (5 tokens) ---
  const den = DENSITY[p.density] || DENSITY.comfortable;
  const density = {
    '--d-density-pad-x': den.padX,
    '--d-density-pad-y': den.padY,
    '--d-density-gap': den.gap,
    '--d-density-min-h': den.minH,
    '--d-density-text': den.text,
  };

  // --- Gradients (10 tokens) ---
  const gNone = p.gradient === 'none';
  const angle = 'var(--d-gradient-angle)';
  const gradients = {
    '--d-gradient-angle': '135deg',
    '--d-gradient-intensity': gNone ? '0' : '1',
    '--d-gradient-brand': gNone
      ? 'var(--d-primary)' : `linear-gradient(${angle},var(--d-primary),var(--d-accent))`,
    '--d-gradient-brand-alt': gNone
      ? 'var(--d-accent)' : `linear-gradient(${angle},var(--d-accent),var(--d-tertiary))`,
    '--d-gradient-brand-full': gNone
      ? 'var(--d-primary)' : `linear-gradient(${angle},var(--d-primary),var(--d-accent),var(--d-tertiary))`,
    '--d-gradient-surface': gNone
      ? 'var(--d-surface-0)' : 'linear-gradient(180deg,var(--d-surface-0),var(--d-surface-1))',
    '--d-gradient-overlay': 'linear-gradient(180deg,transparent,var(--d-overlay))',
    '--d-gradient-subtle': gNone
      ? 'transparent' : 'linear-gradient(180deg,transparent,var(--d-primary-subtle))',
    '--d-gradient-text': gNone
      ? 'var(--d-primary)' : `linear-gradient(${angle},var(--d-primary),var(--d-accent))`,
    '--d-gradient-text-alt': gNone
      ? 'var(--d-accent)' : `linear-gradient(${angle},var(--d-accent),var(--d-tertiary))`,
  };

  // --- Charts (9 base + 24 extended + 4 chart UI tokens) ---
  const chartBase = [s.primary, s.accent, s.tertiary, s.success, s.warning, s.error, s.info, isDark ? lighten(s.neutral, 10) : s.neutral];
  const charts = {};
  for (let i = 0; i < 8; i++) {
    charts[`--d-chart-${i}`] = chartBase[i];
    // Extended palette: 3 variations per base (lightness/hue shifts)
    charts[`--d-chart-${i}-ext-1`] = isDark ? lighten(chartBase[i], 15) : darken(chartBase[i], 15);
    charts[`--d-chart-${i}-ext-2`] = rotateHue(chartBase[i], 30);
    charts[`--d-chart-${i}-ext-3`] = isDark ? lighten(rotateHue(chartBase[i], -30), 10) : darken(rotateHue(chartBase[i], -30), 10);
  }
  charts['--d-chart-tooltip-bg'] = 'var(--d-surface-2)';
  charts['--d-chart-grid'] = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  charts['--d-chart-axis'] = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  charts['--d-chart-crosshair'] = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  charts['--d-chart-selection'] = alpha(s.primary, 0.15);

  // --- Legacy compat (remove after _base.js migration to --d-* tokens) ---
  const legacy = {
    '--d-transition': `all ${m.normal} ${m.standard}`,
    '--d-shadow': elev[1],
    '--d-radius-lg-compat': rad.lg, // old --d-radius-lg
  };

  // --- Merge all layers ---
  const tokens = {
    ...palette,
    ...neutralTokens,
    ...surfaces,
    ...elevation,
    ...interaction,
    ...motion,
    ...radius,
    ...border,
    ...density,
    ...Z_INDEX,
    ...gradients,
    ...charts,
    ...TYPOGRAPHY,
    ...SPACING,
    ...legacy,
    // Style-specific typography overrides (e.g. retro's heavier weights)
    ...(typography || {}),
  };

  // Apply per-mode overrides last (highest priority)
  if (overrides) {
    Object.assign(tokens, overrides);
  }

  // Validate and auto-adjust contrast for WCAG AA compliance
  validateContrast(tokens);

  return tokens;
}

/**
 * Generate legacy --c0 through --c9 mapping for backward compatibility.
 * Applied alongside new tokens during migration period.
 * @param {Record<string, string>} tokens - Derived token map
 * @returns {Record<string, string>} Legacy color map
 */
export function legacyColorMap(tokens) {
  return {
    '--c0': tokens['--d-bg'],
    '--c1': tokens['--d-primary'],
    '--c2': tokens['--d-surface-1'],
    '--c3': tokens['--d-fg'],
    '--c4': tokens['--d-muted'],
    '--c5': tokens['--d-border'],
    '--c6': tokens['--d-primary-hover'],
    '--c7': tokens['--d-success'],
    '--c8': tokens['--d-warning'],
    '--c9': tokens['--d-error'],
  };
}

/**
 * Generate density class CSS for the three density presets.
 * Injected once into the d.base layer.
 * @returns {string} CSS rules for .d-compact, .d-comfortable, .d-spacious
 */
export function densityCSS() {
  let css = '';
  for (const [name, d] of Object.entries(DENSITY)) {
    css += `.d-${name}{--d-density-pad-x:${d.padX};--d-density-pad-y:${d.padY};--d-density-gap:${d.gap};--d-density-min-h:${d.minH};--d-density-text:${d.text};--d-compound-pad:${d.compoundPad};--d-compound-gap:${d.compoundGap}}`;
  }
  return css;
}
