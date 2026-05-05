import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PieChart, Receipt, Target, TrendingUp, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Wallet, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Portfolio',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', match: (p: string) => p === '/dashboard' },
      { to: '/allocations', icon: PieChart, label: 'Allocations', match: (p: string) => p === '/allocations' },
      { to: '/investments', icon: TrendingUp, label: 'Investments', match: (p: string) => p === '/investments' || p.startsWith('/investments/') },
    ],
  },
  {
    label: 'Money',
    items: [
      { to: '/transactions', icon: Receipt, label: 'Transactions', match: (p: string) => p === '/transactions' || p.startsWith('/transactions/') },
      { to: '/budgets', icon: Target, label: 'Budgets', match: (p: string) => p === '/budgets' },
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hotkeys: g d, g t, g b, g i
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
      if (combo === 'g t') { navigate('/transactions'); keys.length = 0; }
      if (combo === 'g b') { navigate('/budgets'); keys.length = 0; }
      if (combo === 'g i') { navigate('/investments'); keys.length = 0; }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="fd-sidebar"
        style={{
          width: collapsed ? 64 : 240,
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
              to="/dashboard"
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--d-text)',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--d-radius-sm)',
                background: 'linear-gradient(135deg, var(--d-accent), var(--d-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wallet size={14} color="#fff" />
              </div>
              Atlas Wealth
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
                      padding: '0.375rem 0.75rem',
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
              <div className="fd-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{user.org}</div>
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
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
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
              onClick={toggleTheme}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Body — sole scroll container */}
        <main className="fd-fade-in" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
