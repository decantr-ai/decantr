import { Link, useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { MapPin, Calendar, Users, Clock, Share2, Heart } from 'lucide-react';
import { events, organizers, attendees } from '../data/mock';
import { EventCard } from '../components/EventCard';

export function EventDetailPage() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id) || events[0];
  const organizer = organizers.find((o) => o.id === event.organizerId) || organizers[0];
  const related = events.filter((e) => e.id !== event.id && e.category === event.category).slice(0, 3);

  const d = new Date(event.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const schedule = [
    { time: '6:00 PM', title: 'Doors open', description: 'Early arrivals get priority entry' },
    { time: '7:30 PM', title: 'Opening set', description: 'Warm-up DJs set the vibe' },
    { time: '10:00 PM', title: 'Headliner', description: 'Main act takes the stage' },
    { time: '2:00 AM', title: 'Afterparty', description: 'Continues at the second stage' },
  ];

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 'var(--d-radius-xl)', overflow: 'hidden', marginBottom: '2rem',
        boxShadow: '0 30px 80px -20px rgba(255, 0, 229, 0.4)' }}>
        <div className="event-photo-wrap" style={{ aspectRatio: '16/7' }}>
          <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', zIndex: 2 }}>
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
            <span className="cat-chip" data-tone="primary">{event.category}</span>
            {event.tags.slice(0, 2).map((t) => (
              <span key={t} className="cat-chip" data-tone="soft">#{t}</span>
            ))}
          </div>
          <h1 className="display-heading" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: '0.5rem' }}>{event.title}</h1>
          <div className={css('_flex _aic _gap4')} style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', flexWrap: 'wrap' }}>
            <span className={css('_flex _aic _gap1')}><Calendar size={14} /> {dateStr}</span>
            <span className={css('_flex _aic _gap1')}><Clock size={14} /> {timeStr}</span>
            <span className={css('_flex _aic _gap1')}><MapPin size={14} /> {event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }} className="detail-grid">
        <div className={css('_flex _col _gap6')}>
          {/* About */}
          <section>
            <h2 className="display-heading section-title" style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>About this event</h2>
            <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>{event.description}</p>
          </section>

          {/* Schedule */}
          <section>
            <h2 className="display-heading section-title" style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>Schedule</h2>
            <div className={css('_flex _col _gap3')}>
              {schedule.map((s, i) => (
                <div key={i} className={css('_flex _gap4')} style={{ padding: '0.875rem 1rem', background: 'var(--d-surface)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)' }}>
                  <div style={{ minWidth: 80 }}>
                    <div className="display-heading gradient-pink-violet" style={{ fontSize: '0.9375rem' }}>{s.time}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={css('_fontmedium')}>{s.title}</div>
                    <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attendees */}
          <section>
            <h2 className="display-heading section-title" style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>
              {event.attendees.toLocaleString()} going
            </h2>
            <div className="feature-tile">
              <div className="avatar-stack" style={{ marginBottom: '0.875rem' }}>
                {attendees.slice(0, 8).map((a) => (
                  <img key={a.id} src={a.avatar} alt={a.name} />
                ))}
              </div>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Luna, Theo, Sage, Nadia, and {event.attendees - 4} others are going.
              </p>
            </div>
          </section>

          {/* Related */}
          <section>
            <h2 className="display-heading section-title" style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>You might also like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {related.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        </div>

        {/* Sticky RSVP */}
        <aside style={{ position: 'sticky', top: '5rem', alignSelf: 'start' }}>
          <div className="feature-tile" data-glow="true">
            <div className={css('_flex _col _gap1')} style={{ marginBottom: '1rem' }}>
              <span className="display-label">From</span>
              <div className="display-heading gradient-pink-violet" style={{ fontSize: '2rem' }}>
                {event.priceFrom === 0 ? 'Free' : `$${event.priceFrom}`}
              </div>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                {event.capacity - event.attendees} spots left · {Math.round((event.attendees / event.capacity) * 100)}% full
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: 3, overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ width: `${(event.attendees / event.capacity) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--d-primary), var(--d-accent))' }} />
            </div>
            <Link to="/tickets" className="d-interactive cta-glossy" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', textDecoration: 'none' }}>
              Get Tickets →
            </Link>
            <div className={css('_flex _gap2')} style={{ marginTop: '0.625rem' }}>
              <button className="d-interactive" data-variant="ghost" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>
                <Heart size={15} /> Save
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>

          {/* Organizer */}
          <div className="feature-tile" style={{ marginTop: '1rem' }}>
            <div className="display-label" style={{ marginBottom: '0.75rem' }}>Hosted by</div>
            <div className={css('_flex _aic _gap3')}>
              <img src={organizer.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className={css('_fontmedium')}>{organizer.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <Users size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {organizer.followers.toLocaleString()} followers
                </div>
              </div>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>{organizer.bio}</p>
          </div>
        </aside>
      </div>

      <style>{`@media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
