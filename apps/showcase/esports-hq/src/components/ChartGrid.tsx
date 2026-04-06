interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

function ChartBar({ label, value, maxValue, color = 'var(--d-primary)' }: ChartBarProps) {
  const pct = Math.round((value / maxValue) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.75rem', width: 36, textAlign: 'right', color: 'var(--d-text-muted)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 20, background: 'var(--d-surface)', borderRadius: 'var(--d-radius-sm)', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 'var(--d-radius-sm)',
          transition: 'width 600ms ease-out',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--d-font-mono, monospace)', width: 50, flexShrink: 0 }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

interface ChartGridProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
}

export function ChartGrid({ title, data, color }: ChartGridProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
      <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.map(item => (
          <ChartBar key={item.label} label={item.label} value={item.value} maxValue={maxValue} color={color} />
        ))}
      </div>
    </div>
  );
}
