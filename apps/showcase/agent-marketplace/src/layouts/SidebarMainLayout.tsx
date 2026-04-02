import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot,
  Store,
  Settings,
  Activity,
  Eye,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/agents', label: 'Agents', icon: Bot, section: 'agent-orchestrator' },
  { href: '/marketplace', label: 'Marketplace', icon: Store, section: 'agent-orchestrator' },
  { href: '/agents/config', label: 'Configuration', icon: Settings, section: 'agent-orchestrator' },
  { href: '/transparency', label: 'Models', icon: Eye, section: 'ai-transparency' },
  { href: '/transparency/inference', label: 'Inference Log', icon: Activity, section: 'ai-transparency' },
  { href: '/transparency/confidence', label: 'Confidence', icon: BarChart3, section: 'ai-transparency' },
];

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <nav className={css('_flex _aic _gap1') + ' mono-data'} style={{ fontSize: '0.75rem' }} aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className={css('_flex _aic _gap1')}>
          {i > 0 && <ChevronRight size={12} style={{ color: 'var(--d-text-muted)' }} />}
          {i < crumbs.length - 1 ? (
            <Link to={crumb.path} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: 'var(--d-text)' }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SidebarMainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hotkeys: g a -> agents, g m -> marketplace, g t -> transparency
  useEffect(() => {
    let pending = '';
    let timer: ReturnType<typeof setTimeout>;

    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();

      if (pending === 'g') {
        clearTimeout(timer);
        pending = '';
        if (key === 'a') navigate('/agents');
        else if (key === 'm') navigate('/marketplace');
        else if (key === 't') navigate('/transparency');
        return;
      }

      if (key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = ''; }, 500);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  const pageTitle = navItems.find(n => location.pathname === n.href)?.label ?? 'Dashboard';

  return (
    <div
      className={css('_grid _hscreen')}
      style={{
        gridTemplateColumns: collapsed ? '64px 1fr' : '240px 1fr',
        gridTemplateRows: '52px 1fr',
        transition: 'grid-template-columns 0.2s ease',
      }}
    >
      {/* Sidebar */}
      <aside
        className={css('_flex _col _gap1 _p3 _overyauto')}
        style={{
          gridRow: '1 / 3',
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
        }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _mb4')}>
          {!collapsed && (
            <span className={css('_fontsemi _textlg') + ' neon-text-glow'} style={{ color: 'var(--d-accent)' }}>
              NEXUS
            </span>
          )}
          <button
            className={'d-interactive'}
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: '0.375rem' }}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className={css('_flex _col _gap1')}>
          {navItems.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={css('_flex _aic _gap2 _py2 _px3 _rounded _trans') + (isActive ? ' neon-border-glow' : '')}
                style={{
                  textDecoration: 'none',
                  color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
                  background: isActive ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                  fontSize: '0.875rem',
                }}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Header bar */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3')}
        style={{
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div className={css('_flex _col _gap1')}>
          <Breadcrumbs />
          <h1 className={css('_fontsemi _textlg') + ' mono-data'}>{pageTitle}</h1>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" aria-label="Search" style={{ padding: '0.375rem' }}>
            <Search size={18} />
          </button>
          <button className="d-interactive" data-variant="ghost" aria-label="Notifications" style={{ padding: '0.375rem' }}>
            <Bell size={18} />
          </button>
          <div className="status-ring" data-status="active" style={{ width: '32px', height: '32px' }}>
            <Bot size={16} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={css('_flex _col _gap4 _p6 _overyauto _flex1') + ' entrance-fade'}>
        <Outlet />
      </main>
    </div>
  );
}
