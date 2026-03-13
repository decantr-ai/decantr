/**
 * Decantr Design System v2 — Derivation Engine
 * Expands 8-12 seed values + personality traits into 280+ semantic design tokens.
 * Pure functions, zero side effects, zero dependencies.
 * Color math uses OKLCH (perceptually uniform color space).
 *
 * @module derive
 */

// ============================================================
// Color Math (OKLCH — perceptually uniform color space)
// ============================================================

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
}

/** sRGB [0-255] → linear [0-1] (remove gamma) */
function linearize(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** linear [0-1] → sRGB [0-255] (apply gamma) */
function delinearize(v) {
  v = Math.max(0, Math.min(1, v));
  return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055) * 255);
}

/**
 * Convert sRGB [0-255] to OKLCH [L:0-1, C:0-~0.37, H:0-360].
 * Pipeline: sRGB → linear RGB → LMS (M1) → cube root → OKLAB (M2) → OKLCH.
 */
function rgbToOklch(r, g, b) {
  const lr = linearize(r), lg = linearize(g), lb = linearize(b);
  // Linear RGB → LMS (M1 matrix, Oklab spec)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  // Cube root
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  // LMS' → OKLAB (M2 matrix)
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  // OKLAB → OKLCH
  const C = Math.sqrt(a * a + bk * bk);
  let H = Math.atan2(bk, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

/**
 * Convert OKLCH [L:0-1, C:0-~0.37, H:0-360] to sRGB [0-255].
 * Pipeline: OKLCH → OKLAB → LMS' (M2 inv) → cube → LMS → linear RGB (M1 inv) → sRGB.
 */
function oklchToRgb(L, C, H) {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad), bk = C * Math.sin(hRad);
  // OKLAB → LMS' (M2 inverse)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bk;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bk;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bk;
  // Cube
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  // LMS → linear RGB (M1 inverse)
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [delinearize(lr), delinearize(lg), delinearize(lb)];
}

/** Clamp OKLCH to sRGB gamut by reducing chroma via binary search */
function gamutMap(L, C, H) {
  if (C < 0.001) return [L, 0, H];
  const hRad = H * Math.PI / 180;
  const cosH = Math.cos(hRad), sinH = Math.sin(hRad);
  const e = 0.001;
  function inGamut(c) {
    const a = c * cosH, b = c * sinH;
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    if (lr < -e || lr > 1 + e) return false;
    const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    if (lg < -e || lg > 1 + e) return false;
    const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    return lb >= -e && lb <= 1 + e;
  }
  if (inGamut(C)) return [L, C, H];
  let lo = 0, hi = C;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(mid)) lo = mid; else hi = mid;
  }
  return [L, lo, H];
}

/** WCAG 2.1 relative luminance (sRGB-based per spec) */
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

/** Darken by adjusting OKLCH L channel (amount: 0-100 scale, maps to 0-1 L) */
function darken(hex, amount) {
  const [L, C, H] = rgbToOklch(...hexToRgb(hex));
  const [gL, gC, gH] = gamutMap(Math.max(0, L - amount / 100), C, H);
  return rgbToHex(...oklchToRgb(gL, gC, gH));
}

/** Lighten by adjusting OKLCH L channel (amount: 0-100 scale, maps to 0-1 L) */
function lighten(hex, amount) {
  const [L, C, H] = rgbToOklch(...hexToRgb(hex));
  const [gL, gC, gH] = gamutMap(Math.min(1, L + amount / 100), C, H);
  return rgbToHex(...oklchToRgb(gL, gC, gH));
}

function alpha(hex, opacity) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

/** Mix two colors in OKLCH space (perceptually uniform interpolation) */
function mixColors(hex1, hex2, weight) {
  const [L1, C1, H1] = rgbToOklch(...hexToRgb(hex1));
  const [L2, C2, H2] = rgbToOklch(...hexToRgb(hex2));
  const L = L1 + (L2 - L1) * weight;
  const C = C1 + (C2 - C1) * weight;
  // Hue interpolation along short arc; handle achromatic
  let H;
  if (C1 < 0.001) H = H2;
  else if (C2 < 0.001) H = H1;
  else {
    let dH = H2 - H1;
    if (dH > 180) dH -= 360;
    if (dH < -180) dH += 360;
    H = (H1 + dH * weight + 360) % 360;
  }
  const [gL, gC, gH] = gamutMap(L, C, H);
  return rgbToHex(...oklchToRgb(gL, gC, gH));
}

