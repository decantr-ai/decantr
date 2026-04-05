import { alerts } from '@/data/mock';
import { AlertOctagon } from 'lucide-react';

export function AlertsPage() {
  const counts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    firing: alerts.filter(a => a.status === 'firing').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Alerts</h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
          Silence all
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        <div className="fin-card"><div className="fin-label">Critical</div><div className="fin-metric" data-size="sm" style={{ color: 'var(--d-error)', marginTop: 2 }}>{counts.critical}</div></div>
        <div className="fin-card"><div className="fin-label">High</div><div className="fin-metric" data-size="sm" style={{ color: 'var(--d-error)', marginTop: 2 }}>{counts.high}</div></div>
        <div className="fin-card"><div className="fin-label">Medium</div><div className="fin-metric" data-size="sm" style={{ color: 'var(--d-warning)', marginTop: 2 }}>{counts.medium}</div></div>
        <div className="fin-card"><div className="fin-label">Firing</div><div className="fin-metric" data-size="sm" style={{ color: 'var(--d-error)', marginTop: 2 }}>{counts.firing}</div></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {alerts.map(a => (
          <div key={a.id} className="fin-alert" data-severity={a.severity}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <AlertOctagon size={14} style={{ color: a.severity === 'critical' || a.severity === 'high' ? 'var(--d-error)' : a.severity === 'medium' ? 'var(--d-warning)' : 'var(--d-info)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <span className="fin-badge" data-severity={a.severity}>{a.severity}</span>
                <span className="fin-badge" data-status={a.status}>{a.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.72rem', fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
              <span>{a.service}</span>
              <span>
                <span style={{ color: 'var(--d-text)' }}>{a.value}</span> / <span>{a.threshold}</span>
              </span>
              <span>fired {a.firedAt}</span>
              <span style={{ color: 'var(--d-primary)' }}>{a.runbook}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
