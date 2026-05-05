import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function TopNavMain() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        <Link
          to="/docs"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <BookOpen size={18} style={{ color: 'var(--d-primary)' }} />
          <span className={css('_fontsemi')} style={{ fontSize: '0.9375rem' }}>Knowledge Base</span>
        </Link>
        <nav className={css('_flex _aic')} style={{ gap: '1.5rem' }}>
          <Link to="/docs" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Docs</Link>
          <Link to="/api" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>API</Link>
          <Link to="/changelog" style={{ textDecoration: 'none', color: 'var(--d-text)', fontSize: '0.875rem', fontWeight: 600 }}>Changelog</Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.25rem' }}
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </nav>
      </header>

      {/* Body — scrollable */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
