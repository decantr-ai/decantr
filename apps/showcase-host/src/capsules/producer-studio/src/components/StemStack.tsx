import type { Stem } from '@/data/mock';

function MeterBar({ level, side }: { level: number; side: 'left' | 'right' }) {
  const h = Math.max(10, level * 180);
  return (
    <div style={{ width: 4, height: 180, background: 'var(--d-border)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
      <div
        className="studio-meter"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: h,
          borderRadius: 2,
          marginLeft: side === 'right' ? 0 : undefined,
        }}
      />
    </div>
  );
}

export function StemStack({ stems }: { stems: Stem[] }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
      {stems.map((stem) => {
        const level = (100 + stem.gainDb) / 100;
        return (
          <div
            key={stem.id}
            className="studio-channel"
            style={{
              opacity: stem.muted ? 0.4 : 1,
              transition: 'opacity 150ms ease-out',
              borderColor: stem.soloed ? 'var(--d-primary)' : 'var(--d-border)',
            }}
          >
            {/* Plugin slots placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              {[1, 2].map((slot) => (
                <div
                  key={slot}
                  style={{
                    height: 20,
                    background: 'var(--d-surface-raised)',
                    border: '1px solid var(--d-border)',
                    borderRadius: 'var(--d-radius-sm)',
                    fontSize: '0.5625rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--d-text-muted)',
                  }}
                >
                  {slot === 1 ? 'EQ' : 'Comp'}
                </div>
              ))}
            </div>
            {/* Pan knob indicator */}
            <div
              className="studio-knob"
              style={{
                width: 32, height: 32,
                '--knob-angle': `${((stem.pan + 100) / 200) * 270}deg`,
              } as React.CSSProperties}
            />
            {/* MSA buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 20, height: 20, borderRadius: 3, fontSize: '0.5rem', fontWeight: 700, background: stem.muted ? 'var(--d-error)' : 'var(--d-surface-raised)', color: stem.muted ? '#fff' : 'var(--d-text-muted)', border: '1px solid var(--d-border)', cursor: 'pointer' }}>M</button>
              <button style={{ width: 20, height: 20, borderRadius: 3, fontSize: '0.5rem', fontWeight: 700, background: stem.soloed ? 'var(--d-primary)' : 'var(--d-surface-raised)', color: stem.soloed ? '#fff' : 'var(--d-text-muted)', border: '1px solid var(--d-border)', cursor: 'pointer' }}>S</button>
            </div>
            {/* Fader + Meters */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, position: 'relative' }}>
              <MeterBar level={level * 0.9} side="left" />
              <div className="studio-fader" style={{ height: 180 }}>
                <div className="studio-fader-cap" style={{ bottom: `${level * 170}px` }} />
              </div>
              <MeterBar level={level * 0.85} side="right" />
            </div>
            {/* dB label */}
            <span className="d-label" style={{ fontSize: '0.5625rem' }}>
              {stem.gainDb > 0 ? '+' : ''}{stem.gainDb.toFixed(1)}
            </span>
            {/* Stem label */}
            <div
              style={{
                fontSize: '0.625rem',
                color: stem.color,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 60,
                textAlign: 'center',
              }}
            >
              {stem.name}
            </div>
          </div>
        );
      })}
      {/* Master channel */}
      <div
        className="studio-channel"
        style={{
          borderColor: 'var(--d-primary)',
          boxShadow: '0 0 12px rgba(34, 211, 238, 0.15)',
        }}
      >
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '0.25rem' }}>MASTER</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
          <MeterBar level={0.75} side="left" />
          <div className="studio-fader" style={{ height: 180 }}>
            <div className="studio-fader-cap" style={{ bottom: '135px' }} />
          </div>
          <MeterBar level={0.72} side="right" />
        </div>
        <span className="d-label" style={{ fontSize: '0.5625rem' }}>0.0</span>
        <div style={{ fontSize: '0.625rem', color: 'var(--d-primary)', fontWeight: 600 }}>MST</div>
      </div>
    </div>
  );
}
