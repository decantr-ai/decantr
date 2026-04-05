import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, Code, Key, Zap, BarChart2, CreditCard,
  FileText, Shield, ChevronLeft, ChevronRight, ChevronsUpDown, Search,
  LogOut, Command, Check, Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { organizations } from '@/data/mock';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
      { to: '/members', icon: Users, label: 'Members' },
      { to: '/org-settings', icon: Settings, label: 'Organization' },
    ],
  },
  {
    label: 'Developers',
    items: [
      { to: '/api/docs', icon: Code, label: 'API Reference' },
      { to: '/api/keys', icon: Key, label: 'API Keys' },
      { to: '/api/webhooks', icon: Zap, label: 'Webhooks' },
      { to: '/webhooks', icon: Zap, label: 'Endpoints' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: '/usage', icon: BarChart2, label: 'Usage' },
      { to: '/billing', icon: CreditCard, label: 'Plans' },
      { to: '/invoices', icon: FileText, label: 'Invoices' },
    ],
  },
  {
    label: 'Governance',
    items: [
      { to: '/audit', icon: Shield, label: 'Audit Log' },
      { to: '/audit/settings', icon: Settings, label: 'Retention' },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const orgMenuRef = useRef<HTMLDivElement>(null);

  // Close org switcher on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setOrgMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Hotkeys + command palette
  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;

    function handleKeydown(e: KeyboardEvent) {
      // Command palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(v => !v);
        return;
      }
      if (e.key === 'Escape') { setCommandOpen(false); setOrgMenuOpen(false); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g o') { navigate('/overview'); keys.length = 0; }
      if (combo === 'g a') { navigate('/api/docs'); keys.length = 0; }
      if (combo === 'g b') { navigate('/billing'); keys.length = 0; }
      if (combo === 'g u') { navigate('/audit'); keys.length = 0; }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="lp-sidebar"
        style={{
          width: collapsed ? 64 : 256,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 200ms ease',
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {/* Org switcher — prominent top-left */}
        <div
          ref={orgMenuRef}
          style={{
            position: 'relative',
            padding: '0.75rem',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          <button
            onClick={() => setOrgMenuOpen(v => !v)}
            className="d-interactive"
            data-variant="ghost"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              border: '1px solid var(--d-border)',
              borderRadius: 'var(--d-radius)',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            aria-label="Switch organization"
          >
            <div className="lp-org-avatar">{selectedOrg.initials}</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOrg.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
                    {selectedOrg.plan} · {selectedOrg.members} members
                  </div>
                </div>
                <ChevronsUpDown size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
              </>
            )}
          </button>

          {orgMenuOpen && !collapsed && (
            <div
              className="d-surface"
              data-elevation="overlay"
              style={{
                position: 'absolute',
                top: 'calc(100% - 0.25rem)',
                left: '0.75rem',
                right: '0.75rem',
                padding: '0.375rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div className="d-label" style={{ padding: '0.375rem 0.5rem' }}>Organizations</div>
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => { setSelectedOrg(org); setOrgMenuOpen(false); }}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    border: 'none',
                    fontSize: '0.8rem',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div className="lp-org-avatar" style={{ width: 22, height: 22, fontSize: '0.6rem' }}>{org.initials}</div>
                  <span style={{ flex: 1, textAlign: 'left' }}>{org.name}</span>
                  {org.id === selectedOrg.id && <Check size={14} style={{ color: 'var(--d-primary)' }} />}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--d-border)', marginTop: 4, paddingTop: 4 }}>
                <button
                  className="d-interactive"
                  data-variant="ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    border: 'none',
                    fontSize: '0.8rem',
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Plus size={14} /> Create organization
                </button>
              </div>
            </div>
          )}
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
                    data-active={
                      location.pathname === item.to ||
                      (item.to === '/webhooks' && location.pathname.startsWith('/webhooks/'))
                        ? 'true' : undefined
                    }
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--d-radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <item.icon size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          <NavLink
            to="/settings/profile"
            className="d-interactive"
            data-variant="ghost"
            data-active={location.pathname.startsWith('/settings') ? 'true' : undefined}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--d-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              width: '100%',
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Settings size={15} />
            {!collapsed && 'Settings'}
          </NavLink>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              marginTop: 4,
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--d-radius-full)',
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 700,
                flexShrink: 0,
                color: '#fff',
              }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{user.role}</div>
                  </div>
                  <button
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={logout}
                    style={{ padding: '0.25rem', border: 'none' }}
                    aria-label="Sign out"
                  >
                    <LogOut size={13} />
                  </button>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="d-interactive"
            data-variant="ghost"
            style={{
              width: '100%',
              padding: '0.25rem',
              border: 'none',
              marginTop: 4,
              justifyContent: 'center',
              opacity: 0.5,
            }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--d-text-muted)' }}>{selectedOrg.name}</span>
            {breadcrumb.map(seg => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: 'var(--d-text-muted)' }}>/</span>
                <span style={{ color: 'var(--d-text)' }}>{seg.label}</span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCommandOpen(true)}
              className="d-interactive"
              data-variant="ghost"
              style={{
                padding: '6px 10px 6px 10px',
                fontSize: '0.75rem',
                gap: '0.5rem',
                color: 'var(--d-text-muted)',
                border: '1px solid var(--d-border)',
              }}
            >
              <Search size={13} />
              Search
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '0.65rem',
                padding: '1px 5px',
                background: 'var(--d-bg)',
                borderRadius: 'var(--d-radius-sm)',
                border: '1px solid var(--d-border)',
                marginLeft: '0.5rem',
              }}>
                <Command size={10} /> K
              </span>
            </button>
          </div>
        </header>

        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>

      {/* Command palette overlay */}
      {commandOpen && (
        <div
          onClick={() => setCommandOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
            zIndex: 200,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="d-surface"
            data-elevation="overlay"
            style={{ width: '100%', maxWidth: 560, padding: 0 }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={14} style={{ color: 'var(--d-text-muted)' }} />
              <input
                autoFocus
                placeholder="Search or jump to..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--d-text)',
                  fontSize: '0.875rem',
                }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>ESC</span>
            </div>
            <div style={{ padding: '0.5rem', maxHeight: 320, overflowY: 'auto' }}>
              {navGroups.flatMap(g => g.items).map(item => (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); setCommandOpen(false); }}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    justifyContent: 'flex-start',
                  }}
                >
                  <item.icon size={14} style={{ color: 'var(--d-text-muted)' }} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
