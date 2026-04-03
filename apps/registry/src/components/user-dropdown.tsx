'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_EMAILS = ['davidaimi@gmail.com'];

interface UserDropdownProps {
  email: string;
  displayName: string | null;
  username: string | null;
  tier: string | null;
}

const dashboardItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/content',
    label: 'My Content',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/api-keys',
    label: 'API Keys',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/team',
    label: 'Team',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
];

export function UserDropdown({ email, displayName, username, tier }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  const name = displayName || email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();
  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) + ' tier' : 'Free tier';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-[var(--radius-pill)] px-2 py-1 transition-colors hover:bg-[var(--bg-elevated)] cursor-pointer"
      >
        {/* Avatar circle */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: 'var(--primary)' }}
        >
          {initial}
        </div>
        {/* Name (hidden on mobile) */}
        <span className="hidden sm:inline text-sm text-[var(--fg-muted)]">
          {name}
        </span>
        {/* Animated chevron */}
        <svg
          className="h-4 w-4 text-[var(--fg-dim)] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg shadow-black/20 animate-dropdown-in z-50"
        >
          {/* User info header */}
          <div className="border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                style={{ background: 'var(--primary)' }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--fg)]">{name}</p>
                {username && (
                  <p className="truncate text-xs text-[var(--fg-dim)]">@{username}</p>
                )}
                <p className="text-xs text-[var(--fg-dim)]">{tierLabel}</p>
              </div>
            </div>
          </div>

          {/* Dashboard nav items */}
          <div className="py-1">
            {dashboardItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--primary)]/10 text-[var(--primary-light)]'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]'
                }`}
              >
                <span className="text-[var(--fg-dim)]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Admin section (conditional) */}
          {isAdmin && (
            <div className="border-t border-[var(--border)] py-1">
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-[var(--primary)]/10 text-[var(--primary-light)]'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]'
                }`}
              >
                <svg className="w-4 h-4 text-[var(--fg-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Admin
              </Link>
            </div>
          )}

          {/* Sign out */}
          <div className="border-t border-[var(--border)] py-1">
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)] cursor-pointer"
              >
                <svg className="w-4 h-4 text-[var(--fg-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
