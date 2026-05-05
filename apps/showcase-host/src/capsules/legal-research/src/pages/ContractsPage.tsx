import { css } from '@decantr/css';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contracts, type Contract } from '../data/mock';
import { DataTable } from '../components/DataTable';

export function ContractsPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = contracts.filter((c) => {
    const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.client.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const statusMap: Record<string, string> = { draft: 'info', review: 'warning', executed: 'success', expired: 'error' };

  const columns = [
    { key: 'title', header: 'Contract', render: (c: Contract) => (
      <div>
        <div className={css('_fontsemi')} style={{ fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>{c.title}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{c.client}</div>
      </div>
    )},
    { key: 'type', header: 'Type', render: (c: Contract) => <span className="d-annotation">{c.type}</span>, width: '100px' },
    { key: 'status', header: 'Status', render: (c: Contract) => <span className="d-annotation" data-status={statusMap[c.status]}>{c.status}</span>, width: '100px' },
    { key: 'version', header: 'Version', render: (c: Contract) => <span className="mono-data">v{c.version}</span>, width: '80px' },
    { key: 'assignee', header: 'Assignee', render: (c: Contract) => <span style={{ fontSize: '0.8125rem' }}>{c.assignee}</span>, width: '100px' },
    { key: 'modified', header: 'Modified', render: (c: Contract) => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.lastModified}</span>, width: '110px' },
  ];

  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Contracts</h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <Plus size={14} /> New Contract
        </button>
      </div>

      <div className={css('_flex _aic _gap3 _wrap')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input className="d-control" placeholder="Search contracts..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        </div>
        <select className="d-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="executed">Executed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
        <DataTable columns={columns} data={filtered} getRowKey={(c) => c.id} onRowClick={(c) => navigate(`/contracts/${c.id}`)} />
      </div>
    </div>
  );
}
