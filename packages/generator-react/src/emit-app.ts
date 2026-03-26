import type { IRAppNode, IRNavItem, IRRoute, GeneratedFile } from '@decantr/generator-core';
import { hasAuth } from './emit-auth.js';
import { isThemeToggleable } from './emit-theme.js';

// AUTO: Module-level loading spinner JSX used as Suspense fallback in all shell variants
const LOADING_SPINNER = `function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}`;

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
  'sun': 'Sun',
  'moon': 'Moon',
  'shield': 'Shield',
  'database': 'Database',
  'rocket': 'Rocket',
  'scroll-text': 'ScrollText',
  'panel-left': 'PanelLeft',
  'alert-circle': 'AlertCircle',
  'arrow-left': 'ArrowLeft',
  'circle': 'Circle',
  'menu': 'Menu',
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
  const showToggle = isThemeToggleable(app);
  // AUTO: Redirect from / to first page if first route isn't /
  const defaultPath = routes[0]?.path ?? '/';
  const needsRedirect = defaultPath !== '/';

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
    .map(r => `            <Route path="${r.path}" element={<React.Suspense fallback={<LoadingSpinner />}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  const redirectRoute = needsRedirect
    ? `\n            <Route path="/" element={<Navigate to="${defaultPath}" replace />} />`
    : '';

  // AUTO: ThemeToggle import only when theme mode is 'auto' (toggleable)
  const themeToggleImport = showToggle
    ? `import ThemeToggle from '@/components/ThemeToggle';\n`
    : '';
  const themeToggleButton = showToggle
    ? '              <ThemeToggle />\n'
    : '';

  return `import React, { useEffect, useRef } from 'react';
import { ${routerComponent}, Routes, Route, NavLink${needsRedirect ? ', Navigate' : ''} } from 'react-router-dom';
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
${themeToggleImport}

${pageImports}

${LOADING_SPINNER}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full p-6">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground text-center">The page you're looking for doesn't exist.</p>
      <a href="${defaultPath}" className="text-sm text-primary hover:underline">Go back home</a>
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
${themeToggleButton}              <DropdownMenu>
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
${routeElements}${redirectRoute}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Pages">
${nav.map(n => `              <CommandItem key="${n.href}">${n.label}</CommandItem>`).join('\n')}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </SidebarProvider>
    </${routerComponent}>
  );
}
`;
}

// AUTO: Collect lucide icons needed for top-nav-main shell
function collectTopNavLucideIcons(nav: IRNavItem[]): string[] {
  const icons = new Set<string>();
  for (const item of nav) {
    icons.add(lucideComponent(item.icon));
  }
  icons.add('Bell');
  icons.add('User');
  icons.add('Search');
  icons.add('Menu');
  icons.add('AlertCircle');
  return [...icons].sort();
}

function buildTopNavApp(app: IRAppNode): string {
  const { routes, shell } = app;
  const { nav, brand } = shell.config;
  const routerComponent = app.routing === 'hash' ? 'HashRouter' : 'BrowserRouter';
  const icons = collectTopNavLucideIcons(nav);
  const showToggle = isThemeToggleable(app);
  // AUTO: Redirect from / to first page if first route isn't /
  const defaultPath = routes[0]?.path ?? '/';
  const needsRedirect = defaultPath !== '/';

  // AUTO: ThemeToggle import and button for top-nav shell
  const themeToggleImport = showToggle
    ? `import ThemeToggle from '@/components/ThemeToggle';\n`
    : '';
  const themeToggleButton = showToggle
    ? '              <ThemeToggle />\n'
    : '';

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  // AUTO: NavigationMenu items from essence nav structure
  const navMenuItems = nav
    .map(n => `                <NavigationMenuItem key="${n.href}">
                  <NavigationMenuLink asChild>
                    <NavLink to="${n.href}" className={({ isActive }) => isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}>
                      ${n.label}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>`)
    .join('\n');

  // AUTO: Mobile Sheet nav items
  const mobileNavItems = nav
    .map(n => `              <NavLink
                key="${n.href}"
                to="${n.href}"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => \`flex items-center gap-3 rounded-lg px-3 py-2 text-sm \${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}\`}
              >
                <${lucideComponent(n.icon)} className="h-4 w-4" />
                ${n.label}
              </NavLink>`)
    .join('\n');

  const routeElements = routes
    .map(r => `            <Route path="${r.path}" element={<React.Suspense fallback={<LoadingSpinner />}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  const redirectRoute = needsRedirect
    ? `\n            <Route path="/" element={<Navigate to="${defaultPath}" replace />} />`
    : '';

  return `import React from 'react';
import { ${routerComponent}, Routes, Route, NavLink${needsRedirect ? ', Navigate' : ''} } from 'react-router-dom';
${lucideImportLines(icons)}
import { Button } from '@/components/ui/button';
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
${themeToggleImport}
${pageImports}

${LOADING_SPINNER}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full p-6">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground text-center">The page you're looking for doesn't exist.</p>
      <a href="${defaultPath}" className="text-sm text-primary hover:underline">Go back home</a>
    </div>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <${routerComponent}>
      <div className="flex flex-col min-h-screen">
        {/* AUTO: Sticky top navigation bar */}
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="flex items-center justify-between px-6 h-14">
            {/* Left: mobile hamburger + brand */}
            <div className="flex items-center gap-4">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex flex-col gap-4 pt-4">
                    <span className="text-lg font-semibold px-3">${brand}</span>
                    <nav className="flex flex-col gap-1">
${mobileNavItems}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="text-lg font-semibold">${brand}</span>

              {/* Desktop horizontal navigation */}
              <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
${navMenuItems}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
${themeToggleButton}              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
${routeElements}${redirectRoute}
            <Route path="*" element={<NotFoundPage />} />
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
  // AUTO: Redirect from / to first page if first route isn't /
  const defaultPath = routes[0]?.path ?? '/';
  const needsRedirect = defaultPath !== '/';

  const pageImports = routes
    .map(r => `const ${pascalCase(r.pageId)}Page = React.lazy(() => import('./pages/${r.pageId}.tsx'));`)
    .join('\n');

  const routeElements = routes
    .map(r => `        <Route path="${r.path}" element={<React.Suspense fallback={<LoadingSpinner />}><${pascalCase(r.pageId)}Page /></React.Suspense>} />`)
    .join('\n');

  const redirectRoute = needsRedirect
    ? `\n        <Route path="/" element={<Navigate to="${defaultPath}" replace />} />`
    : '';

  return `import React from 'react';
import { ${routerComponent}, Routes, Route${needsRedirect ? ', Navigate' : ''} } from 'react-router-dom';

${pageImports}

${LOADING_SPINNER}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full p-6">
      <h1 className="text-3xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground text-center">The page you're looking for doesn't exist.</p>
      <a href="${defaultPath}" className="text-sm text-primary hover:underline">Go back home</a>
    </div>
  );
}

export default function App() {
  return (
    <${routerComponent}>
      <div className="flex flex-col h-full">
        <Routes>
${routeElements}${redirectRoute}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </${routerComponent}>
  );
}
`;
}

