import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles } from 'lucide-react';

export function FullBleed() {
  const navigate = useNavigate();

  return (
    <div className={css('_flex _col') + ' lum-canvas'}>
      {/* Floating header — 52px, fixed, transparent */}
      <header
        className={css('_flex _aic _jcsb')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 52,
          padding: '0 2rem',
          zIndex: 40,
          background: 'transparent',
        }}
      >
        <Link
          to="/"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Sparkles size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg')}>
            Lumi<span style={{ color: 'var(--d-accent)' }}>.</span>
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Home</a>
          <a href="#/demo" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Demo</a>
          <a href="#/blog" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Blog</a>
          <a href="#/resources" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Resources</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
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

      {/* Body — full-bleed sections, natural scroll */}
      <main style={{ flex: 1 }}>
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
