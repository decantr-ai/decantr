import { css } from '@decantr/css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { matters, type Matter } from '../data/mock';
import { DataTable } from '../components/DataTable';
import { MatterCard } from '../components/MatterCard';

type ViewMode = 'table' | 'kanban';

const KANBAN_COLUMNS = ['active', 'pending', 'on-hold', 'closed'] as const;
const KANBAN_LABELS: Record<string, string> = { active: 'Active', pending: 'Pending', 'on-hold': 'On Hold', closed: 'Closed' };

export function MattersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const navigate = useNavigate();

  const columns = [
    { key: 'title', header: 'Matter', render: (m: Matter) => (
      <div>
        <div className={css('_fontsemi')} style={{ fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>{m.title}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{m.client}</div>
      </div>
    )},
    { key: 'type', header: 'Type', render: (m: Matter) => <span className="d-annotation">{m.type}</span>, width: '100px' },
    { key: 'status', header: 'Status', render: (m: Matter) => {
      const sm: Record<string, string> = { active: 'success', pending: 'warning', closed: 'info', 'on-hold': 'error' };
      return <span className="d-annotation" data-status={sm[m.status]}>{m.status}</span>;
    }, width: '100px' },
    { key: 'priority', header: 'Priority', render: (m: Matter) => <span className={`counsel-${m.priority === 'high' ? 'oxblood' : ''}`} style={{ fontSize: '0.8125rem', fontWeight: m.priority === 'high' ? 600 : 400 }}>{m.priority}</span>, width: '80px' },
    { key: 'hours', header: 'Hours', render: (m: Matter) => <span className="mono-data">{m.billableHours}h</span>, width: '80px' },
    { key: 'due', header: 'Due', render: (m: Matter) => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.dueDate}</span>, width: '110px' },
  ];

  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Matters</h1>
        <div className={css('_flex _gap2')}>
          <button className="d-interactive" data-variant={viewMode === 'kanban' ? 'primary' : undefined} onClick={() => setViewMode('kanban')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Board</button>
          <button className="d-interactive" data-variant={viewMode === 'table' ? 'primary' : undefined} onClick={() => setViewMode('table')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Table</button>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Plus size={14} /> New Matter
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
          <DataTable columns={columns} data={matters} getRowKey={(m) => m.id} onRowClick={(m) => navigate(`/matters/${m.id}`)} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, 1fr)`, gap: '1rem', minHeight: 400 }}>
          {KANBAN_COLUMNS.map((status) => {
            const items = matters.filter((m) => m.status === status);
            return (
              <div key={status} style={{ background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', padding: '0.75rem' }}>
                <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
                  <span className="d-label">{KANBAN_LABELS[status]}</span>
                  <span className="d-annotation">{items.length}</span>
                </div>
                <div className={css('_flex _col _gap3')}>
                  {items.map((m) => (
                    <MatterCard key={m.id} matter={m} onClick={() => navigate(`/matters/${m.id}`)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
