import { NavLink } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { webhooks, webhookDeliveries } from '@/data/mock';

export function ApiWebhooksPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Webhooks"
        description="HTTP endpoints that receive real-time event notifications"
        actions={
          <button className="lp-button-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Plus size={14} /> Add endpoint
          </button>
        }
      />

      {/* Endpoint cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {webhooks.map(wh => (
          <NavLink
            key={wh.id}
            to={`/webhooks/${wh.id}`}
            className="lp-card-elevated"
            style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <code className="mono-data" style={{ fontSize: '0.8rem', color: 'var(--d-text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {wh.url}
                </code>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: 2 }}>{wh.description}</div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0, marginLeft: '0.5rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'capitalize' }}>
                <span className="lp-status-dot" data-status={wh.status} />
                {wh.status}
              </span>
              <span className="mono-data" style={{ color: wh.successRate >= 95 ? 'var(--d-success)' : 'var(--d-warning)' }}>
                {wh.successRate}% success
              </span>
              <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>{wh.lastDelivery}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.625rem' }}>
              {wh.events.slice(0, 3).map(e => (
                <code key={e} className="lp-code-inline" style={{ fontSize: '0.65rem' }}>{e}</code>
              ))}
              {wh.events.length > 3 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>+{wh.events.length - 3}</span>
              )}
            </div>
          </NavLink>
        ))}
      </div>

      {/* Debugger */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '0.75rem' }}>Delivery Debugger — Recent attempts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {webhookDeliveries.slice(0, 6).map(d => (
            <div
              key={d.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 90px 1fr 70px 70px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--d-border)',
                borderRadius: 'var(--d-radius-sm)',
                fontSize: '0.75rem',
              }}
            >
              <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>{d.timestamp}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'capitalize' }}>
                <span className="lp-status-dot" data-status={d.status} />
                {d.status}
              </span>
              <code className="mono-data" style={{ color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.event}</code>
              <span className="mono-data" style={{ color: d.statusCode < 300 ? 'var(--d-success)' : 'var(--d-error)' }}>
                {d.statusCode}
              </span>
              <span className="mono-data" style={{ color: 'var(--d-text-muted)', textAlign: 'right' }}>
                {d.duration < 1000 ? `${d.duration}ms` : `${(d.duration / 1000).toFixed(1)}s`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
