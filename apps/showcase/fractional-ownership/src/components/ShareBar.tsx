import type { Allocation } from '@/data/mock';

interface ShareBarProps {
  items: Allocation[];
}

export function ShareBar({ items }: ShareBarProps) {
  return (
    <div className="fo-share-stack">
      {items.map(item => (
        <div
          key={item.label}
          className="fo-share-segment"
          style={{ width: `${item.pct}%`, background: item.color }}
          title={`${item.label}: ${item.pct.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}

interface ShareLegendProps {
  items: Allocation[];
}

export function ShareLegend({ items }: ShareLegendProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span className="fo-sector-dot" style={{ background: item.color }} />
          <span style={{ flex: 1 }}>{item.label}</span>
          <span className="fo-mono" style={{ color: 'var(--d-text-muted)' }}>
            {item.pct.toFixed(1)}%
          </span>
          <span className="fo-mono" style={{ minWidth: 96, textAlign: 'right', fontWeight: 500 }}>
            ${item.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
}
