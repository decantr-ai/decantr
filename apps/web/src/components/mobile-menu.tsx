'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Need to wait for mount to use createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const overlay = open && mounted ? createPortal(
    <div className="fixed inset-0 top-16 z-[9999] overflow-y-auto bg-[#0D0D1A]">
      <nav className="flex flex-col px-6 py-8 space-y-1">
        <Link
          href="/registry"
          onClick={() => setOpen(false)}
          className="flex items-center px-3 py-3 text-lg font-medium text-[#9898A8] hover:text-[#FAFAFA] transition-colors rounded-xl hover:bg-[#1A1A36]"
        >
          Registry
        </Link>

        {user ? (
          <>
            <div className="px-3 py-4 border-b border-[#ffffff14] mb-2">
              <p className="text-sm font-medium text-[#FAFAFA]">
                {user.displayName || user.email.split('@')[0]}
              </p>
              {user.username && (
                <p className="text-xs text-[#6B6B80]">@{user.username}</p>
              )}
            </div>

            {dashboardItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-3 text-base rounded-xl transition-colors ${
                  (item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href))
                    ? 'bg-[#FE447419] text-[#FF6B91] font-medium'
                    : 'text-[#9898A8] hover:text-[#FAFAFA] hover:bg-[#1A1A36]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="border-t border-[#ffffff14] my-2" />
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 text-base rounded-xl transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-[#FE447419] text-[#FF6B91] font-medium'
                      : 'text-[#9898A8] hover:text-[#FAFAFA] hover:bg-[#1A1A36]'
                  }`}
                >
                  Admin
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-[#ffffff14] mt-4">
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center px-3 py-3 text-base text-[#9898A8] hover:text-[#FAFAFA] rounded-xl hover:bg-[#1A1A36] transition-colors cursor-pointer"
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
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-3 text-lg font-medium text-[#9898A8] hover:text-[#FAFAFA] transition-colors rounded-xl hover:bg-[#1A1A36]"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center mt-4 px-4 py-3 rounded-full bg-[#FE4474] text-white font-medium text-base hover:bg-[#FF6B91] transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </nav>
    </div>,
    document.body
  ) : null;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#FAFAFA] hover:bg-[#1A1A36] transition-colors cursor-pointer"
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
      {overlay}
    </div>
  );
}
