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

function MenuIcon({ size = 16 }: { size?: number }) {
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
      <line x1="4" x2="20" y1="7" y2="7" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="17" y2="17" />
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
      window.dispatchEvent(new CustomEvent('registry:command-palette-toggle'));
    }
  }

  function toggleSidebar() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('registry:sidebar-toggle'));
    }
  }

  return (
    <header className="registry-shell-header">
      <div className="registry-shell-header-main">
        <button
          type="button"
          className="d-interactive registry-shell-mobile-toggle"
          data-variant="ghost"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <MenuIcon size={16} />
        </button>

        <nav className="registry-shell-breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.path} className="registry-shell-breadcrumb-item">
              {i > 0 ? (
                <span className="registry-shell-breadcrumb-separator">/</span>
              ) : null}
              <span
                className="registry-shell-breadcrumb-segment text-sm"
                data-current={i === breadcrumb.length - 1}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="registry-shell-header-actions">
        <ThemeToggle compact />
        <button
          type="button"
          className="d-interactive registry-shell-search-trigger"
          data-variant="ghost"
          onClick={triggerSearch}
        >
          <SearchIcon size={14} />
          <span className="registry-shell-search-label">Search</span>
          <kbd className="registry-shell-search-kbd text-xs">
            &#8984;K
          </kbd>
        </button>
      </div>
    </header>
  );
}
