import { FilterBar } from '@/components/FilterBar';
import { DataTable } from '@/components/DataTable';
import { apiTokens } from '@/data/mock';

export function TokensPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>API Tokens</h1>
        <button className="lp-button-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
          Create Token
        </button>
      </div>

      <FilterBar
        placeholder="Search tokens..."
        filters={[
          { label: 'Scope', options: [{ label: 'Deploy', value: 'deploy' }, { label: 'Read', value: 'read' }, { label: 'Full Access', value: 'full' }] },
        ]}
      />

      <DataTable
        keyField="id"
        columns={[
          { key: 'name', label: 'Name', sortable: true, render: (row) => <span style={{ fontWeight: 500 }}>{String(row.name)}</span> },
          { key: 'prefix', label: 'Token', render: (row) => <span className="mono-data" style={{ fontSize: '0.8rem' }}>{String(row.prefix)}...****</span> },
          { key: 'scope', label: 'Scope', render: (row) => (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {(row.scope as string[]).map((s: string) => <span key={s} className="d-annotation">{s}</span>)}
            </div>
          )},
          { key: 'createdBy', label: 'Created By', sortable: true },
          { key: 'lastUsed', label: 'Last Used', sortable: true },
          { key: 'expiresAt', label: 'Expires', render: (row) => <span className="mono-data" style={{ fontSize: '0.8rem' }}>{String(row.expiresAt)}</span> },
        ]}
        data={apiTokens as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
