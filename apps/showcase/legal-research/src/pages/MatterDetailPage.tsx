import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { matters, activities, timelineEvents, type Activity } from '../data/mock';
import { MatterCard } from '../components/MatterCard';

const ACTIVITY_ICONS: Record<Activity['type'], React.ElementType> = {
  note: MessageSquare,
  document: FileText,
  billing: DollarSign,
  status: AlertCircle,
  deadline: Calendar,
};

const TIMELINE_COLORS: Record<string, string> = {
  filing: 'var(--d-primary)',
  hearing: 'var(--d-warning)',
  deadline: 'var(--d-error)',
  milestone: 'var(--d-success)',
};

export function MatterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const matter = matters.find((m) => m.id === id);

  if (!matter) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-text-muted)' }}>
        <p style={{ fontFamily: 'Georgia, serif' }}>Matter not found.</p>
        <Link to="/matters" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Back to matters</Link>
      </div>
    );
  }

  return (
    <div className={css('_flex _col _gap4')}>
      <Link to="/matters" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>
        <ArrowLeft size={14} /> Back to matters
      </Link>

      <MatterCard matter={matter} />

      {/* Activity Feed */}
      <div>
        <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Recent Activity
        </p>
        <div className={css('_flex _col')}>
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            return (
              <div key={activity.id} className={css('_flex _gap3')} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--d-radius-full)', background: 'color-mix(in srgb, var(--d-primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} style={{ color: 'var(--d-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className={css('_flex _aic _jcsb')}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{activity.author}</span>
                    <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif', marginTop: '0.125rem' }}>
                    {activity.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Case Timeline
        </p>
        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '0.4375rem', top: 0, bottom: 0, width: 2, background: 'var(--d-border)' }} />
          {timelineEvents.map((event) => (
            <div key={event.id} className={css('_flex _gap3')} style={{ position: 'relative', paddingBottom: '1.25rem' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: '-1.1875rem',
                top: '0.25rem',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: TIMELINE_COLORS[event.type] || 'var(--d-border)',
                border: '2px solid var(--d-bg)',
              }} />
              <div style={{ flex: 1 }}>
                <div className={css('_flex _aic _jcsb')}>
                  <span className="counsel-header" style={{ fontSize: '0.875rem' }}>{event.title}</span>
                  <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{event.date}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif', marginTop: '0.125rem' }}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
