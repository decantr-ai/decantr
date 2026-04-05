import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { MapPin, Users } from 'lucide-react';
import type { Event } from '../data/mock';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function EventCard({ event }: { event: Event }) {
  const d = new Date(event.date);
  const spotsLeft = event.capacity - event.attendees;
  const almostFull = spotsLeft < event.capacity * 0.15;

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="event-card">
        <div className="event-photo-wrap">
          <img src={event.image} alt={event.title} className="event-photo" loading="lazy" />
          <div className="date-badge">
            <span className="date-badge-month">{MONTHS[d.getUTCMonth()]}</span>
            <span className="date-badge-day">{d.getUTCDate()}</span>
          </div>
          {almostFull && (
            <span className="cat-chip" data-tone="accent"
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 3 }}>
              Almost full
            </span>
          )}
        </div>
        <div style={{ padding: '1rem 1.125rem 1.125rem' }}>
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
            <span className="cat-chip" data-tone="soft">{event.category}</span>
          </div>
          <h3 className="display-heading" style={{ fontSize: '1.0625rem', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
            {event.title}
          </h3>
          <div className={css('_flex _col _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            <div className={css('_flex _aic _gap1')}>
              <MapPin size={12} /> {event.venue} · {event.city}
            </div>
            <div className={css('_flex _aic _gap1')}>
              <Users size={12} /> {event.attendees.toLocaleString()} going
            </div>
          </div>
          <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--d-border)' }}>
            <span className="display-heading gradient-pink-violet" style={{ fontSize: '1rem' }}>
              {event.priceFrom === 0 ? 'Free' : `$${event.priceFrom}+`}
            </span>
            <span className={css('_textsm _fontmedium')} style={{ color: 'var(--d-primary)', fontFamily: 'system-ui, sans-serif' }}>
              RSVP →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
