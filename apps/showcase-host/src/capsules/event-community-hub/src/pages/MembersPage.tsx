import { css } from '@decantr/css';
import { MapPin, Calendar, UserPlus } from 'lucide-react';
import { attendees, organizers } from '../data/mock';

export function MembersPage() {
  const all = [
    ...organizers.map((o) => ({ id: o.id, name: o.name, handle: o.handle, avatar: o.avatar, location: 'Organizer', going: o.eventsHosted, isOrganizer: true })),
    ...attendees.map((a) => ({ ...a, isOrganizer: false })),
  ];

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <header className={css('_flex _col _gap2')} style={{ marginBottom: '2rem' }}>
        <span className="display-label">The Crew</span>
        <h1 className="display-heading section-title" style={{ fontSize: '2.25rem' }}>Meet the community</h1>
        <p style={{ color: 'var(--d-text-muted)' }}>{all.length} active members · find your people</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {all.map((m) => (
          <div key={m.id} className="member-card">
            <img src={m.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.875rem', border: '2px solid var(--d-primary)' }} />
            <div className="display-heading" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{m.name}</div>
            <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>{m.handle}</div>
            {m.isOrganizer ? (
              <span className="cat-chip" data-tone="accent" style={{ marginBottom: '0.75rem' }}>Organizer</span>
            ) : (
              <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                <MapPin size={12} /> {m.location}
              </div>
            )}
            <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {m.going} {m.isOrganizer ? 'hosted' : 'attended'}
            </div>
            <button className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem' }}>
              <UserPlus size={13} /> Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
