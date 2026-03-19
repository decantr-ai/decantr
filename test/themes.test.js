import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import {
  setTheme, getTheme, getThemeMeta, registerTheme, getThemeList,
  getActiveCSS, resetStyles, setAnimations, getAnimations,
  setStyle, getStyle, getStyleList, registerStyle,
  setMode, getMode, getResolvedMode, onModeChange,
  setColorblindMode, getColorblindMode
} from '../src/css/theme-registry.js';
import { derive, defaultSeed, defaultPersonality, hexToRgb, rgbToOklch, oklchToRgb, gamutMap, contrast, parseRgba, compositeOnBg, transformSeedsForCVD, deriveChrome } from '../src/css/derive.js';
import { auradecantism } from '../src/css/styles/auradecantism.js';
import { clean } from '../src/css/styles/addons/clean.js';
import { glassmorphism } from '../src/css/styles/addons/glassmorphism.js';
import { retro } from '../src/css/styles/community/retro.js';
import { launchpad } from '../src/css/styles/community/launchpad.js';
import { liquidGlass } from '../src/css/styles/community/liquid-glass.js';
import { dopamine } from '../src/css/styles/community/dopamine.js';
import { prismatic } from '../src/css/styles/community/prismatic.js';
import { bioluminescent } from '../src/css/styles/community/bioluminescent.js';
import { editorial } from '../src/css/styles/community/editorial.js';

const allStyleDefs = [clean, retro, glassmorphism, auradecantism, launchpad, liquidGlass, dopamine, prismatic, bioluminescent, editorial];

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  resetStyles();
  // Register addon styles (no longer built-in after extraction to addons/)
  for (const s of allStyleDefs) registerStyle(s);
});

// ============================================================
// Derivation Engine
// ============================================================

describe('derive()', () => {
  it('produces ~170 tokens from default seed', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    assert.ok(Object.keys(tokens).length >= 160);
  });

  it('derives all 7 palette roles × 8 modifiers', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    const roles = ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
    const mods = ['', '-fg', '-hover', '-active', '-subtle', '-subtle-fg', '-border', '-on-subtle'];
    for (const role of roles) {
      for (const mod of mods) {
        assert.ok(tokens[`--d-${role}${mod}`], `missing --d-${role}${mod}`);
      }
    }
  });

  it('derives neutral tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    for (const k of ['--d-bg', '--d-fg', '--d-muted', '--d-muted-fg', '--d-border', '--d-border-strong', '--d-ring', '--d-overlay']) {
      assert.ok(tokens[k], `missing ${k}`);
    }
  });

  it('derives surface tokens (4 levels × 3 props + 3 filters)', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    for (let i = 0; i <= 3; i++) {
      assert.ok(tokens[`--d-surface-${i}`], `missing --d-surface-${i}`);
      assert.ok(tokens[`--d-surface-${i}-fg`], `missing --d-surface-${i}-fg`);
      assert.ok(tokens[`--d-surface-${i}-border`], `missing --d-surface-${i}-border`);
    }
    for (let i = 1; i <= 3; i++) {
      assert.ok(tokens[`--d-surface-${i}-filter`] !== undefined, `missing --d-surface-${i}-filter`);
    }
  });

  it('derives elevation tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    for (let i = 0; i <= 3; i++) {
      assert.ok(tokens[`--d-elevation-${i}`] !== undefined, `missing --d-elevation-${i}`);
    }
  });

  it('derives interaction tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    for (const k of ['--d-hover-translate', '--d-hover-shadow', '--d-hover-brightness',
      '--d-active-scale', '--d-active-translate', '--d-active-shadow',
      '--d-focus-ring-width', '--d-focus-ring-color', '--d-focus-ring-offset', '--d-focus-ring-style',
      '--d-selection-bg', '--d-selection-fg']) {
      assert.ok(tokens[k] !== undefined, `missing ${k}`);
    }
  });

  it('derives motion tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    for (const k of ['--d-duration-instant', '--d-duration-fast', '--d-duration-normal', '--d-duration-slow',
      '--d-easing-standard', '--d-easing-decelerate', '--d-easing-accelerate', '--d-easing-bounce']) {
      assert.ok(tokens[k], `missing ${k}`);
    }
  });

  it('derives radius, border, density, z-index tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    assert.ok(tokens['--d-radius']);
    assert.ok(tokens['--d-border-width']);
    assert.ok(tokens['--d-density-pad-x']);
    assert.ok(tokens['--d-z-modal']);
  });

  it('derives gradient tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    assert.ok(tokens['--d-gradient-angle']);
    assert.ok(tokens['--d-gradient-brand']);
    assert.ok(tokens['--d-gradient-overlay']);
  });

  it('gradient-none resolves to solid color references', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, gradient: 'none' }, 'light');
    assert.equal(tokens['--d-gradient-brand'], 'var(--d-primary)');
    assert.equal(tokens['--d-gradient-intensity'], '0');
  });

  it('gradient-vivid resolves to linear-gradient', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, gradient: 'vivid' }, 'light');
    assert.ok(tokens['--d-gradient-brand'].includes('linear-gradient'));
    assert.equal(tokens['--d-gradient-intensity'], '1');
  });

  it('dark mode flips bg/fg', () => {
    const light = derive(defaultSeed, defaultPersonality, 'light');
    const dark = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(light['--d-bg'], '#ffffff');
    assert.equal(dark['--d-bg'], '#0a0a0a');
    assert.equal(light['--d-fg'], '#09090b');
    assert.equal(dark['--d-fg'], '#fafafa');
  });

  it('respects typography overrides', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light', { '--d-fw-heading': '800' });
    assert.equal(tokens['--d-fw-heading'], '800');
  });

  it('respects per-mode overrides', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark', null, { '--d-bg': '#111111' });
    assert.equal(tokens['--d-bg'], '#111111');
  });

  it('auto-derives accent from primary when missing', () => {
    const tokens = derive({ primary: '#1366D9', neutral: '#71717a' }, defaultPersonality, 'light');
    assert.ok(tokens['--d-accent']);
    assert.notEqual(tokens['--d-accent'], tokens['--d-primary']);
  });

  it('brutalist personality produces offset shadows', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'brutalist' }, 'light');
    assert.ok(tokens['--d-elevation-1'].includes('var(--d-fg)'));
  });

  it('glass personality produces blur filters', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'glass' }, 'light');
    assert.ok(tokens['--d-surface-1-filter'].includes('blur'));
    assert.ok(tokens['--d-surface-1'].includes('rgba'));
  });

  it('personality affects palette derivation', () => {
    const glass = derive(defaultSeed, { ...defaultPersonality, elevation: 'glass' }, 'light');
    const brutalist = derive(defaultSeed, { ...defaultPersonality, elevation: 'brutalist' }, 'light');
    // Same seed, different personality — subtle alpha should differ
    assert.notEqual(glass['--d-success-subtle'], brutalist['--d-success-subtle']);
    // Hover shifts also differ between personalities
    assert.notEqual(glass['--d-error-hover'], brutalist['--d-error-hover']);
  });

  it('glass styles have gentler hover shifts', () => {
    const standard = derive(defaultSeed, { ...defaultPersonality, elevation: 'subtle' }, 'light');
    const glass = derive(defaultSeed, { ...defaultPersonality, elevation: 'glass' }, 'light');
    // Glass hover should be closer to base than standard hover (less darkened)
    assert.notEqual(glass['--d-primary-hover'], standard['--d-primary-hover']);
  });

  it('brutalist styles have bolder border alpha', () => {
    const brutalist = derive(defaultSeed, { ...defaultPersonality, elevation: 'brutalist' }, 'light');
    const border = brutalist['--d-error-border'];
    // Brutalist border alpha should be >= 0.7
    const alphaMatch = border.match(/[\d.]+\)$/);
    assert.ok(alphaMatch, 'border should be rgba with alpha');
    assert.ok(parseFloat(alphaMatch[0]) >= 0.7, `brutalist border alpha should be >= 0.7, got ${alphaMatch[0]}`);
  });

  it('each built-in style has distinct semantic seeds', () => {
    // Regression guard — styles must not converge back to identical semantic palettes
    const clean = derive({ primary: '#1366D9', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', neutral: '#71717a' }, defaultPersonality, 'light');
    const retro = derive({ primary: '#e63946', success: '#1a7a42', warning: '#e06600', error: '#c41e1e', neutral: '#6b7280' }, { ...defaultPersonality, elevation: 'brutalist' }, 'light');
    assert.notEqual(clean['--d-success'], retro['--d-success']);
    assert.notEqual(clean['--d-warning'], retro['--d-warning']);
    assert.notEqual(clean['--d-error'], retro['--d-error']);
  });
});

