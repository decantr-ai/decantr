# Mobile Responsive Implementation Plan

**Date:** 2026-03-28
**Scope:** Replace dashboard/admin sidebars with header dropdown menu, mobile hamburger menu, make all pages fully responsive

---

## Overview

The Decantr web app currently uses a fixed sidebar for dashboard and admin navigation. This plan replaces both sidebars with a user dropdown menu in the header nav, adds a mobile hamburger menu for small screens, and makes every page fully responsive. The dropdown menu consolidates all dashboard navigation links (Overview, My Content, API Keys, Team, Settings, Billing) and admin links into a single click-accessible menu anchored to the user's avatar in the top-right nav.

### Files created

| File | Purpose |
|------|---------|
| `apps/web/src/components/user-dropdown.tsx` | Avatar + name + chevron button with animated dropdown menu |
| `apps/web/src/components/mobile-menu.tsx` | Full-screen mobile overlay menu with hamburger toggle |

### Files modified

| File | Change |
|------|--------|
| `apps/web/src/components/nav.tsx` | Replace inline user links with `UserDropdown`, add mobile hamburger |
| `apps/web/src/app/layout.tsx` | Pass additional user metadata (username, tier) to Nav |
| `apps/web/src/app/dashboard/layout.tsx` | Remove sidebar, full-width layout |
| `apps/web/src/app/admin/layout.tsx` | Remove sidebar, full-width layout |
| `apps/web/src/components/registry/search-filter-bar.tsx` | Responsive stacking for mobile |
| `apps/web/src/components/dashboard/api-key-list.tsx` | Responsive card layout on mobile |
| `apps/web/src/components/dashboard/team-member-list.tsx` | Responsive card layout on mobile |
| `apps/web/src/components/dashboard/create-api-key-form.tsx` | Responsive stacking |
| `apps/web/src/components/dashboard/invite-member-form.tsx` | Responsive stacking |
| `apps/web/src/app/page.tsx` | Mobile responsive hero, features, pricing, code blocks |
| `apps/web/src/app/dashboard/content/page.tsx` | Responsive table with horizontal scroll |
| `apps/web/src/components/footer.tsx` | Mobile responsive grid |
| `apps/web/src/app/globals.css` | Add dropdown animation keyframes |

### Files deleted

| File | Reason |
|------|--------|
| `apps/web/src/components/dashboard/sidebar.tsx` | Replaced by header dropdown |
| `apps/web/src/components/admin/admin-sidebar.tsx` | Replaced by header dropdown |

---

## Task 1: Create the UserDropdown component

**File (new):** `apps/web/src/components/user-dropdown.tsx`

This is a client component that renders an avatar circle (first letter of display name), the display name, and an animated chevron. Clicking toggles a dropdown menu positioned below and right-aligned. Clicking outside closes it. The dropdown contains links to all dashboard pages, conditionally shows an Admin section, and has a Sign Out action.

```tsx
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
```

**Sign out note:** The sign out button submits a form to `/auth/signout`. If this route does not exist yet, it will need to be created as a route handler that calls `supabase.auth.signOut()` and redirects to `/`. Alternatively, change this to use the existing `signOut` server action from `apps/web/src/app/dashboard/settings/actions.ts` by wrapping it in a client-side form action. The simplest approach is to make sign out a link to `/dashboard/settings` where the existing Sign Out button lives, but the dropdown approach is better UX. The implementation should check which sign-out mechanism is already available and wire it in.

**Commit message:** `feat(web): add UserDropdown component with avatar, animated chevron, and dashboard nav`

---

## Task 2: Create the MobileMenu component

**File (new):** `apps/web/src/components/mobile-menu.tsx`

A full-screen overlay menu for mobile (< 768px). Triggered by a hamburger icon. Contains: Registry link, and if logged in, all dashboard nav items plus sign out.

```tsx
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
          {/* X icon */}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          {/* Hamburger icon */}
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
```

**JSX note:** The ternary expressions inside the hamburger button use inline JSX comments to label the icons. If the linter complains about the `{/* X icon */}` syntax inside ternaries, wrap each branch in a fragment: `<>{/* X icon */}<svg ...></svg></>`.

**Commit message:** `feat(web): add MobileMenu component with full-screen overlay`

---

## Task 3: Update globals.css with dropdown animation

**File:** `apps/web/src/app/globals.css`

Append the dropdown animation keyframe at the end of the file:

```css
/* Dropdown & mobile menu animation */
@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-dropdown-in {
  animation: dropdown-in 0.15s ease-out;
}
```

**Commit message:** `style(web): add dropdown animation keyframes to globals.css`

---

