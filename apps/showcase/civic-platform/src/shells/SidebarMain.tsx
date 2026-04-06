import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark, ChevronLeft, ChevronRight, Search, LogOut,
  DollarSign, Calendar, Wrench, Settings, BarChart3, FilePlus, Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { css } from '@decantr/css';

const navGroups = [
  {
    label: 'Budget',
    items: [
      { to: '/budget', icon: DollarSign, label: 'Overview', match: (p: string) => p === '/budget' },
      { to: '/budget/public-safety', icon: BarChart3, label: 'By Category', match: (p: string) => p.startsWith('/budget/') },
    ],
  },
  {
    label: 'Meetings',
    items: [
      { to: '/meetings', icon: Calendar, label: 'Archive', match: (p: string) => p.startsWith('/meetings') },
    ],
  },
  {
    label: 'Service Requests',
    items: [
      { to: '/requests', icon: Wrench, label: 'All Requests', match: (p: string) => p === '/requests' },
      { to: '/requests/new', icon: FilePlus, label: 'New Request', match: (p: string) => p === '/requests/new' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile', icon: Settings, label: 'Settings', match: (p: string) => p.startsWith('/settings') },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 64 : 240,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 200ms ease',
          overflow: 'hidden',
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
        }}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <NavLink
              to="/engage"
              style={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--d-text)',
              }}
            >
              <div style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--d-primary)', borderRadius: 2,
              }}>
                <Landmark size={16} color="#fff" />
              </div>
              Civic
            </NavLink>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.375rem', border: 'none' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div className="d-label" style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="d-interactive"
                    data-variant="ghost"
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                      fontWeight: item.match(location.pathname) ? 600 : 400,
                      background: item.match(location.pathname) ? 'var(--d-surface-raised)' : 'transparent',
                      color: item.match(location.pathname) ? 'var(--d-primary)' : 'var(--d-text)',
                    }}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} aria-hidden />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          {user && (
            <div className={css('_flex _aic _gap2')} style={{ padding: '0.375rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 2,
                background: 'var(--d-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
              }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{user.district}</div>
                  </div>
                  <button
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={handleLogout}
                    style={{ padding: '0.25rem', border: 'none' }}
                    aria-label="Sign out"
                  >
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
          background: 'var(--d-bg)',
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }} aria-label="Breadcrumb">
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{
                  color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)',
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                }}>
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>
          <div className={css('_flex _aic _gap2')}>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.875rem', border: 'none' }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.875rem', border: 'none' }}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Body — sole scroll container */}
        <main
          className="entrance-fade"
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
          key={location.pathname}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
