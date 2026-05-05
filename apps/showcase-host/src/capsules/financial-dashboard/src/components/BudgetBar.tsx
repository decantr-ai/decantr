import type { BudgetCategory } from '@/data/mock';
import { formatMoney } from './Money';

interface BudgetBarProps {
  item: BudgetCategory;
}

export function BudgetBar({ item }: BudgetBarProps) {
  const pct = Math.min(100, (item.spent / item.budgeted) * 100);
  const level: 'safe' | 'warn' | 'over' =
    item.spent > item.budgeted ? 'over' : pct > 85 ? 'warn' : 'safe';
  const overAmount = item.spent - item.budgeted;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.category}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span className="fd-mono" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {formatMoney(item.spent)}
          </span>
          <span className="fd-mono" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
            / {formatMoney(item.budgeted)}
          </span>
        </div>
      </div>
      <div className="fd-budget-track">
        <div
          className="fd-budget-fill"
          data-level={level}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.7rem' }}>
        <span style={{ color: 'var(--d-text-muted)' }}>{pct.toFixed(1)}% used</span>
        <span className="fd-mono" style={{ color: level === 'over' ? 'var(--d-error)' : 'var(--d-text-muted)' }}>
          {level === 'over'
            ? `${formatMoney(overAmount)} over`
            : `${formatMoney(item.remaining)} remaining`}
        </span>
      </div>
    </div>
  );
}
