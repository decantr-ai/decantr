import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import {
  setTheme, getTheme, getThemeMeta, registerTheme, getThemeList,
  getActiveCSS, resetStyles, setAnimations, getAnimations,
  setStyle, getStyle, getStyleList, registerStyle,
  setMode, getMode, getResolvedMode, onModeChange
} from '../src/css/theme-registry.js';
import { derive, legacyColorMap, defaultSeed, defaultPersonality } from '../src/css/derive.js';

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
});

// ============================================================
// Derivation Engine
// ============================================================

describe('derive()', () => {
  it('produces ~170 tokens from default seed', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    assert.ok(Object.keys(tokens).length >= 160);
  });

  it('derives all 7 palette roles × 7 modifiers', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    const roles = ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
    const mods = ['', '-fg', '-hover', '-active', '-subtle', '-subtle-fg', '-border'];
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
    assert.notEqual(glass['--d-error-border'], brutalist['--d-error-border']);
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

describe('legacyColorMap()', () => {
  it('maps new tokens to --c0 through --c9', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'light');
    const legacy = legacyColorMap(tokens);
    assert.equal(legacy['--c0'], tokens['--d-bg']);
    assert.equal(legacy['--c1'], tokens['--d-primary']);
    assert.equal(legacy['--c3'], tokens['--d-fg']);
    assert.equal(legacy['--c9'], tokens['--d-error']);
  });
});

// ============================================================
// Style System
// ============================================================

describe('getStyleList()', () => {
  it('returns 4 built-in styles', () => {
    const list = getStyleList();
    assert.equal(list.length, 4);
    const ids = list.map(s => s.id);
    assert.ok(ids.includes('clean'));
    assert.ok(ids.includes('retro'));
    assert.ok(ids.includes('glassmorphism'));
    assert.ok(ids.includes('liquid-glass'));
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
  it('returns a signal getter defaulting to clean', () => {
    const theme = getTheme();
    assert.equal(typeof theme, 'function');
    assert.equal(theme(), 'clean');
  });
});

describe('getStyle()', () => {
  it('returns a signal getter for style ID', () => {
    const style = getStyle();
    assert.equal(typeof style, 'function');
    assert.equal(style(), 'clean');
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

  it('applies legacy --c variables for backward compat', () => {
    setStyle('clean');
    const style = document.documentElement.style;
    assert.ok(style['--c0']);
    assert.ok(style['--c1']);
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

  it('dark mode updates legacy --c0', () => {
    setStyle('clean');
    setMode('light');
    const lightC0 = document.documentElement.style['--c0'];
    setMode('dark');
    const darkC0 = document.documentElement.style['--c0'];
    assert.notEqual(lightC0, darkC0);
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
  it('resets to clean + light and removes style element', () => {
    setStyle('retro');
    setMode('dark');
    resetStyles();
    assert.equal(getStyle()(), 'clean');
    assert.equal(getMode()(), 'light');
    assert.ok(!document.querySelector('[data-decantr-style]'));
  });
});

describe('onModeChange()', () => {
  it('fires callback on mode change', () => {
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
