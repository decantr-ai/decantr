import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }}>
      {/* Header */}
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
          <BookOpen size={18} style={{ color: 'var(--d-primary)' }} />
          <span className={css('_fontsemi')} style={{ fontSize: '0.9375rem' }}>
            Knowledge Base
          </span>
        </Link>
        <nav className={css('_flex _aic')} style={{ gap: '1.5rem' }}>
          <Link to="/docs" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Docs</Link>
          <Link to="/api" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>API</Link>
          <Link to="/changelog" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Changelog</Link>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}
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
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Product</p>
            <div className={css('_flex _col _gap2')}>
              <Link to="/docs" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Documentation</Link>
              <Link to="/api" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>API Reference</Link>
              <Link to="/changelog" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Changelog</Link>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Resources</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Community</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>GitHub</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Status</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Company</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>About</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Blog</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '64rem', margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
            &copy; 2026 Knowledge Base. Built with Decantr.
          </p>
        </div>
      </footer>
    </div>
  );
}
