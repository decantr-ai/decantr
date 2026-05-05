import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { Scale, FileText, Briefcase, BookMarked, Settings, ChevronLeft, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/research', icon: Search, label: 'Research' },
  { to: '/contracts', icon: FileText, label: 'Contracts' },
  { to: '/matters', icon: Briefcase, label: 'Matters' },
  { to: '/citations', icon: BookMarked, label: 'Citations' },
  { to: '/settings/profile', icon: Settings, label: 'Settings' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className={css('_flex')} style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: sidebarWidth,
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 52, padding: '0 1rem', borderBottom: '1px solid var(--d-border)' }}
        >
          {!collapsed && (
            <Link
              to="/research"
              className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}
            >
              <Scale size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="counsel-header" style={{ fontSize: '0.875rem' }}>LexResearch</span>
            </Link>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={14}
              style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className={css('_flex _col _gap1')} style={{ padding: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  justifyContent: collapsed ? 'center' : undefined,
                  padding: '0.375rem 0.75rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  background: isActive ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : undefined,
                  color: isActive ? 'var(--d-primary)' : undefined,
                  fontWeight: isActive ? 600 : undefined,
                }}
              >
                <item.icon size={16} />
                {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={css('_flex _aic _gap2')}
          style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)', justifyContent: collapsed ? 'center' : undefined }}
        >
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.75rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
            {!collapsed && <span className={css('_textsm')}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <header
          className={css('_flex _aic _jcsb _shrink0')}
          style={{
            height: 52,
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
          }}
        >
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif' }}>LexResearch</span>
          <div />
        </header>

        {/* Body — sole scroll container */}
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