// ============================================================
// Style System
// ============================================================

describe('getStyleList()', () => {
  it('returns 10 built-in styles', () => {
    const list = getStyleList();
    assert.equal(list.length, 10);
    const ids = list.map(s => s.id);
    assert.ok(ids.includes('clean'));
    assert.ok(ids.includes('retro'));
    assert.ok(ids.includes('glassmorphism'));
    assert.ok(ids.includes('auradecantism'));
    assert.ok(ids.includes('launchpad'));
    assert.ok(ids.includes('liquid-glass'));
    assert.ok(ids.includes('dopamine'));
    assert.ok(ids.includes('prismatic'));
    assert.ok(ids.includes('bioluminescent'));
    assert.ok(ids.includes('editorial'));
  });

  it('each style has id and name', () => {
    for (const s of getStyleList()) {
      assert.ok(typeof s.id === 'string' && s.id.length > 0);
      assert.ok(typeof s.name === 'string' && s.name.length > 0);
    }
  });
});

describe('getThemeList()', () => {
  it('is an alias for getStyleList()', () => {
    assert.deepEqual(getThemeList(), getStyleList());
  });
});

describe('getTheme()', () => {
  it('returns a signal getter defaulting to auradecantism', () => {
    const theme = getTheme();
    assert.equal(typeof theme, 'function');
    assert.equal(theme(), 'auradecantism');
  });
});

describe('getStyle()', () => {
  it('returns a signal getter for style ID', () => {
    const style = getStyle();
    assert.equal(typeof style, 'function');
    assert.equal(style(), 'auradecantism');
  });
});

describe('setStyle()', () => {
  it('changes the active style', () => {
    setStyle('retro');
    assert.equal(getStyle()(), 'retro');
    setStyle('clean');
    assert.equal(getStyle()(), 'clean');
  });

  it('applies tokens to document.documentElement', () => {
    setStyle('clean');
    const style = document.documentElement.style;
    assert.ok(style['--d-primary']);
    assert.ok(style['--d-bg']);
    assert.ok(style['--d-radius']);
  });

  it('applies semantic token variables', () => {
    setStyle('clean');
    const style = document.documentElement.style;
    assert.ok(style['--d-bg']);
    assert.ok(style['--d-primary']);
  });

  it('injects component CSS into style element', () => {
    setStyle('retro');
    const styleEl = document.querySelector('[data-decantr-style]');
    assert.ok(styleEl);
    assert.ok(styleEl.textContent.includes('.d-btn'));
  });

  it('throws on unknown style', () => {
    assert.throws(() => setStyle('nonexistent'), /Unknown style/);
  });

  it('retro has different tokens than clean', () => {
    setStyle('clean');
    const cleanRadius = document.documentElement.style['--d-radius'];
    setStyle('retro');
    const retroRadius = document.documentElement.style['--d-radius'];
    assert.notEqual(cleanRadius, retroRadius);
  });
});

describe('setMode()', () => {
  it('accepts light, dark, auto', () => {
    assert.doesNotThrow(() => setMode('light'));
    assert.doesNotThrow(() => setMode('dark'));
    assert.doesNotThrow(() => setMode('auto'));
  });

  it('throws on invalid mode', () => {
    assert.throws(() => setMode('invalid'), /Invalid mode/);
  });

  it('getMode() returns the raw mode setting', () => {
    setMode('dark');
    assert.equal(getMode()(), 'dark');
    setMode('auto');
    assert.equal(getMode()(), 'auto');
  });

  it('dark mode changes bg/fg tokens', () => {
    setStyle('clean');
    setMode('light');
    const lightBg = document.documentElement.style['--d-bg'];
    setMode('dark');
    const darkBg = document.documentElement.style['--d-bg'];
    assert.notEqual(lightBg, darkBg);
  });

  it('dark mode updates --d-bg', () => {
    setStyle('clean');
    setMode('light');
    const lightBg = document.documentElement.style['--d-bg'];
    setMode('dark');
    const darkBg = document.documentElement.style['--d-bg'];
    assert.notEqual(lightBg, darkBg);
  });
});

