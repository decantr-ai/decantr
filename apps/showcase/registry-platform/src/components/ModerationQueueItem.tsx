import { css } from '@decantr/css';
import { Check, X, Clock, User, Star, ExternalLink } from 'lucide-react';
import type { ModerationItem } from '@/data/mock';
import { TYPE_COLORS } from '@/data/mock';

interface Props {
  item: ModerationItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export function ModerationQueueItem({ item, onApprove, onReject, showActions = true }: Props) {
  const { content, submitter, submittedAt, status } = item;

  const statusMap = {
    pending: { label: 'Pending', variant: 'warning' as const },
    approved: { label: 'Approved', variant: 'success' as const },
    rejected: { label: 'Rejected', variant: 'error' as const },
  };

  const s = statusMap[status];

  return (
    <div className="d-surface lum-card-outlined" data-type={content.type}>
      <div className={css('_flex _col _gap3')}>
        {/* Header row */}
        <div className={css('_flex _aic _jcsb _wrap _gap2')}>
          <div className={css('_flex _aic _gap2')}>
            <span
              className="d-annotation"
              style={{ background: TYPE_COLORS[content.type], color: '#141414', fontWeight: 600 }}
            >
              {content.type}
            </span>
            <span className={css('_fontbold _textlg')} style={{ color: 'var(--d-text)' }}>
              {content.name}
            </span>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              v{content.version}
            </span>
          </div>
          <span className="d-annotation" data-status={s.variant}>
            <Clock size={12} />
            {s.label}
          </span>
        </div>

        {/* Description */}
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', margin: 0 }}>
          {content.description}
        </p>

        {/* Submitter info */}
        <div className={css('_flex _aic _jcsb _wrap _gap3')}>
          <div className={css('_flex _aic _gap3')}>
            <div className={css('_flex _aic _gap1')}>
              <User size={14} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_textsm _fontsemi')}>{submitter.name}</span>
            </div>
            <div className={css('_flex _aic _gap1')}>
              <Star size={14} style={{ color: 'var(--d-amber)' }} />
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                {submitter.reputation} rep
              </span>
            </div>
            <span className="d-annotation">{submitter.level}</span>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              {submittedAt}
            </span>
          </div>

          {/* Actions */}
          {showActions && status === 'pending' && (
            <div className={css('_flex _aic _gap2')}>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => onApprove?.(item.id)}
                style={{ color: 'var(--d-success)', fontSize: '0.8125rem' }}
              >
                <Check size={14} />
                Approve
              </button>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => onReject?.(item.id)}
                style={{ color: 'var(--d-error)', fontSize: '0.8125rem' }}
              >
                <X size={14} />
                Reject
              </button>
              <a
                className="d-interactive"
                data-variant="ghost"
                href={`#/admin/moderation/${item.id}`}
                style={{ fontSize: '0.8125rem' }}
              >
                <ExternalLink size={14} />
                Details
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
