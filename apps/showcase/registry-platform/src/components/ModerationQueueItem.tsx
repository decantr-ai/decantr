import { useCallback } from 'react';
import type { ModerationItem } from '../data/mock';
import { getTypeColor } from '../data/mock';
import ReputationBadge from './ReputationBadge';

interface ModerationQueueItemProps {
  item: ModerationItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

const STATUS_BORDER: Record<ModerationItem['status'], string> = {
  pending: 'var(--d-warning)',
  approved: 'var(--d-success)',
  rejected: 'var(--d-error)',
};

export default function ModerationQueueItem({ item, onApprove, onReject, onViewDetail }: ModerationQueueItemProps) {
  const borderColor = STATUS_BORDER[item.status];
  const typeColor = getTypeColor(item.content.type);

  const handleApprove = useCallback(() => onApprove?.(item.id), [onApprove, item.id]);
  const handleReject = useCallback(() => onReject?.(item.id), [onReject, item.id]);
  const handleView = useCallback(() => onViewDetail?.(item.id), [onViewDetail, item.id]);

  return (
    <div
      className="d-surface"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
        <span
          className="d-annotation"
          style={{
            background: `${typeColor}20`,
            color: typeColor,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {item.content.type}
        </span>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, flex: 1 }}>{item.content.name}</h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap' }}>
          {item.submittedAt}
        </span>
      </div>

      {/* Submitter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {item.submitter.initials}
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{item.submitter.name}</span>
        <ReputationBadge score={item.submitter.reputation} />
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
          lineHeight: 1.6,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.content.description}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
        <button
          type="button"
          className="d-interactive"
          onClick={handleApprove}
          style={{
            fontSize: '0.8125rem',
            padding: '0.375rem 0.75rem',
            background: 'rgba(34, 197, 94, 0.12)',
            color: 'var(--d-success)',
            borderColor: 'rgba(34, 197, 94, 0.25)',
          }}
        >
          {'\u2713'} Approve
        </button>
        <button
          type="button"
          className="d-interactive"
          data-variant="danger"
          onClick={handleReject}
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
        >
          Reject
        </button>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          onClick={handleView}
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', marginLeft: 'auto' }}
        >
          View Detail
        </button>
      </div>
    </div>
  );
}
