import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { budgetKpis, budgetCategories } from '@/data/mock';
import { BudgetSankey } from '@/components/BudgetSankey';

export function BudgetPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Budget Transparency</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>FY 2026 Municipal Budget Overview</p>
      </div>

      {/* KPIs */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          KEY INDICATORS
        </div>
        <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {budgetKpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="d-surface gov-card"
              style={{
                padding: '1.25rem',
                opacity: 0,
                animation: `decantr-entrance 0.3s ease forwards`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.125rem' }}>{kpi.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sankey Flow */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          BUDGET FLOW
        </div>
        <div className="d-surface gov-card" style={{ padding: '1.25rem' }}>
          <BudgetSankey />
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          DEPARTMENT ALLOCATION
        </div>
        <div className="d-surface gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data gov-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header">Department</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Allocated</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Spent YTD</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Utilization</th>
                <th className="d-data-header">Progress</th>
              </tr>
            </thead>
            <tbody>
              {budgetCategories.map(cat => {
                const util = Math.round((cat.spent / cat.allocated) * 100);
                return (
                  <tr key={cat.id} className="d-data-row">
                    <td className="d-data-cell">
                      <Link
                        to={`/budget/${cat.id}`}
                        style={{ textDecoration: 'none', color: 'var(--d-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: 1, background: cat.color, flexShrink: 0 }} />
                        {cat.name}
                      </Link>
                    </td>
                    <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, monospace)' }}>
                      ${(cat.allocated / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, monospace)' }}>
                      ${(cat.spent / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="d-data-cell" style={{ textAlign: 'right' }}>
                      <span className="d-annotation" data-status={util > 85 ? 'warning' : 'success'}>
                        {util}%
                      </span>
                    </td>
                    <td className="d-data-cell" style={{ minWidth: 120 }}>
                      <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${util}%`, background: cat.color, borderRadius: 1 }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