/** Pick foreground (white or near-black) for WCAG AA on given background */
function pickForeground(bgHex) {
  const bgRgb = hexToRgb(bgHex);
  return contrast([255, 255, 255], bgRgb) >= 4.5 ? '#ffffff' : '#09090b';
}

/** Rotate hue by degrees in OKLCH space */
function rotateHue(hex, degrees) {
  const [L, C, H] = rgbToOklch(...hexToRgb(hex));
  const [gL, gC, gH] = gamutMap(L, C, (H + degrees + 360) % 360);
  return rgbToHex(...oklchToRgb(gL, gC, gH));
}

// Export color utils for testing and style overrides
export { hexToRgb, rgbToHex, rgbToOklch, oklchToRgb, gamutMap, darken, lighten, alpha, mixColors, pickForeground, rotateHue, contrast, validateContrast, adjustForContrast, transformSeedsForCVD };

// ============================================================
// Contrast Validation (WCAG AA)
// ============================================================

/**
 * Validates and auto-adjusts color pairs that fail WCAG AA contrast.
 * Text pairs validated at 4.5:1, non-text (borders) at 3:1.
 * @param {Object} tokens - The full token map
 * @returns {Object} tokens with any necessary adjustments
 */
function validateContrast(tokens) {
  const PAIRS = [
    // [foreground-token, background-token, min-ratio]
    // --- Text contrast (4.5:1) ---
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
    ['--d-accent-subtle-fg', '--d-accent-subtle', 4.5],
    ['--d-tertiary-subtle-fg', '--d-tertiary-subtle', 4.5],
    ['--d-error-subtle-fg', '--d-error-subtle', 4.5],
    ['--d-success-subtle-fg', '--d-success-subtle', 4.5],
    ['--d-warning-subtle-fg', '--d-warning-subtle', 4.5],
    ['--d-info-subtle-fg', '--d-info-subtle', 4.5],
    // --- Non-text contrast (3:1, WCAG 1.4.11) ---
    ['--d-border', '--d-bg', 3],
    ['--d-surface-1-border', '--d-surface-1', 3],
    ['--d-surface-2-border', '--d-surface-2', 3],
    ['--d-surface-3-border', '--d-surface-3', 3],
    // --- Field & selection contrast ---
    ['--d-field-placeholder', '--d-field-bg', 3],
    ['--d-selected-fg', '--d-selected-bg', 4.5],
  ];

  for (const [fgKey, bgKey, minRatio] of PAIRS) {
    const fg = tokens[fgKey];
    const bg = tokens[bgKey];
    // Skip missing, non-hex, or rgba values (glass surfaces, alpha borders)
    if (!fg || !bg || !fg.startsWith('#') || !bg.startsWith('#')) continue;

    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    const ratio = contrast(fgRgb, bgRgb);

    if (ratio < minRatio) {
      tokens[fgKey] = adjustForContrast(fg, bg, minRatio);
    }
  }

  return tokens;
}

/** Adjust foreground color via OKLCH L until contrast meets target */
function adjustForContrast(fgHex, bgHex, targetRatio) {
  const bgRgb = hexToRgb(bgHex);
  const bgLum = luminance(...bgRgb);
  let [L, C, H] = rgbToOklch(...hexToRgb(fgHex));

  // If bg is dark, lighten fg; if bg is light, darken fg
  const direction = bgLum < 0.5 ? 1 : -1;

  for (let i = 0; i < 50; i++) {
    L = Math.max(0, Math.min(1, L + direction * 0.02));
    const [gL, gC, gH] = gamutMap(L, C, H);
    const adjusted = rgbToHex(...oklchToRgb(gL, gC, gH));
    const adjRgb = hexToRgb(adjusted);
    if (contrast(adjRgb, bgRgb) >= targetRatio) return adjusted;
  }

  return bgLum < 0.5 ? '#ffffff' : '#09090b';
}

// ============================================================
// Personality Presets
// ============================================================

