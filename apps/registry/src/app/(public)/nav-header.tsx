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

  async function handleSignOut() {
    closeMenu();
    setMobileMenuOpen(false);
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <>
      {/* Mobile hamburger — hidden on md+ via inline style to beat d-interactive layer */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="d-interactive rounded-full mobile-menu-btn"
        data-variant="ghost"
        style={{ padding: '0.375rem' }}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div
          className="mobile-menu-drawer"
          style={{
            position: 'fixed',
            top: 52,
            right: 0,
            bottom: 0,
            width: 280,
            zIndex: 20,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            background: 'var(--d-surface)',
            borderLeft: '1px solid var(--d-border)',
          }}
        >
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="d-interactive no-underline"
                data-variant="ghost"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="d-interactive"
                data-variant="ghost"
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--d-error)' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="d-interactive no-underline"
                data-variant="ghost"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                Log in
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="d-interactive no-underline"
                data-variant="primary"
                style={{ width: '100%' }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Desktop auth area — hidden on mobile via inline style */}
      {user ? (
        <div ref={dropdownRef} className="relative desktop-auth">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer border-none transition-transform hover:scale-105"
            aria-label="User menu"
            aria-expanded={menuOpen}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--d-primary)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(user.email?.[0] ?? 'U').toUpperCase()}
          </button>

          {menuOpen && (
            <div
              className="d-surface"
              data-elevation="overlay"
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                width: '12rem',
                padding: '0.25rem 0',
                zIndex: 50,
              }}
            >
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-2 no-underline transition-colors"
                role="menuitem"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--d-text)',
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full text-left transition-colors cursor-pointer bg-transparent border-none"
                role="menuitem"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--d-error)',
                  font: 'inherit',
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="d-interactive no-underline desktop-auth"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="d-interactive no-underline desktop-auth"
            data-variant="primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            Sign up
          </Link>
        </>
      )}

      {/* Media query: hide hamburger on desktop, hide desktop auth on mobile */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu-drawer { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-auth { display: none !important; }
        }
      `}</style>
    </>
  );
}
