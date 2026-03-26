import { describe, it, expect } from 'vitest';
import { emitApp } from '../src/emit-app.js';
import { emitAuth, hasAuth } from '../src/emit-auth.js';
import type { IRAppNode, IRShellNode, IRStoreNode } from '@decantr/generator-core';

function makeApp(overrides?: Partial<IRAppNode>): IRAppNode {
  const shell: IRShellNode = {
    type: 'shell',
    id: 'shell',
    children: [],
    config: {
      type: 'sidebar-main',
      brand: 'TestApp',
      nav: [
        { href: '/dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
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
      { path: '/dashboard', pageId: 'dashboard' },
      { path: '/settings', pageId: 'settings' },
    ],
    routing: 'hash',
    shell,
    store,
    features: [],
    ...overrides,
  };
}

describe('hasAuth', () => {
  it('returns true when features includes "auth"', () => {
    expect(hasAuth(makeApp({ features: ['auth'] }))).toBe(true);
  });

  it('returns false when features is empty', () => {
    expect(hasAuth(makeApp())).toBe(false);
  });

  it('returns false when features has other items but not auth', () => {
    expect(hasAuth(makeApp({ features: ['analytics', 'i18n'] }))).toBe(false);
  });
});

describe('emitAuth', () => {
  it('returns empty array when auth not in features', () => {
    const files = emitAuth(makeApp());
    expect(files).toHaveLength(0);
  });

  it('generates AuthContext.tsx when auth in features', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    const authContext = files.find(f => f.path === 'src/contexts/AuthContext.tsx');
    expect(authContext).toBeDefined();
    expect(authContext!.content).toContain('AuthProvider');
    expect(authContext!.content).toContain('useAuth');
    expect(authContext!.content).toContain('isAuthenticated');
    expect(authContext!.content).toContain('login');
    expect(authContext!.content).toContain('logout');
    expect(authContext!.content).toContain('isLoading');
    expect(authContext!.content).toContain('localStorage');
  });

  it('generates LoginPage.tsx with shadcn form components', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    const loginPage = files.find(f => f.path === 'src/pages/LoginPage.tsx');
    expect(loginPage).toBeDefined();
    expect(loginPage!.content).toContain('export default function LoginPage');
    expect(loginPage!.content).toContain("from '@/components/ui/input'");
    expect(loginPage!.content).toContain("from '@/components/ui/label'");
    expect(loginPage!.content).toContain("from '@/components/ui/button'");
    expect(loginPage!.content).toContain("from '@/components/ui/card'");
    expect(loginPage!.content).toContain("from '@/components/ui/checkbox'");
    expect(loginPage!.content).toContain('type="email"');
    expect(loginPage!.content).toContain('type="password"');
    expect(loginPage!.content).toContain('Remember me');
  });

  it('generates ProtectedRoute.tsx with redirect logic', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    const protectedRoute = files.find(f => f.path === 'src/components/ProtectedRoute.tsx');
    expect(protectedRoute).toBeDefined();
    expect(protectedRoute!.content).toContain('export default function ProtectedRoute');
    expect(protectedRoute!.content).toContain('useAuth');
    expect(protectedRoute!.content).toContain('isAuthenticated');
    expect(protectedRoute!.content).toContain('Navigate to="/login"');
    expect(protectedRoute!.content).toContain('isLoading');
    expect(protectedRoute!.content).toContain('LoadingSpinner');
  });

  it('LoginPage uses functional setState', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    const loginPage = files.find(f => f.path === 'src/pages/LoginPage.tsx');
    expect(loginPage!.content).toContain('setForm(prev =>');
  });

  it('AuthContext uses useCallback for login/logout', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    const authContext = files.find(f => f.path === 'src/contexts/AuthContext.tsx');
    expect(authContext!.content).toContain('useCallback');
    expect(authContext!.content).toContain('useMemo');
  });
});

describe('emitApp with auth', () => {
  it('wraps app in AuthProvider when auth enabled', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    expect(result.content).toContain('AuthProvider');
    expect(result.content).toContain("from '@/contexts/AuthContext'");
  });

  it('adds /login route when auth enabled', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    expect(result.content).toContain('path="/login"');
    expect(result.content).toContain('LoginPage');
  });

  it('login route is NOT wrapped in ProtectedRoute', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    // Find the login route line — it should NOT contain ProtectedRoute
    const lines = result.content.split('\n');
    const loginRouteLine = lines.find(l => l.includes('path="/login"'));
    expect(loginRouteLine).toBeDefined();
    expect(loginRouteLine).not.toContain('ProtectedRoute');
  });

  it('other routes ARE wrapped in ProtectedRoute', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    expect(result.content).toContain('ProtectedRoute');
    expect(result.content).toContain("from '@/components/ProtectedRoute'");
    // Dashboard route should be protected
    const lines = result.content.split('\n');
    const dashboardLine = lines.find(l => l.includes('path="/dashboard"'));
    expect(dashboardLine).toContain('ProtectedRoute');
  });

  it('does NOT include auth when features does not include auth', () => {
    const app = makeApp({ features: [] });
    const result = emitApp(app);
    expect(result.content).not.toContain('AuthProvider');
    expect(result.content).not.toContain('ProtectedRoute');
    expect(result.content).not.toContain('LoginPage');
    expect(result.content).not.toContain('path="/login"');
  });

  it('works with top-nav-main shell and auth', () => {
    const app = makeApp({ features: ['auth'] });
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);
    expect(result.content).toContain('AuthProvider');
    expect(result.content).toContain('path="/login"');
    expect(result.content).toContain('ProtectedRoute');
    expect(result.content).not.toContain('SidebarProvider');
  });

  it('works with full-bleed shell and auth', () => {
    const app = makeApp({ features: ['auth'] });
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);
    expect(result.content).toContain('AuthProvider');
    expect(result.content).toContain('path="/login"');
    expect(result.content).toContain('ProtectedRoute');
  });

  it('LoginPage lazy import uses React.lazy', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    expect(result.content).toContain("const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));");
  });

  it('login route has Suspense boundary', () => {
    const app = makeApp({ features: ['auth'] });
    const result = emitApp(app);
    const lines = result.content.split('\n');
    const loginRouteLine = lines.find(l => l.includes('path="/login"'));
    expect(loginRouteLine).toContain('React.Suspense');
    expect(loginRouteLine).toContain('LoadingSpinner');
  });

  it('no barrel imports in auth files', () => {
    const files = emitAuth(makeApp({ features: ['auth'] }));
    for (const file of files) {
      // No barrel import from @/components/ui (must have specific component path)
      expect(file.content).not.toMatch(/from ['"]@\/components\/ui['"]/);
    }
  });
});
