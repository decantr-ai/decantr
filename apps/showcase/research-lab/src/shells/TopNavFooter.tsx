import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { FlaskConical } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 48,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: '#fff',
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
          <FlaskConical size={18} style={{ color: 'var(--d-primary)' }} />
          <span className={css('_fontmedium')} style={{ fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
            Research Lab
          </span>
        </Link>
        <nav className={css('_flex _aic')} style={{ gap: '1.5rem' }}>
          <a href="#/notebook" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Notebook</a>
          <a href="#/experiments" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Experiments</a>
          <a href="#/datasets" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Datasets</a>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.325rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none', borderRadius: 2 }}
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Body */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
          background: 'var(--d-surface)',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Platform</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/notebook" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Lab Notebook</a>
              <a href="#/experiments" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Experiments</a>
              <a href="#/samples" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Samples</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Resources</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/instruments" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Instruments</a>
              <a href="#/datasets" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Datasets</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Documentation</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Lab</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>About Us</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Publications</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Contact</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '64rem', margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
            &copy; 2026 Research Lab. Built with Decantr.
          </p>
        </div>
      </footer>
    </div>
  );
}
