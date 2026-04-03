'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NavHeaderProps {
  user: { id: string; email?: string } | null;
}

export function NavHeader({ user }: NavHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen, closeMenu]);

  // Close mobile menu on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        closeMenu();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMenu]);

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="d-interactive p-1.5 rounded-full sm:hidden"
        data-variant="ghost"
        aria-label="Toggle menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[52px] z-40 bg-d-bg/95 sm:hidden">
          <nav className="flex flex-col gap-1 p-4">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="d-interactive w-full justify-start py-2.5 px-4 text-sm no-underline"
              data-variant="ghost"
            >
              Browse
            </Link>
            <Link
              href="https://docs.decantr.ai"
              onClick={() => setMobileMenuOpen(false)}
              className="d-interactive w-full justify-start py-2.5 px-4 text-sm no-underline"
              data-variant="ghost"
            >
              Docs
            </Link>
            {user ? (
              <>
                <div className="lum-divider my-2" />
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive w-full justify-start py-2.5 px-4 text-sm no-underline"
                  data-variant="ghost"
                >
                  Dashboard
                </Link>
                <Link
                  href="/auth/signout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive w-full justify-start py-2.5 px-4 text-sm no-underline text-d-error"
                  data-variant="ghost"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <div className="lum-divider my-2" />
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive w-full justify-center py-2 px-4 text-sm no-underline"
                  data-variant="primary"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Desktop auth area */}
      {user ? (
        <div ref={dropdownRef} className="relative hidden sm:block">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-d-primary text-white text-xs font-bold flex items-center justify-center cursor-pointer border-none transition-transform hover:scale-105"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {(user.email?.[0] ?? 'U').toUpperCase()}
          </button>

          {menuOpen && (
            <div
              className="d-surface absolute right-0 top-full mt-2 w-48 py-1 z-50"
              data-elevation="overlay"
              role="menu"
            >
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-d-text no-underline hover:bg-d-surface-raised transition-colors"
                role="menuitem"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/signout"
                onClick={closeMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-d-error no-underline hover:bg-d-surface-raised transition-colors"
                role="menuitem"
              >
                Sign Out
              </Link>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="d-interactive py-1.5 px-4 text-sm no-underline hidden sm:inline-flex"
          data-variant="ghost"
        >
          Sign In
        </Link>
      )}
    </>
  );
}
