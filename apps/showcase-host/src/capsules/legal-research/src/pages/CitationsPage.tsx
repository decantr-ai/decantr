import { css } from '@decantr/css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { caseLaw, type CaseLaw } from '../data/mock';
import { DataTable } from '../components/DataTable';
import { CitationGraph } from '../components/CitationGraph';

export function CitationsPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = caseLaw.filter((c) =>
    !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.citation.toLowerCase().includes(query.toLowerCase())
  );

  const statusMap: Record<string, string> = { 'good-law': 'success', 'caution': 'warning', 'overruled': 'error', 'superseded': 'info' };

  const columns = [
    { key: 'citation', header: 'Citation', render: (c: CaseLaw) => <span className="mono-data">{c.citation}</span> },
    { key: 'name', header: 'Case Name', render: (c: CaseLaw) => <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.875rem' }}>{c.name}</span> },
    { key: 'status', header: 'Validity', render: (c: CaseLaw) => <span className="d-annotation" data-status={statusMap[c.status]}>{c.status.replace('-', ' ')}</span>, width: '110px' },
    { key: 'citedBy', header: 'Cited By', render: (c: CaseLaw) => <span className="mono-data">{c.citedBy.toLocaleString()}</span>, width: '90px' },
    { key: 'topics', header: 'Topics', render: (c: CaseLaw) => (
      <div className={css('_flex _wrap _gap1')}>
        {c.topics.slice(0, 2).map((t) => <span key={t} className="d-annotation" style={{ fontSize: '0.625rem' }}>{t}</span>)}
      </div>
    ), width: '180px' },
  ];

  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Citation Library</h1>
        <button className="d-interactive" data-variant="primary" onClick={() => navigate('/citations/check')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          Shepardize
        </button>
      </div>

      <div className={css('_flex _aic _gap2')}>
        <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
        <input className="d-control" placeholder="Search citations..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
      </div>

      <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
        <DataTable columns={columns} data={filtered} getRowKey={(c) => c.id} onRowClick={(c) => navigate(`/research/cases/${c.id}`)} />
      </div>

      <CitationGraph caseIds={filtered.slice(0, 8).map((c) => c.id)} onNodeClick={(id) => navigate(`/research/cases/${id}`)} />
    </div>
  );
}
