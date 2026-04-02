import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Activity, ArrowLeft } from 'lucide-react';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc') + ' carbon-canvas'}
      style={{ minHeight: '100dvh', padding: 'var(--d-gap-6)' }}
    >
      {/* Brand */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: 'var(--d-gap-8)' }}>
        <Activity size={24} style={{ color: 'var(--d-accent)' }} />
        <span className="mono-data neon-text-glow" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--d-accent)' }}>
          SWARM.CTL
        </span>
      </div>

      {/* Content card */}
      <div
        className="d-surface carbon-glass neon-entrance"
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        <Outlet />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className={css('_flex _aic _gap1') + ' d-interactive neon-glow-hover'}
        data-variant="ghost"
        style={{ marginTop: 'var(--d-gap-4)', fontSize: '0.8125rem', color: 'var(--d-text-muted)', border: '1px solid transparent' }}
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>
    </div>
  );
}
