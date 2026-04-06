import type { OrderBookEntry } from '@/data/mock';

interface OrderBookViewProps {
  entries: OrderBookEntry[];
}

export function OrderBookView({ entries }: OrderBookViewProps) {
  const bids = entries.filter(e => e.side === 'bid').sort((a, b) => b.price - a.price);
  const asks = entries.filter(e => e.side === 'ask').sort((a, b) => a.price - b.price);

  const maxShares = Math.max(...entries.map(e => e.shares));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
      {/* Bids */}
      <div>
        <div className="d-label" style={{ marginBottom: '0.75rem', color: 'var(--d-success)' }}>Bids</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0 0.5rem 0.5rem', borderBottom: '1px solid var(--d-border)' }}>
            <span className="d-label">Price</span>
            <span className="d-label" style={{ textAlign: 'right' }}>Shares</span>
            <span className="d-label" style={{ textAlign: 'right' }}>Total</span>
          </div>
          {bids.map(b => (
            <div key={b.id} className="fo-order-row" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(b.shares / maxShares) * 100}%` }}>
                <div className="fo-bid-bar" style={{ width: '100%' }} />
              </div>
              <span className="fo-mono" style={{ position: 'relative', color: 'var(--d-success)' }}>${b.price.toFixed(2)}</span>
              <span className="fo-mono" style={{ position: 'relative', textAlign: 'right' }}>{b.shares.toLocaleString()}</span>
              <span className="fo-mono" style={{ position: 'relative', textAlign: 'right', color: 'var(--d-text-muted)' }}>${b.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asks */}
      <div>
        <div className="d-label" style={{ marginBottom: '0.75rem', color: 'var(--d-error)' }}>Asks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0 0.5rem 0.5rem', borderBottom: '1px solid var(--d-border)' }}>
            <span className="d-label">Price</span>
            <span className="d-label" style={{ textAlign: 'right' }}>Shares</span>
            <span className="d-label" style={{ textAlign: 'right' }}>Total</span>
          </div>
          {asks.map(a => (
            <div key={a.id} className="fo-order-row" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(a.shares / maxShares) * 100}%` }}>
                <div className="fo-ask-bar" style={{ width: '100%' }} />
              </div>
              <span className="fo-mono" style={{ position: 'relative', color: 'var(--d-error)' }}>${a.price.toFixed(2)}</span>
              <span className="fo-mono" style={{ position: 'relative', textAlign: 'right' }}>{a.shares.toLocaleString()}</span>
              <span className="fo-mono" style={{ position: 'relative', textAlign: 'right', color: 'var(--d-text-muted)' }}>${a.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
