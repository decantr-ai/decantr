'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ThemePreview {
  name: string;
  tokens: Record<string, string>;
}

interface ThemeLabCtx {
  activeTheme: ThemePreview | null;
  setActiveTheme: (theme: ThemePreview | null) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const ThemeLabContext = createContext<ThemeLabCtx>({
  activeTheme: null,
  setActiveTheme: () => {},
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function useThemeLab() {
  return useContext(ThemeLabContext);
}

export function ThemeLabProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemePreview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <ThemeLabContext.Provider value={{ activeTheme, setActiveTheme, drawerOpen, openDrawer, closeDrawer }}>
      {children}
      {activeTheme && (
        <style>{`
          :root {
            ${Object.entries(activeTheme.tokens).map(([k, v]) => `${k}: ${v};`).join('\n            ')}
          }
        `}</style>
      )}
    </ThemeLabContext.Provider>
  );
}