const RADIUS = {
  sharp:   { sm: '2px',    default: '0',      lg: '0',      full: '9999px', panel: '0',    inner: '0'   },
  rounded: { sm: '4px',    default: '8px',    lg: '12px',   full: '9999px', panel: '8px',  inner: '6px' },
  pill:    { sm: '9999px', default: '9999px', lg: '24px',   full: '9999px', panel: '16px', inner: '14px' },
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
    instant: '0ms', fast: '0ms', normal: '50ms', slow: '100ms', spin: '200ms',
    standard: 'ease', decelerate: 'ease-out', accelerate: 'ease-in', bounce: 'steps(1)',
  },
  snappy: {
    instant: '30ms', fast: '80ms', normal: '120ms', slow: '200ms', spin: '500ms',
    standard: 'ease', decelerate: 'ease-out', accelerate: 'ease-in', bounce: 'steps(2)',
  },
  smooth: {
    instant: '50ms', fast: '150ms', normal: '250ms', slow: '400ms', spin: '850ms',
    standard: 'cubic-bezier(0.4,0,0.2,1)', decelerate: 'cubic-bezier(0,0,0.2,1)',
    accelerate: 'cubic-bezier(0.4,0,1,1)', bounce: 'cubic-bezier(0.34,1.56,0.64,1)',
  },
  bouncy: {
    instant: '50ms', fast: '150ms', normal: '300ms', slow: '500ms', spin: '1000ms',
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
    padX: 'var(--d-field-px-sm)', padY: 'var(--d-field-py-sm)', gap: 'var(--d-field-gap-sm)',
    minH: 'var(--d-field-h-sm)', text: 'var(--d-field-text-sm)',
    compoundPad: 'var(--d-sp-3)', compoundGap: 'var(--d-sp-2)',
  },
  comfortable: {
    padX: 'var(--d-field-px-md)', padY: 'var(--d-field-py-md)', gap: 'var(--d-field-gap-md)',
    minH: 'var(--d-field-h-md)', text: 'var(--d-field-text-md)',
    compoundPad: 'var(--d-sp-5)', compoundGap: 'var(--d-sp-3)',
  },
  spacious: {
    padX: 'var(--d-field-px-lg)', padY: 'var(--d-field-py-lg)', gap: 'var(--d-field-gap-lg)',
    minH: 'var(--d-field-h-lg)', text: 'var(--d-field-text-lg)',
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
  palette: 'standard',
};

/**
 * Derive monochrome seed colors from a single primary hue.
 * All 7 role colors are constrained within ±20° of the primary hue in OKLCH space,
 * distinguished by lightness and chroma shifts.
 * @param {string} primaryHex - The base color hex
 * @returns {Object} Seed overrides for accent, tertiary, success, warning, error, info
 */
export function deriveMonochromeSeed(primaryHex) {
  const [L, C, H] = rgbToOklch(...hexToRgb(primaryHex));
  const gc = (l, c, h) => { const [gL, gC, gH] = gamutMap(l, c, (h + 360) % 360); return rgbToHex(...oklchToRgb(gL, gC, gH)); };
  return {
    accent:   gc(Math.min(1, L + 0.08), C * 0.8,  H + 15),
    tertiary: gc(Math.max(0, L - 0.05), C * 0.7,  H - 15),
    success:  gc(Math.min(1, L + 0.12), C * 0.9,  H + 10),
    warning:  gc(Math.min(1, L + 0.05), C * 1.1,  H - 8),
    error:    gc(Math.max(0, L - 0.03), C * 1.2,  H - 20),
    info:     gc(Math.min(1, L + 0.15), C * 0.6,  H + 5),
  };
}

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
  '--d-ls-caps': '0.05em',
};

