import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { Scale, Search, FileText, Briefcase, BookMarked, Settings, ChevronLeft, LogOut, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/research', icon: Search, label: 'Research' },
  { to: '/contracts', icon: FileText, label: 'Contracts' },
  { to: '/matters', icon: Briefcase, label: 'Matters' },
  { to: '/citations', icon: BookMarked, label: 'Citations' },
  { to: '/settings/profile', icon: Settings, label: 'Settings' },
];

export function SidebarAside() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [asideVisible, setAsideVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${navCollapsed ? 56 : 220}px 1fr ${asideVisible ? '280px' : '0px'}`,
        gridTemplateRows: '52px 1fr',
        height: '100vh',
        transition: 'grid-template-columns 200ms ease',
      }}
    >
      {/* Header — spans all columns */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          gridColumn: '1 / -1',
          height: 52,
          padding: '0 1rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        <div className={css('_flex _aic _gap3')}>
          <Link
            to="/research"
            className={css('_flex _aic _gap2')}
            style={{ textDecoration: 'none', color: 'var(--d-text)' }}
          >
            <Scale size={18} style={{ color: 'var(--d-primary)' }} />
            <span className="counsel-header" style={{ fontSize: '0.9375rem' }}>LexResearch</span>
          </Link>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Link to="/research" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}>Research</Link>
          <Link to="/contracts" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}>Contracts</Link>
          <Link to="/matters" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}>Matters</Link>
          <Link to="/citations" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}>Citations</Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setAsideVisible(!asideVisible)}
            style={{ padding: '0.25rem' }}
            aria-label={asideVisible ? 'Hide aside panel' : 'Show aside panel'}
          >
            {asideVisible ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.25rem' }}
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Nav column */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: navCollapsed ? 56 : 220,
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ padding: '0.75rem', borderBottom: '1px solid var(--d-border)' }}
        >
          {!navCollapsed && (
            <span className="d-label" style={{ fontSize: '0.7rem' }}>Navigation</span>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setNavCollapsed(!navCollapsed)}
            style={{ padding: '0.25rem', marginLeft: navCollapsed ? 'auto' : undefined, marginRight: navCollapsed ? 'auto' : undefined }}
            aria-label={navCollapsed ? 'Expand nav' : 'Collapse nav'}
          >
            <ChevronLeft size={14} style={{ transform: navCollapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }} />
          </button>
        </div>
        <nav className={css('_flex _col _gap1')} style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  justifyContent: navCollapsed ? 'center' : undefined,
                  padding: '0.375rem 0.75rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  background: isActive ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : undefined,
                  color: isActive ? 'var(--d-primary)' : undefined,
                  fontWeight: isActive ? 600 : undefined,
                }}
              >
                <item.icon size={16} />
                {!navCollapsed && <span className={css('_textsm')}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main body */}
      <main className="entrance-fade" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>

      {/* Aside panel */}
      {asideVisible && (
        <aside
          style={{
            gridRow: '2',
            borderLeft: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          <Outlet context={{ region: 'aside' }} />
        </aside>
      )}
    </div>
  );
}
