import type { Scrim } from '@/data/mock';

export function Scoreboard({ scrim }: { scrim: Scrim }) {
  const isWin = scrim.score && scrim.score.us > scrim.score.them;
  const isLoss = scrim.score && scrim.score.us < scrim.score.them;

  return (
    <div
      className="d-surface neon-glow-hover"
      style={{
        padding: 'var(--d-surface-p)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Us */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
        }}>
          SL
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shadow Legion</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{scrim.game}</div>
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center' }}>
        {scrim.score ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'var(--d-font-mono, monospace)',
              color: isWin ? 'var(--d-success)' : 'var(--d-text)',
            }}>
              {scrim.score.us}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>vs</span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'var(--d-font-mono, monospace)',
              color: isLoss ? 'var(--d-error)' : 'var(--d-text)',
            }}>
              {scrim.score.them}
            </span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{scrim.time}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{scrim.date}</div>
          </div>
        )}
        <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{scrim.map}</div>
      </div>

      {/* Opponent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: 'row-reverse' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--d-radius)',
          background: 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--d-text-muted)',
        }}>
          {scrim.opponentLogo}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{scrim.opponent}</div>
          <span
            className="d-annotation"
            data-status={scrim.status === 'live' ? 'success' : scrim.status === 'completed' ? 'info' : scrim.status === 'cancelled' ? 'error' : undefined}
            style={{ fontSize: '0.6rem' }}
          >
            {scrim.status === 'live' && '● '}
            {scrim.status}
          </span>
        </div>
      </div>
    </div>
  );
}
