import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function TopNavMain() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
          to="/projects"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi')}>
            Alex<span style={{ color: 'var(--d-accent)' }}>.</span>
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/projects" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Projects</a>
          <a href="#/about" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>About</a>
          <a href="#/skills" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Skills</a>
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
