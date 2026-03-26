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
});
