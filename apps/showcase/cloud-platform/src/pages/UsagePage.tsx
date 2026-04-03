import { usageMetrics, usageCharts } from '@/data/mock';

export function UsagePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Usage</h1>

      {/* Resource Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {usageMetrics.map(metric => {
          const pct = (metric.value / metric.limit) * 100;
          const level = pct > 90 ? 'critical' : pct > 70 ? 'warn' : 'safe';
          return (
            <div key={metric.label} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="d-label">{metric.label}</span>
                <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  {metric.value}{metric.unit} / {metric.limit}{metric.unit}
                </span>
              </div>
              <div className="lp-gauge-track">
                <div className="lp-gauge-fill" data-level={level} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                <span className="mono-data" style={{ fontSize: '0.75rem', color: level === 'critical' ? 'var(--d-error)' : level === 'warn' ? 'var(--d-warning)' : 'var(--d-text-muted)' }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {usageCharts.map(chart => (
          <div key={chart.title} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{chart.title}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {chart.data.map(d => (
                  <span key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Chart visualization */}
            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 0.25rem' }}>
              {chart.data[0].values.map((_, i) => {
                const maxVal = Math.max(...chart.data.flatMap(d => d.values));
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch', justifyContent: 'flex-end', height: '100%' }}>
                    {chart.data.map(d => (
                      <div
                        key={d.label}
                        className="lp-chart-bar"
                        style={{
                          height: `${(d.values[i] / maxVal) * 100}%`,
                          background: d.color === 'var(--d-error)' || d.color === 'var(--d-success)'
                            ? d.color
                            : `linear-gradient(180deg, ${d.color}, color-mix(in srgb, ${d.color} 50%, transparent))`,
                          opacity: 0.8,
                          borderRadius: '2px 2px 0 0',
                          minHeight: 2,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', flex: 1, textAlign: 'center' }}>{day}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
