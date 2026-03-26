import type { IRAppNode, GeneratedFile } from '@decantr/generator-core';

// AUTO: Theme mode detection — 'auto' means user can toggle, fixed means locked
export function isThemeToggleable(app: IRAppNode): boolean {
  return app.theme.mode === 'auto';
}

/** Emit src/contexts/ThemeContext.tsx — manages light/dark/system theme state */
function emitThemeProvider(app: IRAppNode): GeneratedFile {
  // AUTO: When mode is fixed ('light' or 'dark'), default to that mode.
  // When mode is 'auto', default to 'system' so it follows OS preference.
  const defaultTheme = app.theme.mode === 'auto' ? 'system' : app.theme.mode;

  const content = `import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// AUTO: Theme type — 'system' defers to OS prefers-color-scheme
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = 'decantr-theme';
const DEFAULT_THEME: Theme = '${defaultTheme}';

const ThemeContext = createContext<ThemeContextValue | null>(null);

// AUTO: Resolve 'system' to actual light/dark based on OS preference
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // AUTO: Ignore storage errors (SSR, private browsing)
  }
  return DEFAULT_THEME;
}

// AUTO: Module-level default props hoisted outside component (Vercel best practice)
const DEFAULT_CHILDREN: React.ReactNode = null;

export function ThemeProvider({ children = DEFAULT_CHILDREN }: { children?: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // AUTO: Listen for OS theme changes when mode is 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // AUTO: Apply dark class to <html> element (Tailwind dark mode convention)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // AUTO: Ignore storage errors
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    resolvedTheme,
  }), [theme, setTheme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
`;

  return { path: 'src/contexts/ThemeContext.tsx', content };
}

/** Emit src/components/ThemeToggle.tsx — dropdown with Light/Dark/System options */
function emitThemeToggle(): GeneratedFile {
  const content = `import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

// AUTO: Icon map hoisted to module level (Vercel best practice — no inline objects)
const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;

  return { path: 'src/components/ThemeToggle.tsx', content };
}

/** Emit theme files — always emits ThemeProvider, only emits toggle when mode is 'auto' */
export function emitTheme(app: IRAppNode): GeneratedFile[] {
  const files: GeneratedFile[] = [emitThemeProvider(app)];

  if (isThemeToggleable(app)) {
    files.push(emitThemeToggle());
  }

  return files;
}
