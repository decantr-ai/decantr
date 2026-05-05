import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sun,
  Target,
  LogOut,
  Store,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth, useUi } from '../App';

const NAV_GROUPS = [
  {
    label: 'Agents',
    items: [
      { to: '/agents', label: 'Overview', icon: Bot, end: true },
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/agents/config', label: 'Configuration', icon: Settings2 },
    ],
  },
  {
    label: 'Transparency',
    items: [
      { to: '/transparency', label: 'Model overview', icon: Zap, end: true },
      { to: '/transparency/inference', label: 'Inference log', icon: Activity },
      { to: '/transparency/confidence', label: 'Confidence', icon: Target },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const { openPalette, themeMode, toggleTheme } = useUi();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (!event.key.toLowerCase().startsWith('g')) return;
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    let pending = '';
    let timer = 0;

    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const key = event.key.toLowerCase();

      if (pending === 'g') {
        window.clearTimeout(timer);
        pending = '';
        if (key === 'a') navigate('/agents');
        if (key === 'm') navigate('/marketplace');
        if (key === 't') navigate('/transparency');
        return;
      }

      if (key === 'g') {
        pending = 'g';
        timer = window.setTimeout(() => {
          pending = '';
        }, 450);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer);
    };
  }, [navigate]);

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => ({
      label: segment.replace(/-/g, ' '),
      path: `/${segments.slice(0, index + 1).join('/')}`,
    }));
  }, [location.pathname]);

  return (
    <div className="shell-workspace" data-collapsed={collapsed} data-drawer-open={drawerOpen} data-theme="carbon-neon">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <button type="button" className="shell-workspace__scrim" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />

      <aside className="shell-workspace__sidebar">
        <div className="shell-workspace__sidebar-brand">
          <div className="shell-workspace__sidebar-brand-copy">
            <span className="shell-public__brand-mark">
              <Zap size={16} />
            </span>
            <span className="shell-workspace__sidebar-brand-text">AgentOps</span>
          </div>
          <button type="button" className="d-interactive icon-button" data-variant="ghost" onClick={() => setCollapsed((current) => !current)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <nav className="shell-workspace__nav" aria-label="Workspace navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="shell-workspace__group">
              <span className="d-label shell-workspace__group-label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `d-interactive shell-workspace__nav-link${isActive ? ' is-active' : ''}`}
                  data-variant="ghost"
                >
                  <Icon size={16} />
                  <span className="shell-workspace__nav-link-label">{item.label}</span>
                </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shell-workspace__sidebar-footer">
          <div className="shell-workspace__sidebar-account">
            <span className="shell-workspace__sidebar-account-mark">
              <Bot size={16} />
            </span>
            <span className="shell-workspace__sidebar-footer-copy">
              <strong>Operator</strong>
              <span className="mono-kicker">showcase workspace</span>
            </span>
          </div>
          <button
            type="button"
            className="d-interactive shell-workspace__nav-link"
            data-variant="ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} />
            <span className="shell-workspace__nav-link-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="shell-workspace__main">
        <header className="shell-workspace__header">
          <div className="shell-workspace__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.length === 0 ? <span className="shell-workspace__breadcrumb">workspace</span> : breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="shell-workspace__breadcrumb">
                {index > 0 ? ' / ' : ''}
                {crumb.label}
              </span>
            ))}
          </div>
          <div className="shell-workspace__header-actions">
            <button type="button" className="d-interactive command-trigger" data-variant="ghost" onClick={openPalette}>
              <Search size={14} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="d-interactive icon-button theme-toggle" data-variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
              {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button type="button" className="d-interactive icon-button shell-workspace__mobile-toggle" data-variant="ghost" onClick={() => setDrawerOpen((current) => !current)} aria-label="Toggle navigation drawer">
              <Menu size={15} />
            </button>
          </div>
        </header>

        <main id="main-content" className="shell-workspace__body carbon-fade-slide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
