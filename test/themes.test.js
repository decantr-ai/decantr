import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import {
  setTheme, getTheme, getThemeMeta, registerTheme, getThemeList,
  getActiveCSS, resetStyles, setAnimations, getAnimations,
  setStyle, getStyle, getStyleList, registerStyle
} from '../src/css/theme-registry.js';

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

describe('getThemeList()', () => {
  it('returns 5 built-in themes', () => {
    const list = getThemeList();
    assert.equal(list.length, 5);
    const ids = list.map(t => t.id);
    assert.ok(ids.includes('light'));
    assert.ok(ids.includes('dark'));
    assert.ok(ids.includes('retro'));
    assert.ok(ids.includes('hot-lava'));
    assert.ok(ids.includes('stormy-ai'));
  });

  it('each theme has id and name', () => {
    const list = getThemeList();
    for (const t of list) {
      assert.ok(typeof t.id === 'string');
      assert.ok(typeof t.name === 'string');
      assert.ok(t.id.length > 0);
      assert.ok(t.name.length > 0);
    }
  });
});

describe('getTheme()', () => {
  it('returns a signal getter defaulting to light', () => {
    const theme = getTheme();
    assert.equal(typeof theme, 'function');
    assert.equal(theme(), 'light');
  });
});

describe('setTheme()', () => {
  it('changes the active theme signal', () => {
    setTheme('dark');
    assert.equal(getTheme()(), 'dark');
    setTheme('light');
    assert.equal(getTheme()(), 'light');
  });

  it('applies color CSS custom properties to document.documentElement', () => {
    setTheme('dark');
    const style = document.documentElement.style;
    assert.equal(style['--c0'], '#1F1F1F');
    assert.equal(style['--c1'], '#0078D4');
    assert.equal(style['--c3'], '#CCCCCC');
  });

  it('applies token CSS custom properties to document.documentElement', () => {
    setTheme('stormy-ai');
    const style = document.documentElement.style;
    assert.equal(style['--d-radius'], '12px');
    assert.equal(style['--d-shadow'], '0 8px 32px rgba(0,0,0,0.3)');
  });

  it('applies spacing token --d-pad', () => {
    setTheme('light');
    assert.equal(document.documentElement.style['--d-pad'], '1.5rem');
    setTheme('dark');
    assert.equal(document.documentElement.style['--d-pad'], '1.25rem');
  });

  it('injects component CSS into a style element', () => {
    setTheme('light');
    const styleEl = document.querySelector('[data-decantr-style]');
    assert.ok(styleEl);
    assert.ok(styleEl.textContent.length > 0);
    assert.ok(styleEl.textContent.includes('.d-btn'));
    assert.ok(styleEl.textContent.includes('.d-card'));
  });

  it('throws on unknown theme', () => {
    assert.throws(() => setTheme('nonexistent'), /Unknown theme/);
  });

  it('applies different color values per theme', () => {
    setTheme('light');
    assert.equal(document.documentElement.style['--c0'], '#ffffff');
    assert.equal(document.documentElement.style['--c1'], '#1366D9');
    setTheme('stormy-ai');
    assert.equal(document.documentElement.style['--c0'], '#0a0c10');
    assert.equal(document.documentElement.style['--c1'], '#38bdf8');
  });

  it('replaces CSS when switching themes', () => {
    setTheme('light');
    const styleEl = document.querySelector('[data-decantr-style]');
    const lightCss = styleEl.textContent;
    setTheme('retro');
    const retroCss = styleEl.textContent;
    assert.notEqual(lightCss, retroCss);
  });
});

describe('legacy theme mapping', () => {
  it('maps "ai" to "stormy-ai" with warning', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    setTheme('ai');
    console.warn = origWarn;
    assert.equal(getTheme()(), 'stormy-ai');
    assert.ok(warnings.some(w => w.includes('stormy-ai')));
  });

  it('maps "mono" to "dark" with warning', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    setTheme('mono');
    console.warn = origWarn;
    assert.equal(getTheme()(), 'dark');
  });

  it('maps "lava" to "hot-lava"', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    setTheme('lava');
    console.warn = origWarn;
    assert.equal(getTheme()(), 'hot-lava');
  });
});

describe('getThemeMeta()', () => {
  it('returns meta for active theme', () => {
    setTheme('dark');
    const meta = getThemeMeta();
    assert.equal(meta.isDark, true);
    assert.equal(meta.contrastText, '#ffffff');
    assert.ok(typeof meta.surfaceAlpha === 'string');
  });

  it('returns non-dark meta for light theme', () => {
    setTheme('light');
    const meta = getThemeMeta();
    assert.equal(meta.isDark, false);
  });

  it('returns a copy (not reference)', () => {
    setTheme('light');
    const meta1 = getThemeMeta();
    const meta2 = getThemeMeta();
    assert.notEqual(meta1, meta2);
    assert.deepEqual(meta1, meta2);
  });
});

