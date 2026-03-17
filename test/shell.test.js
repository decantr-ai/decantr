import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createSignal } from '../src/state/index.js';
import { resetBase } from '../src/components/_base.js';
import { Shell, resolveShellConfig, buildGridTemplate } from '../src/components/shell.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  resetBase();
  document.body.replaceChildren();
  document.head.replaceChildren();
});

// ─── resolveShellConfig ─────────────────────────────────────────

describe('resolveShellConfig', () => {
  it('resolves string preset to config object', () => {
    const cfg = resolveShellConfig('sidebar-main');
    assert.deepEqual(cfg.regions, ['header', 'nav', 'body']);
    assert.equal(cfg.nav.position, 'left');
    assert.equal(cfg.nav.width, '240px');
    assert.equal(cfg.header.sticky, true);
  });

  it('resolves all 10 presets without error', () => {
    const ids = [
      'sidebar-main', 'sidebar-right', 'sidebar-main-footer',
      'sidebar-aside', 'top-nav-main', 'top-nav-footer',
      'centered', 'full-bleed', 'minimal-header', 'top-nav-sidebar'
    ];
    for (const id of ids) {
      const cfg = resolveShellConfig(id);
      assert.ok(cfg.regions.length > 0, `${id} should have regions`);
      assert.ok(cfg.grid.areas.length > 0, `${id} should have grid areas`);
    }
  });

  it('throws for unknown preset', () => {
    assert.throws(() => resolveShellConfig('nonexistent'), /unknown preset/);
  });

  it('resolves custom config object with defaults', () => {
    const cfg = resolveShellConfig({
      regions: ['header', 'body'],
      grid: { areas: [['header'], ['body']] },
      nav: { position: 'top' }
    });
    assert.equal(cfg.nav.position, 'top');
    assert.equal(cfg.nav.width, '240px'); // default
    assert.equal(cfg.header.height, '52px'); // default
  });

  it('merges section overrides with defaults', () => {
    const cfg = resolveShellConfig({
      regions: ['header', 'nav', 'body'],
      grid: { areas: [['nav', 'header'], ['nav', 'body']] },
      nav: { position: 'left', width: '300px' },
      header: { height: '60px' }
    });
    assert.equal(cfg.nav.width, '300px');
    assert.equal(cfg.nav.collapseTo, '64px'); // default preserved
    assert.equal(cfg.header.height, '60px');
    assert.equal(cfg.header.sticky, true); // default preserved
  });
});

// ─── buildGridTemplate ──────────────────────────────────────────

describe('buildGridTemplate', () => {
  it('generates correct areas string for sidebar-main', () => {
    const cfg = resolveShellConfig('sidebar-main');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.equal(tpl.areas, '"nav header" "nav body"');
  });

  it('generates correct columns for expanded nav', () => {
    const cfg = resolveShellConfig('sidebar-main');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.ok(tpl.columns.includes('240px'));
    assert.ok(tpl.columns.includes('1fr'));
  });

  it('generates correct columns for rail nav', () => {
    const cfg = resolveShellConfig('sidebar-main');
    const tpl = buildGridTemplate(cfg, 'rail');
    assert.ok(tpl.columns.includes('64px'));
  });

  it('generates correct columns for hidden nav', () => {
    const cfg = resolveShellConfig('sidebar-main');
    const tpl = buildGridTemplate(cfg, 'hidden');
    assert.ok(tpl.columns.includes('0px'));
  });

  it('generates correct rows with header and body', () => {
    const cfg = resolveShellConfig('sidebar-main');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.equal(tpl.rows, '52px 1fr');
  });

  it('generates correct template for sidebar-aside (3 columns)', () => {
    const cfg = resolveShellConfig('sidebar-aside');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.equal(tpl.areas, '"nav header aside" "nav body aside"');
    assert.ok(tpl.columns.includes('280px'));
  });

  it('generates correct template for top-nav-main (single column)', () => {
    const cfg = resolveShellConfig('top-nav-main');
    const tpl = buildGridTemplate(cfg, 'hidden');
    assert.equal(tpl.areas, '"header" "body"');
    assert.equal(tpl.columns, '1fr');
  });

  it('generates correct template with footer row', () => {
    const cfg = resolveShellConfig('sidebar-main-footer');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.equal(tpl.areas, '"nav header" "nav body" "nav footer"');
    assert.equal(tpl.rows, '52px 1fr auto');
  });

  it('generates correct template for top-nav-sidebar', () => {
    const cfg = resolveShellConfig('top-nav-sidebar');
    const tpl = buildGridTemplate(cfg, 'expanded');
    assert.equal(tpl.areas, '"header header" "nav body"');
  });

  it('throws for non-rectangular areas', () => {
    const cfg = resolveShellConfig({
      regions: ['header', 'body'],
      grid: { areas: [['header', 'body'], ['body']] }
    });
    assert.throws(() => buildGridTemplate(cfg, 'expanded'), /row 1/);
  });

  it('throws for unknown region name', () => {
    const cfg = resolveShellConfig({
      regions: ['header', 'body'],
      grid: { areas: [['header'], ['sidebar']] }
    });
    assert.throws(() => buildGridTemplate(cfg, 'expanded'), /unknown region/);
  });
});

