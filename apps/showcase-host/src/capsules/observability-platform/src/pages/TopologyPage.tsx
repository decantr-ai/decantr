import { services } from '@/data/mock';
import { ServiceMap } from '@/components/ServiceMap';

export function TopologyPage() {
  const counts = {
    healthy: services.filter(s => s.health === 'healthy').length,
    degraded: services.filter(s => s.health === 'degraded').length,
    critical: services.filter(s => s.health === 'critical').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Service Topology</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="fin-badge" data-health="healthy"><span className="fin-status-dot" data-health="healthy" /> {counts.healthy} healthy</span>
          <span className="fin-badge" data-health="degraded"><span className="fin-status-dot" data-health="degraded" /> {counts.degraded} degraded</span>
          <span className="fin-badge" data-health="critical"><span className="fin-status-dot" data-health="critical" /> {counts.critical} critical</span>
        </div>
      </div>
      <ServiceMap nodes={services} height={520} />
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Services</div>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Service</th><th>Type</th><th>Health</th><th>RPS</th><th>P99</th><th>Error %</th><th>Dependencies</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{s.name}</td>
                <td style={{ color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>{s.type}</td>
                <td><span className="fin-badge" data-health={s.health}>{s.health}</span></td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{s.rps.toLocaleString()}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{s.p99}ms</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', color: s.errorRate > 1 ? 'var(--d-error)' : s.errorRate > 0.5 ? 'var(--d-warning)' : 'var(--d-text)' }}>
                  {s.errorRate.toFixed(2)}
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{s.dependsOn.length || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
