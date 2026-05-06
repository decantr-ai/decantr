import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen, ArrowLeft } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      {/* Header — slim 44px */}
      <header
        className={css('_flex _aic _shrink0')}
        style={{
          height: 44,
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          justifyContent: 'center',
          gap: '0.75rem',
        }}
      >
        <Link
          to="/articles"
          className="d-interactive"
          data-variant="ghost"
          style={{ position: 'absolute', left: '1rem', padding: '0.25rem', border: 'none' }}
          aria-label="Back to articles"
        >
          <ArrowLeft size={16} />
        </Link>
        <Link
          to="/"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <BookOpen size={16} style={{ color: 'var(--d-accent)' }} />
          <span style={{ fontWeight: 600, fontFamily: "'Georgia', serif", fontSize: '0.875rem' }}>
            The Paragraph
          </span>
        </Link>
      </header>

      {/* Body — centered content */}
      <main
        className={css('_flex _col _aic')}
        style={{ flex: 1, overflowY: 'auto', padding: '2rem 0' }}
      >
        <div style={{ width: 720, maxWidth: '100%', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
