import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { bookings, getListing } from '@/data/mock';

export function BookingsPage() {
  const upcoming = bookings.filter(b => b.status === 'upcoming');
  const past = bookings.filter(b => b.status !== 'upcoming');

  return (
    <div style={{ maxWidth: 900 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Your trips</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Bookings</h1>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyTrips />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Past trips</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {past.map(b => <BookingRow key={b.id} booking={b} />)}
        </div>
      </section>
    </div>
  );
}

function BookingRow({ booking }: { booking: typeof bookings[number] }) {
  const listing = getListing(booking.listingId);
  if (!listing) return null;
  return (
    <Link to={`/listings/${listing.id}`} className="nm-card" style={{ display: 'flex', gap: '1rem', padding: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ width: 120, aspectRatio: '4/3', borderRadius: 'var(--d-radius)', overflow: 'hidden', flexShrink: 0, background: 'var(--d-surface-raised)' }}>
        <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{listing.title}</span>
          <StatusPill status={booking.status} />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {listing.location}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {booking.checkIn} → {booking.checkOut}</span>
          <span>· {booking.guests} guests</span>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 'auto' }}>${booking.total} total</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--d-text-muted)' }}>
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'upcoming' ? 'accent' : status === 'completed' ? 'success' : status === 'cancelled' ? 'warning' : 'muted';
  return <span className="nm-badge" data-tone={tone}>{status}</span>;
}

function EmptyTrips() {
  return (
    <div className="nm-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
      <Calendar size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--d-text-muted)', opacity: 0.6 }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No upcoming trips</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Find your next stay and it'll show up here.</p>
      <Link to="/browse" className="nm-button-primary">Browse stays</Link>
    </div>
  );
}
