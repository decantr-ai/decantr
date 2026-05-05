import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Chart } from '@/components/Chart';
import { holdings } from '@/data/mock';
import { formatMoney, formatPct } from '@/components/Money';

export function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const holding = holdings.find(h => h.id === id) ?? holdings[0];

  // Build a price chart from sparkline data
  const priceChart = {
    title: 'Price History (12M)',
    type: 'area' as const,
    labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
    series: [
      { label: 'Price', values: holding.sparkline, color: 'var(--d-accent)' },
    ],
  };

  const metrics = [
    { label: 'Shares Owned', value: holding.shares.toLocaleString() },
    { label: 'Avg Cost', value: `$${holding.avgCost.toFixed(2)}` },
    { label: 'Current Price', value: `$${holding.price.toFixed(2)}` },
    { label: 'Cost Basis', value: formatMoney(holding.costBasis) },
    { label: 'Market Value', value: formatMoney(holding.marketValue) },
    { label: 'Day Change', value: `${holding.dayChange >= 0 ? '+' : ''}${holding.dayChange.toFixed(2)}%` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Link to="/investments" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={13} /> Back to investments
      </Link>

      <PageHeader
        title={`${holding.symbol} · ${holding.name}`}
        description={`${holding.sector} · ${holding.allocation.toFixed(2)}% of portfolio`}
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Sell</button>
            <button className="fd-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Buy more</button>
          </>
        }
      />

      {/* Hero metrics */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--d-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>Current Value</div>
            <div className="fd-mono" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {formatMoney(holding.marketValue)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>Total Gain</div>
            <div
              className="fd-mono"
              style={{ fontSize: '2.25rem', fontWeight: 700, color: holding.gainAbs >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}
            >
              {holding.gainAbs >= 0 ? '+' : ''}{formatMoney(holding.gainAbs)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              {holding.gainPct >= 0 ? (
                <TrendingUp size={14} style={{ color: 'var(--d-success)' }} />
              ) : (
                <TrendingDown size={14} style={{ color: 'var(--d-error)' }} />
              )}
              <span className="fd-mono" style={{ fontSize: '0.875rem', color: holding.gainPct >= 0 ? 'var(--d-success)' : 'var(--d-error)', fontWeight: 500 }}>
                {formatPct(holding.gainPct)}
              </span>
            </div>
          </div>
        </div>

        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {metrics.map(m => (
            <div key={m.label}>
              <dt className="d-label" style={{ marginBottom: '0.25rem' }}>{m.label}</dt>
              <dd className="fd-mono" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Price chart */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Price History</SectionLabel>
        <Chart chart={priceChart} height={220} />
      </div>
    </div>
  );
}