// ─── Shell Component ────────────────────────────────────────────

describe('Shell', () => {
  it('creates a grid element with d-shell class', () => {
    const el = Shell({ config: 'sidebar-main' },
      Shell.Header({}, 'Header'),
      Shell.Nav({}, 'Nav'),
      Shell.Body({}, 'Body')
    );
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell'));
  });

  it('applies custom class', () => {
    const el = Shell({ config: 'sidebar-main', class: 'my-layout' },
      Shell.Body({}, 'Content')
    );
    assert.ok(el.className.includes('my-layout'));
  });

  it('sets grid-template-areas on the element', () => {
    const el = Shell({ config: 'sidebar-main' },
      Shell.Header({}, 'H'),
      Shell.Nav({}, 'N'),
      Shell.Body({}, 'B')
    );
    assert.ok(el.style.gridTemplateAreas);
  });

  it('applies nav state classes', () => {
    const el = Shell({ config: 'sidebar-main' },
      Shell.Header({}, 'H'),
      Shell.Nav({}, 'N'),
      Shell.Body({}, 'B')
    );
    assert.ok(el.classList.contains('d-shell-nav-expanded'));
  });

  it('reacts to external nav state signal', () => {
    const [navState, setNavState] = createSignal('expanded');
    const el = Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState },
      Shell.Header({}, 'H'),
      Shell.Nav({}, 'N'),
      Shell.Body({}, 'B')
    );
    assert.ok(el.classList.contains('d-shell-nav-expanded'));

    setNavState('rail');
    assert.ok(el.classList.contains('d-shell-nav-rail'));
    assert.ok(!el.classList.contains('d-shell-nav-expanded'));

    setNavState('hidden');
    assert.ok(el.classList.contains('d-shell-nav-hidden'));
  });

  it('defaults config to sidebar-main', () => {
    const el = Shell({},
      Shell.Header({}, 'H'),
      Shell.Nav({}, 'N'),
      Shell.Body({}, 'B')
    );
    assert.ok(el.style.gridTemplateAreas.includes('nav'));
  });
});

// ─── Sub-Components ─────────────────────────────────────────────

describe('Shell.Header', () => {
  it('creates a div with d-shell-header class', () => {
    const el = Shell.Header({}, 'Content');
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell-header'));
  });

  it('applies custom class', () => {
    const el = Shell.Header({ class: 'my-header' }, 'Content');
    assert.ok(el.className.includes('my-header'));
    assert.ok(el.className.includes('d-shell-header'));
  });
});

describe('Shell.Nav', () => {
  it('creates a div with d-shell-nav class', () => {
    const el = Shell.Nav({}, 'Nav');
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell-nav'));
  });
});

describe('Shell.Body', () => {
  it('creates a div with d-shell-body class', () => {
    const el = Shell.Body({}, 'Main');
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell-body'));
  });
});

describe('Shell.Footer', () => {
  it('creates a div with d-shell-footer class', () => {
    const el = Shell.Footer({}, 'Footer');
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell-footer'));
  });
});

describe('Shell.Aside', () => {
  it('creates a div with d-shell-aside class', () => {
    const el = Shell.Aside({}, 'Aside');
    assert.equal(el.tagName, 'DIV');
    assert.ok(el.className.includes('d-shell-aside'));
  });
});

// ─── Top Nav Mode ───────────────────────────────────────────────

describe('Shell top-nav mode', () => {
  it('hides Shell.Nav when nav.position is top', () => {
    const el = Shell({ config: 'top-nav-main' },
      Shell.Header({}, 'Brand'),
      Shell.Nav({}, 'Nav Items'),
      Shell.Body({}, 'Content')
    );
    const nav = el.querySelector('.d-shell-nav');
    if (nav) {
      assert.equal(nav.style.display, 'none');
    }
  });

  it('inserts nav content inline in header', () => {
    const el = Shell({ config: 'top-nav-main' },
      Shell.Header({}, 'Brand'),
      Shell.Nav({}, 'Nav Items'),
      Shell.Body({}, 'Content')
    );
    const inlineNav = el.querySelector('.d-shell-nav-inline');
    assert.ok(inlineNav, 'should have inline nav container');
  });
});

// ─── Presets ────────────────────────────────────────────────────

describe('Shell.PRESETS', () => {
  it('exposes 10 preset configs', () => {
    assert.equal(Object.keys(Shell.PRESETS).length, 10);
  });

  it('every preset has regions and grid.areas', () => {
    for (const [id, preset] of Object.entries(Shell.PRESETS)) {
      assert.ok(preset.regions, `${id} needs regions`);
      assert.ok(preset.grid && preset.grid.areas, `${id} needs grid.areas`);
    }
  });
});