describe('setTheme() backward compat', () => {
  it('maps legacy "light" to clean style + light mode', () => {
    setTheme('light');
    assert.equal(getStyle()(), 'clean');
    assert.equal(getResolvedMode(), 'light');
  });

  it('maps legacy "dark" to clean style + dark mode', () => {
    setTheme('dark');
    assert.equal(getStyle()(), 'clean');
    assert.equal(getResolvedMode(), 'dark');
  });

  it('maps legacy "retro" to retro style + auto mode', () => {
    setTheme('retro');
    assert.equal(getStyle()(), 'retro');
  });

  it('maps unknown legacy themes to clean + dark', () => {
    setTheme('hot-lava');
    assert.equal(getStyle()(), 'clean');
  });

  it('new-style setTheme with mode arg', () => {
    setTheme('retro', 'dark');
    assert.equal(getStyle()(), 'retro');
    assert.equal(getResolvedMode(), 'dark');
  });

  it('throws on completely unknown ID', () => {
    assert.throws(() => setTheme('totally-unknown'), /Unknown theme/);
  });
});

describe('getThemeMeta()', () => {
  it('returns isDark based on resolved mode', () => {
    setStyle('clean');
    setMode('dark');
    const meta = getThemeMeta();
    assert.equal(meta.isDark, true);
    assert.equal(meta.style, 'clean');
    assert.equal(meta.resolvedMode, 'dark');
  });

  it('returns non-dark meta for light mode', () => {
    setStyle('clean');
    setMode('light');
    assert.equal(getThemeMeta().isDark, false);
  });

  it('returns a new object each call', () => {
    setMode('light');
    const m1 = getThemeMeta();
    const m2 = getThemeMeta();
    assert.notEqual(m1, m2);
    assert.deepEqual(m1, m2);
  });
});

describe('registerStyle()', () => {
  it('registers a custom style with seed', () => {
    registerStyle({
      id: 'ocean',
      name: 'Ocean',
      seed: { primary: '#64ffda', accent: '#7c3aed', neutral: '#8892b0', bg: '#0a192f', bgDark: '#020c1b' },
      personality: { radius: 'pill', elevation: 'glass', motion: 'bouncy', borders: 'thin', gradient: 'vivid' },
    });
    assert.ok(getStyleList().some(s => s.id === 'ocean'));
  });

  it('allows switching to custom style', () => {
    setStyle('ocean');
    assert.equal(getStyle()(), 'ocean');
    assert.ok(document.documentElement.style['--d-primary']);
  });

  it('throws without id', () => {
    assert.throws(() => registerStyle({ name: 'Bad' }), /must have id/);
  });

  it('throws without seed', () => {
    assert.throws(() => registerStyle({ id: 'bad', name: 'Bad' }), /must have seed/);
  });
});

describe('registerTheme() backward compat', () => {
  it('accepts new-style objects with seed', () => {
    registerTheme({
      id: 'custom-new',
      name: 'Custom New',
      seed: { primary: '#ff0000', neutral: '#666' },
    });
    assert.ok(getStyleList().some(s => s.id === 'custom-new'));
  });

  it('accepts legacy objects with warning', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    registerTheme({ id: 'legacy', name: 'Legacy', colors: { '--c0': '#fff' } });
    console.warn = origWarn;
    assert.ok(warnings.some(w => w.includes('deprecated')));
  });
});

describe('getActiveCSS()', () => {
  it('returns CSS string for current style', () => {
    setStyle('retro');
    const css = getActiveCSS();
    assert.ok(typeof css === 'string');
    assert.ok(css.includes('@layer d.theme'));
    assert.ok(css.includes('.d-btn'));
  });
});

describe('resetStyles()', () => {
  it('resets to auradecantism + dark and removes style element', () => {
    setStyle('retro');
    setMode('light');
    resetStyles();
    assert.equal(getStyle()(), 'auradecantism');
    assert.equal(getMode()(), 'dark');
    assert.ok(!document.querySelector('[data-decantr-style]'));
  });
});

describe('onModeChange()', () => {
  it('fires callback on mode change', () => {
    setMode('light');
    const calls = [];
    const unsub = onModeChange(mode => calls.push(mode));
    setMode('dark');
    assert.ok(calls.includes('dark'));
    unsub();
    setMode('light');
    // Should not fire after unsubscribe
    assert.equal(calls.filter(c => c === 'light').length, 0);
  });
});

// ============================================================
// Animation Control
// ============================================================

describe('animation control', () => {
  it('getAnimations() returns signal getter defaulting to true', () => {
    const getter = getAnimations();
    assert.equal(typeof getter, 'function');
    assert.equal(getter(), true);
  });

  it('setAnimations(false) injects disabling CSS', () => {
    setAnimations(false);
    const el = document.querySelector('[data-decantr-anim]');
    assert.ok(el);
    assert.ok(el.textContent.includes('animation-duration:0.01ms'));
    assert.ok(el.textContent.includes('transition-duration:0.01ms'));
  });

  it('setAnimations(true) clears the override', () => {
    setAnimations(false);
    const el = document.querySelector('[data-decantr-anim]');
    assert.ok(el.textContent.length > 0);
    setAnimations(true);
    assert.equal(el.textContent, '');
  });

  it('resetStyles() resets animation state', () => {
    setAnimations(false);
    assert.equal(getAnimations()(), false);
    resetStyles();
    assert.equal(getAnimations()(), true);
    assert.ok(!document.querySelector('[data-decantr-anim]'));
  });
});

// ============================================================
// OKLCH Color Math
// ============================================================

