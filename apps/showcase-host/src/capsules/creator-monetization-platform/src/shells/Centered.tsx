import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Palette } from 'lucide-react';

export function Centered() {
  return (
    <div className={css('_flex _col _aic _jcc studio-hero-gradient')} style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <Link to="/" className={css('_flex _aic _gap2')}
        style={{ textDecoration: 'none', color: 'var(--d-text)', marginBottom: '1.5rem' }}>
        <Palette size={24} style={{ color: 'var(--d-primary)' }} />
        <span className="serif-display" style={{ fontSize: '1.375rem' }}>Canvas</span>
      </Link>
      <div className="studio-surface studio-fade-up" style={{ width: '100%', maxWidth: '26rem', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
