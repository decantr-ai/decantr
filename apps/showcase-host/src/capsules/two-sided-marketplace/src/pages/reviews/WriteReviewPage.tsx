import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Camera } from 'lucide-react';
import { getListing } from '@/data/mock';

export function WriteReviewPage() {
  const listing = getListing('l02');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const navigate = useNavigate();
  if (!listing) return null;

  return (
    <div style={{ maxWidth: 680 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Write a review</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>How was your stay?</h1>
      </header>

      {/* Stay context */}
      <div className="nm-card" style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', padding: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 'var(--d-radius)', overflow: 'hidden', flexShrink: 0 }}>
          <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{listing.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>Mar 2 – Mar 5, 2026 · {listing.location}</div>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); navigate('/bookings'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Rating */}
        <section className="nm-card">
          <div className="d-label" style={{ marginBottom: '0.75rem' }}>Overall rating</div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: (hover || rating) >= n ? 'var(--d-warning)' : 'var(--d-border)' }}
                aria-label={`${n} stars`}
              >
                <Star size={30} fill="currentColor" />
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '0.5rem' }}>
            {['', 'Terrible', 'Poor', 'Okay', 'Great', 'Exceptional'][hover || rating]}
          </div>
        </section>

        {/* Written review */}
        <section className="nm-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Tell us more</div>
          <textarea
            className="nm-input"
            rows={6}
            placeholder="What did you love? What could have been better? Your honest review helps other travelers."
            value={body}
            onChange={e => setBody(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{body.length} / 500 characters</div>
        </section>

        {/* Photos */}
        <section className="nm-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Add photos <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[1, 2, 3, 4].map(i => (
              <button
                key={i}
                type="button"
                style={{ aspectRatio: '1', border: '1px dashed var(--d-border)', borderRadius: 'var(--d-radius)', background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--d-text-muted)', cursor: 'pointer' }}
              >
                <Camera size={20} />
              </button>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/bookings')}>Cancel</button>
          <button type="submit" className="nm-button-primary" disabled={!body.trim()}>Post review</button>
        </div>
      </form>
    </div>
  );
}
