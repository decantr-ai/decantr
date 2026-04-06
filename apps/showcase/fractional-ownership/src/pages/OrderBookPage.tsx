import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { OrderBookView } from '@/components/OrderBookView';
import { orderBook, recentTrades } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function OrderBookPage() {
  const spread = 100.20 - 99.80;
  const midPrice = (100.20 + 99.80) / 2;
  const totalBidVolume = orderBook.filter(o => o.side === 'bid').reduce((s, o) => s + o.total, 0);
  const totalAskVolume = orderBook.filter(o => o.side === 'ask').reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Order Book" description="Peer-to-peer secondary market for fractional share trading." />

      {/* Market summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {[
          { label: 'Mid Price', value: `$${midPrice.toFixed(2)}` },
          { label: 'Spread', value: `$${spread.toFixed(2)}` },
          { label: 'Bid Volume', value: formatMoney(totalBidVolume, true) },
          { label: 'Ask Volume', value: formatMoney(totalAskVolume, true) },
        ].map(k => (
          <div key={k.label} className="fo-card fo-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>{k.label}</div>
            <div className="fo-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Order book depth */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Depth</SectionLabel>
        <OrderBookView entries={orderBook} />
      </div>

      {/* Recent trades */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Recent Trades</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentTrades.slice(0, 6).map((t, i) => (
            <div key={t.id} style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr 60px 80px 100px 80px',
              gap: '0.75rem',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: i < 5 ? '1px solid var(--d-border)' : 'none',
              fontSize: '0.8rem',
            }}>
              <span className="fo-mono" style={{ color: 'var(--d-text-muted)' }}>{t.date.slice(5)}</span>
              <span style={{ fontWeight: 500 }}>{t.asset}</span>
              <span className="fo-pill" data-status={t.side === 'buy' ? 'active' : 'closed'}>{t.side}</span>
              <span className="fo-mono" style={{ textAlign: 'right' }}>{t.shares.toLocaleString()}</span>
              <span className="fo-mono" style={{ textAlign: 'right' }}>${t.price.toFixed(2)}</span>
              <span className="fo-pill" data-status={t.status === 'filled' ? 'active' : t.status === 'partial' ? 'pending' : 'rejected'}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
