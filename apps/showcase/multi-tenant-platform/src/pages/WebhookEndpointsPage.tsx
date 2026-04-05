import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { webhooks } from '@/data/mock';

export function WebhookEndpointsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Webhook Endpoints"
        description="All configured webhook endpoints and their delivery health"
        actions={
          <button className="lp-button-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Plus size={14} /> Add endpoint
          </button>
        }
      />

      <DataTable
        columns={[
          {
            key: 'url', header: 'Endpoint',
            render: w => (
              <NavLink to={`/webhooks/${w.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <code className="mono-data" style={{ fontSize: '0.8rem', color: 'var(--d-primary)' }}>{w.url}</code>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: 2 }}>{w.description}</div>
              </NavLink>
            ),
          },
          {
            key: 'events', header: 'Events',
            render: w => (
              <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                {w.events.length} subscription{w.events.length !== 1 ? 's' : ''}
              </span>
            ),
          },
          {
            key: 'success', header: 'Success Rate',
            render: w => (
              <span className="mono-data" style={{ fontSize: '0.75rem', color: w.successRate >= 95 ? 'var(--d-success)' : 'var(--d-warning)' }}>
                {w.successRate}%
              </span>
            ),
          },
          {
            key: 'status', header: 'Status',
            render: w => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                <span className="lp-status-dot" data-status={w.status} />
                {w.status}
              </span>
            ),
          },
          {
            key: 'lastDelivery', header: 'Last Delivery',
            render: w => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{w.lastDelivery}</span>,
          },
        ]}
        rows={webhooks}
      />
    </div>
  );
}
