import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Calendar, MapPin, Clock, ChevronRight, Search } from 'lucide-react';
import { meetings, meetingBodies } from '@/data/mock';

export function MeetingsPage() {
  const [body, setBody] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = meetings.filter(m => {
    if (body !== 'All' && m.body !== body) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    upcoming: 'info',
    completed: 'success',
    cancelled: 'error',
  };

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Meeting Archive</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Browse council and committee meetings</p>
      </div>

      {/* Filters */}
      <div className={css('_flex _wrap _gap3 _aic')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input
            type="text"
            className="d-control gov-input"
            placeholder="Search meetings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div className={css('_flex _gap1 _wrap')}>
          {meetingBodies.map(b => (
            <button
              key={b}
              className="d-interactive"
              data-variant={body === b ? 'primary' : 'ghost'}
              onClick={() => setBody(b)}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar placeholder */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          UPCOMING THIS MONTH
        </div>
        <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--d-text-muted)', padding: '0.375rem' }}>
              {d}
            </div>
          ))}
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const hasMeeting = meetings.some(m => parseInt(m.date.split('-')[2]) === day);
            return (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.8125rem',
                  padding: '0.5rem',
                  background: hasMeeting ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : 'transparent',
                  fontWeight: hasMeeting ? 700 : 400,
                  color: hasMeeting ? 'var(--d-primary)' : 'var(--d-text)',
                  borderRadius: 2,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting Table */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          ALL MEETINGS
        </div>
        <div className="d-surface gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((m, i) => (
            <Link
              key={m.id}
              to={`/meetings/${m.id}`}
              className="d-data-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--d-border)' : 'none',
                gap: '1rem',
                opacity: 0,
                animation: `decantr-entrance 0.3s ease forwards`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 2,
                background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Calendar size={16} style={{ color: 'var(--d-primary)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{m.title}</div>
                <div className={css('_flex _gap3 _wrap')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <span className={css('_flex _aic _gap1')}><Clock size={12} /> {m.date} at {m.time}</span>
                  <span className={css('_flex _aic _gap1')}><MapPin size={12} /> {m.location}</span>
                </div>
              </div>
              <span className="d-annotation" data-status={statusColors[m.status]}>
                {m.status}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
