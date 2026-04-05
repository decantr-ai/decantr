import type { Allocation } from '@/data/mock';

interface AllocationBarProps {
  items: Allocation[];
}

export function AllocationBar({ items }: AllocationBarProps) {
  return (
    <div className="fd-allocation-stack">
      {items.map(item => (
        <div
          key={item.label}
          className="fd-allocation-segment"
          style={{ width: `${item.pct}%`, background: item.color }}
          title={`${item.label}: ${item.pct.toFixed(2)}%`}
        />
      ))}
    </div>
  );
}

interface AllocationLegendProps {
  items: Allocation[];
}

export function AllocationLegend({ items }: AllocationLegendProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span className="fd-sector-dot" style={{ background: item.color }} />
          <span style={{ flex: 1 }}>{item.label}</span>
          <span className="fd-mono" style={{ color: 'var(--d-text-muted)' }}>
            {item.pct.toFixed(2)}%
          </span>
          <span className="fd-mono" style={{ minWidth: 96, textAlign: 'right', fontWeight: 500 }}>
            ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
