import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { contracts, contractDiffLines } from '../data/mock';
import { ContractDiff } from '../components/ContractDiff';

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contract = contracts.find((c) => c.id === id);

  if (!contract) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-text-muted)' }}>
        <p style={{ fontFamily: 'Georgia, serif' }}>Contract not found.</p>
        <Link to="/contracts" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Back to contracts</Link>
      </div>
    );
  }

  const statusMap: Record<string, string> = { draft: 'info', review: 'warning', executed: 'success', expired: 'error' };

  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <Link to="/contracts" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>
          <ArrowLeft size={14} /> Back to contracts
        </Link>
        <div className={css('_flex _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Download size={14} /> Export
          </button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="counsel-card" style={{ padding: '1.25rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
          <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>{contract.title}</h1>
          <span className="d-annotation" data-status={statusMap[contract.status]}>{contract.status}</span>
        </div>
        <div className={css('_flex _aic _gap4')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif' }}>
          <span>Client: {contract.client}</span>
          <span>&middot;</span>
          <span>Type: {contract.type}</span>
          <span>&middot;</span>
          <span className="mono-data">v{contract.version}</span>
          <span>&middot;</span>
          <span>Assigned to {contract.assignee}</span>
        </div>
      </div>

      {/* Redline track changes */}
      <div>
        <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Tracked Changes
        </p>
        <ContractDiff lines={contractDiffLines} title={`${contract.title} — v${contract.version - 1} → v${contract.version}`} />
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-success)' }}>
            {contractDiffLines.filter((l) => l.type === 'add').length}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Additions</p>
        </div>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-error)' }}>
            {contractDiffLines.filter((l) => l.type === 'remove').length}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Deletions</p>
        </div>
        <div className="counsel-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-text)' }}>
            {new Set(contractDiffLines.filter((l) => l.author).map((l) => l.author)).size}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Authors</p>
        </div>
      </div>
    </div>
  );
}
