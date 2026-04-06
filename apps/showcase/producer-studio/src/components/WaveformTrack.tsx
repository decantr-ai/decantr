import type { Stem } from '@/data/mock';

export function WaveformTrack({ stem }: { stem: Stem }) {
  return (
    <div
      className="studio-wave"
      style={{
        display: 'flex',
        height: 96,
        background: 'var(--d-surface)',
        borderRadius: 'var(--d-radius-sm)',
        overflow: 'hidden',
        opacity: stem.muted ? 0.4 : 1,
        transition: 'opacity 150ms ease',
      }}
    >
      {/* Track Header */}
      <div
        style={{
          width: 160,
          flexShrink: 0,
          borderRight: '1px solid var(--d-border)',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.375rem',
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--d-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stem.name}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <button
            style={{
              width: 24, height: 24, borderRadius: '50%', fontSize: '0.625rem', fontWeight: 700,
              background: stem.muted ? 'var(--d-error)' : 'var(--d-surface-raised)',
              color: stem.muted ? '#fff' : 'var(--d-text-muted)',
              border: '1px solid var(--d-border)', cursor: 'pointer',
            }}
            title="Mute"
          >
            M
          </button>
          <button
            style={{
              width: 24, height: 24, borderRadius: '50%', fontSize: '0.625rem', fontWeight: 700,
              background: stem.soloed ? 'var(--d-primary)' : 'var(--d-surface-raised)',
              color: stem.soloed ? '#fff' : 'var(--d-text-muted)',
              border: '1px solid var(--d-border)', cursor: 'pointer',
            }}
            title="Solo"
          >
            S
          </button>
          <button
            style={{
              width: 24, height: 24, borderRadius: '50%', fontSize: '0.625rem', fontWeight: 700,
              background: stem.armed ? '#EF4444' : 'var(--d-surface-raised)',
              color: stem.armed ? '#fff' : 'var(--d-text-muted)',
              border: '1px solid var(--d-border)', cursor: 'pointer',
              animation: stem.armed ? 'decantr-pulse 1s ease-in-out infinite' : 'none',
            }}
            title="Arm"
          >
            R
          </button>
          <span className="d-label" style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>
            {stem.gainDb > 0 ? '+' : ''}{stem.gainDb.toFixed(1)} dB
          </span>
        </div>
      </div>
      {/* Waveform Canvas */}
      <div className="studio-beat" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        <svg width="100%" height="80" viewBox="0 0 64 80" preserveAspectRatio="none" style={{ display: 'block' }}>
          {stem.waveform.map((v, i) => {
            const barH = v * 36;
            return (
              <rect
                key={i}
                x={i}
                y={40 - barH}
                width={0.7}
                height={barH * 2}
                fill={stem.color}
                opacity={0.7}
                rx={0.2}
              />
            );
          })}
        </svg>
        {/* Playhead */}
        <div className="studio-playhead" style={{ left: '35%' }} />
      </div>
    </div>
  );
}
