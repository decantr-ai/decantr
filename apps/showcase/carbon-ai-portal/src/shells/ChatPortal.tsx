import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Settings, Bell, User as UserIcon, LogOut, PanelLeftClose } from 'lucide-react';
import { ConversationList } from '@/components/ConversationList';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function ChatPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gridTemplateRows: '52px 1fr',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar — spans both rows */}
      <aside
        style={{
          gridColumn: '1',
          gridRow: '1 / 3',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.875rem',
            borderBottom: '1px solid var(--d-border)',
            flexShrink: 0,
          }}
        >
          <Link
            to="/chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--d-text)',
            }}
          >
            <Sparkles size={17} style={{ color: 'var(--d-accent)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>Carbon</span>
          </Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem', border: 'none' }}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} style={{ color: 'var(--d-text-muted)' }} />
          </button>
        </div>

        {/* Nav (conversations) */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <ConversationList />
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '0.5rem',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          <button
            onClick={() => navigate('/chat')}
            className="d-interactive"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
            }}
          >
            <Plus size={15} /> New chat
          </button>
        </div>
      </aside>

      {/* Header */}
      <header
        style={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span
            className="d-annotation"
            data-status="success"
            style={{ fontSize: '0.6875rem' }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--d-success)',
                display: 'inline-block',
              }}
            />
            carbon-4
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', position: 'relative' }}>
          <NavLink
            to="/settings/profile"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem', border: 'none' }}
            aria-label="Settings"
          >
            <Settings size={15} style={{ color: 'var(--d-text-muted)' }} />
          </NavLink>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem', border: 'none' }}
            aria-label="Notifications"
          >
            <Bell size={15} style={{ color: 'var(--d-text-muted)' }} />
          </button>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem', border: 'none', marginLeft: '0.25rem' }}
            aria-label="User menu"
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--d-primary) 30%, var(--d-surface-raised))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--d-text)',
              }}
            >
              AC
            </div>
          </button>
          {userMenuOpen && (
            <div
              className="carbon-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                minWidth: 200,
                padding: '0.375rem',
                zIndex: 50,
                background: 'var(--d-surface-raised)',
                boxShadow: 'var(--d-shadow-lg)',
              }}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--d-border)', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Avery Chen</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>avery@carbonlabs.ai</div>
              </div>
              <MenuLink to="/settings/profile" icon={<UserIcon size={13} />}>Profile</MenuLink>
              <MenuLink to="/settings/preferences" icon={<Settings size={13} />}>Preferences</MenuLink>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="carbon-conv-item"
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
              >
                <LogOut size={13} />
                <span style={{ flex: 1 }}>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main
        style={{
          gridColumn: '2',
          gridRow: '2',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function MenuLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink to={to} className="carbon-conv-item" style={{ textDecoration: 'none' }}>
      {icon}
      <span style={{ flex: 1 }}>{children}</span>
    </NavLink>
  );
}
