'use client';

import { useThemeLab } from './theme-lab-provider';

export function ThemeLabBanner() {
  const { activeTheme, setActiveTheme } = useThemeLab();

  if (!activeTheme) return null;

  return (
    <div className="lum-preview-banner">
      <span className="text-sm font-medium">Previewing: {activeTheme.name}</span>
      <button
        className="d-interactive"
        data-variant="ghost"
        onClick={() => setActiveTheme(null)}
        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
      >
        Dismiss
      </button>
    </div>
  );
}
