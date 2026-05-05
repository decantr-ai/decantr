import { Link } from 'react-router-dom';
import { Clock, Users, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { meetings } from '@/data/mock';

export function MeetingsPage() {
  const upcoming = meetings.filter(m => m.status === 'scheduled');
  const past = meetings.filter(m => m.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Meetings"
        description={`${upcoming.length} upcoming · ${past.length} completed · AI recaps on completion`}
        actions={
          <button className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Schedule
          </button>
        }
      />

      {/* Upcoming */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Upcoming ({upcoming.length})</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {upcoming.map(m => (
            <Link key={m.id} to={`/meetings/${m.id}`} className="glass-card" style={{ padding: '1.125rem', textDecoration: 'none', color: 'var(--d-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.title}</h3>
                <StatusBadge status={m.status} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <Clock size={12} /> {m.time} · {m.duration} min
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Users size={12} /> {m.attendees.join(', ')}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Completed */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Completed</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {past.map(m => (
            <Link key={m.id} to={`/meetings/${m.id}`} className="glass-card" style={{ padding: '1.125rem', textDecoration: 'none', color: 'var(--d-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.title}</h3>
                <StatusBadge status={m.status} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <Clock size={12} /> {m.time} · {m.duration} min
              </div>
              {m.aiRecap && (
                <div style={{
                  padding: '0.5rem 0.625rem', marginTop: '0.5rem',
                  background: 'rgba(167, 139, 250, 0.05)',
                  border: '1px solid rgba(167, 139, 250, 0.15)',
                  borderRadius: 'var(--d-radius-sm)',
                  fontSize: '0.72rem', lineHeight: 1.5,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--d-accent)', fontWeight: 600, marginBottom: '0.125rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Sparkles size={9} /> AI Recap
                  </div>
                  <span style={{ color: 'var(--d-text-muted)' }}>{m.aiRecap}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
