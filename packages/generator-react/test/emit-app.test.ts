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
      recipe: null,
    },
  };

  const store: IRStoreNode = {
    type: 'store',
    id: 'store',
    children: [],
    pageSignals: [],
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

describe('emitApp (React)', () => {
  it('generates App.tsx with BrowserRouter or HashRouter', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.path).toBe('src/App.tsx');
    expect(result.content).toContain('react-router-dom');
  });

  it('generates sidebar layout with NavLink items', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('NavLink');
    expect(result.content).toContain('Overview');
    expect(result.content).toContain('Settings');
    expect(result.content).toContain('aside');
  });

  it('generates top-nav layout variant', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('NavLink');
    expect(result.content).not.toContain('aside');
  });

  it('includes CommandDialog for Cmd+K', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("e.key === 'k'");
    expect(result.content).toContain('setCmdOpen');
  });

  it('uses lucide-react icons', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('lucide-react');
    expect(result.content).toContain('LayoutDashboard');
    expect(result.content).toContain('Settings');
  });

  it('uses HashRouter when routing=hash', () => {
    const app = makeApp({ routing: 'hash' });
    const result = emitApp(app);

    expect(result.content).toContain('HashRouter');
  });

  it('uses BrowserRouter when routing=history', () => {
    const app = makeApp({ routing: 'history' });
    const result = emitApp(app);

    expect(result.content).toContain('BrowserRouter');
  });

  it('generates full-bleed layout without sidebar', () => {
    const app = makeApp();
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);

    expect(result.content).not.toContain('aside');
    expect(result.content).toContain('Routes');
  });
});