## Task 4: Update Nav to use UserDropdown and MobileMenu

**File:** `apps/web/src/components/nav.tsx`

Replace the entire file. The nav now:
- Shows "Decantr" logo on the left and "Registry" link (hidden on mobile via `hidden md:inline`)
- On the right: if logged in, shows `UserDropdown`; if not, shows Sign In and Get Started buttons (hidden on mobile)
- Adds `MobileMenu` component for mobile breakpoints
- The Nav becomes a server component that passes user data down; `UserDropdown` and `MobileMenu` are client components

```tsx
import Link from 'next/link';
import { Button } from './ui/button';
import { UserDropdown } from './user-dropdown';
import { MobileMenu } from './mobile-menu';

interface NavUser {
  email: string;
  display_name?: string | null;
  username?: string | null;
  tier?: string | null;
}

export function Nav({ user }: { user?: NavUser | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-[var(--fg)]">
            Decantr
          </Link>
          <Link
            href="/registry"
            className="hidden md:inline text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm"
          >
            Registry
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:block">
                <UserDropdown
                  email={user.email}
                  displayName={user.display_name ?? null}
                  username={user.username ?? null}
                  tier={user.tier ?? null}
                />
              </div>
              <MobileMenu
                user={{
                  email: user.email,
                  displayName: user.display_name ?? null,
                  username: user.username ?? null,
                  tier: user.tier ?? null,
                }}
              />
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
              <MobileMenu user={null} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key changes from current nav.tsx:**
- Removed the `ADMIN_EMAILS` constant and `isAdmin` function (moved to `UserDropdown`)
- Removed inline Dashboard, Admin, and user name links (all in dropdown now)
- Added `hidden md:inline` to the Registry link (mobile gets it via hamburger)
- Changed container padding from `px-6` to `px-4 md:px-6` for mobile
- The `UserDropdown` is wrapped in `hidden md:block` so it only shows on desktop
- The `MobileMenu` handles its own `md:hidden` visibility

**Commit message:** `feat(web): update Nav to use UserDropdown and MobileMenu`

---

## Task 5: Update root layout to pass additional user metadata

**File:** `apps/web/src/app/layout.tsx`

The current root layout passes `email` and `display_name` to Nav. We need to also pass `username` and `tier`. Since these come from the Decantr API (not Supabase auth), we need to fetch them. However, to keep the layout fast and avoid blocking on API calls, we will extract username from `user_metadata` if available, and default tier to `'free'`.

Replace the Nav invocation in the return block. The full file becomes:

```tsx
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decantr -- Design Intelligence for AI-Generated UI',
  description: 'OpenAPI for AI-generated UI. A structured schema and design intelligence layer that makes AI coding assistants generate better, more consistent web applications.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Auth check failed, continue without user
  }

  const navUser = user
    ? {
        email: user.email ?? '',
        display_name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.user_name ||
          null,
        username: user.user_metadata?.user_name || null,
        tier: null as string | null, // Will show "Free tier" by default in dropdown
      }
    : null;

  return (
    <html lang="en" className="dark">
      <body>
        <Nav user={navUser} />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
```

**Note:** The `tier` is set to `null` here because fetching from the API in the root layout would add latency to every page load. The UserDropdown defaults to "Free tier" when tier is null. If a more accurate tier display is needed, a future enhancement can fetch it client-side within the dropdown or cache it in a cookie.

**Commit message:** `feat(web): pass username and tier to Nav from root layout`

---

## Task 6: Remove sidebars and update dashboard + admin layouts

### 6a. Update dashboard layout

**File:** `apps/web/src/app/dashboard/layout.tsx`

Replace the entire file:

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unavailable, treat as unauthenticated
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">
      {children}
    </main>
  );
}
```

**Changes:**
- Removed `Sidebar` import and component
- Removed the `flex` container wrapper
- Changed from `<main className="flex-1 p-8">` to `<main className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">` for responsive padding

### 6b. Update admin layout

**File:** `apps/web/src/app/admin/layout.tsx`

Replace the entire file:

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unavailable
  }

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user.email)) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">
      {children}
    </main>
  );
}
```

**Changes:**
- Removed `AdminSidebar` import and component
- Removed the `flex` container wrapper
- Changed to responsive padding matching dashboard layout

### 6c. Delete sidebar files

Delete these files:

- `apps/web/src/components/dashboard/sidebar.tsx`
- `apps/web/src/components/admin/admin-sidebar.tsx`

**Commit message:** `refactor(web): remove sidebars, make dashboard and admin layouts full-width`

---

## Task 7: Make the landing page responsive

**File:** `apps/web/src/app/page.tsx`

The landing page already uses some responsive classes (`md:text-7xl`, `sm:flex-row`, `md:grid-cols-2`, etc.) but needs additional mobile adjustments. Apply these targeted changes:

### 7a. Hero section padding

Find:
```tsx
<div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
```

Replace with:
```tsx
<div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
```

### 7b. MCP config preview -- ensure horizontal scroll on mobile

Find:
```tsx
<div className="mt-16 max-w-xl mx-auto text-left">
```

Replace with:
```tsx
<div className="mt-10 md:mt-16 max-w-xl mx-auto text-left">
```

### 7c. All section containers and dividers -- mobile padding

Find every instance of `px-6` inside section containers and dividers:

```tsx
<section className="py-24 max-w-7xl mx-auto px-6">
```

Replace with:
```tsx
<section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6">
```

Apply the same `px-4 md:px-6` pattern to:
- All `<section>` containers
- All divider `<div>` containers (`<div className="flex items-center justify-center max-w-7xl mx-auto px-6">`)
- The "How it works" section (`max-w-5xl mx-auto px-6`)
- The "Set up in 30 seconds" section (`max-w-3xl mx-auto px-6`)
- The bottom CTA section (`max-w-3xl mx-auto px-6`)

Also reduce vertical padding on mobile: change `py-24` to `py-16 md:py-24` on all sections.

### 7d. Code block containers

The `<pre>` elements already have `overflow-x-auto` which handles horizontal scroll. No further changes needed.

### 7e. Feature cards title size

The heading `text-3xl md:text-4xl` is already responsive. No change needed.

**Commit message:** `style(web): make landing page responsive with mobile-friendly padding and spacing`

---

## Task 8: Make registry and content detail pages responsive

### 8a. Registry page container

**File:** `apps/web/src/app/registry/page.tsx`

Find:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
```

