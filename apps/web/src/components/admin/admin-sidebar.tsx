'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '\u25CE' },
  { href: '/admin/moderation', label: 'Moderation', icon: '\u2696' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] min-h-[calc(100vh-4rem)]">
      <nav className="p-4 flex flex-col gap-1">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">
            Admin
          </span>
        </div>
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-[var(--primary)]/15 text-[var(--primary-light)] font-medium'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <span className="text-base">&larr;</span>
            Back to Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  );
}
