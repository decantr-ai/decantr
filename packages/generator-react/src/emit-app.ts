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
  icons.add('Search');
  icons.add('AlertCircle');
  return [...icons].sort();
}

// AUTO: Build reverse map PascalCase → kebab-case for deep lucide-react imports
const LUCIDE_ICON_PATHS: Record<string, string> = {};
for (const [kebab, pascal] of Object.entries(LUCIDE_ICONS)) {
  LUCIDE_ICON_PATHS[pascal] = kebab;
}

/** Generate per-icon deep imports instead of barrel import (Vercel best practice) */
function lucideImportLines(icons: string[]): string {
  return icons
    .map(icon => {
      const kebab = LUCIDE_ICON_PATHS[icon] || icon.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `import { ${icon} } from 'lucide-react/dist/esm/icons/${kebab}';`;
    })
    .join('\n');
}

function buildSidebarMainApp(app: IRAppNode): string {
  const { routes, shell } = app;
  const { nav, brand } = shell.config;
  const routerComponent = app.routing === 'hash' ? 'HashRouter' : 'BrowserRouter';
  const icons = collectLucideIcons(nav);

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  // AUTO: Generate SidebarMenuItems from nav, using NavLink for active state
  const navMenuItems = nav
    .map(n => `              <SidebarMenuItem key="${n.href}">
                <SidebarMenuButton asChild>
                  <NavLink to="${n.href}" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                    <${lucideComponent(n.icon)} className="h-4 w-4" />
                    <span>${n.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>`)
    .join('\n');

  const routeElements = routes
    .map(r => `            <Route path="${r.path}" element={<React.Suspense fallback={<div>Loading...</div>}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  return `import React, { useEffect, useRef } from 'react';
import { ${routerComponent}, Routes, Route, NavLink } from 'react-router-dom';
${lucideImportLines(icons)}
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';

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
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const sidebarRef = useRef<{ toggleSidebar?: () => void }>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\\\') {
        e.preventDefault();
        sidebarRef.current?.toggleSidebar?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <${routerComponent}>
      <SidebarProvider ref={sidebarRef}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <span className="text-lg font-semibold px-2">${brand}</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
${navMenuItems}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>User</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main area */}
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-6 h-14 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">${brand}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCmdOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Routes>
${routeElements}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Pages">
${nav.map(n => `              <CommandItem>${n.label}</CommandItem>`).join('\n')}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </SidebarProvider>
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
