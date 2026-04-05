import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, User, Sparkles, LogOut, Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { collaborators } from '../data/mock';

export function SidebarMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/settings', label: 'Workspace', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (to: string) => location.pathname === to || (to !== '/home' && location.pathname.startsWith(to));
  const active = collaborators.filter(c => c.status === 'active').slice(0, 4);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside className="paper-surface" style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--d-border)' }}>
        <div style={{ height: 56, padding: '0 1rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Lumen</span>
          <span className="chip chip-primary" style={{ marginLeft: 'auto' }}>Pro</span>
        </div>

        <div style={{ padding: '0.75rem 0.75rem 0.5rem' }}>
          <button
            className="d-interactive"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4375rem 0.625rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}
          >
            <Search size={14} />
            <span style={{ marginLeft: '0.5rem', flex: 1, textAlign: 'left' }}>Search…</span>
            <span className="kbd">⌘K</span>
          </button>
        </div>

        <nav style={{ padding: '0.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.4375rem 0.625rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  fontSize: '0.875rem',
                  color: active ? 'var(--d-text)' : 'var(--d-text-muted)',
                  background: active ? 'var(--d-surface-raised)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem 0.75rem 0.25rem', marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', fontWeight: 600, marginBottom: '0.375rem', padding: '0 0.25rem' }}>
            Pages
          </div>
        </div>
        <nav style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1, overflowY: 'auto' }}>
          {[
            { id: 'roadmap', icon: '🗺️', title: 'Q2 Roadmap' },
            { id: 'welcome', icon: '👋', title: 'Welcome to Lumen' },
            { id: 'weekly-sync', icon: '📝', title: 'Weekly Sync Notes' },
            { id: 'research', icon: '🔍', title: 'User Research' },
            { id: 'system', icon: '🧩', title: 'Design System' },
            { id: 'architecture', icon: '🏛️', title: 'Architecture Notes' },
          ].map(p => (
            <Link
              key={p.id}
              to={`/doc/${p.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3125rem 0.625rem',
                textDecoration: 'none',
                borderRadius: 'var(--d-radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--d-text-muted)',
              }}
            >
              <span style={{ fontSize: '0.875rem' }}>{p.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)' }}>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="d-interactive"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4375rem 0.625rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', border: 'none' }}
          >
            <LogOut size={14} />
            <span style={{ marginLeft: '0.5rem' }}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Lumen workspace</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="presence-stack">
              {active.map(c => (
                <span key={c.id} className="presence-avatar presence-avatar-sm" style={{ background: c.color }} title={c.name}>
                  {c.initials}
                </span>
              ))}
            </div>
            <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
              <Plus size={14} /> Invite
            </button>
            <button className="d-interactive" style={{ padding: '0.375rem', border: 'none', background: 'transparent' }} aria-label="Notifications">
              <Bell size={16} />
            </button>
          </div>
        </header>
        <main className="entrance-fade paper-canvas" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