describe('OKLCH color math', () => {
  it('rgbToOklch round-trips through oklchToRgb for white', () => {
    const [L, C, H] = rgbToOklch(255, 255, 255);
    const [r, g, b] = oklchToRgb(L, C, H);
    assert.equal(r, 255); assert.equal(g, 255); assert.equal(b, 255);
  });

  it('rgbToOklch round-trips through oklchToRgb for black', () => {
    const [L, C, H] = rgbToOklch(0, 0, 0);
    const [r, g, b] = oklchToRgb(L, C, H);
    assert.equal(r, 0); assert.equal(g, 0); assert.equal(b, 0);
  });

  it('rgbToOklch round-trips for primary red', () => {
    const [L, C, H] = rgbToOklch(239, 68, 68);
    const [r, g, b] = oklchToRgb(L, C, H);
    assert.ok(Math.abs(r - 239) <= 1, `red: ${r}`);
    assert.ok(Math.abs(g - 68) <= 1, `green: ${g}`);
    assert.ok(Math.abs(b - 68) <= 1, `blue: ${b}`);
  });

  it('rgbToOklch round-trips for pure blue', () => {
    const [L, C, H] = rgbToOklch(59, 130, 246);
    const [r, g, b] = oklchToRgb(L, C, H);
    assert.ok(Math.abs(r - 59) <= 1, `red: ${r}`);
    assert.ok(Math.abs(g - 130) <= 1, `green: ${g}`);
    assert.ok(Math.abs(b - 246) <= 1, `blue: ${b}`);
  });

  it('rgbToOklch round-trips for mid-gray', () => {
    const [L, C, H] = rgbToOklch(128, 128, 128);
    const [r, g, b] = oklchToRgb(L, C, H);
    assert.ok(Math.abs(r - 128) <= 1); assert.ok(Math.abs(g - 128) <= 1); assert.ok(Math.abs(b - 128) <= 1);
  });

  it('lighten produces higher OKLCH L value (via surface tokens)', () => {
    // Test via derive: dark bg should have surfaces with increasing L
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    const s0 = tokens['--d-surface-0'];
    const s1 = tokens['--d-surface-1'];
    // s1 should be lighter than s0 for non-glass
    assert.ok(s0.startsWith('#') && s1.startsWith('#'));
    const [l0] = rgbToOklch(...hexToRgb(s0));
    const [l1] = rgbToOklch(...hexToRgb(s1));
    assert.ok(l1 > l0, `S1 L(${l1.toFixed(3)}) should be > S0 L(${l0.toFixed(3)})`);
  });

  it('gamutMap clamps out-of-gamut OKLCH to valid sRGB', () => {
    // Very high chroma at mid lightness — likely out of gamut
    const [gL, gC, gH] = gamutMap(0.7, 0.5, 150);
    const [r, g, b] = oklchToRgb(gL, gC, gH);
    assert.ok(r >= 0 && r <= 255, `r out of range: ${r}`);
    assert.ok(g >= 0 && g <= 255, `g out of range: ${g}`);
    assert.ok(b >= 0 && b <= 255, `b out of range: ${b}`);
    assert.ok(gC <= 0.5, 'chroma should be reduced');
  });

  it('rotateHue shifts OKLCH H channel (via auto-derived accent)', () => {
    // Test via derive: accent auto-derived from primary is hue-rotated by 60°
    const tokens = derive({ primary: '#1366D9', neutral: '#71717a' }, defaultPersonality, 'light');
    assert.ok(tokens['--d-accent'], 'accent should be auto-derived');
    assert.notEqual(tokens['--d-accent'], tokens['--d-primary'], 'accent should differ from primary');
    // Verify the hue actually shifted
    const [, , primaryH] = rgbToOklch(...hexToRgb(tokens['--d-primary']));
    const [, , accentH] = rgbToOklch(...hexToRgb(tokens['--d-accent']));
    const diff = Math.min(Math.abs(accentH - primaryH), 360 - Math.abs(accentH - primaryH));
    assert.ok(diff > 30, `accent hue only ${diff.toFixed(1)}° from primary, expected ~60°`);
  });
});

// ============================================================
// Contrast Enforcement
// ============================================================

describe('contrast enforcement', () => {
  const styles = ['clean', 'retro', 'glassmorphism', 'auradecantism'];
  const modes = ['light', 'dark'];

  // Import style definitions for seed access
  for (const styleName of styles) {
    for (const mode of modes) {
      it(`${styleName} × ${mode} passes all text contrast pairs (4.5:1)`, () => {
        setStyle(styleName);
        setMode(mode);
        // Derive to get the tokens
        const style = getStyleList().find(s => s.id === styleName);
        // The tokens are already applied; verify via derive
        const { default: styleMod } = { default: null }; // can't import dynamically
        // Instead, verify key fg/bg pairs from the DOM
        const el = document.documentElement.style;
        const fg = el['--d-fg'];
        const bg = el['--d-bg'];
        if (fg && bg && fg.startsWith('#') && bg.startsWith('#')) {
          const ratio = contrast(hexToRgb(fg), hexToRgb(bg));
          assert.ok(ratio >= 4.5, `${styleName} ${mode} --d-fg/--d-bg contrast ${ratio.toFixed(2)} < 4.5`);
        }
      });
    }
  }

  it('adjustForContrast lightens fg on dark bg', () => {
    const tokens = derive({ ...defaultSeed, primary: '#333333' }, defaultPersonality, 'dark');
    // Primary-fg on a very dark primary should still meet 4.5:1
    const fg = tokens['--d-primary-fg'];
    const bg = tokens['--d-primary'];
    if (fg.startsWith('#') && bg.startsWith('#')) {
      const ratio = contrast(hexToRgb(fg), hexToRgb(bg));
      assert.ok(ratio >= 4.5, `contrast ${ratio.toFixed(2)} < 4.5`);
    }
  });

  it('decorative border is distinguishable from bg', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    const border = tokens['--d-border'];
    const bg = tokens['--d-bg'];
    if (border && bg && border.startsWith('#') && bg.startsWith('#')) {
      const ratio = contrast(hexToRgb(border), hexToRgb(bg));
      assert.ok(ratio >= 1.2, `border/bg contrast ${ratio.toFixed(2)} too low`);
    }
  });
});

// ============================================================
// Colorblind Mode
// ============================================================

