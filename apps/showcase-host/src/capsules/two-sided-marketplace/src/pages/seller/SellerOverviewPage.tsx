import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, MessageCircle, Star, ArrowRight } from 'lucide-react';
import { listings } from '@/data/mock';

export function SellerOverviewPage() {
  const myListings = listings.slice(0, 4);
  return (
    <div style={{ maxWidth: 1100 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Host dashboard</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Welcome back, Jordan</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>Here's how your listings are performing this month.</p>
      </header>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Kpi label="Earnings" value="$8,412" delta="+14.2%" />
        <Kpi label="Bookings" value="23" delta="+3" />
        <Kpi label="Occupancy" value="78%" delta="+6%" />
        <Kpi label="Rating" value="4.91" delta="+0.04" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Recent activity */}
        <div className="nm-card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent activity</h2>
            <Link to="/seller/analytics" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}>
              Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {[
              { icon: Calendar, color: 'var(--d-success)', text: 'New booking: Cedar A-Frame · Apr 18–22', time: '2h ago' },
              { icon: MessageCircle, color: 'var(--d-primary)', text: 'Message from Elena about Tahoe cabin', time: '5h ago' },
              { icon: Star, color: 'var(--d-warning)', text: '5-star review: "Exactly as pictured"', time: '1d ago' },
              { icon: TrendingUp, color: 'var(--d-accent)', text: 'Paris Studio views up 32% this week', time: '2d ago' },
              { icon: Calendar, color: 'var(--d-success)', text: 'New booking: Brooklyn Loft · May 3–7', time: '3d ago' },
            ].map((a, i) => (
              <div key={i} style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: i < 4 ? '1px solid var(--d-border)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--d-radius)', background: `color-mix(in srgb, ${a.color} 12%, transparent)`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={15} />
                </div>
                <div style={{ flex: 1, fontSize: '0.85rem' }}>{a.text}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My listings quick view */}
        <div className="nm-card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Your listings</h2>
            <Link to="/seller/listings" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}>
              All <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {myListings.map(l => (
              <Link key={l.id} to={`/seller/listings/${l.id}/edit`} style={{ display: 'flex', gap: '0.625rem', padding: '0.5rem', borderRadius: 'var(--d-radius-sm)', textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-sm)', overflow: 'hidden', background: 'var(--d-surface-raised)', flexShrink: 0 }}>
                  <img src={l.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>${l.price} · {l.rating} ★</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, down }: { label: string; value: string; delta: string; down?: boolean }) {
  return (
    <div className="nm-kpi">
      <span className="nm-kpi-label">{label}</span>
      <span className="nm-kpi-value">{value}</span>
      <span className="nm-kpi-delta" data-down={down ? '' : undefined}>{delta} vs last month</span>
    </div>
  );
}
