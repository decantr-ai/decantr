import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Palette, X } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div className={css('_flex _col studio-canvas')} style={{ height: '100vh' }}>
      <header
        className={css('_flex _aic _shrink0')}
        style={{
          height: 52, padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)', background: 'var(--d-surface)',
          position: 'sticky', top: 0, zIndex: 10,
          justifyContent: 'center', gap: '0.75rem',
        }}
      >
        <Link to="/library" className="d-interactive" data-variant="ghost"
          style={{ position: 'absolute', left: '1rem', padding: '0.25rem 0.5rem', border: 'none' }}
          aria-label="Exit checkout">
          <X size={16} />
        </Link>
        <div className={css('_flex _aic _gap2')}>
          <Palette size={16} style={{ color: 'var(--d-primary)' }} />
          <span className="serif-display" style={{ fontSize: '1rem' }}>Secure Checkout</span>
        </div>
      </header>
      <main className={css('_flex _col _aic')} style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 1rem' }}>
        <div style={{ width: 640, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