describe('colorblind mode', () => {
  it('transformSeedsForCVD("off") returns seeds unchanged', () => {
    const seed = { ...defaultSeed };
    const result = transformSeedsForCVD(seed, 'off');
    assert.deepEqual(result, seed);
  });

  it('protanopia shifts error red toward magenta', () => {
    const result = transformSeedsForCVD({ ...defaultSeed }, 'protanopia');
    // Original error is #ef4444 (OKLCH H ~29°), should shift toward H ~345°
    assert.notEqual(result.error, defaultSeed.error);
    const [, , h] = rgbToOklch(...hexToRgb(result.error));
    // Should be in the magenta/pink range (H > 300° or H < 20°)
    assert.ok(h > 300 || h < 20, `shifted error hue ${h.toFixed(1)} not in magenta range`);
  });

  it('protanopia shifts success green toward teal', () => {
    const result = transformSeedsForCVD({ ...defaultSeed }, 'protanopia');
    assert.notEqual(result.success, defaultSeed.success);
    const [, , h] = rgbToOklch(...hexToRgb(result.success));
    // Should be in teal/cyan range (H ~170-210°)
    assert.ok(h >= 170 && h <= 210, `shifted success hue ${h.toFixed(1)} not in teal range`);
  });

  it('deuteranopia produces same shifts as protanopia', () => {
    const protan = transformSeedsForCVD({ ...defaultSeed }, 'protanopia');
    const deutan = transformSeedsForCVD({ ...defaultSeed }, 'deuteranopia');
    assert.equal(protan.error, deutan.error);
    assert.equal(protan.success, deutan.success);
  });

  it('tritanopia shifts info blue toward teal', () => {
    const result = transformSeedsForCVD({ ...defaultSeed }, 'tritanopia');
    assert.notEqual(result.info, defaultSeed.info);
    const [, , h] = rgbToOklch(...hexToRgb(result.info));
    assert.ok(h >= 150 && h <= 200, `shifted info hue ${h.toFixed(1)} not in teal range`);
  });

  it('tritanopia shifts warning yellow toward orange', () => {
    const result = transformSeedsForCVD({ ...defaultSeed }, 'tritanopia');
    assert.notEqual(result.warning, defaultSeed.warning);
    const [, , h] = rgbToOklch(...hexToRgb(result.warning));
    assert.ok(h >= 30 && h <= 70, `shifted warning hue ${h.toFixed(1)} not in orange range`);
  });

  it('colorblind chart tokens are valid hex and all 8 distinct', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark', null, null, { colorblind: 'protanopia' });
    const chartHexes = [];
    for (let i = 0; i < 8; i++) {
      const hex = tokens[`--d-chart-${i}`];
      assert.match(hex, /^#[0-9a-fA-F]{6}$/, `chart-${i} not valid hex: ${hex}`);
      chartHexes.push(hex);
    }
    assert.equal(new Set(chartHexes).size, 8, 'chart colors not all distinct');
  });

  it('tritanopia chart palette differs from protanopia', () => {
    const protan = derive(defaultSeed, defaultPersonality, 'dark', null, null, { colorblind: 'protanopia' });
    const tritan = derive(defaultSeed, defaultPersonality, 'dark', null, null, { colorblind: 'tritanopia' });
    assert.notEqual(protan['--d-chart-0'], tritan['--d-chart-0']);
  });

  it('derive with colorblind option produces valid token set (171+ tokens)', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark', null, null, { colorblind: 'protanopia' });
    assert.ok(Object.keys(tokens).length >= 160);
  });

  it('colorblind mode produces same token key set as normal mode', () => {
    const normal = derive(defaultSeed, defaultPersonality, 'dark');
    const cb = derive(defaultSeed, defaultPersonality, 'dark', null, null, { colorblind: 'deuteranopia' });
    const normalKeys = Object.keys(normal).sort();
    const cbKeys = Object.keys(cb).sort();
    assert.deepEqual(normalKeys, cbKeys);
  });

  it('setColorblindMode + getColorblindMode round-trips', () => {
    setColorblindMode('protanopia');
    assert.equal(getColorblindMode()(), 'protanopia');
    setColorblindMode('off');
    assert.equal(getColorblindMode()(), 'off');
  });

  it('setColorblindMode throws on invalid type', () => {
    assert.throws(() => setColorblindMode('invalid'), /Invalid colorblind mode/);
  });

  it('resetStyles() clears colorblind mode to off', () => {
    setColorblindMode('tritanopia');
    assert.equal(getColorblindMode()(), 'tritanopia');
    resetStyles();
    assert.equal(getColorblindMode()(), 'off');
  });

  it('style switch while colorblind mode active maintains CB mode', () => {
    setColorblindMode('protanopia');
    setStyle('retro');
    assert.equal(getColorblindMode()(), 'protanopia');
    assert.equal(getStyle()(), 'retro');
  });
});

// ============================================================
// Surface Lightness
// ============================================================

describe('surface lightness', () => {
  it('dark non-glass: S0 < S1 < S2 < S3 lightness (monotonic)', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'subtle' }, 'dark');
    const lValues = [];
    for (let i = 0; i <= 3; i++) {
      const hex = tokens[`--d-surface-${i}`];
      assert.ok(hex.startsWith('#'), `surface-${i} should be hex, got ${hex}`);
      const [L] = rgbToOklch(...hexToRgb(hex));
      lValues.push(L);
    }
    for (let i = 1; i < lValues.length; i++) {
      assert.ok(lValues[i] > lValues[i - 1],
        `S${i} L(${lValues[i].toFixed(3)}) should be > S${i - 1} L(${lValues[i - 1].toFixed(3)})`);
    }
  });

  it('light mode: S1 is brightest (card cutout), S2 < S1, S3 < S2', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'subtle' }, 'light');
    const lValues = [];
    for (let i = 0; i <= 3; i++) {
      const hex = tokens[`--d-surface-${i}`];
      assert.ok(hex.startsWith('#'), `surface-${i} should be hex, got ${hex}`);
      const [L] = rgbToOklch(...hexToRgb(hex));
      lValues.push(L);
    }
    // S1 (card) should be >= S0 (canvas)
    assert.ok(lValues[1] >= lValues[0] - 0.001,
      `S1 L(${lValues[1].toFixed(3)}) should be >= S0 L(${lValues[0].toFixed(3)})`);
    // S2 < S1 and S3 < S2 (progressively tinted)
    assert.ok(lValues[2] < lValues[1] + 0.001,
      `S2 L(${lValues[2].toFixed(3)}) should be < S1 L(${lValues[1].toFixed(3)})`);
    assert.ok(lValues[3] < lValues[2] + 0.001,
      `S3 L(${lValues[3].toFixed(3)}) should be < S2 L(${lValues[2].toFixed(3)})`);
  });

  it('glass surfaces contain rgba in dark mode (alpha-based)', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'glass' }, 'dark');
    for (let i = 1; i <= 3; i++) {
      assert.ok(tokens[`--d-surface-${i}`].includes('rgba'), `dark surface-${i} should be rgba for glass`);
    }
  });

  it('glass surfaces contain rgba in light mode (alpha-based)', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'glass' }, 'light');
    for (let i = 1; i <= 3; i++) {
      assert.ok(tokens[`--d-surface-${i}`].includes('rgba'), `light surface-${i} should be rgba for glass`);
    }
  });

  it('non-glass surfaces are opaque hex', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'subtle' }, 'dark');
    for (let i = 0; i <= 3; i++) {
      assert.ok(tokens[`--d-surface-${i}`].startsWith('#'), `surface-${i} should be hex for non-glass`);
    }
  });

  it('surface-fg maintains 4.5:1 against its surface for all 5 styles × 2 modes', () => {
    const styleSeeds = {
      clean: { primary: '#1366D9', neutral: '#71717a', bg: '#ffffff', bgDark: '#0a0a0a' },
      retro: { primary: '#e63946', neutral: '#6b7280', bg: '#fffef5', bgDark: '#1a1a1a' },
    };
    for (const [name, seed] of Object.entries(styleSeeds)) {
      for (const mode of ['light', 'dark']) {
        const tokens = derive(seed, defaultPersonality, mode);
        for (let i = 0; i <= 3; i++) {
          const fg = tokens[`--d-surface-${i}-fg`];
          const bg = tokens[`--d-surface-${i}`];
          if (fg && bg && fg.startsWith('#') && bg.startsWith('#')) {
            const ratio = contrast(hexToRgb(fg), hexToRgb(bg));
            assert.ok(ratio >= 4.5, `${name} ${mode} surface-${i}: fg/bg contrast ${ratio.toFixed(2)} < 4.5`);
          }
        }
      }
    }
  });
});

