import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutPanelLeft, Grid3x3, ScanSearch, Eye, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, User, Hexagon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    group: 'Workbench',
    items: [
      { icon: LayoutPanelLeft, label: 'Workspace', href: '/workspace' },
      { icon: Grid3x3, label: 'Catalog', href: '/catalog' },
    ],
  },
  {
    group: 'Tools',
    items: [
      { icon: ScanSearch, label: 'Inspector', href: '/inspector' },
      { icon: Eye, label: 'Preview', href: '/preview' },
    ],
  },
  {
    group: 'Account',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];

interface SidebarAsideProps {
  showAside?: boolean;
  asideContent?: React.ReactNode;
}

export function SidebarAside({ showAside = true, asideContent }: SidebarAsideProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${sidebarWidth}px 1fr${showAside ? ' 280px' : ''}`,
        gridTemplateRows: '52px 1fr',
        height: '100vh',
        transition: 'grid-template-columns 200ms ease',
      }}
    >
      {/* Sidebar — spans both rows */}
      <aside
        style={{
          gridRow: '1 / 3',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          overflow: 'hidden',
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
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              <Hexagon size={18} style={{ color: 'var(--d-primary)' }} />
              Workbench
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
          {navGroups.map(group => (
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

      {/* Header */}
      <header
        style={{
          gridColumn: showAside ? '2 / 4' : '2 / 3',
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
          <span style={{ marginLeft: '0.375rem', color: 'var(--d-text-muted)' }}>Search...</span>
          <kbd style={{
            marginLeft: '0.5rem',
            fontSize: '0.625rem',
            padding: '0.0625rem 0.3125rem',
            borderRadius: 'var(--d-radius-sm)',
            background: 'var(--d-surface)',
            color: 'var(--d-text-muted)',
            border: '1px solid var(--d-border)',
          }}>
            {'\u2318'}K
          </kbd>
        </button>
      </header>

      {/* Body — main scroll container */}
      <main
        className="entrance-fade"
        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
      >
        <Outlet />
      </main>

      {/* Aside panel */}
      {showAside && (
        <aside
          style={{
            gridRow: '2 / 3',
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
            overflowY: 'auto',
          }}
        >
          {asideContent}
        </aside>
      )}
    </div>
  );
}
