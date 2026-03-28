'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  user: {
    email: string;
    displayName: string | null;
    username: string | null;
    tier: string | null;
  } | null;
}

const ADMIN_EMAILS = ['davidaimi@gmail.com'];

const dashboardItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/content', label: 'My Content' },
  { href: '/dashboard/api-keys', label: 'API Keys' },
  { href: '/dashboard/team', label: 'Team' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/billing', label: 'Billing' },
];

export function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 top-16 z-40 bg-[var(--bg)]/95 backdrop-blur-md animate-dropdown-in"
        >
          <nav className="flex flex-col px-6 py-8 space-y-1">
            {/* Registry link */}
            <Link
              href="/registry"
              className="flex items-center px-3 py-3 text-lg font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)]"
            >
              Registry
            </Link>

            {user ? (
              <>
                {/* User info */}
                <div className="px-3 py-4 border-b border-[var(--border)] mb-2">
                  <p className="text-sm font-medium text-[var(--fg)]">
                    {user.displayName || user.email.split('@')[0]}
                  </p>
                  {user.username && (
                    <p className="text-xs text-[var(--fg-dim)]">@{user.username}</p>
                  )}
                </div>

                {/* Dashboard items */}
                {dashboardItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-base rounded-[var(--radius-md)] transition-colors ${
                      (item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href))
                        ? 'bg-[var(--primary)]/10 text-[var(--primary-light)] font-medium'
                        : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Admin link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center px-3 py-3 text-base rounded-[var(--radius-md)] transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-[var(--primary)]/10 text-[var(--primary-light)] font-medium'
                        : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    Admin
                  </Link>
                )}

                {/* Sign out */}
                <div className="pt-4 border-t border-[var(--border)] mt-4">
                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center px-3 py-3 text-base text-[var(--fg-muted)] hover:text-[var(--fg)] rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center px-3 py-3 text-lg font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center mt-4 px-4 py-3 rounded-[var(--radius-pill)] bg-[var(--primary)] text-white font-medium text-base hover:bg-[var(--primary-light)] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
