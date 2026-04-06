import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, MapPin, Clock, User, CheckCircle } from 'lucide-react';
import { serviceRequests } from '@/data/mock';

export function RequestDetailPage() {
  const { id } = useParams();
  const request = serviceRequests.find(r => r.id === id) || serviceRequests[0];

  const priorityStatus: Record<string, string> = {
    urgent: 'error', high: 'warning', medium: 'info', low: 'info',
  };
  const statusAnnotation: Record<string, string> = {
    new: 'info', assigned: 'warning', 'in-progress': 'info', resolved: 'success',
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 800 }}>
      <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Requests
      </Link>

      {/* Header */}
      <div>
        <div className={css('_flex _gap2 _aic _mb2')}>
          <span style={{ fontFamily: 'var(--d-font-mono, monospace)', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{request.id}</span>
          <span className="d-annotation" data-status={statusAnnotation[request.status]}>{request.status}</span>
          <span className="d-annotation" data-status={priorityStatus[request.priority]}>{request.priority}</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{request.title}</h1>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1rem', color: 'var(--d-text-muted)' }}>
          {request.description}
        </p>
      </div>

      {/* Info cards */}
      <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="d-surface gov-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>Location</div>
          <div className={css('_flex _aic _gap2')} style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
            <MapPin size={16} style={{ color: 'var(--d-primary)' }} />
            {request.location}
          </div>
        </div>
        <div className="d-surface gov-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>Reporter</div>
          <div className={css('_flex _aic _gap2')} style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
            <User size={16} style={{ color: 'var(--d-primary)' }} />
            {request.reporter}
          </div>
        </div>
        <div className="d-surface gov-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>Assigned To</div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
            {request.assignee || 'Unassigned'}
          </div>
        </div>
        <div className="d-surface gov-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>Category</div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{request.category}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          STATUS TIMELINE
        </div>
        <div className={css('_flex _col')} style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{
            position: 'absolute', left: 11, top: 0, bottom: 0, width: 2,
            background: 'var(--d-border)',
          }} />
          {request.timeline.map((event, i) => {
            const isLast = i === request.timeline.length - 1;
            return (
              <div
                key={event.id}
                className={css('_flex _gap3')}
                style={{
                  padding: '0.75rem 0',
                  position: 'relative',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  position: 'absolute', left: '-2rem', top: '1rem',
                  width: 22, height: 22, borderRadius: '50%',
                  background: isLast ? 'var(--d-primary)' : 'var(--d-bg)',
                  border: isLast ? 'none' : '2px solid var(--d-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {isLast ? <CheckCircle size={12} color="#fff" /> : <Clock size={10} style={{ color: 'var(--d-text-muted)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{event.action}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    {event.actor} &middot; {event.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
