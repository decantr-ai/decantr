import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  to: string;
  icon: string;
}

export function SidebarMainShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
}) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 48px)',
        background: 'var(--d-bg)',
        color: 'var(--d-text)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: 0,
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          <Link to="/session" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--d-primary)', letterSpacing: '0.05em', textDecoration: 'none' }}>
            <span className="studio-glow-cyan">&#9835;</span> STUDIO
          </Link>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: active ? 'var(--d-primary)' : 'var(--d-text-muted)',
                  background: active ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  borderLeft: active ? '2px solid var(--d-primary)' : '2px solid transparent',
                  borderRadius: 'var(--d-radius-sm)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <Link
            to="/settings/profile"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}
          >
            Settings
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'left' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {/* Header */}
        <header
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--d-border)',
            flexShrink: 0,
          }}
        >
          <div className="d-label" style={{ color: 'var(--d-text-muted)' }}>
            {navItems.find((n) => location.pathname === n.to || location.pathname.startsWith(n.to + '/'))?.label ?? 'Studio'}
          </div>
        </header>

        {/* Body */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: 0 }}>
          <div className="entrance-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
