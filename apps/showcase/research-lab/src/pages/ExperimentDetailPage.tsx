import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Target, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { experiments } from '../data/mock';

const statusIcon: Record<string, typeof CheckCircle2> = {
  planned: Circle,
  'in-progress': Target,
  completed: CheckCircle2,
  failed: AlertCircle,
};

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exp = experiments.find((e) => e.id === id) || experiments[0];
  const StatusIcon = statusIcon[exp.status] || Circle;

  const timelineEvents = [
    { date: exp.startDate, label: 'Experiment started', type: 'start' as const },
    { date: exp.startDate, label: 'Protocol assigned: ' + exp.protocols[0], type: 'protocol' as const },
    ...(exp.progress > 30 ? [{ date: '2026-03-25', label: 'First data collected', type: 'data' as const }] : []),
    ...(exp.progress > 60 ? [{ date: '2026-04-01', label: 'Midpoint review completed', type: 'review' as const }] : []),
    ...(exp.endDate ? [{ date: exp.endDate, label: 'Experiment concluded', type: 'end' as const }] : []),
  ];

  return (
    <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
      <Link to="/experiments" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Experiments
      </Link>

      {/* Header */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.75rem' }}>
          <StatusIcon size={20} style={{ color: 'var(--d-primary)' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 500, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{exp.title}</h1>
            <div className={css('_flex _aic _gap3')} style={{ marginTop: '0.25rem' }}>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}><User size={13} /> {exp.pi}</span>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}><Clock size={13} /> {exp.startDate}</span>
              <span className="lab-barcode">{exp.id.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{exp.description}</p>

        {/* Progress */}
        <div style={{ marginTop: '1rem' }}>
          <div className={css('_flex _jcsb')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem' }}>
            <span>Overall Progress</span>
            <span className="lab-reading">{exp.progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${exp.progress}%`, height: '100%', background: 'var(--d-primary)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Protocols */}
        <div className="lab-panel" style={{ padding: '1rem' }}>
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Protocols</h2>
          <div className={css('_flex _col _gap2')}>
            {exp.protocols.map((p, i) => (
              <div key={p} className="lab-protocol" data-step={i + 1} style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="lab-panel" style={{ padding: '1rem' }}>
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Details</h2>
          <div className={css('_flex _col _gap3')}>
            <div>
              <span className="d-label">Status</span>
              <p style={{ fontSize: '0.875rem', textTransform: 'capitalize', marginTop: '0.125rem' }}>{exp.status}</p>
            </div>
            <div>
              <span className="d-label">Start Date</span>
              <p className="lab-reading" style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>{exp.startDate}</p>
            </div>
            {exp.endDate && (
              <div>
                <span className="d-label">End Date</span>
                <p className="lab-reading" style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>{exp.endDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="lab-panel" style={{ padding: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Timeline</h2>
        <div className={css('_flex _col')}>
          {timelineEvents.map((evt, i) => (
            <div
              key={i}
              className="lab-protocol"
              data-step={i + 1}
              style={{ marginBottom: i < timelineEvents.length - 1 ? '0.75rem' : 0 }}
            >
              <div className={css('_flex _aic _jcsb')}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{evt.label}</span>
                <span className="lab-reading" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{evt.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
