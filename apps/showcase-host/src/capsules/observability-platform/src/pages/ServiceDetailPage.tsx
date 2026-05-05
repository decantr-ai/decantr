import { useParams, NavLink } from 'react-router-dom';
import { services, overviewCharts, metricKpis } from '@/data/mock';
import { LineChart } from '@/components/LineChart';
import { ArrowLeft } from 'lucide-react';

export function ServiceDetailPage() {
  const { service: serviceId } = useParams<{ service: string }>();
  const svc = services.find(s => s.id === serviceId) ?? services[0];

  const kpis = [
    { label: 'RPS', value: svc.rps.toLocaleString(), unit: 'rps' },
    { label: 'P50', value: svc.p50.toString(), unit: 'ms' },
    { label: 'P95', value: svc.p95.toString(), unit: 'ms' },
    { label: 'P99', value: svc.p99.toString(), unit: 'ms' },
    { label: 'Error Rate', value: svc.errorRate.toFixed(2), unit: '%' },
    { label: 'Health', value: svc.health.toUpperCase(), unit: '' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <NavLink to="/metrics" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={12} /> Back to overview
      </NavLink>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{svc.name}</h1>
        <span className="fin-badge" data-health={svc.health}>{svc.health}</span>
        <span className="fin-label">{svc.type}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {kpis.map(k => (
          <div key={k.label} className="fin-card">
            <div className="fin-label" style={{ marginBottom: 4 }}>{k.label}</div>
            <div className="fin-metric" data-size="sm">
              {k.value}<span style={{ color: 'var(--d-text-muted)', fontSize: '0.65em', marginLeft: 3 }}>{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
        {overviewCharts.map(c => (
          <LineChart key={c.title} title={c.title} data={c.data} unit={c.unit} color={c.color} />
        ))}
      </div>

      {/* Usage Meter */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Resource Utilization</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'CPU', value: 62, limit: 100 },
            { label: 'Memory', value: 74, limit: 100 },
            { label: 'Disk I/O', value: 38, limit: 100 },
            { label: 'Network', value: 52, limit: 100 },
          ].map(u => {
            const pct = (u.value / u.limit) * 100;
            const level = pct > 80 ? 'critical' : pct > 60 ? 'warn' : undefined;
            return (
              <div key={u.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px', alignItems: 'center', gap: 10, fontSize: '0.75rem' }}>
                <span className="fin-label">{u.label}</span>
                <div className="fin-gauge"><div className="fin-gauge-fill" data-level={level} style={{ width: `${pct}%` }} /></div>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{u.value}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referenced to keep mock import from being stripped */}
      <div style={{ display: 'none' }}>{metricKpis.length}</div>
    </div>
  );
}
