import { describe, it, expect } from 'vitest';
import { emitTheme, isThemeToggleable } from '../src/emit-theme.js';
import { emitApp } from '../src/emit-app.js';
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
      mode: 'auto',
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

describe('emitTheme', () => {
  it('generates ThemeProvider with useTheme hook', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider).toBeDefined();
    expect(provider!.content).toContain('export function ThemeProvider');
    expect(provider!.content).toContain('export function useTheme');
    expect(provider!.content).toContain('ThemeContext');
  });

  it('ThemeProvider defaults to system when mode is auto', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain("const DEFAULT_THEME: Theme = 'system'");
  });

  it('ThemeProvider defaults to dark when mode is dark', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'dark', shape: null, recipe: 'a', isAddon: false } });
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain("const DEFAULT_THEME: Theme = 'dark'");
  });

  it('ThemeProvider defaults to light when mode is light', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'light', shape: null, recipe: 'a', isAddon: false } });
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain("const DEFAULT_THEME: Theme = 'light'");
  });

  it('generates ThemeToggle with Button + DropdownMenu when mode is auto', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const toggle = files.find(f => f.path === 'src/components/ThemeToggle.tsx');

    expect(toggle).toBeDefined();
    expect(toggle!.content).toContain('DropdownMenu');
    expect(toggle!.content).toContain('DropdownMenuTrigger');
    expect(toggle!.content).toContain('DropdownMenuContent');
    expect(toggle!.content).toContain('DropdownMenuItem');
    expect(toggle!.content).toContain("from '@/components/ui/button'");
    expect(toggle!.content).toContain("from '@/components/ui/dropdown-menu'");
  });

  it('ThemeToggle uses Sun, Moon, Monitor icons from lucide-react barrel', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const toggle = files.find(f => f.path === 'src/components/ThemeToggle.tsx');

    expect(toggle!.content).toContain("from 'lucide-react'");
    expect(toggle!.content).toContain('Sun');
    expect(toggle!.content).toContain('Moon');
    expect(toggle!.content).toContain('Monitor');
    expect(toggle!.content).not.toContain("from 'lucide-react/dist/esm/icons/");
  });

  it('does NOT generate ThemeToggle when mode is fixed (dark)', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'dark', shape: null, recipe: 'a', isAddon: false } });
    const files = emitTheme(app);
    const toggle = files.find(f => f.path === 'src/components/ThemeToggle.tsx');

    expect(toggle).toBeUndefined();
    // Still generates ThemeProvider
    expect(files.find(f => f.path === 'src/contexts/ThemeContext.tsx')).toBeDefined();
  });

  it('does NOT generate ThemeToggle when mode is fixed (light)', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'light', shape: null, recipe: 'a', isAddon: false } });
    const files = emitTheme(app);

    expect(files.find(f => f.path === 'src/components/ThemeToggle.tsx')).toBeUndefined();
    expect(files.find(f => f.path === 'src/contexts/ThemeContext.tsx')).toBeDefined();
  });

  it('ThemeProvider uses localStorage with decantr-theme key', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain("const STORAGE_KEY = 'decantr-theme'");
    expect(provider!.content).toContain('localStorage.getItem(STORAGE_KEY)');
    expect(provider!.content).toContain('localStorage.setItem(STORAGE_KEY');
  });

  it('ThemeProvider listens to prefers-color-scheme for system mode', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain('prefers-color-scheme: dark');
    expect(provider!.content).toContain('addEventListener');
    expect(provider!.content).toContain('removeEventListener');
  });

  it('ThemeProvider applies class on html element', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const provider = files.find(f => f.path === 'src/contexts/ThemeContext.tsx');

    expect(provider!.content).toContain('document.documentElement');
    expect(provider!.content).toContain("classList.remove('light', 'dark')");
    expect(provider!.content).toContain('classList.add(resolvedTheme)');
  });

  it('ThemeToggle has three dropdown options: Light, Dark, System', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const toggle = files.find(f => f.path === 'src/components/ThemeToggle.tsx');

    expect(toggle!.content).toContain("setTheme('light')");
    expect(toggle!.content).toContain("setTheme('dark')");
    expect(toggle!.content).toContain("setTheme('system')");
    expect(toggle!.content).toContain('Light');
    expect(toggle!.content).toContain('Dark');
    expect(toggle!.content).toContain('System');
  });

  it('ThemeToggle uses ghost variant and icon size', () => {
    const app = makeApp();
    const files = emitTheme(app);
    const toggle = files.find(f => f.path === 'src/components/ThemeToggle.tsx');

    expect(toggle!.content).toContain('variant="ghost"');
    expect(toggle!.content).toContain('size="icon"');
  });
});

describe('isThemeToggleable', () => {
  it('returns true when mode is auto', () => {
    const app = makeApp();
    expect(isThemeToggleable(app)).toBe(true);
  });

  it('returns false when mode is dark', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'dark', shape: null, recipe: 'a', isAddon: false } });
    expect(isThemeToggleable(app)).toBe(false);
  });

  it('returns false when mode is light', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'light', shape: null, recipe: 'a', isAddon: false } });
    expect(isThemeToggleable(app)).toBe(false);
  });
});

describe('emitApp with theme', () => {
  it('App.tsx wraps in ThemeProvider', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("from '@/contexts/ThemeContext'");
    expect(result.content).toContain('<ThemeProvider>');
    expect(result.content).toContain('</ThemeProvider>');
  });

  it('sidebar shell includes ThemeToggle when mode is auto', () => {
    const app = makeApp();
    const result = emitApp(app);

    expect(result.content).toContain("import ThemeToggle from '@/components/ThemeToggle'");
    expect(result.content).toContain('<ThemeToggle />');
  });

  it('sidebar shell excludes ThemeToggle when mode is fixed', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'dark', shape: null, recipe: 'a', isAddon: false } });
    const result = emitApp(app);

    expect(result.content).not.toContain('ThemeToggle');
    // ThemeProvider should still be present
    expect(result.content).toContain('<ThemeProvider>');
  });

  it('top-nav shell includes ThemeToggle when mode is auto', () => {
    const app = makeApp();
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).toContain("import ThemeToggle from '@/components/ThemeToggle'");
    expect(result.content).toContain('<ThemeToggle />');
  });

  it('top-nav shell excludes ThemeToggle when mode is fixed', () => {
    const app = makeApp({ theme: { style: 'a', mode: 'light', shape: null, recipe: 'a', isAddon: false } });
    app.shell.config.type = 'top-nav-main';
    const result = emitApp(app);

    expect(result.content).not.toContain('ThemeToggle');
    expect(result.content).toContain('<ThemeProvider>');
  });

  it('full-bleed shell wraps in ThemeProvider but no toggle', () => {
    const app = makeApp();
    app.shell.config.type = 'full-bleed';
    const result = emitApp(app);

    expect(result.content).toContain('<ThemeProvider>');
    // Full-bleed has no header, so no toggle regardless of mode
    expect(result.content).not.toContain('ThemeToggle');
  });
});
