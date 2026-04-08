import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [mode, setMode] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('decantr_theme');
    return (stored === 'light' ? 'light' : 'dark');
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(mode);
    html.style.colorScheme = mode;
    localStorage.setItem('decantr_theme', mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(m => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  return { mode, toggle };
}
