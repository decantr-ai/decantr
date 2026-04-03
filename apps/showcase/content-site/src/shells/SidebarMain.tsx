import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen, FileText, Send, Settings, ChevronLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Drafts', icon: FileText, href: '/drafts' },
  { label: 'Published', icon: Send, href: '/published' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  const currentPath = location.pathname;

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
        {/* Brand area */}
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{
            height: 52,
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          {!collapsed && (
            <Link
              to="/articles"
              className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}
            >
              <BookOpen size={18} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600, fontFamily: "'Georgia', serif", fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                The Paragraph
              </span>
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
              size={16}
              style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className={css('_flex _col _gap1')} style={{ padding: '0.5rem', flex: 1 }}>
          <span className="d-label" style={{ padding: '0.375rem 0.75rem', marginBottom: '0.25rem', display: collapsed ? 'none' : undefined, borderLeft: '2px solid var(--d-accent)', marginLeft: '0.25rem' }}>
            Author
          </span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="d-interactive"
              data-variant="ghost"
              style={{
                justifyContent: collapsed ? 'center' : undefined,
                padding: '0.375rem 0.75rem',
                textDecoration: 'none',
                borderRadius: 'var(--d-radius-sm)',
                background: currentPath === item.href ? 'var(--d-surface-raised)' : undefined,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <item.icon size={16} />
              {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={css('_flex _aic _gap2')}
          style={{
            padding: '0.5rem',
            borderTop: '1px solid var(--d-border)',
            justifyContent: collapsed ? 'center' : undefined,
          }}
        >
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.75rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined, fontFamily: 'system-ui, sans-serif' }}
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
          <div className={css('_flex _aic _gap2')}>
            <LayoutDashboard size={16} style={{ color: 'var(--d-text-muted)' }} />
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>Author Dashboard</span>
          </div>
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
