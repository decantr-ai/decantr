import type { IRAppNode, IRNavItem, IRRoute, GeneratedFile } from '@decantr/generator-core';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

// Map icon names to lucide-react component names
const LUCIDE_ICONS: Record<string, string> = {
  'layout-dashboard': 'LayoutDashboard',
  'settings': 'Settings',
  'home': 'Home',
  'bar-chart-3': 'BarChart3',
  'users': 'Users',
  'credit-card': 'CreditCard',
  'file-text': 'FileText',
  'grid': 'Grid3X3',
  'package': 'Package',
  'shopping-cart': 'ShoppingCart',
  'message-square': 'MessageSquare',
  'bell': 'Bell',
  'activity': 'Activity',
  'search': 'Search',
  'user': 'User',
  'puzzle': 'Puzzle',
  'code': 'Code',
  'book-open': 'BookOpen',
  'help-circle': 'HelpCircle',
  'folder': 'Folder',
  'git-branch': 'GitBranch',
  'monitor': 'Monitor',
  'shield': 'Shield',
  'database': 'Database',
  'rocket': 'Rocket',
  'scroll-text': 'ScrollText',
  'panel-left': 'PanelLeft',
  'alert-circle': 'AlertCircle',
  'arrow-left': 'ArrowLeft',
  'circle': 'Circle',
};

function lucideComponent(icon: string): string {
  return LUCIDE_ICONS[icon] || 'Circle';
}

function collectLucideIcons(nav: IRNavItem[]): string[] {
  const icons = new Set<string>();
  for (const item of nav) {
    icons.add(lucideComponent(item.icon));
  }
  icons.add('PanelLeft');
  icons.add('Bell');
  icons.add('User');
  return [...icons].sort();
}

function buildSidebarMainApp(app: IRAppNode): string {
  const { routes, shell } = app;
  const { nav, brand } = shell.config;
  const routerComponent = app.routing === 'hash' ? 'HashRouter' : 'BrowserRouter';
  const icons = collectLucideIcons(nav);

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  const navItems = nav
    .map(n => `          <NavLink
            key="${n.href}"
            to="${n.href}"
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')
            }
          >
            <${lucideComponent(n.icon)} className="h-4 w-4" />
            {navState === 'expanded' && <span>${n.label}</span>}
          </NavLink>`)
    .join('\n');

  const routeElements = routes
    .map(r => `            <Route path="${r.path}" element={<React.Suspense fallback={<div>Loading...</div>}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  return `import React, { useState, useEffect } from 'react';
import { ${routerComponent}, Routes, Route, NavLink } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

${pageImports}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full p-6">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground text-center">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  const [navState, setNavState] = useState<'expanded' | 'rail'>('expanded');
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\\\') {
        e.preventDefault();
        setNavState(s => s === 'expanded' ? 'rail' : 'expanded');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(open => !open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <${routerComponent}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={cn(
          'flex flex-col gap-1 bg-muted border-r transition-all',
          navState === 'expanded' ? 'w-64' : 'w-16'
        )}>
          <div className="flex items-center justify-between p-3">
            {navState === 'expanded' && <span className="text-lg font-semibold">${brand}</span>}
            <Button variant="ghost" size="sm" onClick={() => setNavState(s => s === 'expanded' ? 'rail' : 'expanded')}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
${navItems}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-6 h-14 border-b">
            <div>{/* Breadcrumb */}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCmdOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Routes>
${routeElements}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </${routerComponent}>
  );
}
`;
}

function buildTopNavApp(app: IRAppNode): string {
  const { routes, shell } = app;
  const { nav, brand } = shell.config;
  const routerComponent = app.routing === 'hash' ? 'HashRouter' : 'BrowserRouter';

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  const routeElements = routes
    .map(r => `          <Route path="${r.path}" element={<React.Suspense fallback={<div>Loading...</div>}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  return `import React from 'react';
import { ${routerComponent}, Routes, Route, NavLink } from 'react-router-dom';

${pageImports}

export default function App() {
  return (
    <${routerComponent}>
      <div className="flex flex-col h-full">
        <nav className="flex items-center justify-between px-6 py-3 border-b">
          <span className="text-lg font-semibold">${brand}</span>
          <div className="flex gap-4">
${nav.map(n => `            <NavLink to="${n.href}" className={({ isActive }) => isActive ? 'text-primary' : 'text-muted-foreground'}>${n.label}</NavLink>`).join('\n')}
          </div>
        </nav>
        <main className="flex-1 overflow-auto">
          <Routes>
${routeElements}
          </Routes>
        </main>
      </div>
    </${routerComponent}>
  );
}
`;
}

function buildFullBleedApp(app: IRAppNode): string {
  const { routes } = app;
  const routerComponent = app.routing === 'hash' ? 'HashRouter' : 'BrowserRouter';

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  const routeElements = routes
    .map(r => `        <Route path="${r.path}" element={<React.Suspense fallback={<div>Loading...</div>}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  return `import React from 'react';
import { ${routerComponent}, Routes, Route } from 'react-router-dom';

${pageImports}

export default function App() {
  return (
    <${routerComponent}>
      <div className="flex flex-col h-full">
        <Routes>
${routeElements}
        </Routes>
      </div>
    </${routerComponent}>
  );
}
`;
}

/** Emit src/App.tsx — the React root with router and shell layout */
export function emitApp(app: IRAppNode): GeneratedFile {
  const shellType = app.shell.config.type;

  let content: string;
  switch (shellType) {
    case 'sidebar-main':
      content = buildSidebarMainApp(app);
      break;
    case 'top-nav-main':
      content = buildTopNavApp(app);
      break;
    case 'full-bleed':
    case 'centered':
    case 'minimal-header':
    default:
      content = buildFullBleedApp(app);
      break;
  }

  return { path: 'src/App.tsx', content };
}
