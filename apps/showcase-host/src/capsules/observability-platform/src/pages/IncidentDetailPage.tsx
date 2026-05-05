import { useParams, NavLink } from 'react-router-dom';
import { incidents, incidentUpdates, overviewCharts } from '@/data/mock';
import { LineChart } from '@/components/LineChart';
import { ArrowLeft } from 'lucide-react';

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const inc = incidents.find(i => i.id === id) ?? incidents[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NavLink to="/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={12} /> Back to incidents
      </NavLink>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className="fin-badge" style={{ fontWeight: 600 }}>{inc.id.toUpperCase()}</span>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{inc.title}</h1>
        <span className="fin-badge" data-severity={inc.severity}>{inc.severity}</span>
        <span className="fin-badge" data-status={inc.status}>{inc.status}</span>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {[
          { label: 'Duration', value: inc.duration },
          { label: 'Started', value: inc.startedAt },
          { label: 'Commander', value: inc.commander },
          { label: 'Updates', value: inc.updates.toString() },
          { label: 'Services', value: inc.affectedServices.length.toString() },
        ].map(s => (
          <div key={s.label} className="fin-card" style={{ padding: '0.625rem' }}>
            <div className="fin-label">{s.label}</div>
            <div className="fin-metric" data-size="sm" style={{ marginTop: 2, fontSize: '0.85rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <LineChart title="Error Rate (during incident)" data={[0.2, 0.3, 0.5, 0.8, 1.2, 1.8, 2.1, 2.18, 2.15]} unit="%" color="var(--d-error)" height={100} />
        <LineChart title="P99 Latency" data={[142, 180, 240, 320, 420, 520, 580, 612, 605]} unit="ms" color="var(--d-warning)" height={100} />
        <LineChart title="DB Connections" data={overviewCharts[0].data.map(x => Math.min(50, x / 1000))} unit="" color="var(--d-primary)" height={100} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Timeline */}
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {incidentUpdates.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', gap: 10, paddingBottom: 12, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 2,
                    background: u.type === 'mitigation' ? 'var(--d-success)' : u.type === 'detection' ? 'var(--d-warning)' : u.type === 'status' ? 'var(--d-info)' : 'var(--d-text-muted)',
                    marginTop: 3, flexShrink: 0,
                  }} />
                  {i < incidentUpdates.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--d-border)', marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{u.timestamp}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{u.author}</span>
                    <span className="fin-label">{u.type}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', lineHeight: 1.5, marginTop: 2 }}>{u.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Affected Services</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inc.affectedServices.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 2, fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace' }}>
                <span className="fin-status-dot" data-health="critical" />
                <span style={{ flex: 1 }}>{s}</span>
                <span className="fin-badge" data-severity="high">impacted</span>
              </div>
            ))}
          </div>
          <div className="fin-label" style={{ margin: '16px 0 10px' }}>Post-Mortem</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>
            Post-mortem doc will be auto-generated 24h after resolution. <br />
            Root cause, timeline, action items, and customer impact will be captured here.
          </div>
        </div>
      </div>
    </div>
  );
}