Replace with:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-4 md:px-6 py-8 md:py-12">
```

### 8b. Search filter bar -- stack on mobile

**File:** `apps/web/src/components/registry/search-filter-bar.tsx`

Find the form element:
```tsx
<form onSubmit={handleSearch} className="flex gap-2">
```

Replace with:
```tsx
<form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
```

The filter pills already use `flex-wrap` so they handle mobile well. No change needed there.

### 8c. Content grid -- already responsive

**File:** `apps/web/src/components/registry/content-grid.tsx`

The grid already uses `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` which collapses to single column on mobile. No change needed.

### 8d. Pagination -- compact on mobile

**File:** `apps/web/src/components/registry/pagination.tsx`

Find:
```tsx
<div className="flex items-center justify-center gap-4 pt-8">
```

Replace with:
```tsx
<div className="flex items-center justify-center gap-2 sm:gap-4 pt-8">
```

Find:
```tsx
<span className="text-sm text-[var(--fg-muted)]">
  Page {currentPage} of {totalPages}
</span>
```

Replace with:
```tsx
<span className="text-xs sm:text-sm text-[var(--fg-muted)]">
  {currentPage}/{totalPages}
</span>
```

### 8e. Content detail page

**File:** `apps/web/src/app/registry/[type]/[namespace]/[slug]/page.tsx`

Find:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
```

Replace with:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-4 md:px-6 py-8 md:py-12">
```

The JSON viewer already has `overflow-x-auto` for horizontal scroll. The badge flex-wrap and button groups also work on mobile. No other changes needed.

**Commit message:** `style(web): make registry pages responsive with stacking filters and compact pagination`

---

## Task 9: Make dashboard pages responsive

### 9a. Dashboard overview

**File:** `apps/web/src/app/dashboard/page.tsx`

The stat grid already uses `grid-cols-1 sm:grid-cols-3`. The quick actions use `flex-wrap`. The `max-w-4xl` constraint works well. No changes needed.

### 9b. My Content page -- horizontal scroll table

**File:** `apps/web/src/app/dashboard/content/page.tsx`

Find:
```tsx
<div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
  <table className="w-full">
```

Replace with:
```tsx
<div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-x-auto">
  <table className="w-full min-w-[640px]">
```

This ensures the table scrolls horizontally on mobile rather than breaking layout. The `min-w-[640px]` prevents columns from getting too narrow.

### 9c. API key list -- responsive layout

**File:** `apps/web/src/components/dashboard/api-key-list.tsx`

Find:
```tsx
<div
  key={key.id}
  className={`flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 ${key.revoked_at ? 'opacity-50' : ''}`}
