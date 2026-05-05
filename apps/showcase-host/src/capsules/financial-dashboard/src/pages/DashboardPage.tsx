import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { Sparkline } from '@/components/Sparkline';
import { AllocationBar, AllocationLegend } from '@/components/AllocationBar';
import { portfolioKpis, portfolioCharts, assetAllocations, holdings, transactions } from '@/data/mock';
import { Money, formatMoney, formatPct } from '@/components/Money';

export function DashboardPage() {
  const topMovers = [...holdings].sort((a, b) => Math.abs(b.gainPct) - Math.abs(a.gainPct)).slice(0, 4);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Portfolio Overview"
        description="Your consolidated wealth position as of April 5, 2026."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={13} /> Export
            </button>
            <Link to="/allocations" className="fd-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              View allocations <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <KpiGrid items={portfolioKpis} />

      {/* Charts */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Performance</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {portfolioCharts.map(chart => (
            <div key={chart.title} className="fd-card" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{chart.title}</h3>
                <span className="d-annotation">Updated 2m ago</span>
              </div>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      {/* Allocation + Top movers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <SectionLabel>Asset Allocation</SectionLabel>
            <Link to="/allocations" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Details →</Link>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <AllocationBar items={assetAllocations} />
          </div>
          <AllocationLegend items={assetAllocations} />
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <SectionLabel>Top Movers</SectionLabel>
            <Link to="/investments" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>All holdings →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topMovers.map(h => (
              <Link
                key={h.id}
                to={`/investments/${h.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 80px 1fr',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--d-radius-sm)',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--d-surface-raised)',
                }}
              >
                <span className="fd-mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{h.symbol}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.name}
                </span>
                <Sparkline data={h.sparkline} width={64} height={20} positive={h.gainPct >= 0} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Money value={h.marketValue} style={{ fontSize: '0.8rem', fontWeight: 500 }} />
                  <span className="fd-mono" style={{ fontSize: '0.7rem', color: h.gainPct >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}>
                    {formatPct(h.gainPct)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <SectionLabel>Recent Transactions</SectionLabel>
          <Link to="/transactions" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>All transactions →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentTransactions.map((t, i) => (
            <Link
              key={t.id}
              to={`/transactions/${t.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px 100px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.625rem 0',
                borderBottom: i < recentTransactions.length - 1 ? '1px solid var(--d-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span className="fd-mono" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.date.slice(5)}</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.description}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.category}</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.account}</span>
              <span
                className="fd-mono"
                style={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', color: t.amount > 0 ? 'var(--d-success)' : 'var(--d-text)' }}
              >
                {t.amount > 0 ? '+' : ''}{formatMoney(t.amount)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