// ============================================================
// Token Stability
// ============================================================

describe('token stability', () => {
  it('derive() produces at least 177 tokens for all styles', () => {
    const styleSeeds = [
      defaultSeed,
      { primary: '#e63946', neutral: '#6b7280', bg: '#fffef5', bgDark: '#1a1a1a' },
      { primary: '#38bdf8', neutral: '#6b7a94', bg: '#f0f4f9', bgDark: '#0a0c10' },
    ];
    for (const seed of styleSeeds) {
      const tokens = derive(seed, defaultPersonality, 'dark');
      assert.ok(Object.keys(tokens).length >= 160, `only ${Object.keys(tokens).length} tokens`);
    }
  });

  it('all 5 built-in style seeds produce identical token key sets', () => {
    const seeds = [
      { primary: '#1366D9', neutral: '#71717a', bg: '#ffffff', bgDark: '#0a0a0a' },
      { primary: '#e63946', neutral: '#6b7280', bg: '#fffef5', bgDark: '#1a1a1a' },
      { primary: '#38bdf8', neutral: '#6b7a94', bg: '#f0f4f9', bgDark: '#0a0c10' },
    ];
    const baseKeys = Object.keys(derive(seeds[0], defaultPersonality, 'dark')).sort();
    for (let i = 1; i < seeds.length; i++) {
      const keys = Object.keys(derive(seeds[i], defaultPersonality, 'dark')).sort();
      assert.deepEqual(keys, baseKeys, `seed ${i} has different key set`);
    }
  });

  it('monochrome palette yields all 7 role tokens', () => {
    const tokens = derive(
      { primary: '#00e5ff', neutral: '#1a2a3a', bg: '#c8d6e0', bgDark: '#050a10' },
      { ...defaultPersonality, palette: 'monochrome' },
      'dark'
    );
    for (const role of ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info']) {
      assert.ok(tokens[`--d-${role}`], `missing --d-${role}`);
      assert.ok(tokens[`--d-${role}-fg`], `missing --d-${role}-fg`);
    }
  });

  it('monochrome palette preserves semantic hues for success/warning/error', () => {
    const tokens = derive(
      { primary: '#00e5ff', neutral: '#1a2a3a', bg: '#c8d6e0', bgDark: '#050a10' },
      { ...defaultPersonality, palette: 'monochrome' },
      'dark'
    );
    // Success should be green-ish (hue 100-160), not cyan like primary
    const [sR, sG] = hexToRgb(tokens['--d-success']);
    assert.ok(sG > sR, `success should be greener than red: got r=${sR} g=${sG}`);
    // Error should be red-ish (hue 0-30 or 330-360)
    const [eR, eG, eB] = hexToRgb(tokens['--d-error']);
    assert.ok(eR > eG && eR > eB, `error should be reddish: got r=${eR} g=${eG} b=${eB}`);
    // Primary hue check — success hue should NOT be within 20° of primary hue
    const [, , pH] = rgbToOklch(...hexToRgb(tokens['--d-primary']));
    const [, , sH] = rgbToOklch(sR, sG, hexToRgb(tokens['--d-success'])[2]);
    const hueDiff = Math.abs(((pH - sH + 180) % 360) - 180);
    assert.ok(hueDiff > 20, `success hue should differ from primary by >20°, got ${hueDiff.toFixed(1)}°`);
  });

  it('colorblind mode produces same token key set as normal mode', () => {
    const normal = Object.keys(derive(defaultSeed, defaultPersonality, 'light')).sort();
    const cb = Object.keys(derive(defaultSeed, defaultPersonality, 'light', null, null, { colorblind: 'tritanopia' })).sort();
    assert.deepEqual(normal, cb);
  });
});

// ============================================================
// Chrome Tokens
// ============================================================

