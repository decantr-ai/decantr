import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen, ChevronLeft, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function ThreeColumnBrowser() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${navCollapsed ? 56 : 220}px 1fr`, gridTemplateRows: '52px 1fr', height: '100vh' }}>
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
            to="/docs"
            className={css('_flex _aic _gap2')}
            style={{ textDecoration: 'none', color: 'var(--d-text)' }}
          >
            <BookOpen size={18} style={{ color: 'var(--d-primary)' }} />
            <span className={css('_fontsemi')} style={{ fontSize: '0.9375rem' }}>
              Knowledge Base
            </span>
          </Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => navigate('/search')}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}
          >
            <Search size={14} />
            Search...
          </button>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Link
            to="/changelog"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            Changelog
          </Link>
          <Link
            to="/api"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            API
          </Link>
          <Link
            to="/settings"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            Settings
          </Link>
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
            <span className="d-label" style={{ fontSize: '0.7rem' }}>Documentation</span>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setNavCollapsed(!navCollapsed)}
            style={{ padding: '0.25rem', marginLeft: navCollapsed ? 'auto' : undefined, marginRight: navCollapsed ? 'auto' : undefined }}
            aria-label={navCollapsed ? 'Expand nav' : 'Collapse nav'}
          >
            <ChevronLeft
              size={14}
              style={{ transform: navCollapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }}
            />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <Outlet context={{ region: 'nav', navCollapsed }} />
        </div>
      </aside>

      {/* Main area (list + detail handled by page) */}
      <main style={{ display: 'flex', overflow: 'hidden', background: 'var(--d-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
