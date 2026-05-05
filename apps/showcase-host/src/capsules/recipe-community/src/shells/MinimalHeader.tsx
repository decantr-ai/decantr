import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ChefHat, X } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      <header
        className={css('_flex _aic _shrink0')}
        style={{
          height: 44, padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)',
          position: 'sticky', top: 0, zIndex: 10,
          justifyContent: 'center', gap: '0.75rem',
        }}
      >
        <Link to="/recipes" className="d-interactive" data-variant="ghost"
          style={{ position: 'absolute', left: '1rem', padding: '0.25rem', border: 'none' }}
          aria-label="Exit cook mode">
          <X size={16} />
        </Link>
        <div className={css('_flex _aic _gap2')}>
          <ChefHat size={16} style={{ color: 'var(--d-primary)' }} />
          <span className="serif-display" style={{ fontSize: '0.875rem' }}>Cook Mode</span>
        </div>
      </header>
      <main className={css('_flex _col _aic')} style={{ flex: 1, overflowY: 'auto', padding: '2rem 0' }}>
        <div style={{ width: 720, maxWidth: '100%', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
