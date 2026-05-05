import { Link } from 'react-router-dom';
import { Star, Heart, Zap } from 'lucide-react';
import type { Listing } from '@/data/mock';

export function ListingCard({ listing, compact }: { listing: Listing; compact?: boolean }) {
  return (
    <Link to={`/listings/${listing.id}`} className="nm-listing-card">
      <div className="nm-listing-image">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        {listing.instantBook && (
          <span className="nm-badge" data-tone="accent" style={{ position: 'absolute', top: 10, left: 10 }}>
            <Zap size={10} /> Instant
          </span>
        )}
        <button
          className="d-interactive"
          data-variant="ghost"
          aria-label="Save"
          onClick={e => { e.preventDefault(); }}
          style={{ position: 'absolute', top: 8, right: 8, padding: '0.4rem', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '9999px' }}
        >
          <Heart size={14} />
        </button>
      </div>
      <div style={{ padding: compact ? '0.75rem 0.875rem' : '1rem 1.125rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </div>
          <div className="nm-stars" style={{ fontSize: '0.78rem', color: 'var(--d-text)', flexShrink: 0 }}>
            <Star size={12} fill="currentColor" /> {listing.rating}
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{listing.location}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span className="nm-price" style={{ fontSize: '0.95rem' }}>
            ${listing.price} <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>/ {listing.priceUnit}</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{listing.reviews} reviews</span>
        </div>
      </div>
    </Link>
  );
}
