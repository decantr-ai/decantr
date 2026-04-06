import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft } from 'lucide-react';
import { budgetCategories } from '@/data/mock';

export function BudgetCategoryPage() {
  const { category } = useParams();
  const cat = budgetCategories.find(c => c.id === category) || budgetCategories[0];
  const util = Math.round((cat.spent / cat.allocated) * 100);

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <Link to="/budget" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Budget Overview
      </Link>

      <div>
        <div className={css('_flex _aic _gap3 _mb2')}>
          <span style={{ width: 14, height: 14, borderRadius: 2, background: cat.color }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{cat.name}</h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          Detailed breakdown of {cat.name.toLowerCase()} department spending
        </p>
      </div>

      {/* Summary cards */}
      <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Allocated', value: `$${(cat.allocated / 1_000_000).toFixed(1)}M` },
          { label: 'Spent YTD', value: `$${(cat.spent / 1_000_000).toFixed(1)}M` },
          { label: 'Remaining', value: `$${((cat.allocated - cat.spent) / 1_000_000).toFixed(1)}M` },
          { label: 'Utilization', value: `${util}%` },
        ].map((item, i) => (
          <div
            key={item.label}
            className="d-surface gov-card"
            style={{
              padding: '1.25rem',
              opacity: 0,
              animation: `decantr-entrance 0.3s ease forwards`,
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Category bar chart */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          SUBCATEGORY BREAKDOWN
        </div>
        <div className="d-surface gov-card" style={{ padding: '1.25rem' }}>
          <div className={css('_flex _col _gap4')}>
            {cat.subcategories.map((sub, i) => {
              const subPct = Math.round((sub.amount / cat.allocated) * 100);
              return (
                <div
                  key={sub.name}
                  style={{
                    opacity: 0,
                    animation: `decantr-entrance 0.3s ease forwards`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div className={css('_flex _jcsb')} style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600 }}>{sub.name}</span>
                    <span style={{ fontFamily: 'var(--d-font-mono, monospace)', color: 'var(--d-text-muted)' }}>
                      ${(sub.amount / 1_000_000).toFixed(1)}M ({subPct}%)
                    </span>
                  </div>
                  <div style={{ height: 12, background: 'var(--d-surface-raised)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${subPct}%`,
                      background: cat.color,
                      borderRadius: 2,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expenditure table */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          EXPENDITURE DETAILS
        </div>
        <div className="d-surface gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data gov-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header">Line Item</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Amount</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>% of Dept</th>
              </tr>
            </thead>
            <tbody>
              {cat.subcategories.map(sub => (
                <tr key={sub.name} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 500 }}>{sub.name}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, monospace)' }}>
                    ${(sub.amount / 1_000_000).toFixed(1)}M
                  </td>
                  <td className="d-data-cell" style={{ textAlign: 'right' }}>
                    {Math.round((sub.amount / cat.allocated) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
