import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap, X } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div className={css('_flex _col dopamine-wash-soft')} style={{ height: '100vh' }}>
      <header
        className={css('_flex _aic _shrink0')}
        style={{
          height: 52, padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)',
          position: 'sticky', top: 0, zIndex: 10,
          justifyContent: 'center', gap: '0.75rem',
        }}
      >
        <Link to="/events" className="d-interactive" data-variant="ghost"
          style={{ position: 'absolute', left: '1rem', padding: '0.375rem', border: 'none' }}
          aria-label="Exit checkout">
          <X size={16} />
        </Link>
        <div className={css('_flex _aic _gap2')}>
          <Zap size={16} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
          <span className="display-heading" style={{ fontSize: '0.9375rem' }}>Checkout</span>
        </div>
      </header>
      <main className={css('_flex _col _aic')} style={{ flex: 1, overflowY: 'auto', padding: '2rem 0' }}>
        <div style={{ width: 820, maxWidth: '100%', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
