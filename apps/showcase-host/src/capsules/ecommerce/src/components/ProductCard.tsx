import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import type { Product } from '@/data/mock';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/shop/${product.id}`} className="ec-product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="ec-product-image" style={{ position: 'relative' }}>
        <span aria-hidden>{product.emoji}</span>
        {product.tags.includes('bestseller') && (
          <span className="ec-badge" data-tone="accent" style={{ position: 'absolute', top: 10, left: 10 }}>Bestseller</span>
        )}
        {product.tags.includes('new') && (
          <span className="ec-badge" style={{ position: 'absolute', top: 10, left: 10 }}>New</span>
        )}
        {product.wasPrice && (
          <span className="ec-badge" data-tone="warning" style={{ position: 'absolute', top: 10, right: 10 }}>Sale</span>
        )}
        <button
          className="d-interactive"
          data-variant="ghost"
          aria-label="Add to wishlist"
          onClick={e => { e.preventDefault(); }}
          style={{ position: 'absolute', bottom: 10, right: 10, padding: '0.4rem', background: 'var(--d-surface)', border: '1px solid var(--d-border)' }}
        >
          <Heart size={14} />
        </button>
      </div>
      <div style={{ padding: '1rem 1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>{product.category}</div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          <span className="ec-stars"><Star size={12} fill="currentColor" /></span>
          {product.rating.toFixed(1)} · {product.reviews} reviews
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span className="ec-price">${product.price}</span>
          {product.wasPrice && <span className="ec-price" data-was>${product.wasPrice}</span>}
        </div>
      </div>
    </Link>
  );
}
