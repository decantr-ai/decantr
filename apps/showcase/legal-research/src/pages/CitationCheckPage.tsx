import { css } from '@decantr/css';
import { useState } from 'react';
import { caseLaw, type CaseLaw } from '../data/mock';
import { CitationGraph } from '../components/CitationGraph';
import { DataTable } from '../components/DataTable';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

export function CitationCheckPage() {
  const [checkedIds] = useState(() => caseLaw.map((c) => c.id));

  const statusMap: Record<string, string> = { 'good-law': 'success', 'caution': 'warning', 'overruled': 'error', 'superseded': 'info' };
  const statusIcon: Record<string, React.ElementType> = { 'good-law': ShieldCheck, 'caution': AlertTriangle, 'overruled': XCircle, 'superseded': AlertTriangle };

  const goodCount = caseLaw.filter((c) => c.status === 'good-law').length;
  const cautionCount = caseLaw.filter((c) => c.status === 'caution').length;
  const badCount = caseLaw.filter((c) => c.status === 'overruled' || c.status === 'superseded').length;

  const columns = [
    { key: 'status-icon', header: '', render: (c: CaseLaw) => {
      const Icon = statusIcon[c.status] || ShieldCheck;
      const color = c.status === 'good-law' ? 'var(--d-success)' : c.status === 'caution' ? 'var(--d-warning)' : 'var(--d-error)';
      return <Icon size={16} style={{ color }} />;
    }, width: '40px' },
    { key: 'citation', header: 'Citation', render: (c: CaseLaw) => <span className="mono-data">{c.citation}</span> },
    { key: 'name', header: 'Case', render: (c: CaseLaw) => <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.875rem' }}>{c.name}</span> },
    { key: 'status', header: 'Status', render: (c: CaseLaw) => <span className="d-annotation" data-status={statusMap[c.status]}>{c.status.replace('-', ' ')}</span>, width: '110px' },
  ];

  return (
    <div className={css('_flex _col _gap4')}>
      <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Shepardize Check</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <ShieldCheck size={24} style={{ color: 'var(--d-success)', margin: '0 auto 0.5rem' }} />
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-success)' }}>{goodCount}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Good Law</p>
        </div>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <AlertTriangle size={24} style={{ color: 'var(--d-warning)', margin: '0 auto 0.5rem' }} />
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-warning)' }}>{cautionCount}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Caution</p>
        </div>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <XCircle size={24} style={{ color: 'var(--d-error)', margin: '0 auto 0.5rem' }} />
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-error)' }}>{badCount}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Overruled / Superseded</p>
        </div>
      </div>

      {/* Citation graph */}
      <CitationGraph caseIds={checkedIds} height={320} />

      {/* Results table */}
      <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
        <DataTable columns={columns} data={caseLaw} getRowKey={(c) => c.id} />
      </div>
    </div>
  );
}
