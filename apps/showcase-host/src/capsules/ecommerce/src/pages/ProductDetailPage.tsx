import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Star, Heart, Share2, Truck, RotateCcw, ShieldCheck, Minus, Plus, ShoppingCart } from 'lucide-react';
import { getProduct, products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = id ? getProduct(id) : undefined;
  const [qty, setQty] = useState(1);

  if (!product) return <Navigate to="/shop" replace />;

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/shop" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Shop</Link>
        <span>/</span>
        <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
        <span>/</span>
        <span style={{ color: 'var(--d-text)' }}>{product.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Image gallery */}
        <div>
          <div style={{
            aspectRatio: '1',
            background: 'var(--d-surface-muted)',
            borderRadius: 'var(--d-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8rem',
            border: '1px solid var(--d-border)',
          }}>
            {product.emoji}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                aspectRatio: '1',
                background: 'var(--d-surface-muted)',
                borderRadius: 'var(--d-radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: i === 0 ? '2px solid var(--d-primary)' : '1px solid var(--d-border)',
                cursor: 'pointer',
                opacity: i === 0 ? 1 : 0.5,
              }}>
                {product.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textTransform: 'capitalize', marginBottom: '0.5rem' }}>{product.category}</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2, marginBottom: '0.5rem' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              <span className="ec-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
                ))}
              </span>
              <span>{product.rating.toFixed(1)} · {product.reviews} reviews</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span className="ec-price" data-size="lg">${product.price}</span>
            {product.wasPrice && (
              <>
                <span className="ec-price" data-was>${product.wasPrice}</span>
                <span className="ec-badge" data-tone="warning">Save ${product.wasPrice - product.price}</span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>{product.description}</p>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.5rem 0.75rem' }} aria-label="Decrease">
                <Minus size={14} />
              </button>
              <span style={{ minWidth: 32, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.5rem 0.75rem' }} aria-label="Increase">
                <Plus size={14} />
              </button>
            </div>
            <button className="ec-button-primary" disabled={!product.inStock} style={{ flex: 1, padding: '0.75rem' }}>
              <ShoppingCart size={16} /> {product.inStock ? 'Add to cart' : 'Sold out'}
            </button>
            <button className="d-interactive" aria-label="Wishlist" style={{ padding: '0.75rem' }}>
              <Heart size={16} />
            </button>
            <button className="d-interactive" aria-label="Share" style={{ padding: '0.75rem' }}>
              <Share2 size={16} />
            </button>
          </div>

          <div className="ec-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Perk icon={<Truck size={15} />} text="Free shipping on orders over $75" />
            <Perk icon={<RotateCcw size={15} />} text="30-day hassle-free returns" />
            <Perk icon={<ShieldCheck size={15} />} text="1-year craftsmanship warranty" />
          </div>

          {/* Specs */}
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Details</h3>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <dt style={{ color: 'var(--d-text-muted)' }}>Materials</dt>
              <dd>Natural linen, vegetable-tanned leather</dd>
              <dt style={{ color: 'var(--d-text-muted)' }}>Origin</dt>
              <dd>Handcrafted in Portugal</dd>
              <dt style={{ color: 'var(--d-text-muted)' }}>Care</dt>
              <dd>Spot clean · Air dry</dd>
              <dt style={{ color: 'var(--d-text-muted)' }}>SKU</dt>
              <dd>{product.id.toUpperCase()}-NAT</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Related */}
      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>You might also like</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--d-primary)' }}>{icon}</span> {text}
    </div>
  );
}
