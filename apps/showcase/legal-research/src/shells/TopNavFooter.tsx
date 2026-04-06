import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Scale } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col') + ' counsel-page'} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
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
          <Scale size={18} style={{ color: 'var(--d-primary)' }} />
          <span className="counsel-header" style={{ fontSize: '0.9375rem' }}>
            LexResearch
          </span>
        </Link>
        <nav className={css('_flex _aic')} style={{ gap: '1.5rem' }}>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Features</a>
          <a href="#testimonials" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Testimonials</a>
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
          background: 'var(--d-surface)',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Platform</p>
            <div className={css('_flex _col _gap2')}>
              <Link to="/research" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Research</Link>
              <Link to="/contracts" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Contracts</Link>
              <Link to="/matters" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Matters</Link>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Resources</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Documentation</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Support</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>API</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Company</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>About</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Careers</a>
              <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>Privacy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '64rem', margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem', fontFamily: 'Georgia, serif' }}>
            &copy; 2026 LexResearch. Built with Decantr.
          </p>
        </div>
      </footer>
    </div>
  );
}
