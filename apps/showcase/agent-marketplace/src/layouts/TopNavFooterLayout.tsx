import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, ExternalLink, Globe } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Dashboard' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/transparency', label: 'Transparency' },
];

export function TopNavFooterLayout() {
  const location = useLocation();

  return (
    <div className={css('_flex _col')} style={{ minHeight: '100dvh' }}>
      {/* Sticky top nav */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3')}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--d-border)',
          height: '52px',
        }}
      >
        <Link
          to="/"
          className={css('_flex _aic _gap2') + ' neon-text-glow'}
          style={{ textDecoration: 'none', color: 'var(--d-accent)' }}
        >
          <Bot size={22} />
          <span className={css('_fontsemi _textlg') + ' mono-data'}>NEXUS</span>
        </Link>

        <nav className={css('_flex _aic _gap1')}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={'d-interactive'}
                data-variant="ghost"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{ textDecoration: 'none', fontSize: '0.875rem', marginLeft: '0.5rem' }}
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className={css('_flex1') + ' entrance-fade'}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={css('_flex _aic _jcsb _px6 _py4')}
        style={{
          borderTop: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
        }}
      >
        <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 Nexus Agent Platform
        </span>
        <div className={css('_flex _aic _gap3')}>
          <a href="#" aria-label="GitHub" style={{ color: 'var(--d-text-muted)' }}>
            <ExternalLink size={18} />
          </a>
          <a href="#" aria-label="Website" style={{ color: 'var(--d-text-muted)' }}>
            <Globe size={18} />
          </a>
        </div>
      </footer>
    </div>
  );
}
