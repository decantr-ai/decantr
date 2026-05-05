import { NavLink } from 'react-router-dom';
import { metricKpis, overviewCharts, services, slos } from '@/data/mock';
import { MetricKpiGrid } from '@/components/MetricKpiGrid';
import { LineChart } from '@/components/LineChart';
import { ServiceMap } from '@/components/ServiceMap';

export function MetricsOverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Metrics Overview</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>Real-time platform health · last 1h</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="fin-badge">1h</span>
          <span className="fin-badge" data-severity="info">6h</span>
          <span className="fin-badge">24h</span>
          <span className="fin-badge">7d</span>
        </div>
      </div>

      <MetricKpiGrid items={metricKpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
        {overviewCharts.map(c => (
          <LineChart key={c.title} title={c.title} data={c.data} unit={c.unit} color={c.color} />
        ))}
      </div>

      {/* SLO Tracking */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>SLO Tracking — 30d window</div>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Target</th>
              <th>Current</th>
              <th style={{ width: 140 }}>Budget</th>
              <th>Burn Rate</th>
            </tr>
          </thead>
          <tbody>
            {slos.map(slo => {
              const over = slo.current >= slo.target;
              const budgetLevel = slo.budget < 0 ? 'critical' : slo.budget < 30 ? 'warn' : undefined;
              const budgetPct = Math.max(0, Math.min(100, slo.budget));
              return (
                <tr key={slo.id}>
                  <td style={{ fontFamily: 'ui-monospace, monospace' }}>{slo.name}</td>
                  <td style={{ color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>{slo.service}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{slo.target}%</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', color: over ? 'var(--d-success)' : 'var(--d-error)' }}>{slo.current}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="fin-gauge" style={{ flex: 1 }}>
                        <div className="fin-gauge-fill" data-level={budgetLevel} style={{ width: `${budgetPct}%` }} />
                      </div>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', fontVariantNumeric: 'tabular-nums', minWidth: 42, textAlign: 'right' }}>{slo.budget}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', color: slo.budgetBurn > 10 ? 'var(--d-error)' : slo.budgetBurn > 3 ? 'var(--d-warning)' : 'var(--d-success)' }}>
                    {slo.budgetBurn.toFixed(1)}x
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Service Map */}
      <div className="fin-card">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="fin-label">Service Topology</div>
          <NavLink to="/traces/topology" style={{ fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color: 'var(--d-primary)', textDecoration: 'none' }}>
            Expand →
          </NavLink>
        </div>
        <ServiceMap nodes={services} height={500} />
      </div>
    </div>
  );
}
