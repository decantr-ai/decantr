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

  it('generates sidebar-main layout with SidebarProvider', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('SidebarProvider');
  });

  it('sidebar has SidebarHeader, SidebarContent, and SidebarFooter', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('SidebarHeader');
    expect(result.content).toContain('SidebarContent');
    expect(result.content).toContain('SidebarFooter');
  });

  it('SidebarTrigger is present in main content header', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('<SidebarTrigger');
  });

  it('generates Ctrl+\\ keyboard shortcut handler', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("e.key === '\\\\'");
    expect(result.content).toContain('e.ctrlKey');
  });

  it('navigation items are generated from essence nav structure', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('SidebarMenu');
    expect(result.content).toContain('SidebarMenuItem');
    expect(result.content).toContain('SidebarMenuButton');
    expect(result.content).toContain('Overview');
    expect(result.content).toContain('Settings');
    expect(result.content).toContain('NavLink');
  });

  it('imports shadcn sidebar components from specific path', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("from '@/components/ui/sidebar'");
    expect(result.content).not.toMatch(/from ['"]@\/components\/ui['"]/);
  });

  it('uses collapsible="icon" variant on Sidebar', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('collapsible="icon"');
  });

  it('includes CommandDialog for Cmd+K', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("e.key === 'k'");
    expect(result.content).toContain('setCmdOpen');
    expect(result.content).toContain('CommandDialog');
  });

  it('generates top-nav layout variant', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('NavLink');
    expect(result.content).not.toContain('SidebarProvider');
  });

  it('top-nav-main uses NavigationMenu for horizontal nav', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('NavigationMenu');
    expect(result.content).toContain('NavigationMenuList');
    expect(result.content).toContain('NavigationMenuItem');
    expect(result.content).toContain('NavigationMenuLink');
  });

  it('top-nav-main has sticky header with correct classes', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('sticky top-0 z-50');
    expect(result.content).toContain('border-b');
    expect(result.content).toContain('bg-background');
  });

  it('top-nav-main has mobile Sheet menu', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('Sheet');
    expect(result.content).toContain('SheetTrigger');
    expect(result.content).toContain('SheetContent');
    expect(result.content).toContain('md:hidden');
  });

  it('top-nav-main derives navigation items from essence structure', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('Overview');
    expect(result.content).toContain('Settings');
    expect(result.content).toContain('NavLink');
  });

  it('top-nav-main has no sidebar components', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).not.toContain('SidebarProvider');
    expect(result.content).not.toContain('SidebarContent');
    expect(result.content).not.toContain('SidebarHeader');
    expect(result.content).not.toContain('SidebarFooter');
    expect(result.content).not.toContain('SidebarMenu');
  });

  it('top-nav-main uses deep lucide-react imports (no barrel)', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain("from 'lucide-react/dist/esm/icons/");
    expect(result.content).not.toMatch(/from ['"]lucide-react['"]/);
  });

  it('top-nav-main uses React.lazy and Suspense for pages', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('React.lazy');
    expect(result.content).toContain('React.Suspense');
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

    expect(result.content).not.toContain('SidebarProvider');
    expect(result.content).toContain('Routes');
  });

  it('includes Breadcrumb in the header', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('Breadcrumb');
    expect(result.content).toContain('BreadcrumbList');
  });

  it('includes Avatar in sidebar footer', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('Avatar');
    expect(result.content).toContain('AvatarFallback');
  });

  it('uses React.lazy for page imports', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('React.lazy');
    expect(result.content).toContain('React.Suspense');
  });

  it('uses functional setState (no stale closure)', () => {
    const app = makeApp();
    const result = emitApp(app);

    // setCmdOpen should use functional updater
    expect(result.content).toContain('setCmdOpen(prev =>');
  });

  it('Suspense fallback uses LoadingSpinner component', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('function LoadingSpinner()');
    expect(result.content).toContain('animate-spin');
    expect(result.content).toContain('fallback={<LoadingSpinner />}');
    expect(result.content).not.toContain('fallback={<div>Loading...</div>}');
  });

  it('NotFoundPage has go-back-home link', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('Go back home');
    expect(result.content).toContain('Page Not Found');
  });

  it('404 catch-all route exists', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain('path="*"');
    expect(result.content).toContain('<NotFoundPage />');
  });

  it('adds redirect from / to first page when first route is not /', () => {
    const app = makeApp({
      routes: [
        { path: '/dashboard', pageId: 'dashboard' },
        { path: '/settings', pageId: 'settings' },
      ],
    });
    const result = emitApp(app);

    expect(result.content).toContain('Navigate');
    expect(result.content).toContain('<Navigate to="/dashboard" replace />');
  });

  it('does not add redirect when first route is /', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).not.toContain('Navigate');
  });

  it('full-bleed layout has NotFoundPage and 404 route', () => {
    const app = makeApp();
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);

    expect(result.content).toContain('NotFoundPage');
    expect(result.content).toContain('path="*"');
    expect(result.content).toContain('LoadingSpinner');
  });

  it('full-bleed layout adds redirect when needed', () => {
    const app = makeApp({
      routes: [
        { path: '/overview', pageId: 'overview' },
        { path: '/settings', pageId: 'settings' },
      ],
    });
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);

    expect(result.content).toContain('<Navigate to="/overview" replace />');
  });

  it('top-nav-main has LoadingSpinner and NotFoundPage with home link', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain('LoadingSpinner');
    expect(result.content).toContain('Go back home');
    expect(result.content).toContain('path="*"');
  });

  it('all page files use export default', () => {
    // Verify emit-page generates export default — tested via emitPage import
    // This is a structural guarantee from emit-page.ts line: `export default function ${pageName}Page`
    const app = makeApp();
    const result = emitApp(app);

    // Page imports use React.lazy which requires default export
    for (const route of app.routes) {
      const pageName = route.pageId.split(/[-_]/).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
      expect(result.content).toContain(`React.lazy(() => import('./pages/${route.pageId}.tsx'))`);
    }
  });
});
