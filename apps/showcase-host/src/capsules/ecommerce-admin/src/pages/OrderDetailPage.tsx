import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Truck, CheckCircle2, Circle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { orders } from '@/data/mock';

const timeline: { status: string; label: string; key: 'placed' | 'processing' | 'shipped' | 'delivered' }[] = [
  { status: 'placed', label: 'Placed', key: 'placed' },
  { status: 'processing', label: 'Processing', key: 'processing' },
  { status: 'shipped', label: 'Shipped', key: 'shipped' },
  { status: 'delivered', label: 'Delivered', key: 'delivered' },
];

export function OrderDetailPage() {
  const { id } = useParams();
  const order = orders.find(o => o.id === id) ?? orders[0];

  const statusIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={12} /> Back to orders
        </Link>
        <PageHeader
          title={order.number}
          description={`${order.customerName} · ${order.placed}`}
          actions={
            <>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                <Printer size={14} /> Print Label
              </button>
              <button className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                <Truck size={14} /> Fulfill Order
              </button>
            </>
          }
        />
      </div>

      {/* Timeline */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Order Timeline</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {timeline.map((step, i) => {
            const complete = i <= statusIndex;
            const active = i === statusIndex;
            return (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: i < timeline.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  {complete ? (
                    <CheckCircle2 size={20} style={{ color: active ? 'var(--d-accent)' : 'var(--d-success)' }} />
                  ) : (
                    <Circle size={20} style={{ color: 'var(--d-text-muted)' }} />
                  )}
                  <span style={{ fontSize: '0.7rem', color: complete ? 'var(--d-text)' : 'var(--d-text-muted)', fontWeight: active ? 600 : 400 }}>{step.label}</span>
                </div>
                {i < timeline.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < statusIndex ? 'var(--d-success)' : 'var(--d-border)', marginBottom: '1.25rem', borderRadius: 1 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        {/* Items */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Items ({order.items.length})</SectionLabel>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Product</th>
                <th className="d-data-header">SKU</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Qty</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Price</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.productId} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 500 }}>{item.name}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{item.sku}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{item.qty}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>${item.price.toFixed(2)}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--d-border)' }}>
                <td className="d-data-cell" colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontWeight: 700, color: 'var(--d-accent)' }}>${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          {/* Status */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.75rem' }}>Status</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Order</span>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Payment</span>
                <StatusBadge status={order.payment} />
              </div>
              {order.tracking && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Tracking</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{order.tracking}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.75rem' }}>Customer</SectionLabel>
            <Link to={`/customers/${order.customerId}`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--d-accent)', textDecoration: 'none', marginBottom: '0.25rem' }}>
              {order.customerName}
            </Link>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>{order.customerEmail}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.25rem' }}>Shipping to</div>
            <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{order.shippingAddress}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
