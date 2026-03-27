'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◎' },
  { href: '/dashboard/content', label: 'My Content', icon: '❖' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: '⚿' },
  { href: '/dashboard/team', label: 'Team', icon: '⊞' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
  { href: '/dashboard/billing', label: 'Billing', icon: '⊡' },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] min-h-[calc(100vh-4rem)]">
      <nav className="p-4 flex flex-col gap-1">
        {navItems.map((item) => (
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
      </nav>
    </aside>
  );
}
