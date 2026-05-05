import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCaseById, caseLaw } from '../data/mock';
import { CaseBriefCard } from '../components/CaseBriefCard';
import { CitationGraph } from '../components/CitationGraph';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const caseItem = getCaseById(id || '');

  if (!caseItem) {
    return (
      <div className={css('_flex _col _aic _jcc')} style={{ padding: '3rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif' }}>Case not found.</p>
        <Link to="/research" style={{ color: 'var(--d-primary)', textDecoration: 'none', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Back to search
        </Link>
      </div>
    );
  }

  // Build related cases for graph
  const relatedIds = [caseItem.id, ...caseItem.cites];
  const citedByIds = caseLaw.filter((c) => c.cites.includes(caseItem.id)).map((c) => c.id);
  const allGraphIds = [...new Set([...relatedIds, ...citedByIds])];

  return (
    <div className={css('_flex _col _gap4')}>
      <Link to="/research" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>
        <ArrowLeft size={14} /> Back to search
      </Link>

      <CaseBriefCard caseItem={caseItem} />

      {/* Full opinion excerpt */}
      <div className="counsel-citation">
        <p style={{ fontStyle: 'italic', lineHeight: 1.8 }}>
          &ldquo;We conclude that in the field of public education, the doctrine of &lsquo;separate but equal&rsquo; has no place. Separate educational facilities are inherently unequal.&rdquo;
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'normal', color: 'var(--d-text-muted)' }}>
          &mdash; {caseItem.name}, {caseItem.citation}
        </p>
      </div>

      {/* Citation network */}
      <CitationGraph caseIds={allGraphIds} onNodeClick={() => {}} height={300} />

      {/* Citing cases list */}
      {citedByIds.length > 0 && (
        <div>
          <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            Cited By ({citedByIds.length})
          </p>
          <div className={css('_flex _col _gap3')}>
            {citedByIds.map((cid) => {
              const c = getCaseById(cid);
              if (!c) return null;
              return <CaseBriefCard key={c.id} caseItem={c} compact />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
