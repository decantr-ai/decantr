import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Sparkline } from '@/components/Sparkline';
import { ValuationChart } from '@/components/ValuationChart';
import { assets, valuationHistory, dividends, orderBook } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function AssetDetailPage() {
  const { id } = useParams();
  const asset = assets.find(a => a.id === id) ?? assets[0];
  const assetDividends = dividends.filter(d => d.asset === asset.name).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Link to="/assets" className="d-interactive" data-variant="ghost" style={{ alignSelf: 'flex-start', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to assets
      </Link>

      <PageHeader
        title={asset.name}
        description={`${asset.type.replace('-', ' ')} ${asset.location ? '- ' + asset.location : ''} | IRR: ${asset.irr}%`}
        actions={
          <span className="fo-pill" data-status={asset.status}>{asset.status}</span>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {[
          { label: 'Valuation', value: formatMoney(asset.valuation, true) },
          { label: 'Price/Share', value: `$${asset.pricePerShare.toFixed(2)}` },
          { label: 'Total Shares', value: asset.totalShares.toLocaleString() },
          { label: 'Return', value: `+${asset.returnPct}%` },
          { label: 'IRR', value: `${asset.irr}%` },
          ...(asset.occupancy ? [{ label: 'Occupancy', value: `${asset.occupancy}%` }] : []),
        ].map(k => (
          <div key={k.label} className="fo-card fo-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>{k.label}</div>
            <div className="fo-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Valuation chart */}
      <div className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Valuation History</SectionLabel>
        <ValuationChart data={valuationHistory} />
      </div>

      {/* Price trend */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <SectionLabel>12-Month Trend</SectionLabel>
        <Sparkline data={asset.sparkline} width={200} height={40} />
      </div>

      {/* Recent dividends for this asset */}
      {assetDividends.length > 0 && (
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Dividends</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {assetDividends.map((d, i) => (
              <div key={d.id} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 80px 100px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: i < assetDividends.length - 1 ? '1px solid var(--d-border)' : 'none',
              }}>
                <span className="fo-mono" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.date}</span>
                <span style={{ fontSize: '0.8rem' }}>{d.type} distribution</span>
                <span className="fo-pill" data-status={d.status === 'paid' ? 'active' : 'pending'}>{d.status}</span>
                <span className="fo-mono" style={{ textAlign: 'right', fontWeight: 500, color: 'var(--d-success)' }}>+{formatMoney(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent order book for context */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <SectionLabel>Order Book Snapshot</SectionLabel>
          <Link to="/order-book" style={{ fontSize: '0.75rem', color: 'var(--d-primary-hover)', textDecoration: 'none' }}>Full order book</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-success)' }}>Top Bids</div>
            {orderBook.filter(o => o.side === 'bid').slice(0, 3).map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.8rem' }}>
                <span className="fo-mono" style={{ color: 'var(--d-success)' }}>${o.price.toFixed(2)}</span>
                <span className="fo-mono" style={{ color: 'var(--d-text-muted)' }}>{o.shares.toLocaleString()} shares</span>
              </div>
            ))}
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-error)' }}>Top Asks</div>
            {orderBook.filter(o => o.side === 'ask').slice(0, 3).map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.8rem' }}>
                <span className="fo-mono" style={{ color: 'var(--d-error)' }}>${o.price.toFixed(2)}</span>
                <span className="fo-mono" style={{ color: 'var(--d-text-muted)' }}>{o.shares.toLocaleString()} shares</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