// AUTO: Wrap shell content with auth when features includes "auth".
// Adds AuthProvider at the top level, a /login route outside the shell,
// and wraps all shell routes in ProtectedRoute.
function wrapWithAuth(content: string): string {
  // 1. Add auth imports after the last existing import line
  const authImports = `import { AuthProvider } from '@/contexts/AuthContext';\n` +
    `import ProtectedRoute from '@/components/ProtectedRoute';\n`;
  const loginPageImport = `const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));\n`;

  // Insert auth imports before the first const (page lazy imports)
  content = content.replace(
    /^(import .+\n)+/m,
    (match) => match + authImports,
  );

  // Insert LoginPage lazy import after the other page lazy imports
  content = content.replace(
    /(const \w+Page = React\.lazy\(.+\);\n)(?!const \w+Page)/,
    (match) => match + loginPageImport,
  );

  // 2. Wrap each route element (except path="*") in ProtectedRoute
  content = content.replace(
    /(<Route path="(?!\*)[^"]*" element=\{)(<React\.Suspense[^}]+\}><\w+Page \/><\/React\.Suspense>)(\} \/>)/g,
    (_, prefix, suspense, suffix) =>
      `${prefix}<ProtectedRoute>${suspense}</ProtectedRoute>${suffix}`,
  );

  // Also wrap Navigate redirect routes in ProtectedRoute
  content = content.replace(
    /(<Route path="\/" element=\{)(<Navigate[^}]+\})(\} \/>)/g,
    (_, prefix, nav, suffix) =>
      `${prefix}<ProtectedRoute>${nav}</ProtectedRoute>${suffix}`,
  );

  // 3. Add login route (NOT protected, NOT in shell) before the catch-all
  const loginRoute = `              <Route path="/login" element={<React.Suspense fallback={<LoadingSpinner />}><LoginPage /></React.Suspense>} />`;
  content = content.replace(
    /(\s*<Route path="\*" element=\{<NotFoundPage \/>\} \/>)/,
    '\n' + loginRoute + '$1',
  );

  // 4. Wrap the Router's children in AuthProvider
  // Find the opening router tag and wrap its children
  content = content.replace(
    /(<(?:BrowserRouter|HashRouter)>)\n/,
    '$1\n      <AuthProvider>\n',
  );
  content = content.replace(
    /(\n\s*<\/(?:BrowserRouter|HashRouter)>)/,
    '\n      </AuthProvider>$1',
  );

  return content;
}

// AUTO: Wrap app content with ThemeProvider for dark/light mode support.
// ThemeProvider wraps inside the Router so useTheme is available to all route components.
function wrapWithTheme(content: string): string {
  // Add ThemeProvider import after the last existing import line
  const themeImport = `import { ThemeProvider } from '@/contexts/ThemeContext';\n`;

  content = content.replace(
    /^(import .+\n)+/m,
    (match) => match + themeImport,
  );

  // Wrap the Router's children in ThemeProvider
  content = content.replace(
    /(<(?:BrowserRouter|HashRouter)>)\n/,
    '$1\n      <ThemeProvider>\n',
  );
  content = content.replace(
    /(\n\s*<\/(?:BrowserRouter|HashRouter)>)/,
    '\n      </ThemeProvider>$1',
  );

  return content;
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

  // AUTO: Wrap with ThemeProvider — always present for theme support
  content = wrapWithTheme(content);

  // AUTO: When auth feature is enabled, wrap with AuthProvider and add login route
  if (hasAuth(app)) {
    content = wrapWithAuth(content);
  }

  return { path: 'src/App.tsx', content };
}
