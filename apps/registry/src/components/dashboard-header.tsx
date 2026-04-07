'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

export function DashboardHeader() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        height: 52,
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--d-border)',
      }}
    >
      <nav className="flex items-center gap-1" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
            <span
              className="text-sm"
              style={{ color: i === breadcrumbs.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)' }}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="d-interactive"
          data-variant="ghost"
          style={{ gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
          <kbd className="text-xs" style={{ opacity: 0.5, fontFamily: 'inherit' }}>&#8984;K</kbd>
        </button>
      </div>
    </header>
  );
}
