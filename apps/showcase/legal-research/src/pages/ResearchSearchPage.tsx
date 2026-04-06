import { css } from '@decantr/css';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseLaw, type CaseLaw } from '../data/mock';
import { DataTable } from '../components/DataTable';
import { CitationGraph } from '../components/CitationGraph';

export function ResearchSearchPage() {
  const [query, setQuery] = useState('');
  const [courtFilter, setCourtFilter] = useState('all');
  const [showGraph, setShowGraph] = useState(true);
  const navigate = useNavigate();

  const filtered = caseLaw.filter((c) => {
    const matchesQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.citation.toLowerCase().includes(query.toLowerCase());
    const matchesCourt = courtFilter === 'all' || c.court === courtFilter;
    return matchesQuery && matchesCourt;
  });

  const columns = [
    { key: 'name', header: 'Case', render: (c: CaseLaw) => (
      <div>
        <div className={css('_fontsemi')} style={{ fontSize: '0.875rem', fontFamily: 'Georgia, serif' }}>{c.name}</div>
        <div className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{c.citation}</div>
      </div>
    )},
    { key: 'court', header: 'Court', render: (c: CaseLaw) => <span style={{ fontSize: '0.8125rem' }}>{c.court}</span>, width: '120px' },
    { key: 'year', header: 'Year', render: (c: CaseLaw) => <span className="mono-data">{c.year}</span>, width: '80px' },
    { key: 'status', header: 'Status', render: (c: CaseLaw) => {
      const statusMap: Record<string, string> = { 'good-law': 'success', 'caution': 'warning', 'overruled': 'error', 'superseded': 'info' };
      return <span className="d-annotation" data-status={statusMap[c.status]}>{c.status.replace('-', ' ')}</span>;
    }, width: '110px' },
    { key: 'citedBy', header: 'Cited By', render: (c: CaseLaw) => <span className="mono-data">{c.citedBy.toLocaleString()}</span>, width: '90px' },
  ];

  return (
    <div className={css('_flex _col _gap4')}>
      {/* Search filter bar */}
      <div className={css('_flex _aic _gap3 _wrap')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search case law..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <select className="d-control" value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All Courts</option>
          <option value="Supreme Court">Supreme Court</option>
        </select>
        <button
          className="d-interactive"
          data-variant={showGraph ? 'primary' : undefined}
          onClick={() => setShowGraph(!showGraph)}
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
        >
          <SlidersHorizontal size={14} />
          Graph
        </button>
      </div>

      {/* Data table */}
      <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/research/cases/${c.id}`)}
        />
      </div>

      {/* Citation graph */}
      {showGraph && <CitationGraph caseIds={filtered.map((c) => c.id)} onNodeClick={(id) => navigate(`/research/cases/${id}`)} />}
    </div>
  );
}
