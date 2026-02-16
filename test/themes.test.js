import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { setTheme, getTheme, getThemeMeta, registerTheme, getThemeList } from '../src/css/themes.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

describe('getThemeList()', () => {
  it('returns 7 built-in themes', () => {
    const list = getThemeList();
    assert.equal(list.length, 7);
    const ids = list.map(t => t.id);
    assert.ok(ids.includes('light'));
    assert.ok(ids.includes('dark'));
    assert.ok(ids.includes('ai'));
    assert.ok(ids.includes('nature'));
    assert.ok(ids.includes('pastel'));
    assert.ok(ids.includes('spice'));
    assert.ok(ids.includes('mono'));
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

  it('applies CSS custom properties to document.documentElement', () => {
    setTheme('dark');
    const style = document.documentElement.style;
    assert.equal(style['--c0'], '#0f172a');
    assert.equal(style['--c1'], '#3b82f6');
    assert.equal(style['--c3'], '#f1f5f9');
  });

  it('throws on unknown theme', () => {
    assert.throws(() => setTheme('nonexistent'), /Unknown theme/);
  });

  it('applies different color values per theme', () => {
    setTheme('ai');
    assert.equal(document.documentElement.style['--c0'], '#0a0a1a');
    assert.equal(document.documentElement.style['--c1'], '#8b5cf6');
    setTheme('nature');
    assert.equal(document.documentElement.style['--c0'], '#fefce8');
    assert.equal(document.documentElement.style['--c1'], '#16a34a');
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
    assert.equal(list.length, 8);
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
});
