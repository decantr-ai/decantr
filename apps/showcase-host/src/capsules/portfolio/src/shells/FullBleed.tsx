import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function FullBleed() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className={css('_flex _col') + ' d-mesh'}>
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
          to="/projects"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Sparkles size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg')}>
            Alex<span style={{ color: 'var(--d-accent)' }}>.</span>
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/projects" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Projects</a>
          <a href="#/about" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>About</a>
          <a href="#/blog" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Blog</a>
          <a href="#/contact" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Contact</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
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
