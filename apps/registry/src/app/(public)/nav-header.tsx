'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NavHeaderProps {
  user: { id: string; email?: string } | null;
}

const MOBILE_NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/browse/patterns', label: 'Patterns' },
  { href: '/browse/themes', label: 'Themes' },
  { href: '/browse/blueprints', label: 'Blueprints' },
];

export function NavHeader({ user }: NavHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        closeMenu();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMenu]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    closeMenu();
    setMobileMenuOpen(false);
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        className="d-interactive rounded-full registry-mobile-menu-button"
        data-variant="ghost"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="registry-mobile-menu-overlay"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="registry-mobile-menu-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Registry navigation"
          >
            {MOBILE_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="d-interactive no-underline registry-mobile-menu-link"
                data-variant="ghost"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive no-underline registry-mobile-menu-link"
                  data-variant="ghost"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="d-interactive registry-mobile-menu-link registry-mobile-menu-link-danger"
                  data-variant="ghost"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive no-underline registry-mobile-menu-link"
                  data-variant="ghost"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="d-interactive no-underline registry-mobile-menu-link"
                  data-variant="primary"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </>
      ) : null}

      {user ? (
        <div ref={dropdownRef} className="relative registry-nav-desktop-auth">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="registry-nav-avatar"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {(user.email?.[0] ?? 'U').toUpperCase()}
          </button>

          {menuOpen ? (
            <div
              className="d-surface registry-nav-dropdown"
              data-elevation="overlay"
              role="menu"
            >
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="registry-nav-dropdown-link"
                role="menuitem"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="registry-nav-dropdown-link registry-nav-dropdown-link-danger"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="d-interactive no-underline registry-nav-desktop-auth registry-nav-compact-link"
            data-variant="ghost"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="d-interactive no-underline registry-nav-desktop-auth registry-nav-compact-link"
            data-variant="primary"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );
}
