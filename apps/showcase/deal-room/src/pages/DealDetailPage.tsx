import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, FileText, MessageCircle, Users, Lock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StageGateBar } from '@/components/StageGateBar';
import { deals, documents, qaThreads, stageGates } from '@/data/mock';

export function DealDetailPage() {
  const { id } = useParams();
  const deal = deals.find(d => d.id === id) || deals[0];
  const dealDocs = documents.filter(d => d.dealId === deal.id).slice(0, 5);
  const dealQa = qaThreads.filter(q => q.dealId === deal.id).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <NavLink to="/deals" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Deals
      </NavLink>

      <PageHeader
        title={deal.name}
        description={`${deal.company} · ${deal.sector}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {deal.confidentiality === 'restricted' && (
              <div className="dr-confidential-badge"><Lock size={9} /> Restricted</div>
            )}
            <span className="d-annotation" data-status="info">{deal.stage.replace('-', ' ')}</span>
          </div>
        }
      />

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Target Size', value: deal.targetSize },
          { label: 'Enterprise Value', value: deal.ev },
          { label: 'EBITDA', value: deal.ebitda },
          { label: 'Multiple', value: deal.multiple },
        ].map(m => (
          <div key={m.label} className="dr-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div className="d-label" style={{ marginBottom: '0.35rem' }}>{m.label}</div>
            <div className="serif-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--d-primary)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Stage Gates */}
      <div className="dr-card" style={{ padding: '1.25rem' }}>
        <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Stage Gates</h2>
        <StageGateBar gates={stageGates} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Documents */}
        <div className="dr-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Key Documents</h2>
            <NavLink to="/documents" style={{ fontSize: '0.7rem', color: 'var(--d-primary)', textDecoration: 'none' }}>View all</NavLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dealDocs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <div className="dr-doc-icon" data-type={doc.type}><FileText size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>v{doc.version} · {doc.size}</div>
                </div>
                {doc.watermarked && <Lock size={12} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Q&A */}
        <div className="dr-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent Q&A</h2>
            <NavLink to="/qa" style={{ fontSize: '0.7rem', color: 'var(--d-primary)', textDecoration: 'none' }}>View all</NavLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dealQa.map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <MessageCircle size={16} style={{ color: 'var(--d-text-muted)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{q.subject}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', display: 'flex', gap: '0.5rem', marginTop: 2 }}>
                    <span className="d-annotation" data-status={q.status === 'open' ? 'warning' : q.status === 'answered' ? 'success' : undefined}>{q.status}</span>
                    <span>{q.replies} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
