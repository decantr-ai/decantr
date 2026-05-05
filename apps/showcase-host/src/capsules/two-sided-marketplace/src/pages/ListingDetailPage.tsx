import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, Share2, Wifi, Flame, Zap, ShieldCheck, MessageCircle } from 'lucide-react';
import { getListing, getSeller, getListingReviews } from '@/data/mock';

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = id ? getListing(id) : undefined;
  if (!listing) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Listing not found</h2>
        <Link to="/browse" className="nm-button-primary" style={{ marginTop: '1rem' }}>Back to browse</Link>
      </div>
    );
  }
  const seller = getSeller(listing.sellerId);
  const listingReviews = getListingReviews(listing.id);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600, marginBottom: '0.5rem' }}>{listing.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
          <span className="nm-stars" style={{ color: 'var(--d-text)' }}>
            <Star size={14} fill="currentColor" style={{ color: 'var(--d-warning)' }} /> {listing.rating} · {listing.reviews} reviews
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={13} /> {listing.location}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}><Share2 size={14} /> Share</button>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}><Heart size={14} /> Save</button>
          </div>
        </div>
      </header>

      {/* Image gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '220px 220px', gap: '0.5rem', marginBottom: '2rem', borderRadius: 'var(--d-radius-lg)', overflow: 'hidden' }}>
        <div style={{ gridRow: '1 / 3', background: 'var(--d-surface-raised)' }}>
          <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'var(--d-surface-raised)' }}>
            <img src={listing.images[i % listing.images.length]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Content + Booking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Host */}
          {seller && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--d-border)' }}>
              <div className="nm-avatar" style={{ width: 52, height: 52, fontSize: '1rem' }}>{seller.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Hosted by {seller.name}
                  {seller.superhost && <span className="nm-badge" data-tone="accent"><ShieldCheck size={10} /> Superhost</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                  Hosting since {seller.memberSince} · {seller.responseRate}% response rate
                </div>
              </div>
              <button className="d-interactive" style={{ fontSize: '0.8rem' }}>
                <MessageCircle size={14} /> Contact
              </button>
            </div>
          )}

          {/* Description */}
          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>About this place</h2>
            <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>{listing.description}</p>
          </section>

          {/* Amenities */}
          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>What's here</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {listing.amenities.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                  {a.toLowerCase().includes('wifi') ? <Wifi size={15} /> : a.toLowerCase().includes('fire') || a.toLowerCase().includes('stove') ? <Flame size={15} /> : <Zap size={15} />}
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          {listingReviews.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={16} fill="currentColor" style={{ color: 'var(--d-warning)' }} />
                {listing.rating} · {listing.reviews} reviews
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {listingReviews.slice(0, 4).map(r => (
                  <div key={r.id} className="nm-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                      <div className="nm-avatar" style={{ width: 34, height: 34, fontSize: '0.72rem' }}>{r.buyerAvatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.buyerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{r.date}</div>
                      </div>
                    </div>
                    <div className="nm-stars" style={{ marginBottom: '0.5rem', color: 'var(--d-warning)' }}>
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--d-text-muted)' }}>"{r.body}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking card */}
        <aside style={{ position: 'sticky', top: '5rem', alignSelf: 'start' }}>
          <div className="nm-card" style={{ padding: '1.5rem', boxShadow: 'var(--d-shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${listing.price}</span>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>/ {listing.priceUnit}</span>
              {listing.instantBook && <span className="nm-badge" data-tone="accent" style={{ marginLeft: 'auto' }}><Zap size={10} /> Instant</span>}
            </div>
            <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--d-border)' }}>
                <DateCell label="Check-in" value="Apr 18" />
                <DateCell label="Check-out" value="Apr 22" border />
              </div>
              <DateCell label="Guests" value="2 guests" />
            </div>
            <button className="nm-button-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginBottom: '0.75rem' }} onClick={() => navigate('/bookings')}>
              {listing.instantBook ? 'Reserve' : 'Request to book'}
            </button>
            <div style={{ fontSize: '0.78rem', textAlign: 'center', color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>
              You won't be charged yet
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', paddingTop: '0.875rem', borderTop: '1px solid var(--d-border)' }}>
              <Row label={`$${listing.price} × 4 nights`} value={`$${listing.price * 4}`} />
              <Row label="Cleaning fee" value="$45" />
              <Row label="Service fee" value="$28" muted />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--d-border)' }}>
                <span>Total</span>
                <span>${listing.price * 4 + 45 + 28}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DateCell({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div style={{ padding: '0.625rem 0.875rem', borderLeft: border ? '1px solid var(--d-border)' : 'none' }}>
      <div className="d-label" style={{ fontSize: '0.65rem' }}>{label}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: muted ? 'var(--d-text-muted)' : 'inherit' }}>
      <span style={{ textDecoration: 'underline' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
