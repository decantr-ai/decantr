import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Bot, Settings, ChevronLeft, ChevronRight,
  Search, Sparkles, LogOut, User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { group: 'Main', items: [{ icon: LayoutDashboard, label: 'Workspace', href: '/workspace' }] },
  { group: 'AI', items: [{ icon: Bot, label: 'Copilot Config', href: '/copilot/config' }] },
  { group: 'Account', items: [{ icon: Settings, label: 'Settings', href: '/settings' }] },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          {!collapsed && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
              Copilot Shell
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem', border: 'none', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto' }}>
          {navItems.map(group => (
            <div key={group.group} style={{ marginBottom: '0.5rem' }}>
              {!collapsed && (
                <div className="d-label" style={{ padding: '0.375rem 0.75rem', marginBottom: '2px' }}>
                  {group.group}
                </div>
              )}
              {group.items.map(item => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="d-interactive"
                    data-variant="ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      width: '100%',
                      borderRadius: 'var(--d-radius-sm)',
                      background: isActive ? 'var(--d-surface-raised)' : undefined,
                      color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      border: 'none',
                    }}
                  >
                    <Icon size={16} />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '0.5rem',
            marginTop: 'auto',
          }}
        >
          <button
            onClick={logout}
            className="d-interactive"
            data-variant="ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              width: '100%',
              fontSize: '0.875rem',
              border: 'none',
            }}
          >
            {collapsed ? <LogOut size={16} /> : (
              <>
                <div style={{
                  width: 24, height: 24, borderRadius: 'var(--d-radius-full)',
                  background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600,
                }}>
                  <User size={12} />
                </div>
                <span style={{ flex: 1, textAlign: 'left' }}>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span>}
                <span style={i === arr.length - 1 ? { color: 'var(--d-text)' } : undefined}>
                  {seg.charAt(0).toUpperCase() + seg.slice(1)}
                </span>
              </span>
            ))}
          </div>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <Search size={14} />
            {!collapsed && <span style={{ marginLeft: '0.375rem', color: 'var(--d-text-muted)' }}>Search...</span>}
          </button>
        </header>

        {/* Body — sole scroll container */}
        <main
          className="entrance-fade"
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
