import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { webhooks, webhookDeliveries } from '@/data/mock';

export function WebhookDetailPage() {
  const { id } = useParams();
  const webhook = webhooks.find(w => w.id === id) || webhooks[0];
  const deliveries = webhookDeliveries.filter(d => d.webhookId === webhook.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <NavLink to="/webhooks" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={12} /> Back to endpoints
        </NavLink>
        <PageHeader
          title={webhook.description}
          description={webhook.url}
        />
      </div>

      {/* Config */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '0.75rem' }}>Configuration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}>
              <span className="lp-status-dot" data-status={webhook.status} />
              {webhook.status}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Rate</div>
            <div className="mono-data">{webhook.successRate}%</div>
          </div>
          <div>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</div>
            <div className="mono-data">{webhook.createdAt}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signing secret</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <code className="lp-code-inline" style={{ fontSize: '0.75rem' }}>{webhook.secret}</code>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', border: 'none' }}><Copy size={11} /></button>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event subscriptions</div>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {webhook.events.map(e => <code key={e} className="lp-code-inline" style={{ fontSize: '0.7rem' }}>{e}</code>)}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery log */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 className="d-label">Delivery Log</h3>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
        {deliveries.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>
            No deliveries yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {deliveries.map(d => (
              <details key={d.id} style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)' }}>
                <summary style={{ padding: '0.625rem 0.75rem', cursor: 'pointer', display: 'grid', gridTemplateColumns: '80px 100px 1fr 70px 60px 40px', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', listStyle: 'none' }}>
                  <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>{d.timestamp}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'capitalize' }}>
                    <span className="lp-status-dot" data-status={d.status} /> {d.status}
                  </span>
                  <code className="mono-data">{d.event}</code>
                  <span className="mono-data" style={{ color: d.statusCode < 300 ? 'var(--d-success)' : 'var(--d-error)' }}>{d.statusCode}</span>
                  <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>{d.duration < 1000 ? `${d.duration}ms` : `${(d.duration / 1000).toFixed(1)}s`}</span>
                  <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.65rem', textAlign: 'right' }}>#{d.attempt}</span>
                </summary>
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--d-border)', background: 'var(--d-bg)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Payload</div>
                  <pre className="lp-code" style={{ fontSize: '0.75rem' }}>{d.payload}</pre>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