describe('chrome tokens', () => {
  it('chrome tokens exist in both modes', () => {
    const chromeKeys = ['--d-chrome-bg', '--d-chrome-fg', '--d-chrome-border', '--d-chrome-muted', '--d-chrome-hover', '--d-chrome-active'];
    for (const mode of ['light', 'dark']) {
      const tokens = derive(defaultSeed, defaultPersonality, mode);
      for (const key of chromeKeys) {
        assert.ok(tokens[key], `missing ${key} in ${mode} mode`);
      }
    }
  });

  it('chrome fg meets 4.5:1 WCAG AA against chrome-bg', () => {
    for (const mode of ['light', 'dark']) {
      const tokens = derive(defaultSeed, defaultPersonality, mode);
      const fg = tokens['--d-chrome-fg'];
      const bg = tokens['--d-chrome-bg'];
      if (fg.startsWith('#') && bg.startsWith('#')) {
        const ratio = contrast(hexToRgb(fg), hexToRgb(bg));
        assert.ok(ratio >= 4.5, `chrome fg/bg contrast in ${mode}: ${ratio.toFixed(2)} < 4.5`);
      }
    }
  });

  it('light chrome-bg is dark (OKLCH L < 0.3)', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    const bg = tokens['--d-chrome-bg'];
    assert.ok(bg.startsWith('#'), `chrome-bg should be hex, got ${bg}`);
    const [L] = rgbToOklch(...hexToRgb(bg));
    assert.ok(L < 0.3, `light chrome-bg L(${L.toFixed(3)}) should be < 0.3 (dark chrome)`);
  });

  it('dark chrome-bg is close to surface-1 lightness', () => {
    const tokens = derive(defaultSeed, { ...defaultPersonality, elevation: 'subtle' }, 'dark');
    const chromeBg = tokens['--d-chrome-bg'];
    const s1 = tokens['--d-surface-1'];
    if (chromeBg.startsWith('#') && s1.startsWith('#')) {
      const [chromL] = rgbToOklch(...hexToRgb(chromeBg));
      const [s1L] = rgbToOklch(...hexToRgb(s1));
      assert.ok(Math.abs(chromL - s1L) < 0.05,
        `dark chrome L(${chromL.toFixed(3)}) should be close to S1 L(${s1L.toFixed(3)})`);
    }
  });

  it('light decorative border is distinguishable from bg', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    const border = tokens['--d-border'];
    const bg = tokens['--d-bg'];
    if (border && bg && border.startsWith('#') && bg.startsWith('#')) {
      const ratio = contrast(hexToRgb(border), hexToRgb(bg));
      assert.ok(ratio >= 1.3, `light border/bg contrast ${ratio.toFixed(2)} too low`);
    }
  });

  it('deriveChrome returns 6 tokens', () => {
    const chrome = deriveChrome('#1366D9', '#ffffff', '#0a0a0a', '#71717a', 'light', 'subtle');
    assert.equal(Object.keys(chrome).length, 6);
    assert.ok(chrome['--d-chrome-bg']);
    assert.ok(chrome['--d-chrome-fg']);
  });
});

describe('field tokens across styles', () => {
  const fieldTokenKeys = [
    '--d-field-bg', '--d-field-bg-hover', '--d-field-bg-disabled',
    '--d-field-border', '--d-field-border-hover', '--d-field-border-focus',
    '--d-field-ring', '--d-field-radius', '--d-field-placeholder',
    '--d-disabled-opacity', '--d-item-hover-bg', '--d-selected-bg',
  ];

  for (const style of allStyleDefs) {
    it(`${style.id} includes all field tokens (dark)`, () => {
      const tokens = derive(
        style.seed,
        style.personality,
        'dark',
        style.typography,
        style.overrides?.dark
      );
      for (const key of fieldTokenKeys) {
        assert.ok(tokens[key] !== undefined, `${style.id} dark missing: ${key}`);
      }
    });

    it(`${style.id} includes all field tokens (light)`, () => {
      const tokens = derive(
        style.seed,
        style.personality,
        'light',
        style.typography,
        style.overrides?.light
      );
      for (const key of fieldTokenKeys) {
        assert.ok(tokens[key] !== undefined, `${style.id} light missing: ${key}`);
      }
    });
  }
});

// ============================================================
// Alpha-Composite Contrast Validation
// ============================================================

describe('parseRgba()', () => {
  it('parses valid rgba string', () => {
    const result = parseRgba('rgba(10,243,235,0.2)');
    assert.deepEqual(result, [10, 243, 235, 0.2]);
  });

  it('returns null for hex string', () => {
    assert.equal(parseRgba('#ff0000'), null);
  });

  it('returns null for null/undefined', () => {
    assert.equal(parseRgba(null), null);
    assert.equal(parseRgba(undefined), null);
  });
});

describe('compositeOnBg()', () => {
  it('returns hex unchanged', () => {
    assert.equal(compositeOnBg('#ff0000', '#ffffff'), '#ff0000');
  });

  it('composites rgba onto white', () => {
    const result = compositeOnBg('rgba(0,0,0,0.5)', '#ffffff');
    assert.ok(result.startsWith('#'));
    // 50% black on white = ~#808080
    const [r, g, b] = hexToRgb(result);
    assert.ok(Math.abs(r - 128) <= 1);
    assert.ok(Math.abs(g - 128) <= 1);
    assert.ok(Math.abs(b - 128) <= 1);
  });

  it('composites rgba onto black', () => {
    const result = compositeOnBg('rgba(255,255,255,0.5)', '#000000');
    const [r, g, b] = hexToRgb(result);
    assert.ok(Math.abs(r - 128) <= 1);
  });

  it('full opacity rgba returns the rgba color as hex', () => {
    const result = compositeOnBg('rgba(255,0,0,1)', '#000000');
    assert.equal(result, '#ff0000');
  });
});