const SPACING = {
  '--d-sp-0-5': '0.125rem', '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem',
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
  // ── Field sizing contract (height-first, 4-tier scale) ──
  // Heights — primary constraint; padding derives from these
  '--d-field-h-xs': '1.5rem',     // 24px
  '--d-field-h-sm': '1.75rem',    // 28px
  '--d-field-h-md': '2.25rem',    // 36px (= density comfortable)
  '--d-field-h-lg': '2.75rem',    // 44px (= density spacious)
  // Vertical padding per tier
  '--d-field-py-xs': 'var(--d-sp-1)',     // 4px
  '--d-field-py-sm': 'var(--d-sp-1)',     // 4px
  '--d-field-py-md': 'var(--d-sp-2)',     // 8px
  '--d-field-py-lg': 'var(--d-sp-2-5)',   // 10px
  // Horizontal padding per tier
  '--d-field-px-xs': 'var(--d-sp-2)',     // 8px
  '--d-field-px-sm': 'var(--d-sp-2-5)',   // 10px
  '--d-field-px-md': 'var(--d-sp-4)',     // 16px
  '--d-field-px-lg': 'var(--d-sp-6)',     // 24px
  // Font size per tier
  '--d-field-text-xs': 'var(--d-text-xs)',    // 10px
  '--d-field-text-sm': 'var(--d-text-sm)',    // 12px
  '--d-field-text-md': 'var(--d-text-base)',  // 14px
  '--d-field-text-lg': 'var(--d-text-md)',    // 16px
  // Gap per tier
  '--d-field-gap-xs': 'var(--d-sp-1)',     // 4px
  '--d-field-gap-sm': 'var(--d-sp-1-5)',   // 6px
  '--d-field-gap-md': 'var(--d-sp-2)',     // 8px
  '--d-field-gap-lg': 'var(--d-sp-2-5)',   // 10px
  // ── Switch track/thumb dimensions per tier ──
  '--d-switch-w-xs': '1.5rem',    '--d-switch-h-xs': '0.875rem',  '--d-switch-thumb-xs': '0.625rem',
  '--d-switch-w-sm': '1.75rem',   '--d-switch-h-sm': '1rem',      '--d-switch-thumb-sm': '0.75rem',
  '--d-switch-w': '2.5rem',       '--d-switch-h': '1.375rem',     '--d-switch-thumb': '1rem',
  '--d-switch-w-lg': '3.25rem',   '--d-switch-h-lg': '1.75rem',   '--d-switch-thumb-lg': '1.25rem',
  // ── Checkbox/Radio indicator size per tier ──
  '--d-checkbox-size-xs': '0.875rem',   // 14px
  '--d-checkbox-size-sm': '1rem',       // 16px
  '--d-checkbox-size': '1.125rem',      // 18px (default)
  '--d-checkbox-size-lg': '1.375rem',   // 22px
  // ── Rate star size per tier ──
  '--d-rate-size-sm': 'var(--d-text-md)',      // 1rem
  '--d-rate-size': 'var(--d-text-xl)',          // 1.25rem
  '--d-rate-size-lg': '1.75rem',               // between text-2xl and text-3xl
  '--d-rate-gap-sm': 'var(--d-sp-0-5)',         // tighter gap for small
  // ── OTP slot dimensions per tier ──
  '--d-otp-w-sm': '2rem',      '--d-otp-h-sm': '2rem',      '--d-otp-text-sm': 'var(--d-text-base)',
  '--d-otp-w': '2.5rem',       '--d-otp-h': '2.5rem',       '--d-otp-text': 'var(--d-text-lg)',
  '--d-otp-w-lg': '3rem',      '--d-otp-h-lg': '3rem',      '--d-otp-text-lg': 'var(--d-text-xl)',
  // InputNumber stepper button width
  '--d-stepper-w': '2rem',
  // ── Component anatomy tokens ──
  // Avatar sizes
  '--d-avatar-size-sm': '24px', '--d-avatar-size': '36px',
  '--d-avatar-size-lg': '48px', '--d-avatar-size-xl': '64px',
  // Spinner sizes
  '--d-spinner-size-xs': '12px', '--d-spinner-size-sm': '16px',
  '--d-spinner-size-lg': '28px', '--d-spinner-size-xl': '36px',
  // Progress bar heights
  '--d-progress-h': '8px', '--d-progress-h-sm': '4px',
  '--d-progress-h-md': '16px', '--d-progress-h-lg': '24px',
  // Slider geometry
  '--d-slider-thumb': '18px', '--d-slider-track-h': '6px',
  // Indicator dots
  '--d-badge-dot': '8px', '--d-carousel-dot': '8px',
  // Action buttons
  '--d-float-btn-size': '48px', '--d-backtop-size': '40px',
  // Step icon
  '--d-step-icon-size': '2rem',
  // ColorPicker anatomy
  '--d-colorpicker-swatch': '24px', '--d-colorpicker-thumb': '14px',
  '--d-colorpicker-preset': '20px', '--d-colorpicker-sat-h': '150px',
  '--d-colorpicker-bar-h': '12px',
  // Timeline geometry
  '--d-timeline-dot': '10px', '--d-timeline-dot-lg': '24px',
  // RangeSlider thumb
  '--d-rangeslider-thumb': '16px',
  // Sheet handle
  '--d-sheet-handle-w': '40px', '--d-sheet-handle-h': '4px',
  // Animation slide distance
  '--d-slide-distance': '8px',
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
// Colorblind Mode (CVD — Color Vision Deficiency)
// ============================================================

/** Wong/Okabe-Ito adapted chart palettes for CVD safety */
const CVD_CHART_PALETTES = {
  protanopia:   ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#D55E00', '#CC79A7', '#000000'],
  deuteranopia: ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#D55E00', '#CC79A7', '#000000'],
  tritanopia:   ['#D55E00', '#CC79A7', '#009E73', '#000000', '#E69F00', '#56B4E9', '#0072B2', '#F0E442'],
};

/**
 * Transform seed colors for color vision deficiency safety.
 * Shifts hues that are confusable for the given CVD type.
 * Called BEFORE derive() processes seeds, so all derived tokens automatically adapt.
 * @param {Object} seed - Complete seed object
 * @param {'off'|'protanopia'|'deuteranopia'|'tritanopia'} type - CVD type
 * @returns {Object} Transformed seed
 */
function transformSeedsForCVD(seed, type) {
  if (type === 'off') return seed;
  const transformed = { ...seed };

  if (type === 'protanopia' || type === 'deuteranopia') {
    // Red-green CVD (98% of all CVD): shift error red → magenta, success green → teal
    const errRgb = hexToRgb(seed.error || defaultSeed.error);
    const [eL, eC, eH] = rgbToOklch(...errRgb);
    // OKLCH red zone: H ~15-50°
    if (eH >= 10 && eH <= 55) {
      const [gL, gC, gH] = gamutMap(eL, eC, 345);
      transformed.error = rgbToHex(...oklchToRgb(gL, gC, gH));
    }

    const sucRgb = hexToRgb(seed.success || defaultSeed.success);
    const [sL, sC, sH] = rgbToOklch(...sucRgb);
    // OKLCH green zone: H ~125-170°
    if (sH >= 120 && sH <= 175) {
      const [gL, gC, gH] = gamutMap(sL, sC, 190);
      transformed.success = rgbToHex(...oklchToRgb(gL, gC, gH));
    }

    // Shift primary/accent/tertiary if in red or green danger zones
    for (const key of ['primary', 'accent', 'tertiary']) {
      const hex = seed[key] || defaultSeed[key];
      const [pL, pC, pH] = rgbToOklch(...hexToRgb(hex));
      if (pH >= 120 && pH <= 175) {
        // Green → shift toward blue
        const [gL, gC, gH] = gamutMap(pL, pC, pH + 40);
        transformed[key] = rgbToHex(...oklchToRgb(gL, gC, gH));
      } else if (pH >= 10 && pH <= 40) {
        // Red → shift toward magenta
        const [gL, gC, gH] = gamutMap(pL, pC, (pH + 320) % 360);
        transformed[key] = rgbToHex(...oklchToRgb(gL, gC, gH));
      }
    }
  } else if (type === 'tritanopia') {
    // Blue-yellow CVD: shift info blue → teal, warning yellow → orange
    const infRgb = hexToRgb(seed.info || defaultSeed.info);
    const [iL, iC, iH] = rgbToOklch(...infRgb);
    // OKLCH blue zone: H ~240-290°
    if (iH >= 230 && iH <= 295) {
      const [gL, gC, gH] = gamutMap(iL, iC, 170);
      transformed.info = rgbToHex(...oklchToRgb(gL, gC, gH));
    }

    const wrnRgb = hexToRgb(seed.warning || defaultSeed.warning);
    const [wL, wC, wH] = rgbToOklch(...wrnRgb);
    // OKLCH yellow/amber zone: H ~60-125° (amber starts ~65°, yellow extends to ~120°)
    if (wH >= 60 && wH <= 125) {
      const [gL, gC, gH] = gamutMap(wL, wC, 50);
      transformed.warning = rgbToHex(...oklchToRgb(gL, gC, gH));
    }

    // Shift primary if in blue danger zone
    const hex = seed.primary || defaultSeed.primary;
    const [pL, pC, pH] = rgbToOklch(...hexToRgb(hex));
    if (pH >= 230 && pH <= 295) {
      const [gL, gC, gH] = gamutMap(pL, pC, pH - 60);
      transformed.primary = rgbToHex(...oklchToRgb(gL, gC, gH));
    }
  }

  return transformed;
}

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
    : (isDark ? lighten(bgHex, 4) : mixColors(bgHex, neutralHex, 0.04));
  const s2 = isGlass
    ? (isDark ? alpha(lighten(bgHex, 10), 0.8) : alpha(bgHex, 0.8))
    : (isDark ? lighten(bgHex, 7) : mixColors(bgHex, neutralHex, 0.07));
  // Dark non-glass S3: monotonic (+10L > S2's +7L). Glass S3: opacity-based depth.
  const s3 = isGlass
    ? (isDark ? alpha(lighten(bgHex, 6), 0.85) : alpha(bgHex, 0.85))
    : (isDark ? lighten(bgHex, 10) : mixColors(bgHex, neutralHex, 0.10));

  const blur = SURFACE_BLUR[elevationType] || SURFACE_BLUR.subtle;

  return {
    '--d-surface-0': s0, '--d-surface-0-fg': fgHex, '--d-surface-0-border': isDark ? lighten(bgHex, 12) : darken(bgHex, 12),
    '--d-surface-1': s1, '--d-surface-1-fg': fgHex, '--d-surface-1-border': isDark ? lighten(bgHex, 15) : darken(bgHex, 10),
    '--d-surface-2': s2, '--d-surface-2-fg': fgHex, '--d-surface-2-border': isDark ? lighten(bgHex, 18) : darken(bgHex, 12),
    '--d-surface-3': s3, '--d-surface-3-fg': fgHex, '--d-surface-3-border': isDark ? lighten(bgHex, 21) : darken(bgHex, 14),
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
 * @param {Object} [options] - Additional options
 * @param {'off'|'protanopia'|'deuteranopia'|'tritanopia'} [options.colorblind='off'] - Colorblind mode
 * @returns {Record<string, string>} Complete token map (~340 CSS custom properties)
 */
export function derive(seed, personality, mode, typography, overrides, options) {
  const opts = options || {};
  const cbType = opts.colorblind || 'off';

  // Merge seeds, then apply CVD transformation if active
  const rawSeed = { ...defaultSeed, ...seed };
  const s = cbType !== 'off' ? transformSeedsForCVD(rawSeed, cbType) : rawSeed;
  const p = { ...defaultPersonality, ...personality };
  const isDark = mode === 'dark';

  // Auto-derive missing seed colors
  if (!seed.accent) s.accent = rotateHue(s.primary, 60);
  if (!seed.tertiary) s.tertiary = rotateHue(s.primary, -60);
  if (!seed.info) s.info = rotateHue(s.primary, 20);

  // Monochrome palette: derive all role colors from primary hue
  if (p.palette === 'monochrome') {
    const mono = deriveMonochromeSeed(s.primary);
    for (const k of ['accent', 'tertiary', 'success', 'warning', 'error', 'info']) s[k] = mono[k];
  }

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
    '--d-selection-shadow': 'var(--d-elevation-1)',
  };

  // --- Motion (8 tokens) ---
  const m = MOTION[p.motion] || MOTION.smooth;
  const motion = {
    '--d-duration-instant': m.instant,
    '--d-duration-fast': m.fast,
    '--d-duration-normal': m.normal,
    '--d-duration-slow': m.slow,
    '--d-duration-spin': m.spin,
    '--d-easing-standard': m.standard,
    '--d-easing-decelerate': m.decelerate,
    '--d-easing-accelerate': m.accelerate,
    '--d-easing-bounce': m.bounce,
  };

  // --- Radius (6 tokens) ---
  const rad = RADIUS[p.radius] || RADIUS.rounded;
  const radius = {
    '--d-radius-sm': rad.sm,
    '--d-radius': rad.default,
    '--d-radius-lg': rad.lg,
    '--d-radius-full': rad.full,
    '--d-radius-panel': rad.panel,
    '--d-radius-inner': rad.inner,
  };

  // --- Checkbox (2 tokens) ---
  const checkbox = {
    '--d-checkbox-size': '1.125rem',
    '--d-checkbox-radius': rad.sm,
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

  // Override chart tokens with CVD-safe palettes when colorblind mode is active
  if (cbType !== 'off' && CVD_CHART_PALETTES[cbType]) {
    const cbPalette = CVD_CHART_PALETTES[cbType];
    for (let i = 0; i < 8; i++) {
      charts[`--d-chart-${i}`] = cbPalette[i];
      charts[`--d-chart-${i}-ext-1`] = isDark ? lighten(cbPalette[i], 15) : darken(cbPalette[i], 15);
      charts[`--d-chart-${i}-ext-2`] = rotateHue(cbPalette[i], 30);
      charts[`--d-chart-${i}-ext-3`] = isDark ? lighten(rotateHue(cbPalette[i], -30), 10) : darken(rotateHue(cbPalette[i], -30), 10);
    }
  }

  charts['--d-chart-tooltip-bg'] = 'var(--d-surface-2)';
  charts['--d-chart-grid'] = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  charts['--d-chart-axis'] = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  charts['--d-chart-crosshair'] = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  charts['--d-chart-selection'] = alpha(s.primary, 0.15);

  // --- Field tokens (15 tokens) ---
  const isGlass = p.elevation === 'glass';
  const fieldTokens = {
    '--d-field-bg':             'var(--d-bg)',
    '--d-field-bg-hover':       isGlass ? alpha(isDark ? '#ffffff' : '#000000', 0.03) : 'var(--d-surface-1)',
    '--d-field-bg-disabled':    alpha(isDark ? '#ffffff' : '#000000', 0.05),
    '--d-field-bg-readonly':    alpha(isDark ? '#ffffff' : '#000000', 0.03),
    '--d-field-bg-error':       alpha(s.error, 0.06),
    '--d-field-bg-success':     alpha(s.success, 0.06),
    '--d-field-border':         'var(--d-border)',
    '--d-field-border-hover':   'var(--d-border-strong)',
    '--d-field-border-focus':   'var(--d-primary)',
    '--d-field-border-error':   'var(--d-error)',
    '--d-field-border-success': 'var(--d-success)',
    '--d-field-border-disabled': alpha(isDark ? n.border : n.border, 0.5),
    '--d-field-border-width':   'var(--d-border-width)',
    '--d-field-ring':           '0 0 0 var(--d-focus-ring-width) var(--d-ring)',
    '--d-field-ring-error':     `0 0 0 var(--d-focus-ring-width) ${alpha(s.error, 0.25)}`,
    '--d-field-ring-success':   `0 0 0 var(--d-focus-ring-width) ${alpha(s.success, 0.25)}`,
    '--d-field-radius':         'var(--d-radius)',
    '--d-field-placeholder':    'var(--d-muted)',
  };

  // --- Interactive state tokens (9 tokens) ---
  const interactiveState = {
    '--d-item-hover-bg':         isGlass ? alpha(isDark ? '#ffffff' : '#000000', 0.06) : 'var(--d-surface-1)',
    '--d-item-active-bg':        'var(--d-primary-subtle)',
    '--d-selected-bg':           'var(--d-primary-subtle)',
    '--d-selected-fg':           'var(--d-primary)',
    '--d-selected-border':       'var(--d-primary-border)',
    '--d-disabled-opacity':      '0.5',
    '--d-disabled-opacity-soft': '0.35',
    '--d-icon-muted':            '0.55',
    '--d-icon-subtle':           '0.35',
  };

  // --- Overlay tokens (2 tokens) ---
  const overlayTokens = {
    '--d-overlay-light': isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
    '--d-overlay-heavy': isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)',
  };

  // --- Focus ring offset inset (1 token) ---
  const focusInset = {
    '--d-focus-ring-offset-inset': 'calc(var(--d-focus-ring-offset) * -1)',
  };

  // --- Table tokens (4 tokens) ---
  const tableTokens = {
    '--d-table-stripe-bg':   alpha(isDark ? '#ffffff' : '#000000', isDark ? 0.03 : 0.02),
    '--d-table-header-bg':   'var(--d-surface-1)',
    '--d-table-hover-bg':    'var(--d-item-hover-bg)',
    '--d-table-selected-bg': 'var(--d-selected-bg)',
  };

  // --- Semantic motion tokens (3 tokens) ---
  const motionSemantic = {
    '--d-motion-enter': 'var(--d-duration-normal) var(--d-easing-decelerate)',
    '--d-motion-exit':  'var(--d-duration-fast) var(--d-easing-accelerate)',
    '--d-motion-state': 'var(--d-duration-fast) var(--d-easing-standard)',
  };

  // --- Typography semantic roles (5 tokens) ---
  const typographySemantic = {
    '--d-text-helper':  'var(--d-text-xs)',
    '--d-text-error':   'var(--d-text-xs)',
    '--d-prose-width':  '75ch',
    '--d-ls-tight':     '-0.01em',
    '--d-ls-wide':      '0.025em',
  };

  // --- Content width / layout tokens (7 tokens) ---
  const layoutTokens = {
    '--d-content-width-prose':    '75ch',
    '--d-content-width-standard': '960px',
    '--d-sidebar-width-sm':       '220px',
    '--d-sidebar-width':          '260px',
    '--d-sidebar-width-lg':       '320px',
    '--d-drawer-width':           '360px',
    '--d-sheet-max-h':            '85vh',
  };

  // --- Chart UI tokens (4 tokens) ---
  const chartUI = {
    '--d-chart-tooltip-shadow': isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.12)',
    '--d-chart-axis-opacity':   '0.3',
    '--d-chart-grid-opacity':   isDark ? '0.08' : '0.06',
    '--d-chart-legend-gap':     'var(--d-sp-3)',
  };

  // --- Backdrop blur tokens (3 tokens) ---
  const glassBlur = {
    '--d-glass-blur-sm': 'blur(8px)',
    '--d-glass-blur':    'blur(16px)',
    '--d-glass-blur-lg': 'blur(24px)',
  };

  // --- Scrollbar tokens (4 tokens) ---
  const scrollbar = {
    '--d-scrollbar-w':           '8px',
    '--d-scrollbar-track':       'transparent',
    '--d-scrollbar-thumb':       'var(--d-border)',
    '--d-scrollbar-thumb-hover': 'var(--d-border-strong)',
  };

  // --- Skeleton tokens (2 tokens) ---
  const skeleton = {
    '--d-skeleton-bg':    'var(--d-muted)',
    '--d-skeleton-shine': `linear-gradient(90deg,transparent,${alpha(isDark ? '#ffffff' : '#000000', 0.04)},transparent)`,
  };

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
    ...fieldTokens,
    ...interactiveState,
    ...overlayTokens,
    ...focusInset,
    ...tableTokens,
    ...motionSemantic,
    ...motion,
    ...radius,
    ...checkbox,
    ...border,
    ...density,
    ...Z_INDEX,
    ...gradients,
    ...charts,
    ...chartUI,
    ...glassBlur,
    ...scrollbar,
    ...skeleton,
    ...TYPOGRAPHY,
    ...typographySemantic,
    ...SPACING,
    ...layoutTokens,
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

/**
 * Get the radius token values for a given shape preset.
 * @param {string} shape - 'sharp', 'rounded', or 'pill'
 * @returns {{ '--d-radius-sm': string, '--d-radius': string, '--d-radius-lg': string, '--d-checkbox-radius': string }|null}
 */
export function getShapeTokens(shape) {
  const r = RADIUS[shape];
  if (!r) return null;
  return {
    '--d-radius-sm': r.sm,
    '--d-radius': r.default,
    '--d-radius-lg': r.lg,
    '--d-radius-panel': r.panel,
    '--d-radius-inner': r.inner,
    '--d-checkbox-radius': r.sm,
  };
}
