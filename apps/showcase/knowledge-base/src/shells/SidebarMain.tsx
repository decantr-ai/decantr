import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen, Search, Settings, ChevronLeft, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
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
              to="/docs"
              className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}
            >
              <BookOpen size={18} style={{ color: 'var(--d-primary)' }} />
              <span className={css('_fontsemi')} style={{ fontSize: '0.875rem' }}>KB</span>
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
          <Link
            to="/docs"
            className="d-interactive"
            data-variant="ghost"
            style={{ justifyContent: collapsed ? 'center' : undefined, padding: '0.375rem 0.75rem', textDecoration: 'none', borderRadius: 'var(--d-radius-sm)' }}
          >
            <BookOpen size={16} />
            {!collapsed && <span className={css('_textsm')}>Docs</span>}
          </Link>
          <Link
            to="/search"
            className="d-interactive"
            data-variant="ghost"
            style={{ justifyContent: collapsed ? 'center' : undefined, padding: '0.375rem 0.75rem', textDecoration: 'none', borderRadius: 'var(--d-radius-sm)' }}
          >
            <Search size={16} />
            {!collapsed && <span className={css('_textsm')}>Search</span>}
          </Link>
          <Link
            to="/settings"
            className="d-interactive"
            data-variant="ghost"
            style={{ justifyContent: collapsed ? 'center' : undefined, padding: '0.375rem 0.75rem', textDecoration: 'none', borderRadius: 'var(--d-radius-sm)' }}
          >
            <Settings size={16} />
            {!collapsed && <span className={css('_textsm')}>Settings</span>}
          </Link>
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
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Knowledge Base</span>
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