>
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium">{key.name}</span>
    <div className="flex gap-1">
      {key.scopes.map((scope) => (
        <Badge key={scope} variant="default">{scope}</Badge>
      ))}
    </div>
    {key.revoked_at && <Badge variant="error">Revoked</Badge>}
  </div>
  <div className="flex items-center gap-4">
    <span className="text-xs text-[var(--fg-muted)]">
      {key.last_used_at
        ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
        : 'Never used'}
    </span>
    <span className="text-xs text-[var(--fg-dim)]">
      Created {new Date(key.created_at).toLocaleDateString()}
    </span>
    {!key.revoked_at && (
      <Button
        variant="danger"
        size="sm"
        disabled={revokingId === key.id}
        onClick={() => handleRevoke(key.id)}
      >
        {revokingId === key.id ? 'Revoking...' : 'Revoke'}
      </Button>
    )}
  </div>
</div>
```

Replace with:
```tsx
<div
  key={key.id}
  className={`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 ${key.revoked_at ? 'opacity-50' : ''}`}
>
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <span className="text-sm font-medium">{key.name}</span>
    <div className="flex gap-1">
      {key.scopes.map((scope) => (
        <Badge key={scope} variant="default">{scope}</Badge>
      ))}
    </div>
    {key.revoked_at && <Badge variant="error">Revoked</Badge>}
  </div>
  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
    <span className="text-xs text-[var(--fg-muted)]">
      {key.last_used_at
        ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
        : 'Never used'}
    </span>
    <span className="text-xs text-[var(--fg-dim)]">
      Created {new Date(key.created_at).toLocaleDateString()}
    </span>
    {!key.revoked_at && (
      <Button
        variant="danger"
        size="sm"
        disabled={revokingId === key.id}
        onClick={() => handleRevoke(key.id)}
      >
        {revokingId === key.id ? 'Revoking...' : 'Revoke'}
      </Button>
    )}
  </div>
</div>
```

**Changes:** Removed `flex items-center justify-between` from the outer div (was causing overflow on mobile). Split into two rows with `flex-wrap` on both. Added `mt-2` between name row and metadata row.

### 9d. Team member list -- responsive layout

**File:** `apps/web/src/components/dashboard/team-member-list.tsx`

Find:
```tsx
<div
  key={member.user_id}
  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
>
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium">{member.email}</span>
    <Badge variant={roleVariant[member.role] || 'default'}>{member.role}</Badge>
  </div>
  <div className="flex items-center gap-3">
```

Replace with:
```tsx
<div
  key={member.user_id}
  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
>
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <span className="text-sm font-medium">{member.email}</span>
    <Badge variant={roleVariant[member.role] || 'default'}>{member.role}</Badge>
  </div>
  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
```

Same pattern as api-key-list: stack vertically on narrow screens.

### 9e. Create API key form

**File:** `apps/web/src/components/dashboard/create-api-key-form.tsx`

Find:
```tsx
<form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
```

Already uses `flex-wrap` so it stacks on mobile. No change needed.

### 9f. Invite member form

**File:** `apps/web/src/components/dashboard/invite-member-form.tsx`

Already uses `flex-wrap`. No change needed.

### 9g. Billing page

**File:** `apps/web/src/app/dashboard/billing/page.tsx`

The grid already uses `md:grid-cols-2`. No change needed.

### 9h. New content page

**File:** `apps/web/src/app/dashboard/content/new/page.tsx`

Already uses `max-w-2xl` and standard form elements. No change needed.

### 9i. Settings page

**File:** `apps/web/src/app/dashboard/settings/page.tsx`

Already uses `max-w-2xl` and `max-w-sm` for forms. No change needed.

**Commit message:** `style(web): make dashboard pages responsive with scroll tables and wrapping lists`

---

## Task 10: Make profile, footer, and remaining pages responsive

### 10a. Profile page

**File:** `apps/web/src/app/profile/[username]/page.tsx`

Find:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
```

Replace with:
```tsx
<section className="mx-auto max-w-[var(--max-w)] px-4 md:px-6 py-8 md:py-12">
```

The content counts already use `flex flex-wrap gap-3` and the content grid uses `sm:grid-cols-2 lg:grid-cols-3`. No other changes needed.

### 10b. Footer

**File:** `apps/web/src/components/footer.tsx`

The footer grid already uses `grid-cols-1 md:grid-cols-4`. Change container padding:

Find:
```tsx
<div className="max-w-7xl mx-auto px-6">
```

