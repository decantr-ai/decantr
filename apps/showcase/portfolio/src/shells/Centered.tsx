import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _center') + ' d-mesh'}
      style={{ minHeight: '100vh', padding: '1.5rem' }}
    >
      <div
        className="d-surface d-glass-strong"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
        }}
      >
        <Outlet />
      </div>

      {/* Decorative orbs */}
      <div
        className="aura-orb aura-orb--pink"
        style={{ top: '10%', right: '-5%' }}
      />
      <div
        className="aura-orb aura-orb--purple"
        style={{ bottom: '15%', left: '-8%', animationDelay: '-4s' }}
      />
    </div>
  );
}
