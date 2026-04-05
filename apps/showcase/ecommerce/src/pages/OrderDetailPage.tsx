import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin } from 'lucide-react';
import { getOrder, getProduct } from '@/data/mock';

const statusTone = {
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'muted',
} as const;

export function OrderDetailPage() {
  const { id } = useParams();
  const order = id ? getOrder(id) : undefined;

  if (!order) {
    // fallback: synthesize confirmation order
    return (
      <div style={{ maxWidth: 800 }}>
        <Link to="/orders" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> All orders
        </Link>
        <div className="ec-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--d-success)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Order confirmed</h1>
          <p style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Order #{id} — Thanks for your purchase.</p>
          <Link to="/orders" className="ec-button-primary" style={{ marginTop: '1.25rem' }}>Back to orders</Link>
        </div>
      </div>
    );
  }

  const timeline = [
    { label: 'Order placed', date: order.date, done: true, current: false },
    { label: 'Processing', date: order.date, done: order.status !== 'processing', current: order.status === 'processing' },
    { label: 'Shipped', date: '2026-04-03', done: ['shipped', 'delivered'].includes(order.status), current: order.status === 'shipped' },
    { label: 'Delivered', date: '2026-04-06', done: order.status === 'delivered', current: order.status === 'delivered' },
  ];

  if (order.status === 'cancelled') return <Navigate to="/orders" replace />;

  const subtotal = order.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const tax = order.total - subtotal - shipping;

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/orders" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.85rem', marginBottom: '1rem', border: 'none' }}>
        <ArrowLeft size={14} /> All orders
      </Link>

      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Order #{order.id}</h1>
            <span className="ec-badge" data-tone={statusTone[order.status]} style={{ textTransform: 'capitalize' }}>{order.status}</span>
          </div>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            Placed {new Date(order.date).toLocaleDateString('en-US', { dateStyle: 'long' })} · Total ${order.total.toFixed(2)}
          </p>
        </div>
        {order.tracking && (
          <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>
            <Truck size={14} /> Track package
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Timeline */}
        <div className="ec-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Delivery timeline</h2>
          <div className="ec-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: '0.25rem' }}>
                <span className="ec-timeline-dot" data-done={t.done || undefined} data-current={t.current || undefined} />
                <div style={{ marginLeft: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: t.done || t.current ? 'var(--d-text)' : 'var(--d-text-muted)' }}>{t.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    {t.done ? new Date(t.date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : t.current ? 'In progress' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.75rem' }}>Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items.map(item => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid var(--d-border)' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--d-surface-muted)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/shop/${p.id}`} style={{ fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', color: 'var(--d-text)' }}>{p.name}</Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Qty {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ec-card">
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Ship to</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <MapPin size={14} style={{ color: 'var(--d-text-muted)', marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{order.shipTo}</div>
            </div>
          </div>
          <div className="ec-card">
            <div className="d-label" style={{ marginBottom: '0.75rem' }}>Summary</div>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><dt style={{ color: 'var(--d-text-muted)' }}>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><dt style={{ color: 'var(--d-text-muted)' }}>Shipping</dt><dd>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</dd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><dt style={{ color: 'var(--d-text-muted)' }}>Tax</dt><dd>${tax.toFixed(2)}</dd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.4rem', borderTop: '1px solid var(--d-border)', marginTop: '0.25rem' }}>
                <dt>Total</dt><dd>${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
          {order.tracking && (
            <div className="ec-card">
              <div className="d-label" style={{ marginBottom: '0.5rem' }}>Tracking</div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace' }}>{order.tracking}</div>
            </div>
          )}
          <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>
            <Package size={14} /> Reorder these items
          </button>
        </aside>
      </div>
    </div>
  );
}
