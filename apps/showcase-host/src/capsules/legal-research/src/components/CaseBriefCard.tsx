import { css } from '@decantr/css';
import { type CaseLaw } from '../data/mock';

const STATUS_LABELS: Record<CaseLaw['status'], { label: string; status: string }> = {
  'good-law': { label: 'Good Law', status: 'success' },
  'caution': { label: 'Caution', status: 'warning' },
  'overruled': { label: 'Overruled', status: 'error' },
  'superseded': { label: 'Superseded', status: 'info' },
};

interface CaseBriefCardProps {
  caseItem: CaseLaw;
  compact?: boolean;
  onClick?: () => void;
}

export function CaseBriefCard({ caseItem, compact, onClick }: CaseBriefCardProps) {
  const statusInfo = STATUS_LABELS[caseItem.status];

  return (
    <div
      className="counsel-card"
      data-interactive={onClick ? '' : undefined}
      onClick={onClick}
      style={{ padding: compact ? '0.75rem' : '1.25rem', cursor: onClick ? 'pointer' : undefined }}
    >
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: compact ? '0.375rem' : '0.75rem' }}>
        <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
          {caseItem.citation}
        </span>
        <span className="d-annotation" data-status={statusInfo.status}>
          {statusInfo.label}
        </span>
      </div>
      <h3 className="counsel-header" style={{ fontSize: compact ? '0.9375rem' : '1.125rem', marginBottom: '0.375rem' }}>
        {caseItem.name}
      </h3>
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: compact ? '0.25rem' : '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{caseItem.court}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>&middot;</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{caseItem.year}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>&middot;</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Cited by {caseItem.citedBy}</span>
      </div>
      {!compact && (
        <>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, fontFamily: 'Georgia, serif', color: 'var(--d-text)', marginBottom: '0.75rem' }}>
            {caseItem.summary}
          </p>
          <div className={css('_flex _wrap _gap2')}>
            {caseItem.topics.map((topic) => (
              <span key={topic} className="d-annotation">{topic}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
