import { NavLink } from 'react-router-dom';
import { traces, overviewCharts } from '@/data/mock';
import { LineChart } from '@/components/LineChart';

export function TracesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Traces</h1>
        <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
          18,240 traces · last 15m
        </div>
      </div>

      {/* Latency charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <LineChart title="P50 Latency" data={overviewCharts[2].data} unit="ms" color="var(--d-success)" height={100} />
        <LineChart title="P95 Latency" data={[48, 52, 54, 58, 62, 64, 68, 72, 74, 70, 72, 68]} unit="ms" color="var(--d-primary)" height={100} />
        <LineChart title="P99 Latency" data={overviewCharts[3].data} unit="ms" color="var(--d-warning)" height={100} />
      </div>

      {/* Traces table */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Recent Traces</div>
        <table className="fin-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Trace ID</th>
              <th>Service · Operation</th>
              <th style={{ width: 80 }}>Spans</th>
              <th style={{ width: 100 }}>Duration</th>
              <th style={{ width: 80 }}>Status</th>
              <th style={{ width: 100 }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {traces.map(t => (
              <tr key={t.id}>
                <td>
                  <NavLink to={`/traces/${t.id}`} style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.75rem' }}>
                    {t.id}
                  </NavLink>
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{ color: 'var(--d-text-muted)' }}>{t.rootService}</span> · {t.operation}
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{t.spanCount}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', color: t.duration > 500 ? 'var(--d-warning)' : 'var(--d-text)' }}>
                  {t.duration}ms
                </td>
                <td><span className="fin-badge" data-severity={t.status === 'error' ? 'high' : 'info'}>{t.status}</span></td>
                <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
