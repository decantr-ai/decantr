'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
}

export function NavHeader({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <>
      {/* Desktop auth controls */}
      <div className="flex items-center gap-2 desktop-auth">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={handleSignOut}
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              Log in
            </Link>
            <Link
              href="/login?mode=register"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="d-interactive mobile-menu-btn"
        data-variant="ghost"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation menu"
        style={{ display: 'none', padding: '0.375rem' }}
      >
        {menuOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
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
          <Link href="/browse" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Browse</Link>
          <hr style={{ border: 'none', borderTop: '1px solid var(--d-border)', margin: '0.5rem 0' }} />
          {user ? (
            <>
              <Link href="/dashboard" className="d-interactive" data-variant="primary" onClick={() => setMenuOpen(false)} style={{ width: '100%', textDecoration: 'none' }}>Dashboard</Link>
              <button className="d-interactive" data-variant="ghost" onClick={() => { handleSignOut(); setMenuOpen(false); }} style={{ width: '100%' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', textDecoration: 'none' }}>Log in</Link>
              <Link href="/login?mode=register" className="d-interactive" data-variant="primary" onClick={() => setMenuOpen(false)} style={{ width: '100%', textDecoration: 'none' }}>Sign up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
