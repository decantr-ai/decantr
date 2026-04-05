import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ChefHat } from 'lucide-react';

export function Centered() {
  return (
    <div className={css('_flex _col _aic _jcc warm-wash')} style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <Link to="/" className={css('_flex _aic _gap2')}
        style={{ textDecoration: 'none', color: 'var(--d-text)', marginBottom: '1.5rem' }}>
        <ChefHat size={22} style={{ color: 'var(--d-primary)' }} />
        <span className="serif-display" style={{ fontSize: '1.25rem' }}>Gather</span>
      </Link>
      <div className="d-surface" style={{ width: '100%', maxWidth: '26rem', borderRadius: 'var(--d-radius-lg)', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
