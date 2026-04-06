import { suppliers } from '@/data/mock';
import type { Supplier } from '@/data/mock';

const tierColors: Record<number, string> = {
  1: 'var(--d-primary)',
  2: 'var(--d-warning)',
  3: 'var(--d-error)',
};

const statusColors: Record<string, string> = {
  'compliant': 'var(--d-success)',
  'at-risk': 'var(--d-warning)',
  'non-compliant': 'var(--d-error)',
};

function toMapX(lng: number): number {
  return ((lng + 180) / 360) * 800;
}

function toMapY(lat: number): number {
  return ((90 - lat) / 180) * 400;
}

export function SupplyChainMap({ onSelect }: { onSelect?: (s: Supplier) => void }) {
  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--d-radius)' }}>
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', background: 'color-mix(in srgb, var(--d-accent) 8%, var(--d-surface))' }}>
        {/* Simple world outline rectangles for continents */}
        <rect x={100} y={80} width={180} height={180} rx={8} fill="color-mix(in srgb, var(--d-primary) 12%, transparent)" stroke="var(--d-border)" strokeWidth={0.5} />
        <rect x={340} y={60} width={200} height={160} rx={8} fill="color-mix(in srgb, var(--d-primary) 12%, transparent)" stroke="var(--d-border)" strokeWidth={0.5} />
        <rect x={550} y={80} width={180} height={200} rx={8} fill="color-mix(in srgb, var(--d-primary) 12%, transparent)" stroke="var(--d-border)" strokeWidth={0.5} />
        <text x={190} y={174} textAnchor="middle" fontSize={12} fill="var(--d-text-muted)" opacity={0.4}>Americas</text>
        <text x={440} y={144} textAnchor="middle" fontSize={12} fill="var(--d-text-muted)" opacity={0.4}>EMEA</text>
        <text x={640} y={174} textAnchor="middle" fontSize={12} fill="var(--d-text-muted)" opacity={0.4}>APAC</text>

        {/* Supplier pins */}
        {suppliers.map(s => {
          const x = toMapX(s.lng);
          const y = toMapY(s.lat);
          const tierRingSize = 8 + s.tier * 4;
          return (
            <g
              key={s.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect?.(s)}
            >
              {/* Tier ring */}
              <circle cx={x} cy={y} r={tierRingSize} fill="none" stroke={tierColors[s.tier]} strokeWidth={2} opacity={0.5} />
              {/* Status dot */}
              <circle cx={x} cy={y} r={6} fill={statusColors[s.status]} />
              {/* SBTi indicator */}
              {s.sbtiCommitted && (
                <circle cx={x + 8} cy={y - 8} r={3} fill="var(--d-success)" stroke="var(--d-surface)" strokeWidth={1} />
              )}
              {/* Label */}
              <text x={x} y={y + tierRingSize + 12} textAnchor="middle" fontSize={8} fill="var(--d-text)" fontWeight={500}>
                {s.name.split(' ').slice(0, 2).join(' ')}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-success)', display: 'inline-block' }} /> Compliant
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-warning)', display: 'inline-block' }} /> At Risk
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-error)', display: 'inline-block' }} /> Non-Compliant
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, border: '2px solid var(--d-primary)', borderRadius: '50%', display: 'inline-block' }} /> Tier 1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 14, height: 14, border: '2px solid var(--d-warning)', borderRadius: '50%', display: 'inline-block' }} /> Tier 2
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 18, height: 18, border: '2px solid var(--d-error)', borderRadius: '50%', display: 'inline-block' }} /> Tier 3
        </span>
      </div>
    </div>
  );
}
