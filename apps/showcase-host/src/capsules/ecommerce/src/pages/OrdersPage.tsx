import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { orders, getProduct } from '@/data/mock';
import { PageHeader } from '@/components/PageHeader';

const statusTone = {
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'muted',
} as const;

export function OrdersPage() {
  return (
    <div>
      <PageHeader title="Your orders" description={`${orders.length} orders · Track deliveries & reorder`} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {orders.map(o => {
          const first = getProduct(o.items[0].productId);
          return (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="ec-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem' }}
            >
              <div style={{ width: 56, height: 56, background: 'var(--d-surface-muted)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {first?.emoji ?? <Package size={22} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order #{o.id}</span>
                  <span className="ec-badge" data-tone={statusTone[o.status]} style={{ textTransform: 'capitalize' }}>{o.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                  {new Date(o.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ec-price" style={{ fontSize: '1rem' }}>${o.total.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>Details <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
