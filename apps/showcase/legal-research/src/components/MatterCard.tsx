import { css } from '@decantr/css';
import { Clock, DollarSign } from 'lucide-react';
import { type Matter } from '../data/mock';

const PRIORITY_CLASS: Record<Matter['priority'], string> = {
  high: 'counsel-urgent',
  medium: 'counsel-moderate',
  low: 'counsel-low',
};

const STATUS_MAP: Record<Matter['status'], { label: string; status: string }> = {
  active: { label: 'Active', status: 'success' },
  pending: { label: 'Pending', status: 'warning' },
  closed: { label: 'Closed', status: 'info' },
  'on-hold': { label: 'On Hold', status: 'error' },
};

interface MatterCardProps {
  matter: Matter;
  onClick?: () => void;
}

export function MatterCard({ matter, onClick }: MatterCardProps) {
  const statusInfo = STATUS_MAP[matter.status];
  const budgetUsed = (matter.billableHours * 350) / matter.budget;
  const budgetPct = Math.min(budgetUsed * 100, 100);

  return (
    <div
      className={`counsel-card ${PRIORITY_CLASS[matter.priority]}`}
      onClick={onClick}
      style={{ padding: '1.25rem', cursor: onClick ? 'pointer' : undefined }}
    >
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
        <span className="d-annotation" data-status={statusInfo.status}>{statusInfo.label}</span>
        <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{matter.type}</span>
      </div>

      <h3 className="counsel-header" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{matter.title}</h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem', fontFamily: 'Georgia, serif' }}>
        {matter.client} &middot; {matter.assignee}
      </p>

      {/* Billable hours */}
      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.5rem' }}>
        <div className={css('_flex _aic _gap1')}>
          <Clock size={12} style={{ color: 'var(--d-text-muted)' }} />
          <span className="mono-data" style={{ fontSize: '0.75rem' }}>{matter.billableHours}h</span>
        </div>
        <div className={css('_flex _aic _gap1')}>
          <DollarSign size={12} style={{ color: 'var(--d-text-muted)' }} />
          <span className="mono-data" style={{ fontSize: '0.75rem' }}>${matter.budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Budget progress */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div className={css('_flex _jcsb')} style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>Budget usage</span>
          <span className="mono-data" style={{ fontSize: '0.6875rem', color: budgetPct > 80 ? 'var(--d-error)' : 'var(--d-text-muted)' }}>
            {budgetPct.toFixed(0)}%
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--d-border)', borderRadius: 'var(--d-radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${budgetPct}%`,
              height: '100%',
              background: budgetPct > 80 ? 'var(--d-error)' : budgetPct > 50 ? 'var(--d-warning)' : 'var(--d-success)',
              borderRadius: 'var(--d-radius-full)',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className={css('_flex _jcsb')} style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
        <span>Opened {matter.openDate}</span>
        <span>Due {matter.dueDate}</span>
      </div>
    </div>
  );
}
