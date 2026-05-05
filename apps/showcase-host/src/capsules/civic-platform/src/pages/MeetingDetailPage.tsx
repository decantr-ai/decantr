import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, Calendar, MapPin, Clock, Users, MessageSquare, Vote, Presentation, ThumbsUp, ThumbsDown } from 'lucide-react';
import { meetings } from '@/data/mock';

const typeIcons: Record<string, typeof Vote> = {
  presentation: Presentation,
  discussion: Users,
  vote: Vote,
  'public-comment': MessageSquare,
};

const typeColors: Record<string, string> = {
  presentation: 'var(--d-primary)',
  discussion: 'var(--d-secondary)',
  vote: 'var(--d-accent)',
  'public-comment': 'var(--d-success)',
};

export function MeetingDetailPage() {
  const { id } = useParams();
  const meeting = meetings.find(m => m.id === id) || meetings[0];

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <Link to="/meetings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Meetings
      </Link>

      {/* Header */}
      <div>
        <div className={css('_flex _gap2 _aic _mb2')}>
          <span className="d-annotation" data-status={meeting.status === 'upcoming' ? 'info' : meeting.status === 'completed' ? 'success' : 'error'}>
            {meeting.status}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{meeting.body}</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{meeting.title}</h1>
        <div className={css('_flex _gap4 _wrap')} style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          <span className={css('_flex _aic _gap1')}><Calendar size={16} /> {meeting.date}</span>
          <span className={css('_flex _aic _gap1')}><Clock size={16} /> {meeting.time}</span>
          <span className={css('_flex _aic _gap1')}><MapPin size={16} /> {meeting.location}</span>
        </div>
      </div>

      {/* Agenda Timeline */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          AGENDA
        </div>
        <div className={css('_flex _col')} style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 11, top: 0, bottom: 0, width: 2,
            background: 'var(--d-border)',
          }} />
          {meeting.agendaItems.map((item, i) => {
            const Icon = typeIcons[item.type] || Users;
            return (
              <div
                key={item.id}
                className={css('_flex _gap3')}
                style={{
                  padding: '1rem 0',
                  position: 'relative',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  position: 'absolute', left: '-2rem', top: '1.25rem',
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--d-bg)',
                  border: `2px solid ${typeColors[item.type] || 'var(--d-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  <Icon size={10} style={{ color: typeColors[item.type] || 'var(--d-text-muted)' }} />
                </div>
                <div className="d-surface gov-card" style={{ flex: 1, padding: '1rem' }}>
                  <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{item.time}</span>
                  </div>
                  <div className={css('_flex _gap2 _aic')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    <span className="gov-badge" style={{
                      background: `color-mix(in srgb, ${typeColors[item.type]} 10%, transparent)`,
                      color: typeColors[item.type],
                      fontSize: '0.6875rem',
                      padding: '0.0625rem 0.375rem',
                    }}>{item.type}</span>
                    <span>Speaker: {item.speaker}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting Votes */}
      {meeting.votes.length > 0 && (
        <div className="d-section" data-density="compact">
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
            VOTE RESULTS
          </div>
          <div className={css('_flex _col _gap3')}>
            {meeting.votes.map((v, i) => (
              <div
                key={v.id}
                className="d-surface gov-card"
                style={{
                  padding: '1.25rem',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className={css('_flex _jcsb _aic _mb3')}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{v.item}</span>
                  <span className="d-annotation" data-status={v.result === 'passed' ? 'success' : v.result === 'failed' ? 'error' : 'warning'}>
                    {v.result}
                  </span>
                </div>
                <div className={css('_flex _gap6')}>
                  <div className={css('_flex _aic _gap2')}>
                    <ThumbsUp size={16} style={{ color: 'var(--d-success)' }} />
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{v.yea}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Yea</span>
                  </div>
                  <div className={css('_flex _aic _gap2')}>
                    <ThumbsDown size={16} style={{ color: 'var(--d-error)' }} />
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{v.nay}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Nay</span>
                  </div>
                  {v.abstain > 0 && (
                    <div className={css('_flex _aic _gap2')}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--d-text-muted)' }}>{v.abstain}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Abstain</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
