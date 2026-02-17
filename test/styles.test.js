import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { setStyle, getStyle, getStyleList, registerStyle, getActiveCSS, resetStyles, setAnimations, getAnimations } from '../src/css/styles.js';

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

describe('getStyleList()', () => {
  it('returns 6 built-in styles', () => {
    const list = getStyleList();
    assert.equal(list.length, 6);
    const ids = list.map(s => s.id);
    assert.ok(ids.includes('glass'));
    assert.ok(ids.includes('flat'));
    assert.ok(ids.includes('brutalist'));
    assert.ok(ids.includes('skeuo'));
    assert.ok(ids.includes('sketchy'));
    assert.ok(ids.includes('lava'));
  });

  it('each style has id and name', () => {
    const list = getStyleList();
    for (const s of list) {
      assert.ok(typeof s.id === 'string');
      assert.ok(typeof s.name === 'string');
      assert.ok(s.id.length > 0);
      assert.ok(s.name.length > 0);
    }
  });
});

describe('getStyle()', () => {
  it('returns a signal getter defaulting to flat', () => {
    const style = getStyle();
    assert.equal(typeof style, 'function');
    assert.equal(style(), 'flat');
  });
});

describe('setStyle()', () => {
  it('changes the active style signal', () => {
    setStyle('glass');
    assert.equal(getStyle()(), 'glass');
    setStyle('brutalist');
    assert.equal(getStyle()(), 'brutalist');
  });

  it('injects CSS into a style element', () => {
    setStyle('flat');
    const styleEl = document.querySelector('[data-decantr-style]');
    assert.ok(styleEl);
    assert.ok(styleEl.textContent.length > 0);
  });

  it('includes :root with --d- variables', () => {
    setStyle('glass');
    const styleEl = document.querySelector('[data-decantr-style]');
    assert.ok(styleEl.textContent.includes(':root{'));
    assert.ok(styleEl.textContent.includes('--d-radius'));
  });

  it('includes component CSS rules', () => {
    setStyle('glass');
    const styleEl = document.querySelector('[data-decantr-style]');
    const css = styleEl.textContent;
    assert.ok(css.includes('.d-btn{'));
    assert.ok(css.includes('.d-card{'));
    assert.ok(css.includes('.d-input'));
    assert.ok(css.includes('.d-badge{'));
    assert.ok(css.includes('.d-modal-overlay{'));
  });

  it('replaces CSS when switching styles', () => {
    setStyle('glass');
    const styleEl = document.querySelector('[data-decantr-style]');
    const glassCss = styleEl.textContent;
    assert.ok(glassCss.includes('backdrop-filter'));

    setStyle('brutalist');
    const brutCss = styleEl.textContent;
    assert.ok(!brutCss.includes('backdrop-filter'));
    assert.ok(brutCss.includes('text-transform:uppercase'));
  });

  it('throws on unknown style', () => {
    assert.throws(() => setStyle('nonexistent'), /Unknown style/);
  });
});

describe('getActiveCSS()', () => {
  it('returns CSS string for current style', () => {
    const css = getActiveCSS();
    assert.ok(typeof css === 'string');
    assert.ok(css.includes(':root{'));
    assert.ok(css.includes('.d-btn{'));
  });
});

describe('style-specific CSS', () => {
  it('glass has backdrop-filter and blur', () => {
    setStyle('glass');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('backdrop-filter:blur('));
  });

  it('flat has no shadows', () => {
    setStyle('flat');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('--d-shadow:none'));
  });

  it('brutalist has bold borders and offset shadows', () => {
    setStyle('brutalist');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('border:2px solid'));
    assert.ok(css.includes('4px 4px 0'));
  });

  it('skeuo has gradients', () => {
    setStyle('skeuo');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('linear-gradient'));
  });

  it('sketchy has asymmetric border-radius', () => {
    setStyle('sketchy');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('255px'));
    assert.ok(css.includes('225px'));
  });

  it('lava has gradients and ember glow', () => {
    setStyle('lava');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('linear-gradient'));
    assert.ok(css.includes('d-ember-pulse') || css.includes('d-lava-rise'));
  });

  it('all styles include success, warning, and outline button variants', () => {
    const styleIds = ['glass', 'flat', 'brutalist', 'skeuo', 'sketchy', 'lava'];
    for (const id of styleIds) {
      setStyle(id);
      const css = document.querySelector('[data-decantr-style]').textContent;
      assert.ok(css.includes('.d-btn-success'), `${id} missing .d-btn-success`);
      assert.ok(css.includes('.d-btn-warning'), `${id} missing .d-btn-warning`);
      assert.ok(css.includes('.d-btn-outline'), `${id} missing .d-btn-outline`);
    }
  });
});

describe('registerStyle()', () => {
  it('registers a custom style', () => {
    registerStyle({
      id: 'neon',
      name: 'Neon',
      global: '--d-radius:8px;--d-shadow:0 0 20px var(--c1);',
      components: {
        button: '.d-btn{box-shadow:0 0 15px var(--c1)}',
        card: '.d-card{box-shadow:0 0 20px var(--c1)}',
        input: '.d-input-wrap{box-shadow:0 0 10px var(--c1)}',
        badge: '.d-badge{box-shadow:0 0 8px var(--c1)}',
        modal: '.d-modal-content{box-shadow:0 0 30px var(--c1)}'
      }
    });
    const list = getStyleList();
    assert.equal(list.length, 7);
    assert.ok(list.some(s => s.id === 'neon'));
  });

  it('allows switching to custom style', () => {
    setStyle('neon');
    assert.equal(getStyle()(), 'neon');
    const css = document.querySelector('[data-decantr-style]').textContent;
    assert.ok(css.includes('0 0 15px'));
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
