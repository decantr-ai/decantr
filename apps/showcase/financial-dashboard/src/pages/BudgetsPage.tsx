import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { BudgetBar } from '@/components/BudgetBar';
import { Chart } from '@/components/Chart';
import { budgetCategories } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function BudgetsPage() {
  const totalBudgeted = budgetCategories.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overCount = budgetCategories.filter(b => b.spent > b.budgeted).length;

  const monthlyChart = {
    title: 'Spending vs Budget',
    type: 'bar' as const,
    labels: budgetCategories.map(b => b.category.slice(0, 4)),
    series: [
      { label: 'Spent', values: budgetCategories.map(b => b.spent), color: 'var(--d-accent)' },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Budgets"
        description="Monthly budget vs actual spending across all categories."
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-content-gap)' }}>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Total Budget</div>
          <div className="fd-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalBudgeted)}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>April 2026</div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Spent</div>
          <div className="fd-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalSpent)}</div>
          <div className="fd-mono" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>
            {((totalSpent / totalBudgeted) * 100).toFixed(2)}% of budget
          </div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Remaining</div>
          <div
            className="fd-mono"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: totalRemaining >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}
          >
            {formatMoney(totalRemaining)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>through April 30</div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Over Budget</div>
          <div
            className="fd-mono"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: overCount > 0 ? 'var(--d-error)' : 'var(--d-success)' }}
          >
            {overCount} {overCount === 1 ? 'category' : 'categories'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>needs attention</div>
        </div>
      </div>

      {/* Chart */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Spending by Category</SectionLabel>
        <Chart chart={monthlyChart} height={200} />
      </div>

      {/* Budget vs actual bars */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1.25rem' }}>Budget vs Actual</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem 2rem' }}>
          {budgetCategories.map(b => (
            <BudgetBar key={b.id} item={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
