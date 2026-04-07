'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  isAdmin?: boolean;
}

const DASHBOARD_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/dashboard/content', label: 'Content', icon: 'package' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: 'key' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
  { href: '/dashboard/billing', label: 'Billing', icon: 'credit-card' },
  { href: '/dashboard/team', label: 'Team', icon: 'users' },
];

const ADMIN_ITEMS = [
  { href: '/admin/moderation', label: 'Moderation', icon: 'shield' },
];

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'dashboard': return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
    case 'package': return <svg {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    case 'key': return <svg {...props}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'credit-card': return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'shield': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'log-out': return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    case 'chevrons-left': return <svg {...props}><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>;
    case 'chevrons-right': return <svg {...props}><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>;
    default: return null;
  }
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let pending = '';
    let timer: ReturnType<typeof setTimeout>;
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (pending === 'g') {
        clearTimeout(timer);
        pending = '';
        if (key === 'b') router.push('/browse');
        else if (key === 'd') router.push('/dashboard');
        else if (key === 's') router.push('/dashboard/settings');
        return;
      }
      if (key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = ''; }, 500);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  const sidebarWidth = collapsed ? 64 : 240;

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: sidebarWidth,
        background: 'var(--d-surface)',
        borderRight: '1px solid var(--d-border)',
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Brand + collapse */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 52, padding: '0 1rem', borderBottom: '1px solid var(--d-border)' }}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span className="font-semibold text-sm lum-brand">decantr</span>
          </Link>
        )}
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ padding: '0.25rem' }}
        >
          <NavIcon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1" style={{ padding: '0.5rem', overflowY: 'auto', gap: '0.5rem' }}>
        {/* Dashboard group */}
        <div className="flex flex-col" style={{ gap: 2 }}>
          {!collapsed && (
            <span className="d-label" style={{ padding: '0.375rem 0.75rem', borderLeft: '2px solid var(--d-accent)', marginBottom: '0.25rem' }}>
              Dashboard
            </span>
          )}
          {DASHBOARD_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="d-interactive"
              data-variant="ghost"
              style={{
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '0.375rem 0.75rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                background: isActive(item.href) ? 'var(--d-surface-raised)' : undefined,
                borderColor: isActive(item.href) ? 'var(--d-border)' : 'transparent',
              }}
              title={item.label}
            >
              <NavIcon name={item.icon} size={16} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Admin group */}
        {isAdmin && (
          <div className="flex flex-col" style={{ gap: 2 }}>
            {!collapsed && (
              <span className="d-label" style={{ padding: '0.375rem 0.75rem', borderLeft: '2px solid var(--d-accent)', marginBottom: '0.25rem' }}>
                Admin
              </span>
            )}
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  width: '100%',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: '0.375rem 0.75rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  background: isActive(item.href) ? 'var(--d-surface-raised)' : undefined,
                  borderColor: isActive(item.href) ? 'var(--d-border)' : 'transparent',
                }}
                title={item.label}
              >
                <NavIcon name={item.icon} size={16} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleSignOut}
          style={{
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0.375rem 0.75rem',
            fontSize: '0.875rem',
          }}
        >
          <NavIcon name="log-out" size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
