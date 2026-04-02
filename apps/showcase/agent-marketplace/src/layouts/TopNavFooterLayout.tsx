import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Activity, ExternalLink, Zap } from 'lucide-react';

export function TopNavFooterLayout() {
  return (
    <div className={css('_flex _col') + ' carbon-canvas'} style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb') + ' d-surface'}
        style={{
          padding: 'var(--d-gap-3) var(--d-gap-6)',
          borderRadius: 0,
          borderBottom: '1px solid var(--d-border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none' }}>
          <Activity size={20} style={{ color: 'var(--d-accent)' }} />
          <span className="mono-data neon-text-glow" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--d-accent)' }}>
            SWARM.CTL
          </span>
        </Link>

        <nav className={css('_flex _aic _gap1')}>
          <Link to="/agents" className="d-interactive neon-glow-hover" data-variant="ghost" style={{ fontSize: '0.8125rem', border: '1px solid transparent' }}>
            Dashboard
          </Link>
          <Link to="/login" className="d-interactive neon-glow-hover" data-variant="ghost" style={{ fontSize: '0.8125rem', border: '1px solid transparent' }}>
            Sign in
          </Link>
          <Link
            to="/register"
            className="d-interactive neon-glow-hover"
            style={{
              fontSize: '0.8125rem',
              background: 'var(--d-accent)',
              color: 'var(--d-bg)',
              borderColor: 'var(--d-accent)',
              fontWeight: 500,
            }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Body */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="d-section"
        style={{
          padding: 'var(--d-gap-8) var(--d-gap-6)',
          borderTop: '1px solid var(--d-border)',
        }}
      >
        <div className={css('_flex _jcsb _aic _wrap _gap4')} style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={css('_flex _aic _gap2')}>
            <Activity size={16} style={{ color: 'var(--d-accent)' }} />
            <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              SWARM.CTL &copy; 2026
            </span>
          </div>
          <div className={css('_flex _aic _gap3')}>
            <a href="#" className="d-interactive" data-variant="ghost" style={{ padding: 'var(--d-gap-1)', border: '1px solid transparent' }} aria-label="Docs">
              <ExternalLink size={16} style={{ color: 'var(--d-text-muted)' }} />
            </a>
            <a href="#" className="d-interactive" data-variant="ghost" style={{ padding: 'var(--d-gap-1)', border: '1px solid transparent' }} aria-label="Status">
              <Zap size={16} style={{ color: 'var(--d-text-muted)' }} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
