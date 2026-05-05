import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { deals } from '@/data/mock';

const stageColors: Record<string, string> = {
  'sourcing': 'info',
  'due-diligence': 'warning',
  'negotiation': 'warning',
  'closing': 'success',
  'closed': 'success',
  'passed': 'error',
};

export function DealsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Active Deals"
        description="All deals in the current portfolio."
        actions={
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
            <Plus size={14} /> New Deal
          </button>
        }
      />
      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Deal',
            render: (d) => (
              <div>
                <NavLink to={`/deals/${d.id}`} style={{ fontWeight: 600, color: 'var(--d-text)', textDecoration: 'none', fontFamily: 'var(--d-font-display)' }}>{d.name}</NavLink>
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{d.company}</div>
              </div>
            ),
          },
          { key: 'sector', header: 'Sector', render: (d) => <span style={{ fontSize: '0.8rem' }}>{d.sector}</span> },
          {
            key: 'stage',
            header: 'Stage',
            render: (d) => <span className="d-annotation" data-status={stageColors[d.stage]}>{d.stage.replace('-', ' ')}</span>,
          },
          { key: 'targetSize', header: 'Target', render: (d) => <span className="mono-data" style={{ color: 'var(--d-primary)' }}>{d.targetSize}</span> },
          { key: 'ev', header: 'EV', render: (d) => <span className="mono-data">{d.ev}</span> },
          { key: 'multiple', header: 'Multiple', render: (d) => <span className="mono-data">{d.multiple}</span> },
          {
            key: 'lead',
            header: 'Lead',
            render: (d) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="dr-monogram" style={{ width: 22, height: 22, fontSize: '0.5rem' }}>{d.leadAvatar}</div>
                <span style={{ fontSize: '0.8rem' }}>{d.lead}</span>
              </div>
            ),
          },
          { key: 'lastActivity', header: 'Last Activity', render: (d) => <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.lastActivity}</span> },
        ]}
        rows={deals}
      />
    </div>
  );
}
