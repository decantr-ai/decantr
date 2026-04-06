import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { ValuationChart } from '@/components/ValuationChart';
import { ShareBar, ShareLegend } from '@/components/ShareBar';
import { Sparkline } from '@/components/Sparkline';
import { portfolioKpis, portfolioCharts, assetTypeAllocations, assets, dividends, valuationHistory } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function DashboardPage() {
  const recentDividends = dividends.slice(0, 4);
  const activeAssets = assets.filter(a => a.status === 'active').slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Portfolio Overview"
        description="Your fractional ownership positions as of April 6, 2026."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={13} /> Export
            </button>
            <Link to="/assets" className="fo-button-primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              Browse assets <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <KpiGrid items={portfolioKpis} />

      {/* Valuation + Dividends charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--d-content-gap)' }}>
        <div className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>NAV with Confidence Bands</h3>
            <span className="d-annotation">Updated 4h ago</span>
          </div>
          <ValuationChart data={valuationHistory} />
        </div>
        {portfolioCharts.filter(c => c.type === 'bar').map(chart => (
          <div key={chart.title} className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{chart.title}</h3>
              <span className="d-annotation">TTM</span>
            </div>
            <Chart chart={chart} />
          </div>
        ))}
      </div>

      {/* Allocation + Top assets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <SectionLabel>Asset Allocation</SectionLabel>
            <Link to="/assets" style={{ fontSize: '0.75rem', color: 'var(--d-primary-hover)', textDecoration: 'none' }}>Details</Link>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <ShareBar items={assetTypeAllocations} />
          </div>
          <ShareLegend items={assetTypeAllocations} />
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <SectionLabel>Top Assets</SectionLabel>
            <Link to="/assets" style={{ fontSize: '0.75rem', color: 'var(--d-primary-hover)', textDecoration: 'none' }}>All assets</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeAssets.map(a => (
              <Link
                key={a.id}
                to={`/assets/${a.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--d-radius-sm)',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--d-surface-raised)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{a.type}</div>
                </div>
                <Sparkline data={a.sparkline} width={64} height={20} />
                <div style={{ textAlign: 'right' }}>
                  <span className="fo-mono" style={{ fontSize: '0.75rem', color: 'var(--d-success)' }}>+{a.returnPct}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent dividends */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <SectionLabel>Recent Dividends</SectionLabel>
          <Link to="/dividends" style={{ fontSize: '0.75rem', color: 'var(--d-primary-hover)', textDecoration: 'none' }}>All dividends</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentDividends.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px 100px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.625rem 0',
                borderBottom: i < recentDividends.length - 1 ? '1px solid var(--d-border)' : 'none',
              }}
            >
              <span className="fo-mono" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.date.slice(5)}</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{d.asset}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{d.type} distribution</div>
              </div>
              <span className="fo-pill" data-status={d.status === 'paid' ? 'active' : 'pending'}>{d.status}</span>
              <span className="fo-mono" style={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', color: 'var(--d-success)' }}>
                +{formatMoney(d.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