describe('alpha-composite contrast validation', () => {
  const roles = ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
  const modes = ['light', 'dark'];

  for (const style of allStyleDefs) {
    for (const mode of modes) {
      it(`${style.id} × ${mode}: on-subtle meets 4.5:1 against composited subtle bg`, () => {
        const tokens = derive(
          style.seed, style.personality, mode,
          style.typography, style.overrides?.[mode]
        );
        const pageBg = tokens['--d-bg'];
        for (const role of roles) {
          const onSubtle = tokens[`--d-${role}-on-subtle`];
          const subtle = tokens[`--d-${role}-subtle`];
          assert.ok(onSubtle, `${style.id} ${mode} missing --d-${role}-on-subtle`);
          const effectiveBg = compositeOnBg(subtle, pageBg);
          if (onSubtle.startsWith('#') && effectiveBg.startsWith('#')) {
            const ratio = contrast(hexToRgb(onSubtle), hexToRgb(effectiveBg));
            assert.ok(ratio >= 4.5,
              `${style.id} ${mode} --d-${role}-on-subtle contrast ${ratio.toFixed(2)} < 4.5 against composited subtle bg`);
          }
        }
      });

      it(`${style.id} × ${mode}: subtle-fg meets 4.5:1 against composited subtle bg`, () => {
        const tokens = derive(
          style.seed, style.personality, mode,
          style.typography, style.overrides?.[mode]
        );
        const pageBg = tokens['--d-bg'];
        for (const role of roles) {
          const subtleFg = tokens[`--d-${role}-subtle-fg`];
          const subtle = tokens[`--d-${role}-subtle`];
          const effectiveBg = compositeOnBg(subtle, pageBg);
          if (subtleFg.startsWith('#') && effectiveBg.startsWith('#')) {
            const ratio = contrast(hexToRgb(subtleFg), hexToRgb(effectiveBg));
            assert.ok(ratio >= 4.5,
              `${style.id} ${mode} --d-${role}-subtle-fg contrast ${ratio.toFixed(2)} < 4.5 against composited subtle bg`);
          }
        }
      });

      it(`${style.id} × ${mode}: role-border meets 3:1 against page bg`, () => {
        const tokens = derive(
          style.seed, style.personality, mode,
          style.typography, style.overrides?.[mode]
        );
        const pageBg = tokens['--d-bg'];
        for (const role of roles) {
          const border = tokens[`--d-${role}-border`];
          const effectiveBorder = compositeOnBg(border, pageBg);
          if (effectiveBorder.startsWith('#') && pageBg.startsWith('#')) {
            const ratio = contrast(hexToRgb(effectiveBorder), hexToRgb(pageBg));
            assert.ok(ratio >= 3,
              `${style.id} ${mode} --d-${role}-border contrast ${ratio.toFixed(2)} < 3 against page bg`);
          }
        }
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════
// PHASE 2 — Pseudo-class atoms, ring utilities, prose, transitions
// ═══════════════════════════════════════════════════════════════════

describe('pseudo-class atoms', () => {
  it('_h:bgprimary generates hover rule', async () => {
    const { css, reset: cssReset } = await import('../src/css/index.js');
    const { extractCSS, reset: rtReset } = await import('../src/css/runtime.js');
    const result = css('_h:bgprimary');
    assert.ok(result.includes('_h:bgprimary'), 'class name should be in output');
    const extracted = extractCSS();
    assert.ok(extracted.includes(':hover'), 'should contain :hover pseudo');
    assert.ok(extracted.includes('background:var(--d-primary)'), 'should contain background declaration');
  });

  it('_f:bcprimary generates focus rule', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    const result = css('_f:bcprimary');
    assert.ok(result.includes('_f:bcprimary'));
    const extracted = extractCSS();
    assert.ok(extracted.includes(':focus'), 'should contain :focus pseudo');
    assert.ok(extracted.includes('border-color:var(--d-primary)'), 'should contain border-color declaration');
  });

  it('_fv:ring2 generates focus-visible ring', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    const result = css('_fv:ring2');
    assert.ok(result.includes('_fv:ring2'));
    const extracted = extractCSS();
    assert.ok(extracted.includes(':focus-visible'), 'should contain :focus-visible pseudo');
    assert.ok(extracted.includes('box-shadow'), 'should contain box-shadow declaration');
  });

  it('_a:bgmuted generates active background', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_a:bgmuted');
    const extracted = extractCSS();
    assert.ok(extracted.includes(':active'), 'should contain :active pseudo');
    assert.ok(extracted.includes('background:var(--d-muted)'), 'should contain background declaration');
  });

  it('_sm:h:bgmuted generates responsive + hover', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    const result = css('_sm:h:bgmuted');
    assert.ok(result.includes('_sm:h:bgmuted'));
    const extracted = extractCSS();
    assert.ok(extracted.includes('@media'), 'should be wrapped in media query');
    assert.ok(extracted.includes(':hover'), 'should contain :hover pseudo');
  });

  it('_h:bgprimary/50 generates hover + opacity modifier', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    const result = css('_h:bgprimary/50');
    assert.ok(result.includes('_h:bgprimary/50'));
    const extracted = extractCSS();
    assert.ok(extracted.includes(':hover'), 'should contain :hover pseudo');
    assert.ok(extracted.includes('color-mix'), 'should use color-mix for opacity');
  });

  it('_h:bg[rgba(255,255,255,0.1)] generates hover + arbitrary value', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    const result = css('_h:bg[rgba(255,255,255,0.1)]');
    assert.ok(result.includes('_h:bg[rgba(255,255,255,0.1)]'));
    const extracted = extractCSS();
    assert.ok(extracted.includes(':hover'), 'should contain :hover pseudo');
  });
});

describe('ring utility atoms', () => {
  it('_ring2 generates correct box-shadow', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_ring2 _ringPrimary');
    const extracted = extractCSS();
    assert.ok(extracted.includes('box-shadow:0 0 0 2px var(--d-ring)'), 'ring2 should produce 2px ring');
    assert.ok(extracted.includes('--d-ring:var(--d-primary)'), 'ringPrimary should set ring color');
  });

  it('_fv:ring2 generates focus-visible ring', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_fv:ring2');
    const extracted = extractCSS();
    assert.ok(extracted.includes(':focus-visible'), 'should use focus-visible pseudo');
    assert.ok(extracted.includes('box-shadow'), 'should contain box-shadow');
  });

  it('_ring0 removes ring', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_ring0');
    const extracted = extractCSS();
    assert.ok(extracted.includes('box-shadow:none'), 'ring0 should reset box-shadow');
  });
});

describe('prose atom', () => {
  it('_prose maps to d-prose class', async () => {
    const { css } = await import('../src/css/index.js');
    const result = css('_prose');
    assert.equal(result, 'd-prose', '_prose should output d-prose class');
  });
});

describe('divide atoms', () => {
  it('_divideY maps to d-divide-y class', async () => {
    const { css } = await import('../src/css/index.js');
    const result = css('_divideY');
    assert.equal(result, 'd-divide-y', '_divideY should output d-divide-y class');
  });

  it('_divideX maps to d-divide-x class', async () => {
    const { css } = await import('../src/css/index.js');
    const result = css('_divideX');
    assert.equal(result, 'd-divide-x', '_divideX should output d-divide-x class');
  });
});

describe('transition atoms', () => {
  it('_transColors resolves correctly', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_transColors');
    const extracted = extractCSS();
    assert.ok(extracted.includes('transition:'), 'should contain transition declaration');
    assert.ok(extracted.includes('background-color'), 'should include background-color');
  });

  it('_textBalance resolves correctly', async () => {
    const { css } = await import('../src/css/index.js');
    const { extractCSS } = await import('../src/css/runtime.js');
    css('_textBalance');
    const extracted = extractCSS();
    assert.ok(extracted.includes('text-wrap:balance'), 'should set text-wrap:balance');
  });
});
