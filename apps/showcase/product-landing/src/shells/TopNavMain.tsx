import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles, Search } from 'lucide-react';
import { useState } from 'react';

export function TopNavMain() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      {/* Header — sticky, 52px, border-bottom */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi')}>
            Lumi<span style={{ color: 'var(--d-accent)' }}>.</span>
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/blog" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Blog</a>
          <a href="#/resources" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Resources</a>
          <a href="#/" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Home</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <div className={css('_flex _aic')} style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 8, color: 'var(--d-text-muted)', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="d-control"
              style={{ paddingLeft: '1.75rem', height: 32, fontSize: '0.8125rem', width: 160 }}
            />
          </div>
          <button
            className="d-interactive"
            data-variant="primary"
            onClick={() => navigate('/demo')}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            Try Demo
          </button>
        </div>
      </header>

      {/* Body — scrollable content */}
      <main
        className={css('_flex _col _gap4')}
        style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}
      >
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
