import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }}>
      {/* Header — sticky, 52px */}
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
          <BookOpen size={18} style={{ color: 'var(--d-accent)' }} />
          <span style={{ fontWeight: 600, fontFamily: "'Georgia', serif" }}>
            The Paragraph
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/articles" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Articles</a>
          <a href="#/subscribe" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Subscribe</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <a
            href="#/login"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}
          >
            Sign In
          </a>
          <a
            href="#/register"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}
          >
            Subscribe
          </a>
        </div>
      </header>

      {/* Body — natural document scroll, no padding */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <BookOpen size={16} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600, fontFamily: "'Georgia', serif", fontSize: '0.875rem' }}>The Paragraph</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              Thoughtful writing on design, engineering, and typography for the modern web.
            </p>
          </div>
          <div>
            <p className="editorial-caption" style={{ marginBottom: '0.75rem' }}>Content</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/articles" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Articles</a>
              <a href="#/categories" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Categories</a>
              <a href="#/newsletter" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Newsletter</a>
            </div>
          </div>
          <div>
            <p className="editorial-caption" style={{ marginBottom: '0.75rem' }}>Connect</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Twitter</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>RSS Feed</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
        </div>
        <div className="editorial-divider" />
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textAlign: 'center', fontSize: '0.75rem' }}>
          &copy; 2026 The Paragraph. All rights reserved.
        </p>
      </footer>

      <style>{`
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
