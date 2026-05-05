import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Users, FileText, MessageCircle, Shield,
  BarChart2, Settings, ChevronLeft, ChevronRight, ChevronsUpDown, Search,
  LogOut, Command, Check, Plus, Briefcase, GitBranch, Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { funds } from '@/data/mock';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pipeline', icon: BarChart2, label: 'Pipeline' },
    ],
  },
  {
    label: 'Deal Management',
    items: [
      { to: '/deals', icon: Briefcase, label: 'Active Deals' },
      { to: '/documents', icon: FolderOpen, label: 'Documents' },
      { to: '/stage-gates', icon: GitBranch, label: 'Stage Gates' },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { to: '/qa', icon: MessageCircle, label: 'Q&A Threads' },
      { to: '/investors', icon: Users, label: 'Investors' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/audit', icon: Shield, label: 'Audit Trail' },
      { to: '/reports', icon: FileText, label: 'Reports' },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const [fundMenuOpen, setFundMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(funds[0]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fundMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fundMenuRef.current && !fundMenuRef.current.contains(e.target as Node)) {
        setFundMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(v => !v);
        return;
      }
      if (e.key === 'Escape') { setCommandOpen(false); setFundMenuOpen(false); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g d') { navigate('/dashboard'); keys.length = 0; }
      if (combo === 'g p') { navigate('/pipeline'); keys.length = 0; }
      if (combo === 'g a') { navigate('/audit'); keys.length = 0; }
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
      <aside
        className="dr-sidebar"
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
        {/* Fund switcher */}
        <div
          ref={fundMenuRef}
          style={{ position: 'relative', padding: '0.75rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <button
            onClick={() => setFundMenuOpen(v => !v)}
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
            aria-label="Switch fund"
          >
            <div className="dr-monogram">{selectedFund.initials}</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--d-font-display)' }}>
                    {selectedFund.name}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--d-text-muted)' }}>
                    {selectedFund.vintage} Vintage · {selectedFund.aum}
                  </div>
                </div>
                <ChevronsUpDown size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
              </>
            )}
          </button>

          {fundMenuOpen && !collapsed && (
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
              <div className="d-label" style={{ padding: '0.375rem 0.5rem' }}>Funds</div>
              {funds.map(fund => (
                <button
                  key={fund.id}
                  onClick={() => { setSelectedFund(fund); setFundMenuOpen(false); }}
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
                  <div className="dr-monogram" style={{ width: 24, height: 24, fontSize: '0.55rem' }}>{fund.initials}</div>
                  <span style={{ flex: 1, textAlign: 'left' }}>{fund.name}</span>
                  {fund.id === selectedFund.id && <Check size={14} style={{ color: 'var(--d-primary)' }} />}
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
                  <Plus size={14} /> New Fund
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
                    data-active={location.pathname === item.to || location.pathname.startsWith(item.to + '/') ? 'true' : undefined}
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
            to="/settings"
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
              <div className="dr-monogram" style={{ width: 26, height: 26, fontSize: '0.55rem', borderRadius: 'var(--d-radius-full)' }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--d-text-muted)' }}>{user.role}</div>
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
            <span style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-display)' }}>{selectedFund.name}</span>
            {breadcrumb.map(seg => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: 'var(--d-text-muted)' }}>/</span>
                <span style={{ color: 'var(--d-text)' }}>{seg.label}</span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="dr-confidential-badge">
              <Shield size={9} /> Confidential
            </div>
            <button
              onClick={() => setCommandOpen(true)}
              className="d-interactive"
              data-variant="ghost"
              style={{
                padding: '6px 10px',
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

      {/* Command palette */}
      {commandOpen && (
        <div
          onClick={() => setCommandOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
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
                placeholder="Search deals, documents, investors..."
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
