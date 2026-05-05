import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Wrench, DollarSign, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Home, Bell, FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Portfolio',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', match: (p: string) => p === '/dashboard' },
      { to: '/properties', icon: Building2, label: 'Properties', match: (p: string) => p === '/properties' || p.startsWith('/properties/') },
      { to: '/tenants', icon: Users, label: 'Residents', match: (p: string) => p === '/tenants' || p.startsWith('/tenants/') },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/maintenance', icon: Wrench, label: 'Maintenance', match: (p: string) => p === '/maintenance' || p.startsWith('/maintenance/') },
      { to: '/documents', icon: FileText, label: 'Documents', match: (p: string) => p === '/documents' },
    ],
  },
  {
    label: 'Financials',
    items: [
      { to: '/financials', icon: DollarSign, label: 'Overview', match: (p: string) => p === '/financials' },
      { to: '/financials/rent-roll', icon: Home, label: 'Rent Roll', match: (p: string) => p === '/financials/rent-roll' },
      { to: '/financials/expenses', icon: FileText, label: 'Expenses', match: (p: string) => p === '/financials/expenses' },
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

  // Hotkeys: g d, g p, g t, g m, g f
  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;

    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g d') { navigate('/dashboard'); keys.length = 0; }
      if (combo === 'g p') { navigate('/properties'); keys.length = 0; }
      if (combo === 'g t') { navigate('/tenants'); keys.length = 0; }
      if (combo === 'g m') { navigate('/maintenance'); keys.length = 0; }
      if (combo === 'g f') { navigate('/financials'); keys.length = 0; }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  // Breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="pm-sidebar"
        style={{
          width: collapsed ? 64 : 248,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 56,
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
              to="/dashboard"
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--d-primary)',
              }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--d-radius-sm)',
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Building2 size={15} color="#fff" />
              </div>
              Cornerstone
            </NavLink>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', border: 'none' }}
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
                <div className="d-label" style={{ padding: '0.375rem 0.75rem', marginBottom: '2px' }}>
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
                    data-active={item.match(location.pathname) ? 'true' : undefined}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--d-radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.5rem',
            }}>
              <div className="pm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{user.role}</div>
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
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.75rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          flexShrink: 0,
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.825rem' }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)', fontWeight: i === breadcrumb.length - 1 ? 500 : 400 }}>
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-label="Search"
            >
              <Search size={14} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '6px 12px', fontSize: '0.8rem', position: 'relative' }}
              aria-label="Notifications"
            >
              <Bell size={14} />
              <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, background: 'var(--d-error)', borderRadius: '50%' }} />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="pm-fade-in" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }} key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