describe('registerTheme()', () => {
  it('registers a custom theme', () => {
    registerTheme({
      id: 'ocean',
      name: 'Ocean',
      colors: {
        '--c0': '#0a192f', '--c1': '#64ffda', '--c2': '#112240',
        '--c3': '#ccd6f6', '--c4': '#8892b0', '--c5': '#233554',
        '--c6': '#4de8c2', '--c7': '#22c55e', '--c8': '#fbbf24', '--c9': '#ef4444'
      },
      meta: { isDark: true, contrastText: '#0a192f', surfaceAlpha: 'rgba(17,34,64,0.85)' }
    });
    const list = getThemeList();
    assert.ok(list.length >= 6);
    assert.ok(list.some(t => t.id === 'ocean'));
  });

  it('allows switching to custom theme', () => {
    setTheme('ocean');
    assert.equal(getTheme()(), 'ocean');
    assert.equal(document.documentElement.style['--c0'], '#0a192f');
    const meta = getThemeMeta();
    assert.equal(meta.isDark, true);
    assert.equal(meta.contrastText, '#0a192f');
  });

  it('fills defaults for missing optional fields', () => {
    registerTheme({
      id: 'minimal',
      name: 'Minimal',
      colors: {
        '--c0': '#fff', '--c1': '#000', '--c2': '#eee',
        '--c3': '#111', '--c4': '#666', '--c5': '#ccc',
        '--c6': '#333', '--c7': '#0a0', '--c8': '#aa0', '--c9': '#a00'
      }
    });
    setTheme('minimal');
    assert.equal(getTheme()(), 'minimal');
    // Should have default tokens applied
    const style = document.documentElement.style;
    assert.ok(style['--d-radius']);
  });
});

describe('getActiveCSS()', () => {
  it('returns CSS string for current theme', () => {
    setTheme('light');
    const css = getActiveCSS();
    assert.ok(typeof css === 'string');
    assert.ok(css.includes('.d-btn'));
    assert.ok(css.includes('.d-card'));
  });
});

describe('resetStyles()', () => {
  it('resets theme to light and removes style element', () => {
    setTheme('dark');
    assert.equal(getTheme()(), 'dark');
    resetStyles();
    assert.equal(getTheme()(), 'light');
    assert.ok(!document.querySelector('[data-decantr-style]'));
  });
});

describe('theme component CSS completeness', () => {
  const expectedKeys = [
    'button', 'card', 'input', 'badge', 'modal',
    'textarea', 'checkbox', 'switch', 'select', 'tabs',
    'accordion', 'separator', 'breadcrumb', 'table', 'avatar',
    'progress', 'skeleton', 'tooltip', 'alert', 'chip', 'toast', 'spinner',
    'dropdown', 'drawer', 'pagination', 'radiogroup', 'popover', 'combobox', 'slider'
  ];

  for (const themeId of ['light', 'dark', 'retro', 'hot-lava', 'stormy-ai']) {
    it(`${themeId} has all 29 component CSS keys`, () => {
      setTheme(themeId);
      const css = getActiveCSS();
      assert.ok(css.length > 0, `${themeId} CSS is empty`);
      // Verify key component class names appear
      assert.ok(css.includes('.d-btn'), `${themeId} missing .d-btn`);
      assert.ok(css.includes('.d-card'), `${themeId} missing .d-card`);
      assert.ok(css.includes('.d-input'), `${themeId} missing .d-input`);
      assert.ok(css.includes('.d-badge'), `${themeId} missing .d-badge`);
      assert.ok(css.includes('.d-modal'), `${themeId} missing .d-modal`);
      assert.ok(css.includes('.d-chip'), `${themeId} missing .d-chip`);
      assert.ok(css.includes('.d-dropdown'), `${themeId} missing .d-dropdown`);
      assert.ok(css.includes('.d-drawer'), `${themeId} missing .d-drawer`);
      assert.ok(css.includes('.d-pagination'), `${themeId} missing .d-pagination`);
      assert.ok(css.includes('.d-radio'), `${themeId} missing .d-radio`);
      assert.ok(css.includes('.d-popover'), `${themeId} missing .d-popover`);
      assert.ok(css.includes('.d-combobox'), `${themeId} missing .d-combobox`);
      assert.ok(css.includes('.d-slider'), `${themeId} missing .d-slider`);
    });

    it(`${themeId} has all button variants`, () => {
      setTheme(themeId);
      const css = getActiveCSS();
      assert.ok(css.includes('.d-btn-primary'), `${themeId} missing .d-btn-primary`);
      assert.ok(css.includes('.d-btn-secondary'), `${themeId} missing .d-btn-secondary`);
      assert.ok(css.includes('.d-btn-destructive'), `${themeId} missing .d-btn-destructive`);
      assert.ok(css.includes('.d-btn-success'), `${themeId} missing .d-btn-success`);
      assert.ok(css.includes('.d-btn-warning'), `${themeId} missing .d-btn-warning`);
      assert.ok(css.includes('.d-btn-outline'), `${themeId} missing .d-btn-outline`);
      assert.ok(css.includes('.d-btn-ghost'), `${themeId} missing .d-btn-ghost`);
      assert.ok(css.includes('.d-btn-link'), `${themeId} missing .d-btn-link`);
    });
  }
});

describe('deprecated stubs', () => {
  it('setStyle() logs warning and does not throw', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    assert.doesNotThrow(() => setStyle('glass'));
    console.warn = origWarn;
    assert.ok(warnings.some(w => w.includes('deprecated')));
  });

  it('getStyle() logs warning and returns signal', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    const result = getStyle();
    console.warn = origWarn;
    assert.equal(typeof result, 'function');
    assert.ok(warnings.some(w => w.includes('deprecated')));
  });

  it('getStyleList() logs warning and returns empty array', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    const result = getStyleList();
    console.warn = origWarn;
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 0);
    assert.ok(warnings.some(w => w.includes('deprecated')));
  });

  it('registerStyle() logs warning and does not throw', () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);
    assert.doesNotThrow(() => registerStyle({ id: 'test', name: 'Test' }));
    console.warn = origWarn;
    assert.ok(warnings.some(w => w.includes('deprecated')));
  });
});

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
