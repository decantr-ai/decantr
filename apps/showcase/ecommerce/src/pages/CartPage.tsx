import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { initialCart, getProduct } from '@/data/mock';

export function CartPage() {
  const [items, setItems] = useState(initialCart);

  const rows = items.map(i => ({ ...i, product: getProduct(i.productId)! })).filter(i => i.product);
  const subtotal = rows.reduce((a, r) => a + r.product.price * r.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (rows.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <ShoppingBag size={48} style={{ margin: '0 auto 1rem', color: 'var(--d-text-muted)' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your cart is empty</h1>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Discover something you'll love.</p>
        <Link to="/shop" className="ec-button-primary">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '2rem' }}>Your cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rows.map(r => (
            <div key={r.productId} className="ec-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 90, height: 90, background: 'var(--d-surface-muted)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', flexShrink: 0 }}>
                {r.product.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/shop/${r.product.id}`} style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', color: 'var(--d-text)' }}>
                  {r.product.name}
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textTransform: 'capitalize', marginTop: '0.25rem' }}>{r.product.category}</div>
                <div className="ec-price" style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>${r.product.price}</div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)' }}>
                <button
                  onClick={() => setItems(items.map(i => i.productId === r.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{ border: 'none', padding: '0.375rem 0.5rem' }}
                  aria-label="Decrease"
                >
                  <Minus size={12} />
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{r.quantity}</span>
                <button
                  onClick={() => setItems(items.map(i => i.productId === r.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{ border: 'none', padding: '0.375rem 0.5rem' }}
                  aria-label="Increase"
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                onClick={() => setItems(items.filter(i => i.productId !== r.productId))}
                className="d-interactive"
                data-variant="ghost"
                style={{ padding: '0.5rem', border: 'none' }}
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <Link to="/shop" style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginTop: '0.5rem' }}>
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="ec-card" style={{ position: 'sticky', top: 80, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Order summary</h2>
          <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <SumRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <SumRow label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} />
            <SumRow label="Estimated tax" value={`$${tax.toFixed(2)}`} />
            <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </dl>

          <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            <input className="ec-input" placeholder="Promo code" style={{ fontSize: '0.85rem' }} />
            <button className="d-interactive" style={{ background: 'var(--d-surface-muted)', fontSize: '0.85rem' }}>Apply</button>
          </div>

          <Link to="/checkout" className="ec-button-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.925rem' }}>
            Checkout <ArrowRight size={16} />
          </Link>
          <p style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
            Free shipping on orders over $75
          </p>
        </aside>
      </div>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <dt style={{ color: 'var(--d-text-muted)' }}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
