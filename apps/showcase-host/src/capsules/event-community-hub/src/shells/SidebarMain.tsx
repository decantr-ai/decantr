import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap, LayoutDashboard, Users, BarChart3, Calendar, ChevronLeft, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/organizer' },
  { label: 'Attendees', icon: Users, href: '/organizer/attendees' },
  { label: 'Analytics', icon: BarChart3, href: '/organizer/analytics' },
  { label: 'Edit Event', icon: Calendar, href: '/organizer/events/neon-bloom-2026/edit' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className={css('_flex')} style={{ height: '100vh' }}>
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
        <div className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 56, padding: '0 1rem', borderBottom: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <Link to="/organizer" className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
              <Zap size={18} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
              <span className="display-heading gradient-pink-violet" style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>Pulse</span>
            </Link>
          )}
          <button className="d-interactive" data-variant="ghost" onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }} />
          </button>
        </div>

        <nav className={css('_flex _col _gap1')} style={{ padding: '0.5rem', flex: 1 }}>
          <span className="display-label" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem',
            display: collapsed ? 'none' : undefined }}>Organizer</span>
          {navItems.map((item) => {
            const active = location.pathname === item.href || (item.href === '/organizer' && location.pathname === '/organizer');
            return (
              <Link key={item.href} to={item.href} className="d-interactive" data-variant="ghost"
                style={{
                  justifyContent: collapsed ? 'center' : undefined,
                  padding: '0.5rem 0.75rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  background: active ? 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 18%, transparent), transparent)' : undefined,
                  color: active ? 'var(--d-primary)' : undefined,
                  fontWeight: active ? 700 : undefined,
                  fontFamily: 'system-ui, sans-serif',
                }}>
                <item.icon size={16} />
                {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={css('_flex _aic _gap2')}
          style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)', justifyContent: collapsed ? 'center' : undefined }}>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.5rem 0.75rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined, fontFamily: 'system-ui, sans-serif' }}
            aria-label="Sign out">
            <LogOut size={16} />
            {!collapsed && <span className={css('_textsm')}>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <header className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 56, padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)' }}>
          <div className={css('_flex _aic _gap2')}>
            <span className="display-label">Dashboard</span>
          </div>
          <Link to="/events" className={css('_textsm')}
            style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            ← Back to Events
          </Link>
        </header>
        <main className="entrance-bounce dopamine-wash-soft" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
