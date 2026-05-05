import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap } from 'lucide-react';

export function Centered() {
  return (
    <div className={css('_flex _col _aic _jcc dopamine-wash')} style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <Link to="/" className={css('_flex _aic _gap2')}
        style={{ textDecoration: 'none', color: 'var(--d-text)', marginBottom: '1.5rem' }}>
        <Zap size={24} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
        <span className="display-heading gradient-pink-violet" style={{ fontSize: '1.5rem' }}>Pulse</span>
      </Link>
      <div className="d-surface" data-glow="true" style={{ width: '100%', maxWidth: '26rem', borderRadius: 'var(--d-radius-lg)', padding: '2rem',
        boxShadow: '0 0 0 1px color-mix(in srgb, var(--d-primary) 30%, transparent), 0 20px 60px -20px rgba(255, 0, 229, 0.4)' }}>
        <Outlet />
      </div>
    </div>
  );
}
