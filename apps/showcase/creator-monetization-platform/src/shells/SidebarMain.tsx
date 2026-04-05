import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { Palette, Home, DollarSign, FileText, Users, Layers, Settings, ChevronLeft, LogOut, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const dashboardNav = [
  { label: 'Overview', icon: Home, href: '/dashboard' },
  { label: 'Earnings', icon: DollarSign, href: '/dashboard/earnings' },
  { label: 'Content', icon: FileText, href: '/dashboard/content' },
  { label: 'Subscribers', icon: Users, href: '/dashboard/subscribers' },
  { label: 'Tiers', icon: Layers, href: '/dashboard/tiers' },
];

const settingsNav = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Security', href: '/settings/security' },
  { label: 'Preferences', href: '/settings/preferences' },
  { label: 'Payouts', href: '/settings/payouts' },
  { label: 'Account', href: '/settings/account' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;
  const inSettings = location.pathname.startsWith('/settings');

  return (
    <div className={css('_flex studio-canvas')} style={{ height: '100vh' }}>
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
            <Link to="/dashboard" className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
              <Palette size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="serif-display" style={{ fontSize: '1.0625rem', whiteSpace: 'nowrap' }}>Canvas</span>
            </Link>
          )}
          <button className="d-interactive" data-variant="ghost" onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined, border: 'none' }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }} />
          </button>
        </div>

        <nav className={css('_flex _col _gap1')} style={{ padding: '0.75rem 0.5rem', flex: 1, overflowY: 'auto' }}>
          {!inSettings && (
            <>
              <span className="d-label" style={{
                padding: '0.375rem 0.75rem', marginBottom: '0.25rem',
                display: collapsed ? 'none' : undefined,
                borderLeft: '2px solid var(--d-primary)', marginLeft: '0.25rem',
              }}>Creator Studio</span>
              {dashboardNav.map((item) => {
                const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link key={item.href} to={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      justifyContent: collapsed ? 'center' : undefined,
                      padding: '0.5rem 0.75rem',
                      textDecoration: 'none',
                      borderRadius: 'var(--d-radius)',
                      background: active ? 'var(--d-surface-raised)' : undefined,
                      color: active ? 'var(--d-primary)' : 'var(--d-text)',
                      fontWeight: active ? 600 : 500,
                      fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem',
                      transition: 'background 0.15s ease',
                    }}>
                    <item.icon size={16} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}

          {inSettings && (
            <>
              <span className="d-label" style={{
                padding: '0.375rem 0.75rem', marginBottom: '0.25rem',
                display: collapsed ? 'none' : undefined,
                borderLeft: '2px solid var(--d-secondary)', marginLeft: '0.25rem',
              }}>Settings</span>
              {settingsNav.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      justifyContent: collapsed ? 'center' : undefined,
                      padding: '0.5rem 0.75rem',
                      textDecoration: 'none',
                      borderRadius: 'var(--d-radius)',
                      background: active ? 'var(--d-surface-raised)' : undefined,
                      color: active ? 'var(--d-secondary)' : 'var(--d-text)',
                      fontWeight: active ? 600 : 500,
                      fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem',
                    }}>
                    {!collapsed && <span>{item.label}</span>}
                    {collapsed && <Settings size={16} />}
                  </Link>
                );
              })}
            </>
          )}

          {!collapsed && (
            <Link to={inSettings ? '/dashboard' : '/settings/profile'}
              style={{
                marginTop: '0.75rem', padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem', color: 'var(--d-text-muted)',
                textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}>
              <Settings size={14} />{inSettings ? 'Back to Studio' : 'Settings'}
            </Link>
          )}
        </nav>

        <div className={css('_flex _col _gap2')}
          style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <Link to="/library" className="d-interactive" data-variant="ghost"
              style={{ padding: '0.375rem 0.75rem', justifyContent: 'flex-start', fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif', textDecoration: 'none', border: 'none' }}>
              <ExternalLink size={14} /> Fan View
            </Link>
          )}
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif', border: 'none' }}
            aria-label="Sign out">
            <LogOut size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