Replace with:
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
```

### 10c. Terms page

**File:** `apps/web/src/app/terms/page.tsx`

Find:
```tsx
<div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg)' }}>
```

Replace with:
```tsx
<div className="min-h-screen py-12 md:py-16 px-4 md:px-6" style={{ background: 'var(--bg)' }}>
```

### 10d. Privacy page

**File:** `apps/web/src/app/privacy/page.tsx`

Same change as terms:

Find:
```tsx
<div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg)' }}>
```

Replace with:
```tsx
<div className="min-h-screen py-12 md:py-16 px-4 md:px-6" style={{ background: 'var(--bg)' }}>
```

### 10e. Login page

**File:** `apps/web/src/app/login/page.tsx`

Already uses `min-h-screen flex items-center justify-center px-4` and `w-full max-w-md`. Fully responsive. No changes needed.

### 10f. Admin pages

**Files:**
- `apps/web/src/app/admin/page.tsx` -- uses `max-w-4xl`, `grid-cols-1 sm:grid-cols-3`, `flex-wrap`. Already responsive.
- `apps/web/src/app/admin/moderation/page.tsx` -- uses `max-w-5xl`, `flex-wrap` for buttons. Already responsive.
- `apps/web/src/components/admin/moderation-item.tsx` -- uses `flex-wrap`, `min-w-0 flex-1`. Already responsive.

No changes needed for admin pages.

**Commit message:** `style(web): make profile, footer, terms, and privacy pages responsive`

---

## Task 11: Build, test, and verify

### 11a. Build verification

```bash
cd apps/web && pnpm build
```

Fix any TypeScript or build errors that surface.

### 11b. Manual testing checklist

Test each page at three breakpoints: desktop (1280px), tablet (768px), mobile (375px).

**Nav/dropdown (all pages):**
- [ ] Desktop: Logo, Registry link, UserDropdown visible
- [ ] Desktop: Click avatar opens dropdown with all items, chevron rotates
- [ ] Desktop: Click outside closes dropdown
- [ ] Desktop: Route change closes dropdown
- [ ] Mobile: Logo and hamburger visible, no Registry link, no UserDropdown
- [ ] Mobile: Hamburger opens full-screen overlay with all nav items
- [ ] Mobile: Sign out works from both dropdown and mobile menu
- [ ] Logged out: Desktop shows Sign In + Get Started buttons
- [ ] Logged out: Mobile hamburger shows Registry, Sign In, Get Started

**Landing page:**
- [ ] Mobile: Hero text stacks, buttons stack, padding reduced
- [ ] Mobile: Feature cards single column
- [ ] Mobile: Pricing cards single column
- [ ] Mobile: Code blocks scroll horizontally
- [ ] Mobile: "How it works" steps stack vertically

**Registry:**
- [ ] Mobile: Search bar and button stack vertically
- [ ] Mobile: Content grid single column
- [ ] Mobile: Filter pills wrap naturally
- [ ] Mobile: Pagination compact

**Content detail:**
- [ ] Mobile: Full width, badges wrap, JSON viewer scrolls horizontally

**Dashboard:**
- [ ] No sidebar on any dashboard page
- [ ] Mobile: Stat cards stack
- [ ] Mobile: Content table scrolls horizontally
- [ ] Mobile: API key cards stack metadata below name
- [ ] Mobile: Team member cards stack metadata below email
- [ ] Mobile: Forms full width

**Admin:**
- [ ] No sidebar
- [ ] Mobile: Stat cards stack
- [ ] Mobile: Moderation items wrap properly

**Profile:**
- [ ] Mobile: Content counts wrap, grid single column

**Terms/Privacy:**
- [ ] Mobile: Reduced padding, text readable

**Login:**
- [ ] Already works on mobile

### 11c. Final commit

If all checks pass and build succeeds:

**Commit message:** `build(web): verify mobile responsive build`

---

## Summary of all commits

| # | Message |
|---|---------|
| 1 | `feat(web): add UserDropdown component with avatar, animated chevron, and dashboard nav` |
| 2 | `feat(web): add MobileMenu component with full-screen overlay` |
| 3 | `style(web): add dropdown animation keyframes to globals.css` |
| 4 | `feat(web): update Nav to use UserDropdown and MobileMenu` |
| 5 | `feat(web): pass username and tier to Nav from root layout` |
| 6 | `refactor(web): remove sidebars, make dashboard and admin layouts full-width` |
| 7 | `style(web): make landing page responsive with mobile-friendly padding and spacing` |
| 8 | `style(web): make registry pages responsive with stacking filters and compact pagination` |
| 9 | `style(web): make dashboard pages responsive with scroll tables and wrapping lists` |
| 10 | `style(web): make profile, footer, terms, and privacy pages responsive` |
| 11 | `build(web): verify mobile responsive build` |

These can be squashed into a single commit if preferred: `feat(web): replace sidebars with header dropdown, make all pages mobile responsive`
