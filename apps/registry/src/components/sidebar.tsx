'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ── Inline SVG Icons (16x16, Lucide-style) ── */

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Icon map ── */

const ICON_MAP: Record<string, () => React.JSX.Element> = {
  home: IconHome,
  package: IconPackage,
  key: IconKey,
  settings: IconSettings,
  'credit-card': IconCreditCard,
  users: IconUsers,
};

/* ── Types ── */

export interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  user: { email: string; displayName?: string | null };
  items: NavItem[];
  brandHref?: string;
  collapsed?: boolean;
}

/* ── Component ── */

export function Sidebar({
  user,
  items,
  brandHref = '/dashboard',
  collapsed: initialCollapsed = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  const initials = (user.displayName || user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  return (
    <aside
      className="flex flex-col border-r border-d-border bg-d-surface shrink-0 transition-[width] duration-200"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Brand area */}
      <div className="flex items-center h-[52px] border-b border-d-border px-4 gap-2">
        <Link
          href={brandHref}
          className="flex items-center gap-2 text-d-text no-underline min-w-0"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="var(--d-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">Decantr</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="d-interactive ml-auto shrink-0 p-1 rounded"
          data-variant="ghost"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const Icon = ICON_MAP[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`d-interactive flex items-center gap-2.5 rounded-md py-1.5 text-sm no-underline transition-colors ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${
                isActive
                  ? 'bg-d-surface-raised text-d-primary font-medium'
                  : 'text-d-muted'
              }`}
              data-variant="ghost"
              title={collapsed ? item.label : undefined}
            >
              {Icon && <Icon />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-d-border p-2 mt-auto">
        <div
          className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-1'}`}
        >
          <div className="shrink-0 w-8 h-8 rounded-full bg-d-primary/15 text-d-primary flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              {user.displayName && (
                <p className="text-xs font-medium text-d-text truncate">
                  {user.displayName}
                </p>
              )}
              <p className="text-xs text-d-muted truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
