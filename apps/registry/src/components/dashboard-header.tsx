'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function toLabel(seg: string): string {
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: toLabel(seg),
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  function triggerSearch() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true })
      );
    }
  }

  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        height: 52,
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--d-border)',
      }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1" aria-label="Breadcrumb">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && (
              <span style={{ color: 'var(--d-text-muted)' }}>/</span>
            )}
            <span
              className="text-sm"
              style={{
                color:
                  i === breadcrumb.length - 1
                    ? 'var(--d-text)'
                    : 'var(--d-text-muted)',
              }}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side: theme toggle + search */}
      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          onClick={triggerSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--d-text-muted)',
          }}
        >
          <SearchIcon size={14} />
          <span>Search</span>
          <kbd
            className="text-xs"
            style={{ opacity: 0.5, fontFamily: 'inherit' }}
          >
            &#8984;K
          </kbd>
        </button>
      </div>
    </header>
  );
}
