import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { meetings } from '@/data/mock';

export function MeetingDetailPage() {
  const { id } = useParams();
  const meeting = meetings.find(m => m.id === id) ?? meetings[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Link to="/meetings" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <ArrowLeft size={14} /> Back to meetings
      </Link>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <StatusBadge status={meeting.status} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>{meeting.title}</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={13} /> {meeting.time} · {meeting.duration} min</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Users size={13} /> {meeting.attendees.join(', ')}</span>
        </div>
      </div>

      {meeting.aiRecap && (
        <div className="glass-panel" style={{
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(96, 165, 250, 0.04))',
          border: '1px solid rgba(167, 139, 250, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
            <SectionLabel>AI Meeting Recap</SectionLabel>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{meeting.aiRecap}</p>
        </div>
      )}

      {meeting.actionItems && meeting.actionItems.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
            <SectionLabel>Action Items · AI Extracted</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {meeting.actionItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--d-radius-sm)',
              }}>
                <CheckCircle2 size={15} style={{ color: 'var(--d-accent)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.85rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {meeting.transcript && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Transcript</SectionLabel>
          <div style={{
            fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--d-text-muted)',
            fontFamily: 'var(--d-font-mono)',
            padding: '0.875rem', background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--d-radius-sm)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            {meeting.transcript}
          </div>
        </div>
      )}
    </div>
  );
}
