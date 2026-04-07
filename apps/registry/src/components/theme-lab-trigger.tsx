'use client';

import { useThemeLab } from './theme-lab-provider';

export function ThemeLabTrigger() {
  const { activeTheme, openDrawer } = useThemeLab();

  return (
    <button
      className="d-interactive"
      data-variant="ghost"
      onClick={openDrawer}
      style={{
        borderRadius: 'var(--d-radius-full)',
        fontSize: '0.8125rem',
        padding: '0.25rem 0.75rem',
        gap: '0.375rem',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M3 3h18v18H3z" />
      </svg>
      <span style={{ color: 'var(--d-text-muted)' }}>
        {activeTheme ? activeTheme.name : 'Luminarum'}
      </span>
    </button>
  );
}
