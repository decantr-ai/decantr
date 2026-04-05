import { Plus, Copy, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { apiKeys } from '@/data/mock';

export function ApiKeysPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="API Keys"
        description="Create and manage keys to authenticate API requests"
        actions={
          <button className="lp-button-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Plus size={14} /> Create API key
          </button>
        }
      />

      <DataTable
        columns={[
          {
            key: 'name', header: 'Name',
            render: k => (
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{k.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                  Created by {k.createdBy} · {k.createdAt}
                </div>
              </div>
            ),
          },
          {
            key: 'prefix', header: 'Key',
            render: k => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <code className="lp-code-inline">{k.prefix}{'•'.repeat(24)}</code>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.2rem', border: 'none' }} aria-label="Copy">
                  <Copy size={11} />
                </button>
              </div>
            ),
          },
          {
            key: 'env', header: 'Env',
            render: k => (
              <span className="d-annotation" data-status={k.environment === 'live' ? 'success' : 'warning'} style={{ fontSize: '0.65rem' }}>
                {k.environment}
              </span>
            ),
          },
          {
            key: 'scope', header: 'Scope',
            render: k => (
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {k.scope.map(s => (
                  <code key={s} className="lp-code-inline" style={{ fontSize: '0.65rem' }}>{s}</code>
                ))}
              </div>
            ),
          },
          {
            key: 'lastUsed', header: 'Last Used',
            render: k => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{k.lastUsed}</span>,
          },
          {
            key: 'status', header: 'Status',
            render: k => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                <span className="lp-status-dot" data-status={k.status === 'active' ? 'active' : 'revoked'} />
                {k.status}
              </span>
            ),
          },
          {
            key: 'actions', header: '', width: '40px',
            render: () => (
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', border: 'none' }} aria-label="More">
                <MoreHorizontal size={14} />
              </button>
            ),
          },
        ]}
        rows={apiKeys}
      />
    </div>
  );
}
