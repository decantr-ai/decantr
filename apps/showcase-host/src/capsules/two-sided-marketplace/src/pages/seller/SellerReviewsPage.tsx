import { Star } from 'lucide-react';
import { reviews, getListing } from '@/data/mock';

export function SellerReviewsPage() {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2);
  return (
    <div style={{ maxWidth: 1000 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Host reviews</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Reviews from guests</h1>
      </header>

      {/* Summary */}
      <div className="nm-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              {avg} <Star size={22} fill="currentColor" style={{ color: 'var(--d-warning)' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{reviews.length} reviews across all listings</div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            {[5, 4, 3, 2, 1].map(s => {
              const count = reviews.filter(r => r.rating === s).length;
              const pct = Math.round((count / reviews.length) * 100);
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', width: 16 }}>{s}</span>
                  <div style={{ flex: 1, height: 5, background: 'var(--d-surface-raised)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--d-warning)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', width: 32, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews table */}
      <div className="nm-card" style={{ padding: 0, overflow: 'hidden' }}>
        {reviews.map((r, i) => {
          const listing = getListing(r.listingId);
          return (
            <div key={r.id} style={{ padding: '1rem 1.25rem', borderBottom: i < reviews.length - 1 ? '1px solid var(--d-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <div className="nm-avatar" style={{ width: 34, height: 34, fontSize: '0.72rem' }}>{r.buyerAvatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.buyerName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
                    {listing?.title} · {r.date}
                  </div>
                </div>
                <div className="nm-stars" style={{ color: 'var(--d-warning)' }}>
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--d-text-muted)' }}>"{r.body}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
