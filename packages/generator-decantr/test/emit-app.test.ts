import { describe, it, expect } from 'vitest';
import { emitApp } from '../src/emit-app.js';
import type { IRAppNode, IRShellNode, IRStoreNode } from '@decantr/generator-core';

function makeApp(overrides?: Partial<IRAppNode>): IRAppNode {
  const shell: IRShellNode = {
    type: 'shell',
    id: 'shell',
    children: [],
    config: {
      type: 'sidebar-main',
      brand: 'SaasDashboard',
      nav: [
        { href: '/', icon: 'layout-dashboard', label: 'Overview' },
        { href: '/settings', icon: 'settings', label: 'Settings' },
      ],
      inset: false,
      recipe: {
        root: 'd-mesh',
        nav: 'd-glass',
        header: '',
        brand: 'd-gradient-text',
        navLabel: '',
        navStyle: 'filled',
        defaultNavState: 'expanded',
        dimensions: null,
      },
    },
  };

  const store: IRStoreNode = {
    type: 'store',
    id: 'store',
    children: [],
    pageSignals: [
      { name: 'overview', pascalName: 'Overview' },
      { name: 'settings', pascalName: 'Settings' },
    ],
  };

  return {
    type: 'app',
    id: 'app',
    children: [],
    theme: {
      style: 'auradecantism',
      mode: 'dark',
      shape: null,
      recipe: 'auradecantism',
      isAddon: false,
    },
    routes: [
      { path: '/', pageId: 'overview' },
      { path: '/settings', pageId: 'settings' },
    ],
    routing: 'hash',
    shell,
    store,
    features: [],
    ...overrides,
  };
}

describe('emitApp', () => {
  it('generates sidebar-main shell with nav items', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.path).toBe('src/app.js');
    expect(result.content).toContain("Shell({");
    expect(result.content).toContain("Shell.Nav(");
    expect(result.content).toContain("Shell.Header(");
    expect(result.content).toContain("Shell.Body(");
    expect(result.content).toContain("'Overview'");
    expect(result.content).toContain("'Settings'");
  });

  it('applies auradecantism recipe decoration (d-mesh, d-glass, d-gradient-text)', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('d-mesh');
    expect(result.content).toContain('d-glass');
    expect(result.content).toContain('d-gradient-text');
  });

  it('includes addon style comment for non-core styles', () => {
    const app = makeApp({
      theme: {
        style: 'glassmorphism',
        mode: 'dark',
        shape: null,
        recipe: 'glassmorphism',
        isAddon: true,
      },
    });
    const result = emitApp(app);

    expect(result.content).toContain('addon style');
    expect(result.content).toContain("setStyle('glassmorphism')");
  });

  it('generates top-nav-main shell', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).not.toContain('Shell({');
    expect(result.content).toContain('nav(');
    expect(result.content).toContain("link('/'");
  });

  it('generates full-bleed shell', () => {
    const app = makeApp();
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);

    expect(result.content).toContain('router.view()');
    expect(result.content).not.toContain('Shell({');
  });

  it('includes keyboard shortcuts (Ctrl+\\)', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('keydown');
    expect(result.content).toContain("e.key === '\\\\'");
  });

  it('sets correct router mode from essence', () => {
    const app = makeApp({ routing: 'history' });
    const result = emitApp(app);

    expect(result.content).toContain("mode: 'history'");
  });

  // --- Nav style variant tests ---

  describe('nav style variants', () => {
    const navStyles = [
      { style: 'pill', cssClass: 'd-shell-nav-style-pill' },
      { style: 'underline', cssClass: 'd-shell-nav-style-underline' },
      { style: 'filled', cssClass: 'd-shell-nav-style-filled' },
      { style: 'minimal', cssClass: 'd-shell-nav-style-minimal' },
      { style: 'icon-glow', cssClass: 'd-shell-nav-style-icon-glow' },
    ];

    for (const { style, cssClass } of navStyles) {
      it(`sidebar-main: emits ${cssClass} for nav_style "${style}"`, () => {
        const app = makeApp();
        app.shell.config.recipe!.navStyle = style;
        const result = emitApp(app);

        expect(result.content).toContain(cssClass);
      });

      it(`top-nav-main: emits ${cssClass} for nav_style "${style}"`, () => {
        const app = makeApp();
        app.shell.config.type = 'top-nav-main';
        app.shell.config.recipe!.navStyle = style;
        const result = emitApp(app);

        expect(result.content).toContain(cssClass);
      });
    }

    it('defaults to pill when navStyle is not specified (sidebar-main)', () => {
      const app = makeApp();
      app.shell.config.recipe = null;
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-style-pill');
    });

    it('defaults to pill when navStyle is not specified (top-nav-main)', () => {
      const app = makeApp();
      app.shell.config.type = 'top-nav-main';
      app.shell.config.recipe = null;
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-style-pill');
    });
  });

  describe('nav item classes', () => {
    it('sidebar-main nav items have d-shell-nav-item base class', () => {
      const app = makeApp();
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-item');
    });

    it('sidebar-main nav items have d-shell-nav-item-active for active route', () => {
      const app = makeApp();
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-item-active');
    });

    it('top-nav-main nav items have d-shell-nav-item base class', () => {
      const app = makeApp();
      app.shell.config.type = 'top-nav-main';
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-item');
    });

    it('top-nav-main nav items have d-shell-nav-item-active for active route', () => {
      const app = makeApp();
      app.shell.config.type = 'top-nav-main';
      const result = emitApp(app);

      expect(result.content).toContain('d-shell-nav-item-active');
    });
  });

  describe('shell dimensions', () => {
    it('passes dimensions prop when present in recipe (sidebar-main)', () => {
      const app = makeApp();
      app.shell.config.recipe!.dimensions = { navWidth: '280px', headerHeight: '56px' };
      const result = emitApp(app);

      expect(result.content).toContain("navWidth: '280px'");
      expect(result.content).toContain("headerHeight: '56px'");
    });

    it('omits dimensions prop when null (sidebar-main)', () => {
      const app = makeApp();
      app.shell.config.recipe!.dimensions = null;
      const result = emitApp(app);

      expect(result.content).not.toContain('navWidth');
      expect(result.content).not.toContain('headerHeight');
    });

    it('applies header height in top-nav-main when dimensions present', () => {
      const app = makeApp();
      app.shell.config.type = 'top-nav-main';
      app.shell.config.recipe!.dimensions = { headerHeight: '56px' };
      const result = emitApp(app);

      expect(result.content).toContain('56px');
    });
  });
});
